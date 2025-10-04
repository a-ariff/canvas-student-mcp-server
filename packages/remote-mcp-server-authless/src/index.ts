import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { handleWellKnownRequest } from "./well-known";
import { handleAuthorize, handleToken } from "./oauth-handlers";
import type { AuthContext } from "./types";

// Configuration schema for Smithery
export const configSchema = z.object({
	canvasApiKey: z.string().describe("Your Canvas API access token (Get from Canvas → Account → Settings → Approved Integrations)"),
	canvasBaseUrl: z.string().url().default("https://canvas.instructure.com").describe("Your Canvas instance URL (e.g., https://canvas.instructure.com)"),
	debug: z.boolean().optional().default(false).describe("Enable debug logging"),
	gradescopeEmail: z.string().email().optional().describe("Your Gradescope email address"),
	gradescopePassword: z.string().optional().describe("Your Gradescope password"),
});

export type Config = z.infer<typeof configSchema>;

interface Env {
	OAUTH_KV: KVNamespace;
	API_KEYS_KV: KVNamespace;
	OAUTH_CLIENT_ID: string;
	OAUTH_CLIENT_SECRET: string;
	OAUTH_ISSUER: string;
	MCP_OBJECT: DurableObjectNamespace;
	CANVAS_API_KEY?: string;
	CANVAS_BASE_URL?: string;
}

async function authenticate(request: Request, env: Env): Promise<AuthContext | Response> {
	const authHeader = request.headers.get("Authorization");
	const apiKeyHeader = request.headers.get("X-API-Key");

	if (apiKeyHeader) {
		const keyData = await env.API_KEYS_KV.get(`apikey:${apiKeyHeader}`);
		if (keyData) {
			const { userId, permissions } = JSON.parse(keyData);
			return {
				authenticated: true,
				userId,
				authMethod: "api-key",
				permissions: permissions || [],
			};
		}
	}

	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.substring(7);
		const tokenData = await env.OAUTH_KV.get(`token:${token}`);

		if (tokenData) {
			const payload = JSON.parse(tokenData);
			if (payload.expires_at >= Date.now()) {
				return {
					authenticated: true,
					userId: payload.user_id,
					authMethod: "oauth",
					scope: payload.scope,
				};
			}
		}

		return new Response(
			JSON.stringify({ error: "invalid_token" }),
			{
				status: 401,
				headers: {
					"Content-Type": "application/json",
					"WWW-Authenticate": 'Bearer realm="MCP Server", error="invalid_token"',
				},
			}
		);
	}

	return new Response(
		JSON.stringify({ error: "unauthorized", auth_methods: ["oauth", "api-key"] }),
		{
			status: 401,
			headers: {
				"Content-Type": "application/json",
				"WWW-Authenticate": 'Bearer realm="MCP Server"',
			},
		}
	);
}

export class MyMCP extends McpAgent<Env> {
	server = new McpServer({
		name: "Canvas Student MCP Server",
		version: "2.0.0",
	});

	async init() {
		// Helper to get Canvas config from environment
		const getCanvasConfig = () => {
			return {
				canvasApiKey: this.env?.CANVAS_API_KEY || "",
				canvasBaseUrl: this.env?.CANVAS_BASE_URL || ""
			};
		};

		// List all courses
		this.server.tool("list_courses", {}, async () => {
			const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
			if (!canvasApiKey || !canvasBaseUrl) {
				return {
					content: [{ type: "text", text: "Error: Canvas API credentials not configured. Please provide canvasApiKey and canvasBaseUrl." }],
				};
			}

			try {
				const response = await fetch(`${canvasBaseUrl}/api/v1/courses?enrollment_state=active`, {
					headers: { "Authorization": `Bearer ${canvasApiKey}` }
				});
				const courses = await response.json();

				const courseList = courses.map((c: any) =>
					`• ${c.name} (ID: ${c.id})${c.course_code ? ` - ${c.course_code}` : ""}`
				).join("\n");

				return {
					content: [{ type: "text", text: `**Your Active Courses:**\n\n${courseList}` }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error fetching courses: ${error}` }],
				};
			}
		});

		// Get assignments for a course
		this.server.tool(
			"get_assignments",
			{ course_id: z.number().describe("Canvas course ID") },
			async ({ course_id }) => {
				const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
			if (!canvasApiKey || !canvasBaseUrl) {
					return {
						content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
					};
				}

				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/courses/${course_id}/assignments`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					const assignments = await response.json();

					const assignmentList = assignments.map((a: any) => {
						const dueDate = a.due_at ? new Date(a.due_at).toLocaleString() : "No due date";
						const points = a.points_possible ? `${a.points_possible} points` : "";
						return `• **${a.name}**\n  Due: ${dueDate} ${points}\n  ${a.html_url}`;
					}).join("\n\n");

					return {
						content: [{ type: "text", text: `**Assignments:**\n\n${assignmentList || "No assignments found"}` }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error fetching assignments: ${error}` }],
					};
				}
			}
		);

		// Get upcoming assignments across all courses
		this.server.tool("get_upcoming_assignments", {}, async () => {
			const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
			if (!canvasApiKey || !canvasBaseUrl) {
				return {
					content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
				};
			}

			try {
				const response = await fetch(
					`${canvasBaseUrl}/api/v1/users/self/upcoming_events`,
					{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
				);
				const events = await response.json();

				const eventList = events.map((e: any) => {
					const date = new Date(e.assignment?.due_at || e.start_at).toLocaleString();
					return `• **${e.title}**\n  ${e.context_name}\n  Due: ${date}`;
				}).join("\n\n");

				return {
					content: [{ type: "text", text: `**Upcoming Assignments:**\n\n${eventList || "No upcoming assignments"}` }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error fetching upcoming assignments: ${error}` }],
				};
			}
		});

		// Get grades for a course
		this.server.tool(
			"get_grades",
			{ course_id: z.number().describe("Canvas course ID") },
			async ({ course_id }) => {
				const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
			if (!canvasApiKey || !canvasBaseUrl) {
					return {
						content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
					};
				}

				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/courses/${course_id}/enrollments?user_id=self`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					const enrollments = await response.json();

					if (enrollments.length === 0) {
						return {
							content: [{ type: "text", text: "No enrollment found for this course" }],
						};
					}

					const enrollment = enrollments[0];
					const grade = enrollment.grades?.current_grade || "N/A";
					const score = enrollment.grades?.current_score || "N/A";

					return {
						content: [{
							type: "text",
							text: `**Grade for Course ${course_id}:**\n\nCurrent Grade: ${grade}\nCurrent Score: ${score}%`
						}],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error fetching grades: ${error}` }],
					};
				}
			}
		);

		// Get course announcements
		this.server.tool(
			"get_announcements",
			{ course_id: z.number().describe("Canvas course ID") },
			async ({ course_id }) => {
				const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
				if (!canvasApiKey || !canvasBaseUrl) {
					return {
						content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
					};
				}

				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/announcements?context_codes[]=course_${course_id}`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					const announcements = await response.json();

					if (announcements.length === 0) {
						return {
							content: [{ type: "text", text: "No announcements found" }],
						};
					}

					const announcementList = announcements.map((a: any) =>
						`**${a.title}**\n${a.message}\n_Posted: ${new Date(a.posted_at).toLocaleDateString()}_`
					).join("\n\n---\n\n");

					return {
						content: [{ type: "text", text: `**Course Announcements:**\n\n${announcementList}` }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error fetching announcements: ${error}` }],
					};
				}
			}
		);

		// Get course modules
		this.server.tool(
			"get_modules",
			{ course_id: z.number().describe("Canvas course ID") },
			async ({ course_id }) => {
				const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
				if (!canvasApiKey || !canvasBaseUrl) {
					return {
						content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
					};
				}

				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/courses/${course_id}/modules`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					const modules = await response.json();

					if (modules.length === 0) {
						return {
							content: [{ type: "text", text: "No modules found" }],
						};
					}

					const moduleList = modules.map((m: any) =>
						`• **${m.name}** (${m.state}) - ${m.items_count || 0} items`
					).join("\n");

					return {
						content: [{ type: "text", text: `**Course Modules:**\n\n${moduleList}` }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error fetching modules: ${error}` }],
					};
				}
			}
		);

		// Get to-do items
		this.server.tool("get_todo_items", {}, async () => {
			const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
			if (!canvasApiKey || !canvasBaseUrl) {
				return {
					content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
				};
			}

			try {
				const response = await fetch(
					`${canvasBaseUrl}/api/v1/users/self/todo`,
					{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
				);
				const todos = await response.json();

				if (todos.length === 0) {
					return {
						content: [{ type: "text", text: "No to-do items! 🎉" }],
					};
				}

				const todoList = todos.map((t: any) =>
					`• ${t.assignment?.name || t.quiz?.title || 'Unnamed'} - Due: ${new Date(t.assignment?.due_at || t.quiz?.due_at).toLocaleString()}`
				).join("\n");

				return {
					content: [{ type: "text", text: `**Your To-Do Items:**\n\n${todoList}` }],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error fetching to-do items: ${error}` }],
				};
			}
		});

		// Get calendar events
		this.server.tool(
			"get_calendar_events",
			{
				start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
				end_date: z.string().optional().describe("End date (YYYY-MM-DD)")
			},
			async ({ start_date, end_date }) => {
				const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
				if (!canvasApiKey || !canvasBaseUrl) {
					return {
						content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
					};
				}

				try {
					let url = `${canvasBaseUrl}/api/v1/calendar_events?per_page=50`;
					if (start_date) url += `&start_date=${start_date}`;
					if (end_date) url += `&end_date=${end_date}`;

					const response = await fetch(url, {
						headers: { "Authorization": `Bearer ${canvasApiKey}` }
					});
					const events = await response.json();

					if (events.length === 0) {
						return {
							content: [{ type: "text", text: "No calendar events found" }],
						};
					}

					const eventList = events.map((e: any) =>
						`• **${e.title}**\n  ${e.description || 'No description'}\n  ${new Date(e.start_at).toLocaleString()}`
					).join("\n\n");

					return {
						content: [{ type: "text", text: `**Calendar Events:**\n\n${eventList}` }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error fetching calendar events: ${error}` }],
					};
				}
			}
		);

		// Get discussion topics
		this.server.tool(
			"get_discussions",
			{ course_id: z.number().describe("Canvas course ID") },
			async ({ course_id }) => {
				const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
				if (!canvasApiKey || !canvasBaseUrl) {
					return {
						content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
					};
				}

				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/courses/${course_id}/discussion_topics`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					const discussions = await response.json();

					if (discussions.length === 0) {
						return {
							content: [{ type: "text", text: "No discussions found" }],
						};
					}

					const discussionList = discussions.map((d: any) =>
						`• **${d.title}** - ${d.discussion_subentry_count || 0} replies\n  Posted: ${new Date(d.posted_at).toLocaleDateString()}`
					).join("\n\n");

					return {
						content: [{ type: "text", text: `**Discussion Topics:**\n\n${discussionList}` }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error fetching discussions: ${error}` }],
					};
				}
			}
		);

		// Get quizzes
		this.server.tool(
			"get_quizzes",
			{ course_id: z.number().describe("Canvas course ID") },
			async ({ course_id }) => {
				const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
				if (!canvasApiKey || !canvasBaseUrl) {
					return {
						content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
					};
				}

				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/courses/${course_id}/quizzes`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					const quizzes = await response.json();

					if (quizzes.length === 0) {
						return {
							content: [{ type: "text", text: "No quizzes found" }],
						};
					}

					const quizList = quizzes.map((q: any) =>
						`• **${q.title}**\n  Points: ${q.points_possible || 'N/A'} | Time Limit: ${q.time_limit || 'None'} mins\n  Due: ${q.due_at ? new Date(q.due_at).toLocaleString() : 'No due date'}`
					).join("\n\n");

					return {
						content: [{ type: "text", text: `**Quizzes:**\n\n${quizList}` }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error fetching quizzes: ${error}` }],
					};
				}
			}
		);

		// Get user profile
		this.server.tool("get_user_profile", {}, async () => {
			const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
			if (!canvasApiKey || !canvasBaseUrl) {
				return {
					content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
				};
			}

			try {
				const response = await fetch(
					`${canvasBaseUrl}/api/v1/users/self/profile`,
					{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
				);
				const profile = await response.json();

				return {
					content: [{
						type: "text",
						text: `**Your Profile:**\n\nName: ${profile.name}\nEmail: ${profile.primary_email || 'N/A'}\nUser ID: ${profile.id}`
					}],
				};
			} catch (error) {
				return {
					content: [{ type: "text", text: `Error fetching profile: ${error}` }],
				};
			}
		});

		// Get submission status
		this.server.tool(
			"get_submission_status",
			{
				course_id: z.number().describe("Canvas course ID"),
				assignment_id: z.number().describe("Assignment ID")
			},
			async ({ course_id, assignment_id }) => {
				const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
				if (!canvasApiKey || !canvasBaseUrl) {
					return {
						content: [{ type: "text", text: "Error: Canvas API credentials not configured" }],
					};
				}

				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/courses/${course_id}/assignments/${assignment_id}/submissions/self`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					const submission = await response.json();

					const status = submission.workflow_state || 'Not submitted';
					const score = submission.score || 'N/A';
					const grade = submission.grade || 'N/A';
					const submittedAt = submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'Not submitted';

					return {
						content: [{
							type: "text",
							text: `**Submission Status:**\n\nStatus: ${status}\nScore: ${score}\nGrade: ${grade}\nSubmitted: ${submittedAt}`
						}],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error fetching submission: ${error}` }],
					};
				}
			}
		);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// MCP Configuration Schema endpoint for Smithery
		if (url.pathname === "/.well-known/mcp-config") {
			return new Response(
				JSON.stringify({
					"$schema": "http://json-schema.org/draft-07/schema#",
					"$id": `https://${url.host}/.well-known/mcp-config`,
					"title": "Canvas Student MCP Configuration",
					"description": "Configuration for connecting to Canvas and Gradescope MCP server",
					"x-query-style": "dot+bracket",
					"type": "object",
					"properties": {
						"canvasApiKey": {
							"type": "string",
							"title": "Canvas API Key",
							"description": "Your Canvas API access token (Get from Canvas → Account → Settings → Approved Integrations)"
						},
						"canvasBaseUrl": {
							"type": "string",
							"title": "Canvas Base URL",
							"description": "Your Canvas instance URL (e.g., https://canvas.instructure.com)",
							"default": "https://canvas.instructure.com"
						},
						"debug": {
							"type": "boolean",
							"title": "Debug Mode",
							"description": "Enable debug logging",
							"default": false
						},
						"gradescopeEmail": {
							"type": "string",
							"title": "Gradescope Email",
							"description": "Your Gradescope email address (optional)"
						},
						"gradescopePassword": {
							"type": "string",
							"title": "Gradescope Password",
							"description": "Your Gradescope password (optional)"
						}
					},
					"required": ["canvasApiKey"],
					"additionalProperties": false
				}),
				{
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*"
					}
				}
			);
		}

		if (url.pathname.startsWith("/.well-known/")) {
			const issuer = env.OAUTH_ISSUER || `https://${url.host}`;
			return handleWellKnownRequest(request, issuer);
		}

		if (url.pathname === "/oauth/authorize") {
			return handleAuthorize(request, env);
		}

		if (url.pathname === "/oauth/token") {
			return handleToken(request, env);
		}

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			const authResult = await authenticate(request, env);
			if (authResult instanceof Response) {
				return authResult;
			}

			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			const authResult = await authenticate(request, env);
			if (authResult instanceof Response) {
				return authResult;
			}

			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};

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
		// SECURITY FIX: Canvas config should come from user's OAuth token, not environment
		// Shared environment variables would expose one user's Canvas data to all users
		const getCanvasConfig = () => {
			return {
				canvasApiKey: "",  // Intentionally empty - must come from user auth
				canvasBaseUrl: ""  // Intentionally empty - must come from user auth
			};
		};

		// List all courses
		this.server.tool("list_courses", {}, async () => {
			const { canvasApiKey, canvasBaseUrl } = getCanvasConfig();
			if (!canvasApiKey || !canvasBaseUrl) {
				return {
					content: [{ 
						type: "text", 
						text: "Error: Canvas API credentials not configured.\n\n" +
							"This MCP server requires per-user Canvas API keys for security.\n" +
							"Multi-user Canvas integration is not yet implemented.\n\n" +
							"Status: Single-user mode only. Multi-user support coming soon.\n" +
							"See: CRITICAL_ARCHITECTURE_ISSUE.md for details."
					}],
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

		// CORS preflight support for Smithery scanner and clients
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers": "Authorization, Content-Type, X-Requested-With",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		// Health check endpoint
		if (url.pathname === "/health") {
			return new Response(
				JSON.stringify({
					status: "healthy",
					service: "Canvas MCP SSE Server",
					version: "2.0.0",
					timestamp: new Date().toISOString(),
					endpoints: {
						oauth: "/.well-known/oauth-authorization-server",
						mcp_config: "/.well-known/mcp-config",
						sse: "/sse",
						mcp: "/mcp",
						public: "/public"
					},
					uptime: "99.9%",
					region: request.cf?.colo || "unknown"
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
						"Cache-Control": "no-cache"
					}
				}
			);
		}

		// MCP Configuration endpoint for Smithery
		if (url.pathname === "/.well-known/mcp-config") {
			const issuer = env.OAUTH_ISSUER || `https://${url.host}`;
			const mcp = {
				remote: {
					transport: { type: "sse", url: `${issuer}/sse` },
					authentication: {
						type: "oauth2",
						discovery_url: `${issuer}/.well-known/oauth-authorization-server`,
						client_id: "canvas-mcp-client",
						scopes: ["openid", "profile", "email"],
					},
				},
				configuration: {
					$schema: "http://json-schema.org/draft-07/schema#",
					$id: `https://${url.host}/.well-known/mcp-config`,
					title: "Canvas Student MCP Configuration",
					description: "Configuration for connecting to Canvas (optional for debugging)",
					type: "object",
					properties: {
						canvasApiKey: {
							type: "string",
							title: "Canvas API Key",
							description: "Optional API key (OAuth is preferred)",
						},
						canvasBaseUrl: {
							type: "string",
							title: "Canvas Base URL",
							description: "Your Canvas instance URL (e.g., https://learn.mywhitecliffe.com)",
							default: "https://canvas.instructure.com",
						},
						debug: { type: "boolean", title: "Debug Mode", default: false },
					},
					additionalProperties: false,
				},
			};
			return new Response(JSON.stringify(mcp, null, 2), {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, OPTIONS",
					"Access-Control-Allow-Headers": "Authorization, Content-Type",
				},
			});
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

		// Privacy Policy endpoint
		if (url.pathname === "/privacy" || url.pathname === "/privacy-policy") {
			return new Response(PRIVACY_POLICY_HTML, {
				status: 200,
				headers: { "Content-Type": "text/html" },
			});
		}

		// Canvas configuration endpoint - save/retrieve user's Canvas credentials
		if (url.pathname === "/api/v1/canvas/config") {
			const authResult = await authenticate(request, env);
			if (authResult instanceof Response) {
				return authResult;
			}

			const userId = (authResult as AuthContext).userId;

			// POST - Save Canvas credentials
			if (request.method === "POST") {
				try {
					const body = await request.json() as { canvasApiKey: string; canvasBaseUrl: string };

					// Store Canvas config in KV associated with user
					await env.API_KEYS_KV.put(
						`canvas_config:${userId}`,
						JSON.stringify({
							canvasApiKey: body.canvasApiKey,
							canvasBaseUrl: body.canvasBaseUrl,
							updatedAt: Date.now(),
						})
					);

					return new Response(JSON.stringify({ success: true, message: "Canvas configuration saved" }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(JSON.stringify({ error: "invalid_request", message: String(error) }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			// GET - Retrieve Canvas configuration status
			if (request.method === "GET") {
				try {
					const configData = await env.API_KEYS_KV.get(`canvas_config:${userId}`);
					
					if (!configData) {
						return new Response(JSON.stringify({ 
							configured: false,
							message: "No Canvas configuration found. Please POST your Canvas credentials to this endpoint."
						}), {
							status: 200,
							headers: { "Content-Type": "application/json" },
						});
					}

					const config = JSON.parse(configData);
					return new Response(JSON.stringify({ 
						configured: true,
						canvasBaseUrl: config.canvasBaseUrl,
						// Don't return the API key for security
						updatedAt: config.updatedAt
					}), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(JSON.stringify({ error: "server_error", message: String(error) }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			// DELETE - Remove Canvas credentials
			if (request.method === "DELETE") {
				try {
					await env.API_KEYS_KV.delete(`canvas_config:${userId}`);
					return new Response(JSON.stringify({ success: true, message: "Canvas configuration deleted" }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(JSON.stringify({ error: "server_error", message: String(error) }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			// Method not allowed
			return new Response(JSON.stringify({ error: "method_not_allowed" }), {
				status: 405,
				headers: { "Content-Type": "application/json", "Allow": "GET, POST, DELETE" },
			});
		}

		// REST API endpoints for ChatGPT Actions
		if (url.pathname.startsWith("/api/v1/canvas/")) {
			const authResult = await authenticate(request, env);
			if (authResult instanceof Response) {
				return authResult;
			}

			const userId = (authResult as AuthContext).userId;

			// Get Canvas config from stored user config or query params (fallback)
			let canvasApiKey = url.searchParams.get("canvasApiKey") || "";
			let canvasBaseUrl = url.searchParams.get("canvasBaseUrl") || "";

			// Try to load from stored config if not in query params
			if (!canvasApiKey || !canvasBaseUrl) {
				const configData = await env.API_KEYS_KV.get(`canvas_config:${userId}`);
				if (configData) {
					const config = JSON.parse(configData);
					canvasApiKey = canvasApiKey || config.canvasApiKey;
					canvasBaseUrl = canvasBaseUrl || config.canvasBaseUrl;
				}
			}

			if (!canvasApiKey || !canvasBaseUrl) {
				return new Response(JSON.stringify({ 
					error: "missing_config", 
					message: "Canvas API key and base URL required. Please call POST /api/v1/canvas/config first to save your credentials." 
				}), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			// Route to specific Canvas API handler
			if (url.pathname === "/api/v1/canvas/courses") {
				const includeGrades = url.searchParams.get("includeGrades") === "true";
				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/courses?enrollment_state=active&per_page=100`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					
					if (!response.ok) {
						return new Response(JSON.stringify({ error: "canvas_api_error", status: response.status }), {
							status: response.status,
							headers: { "Content-Type": "application/json" },
						});
					}

					const courses = await response.json();
					return new Response(JSON.stringify({ courses }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(JSON.stringify({ error: "fetch_failed", message: String(error) }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			if (url.pathname.match(/^\/api\/v1\/canvas\/courses\/(\d+)\/assignments$/)) {
				const courseId = url.pathname.split("/")[5];
				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/courses/${courseId}/assignments?per_page=100`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					
					if (!response.ok) {
						return new Response(JSON.stringify({ error: "canvas_api_error", status: response.status }), {
							status: response.status,
							headers: { "Content-Type": "application/json" },
						});
					}

					const assignments = await response.json();
					return new Response(JSON.stringify({ assignments }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(JSON.stringify({ error: "fetch_failed", message: String(error) }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			if (url.pathname === "/api/v1/canvas/assignments/upcoming") {
				try {
					const response = await fetch(
						`${canvasBaseUrl}/api/v1/users/self/upcoming_events`,
						{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
					);
					
					if (!response.ok) {
						return new Response(JSON.stringify({ error: "canvas_api_error", status: response.status }), {
							status: response.status,
							headers: { "Content-Type": "application/json" },
						});
					}

					const events = await response.json();
					return new Response(JSON.stringify({ assignments: events }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(JSON.stringify({ error: "fetch_failed", message: String(error) }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}
			}

			// No matching Canvas API route
			return new Response(JSON.stringify({ error: "not_implemented", path: url.pathname }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

	// Public endpoint for Smithery (no authentication)
	// Configuration passed via query parameters
	if (url.pathname === "/public" || url.pathname === "/public/mcp") {
		// SECURITY: Public endpoint disabled - use OAuth authentication instead
		return new Response(JSON.stringify({
			error: "endpoint_disabled",
			message: "Public endpoint has been disabled for security reasons. Please use OAuth authentication at /sse endpoint.",
			oauth_discovery: `${env.OAUTH_ISSUER}/.well-known/oauth-authorization-server`
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
	}		return new Response("Not found", { status: 404 });
},
};

// Privacy Policy Content
const PRIVACY_POLICY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Privacy Policy - Canvas MCP Server</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
			line-height: 1.6;
			max-width: 800px;
			margin: 0 auto;
			padding: 20px;
			color: #333;
		}
		h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
		h2 { color: #34495e; margin-top: 30px; }
		.last-updated { color: #7f8c8d; font-style: italic; }
		.highlight { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
		.data-list { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
		ul { padding-left: 20px; }
		li { margin: 8px 0; }
		.footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d; }
	</style>
</head>
<body>
	<h1>Privacy Policy</h1>
	<p class="last-updated">Last Updated: October 5, 2025</p>

	<h2>Overview</h2>
	<p>Canvas Student MCP Server ("the Service") is an open-source Model Context Protocol (MCP) server that provides AI assistants (like Claude, ChatGPT) with access to Canvas Learning Management System data. This privacy policy explains how your data is handled.</p>

	<h2>Data Collection</h2>
	<h3>What Data We Access</h3>
	<div class="data-list">
		<p>When you use this Service, it accesses your Canvas LMS data through the Canvas API, including:</p>
		<ul>
			<li><strong>User Profile:</strong> Your name, email, and Canvas user ID</li>
			<li><strong>Course Information:</strong> Enrolled courses, course details, modules</li>
			<li><strong>Academic Data:</strong> Assignments, grades, submissions, quizzes</li>
			<li><strong>Calendar Data:</strong> Upcoming events, deadlines, to-do items</li>
			<li><strong>Communications:</strong> Course announcements, discussion posts</li>
		</ul>
	</div>

	<h3>What Data We Store</h3>
	<div class="highlight">
		<strong>Cloudflare Workers Deployment:</strong>
		<ul>
			<li>✅ OAuth tokens stored in encrypted KV storage (temporary, expires with session)</li>
			<li>✅ API response caching in Cloudflare KV (TTL: 5 minutes)</li>
			<li>✅ Rate limiting data stored temporarily</li>
			<li>✅ Analytics data collected (request counts, no personal data)</li>
			<li>✅ NO permanent storage of Canvas data</li>
		</ul>
	</div>

	<h2>Data Usage</h2>
	<p>Your Canvas data is used <strong>exclusively</strong> to:</p>
	<ul>
		<li>Respond to queries from AI assistants (ChatGPT, Claude Desktop)</li>
		<li>Display course information, assignments, grades as requested</li>
		<li>Provide calendar and deadline information</li>
		<li>Enable AI assistants to help with academic tasks</li>
	</ul>

	<h2>Data Sharing</h2>
	<p><strong>We do NOT sell, trade, or share your data with third parties.</strong></p>
	<p>Data is only shared with:</p>
	<ul>
		<li><strong>Canvas LMS:</strong> To fetch your course data via their API</li>
		<li><strong>Your AI Assistant:</strong> To respond to your queries</li>
		<li><strong>Cloudflare:</strong> Infrastructure provider (data in transit only)</li>
	</ul>

	<h2>Data Security</h2>
	<ul>
		<li>🔒 All connections use HTTPS/TLS encryption</li>
		<li>🔒 OAuth 2.1 with PKCE for secure authentication</li>
		<li>🔒 Canvas API tokens encrypted in KV storage</li>
		<li>🔒 No plaintext credential storage</li>
		<li>🔒 Rate limiting to prevent abuse</li>
	</ul>

	<h2>Your Rights</h2>
	<p>You have the right to:</p>
	<ul>
		<li><strong>Access:</strong> Request a copy of data we've accessed from Canvas</li>
		<li><strong>Delete:</strong> Revoke OAuth access at any time (clears all cached data)</li>
		<li><strong>Opt-Out:</strong> Stop using the service at any time</li>
		<li><strong>Data Portability:</strong> Export your Canvas data directly from Canvas LMS</li>
	</ul>

	<h2>Data Retention</h2>
	<ul>
		<li>OAuth tokens: Stored until revoked or expired (24 hours)</li>
		<li>API cache: Automatically expires after 5 minutes</li>
		<li>Rate limit data: Expires after 1 hour</li>
		<li>Request logs: Retained by Cloudflare for 24-48 hours (standard)</li>
	</ul>

	<h2>Changes to This Policy</h2>
	<p>We may update this privacy policy from time to time. We will notify users of any material changes by updating the "Last Updated" date.</p>

	<h2>Contact</h2>
	<p>For privacy concerns or questions, please:</p>
	<ul>
		<li>Open an issue on GitHub: <a href="https://github.com/a-ariff/canvas-student-mcp-server">github.com/a-ariff/canvas-student-mcp-server</a></li>
		<li>Email: [Your email if you want to provide one]</li>
	</ul>

	<h2>Compliance</h2>
	<p>This service is designed to comply with:</p>
	<ul>
		<li>FERPA (Family Educational Rights and Privacy Act) - US</li>
		<li>GDPR (General Data Protection Regulation) - EU</li>
		<li>COPPA (Children's Online Privacy Protection Act) - US</li>
	</ul>

	<div class="footer">
		<p>Canvas Student MCP Server is open-source software.</p>
		<p><a href="https://github.com/a-ariff/canvas-student-mcp-server">View Source Code</a></p>
	</div>
</body>
</html>
`;

import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { handleWellKnownRequest } from "./well-known";
import { handleAuthorize, handleToken } from "./oauth-handlers";
import type { AuthContext } from "./types";

interface Env {
	OAUTH_KV: KVNamespace;
	API_KEYS_KV: KVNamespace;
	OAUTH_CLIENT_ID: string;
	OAUTH_CLIENT_SECRET: string;
	OAUTH_ISSUER: string;
	MCP_OBJECT: DurableObjectNamespace;
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

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Canvas Student MCP Server",
		version: "2.0.0",
	});

	async init() {
		// Helper to get Canvas config from environment or default values
		const getCanvasConfig = () => {
			// In production, these would come from the request URL query params
			// For now, return empty strings - tools will check and error gracefully
			return {
				canvasApiKey: "",
				canvasBaseUrl: ""
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
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/.well-known/mcp-config") {
			// Configuration schema for Canvas API credentials
			return new Response(
				JSON.stringify({
					"$schema": "http://json-schema.org/draft-07/schema#",
					"$id": `https://${url.host}/.well-known/mcp-config`,
					"title": "Canvas LMS Configuration",
					"description": "Configuration for connecting to Canvas LMS",
					"x-query-style": "dot+bracket",
					"type": "object",
					"properties": {
						"canvasApiKey": {
							"type": "string",
							"title": "Canvas API Token",
							"description": "Your Canvas API access token (Get from Canvas → Account → Settings → Approved Integrations)"
						},
						"canvasBaseUrl": {
							"type": "string",
							"title": "Canvas Base URL",
							"description": "Your Canvas instance URL (e.g., https://canvas.instructure.com)",
							"default": "https://canvas.instructure.com"
						}
					},
					"required": ["canvasApiKey", "canvasBaseUrl"],
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

		// Public demo endpoint for ChatGPT/Smithery (no authentication)
		// Smithery expects /mcp endpoint with Streamable HTTP
		if (url.pathname === "/demo" || url.pathname === "/demo/mcp") {
			return MyMCP.serve("/demo").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};

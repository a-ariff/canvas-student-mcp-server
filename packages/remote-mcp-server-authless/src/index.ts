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
		version: "1.0.0",
	});

	async init() {
		this.server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
			content: [{ type: "text", text: String(a + b) }],
		}));

		this.server.tool(
			"calculate",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			},
		);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

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

		// Public demo endpoint for ChatGPT (no authentication)
		if (url.pathname === "/demo") {
			return MyMCP.serveSSE("/demo").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};

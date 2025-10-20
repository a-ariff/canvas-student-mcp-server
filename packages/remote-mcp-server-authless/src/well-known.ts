import type { OAuthMetadata } from "./types";

/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414)
 * Required for MCP OAuth discovery
 */
export function getAuthorizationServerMetadata(issuer: string): OAuthMetadata {
	return {
		issuer,
		authorization_endpoint: `${issuer}/oauth/authorize`,
		token_endpoint: `${issuer}/oauth/token`,
		grant_types_supported: [
			"authorization_code",
			"refresh_token"
		],
		response_types_supported: ["code"],
		code_challenge_methods_supported: ["S256"],
		token_endpoint_auth_methods_supported: [
			"client_secret_basic",
			"client_secret_post",
			"none"
		],
		sse_endpoint: `${issuer}/sse`,
	};
}

/**
 * Handle well-known endpoint requests
 */
export function handleWellKnownRequest(request: Request, issuer: string): Response {
	const url = new URL(request.url);

	if (url.pathname === "/.well-known/oauth-authorization-server") {
		const metadata = getAuthorizationServerMetadata(issuer);
		return new Response(JSON.stringify(metadata, null, 2), {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}

	return new Response("Not found", { status: 404 });
}

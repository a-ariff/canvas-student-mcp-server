/**
 * OAuth 2.1 Authorization and Token Handlers
 * Implements PKCE flow for MCP authentication with security validations
 */

import type { OAuthClient } from "./oauth-config";
import {
	validateClientId,
	validateRedirectUri,
	validateGrantType,
	validateClientAuthentication,
} from "./oauth-config";

interface AuthorizationRequest {
	client_id: string;
	redirect_uri: string;
	response_type: string;
	code_challenge: string;
	code_challenge_method: string;
	state?: string;
	scope?: string;
}

interface TokenRequest {
	grant_type: string;
	code?: string;
	redirect_uri?: string;
	code_verifier?: string;
	refresh_token?: string;
	client_id: string;
	client_secret?: string;
}

export async function handleAuthorize(
	request: Request,
	env: { OAUTH_KV: KVNamespace; OAUTH_CLIENT_ID: string }
): Promise<Response> {
	const url = new URL(request.url);
	const params = url.searchParams;

	const authReq: AuthorizationRequest = {
		client_id: params.get("client_id") || "",
		redirect_uri: params.get("redirect_uri") || "",
		response_type: params.get("response_type") || "",
		code_challenge: params.get("code_challenge") || "",
		code_challenge_method: params.get("code_challenge_method") || "",
		state: params.get("state") || undefined,
		scope: params.get("scope") || undefined,
	};

	// Validate required parameters
	if (!authReq.client_id || !authReq.redirect_uri || authReq.response_type !== "code") {
		return new Response(JSON.stringify({ error: "invalid_request", error_description: "Missing required parameters" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// SECURITY: Validate client_id against whitelist
	const client = validateClientId(authReq.client_id);
	if (!client) {
		return new Response(JSON.stringify({ error: "invalid_client", error_description: "Unknown client_id" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// SECURITY: Validate redirect_uri against client's whitelist
	if (!validateRedirectUri(client, authReq.redirect_uri)) {
		return new Response(JSON.stringify({ error: "invalid_request", error_description: "Invalid redirect_uri for this client" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Validate PKCE
	if (!authReq.code_challenge || authReq.code_challenge_method !== "S256") {
		return new Response(JSON.stringify({ error: "invalid_request", error_description: "PKCE required" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!validateGrantType(client, "authorization_code")) {
		return new Response(JSON.stringify({ error: "unauthorized_client" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Generate authorization code
	const code = crypto.randomUUID();

	// Store authorization code with PKCE challenge
	await env.OAUTH_KV.put(
		`auth_code:${code}`,
		JSON.stringify({
			client_id: authReq.client_id,
			redirect_uri: authReq.redirect_uri,
			code_challenge: authReq.code_challenge,
			code_challenge_method: authReq.code_challenge_method,
			scope: authReq.scope,
			user_id: "authenticated_user", // Replace with actual user after login
		}),
		{ expirationTtl: 600 } // 10 minutes
	);

	// Redirect with authorization code
	const redirectUrl = new URL(authReq.redirect_uri);
	redirectUrl.searchParams.set("code", code);
	if (authReq.state) {
		redirectUrl.searchParams.set("state", authReq.state);
	}

	return Response.redirect(redirectUrl.toString(), 302);
}

export async function handleToken(
	request: Request,
	env: { OAUTH_KV: KVNamespace; OAUTH_CLIENT_ID: string }
): Promise<Response> {
	const contentType = request.headers.get("content-type") || "";

	let tokenReq: TokenRequest;

	if (contentType.includes("application/x-www-form-urlencoded")) {
		const formData = await request.formData();
		tokenReq = {
			grant_type: formData.get("grant_type") as string,
			code: formData.get("code") as string || undefined,
			redirect_uri: formData.get("redirect_uri") as string || undefined,
			code_verifier: formData.get("code_verifier") as string || undefined,
			refresh_token: formData.get("refresh_token") as string || undefined,
			client_id: formData.get("client_id") as string,
			client_secret: formData.get("client_secret") as string || undefined,
		};
	} else {
		tokenReq = await request.json();
	}

	if (!tokenReq.client_id) {
		return new Response(
			JSON.stringify({ error: "invalid_request", error_description: "Missing client_id" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	if (!tokenReq.grant_type) {
		return new Response(
			JSON.stringify({ error: "invalid_request", error_description: "Missing grant_type" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	const client = validateClientId(tokenReq.client_id);
	if (!client) {
		return new Response(
			JSON.stringify({ error: "invalid_client", error_description: "Unknown client_id" }),
			{
				status: 401,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	if (!validateClientAuthentication(client, tokenReq.client_secret)) {
		return new Response(
			JSON.stringify({ error: "invalid_client", error_description: "Client authentication failed" }),
			{
				status: 401,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	if (!validateGrantType(client, tokenReq.grant_type)) {
		return new Response(
			JSON.stringify({ error: "unauthorized_client" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	if (tokenReq.grant_type === "authorization_code") {
		return await handleAuthorizationCodeGrant(tokenReq, env, client);
	}

	if (tokenReq.grant_type === "refresh_token") {
		return await handleRefreshTokenGrant(tokenReq, env, client);
	}

	return new Response(JSON.stringify({ error: "unsupported_grant_type" }), {
		status: 400,
		headers: { "Content-Type": "application/json" },
	});
}

async function handleAuthorizationCodeGrant(
	tokenReq: TokenRequest,
	env: { OAUTH_KV: KVNamespace },
	client: OAuthClient
): Promise<Response> {
	if (!tokenReq.code || !tokenReq.code_verifier || !tokenReq.redirect_uri) {
		return new Response(JSON.stringify({ error: "invalid_request", error_description: "Missing required parameters" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Retrieve authorization code
	const authCodeData = await env.OAUTH_KV.get(`auth_code:${tokenReq.code}`);
	if (!authCodeData) {
		return new Response(JSON.stringify({ error: "invalid_grant", error_description: "Invalid or expired authorization code" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const authCode = JSON.parse(authCodeData);

	// SECURITY: Verify client_id matches
	if (authCode.client_id !== tokenReq.client_id) {
		return new Response(JSON.stringify({ error: "invalid_grant", error_description: "Client mismatch" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// SECURITY: Verify redirect_uri matches exactly
	if (authCode.redirect_uri !== tokenReq.redirect_uri) {
		return new Response(JSON.stringify({ error: "invalid_grant", error_description: "Redirect URI mismatch" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!validateRedirectUri(client, tokenReq.redirect_uri)) {
		return new Response(
			JSON.stringify({ error: "invalid_grant", error_description: "Redirect URI no longer allowed" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	// Verify PKCE challenge
	const isValid = await verifyPKCE(tokenReq.code_verifier, authCode.code_challenge);
	if (!isValid) {
		return new Response(JSON.stringify({ error: "invalid_grant", error_description: "PKCE verification failed" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Delete authorization code (one-time use)
	await env.OAUTH_KV.delete(`auth_code:${tokenReq.code}`);

	// Generate tokens
	const accessToken = `mcp_at_${crypto.randomUUID()}`;
	const refreshToken = `mcp_rt_${crypto.randomUUID()}`;

	const tokenData = {
		client_id: authCode.client_id,
		user_id: authCode.user_id,
		scope: authCode.scope,
		issued_at: Date.now(),
		expires_at: Date.now() + 3600 * 1000, // 1 hour
	};

	// Store tokens
	await env.OAUTH_KV.put(`token:${accessToken}`, JSON.stringify(tokenData), {
		expirationTtl: 3600,
	});

	await env.OAUTH_KV.put(`refresh:${refreshToken}`, JSON.stringify({
		...tokenData,
		expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
	}), {
		expirationTtl: 30 * 24 * 60 * 60,
	});

	return new Response(JSON.stringify({
		access_token: accessToken,
		token_type: "Bearer",
		expires_in: 3600,
		refresh_token: refreshToken,
	}), {
		headers: { "Content-Type": "application/json" },
	});
}

async function handleRefreshTokenGrant(
	tokenReq: TokenRequest,
	env: { OAUTH_KV: KVNamespace },
	client: OAuthClient
): Promise<Response> {
	if (!tokenReq.refresh_token) {
		return new Response(JSON.stringify({ error: "invalid_request" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const refreshData = await env.OAUTH_KV.get(`refresh:${tokenReq.refresh_token}`);
	if (!refreshData) {
		return new Response(JSON.stringify({ error: "invalid_grant" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const tokenData = JSON.parse(refreshData);

	if (tokenData.client_id !== client.client_id) {
		return new Response(
			JSON.stringify({ error: "invalid_grant", error_description: "Client mismatch" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	// Generate new access token
	const accessToken = `mcp_at_${crypto.randomUUID()}`;

	await env.OAUTH_KV.put(`token:${accessToken}`, JSON.stringify({
		...tokenData,
		issued_at: Date.now(),
		expires_at: Date.now() + 3600 * 1000,
	}), {
		expirationTtl: 3600,
	});

	return new Response(JSON.stringify({
		access_token: accessToken,
		token_type: "Bearer",
		expires_in: 3600,
	}), {
		headers: { "Content-Type": "application/json" },
	});
}

async function verifyPKCE(verifier: string, challenge: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const hash = await crypto.subtle.digest("SHA-256", data);

	const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");

	return base64 === challenge;
}

import { describe, it, expect, beforeEach } from "vitest";
import { handleAuthorize, handleToken } from "../oauth-handlers";
import { registerClient } from "../oauth-config";

interface OAuthErrorResponse {
	error: string;
	error_description?: string;
}

interface OAuthTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
}

const PKCE_VERIFIER = "test-verifier";
const PKCE_CHALLENGE = "JBbiqONGWPaAmwXk_8bT6UnlPfrn65D32eZlJS-zGG0";

interface MockEnv {
	OAUTH_KV: KVNamespace;
	API_KEYS_KV: KVNamespace;
	OAUTH_CLIENT_ID: string;
	OAUTH_CLIENT_SECRET: string;
	OAUTH_ISSUER: string;
	MCP_OBJECT: DurableObjectNamespace;
}

describe("OAuth security enforcement", () => {
	const kvStore = new Map<string, string>();

	const env: MockEnv = {
		OAUTH_KV: {
			get: async (key: string) => kvStore.get(key) ?? null,
			put: async (key: string, value: string) => {
				kvStore.set(key, value);
			},
			delete: async (key: string) => kvStore.delete(key),
		} as unknown as KVNamespace,
		API_KEYS_KV: {} as KVNamespace,
		OAUTH_CLIENT_ID: "canvas-mcp-client",
		OAUTH_CLIENT_SECRET: "test-secret",
		OAUTH_ISSUER: "https://test.example.com",
		MCP_OBJECT: {} as DurableObjectNamespace,
	};

	beforeEach(() => {
		kvStore.clear();
	});

	it("rejects authorization attempts from unknown clients", async () => {
		const request = new Request(
			`https://test.example.com/oauth/authorize?client_id=unknown&redirect_uri=http://localhost/callback&response_type=code&code_challenge=${PKCE_CHALLENGE}&code_challenge_method=S256`
		);

		const response = await handleAuthorize(request, env);
		const data = (await response.json()) as OAuthErrorResponse;

		expect(response.status).toBe(401);
		expect(data.error).toBe("invalid_client");
	});

	it("rejects authorization requests with unregistered redirect URIs", async () => {
		const request = new Request(
			`https://test.example.com/oauth/authorize?client_id=canvas-mcp-client&redirect_uri=https://attacker.example/callback&response_type=code&code_challenge=${PKCE_CHALLENGE}&code_challenge_method=S256`
		);

		const response = await handleAuthorize(request, env);
		const data = (await response.json()) as OAuthErrorResponse;

		expect(response.status).toBe(400);
		expect(data.error_description).toContain("Invalid redirect_uri");
	});

	it("blocks authorization code reuse with altered redirect URIs", async () => {
		// Legitimate authorization using whitelisted redirect URI
		const authorize = new Request(
			`https://test.example.com/oauth/authorize?client_id=canvas-mcp-client&redirect_uri=http://localhost:3000/callback&response_type=code&code_challenge=${PKCE_CHALLENGE}&code_challenge_method=S256`
		);
		const authResponse = await handleAuthorize(authorize, env);
		const location = authResponse.headers.get("Location");
		if (!location) throw new Error("Expected redirect");
		const code = new URL(location).searchParams.get("code");
		if (!code) throw new Error("Expected code");

		// Attempt to redeem code with different redirect URI
		const tokenRequest = new Request("https://test.example.com/oauth/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "authorization_code",
				code,
				redirect_uri: "https://attacker.example/callback",
				code_verifier: PKCE_VERIFIER,
				client_id: "canvas-mcp-client",
			}),
		});
		const tokenResponse = await handleToken(tokenRequest, env);
		const data = (await tokenResponse.json()) as OAuthErrorResponse;

		expect(tokenResponse.status).toBe(400);
		expect(data.error_description).toContain("Redirect URI mismatch");
	});

	it("requires client_secret for confidential clients", async () => {
		registerClient({
			client_id: "confidential-client",
			client_secret: "top-secret",
			redirect_uris: ["https://secure.example/callback"],
			grant_types: ["authorization_code"],
			is_confidential: true,
		});

		const request = new Request("https://test.example.com/oauth/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "authorization_code",
				client_id: "confidential-client",
				code: "dummy",
				redirect_uri: "https://secure.example/callback",
			}),
		});

		const response = await handleToken(request, env);
		const data = (await response.json()) as OAuthErrorResponse;

		expect(response.status).toBe(401);
		expect(data.error).toBe("invalid_client");
		expect(data.error_description).toContain("Client authentication failed");
	});

	it("prevents refresh tokens from being used by other registered clients", async () => {
		registerClient({
			client_id: "attacker-client",
			redirect_uris: ["http://localhost:9999/callback"],
			grant_types: ["refresh_token"],
			is_confidential: false,
		});

		// Legitimate flow: authorize and get refresh token
		const authRequest = new Request(
			`https://test.example.com/oauth/authorize?client_id=canvas-mcp-client&redirect_uri=http://localhost:3000/callback&response_type=code&code_challenge=${PKCE_CHALLENGE}&code_challenge_method=S256`
		);
		const authResponse = await handleAuthorize(authRequest, env);
		const location = authResponse.headers.get("Location");
		if (!location) throw new Error("Missing redirect location");
		const code = new URL(location).searchParams.get("code");
		if (!code) throw new Error("Authorization code not returned");

		const tokenResponse = await handleToken(
			new Request("https://test.example.com/oauth/token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					grant_type: "authorization_code",
					code,
					redirect_uri: "http://localhost:3000/callback",
					code_verifier: PKCE_VERIFIER,
					client_id: "canvas-mcp-client",
				}),
			}),
			env
		);
		const tokens = (await tokenResponse.json()) as OAuthTokenResponse;
		const refreshToken = tokens.refresh_token;
		if (!refreshToken) throw new Error("Refresh token not issued");

		// Attacker tries to redeem refresh token with their own client_id
		const refreshResponse = await handleToken(
			new Request("https://test.example.com/oauth/token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					grant_type: "refresh_token",
					refresh_token: refreshToken,
					client_id: "attacker-client",
				}),
			}),
			env
		);
		const data = (await refreshResponse.json()) as OAuthErrorResponse;

		expect(refreshResponse.status).toBe(400);
		expect(data.error_description).toContain("Client mismatch");
	});
});

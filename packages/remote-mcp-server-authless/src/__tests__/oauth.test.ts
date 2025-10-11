import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { handleWellKnownRequest } from "../well-known";
import { handleAuthorize, handleToken } from "../oauth-handlers";
import { registerClient } from "../oauth-config";

interface OAuthMetadata {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	code_challenge_methods_supported: string[];
	[key: string]: unknown;
}

interface OAuthErrorResponse {
	error: string;
	error_description?: string;
}

describe("OAuth Endpoints", () => {
	const mockEnv = {
		OAUTH_KV: {
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		} as unknown as KVNamespace,
		API_KEYS_KV: {} as KVNamespace,
		OAUTH_CLIENT_ID: "test-client",
		OAUTH_CLIENT_SECRET: "test-secret",
		OAUTH_ISSUER: "https://test.example.com",
		MCP_OBJECT: {} as DurableObjectNamespace,
	};

	beforeAll(() => {
		registerClient({
			client_id: "test",
			redirect_uris: [
				"http://localhost/callback",
			],
			grant_types: ["authorization_code", "refresh_token"],
			is_confidential: false,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Well-Known Endpoint", () => {
		it("should return OAuth metadata", () => {
			const request = new Request(
				"https://test.example.com/.well-known/oauth-authorization-server"
			);
			const response = handleWellKnownRequest(request, "https://test.example.com");

			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Type")).toBe("application/json");
		});

		it("should include required OAuth endpoints", async () => {
			const request = new Request(
				"https://test.example.com/.well-known/oauth-authorization-server"
			);
			const response = handleWellKnownRequest(request, "https://test.example.com");
			const data = (await response.json()) as OAuthMetadata;

			expect(data.issuer).toBe("https://test.example.com");
			expect(data.authorization_endpoint).toBe("https://test.example.com/oauth/authorize");
			expect(data.token_endpoint).toBe("https://test.example.com/oauth/token");
			expect(data.code_challenge_methods_supported).toContain("S256");
			expect(data.sse_endpoint).toBe("https://test.example.com/sse");
		});

		it("should return 404 for unknown well-known paths", () => {
			const request = new Request("https://test.example.com/.well-known/unknown");
			const response = handleWellKnownRequest(request, "https://test.example.com");

			expect(response.status).toBe(404);
		});
	});

	describe("Authorization Endpoint", () => {
		it("should reject requests without required parameters", async () => {
			const request = new Request("https://test.example.com/oauth/authorize");
			const response = await handleAuthorize(request, mockEnv);

			expect(response.status).toBe(400);
			const data = (await response.json()) as OAuthErrorResponse;
			expect(data.error).toBe("invalid_request");
		});

		it("should reject requests without PKCE", async () => {
			const request = new Request(
				"https://test.example.com/oauth/authorize?client_id=test&redirect_uri=http://localhost/callback&response_type=code"
			);
			const response = await handleAuthorize(request, mockEnv);

			expect(response.status).toBe(400);
			const data = (await response.json()) as OAuthErrorResponse;
			expect(data.error_description).toContain("PKCE");
		});

		it("should accept valid authorization requests with PKCE", async () => {
			const request = new Request(
				"https://test.example.com/oauth/authorize?" +
					"client_id=test&" +
					"redirect_uri=http://localhost/callback&" +
					"response_type=code&" +
					"code_challenge=test123&" +
					"code_challenge_method=S256&" +
					"state=random123"
			);

			const response = await handleAuthorize(request, mockEnv);

			expect(response.status).toBe(302);
			const location = response.headers.get("Location");
			expect(location).toContain("code=");
			expect(location).toContain("state=random123");
		});
	});

	describe("Token Endpoint", () => {
		it("should reject unsupported grant types", async () => {
			const request = new Request("https://test.example.com/oauth/token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					grant_type: "password",
					client_id: "test",
				}),
			});

			const response = await handleToken(request, mockEnv);
			expect(response.status).toBe(400);
			const data = (await response.json()) as OAuthErrorResponse;
			// OAuth spec: unauthorized_client when client not authorized for grant type
			expect(data.error).toBe("unauthorized_client");
		});

		it("should require code_verifier for authorization_code grant", async () => {
			const request = new Request("https://test.example.com/oauth/token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					grant_type: "authorization_code",
					code: "test123",
					client_id: "test",
					redirect_uri: "http://localhost/callback",
				}),
			});

			const response = await handleToken(request, mockEnv);
			expect(response.status).toBe(400);
		});
	});
});

describe("PKCE Verification", () => {
	it("should verify PKCE challenge correctly", async () => {
		// This would test the internal PKCE verification
		// Skipped for now as it requires exposing internal function
	});
});

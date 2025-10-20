export interface AuthContext {
	authenticated: boolean;
	userId: string;
	authMethod: "oauth" | "api-key";
	scope?: string;
	permissions?: string[];
}

export interface OAuthMetadata {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	grant_types_supported: string[];
	response_types_supported: string[];
	code_challenge_methods_supported: string[];
	token_endpoint_auth_methods_supported: string[];
	// MCP-specific extension for SSE endpoint discovery
	mcp_endpoint?: string;
}

/**
 * OAuth client registration and validation utilities.
 * Stores a whitelist of trusted clients and their allowed redirect URIs.
 */

export interface OAuthClient {
	client_id: string;
	client_secret?: string;
	redirect_uris: string[];
	grant_types: string[];
	is_confidential: boolean;
}

/**
 * Registered OAuth clients.
 * TODO: Move to durable storage so registrations persist across deploys.
 */
const OAUTH_CLIENTS: Record<string, OAuthClient> = {
	"canvas-mcp-client": {
		client_id: "canvas-mcp-client",
		redirect_uris: [
			"http://localhost:3000/callback",
			"http://localhost:3000/oauth/callback",
			"https://localhost:3000/callback",
			"https://localhost:3000/oauth/callback",
		],
		grant_types: ["authorization_code", "refresh_token"],
		is_confidential: false,
	},
};

export function validateClientId(client_id: string | null | undefined): OAuthClient | null {
	if (!client_id) return null;
	return OAUTH_CLIENTS[client_id] ?? null;
}

export function validateRedirectUri(client: OAuthClient, redirect_uri: string): boolean {
	return client.redirect_uris.includes(redirect_uri);
}

export function validateGrantType(client: OAuthClient, grant_type: string | undefined): boolean {
	return !!grant_type && client.grant_types.includes(grant_type);
}

export function validateClientAuthentication(
	client: OAuthClient,
	provided_secret?: string | null
): boolean {
	if (!client.is_confidential) {
		return true;
	}

	if (!client.client_secret || !provided_secret) {
		return false;
	}

	return timingSafeEqual(client.client_secret, provided_secret);
}

function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i += 1) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

export function registerClient(client: OAuthClient): void {
	OAUTH_CLIENTS[client.client_id] = client;
}

export function getAllClients(): OAuthClient[] {
	return Object.values(OAUTH_CLIENTS);
}

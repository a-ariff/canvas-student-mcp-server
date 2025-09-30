import type { Env, UserSession, AuthRequest, AuthResponse } from './types.js';

/**
 * Authentication and Session Management
 */
export class AuthManager {
  constructor(private env: Env) {}

  /**
   * Authenticate user with Canvas API key and create session
   */
  async authenticate(request: AuthRequest): Promise<AuthResponse> {
    try {
      // Validate Canvas URL format
      if (!this.isValidCanvasUrl(request.canvasUrl)) {
        return {
          success: false,
          error: 'Invalid Canvas URL format'
        };
      }

      // Test the API key by making a simple request
      const testResponse = await this.testCanvasApiKey(request.canvasUrl, request.apiKey);

      if (!testResponse.success) {
        return {
          success: false,
          error: 'Invalid Canvas API key or insufficient permissions'
        };
      }

      // Generate user session
      const userId = this.generateUserId(request.canvasUrl, request.apiKey);
      const session: UserSession = {
        userId,
        canvasUrl: request.canvasUrl,
        apiKey: await this.encryptApiKey(request.apiKey),
        institutionName: request.institutionName || this.extractInstitutionName(request.canvasUrl),
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        requestCount: 0
      };

      // Store session (expires in 24 hours)
      await this.storeSession(userId, session);

      return {
        success: true,
        userId,
        session: {
          ...session,
          apiKey: '[ENCRYPTED]' // Don't return the actual key
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Get user session and decrypt API key
   */
  async getSession(userId: string): Promise<UserSession | null> {
    try {
      const sessionData = await this.env.CACHE_KV.get(`session:${userId}`, 'json') as UserSession | null;

      if (!sessionData) return null;

      // Decrypt API key
      sessionData.apiKey = await this.decryptApiKey(sessionData.apiKey);

      // Update last used timestamp
      sessionData.lastUsed = new Date().toISOString();
      await this.storeSession(userId, sessionData);

      return sessionData;
    } catch {
      return null;
    }
  }

  /**
   * Validate admin API key for protected operations
   */
  async validateAdminKey(apiKey: string): Promise<boolean> {
    return apiKey === this.env.ADMIN_API_KEY;
  }

  /**
   * Test Canvas API key validity
   */
  private async testCanvasApiKey(canvasUrl: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${canvasUrl}/api/v1/users/self`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'Canvas-Cloudflare-Proxy/1.0'
        }
      });

      if (response.ok) {
        return { success: true };
      }

      const error = await response.text();
      return {
        success: false,
        error: `Canvas API test failed: ${response.status} ${response.statusText} - ${error}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error testing Canvas API'
      };
    }
  }

  /**
   * Validate Canvas URL format
   */
  private isValidCanvasUrl(url: string): boolean {
    try {
      const parsed = new URL(url);

      // Must be HTTPS
      if (parsed.protocol !== 'https:') return false;

      // Must contain common Canvas domains or be a valid institution domain
      const hostname = parsed.hostname.toLowerCase();
      const validPatterns = [
        /\.instructure\.com$/,
        /canvas\./,
        /lms\./,
        /learn\./,
        /\.edu$/,
        /\.ac\./,
        /\.edu\./
      ];

      return validPatterns.some(pattern => pattern.test(hostname));
    } catch {
      return false;
    }
  }

  /**
   * Extract institution name from Canvas URL
   */
  private extractInstitutionName(url: string): string {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;

      // Extract subdomain or main domain name
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        if (hostname.includes('.instructure.com')) {
          return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        }
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }

      return 'Unknown Institution';
    } catch {
      return 'Unknown Institution';
    }
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(canvasUrl: string, apiKey: string): string {
    // Create a hash-like identifier from Canvas URL and API key
    const data = `${canvasUrl}:${apiKey}`;
    return btoa(data).substring(0, 16);
  }

  /**
   * Store user session
   */
  private async storeSession(userId: string, session: UserSession): Promise<void> {
    const key = `session:${userId}`;
    const ttl = 24 * 60 * 60; // 24 hours

    await this.env.CACHE_KV.put(key, JSON.stringify(session), {
      expirationTtl: ttl
    });
  }

  /**
   * Simple encryption for API keys (using XOR with environment key)
   */
  private async encryptApiKey(apiKey: string): Promise<string> {
    const key = this.env.ENCRYPTION_KEY;
    let encrypted = '';

    for (let i = 0; i < apiKey.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const apiKeyChar = apiKey.charCodeAt(i);
      encrypted += String.fromCharCode(apiKeyChar ^ keyChar);
    }

    return btoa(encrypted);
  }

  /**
   * Decrypt API keys
   */
  private async decryptApiKey(encryptedApiKey: string): Promise<string> {
    try {
      const key = this.env.ENCRYPTION_KEY;
      const encrypted = atob(encryptedApiKey);
      let decrypted = '';

      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const encryptedChar = encrypted.charCodeAt(i);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }

      return decrypted;
    } catch {
      throw new Error('Failed to decrypt API key');
    }
  }

  /**
   * Get all active sessions (admin only)
   */
  async getActiveSessions(): Promise<UserSession[]> {
    // This would require listing KV keys which is not directly supported
    // In practice, you might maintain a separate index of active sessions
    return [];
  }

  /**
   * Revoke session
   */
  async revokeSession(userId: string): Promise<boolean> {
    try {
      await this.env.CACHE_KV.delete(`session:${userId}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up expired sessions (called periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    // KV automatically handles TTL expiration
    return 0;
  }
}
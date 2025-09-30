import type {
  Env,
  ApiRequest,
  ApiResponse,
  CacheEntry,
  UserSession,
  AnalyticsEvent
} from './types.js';

/**
 * Canvas API Proxy - Handles Canvas LMS API requests with caching and rate limiting
 */
export class CanvasProxy {
  constructor(private env: Env) {}

  /**
   * Proxy a Canvas API request
   */
  async proxyRequest(request: ApiRequest, userId: string): Promise<ApiResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      // Check rate limiting
      await this.checkRateLimit(userId);

      // Try cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = await this.getFromCache<any>(cacheKey);

      if (cached) {
        await this.logAnalytics(userId, request, 200, Date.now() - startTime, true);
        return {
          success: true,
          data: cached.data,
          cached: true,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }

      // Make actual Canvas API request
      const canvasResponse = await this.makeCanvasRequest(request);

      if (!canvasResponse.ok) {
        const error = await canvasResponse.text();
        await this.logAnalytics(userId, request, canvasResponse.status, Date.now() - startTime, false);

        return {
          success: false,
          error: `Canvas API Error: ${canvasResponse.status} ${canvasResponse.statusText}`,
          message: error,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }

      const data = await canvasResponse.json();

      // Cache successful responses
      await this.setCache(cacheKey, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (parseInt(this.env.CACHE_TTL_SECONDS) * 1000),
        headers: this.extractHeaders(canvasResponse),
      });

      await this.logAnalytics(userId, request, canvasResponse.status, Date.now() - startTime, false);

      return {
        success: true,
        data,
        cached: false,
        timestamp: new Date().toISOString(),
        requestId,
      };

    } catch (error) {
      await this.logAnalytics(userId, request, 500, Date.now() - startTime, false);

      return {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        requestId,
      };
    }
  }

  /**
   * Make actual Canvas API request
   */
  private async makeCanvasRequest(request: ApiRequest): Promise<Response> {
    const url = `${request.canvasUrl}/api/v1${request.endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${request.apiKey}`,
      'Accept': 'application/json',
      'User-Agent': 'Canvas-Cloudflare-Proxy/1.0',
      ...request.headers,
    };

    if (request.method !== 'GET' && request.body) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== 'GET' && request.body) {
      fetchOptions.body = JSON.stringify(request.body);
    }

    return fetch(url, fetchOptions);
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(userId: string): Promise<void> {
    const key = `rate_limit:${userId}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    const current = await this.env.RATE_LIMIT_KV.get(key, 'json') as {
      count: number;
      windowStart: number;
    } | null;

    const maxRequests = parseInt(this.env.MAX_REQUESTS_PER_MINUTE);

    if (!current || (now - current.windowStart) > windowMs) {
      // New window
      await this.env.RATE_LIMIT_KV.put(key, JSON.stringify({
        count: 1,
        windowStart: now,
      }), { expirationTtl: 120 }); // 2 minute expiration
      return;
    }

    if (current.count >= maxRequests) {
      throw new Error(`Rate limit exceeded. Maximum ${maxRequests} requests per minute.`);
    }

    // Increment counter
    await this.env.RATE_LIMIT_KV.put(key, JSON.stringify({
      count: current.count + 1,
      windowStart: current.windowStart,
    }), { expirationTtl: 120 });
  }

  /**
   * Cache management
   */
  private async getFromCache<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const cached = await this.env.CACHE_KV.get(key, 'json') as CacheEntry<T> | null;

      if (!cached) return null;

      // Check expiration
      if (Date.now() > cached.expiresAt) {
        await this.env.CACHE_KV.delete(key);
        return null;
      }

      return cached;
    } catch {
      return null;
    }
  }

  private async setCache<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    try {
      const ttl = Math.max(60, parseInt(this.env.CACHE_TTL_SECONDS)); // Minimum 1 minute
      await this.env.CACHE_KV.put(key, JSON.stringify(entry), {
        expirationTtl: ttl
      });
    } catch (error) {
      console.warn('Cache write failed:', error);
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(request: ApiRequest): string {
    const keyParts = [
      request.canvasUrl,
      request.method,
      request.endpoint,
      request.body ? JSON.stringify(request.body) : '',
    ];

    // Create hash-like key (simplified)
    const key = keyParts.join('|');
    return `canvas_cache:${btoa(key).substring(0, 50)}`;
  }

  /**
   * Analytics logging
   */
  private async logAnalytics(
    userId: string,
    request: ApiRequest,
    statusCode: number,
    responseTime: number,
    cached: boolean
  ): Promise<void> {
    try {
      if (!this.env.ANALYTICS) return;

      // Write to Analytics Engine (Cloudflare Analytics Engine format)
      this.env.ANALYTICS.writeDataPoint({
        blobs: [userId, request.endpoint, request.method],
        doubles: [responseTime, statusCode],
        indexes: [cached ? 'cached' : 'fresh'],
      });
    } catch (error) {
      console.warn('Analytics logging failed:', error);
    }
  }

  /**
   * Utility methods
   */
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};

    // Extract useful headers
    const headerNames = [
      'x-rate-limit-remaining',
      'x-rate-limit-limit',
      'x-request-cost',
      'link',
    ];

    headerNames.forEach(name => {
      const value = response.headers.get(name);
      if (value) {
        headers[name] = value;
      }
    });

    return headers;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: this.env.ENVIRONMENT,
      },
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
    };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<ApiResponse> {
    try {
      // This is a simplified version - in practice you might want to track these separately
      return {
        success: true,
        data: {
          cacheEnabled: true,
          ttlSeconds: parseInt(this.env.CACHE_TTL_SECONDS),
          message: 'Cache statistics available via Cloudflare dashboard',
        },
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get cache statistics',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    }
  }
}
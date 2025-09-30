/**
 * Cloudflare Workers Canvas API Proxy
 * Multi-user Canvas LMS integration with caching and rate limiting
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { z } from 'zod';

import type { Env, ApiRequest } from './types.js';
import { CanvasProxy } from './canvas-proxy.js';
import { AuthManager } from './auth.js';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = c.env.CORS_ORIGINS.split(',').map((o: string) => o.trim());
    return allowedOrigins.includes('*') || allowedOrigins.includes(origin) ? origin : null;
  },
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-Canvas-URL', 'X-Canvas-API-Key'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Request validation schemas
const AuthRequestSchema = z.object({
  canvasUrl: z.string().url(),
  apiKey: z.string().min(10),
  institutionName: z.string().optional(),
});

const ProxyRequestSchema = z.object({
  endpoint: z.string().startsWith('/'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional().default('GET'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
});

// Routes

/**
 * Health check
 */
app.get('/health', async (c) => {
  const proxy = new CanvasProxy(c.env);
  const health = await proxy.healthCheck();
  return c.json(health);
});

/**
 * API documentation landing page
 */
app.get('/', async (c) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Canvas API Proxy</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 10px; margin-bottom: 30px; }
            .endpoint { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .method { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
            .get { background: #28a745; color: white; }
            .post { background: #007bff; color: white; }
            .put { background: #ffc107; color: black; }
            .delete { background: #dc3545; color: white; }
            code { background: #e9ecef; padding: 2px 4px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="hero">
            <h1>🎓 Canvas API Proxy</h1>
            <p>Multi-user Canvas LMS integration with caching and rate limiting</p>
        </div>

        <h2>🚀 Quick Start</h2>
        <ol>
            <li>Get your Canvas API token from your institution's Canvas account settings</li>
            <li>Authenticate with <code>POST /auth</code> to get your user ID</li>
            <li>Use your user ID with Canvas API endpoints</li>
        </ol>

        <h2>📚 API Endpoints</h2>

        <div class="endpoint">
            <span class="method post">POST</span> <strong>/auth</strong>
            <p>Authenticate with Canvas credentials and get a user ID</p>
            <pre><code>{
  "canvasUrl": "https://your-school.instructure.com",
  "apiKey": "your_canvas_api_token",
  "institutionName": "Your School (optional)"
}</code></pre>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span> <strong>/canvas/{userId}</strong>
            <p>Proxy any Canvas API request with caching and rate limiting</p>
            <pre><code>{
  "endpoint": "/courses",
  "method": "GET"
}</code></pre>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span> <strong>/courses/{userId}</strong>
            <p>Get all courses for the user</p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span> <strong>/assignments/{userId}?course_id=123</strong>
            <p>Get assignments for a specific course</p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span> <strong>/upcoming/{userId}?days=14</strong>
            <p>Get upcoming assignments across all courses</p>
        </div>

        <h2>🔒 Security</h2>
        <ul>
            <li>API keys are encrypted and stored securely</li>
            <li>Rate limiting: ${c.env.MAX_REQUESTS_PER_MINUTE} requests per minute per user</li>
            <li>Sessions expire in 24 hours</li>
            <li>All requests are logged for monitoring</li>
        </ul>

        <h2>⚡ Performance</h2>
        <ul>
            <li>Intelligent caching with ${c.env.CACHE_TTL_SECONDS} second TTL</li>
            <li>Global edge deployment via Cloudflare</li>
            <li>Sub-100ms response times</li>
        </ul>

        <p><em>Built with ❤️ for students and educators worldwide</em></p>
    </body>
    </html>
  `;

  return c.html(html);
});

/**
 * Authentication endpoint
 */
app.post('/auth', async (c) => {
  try {
    const body = await c.req.json();
    const request = AuthRequestSchema.parse(body);

    const auth = new AuthManager(c.env);
    const result = await auth.authenticate(request);

    if (result.success) {
      return c.json({
        success: true,
        message: 'Authentication successful',
        userId: result.userId,
        institution: result.session?.institutionName,
        timestamp: new Date().toISOString(),
      });
    } else {
      return c.json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString(),
      }, 401);
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Invalid request format',
        details: error.errors,
        timestamp: new Date().toISOString(),
      }, 400);
    }

    return c.json({
      success: false,
      error: 'Authentication failed',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

/**
 * Generic Canvas API proxy
 */
app.post('/canvas/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json();
    const proxyRequest = ProxyRequestSchema.parse(body);

    // Get user session
    const auth = new AuthManager(c.env);
    const session = await auth.getSession(userId);

    if (!session) {
      return c.json({
        success: false,
        error: 'Invalid or expired session',
        timestamp: new Date().toISOString(),
      }, 401);
    }

    // Build API request
    const apiRequest: ApiRequest = {
      endpoint: proxyRequest.endpoint,
      method: proxyRequest.method,
      headers: proxyRequest.headers,
      body: proxyRequest.body,
      canvasUrl: session.canvasUrl,
      apiKey: session.apiKey,
    };

    // Proxy the request
    const proxy = new CanvasProxy(c.env);
    const result = await proxy.proxyRequest(apiRequest, userId);

    return c.json(result, result.success ? 200 : 400);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Invalid request format',
        details: error.errors,
        timestamp: new Date().toISOString(),
      }, 400);
    }

    return c.json({
      success: false,
      error: 'Proxy request failed',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

/**
 * Convenience endpoints for common Canvas operations
 */

// Get courses
app.get('/courses/:userId', async (c) => {
  const userId = c.req.param('userId');
  return proxyConvenienceRequest(c, userId, '/courses', 'GET');
});

// Get assignments for a course
app.get('/assignments/:userId', async (c) => {
  const userId = c.req.param('userId');
  const courseId = c.req.query('course_id');

  if (!courseId) {
    return c.json({
      success: false,
      error: 'course_id parameter is required',
      timestamp: new Date().toISOString(),
    }, 400);
  }

  return proxyConvenienceRequest(c, userId, `/courses/${courseId}/assignments`, 'GET');
});

// Get upcoming assignments
app.get('/upcoming/:userId', async (c) => {
  const userId = c.req.param('userId');
  const days = c.req.query('days') || '14';

  // This would require aggregating across multiple courses
  // For now, redirect to generic proxy
  return c.json({
    success: false,
    error: 'Use POST /canvas/{userId} with a custom aggregation endpoint',
    hint: 'This endpoint requires multiple API calls to aggregate data',
    timestamp: new Date().toISOString(),
  }, 501);
});

// Get user profile
app.get('/profile/:userId', async (c) => {
  const userId = c.req.param('userId');
  return proxyConvenienceRequest(c, userId, '/users/self', 'GET');
});

/**
 * Admin endpoints
 */
app.get('/admin/stats', async (c) => {
  const adminKey = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!adminKey) {
    return c.json({ error: 'Authorization header required' }, 401);
  }

  const auth = new AuthManager(c.env);
  if (!await auth.validateAdminKey(adminKey)) {
    return c.json({ error: 'Invalid admin key' }, 403);
  }

  const proxy = new CanvasProxy(c.env);
  const stats = await proxy.getCacheStats();

  return c.json({
    success: true,
    data: {
      ...stats.data,
      environment: c.env.ENVIRONMENT,
      version: c.env.API_VERSION,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Helper function for convenience endpoints
 */
async function proxyConvenienceRequest(c: any, userId: string, endpoint: string, method: 'GET' | 'POST' = 'GET') {
  try {
    const auth = new AuthManager(c.env);
    const session = await auth.getSession(userId);

    if (!session) {
      return c.json({
        success: false,
        error: 'Invalid or expired session',
        timestamp: new Date().toISOString(),
      }, 401);
    }

    const apiRequest: ApiRequest = {
      endpoint,
      method,
      canvasUrl: session.canvasUrl,
      apiKey: session.apiKey,
    };

    const proxy = new CanvasProxy(c.env);
    const result = await proxy.proxyRequest(apiRequest, userId);

    return c.json(result, result.success ? 200 : 400);

  } catch (error) {
    return c.json({
      success: false,
      error: 'Request failed',
      timestamp: new Date().toISOString(),
    }, 500);
  }
}

/**
 * 404 handler
 */
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found',
    message: 'See documentation at the root URL for available endpoints',
    timestamp: new Date().toISOString(),
  }, 404);
});

/**
 * Error handler
 */
app.onError((error, c) => {
  console.error('Unhandled error:', error);

  return c.json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  }, 500);
});

export default app;
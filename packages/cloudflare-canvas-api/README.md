# Canvas API Proxy - Cloudflare Workers

Multi-user Canvas LMS integration with caching, rate limiting, and global edge deployment. Deploy this to your own domain and let anyone integrate with Canvas through a simple REST API.

**Live Demo**: <https://canvas-mcp.ariff.dev/>

## 🌟 Features

- **🌍 Global Edge Deployment** - Sub-100ms response times worldwide
- **🔒 Secure Multi-User Support** - Encrypted API key storage for unlimited users
- **⚡ Smart Caching** - Intelligent Canvas API response caching
- **🛡️ Rate Limiting** - Built-in protection against API abuse (100 req/min per user)
- **📊 Analytics** - Request monitoring and usage statistics
- **🔧 Easy Integration** - Simple REST API for any programming language

## 📚 API Reference

Base URL: `https://canvas-mcp.ariff.dev`

### 1. Authentication

Register your Canvas credentials and get a user ID.

**Endpoint**: `POST /auth`

**Request**:

```bash
curl -X POST https://canvas-mcp.ariff.dev/auth \
  -H "Content-Type: application/json" \
  -d '{
    "canvasUrl": "https://your-institution.instructure.com",
    "apiKey": "YOUR_CANVAS_API_TOKEN",
    "institutionName": "Your Institution"
  }'
```

**Response**:

```json
{
  "success": true,
  "userId": "user_abc123xyz",
  "message": "Authentication successful"
}
```

**Save your `userId`** - you'll need it for all subsequent requests.

---

### 2. Generic Canvas API Proxy

Access any Canvas API endpoint through the proxy.

**Endpoint**: `POST /canvas/{userId}`

**Request**:

```bash
curl -X POST https://canvas-mcp.ariff.dev/canvas/user_abc123xyz \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/v1/courses",
    "method": "GET",
    "params": {
      "enrollment_state": "active",
      "per_page": 10
    }
  }'
```

**Response**: Returns Canvas API response directly.

---

### 3. Get User Courses

Retrieve all active courses for the authenticated user.

**Endpoint**: `GET /courses/{userId}`

**Request**:

```bash
curl https://canvas-mcp.ariff.dev/courses/user_abc123xyz
```

**Query Parameters**:

- `enrollment_state` (optional): `active`, `completed`, `invited`, `rejected`. Default: `active`
- `per_page` (optional): Results per page (1-100). Default: 20
- `page` (optional): Page number for pagination

**Response**:

```json
{
  "data": [
    {
      "id": 123456,
      "name": "Web Development 101",
      "course_code": "WEB101",
      "enrollment_term_id": 789,
      "start_at": "2025-01-15T00:00:00Z",
      "end_at": "2025-05-30T23:59:59Z"
    }
  ],
  "meta": {
    "cached": false,
    "page": 1,
    "per_page": 20
  }
}
```

---

### 4. Get Course Assignments

Retrieve assignments for a specific course.

**Endpoint**: `GET /assignments/{userId}`

**Request**:

```bash
curl "https://canvas-mcp.ariff.dev/assignments/user_abc123xyz?course_id=123456"
```

**Query Parameters** (required):

- `course_id`: Canvas course ID

**Optional Parameters**:

- `include[]`: Additional data (e.g., `submission`, `rubric`, `due_at`)
- `per_page`: Results per page (1-100). Default: 20
- `page`: Page number

**Response**:

```json
{
  "data": [
    {
      "id": 789012,
      "name": "Build a REST API",
      "description": "<p>Create a RESTful API using Node.js...</p>",
      "due_at": "2025-03-15T23:59:00Z",
      "points_possible": 100,
      "submission_types": ["online_upload"],
      "has_submitted_submissions": true
    }
  ],
  "meta": {
    "cached": true,
    "course_id": 123456
  }
}
```

---

### 5. Get Upcoming Events

Retrieve upcoming assignments, events, and calendar items.

**Endpoint**: `GET /upcoming/{userId}`

**Request**:

```bash
curl https://canvas-mcp.ariff.dev/upcoming/user_abc123xyz
```

**Response**:

```json
{
  "data": [
    {
      "type": "assignment",
      "id": 789012,
      "title": "Build a REST API",
      "start_at": "2025-03-15T23:59:00Z",
      "end_at": "2025-03-15T23:59:00Z",
      "context_name": "Web Development 101"
    }
  ],
  "meta": {
    "cached": true,
    "count": 5
  }
}
```

---

### 6. Health Check

Check API status and configuration.

**Endpoint**: `GET /health`

**Request**:

```bash
curl https://canvas-mcp.ariff.dev/health
```

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-01T12:34:56.789Z",
  "environment": "production",
  "version": "2.0.0",
  "features": {
    "caching": true,
    "rateLimiting": true,
    "analytics": true
  }
}
```

---

## 🔧 Configuration

### Rate Limiting

- **Default**: 100 requests per minute per user
- **Algorithm**: Token bucket with automatic refill
- **Headers**: Rate limit info returned in response headers

  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1696161600
  ```

### Caching

- **Default TTL**: 300 seconds (5 minutes)
- **Strategy**: Two-tier (in-memory + Cloudflare KV)
- **Cache Headers**: `X-Cache: HIT` or `X-Cache: MISS`

### Pagination

All list endpoints support pagination:

**Request**:

```bash
curl "https://canvas-mcp.ariff.dev/courses/user_abc123xyz?page=2&per_page=50"
```

**Response Headers**:

```
Link: <https://canvas-mcp.ariff.dev/courses/user_abc123xyz?page=3&per_page=50>; rel="next",
      <https://canvas-mcp.ariff.dev/courses/user_abc123xyz?page=1&per_page=50>; rel="first"
```

---

## 🚀 Deployment Guide

### Prerequisites

- Cloudflare account
- Domain registered with Cloudflare
- Node.js 18+
- Wrangler CLI

### 1. Clone and Install

```bash
git clone https://github.com/a-ariff/canvas-student-mcp-server.git
cd canvas-student-mcp-server/packages/cloudflare-canvas-api
npm install
npm install -g wrangler
wrangler login
```

### 2. Create KV Namespaces

```bash
# Create caching namespace
wrangler kv:namespace create "CACHE_KV"
wrangler kv:namespace create "CACHE_KV" --preview

# Create rate limiting namespace
wrangler kv:namespace create "RATE_LIMIT_KV"
wrangler kv:namespace create "RATE_LIMIT_KV" --preview

# Copy the namespace IDs into wrangler.toml
```

### 3. Configure Secrets

```bash
# Set encryption key for API key storage
wrangler secret put ENCRYPTION_KEY
# Enter a strong random key (e.g., generate with: openssl rand -hex 32)

# Set admin API key (optional, for protected operations)
wrangler secret put ADMIN_API_KEY
# Enter a strong random key
```

### 4. Update Configuration

Edit `wrangler.toml`:

```toml
name = "canvas-api"
main = "src/index.ts"
compatibility_date = "2023-12-01"

[vars]
ENVIRONMENT = "production"
MAX_REQUESTS_PER_MINUTE = 100
CACHE_TTL_SECONDS = 300

[[kv_namespaces]]
binding = "CACHE_KV"
id = "your_cache_namespace_id"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your_rate_limit_namespace_id"

[route]
pattern = "canvas-api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### 5. Deploy

```bash
# Build and deploy
npm run build
npm run deploy

# Your API will be live at:
# https://canvas-api.yourdomain.com
```

### 6. DNS Configuration

Add CNAME record in Cloudflare DNS:

```
Type: CNAME
Name: canvas-api
Target: your-worker-name.your-subdomain.workers.dev
Proxy status: Proxied (orange cloud)
```

---

## 💻 Local Development

### Start Development Server

```bash
npm run dev
```

API available at: `http://localhost:8787`

### Test Locally

```bash
# Test authentication
curl -X POST http://localhost:8787/auth \
  -H "Content-Type: application/json" \
  -d '{
    "canvasUrl": "https://your-institution.instructure.com",
    "apiKey": "your_token",
    "institutionName": "Test"
  }'

# Test health check
curl http://localhost:8787/health
```

### Docker Setup

**Build and run**:

```bash
cd /path/to/canvas-student-mcp-server/packages/canvas-student-mcp-server
docker build -t canvas-mcp-server .
docker run -e CANVAS_API_KEY=your_token \
  -e CANVAS_BASE_URL=https://canvas.instructure.com \
  canvas-mcp-server
```

**Using Docker Compose**:

```bash
# Create .env file with your credentials
echo "CANVAS_API_KEY=your_token" > .env
echo "CANVAS_BASE_URL=https://canvas.instructure.com" >> .env

# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

---

## 🔒 Security

### API Key Encryption

- Canvas API keys encrypted using XOR cipher with `ENCRYPTION_KEY`
- Keys never stored in plaintext
- User sessions expire after 24 hours

### Rate Limiting

- 100 requests/minute per user by default
- Prevents API abuse
- Automatic cleanup of expired tokens

### CORS

- Configurable allowed origins
- Default: `*` (configure for production use)

### Admin Operations

- Protected endpoints require `ADMIN_API_KEY` header
- Access to system statistics and monitoring

---

## 📊 Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check request body format |
| 401 | Unauthorized | Verify Canvas API token |
| 404 | Not Found | Check endpoint path and user ID |
| 429 | Rate Limited | Wait 60 seconds and retry |
| 500 | Server Error | Check Canvas API status |
| 502 | Bad Gateway | Canvas API unreachable |

**Error Response Format**:

```json
{
  "error": "Rate limit exceeded",
  "code": 429,
  "message": "You have exceeded 100 requests per minute. Please wait.",
  "retryAfter": 45
}
```

---

## 🌍 Use Cases

### For Students

- Personal Canvas dashboards
- Assignment tracking apps
- Integration with productivity tools (Notion, Todoist)
- Mobile app development

### For Educators

- Custom grading interfaces
- Student progress analytics
- Assignment distribution automation
- Attendance tracking systems

### For Developers

- Canvas LMS integrations
- Educational app development
- Learning analytics platforms
- Third-party tool connections

### For Institutions

- Custom Canvas extensions
- Data migration tools
- Reporting dashboards
- Multi-user API access management

---

## 🚀 Advanced Features

### Intelligent Caching

- Endpoint-specific TTL
- Automatic cache invalidation
- Global edge caching via Cloudflare KV
- Cache status in response headers

### Performance Optimization

- Deployed across 300+ Cloudflare edge locations
- Sub-100ms response times globally
- Automatic request deduplication
- Connection pooling

### Monitoring & Analytics

- All requests logged to Cloudflare Analytics Engine
- Geographic distribution tracking
- Response time monitoring
- Cache hit/miss ratios

---

## 🆘 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions to common issues.

**Quick fixes**:

- **Authentication fails**: Verify Canvas API token hasn't expired
- **Rate limited**: Wait 60 seconds between bursts
- **Caching issues**: Check `CACHE_TTL_SECONDS` in wrangler.toml
- **CORS errors**: Update `CORS_ORIGINS` environment variable

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "add amazing feature"`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Hono](https://hono.dev/) framework
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
- Canvas LMS API integration
- Inspired by the need for accessible Canvas automation

---

**Deploy once, serve everyone! 🚀**

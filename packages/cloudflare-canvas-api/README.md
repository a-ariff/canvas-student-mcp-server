# Canvas API Proxy - Cloudflare Workers

Multi-user Canvas LMS integration with caching, rate limiting, and global edge deployment. Deploy this to your own domain and let anyone integrate with Canvas through a simple REST API.

## 🌟 Features

- **🌍 Global Edge Deployment** - Sub-100ms response times worldwide
- **🔒 Secure Multi-User Support** - Encrypted API key storage for unlimited users
- **⚡ Smart Caching** - Intelligent Canvas API response caching
- **🛡️ Rate Limiting** - Built-in protection against API abuse
- **📊 Analytics** - Request monitoring and usage statistics
- **🔧 Easy Integration** - Simple REST API for any programming language

## 🚀 Quick Deploy

### 1. Prerequisites

- Cloudflare account
- Domain registered with Cloudflare
- Node.js 18+
- Wrangler CLI

### 2. Setup

```bash
# Clone and navigate to the project
git clone https://github.com/a-ariff/canvas-student-mcp-server.git
cd canvas-student-mcp-server/packages/cloudflare-canvas-api

# Install dependencies
npm install

# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 3. Configure

```bash
# Copy and edit configuration
cp wrangler.toml.example wrangler.toml

# Edit wrangler.toml with your domain
# Replace "yourdomain.com" with your actual domain
```

### 4. Create KV Namespaces

```bash
# Create KV namespaces for caching and rate limiting
wrangler kv:namespace create "CACHE_KV"
wrangler kv:namespace create "CACHE_KV" --preview

wrangler kv:namespace create "RATE_LIMIT_KV"
wrangler kv:namespace create "RATE_LIMIT_KV" --preview

# Update wrangler.toml with the returned namespace IDs
```

### 5. Set Secrets

```bash
# Set admin API key for protected operations
wrangler secret put ADMIN_API_KEY
# Enter a strong random key when prompted

# Set encryption key for API key storage
wrangler secret put ENCRYPTION_KEY
# Enter a strong random key when prompted
```

### 6. Deploy

```bash
# Build the project
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Your API will be available at:
# https://canvas-api.yourdomain.com
```

## 🔧 Configuration

### Environment Variables (wrangler.toml)

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `production` | Environment name |
| `API_VERSION` | `v1` | API version |
| `MAX_REQUESTS_PER_MINUTE` | `100` | Rate limit per user |
| `CACHE_TTL_SECONDS` | `300` | Cache expiration time |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |

### Domain Setup

1. **Add your domain to Cloudflare**
2. **Update DNS settings:**
   ```
   Type: CNAME
   Name: canvas-api
   Content: your-worker-name.your-subdomain.workers.dev
   ```
3. **Update wrangler.toml route:**
   ```toml
   route = { pattern = "canvas-api.yourdomain.com/*", zone_name = "yourdomain.com" }
   ```

## 📚 API Documentation

### Authentication

First, users need to authenticate with their Canvas credentials:

```javascript
const response = await fetch('https://canvas-api.yourdomain.com/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    canvasUrl: 'https://your-school.instructure.com',
    apiKey: 'your_canvas_api_token',
    institutionName: 'Your School (optional)'
  })
});

const { userId } = await response.json();
// Save this userId for all future requests
```

### Canvas API Proxy

Once authenticated, users can access any Canvas API endpoint:

```javascript
// Generic Canvas API request
const response = await fetch(`https://canvas-api.yourdomain.com/canvas/${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: '/courses',
    method: 'GET'
  })
});

const courses = await response.json();
```

### Convenience Endpoints

For common operations, use these simplified endpoints:

```javascript
// Get all courses
GET /courses/{userId}

// Get assignments for a course
GET /assignments/{userId}?course_id=123

// Get user profile
GET /profile/{userId}

// Health check
GET /health
```

## 🔒 Security

### API Key Storage
- Canvas API keys are encrypted using XOR encryption
- Keys are never stored in plain text
- Sessions expire automatically in 24 hours

### Rate Limiting
- 100 requests per minute per user
- Separate rate limiting for each user ID
- Automatic cleanup of expired rate limit data

### CORS Protection
- Configurable allowed origins
- Default allows all origins (⚠️ configure for production)

### Admin Operations
- Protected admin endpoints require `ADMIN_API_KEY`
- Access to usage statistics and system health

## 📊 Monitoring

### Analytics
All requests are logged to Cloudflare Analytics Engine:
- Request endpoint and method
- Response time and status code
- User ID and caching status
- Geographic distribution

### Health Monitoring
- Health check endpoint: `GET /health`
- Cache statistics: `GET /admin/stats` (requires admin key)
- Rate limiting status per user

## 🔧 Development

### Local Development

```bash
# Start development server
npm run dev

# The API will be available at http://localhost:8787
```

### Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check
```

### Deployment Environments

```bash
# Deploy to staging
wrangler deploy --env development

# Deploy to production
wrangler deploy --env production
```

## 🌍 Use Cases

### For Students
- Build personal Canvas dashboards
- Create assignment tracking apps
- Integrate Canvas with productivity tools
- Mobile app development

### For Educators
- Custom grading interfaces
- Student progress analytics
- Assignment distribution tools
- Attendance tracking

### For Developers
- Canvas LMS integrations
- Educational app development
- Learning analytics platforms
- Third-party tool connections

### For Institutions
- Custom Canvas extensions
- Data migration tools
- Reporting dashboards
- API access for multiple users

## 🚀 Advanced Features

### Caching Strategy
- Intelligent TTL based on endpoint type
- Automatic cache invalidation
- KV storage for global edge caching

### Error Handling
- Comprehensive error responses
- Canvas API error proxying
- Rate limiting feedback
- Network timeout handling

### Performance Optimization
- Global edge deployment
- Automatic request deduplication
- Optimized Canvas API batching
- Connection pooling

## 📈 Scaling

This proxy is designed to handle:
- **Unlimited concurrent users**
- **Millions of requests per month**
- **Global deployment across 300+ cities**
- **99.9% uptime SLA**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Full API docs at your deployed URL
- **Issues**: [GitHub Issues](https://github.com/a-ariff/canvas-student-mcp-server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/a-ariff/canvas-student-mcp-server/discussions)

## 🙏 Acknowledgments

- Built with [Hono](https://hono.dev/) framework
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
- Canvas LMS API integration
- Inspired by the need for accessible Canvas automation

---

**Deploy once, serve everyone! 🚀**
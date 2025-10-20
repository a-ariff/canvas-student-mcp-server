# General Integration Guide

Complete guide for integrating Canvas Student MCP Server with any MCP-compatible client or custom application.

## 🚀 Overview

This guide covers:

- Understanding MCP (Model Context Protocol)
- Connecting any MCP client to Canvas MCP Server
- OAuth 2.1 authentication flow
- REST API integration for non-MCP clients
- Building custom integrations

## 📋 What is MCP?

**Model Context Protocol (MCP)** is an open standard that enables AI assistants to securely access external data sources and tools.

### Key Concepts

- **Transport**: How clients connect (SSE, HTTP, WebSocket)
- **Tools**: Functions the server exposes (e.g., `get_courses`, `get_assignments`)
- **Resources**: Data sources the server can access (Canvas LMS)
- **Authentication**: OAuth 2.1 with PKCE for secure access

### MCP Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   MCP Client    │  SSE    │   MCP Server     │  HTTPS  │  Canvas LMS │
│ (Claude, etc.)  │────────▶│ (Cloudflare)     │────────▶│    API      │
└─────────────────┘         └──────────────────┘         └─────────────┘
       │                             │
       │        OAuth 2.1            │
       └─────────────────────────────┘
```

## 🔧 Integration Methods

### Method 1: MCP Protocol (SSE)

**Best for:** Claude Desktop, MCP-native clients

**Endpoint:** `https://canvas-mcp-sse.ariff.dev/sse`

**Transport:** Server-Sent Events (SSE)

**Authentication:** OAuth 2.1 with PKCE

#### Configuration

```json
{
  "mcpServers": {
    "canvas": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/client-oauth2",
        "https://canvas-mcp-sse.ariff.dev/sse"
      ]
    }
  }
}
```

See specific guides:

- [Claude Desktop Setup](./CLAUDE_DESKTOP_SETUP.md)

### Method 2: REST API

**Best for:** ChatGPT, custom apps, webhooks

**Base URL:** `https://canvas-mcp-sse.ariff.dev/api/v1`

**Transport:** HTTPS REST

**Authentication:** OAuth 2.1 (no PKCE required)

#### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/canvas/config` | POST | Save Canvas credentials |
| `/canvas/courses` | GET | List all courses |
| `/canvas/courses/:id/assignments` | GET | Get course assignments |
| `/canvas/assignments/upcoming` | GET | Get upcoming assignments |

See specific guides:

- [ChatGPT Setup](./CHATGPT_SETUP.md)
- [Perplexity Setup](./PERPLEXITY_SETUP.md)

### Method 3: Direct Canvas API Proxy

**Best for:** Self-hosted apps, advanced integrations

**Base URL:** `https://canvas-mcp.ariff.dev/proxy/:userId`

**Transport:** HTTPS REST (proxied to Canvas)

**Authentication:** API key + User ID

#### Example

```bash
# Authenticate and get user ID
curl -X POST https://canvas-mcp.ariff.dev/auth \
  -H "Content-Type: application/json" \
  -d '{
    "canvasBaseUrl": "https://canvas.instructure.com",
    "canvasApiKey": "YOUR_CANVAS_TOKEN"
  }'

# Use the returned user_id
curl https://canvas-mcp.ariff.dev/proxy/YOUR_USER_ID/courses
```

## 🔐 Authentication

### OAuth 2.1 Flow (Recommended)

Our server implements full OAuth 2.1 with PKCE support.

#### Step 1: Discovery

Fetch OAuth configuration:

```bash
curl https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server
```

Response:

```json
{
  "issuer": "https://canvas-mcp-sse.ariff.dev",
  "authorization_endpoint": "https://canvas-mcp-sse.ariff.dev/oauth/authorize",
  "token_endpoint": "https://canvas-mcp-sse.ariff.dev/oauth/token",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code"],
  "code_challenge_methods_supported": ["S256"]
}
```

#### Step 2: Authorization Request

```
GET https://canvas-mcp-sse.ariff.dev/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  response_type=code&
  redirect_uri=YOUR_CALLBACK_URL&
  state=RANDOM_STATE&
  code_challenge=PKCE_CHALLENGE&
  code_challenge_method=S256
```

Parameters:

- `client_id`: Your registered client ID
- `redirect_uri`: Your callback URL (must be whitelisted)
- `state`: Random string for CSRF protection
- `code_challenge`: SHA-256 hash of `code_verifier` (PKCE)
- `code_challenge_method`: Always `S256`

#### Step 3: Handle Callback

User authorizes → redirected to:

```
YOUR_CALLBACK_URL?code=AUTH_CODE&state=RANDOM_STATE
```

Verify `state` matches your original value.

#### Step 4: Exchange Code for Token

```bash
curl -X POST https://canvas-mcp-sse.ariff.dev/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "redirect_uri=YOUR_CALLBACK_URL" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "code_verifier=PKCE_VERIFIER"
```

Response:

```json
{
  "access_token": "mcp_at_...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "scope": ""
}
```

#### Step 5: Use Access Token

```bash
curl https://canvas-mcp-sse.ariff.dev/api/v1/canvas/courses \
  -H "Authorization: Bearer mcp_at_..."
```

### PKCE Implementation

**Generate Code Verifier:**

```javascript
const crypto = require('crypto');
const codeVerifier = crypto.randomBytes(32).toString('base64url');
```

**Generate Code Challenge:**

```javascript
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');
```

**Python Example:**

```python
import secrets
import hashlib
import base64

# Generate verifier
code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')

# Generate challenge
code_challenge = base64.urlsafe_b64encode(
    hashlib.sha256(code_verifier.encode('utf-8')).digest()
).decode('utf-8').rstrip('=')
```

## 🛠️ Building Custom Integrations

### Example 1: Node.js MCP Client

```javascript
const { EventSource } = require('eventsource');

// Connect to MCP SSE endpoint
const sse = new EventSource('https://canvas-mcp-sse.ariff.dev/sse', {
  headers: {
    'Authorization': 'Bearer YOUR_OAUTH_TOKEN'
  }
});

// Handle messages
sse.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  // Handle tool responses
  if (data.type === 'tool_response') {
    console.log('Canvas data:', data.content);
  }
};

// Call a tool
sse.send(JSON.stringify({
  jsonrpc: '2.0',
  method: 'tools/call',
  params: {
    name: 'get_courses',
    arguments: {}
  },
  id: 1
}));
```

### Example 2: Python REST Client

```python
import requests

class CanvasMCPClient:
    def __init__(self, oauth_token):
        self.base_url = 'https://canvas-mcp-sse.ariff.dev/api/v1'
        self.headers = {'Authorization': f'Bearer {oauth_token}'}
    
    def save_config(self, canvas_url, canvas_token):
        """Save Canvas credentials"""
        response = requests.post(
            f'{self.base_url}/canvas/config',
            headers=self.headers,
            json={
                'canvasBaseUrl': canvas_url,
                'canvasApiKey': canvas_token
            }
        )
        return response.json()
    
    def get_courses(self):
        """Get all courses"""
        response = requests.get(
            f'{self.base_url}/canvas/courses',
            headers=self.headers
        )
        return response.json()
    
    def get_assignments(self, course_id):
        """Get assignments for a course"""
        response = requests.get(
            f'{self.base_url}/canvas/courses/{course_id}/assignments',
            headers=self.headers
        )
        return response.json()
    
    def get_upcoming(self):
        """Get upcoming assignments"""
        response = requests.get(
            f'{self.base_url}/canvas/assignments/upcoming',
            headers=self.headers
        )
        return response.json()

# Usage
client = CanvasMCPClient('YOUR_OAUTH_TOKEN')
client.save_config('https://canvas.instructure.com', 'YOUR_CANVAS_TOKEN')
courses = client.get_courses()
print(f'Found {len(courses)} courses')
```

### Example 3: Webhook Integration

```javascript
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Webhook endpoint that receives Canvas data requests
app.post('/webhook/canvas', async (req, res) => {
  const { action, params, oauth_token } = req.body;
  
  try {
    let result;
    
    switch (action) {
      case 'get_courses':
        result = await axios.get(
          'https://canvas-mcp-sse.ariff.dev/api/v1/canvas/courses',
          { headers: { Authorization: `Bearer ${oauth_token}` } }
        );
        break;
      
      case 'get_upcoming':
        result = await axios.get(
          'https://canvas-mcp-sse.ariff.dev/api/v1/canvas/assignments/upcoming',
          { headers: { Authorization: `Bearer ${oauth_token}` } }
        );
        break;
      
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
    
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));
```

## 📊 Available Tools

The MCP server exposes 12 Canvas tools:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `get_courses` | List all courses | None |
| `get_course_modules` | Get course modules | `course_id` |
| `get_assignments` | Get course assignments | `course_id` |
| `get_assignment_details` | Get specific assignment | `course_id`, `assignment_id` |
| `get_grades` | Get course grades | `course_id` |
| `get_upcoming_assignments` | Get upcoming assignments | None |
| `get_todos` | Get todo items | None |
| `get_calendar_events` | Get calendar events | `start_date`, `end_date` |
| `get_announcements` | Get announcements | `course_id` |
| `get_discussions` | Get discussions | `course_id` |
| `get_submissions` | Get assignment submissions | `course_id`, `assignment_id` |
| `get_user_profile` | Get user profile | None |

### Tool Call Example (MCP)

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_assignments",
    "arguments": {
      "course_id": "12345"
    }
  },
  "id": 1
}
```

### REST API Mapping

MCP tools map to REST endpoints:

- `get_courses` → `GET /api/v1/canvas/courses`
- `get_assignments` → `GET /api/v1/canvas/courses/:id/assignments`
- `get_upcoming_assignments` → `GET /api/v1/canvas/assignments/upcoming`

## 🔐 Client Registration

To register a new OAuth client:

### Requirements

1. **Stable Redirect URI** - Must use HTTPS in production
2. **Client Type** - Web app, mobile app, or desktop app
3. **PKCE Support** - Required for mobile/desktop, optional for web

### Request Format

Contact the server administrator with:

```json
{
  "client_name": "My Canvas App",
  "client_type": "web",
  "redirect_uris": [
    "https://myapp.com/oauth/callback"
  ],
  "require_pkce": true,
  "description": "Brief description of your app"
}
```

### Server Configuration

Administrators add to `src/oauth-config.ts`:

```typescript
{
  name: "My Canvas App",
  client_id: "generated_client_id",
  redirect_uris: [
    "https://myapp.com/oauth/callback"
  ],
  require_pkce: true
}
```

## 🧪 Testing & Debugging

### Test OAuth Discovery

```bash
curl https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server | jq
```

### Test Health Endpoint

```bash
curl https://canvas-mcp-sse.ariff.dev/health
```

Expected:

```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2025-10-13T12:00:00Z"
}
```

### Test Authentication

```bash
# Save Canvas config
curl -X POST https://canvas-mcp-sse.ariff.dev/api/v1/canvas/config \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "canvasBaseUrl": "https://canvas.instructure.com",
    "canvasApiKey": "YOUR_CANVAS_TOKEN"
  }'

# Fetch courses
curl https://canvas-mcp-sse.ariff.dev/api/v1/canvas/courses \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN"
```

### Debug Mode

Enable verbose logging in your client:

```javascript
// Node.js
process.env.DEBUG = 'mcp:*';

// Python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Check OAuth token is valid and not expired |
| `403 Forbidden` | Verify client_id is whitelisted |
| `404 Not Found` | Check endpoint URL is correct |
| `429 Too Many Requests` | Implement rate limiting / backoff |
| `500 Internal Server Error` | Check Canvas API is accessible |

### CORS Issues

If building a web app:

```javascript
// MCP server has CORS enabled for whitelisted origins
// If you get CORS errors, use server-side requests
```

### Rate Limiting

Canvas API limits:

- ~100 requests per 10 seconds per token
- Implement exponential backoff
- Cache responses when possible

### Token Expiration

OAuth tokens expire after 24 hours:

- Store token expiration time
- Refresh before expiration
- Handle 401 errors gracefully

## 📚 Additional Resources

### Documentation

- [Canvas LMS REST API](https://canvas.instructure.com/doc/api/)
- [MCP Specification](https://modelcontextprotocol.io)
- [OAuth 2.1 RFC](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)

### Example Projects

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [OAuth 2.1 Client Examples](https://github.com/a-ariff/canvas-student-mcp-server/tree/main/examples)

### Support

- **GitHub Issues**: [Report bugs](https://github.com/a-ariff/canvas-student-mcp-server/issues)
- **Discussions**: [Ask questions](https://github.com/a-ariff/canvas-student-mcp-server/discussions)
- **Email**: Check repository for contact info

## 🎯 Next Steps

1. ✅ Choose your integration method (MCP SSE or REST API)
2. ✅ Set up OAuth authentication
3. ✅ Register your Canvas credentials
4. ✅ Start fetching Canvas data
5. ✅ Build your custom features

---

**Built with ❤️ using Cloudflare Workers and MCP**  
**Star us on [GitHub](https://github.com/a-ariff/canvas-student-mcp-server)** ⭐

---

## 🏷️ Tags & Keywords

`#mcp` `#model-context-protocol` `#mcp-server` `#mcp-client` `#canvas-lms` `#canvas-integration` `#oauth2` `#oauth2.1` `#pkce` `#canvas-api` `#rest-api` `#sse` `#server-sent-events` `#api-integration` `#typescript` `#python` `#nodejs` `#javascript` `#cloudflare-workers` `#serverless` `#instructure-canvas` `#canvas-student` `#developer-tools` `#api-documentation` `#education-technology` `#edtech` `#learning-management-system` `#custom-integration` `#oauth-flow` `#canvas-courses` `#canvas-assignments` `#student-tools` `#academic-tools`

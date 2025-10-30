# 🎓 Canvas Student MCP Server

**Transform your Canvas LMS experience with AI-powered automation!** Connect Claude Desktop or ChatGPT directly to Canvas for instant access to courses, assignments, grades, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![Smithery](https://img.shields.io/badge/Smithery-Available-green.svg)](https://smithery.ai/server/@a-ariff/canvas-student-mcp)
[![GitHub Stars](https://img.shields.io/github/stars/a-ariff/canvas-student-mcp-server?style=social)](https://github.com/a-ariff/canvas-student-mcp-server)
[![Status](https://img.shields.io/website?url=https%3A%2F%2Fcanvas-mcp-sse.ariff.dev%2Fhealth&label=server)](https://canvas-mcp-sse.ariff.dev/health)

## 🚀 Live Server

**Production URL:** <https://canvas-mcp-sse.ariff.dev>

**Available Endpoints:**

- `/sse` - OAuth 2.1 authenticated SSE transport (recommended)
- `/mcp` - MCP endpoint with API key or OAuth
- `/public` - Public endpoint (config via query params)
- `/.well-known/oauth-authorization-server` - OAuth discovery
- `/health` - Health check endpoint

## 🌟 Why Choose Canvas Student MCP Server?

### For Students

- **Save Hours**: Automate assignment tracking and deadline management
- **Never Miss Deadlines**: AI-powered reminders for upcoming assignments
- **Smart Study Planning**: Let AI analyze your course load and suggest study schedules
- **Grade Tracking**: Instant access to all your grades and progress

### For Developers

- **Production-Ready**: Deployed on Cloudflare's global edge network
- **Secure by Design**: OAuth 2.1 with PKCE, no passwords stored
- **Open Source**: MIT licensed, contribute and customize freely
- **Well-Documented**: Comprehensive guides for every integration

### For Institutions

- **Privacy-First**: No data collection, all processing happens locally
- **Multi-User Safe**: Each user authenticates with their own Canvas credentials
- **Zero Infrastructure**: Serverless deployment, no maintenance required
- **API Compliant**: Follows Canvas API best practices and rate limits

## ✨ Features

### 🎓 Canvas Integration (12 Tools)

- **Course Management** - List courses, modules, and user profiles
- **Assignment Tools** - Get assignments, grades, submissions, and todos
- **Communication** - Access announcements, discussions, and calendar events
- **Quiz Tools** - View quiz information and results
- **Upcoming Tracking** - See all upcoming assignments across courses

### 🔐 Security

- **OAuth 2.1 with PKCE** - Secure authorization flow
- **Client Whitelist** - Restricted access control
- **Secure Token Storage** - Durable Objects for session management
- **Rate Limiting** - API protection
- **CORS Protection** - Cross-origin security

### ⚡ Performance

- **Edge Deployment** - Low latency via Cloudflare Workers
- **<100ms Response** - Fast API responses
- **99.9% Uptime** - Production-grade reliability
- **Global Distribution** - Deployed to multiple regions

## 📦 Repository Structure

```text
canvas-student-mcp-server/
├── README.md                       # This file
├── CHANGELOG.md                    # Version history
├── package.json                    # Workspace configuration
└── packages/
    ├── remote-mcp-server-authless/ # Main MCP Server with OAuth 2.1
    │   ├── src/
    │   │   ├── index.ts            # Main server implementation
    │   │   ├── oauth-config.ts     # OAuth 2.1 configuration
    │   │   ├── oauth-handlers.ts   # Authorization flow handlers
    │   │   ├── types.ts            # TypeScript type definitions
    │   │   └── well-known.ts       # OAuth discovery endpoints
    │   ├── package.json            # Server dependencies
    │   ├── tsconfig.json           # TypeScript configuration
    │   ├── wrangler.jsonc          # Cloudflare deployment config
    │   └── README.md               # Detailed server documentation
    └── cloudflare-canvas-api/      # Canvas REST API Proxy
        ├── src/
        │   ├── index.ts            # API proxy implementation
        │   ├── canvas-proxy.ts     # Canvas API forwarding
        │   └── landing-page.ts     # Marketing landing page
        ├── static/
        │   └── index.html          # Landing page HTML
        └── README.md               # Proxy documentation
```

## 🚀 Quick Start

### Option 1: Install via Smithery (Easiest)

Install directly from the Smithery registry:

```bash
npx -y @smithery/cli install @a-ariff/canvas-student-mcp
```

Or add to your Claude Desktop config manually:

```json
{
  "mcpServers": {
    "canvas-student-mcp": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "@a-ariff/canvas-student-mcp"]
    }
  }
}
```

### Option 2: Use Hosted Server with OAuth

Add to your Claude Desktop config
(`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "canvas-mcp": {
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

Restart Claude Desktop and you'll be prompted for OAuth authorization.

### Option 3: Deploy Your Own

#### Prerequisites

- Cloudflare account (free tier works)
- Wrangler CLI installed (`npm install -g wrangler`)
- Canvas API token

#### Deploy Steps

```bash
# Clone the repository
git clone https://github.com/a-ariff/canvas-student-mcp-server.git
cd canvas-student-mcp-server

# Install dependencies
npm run install:all

# Navigate to the MCP server
cd packages/remote-mcp-server-authless

# Login to Cloudflare
wrangler login

# Deploy to Cloudflare Workers
npm run deploy
```

## 🔧 Configuration

### Canvas API Token

1. Log into Canvas
2. Go to **Account → Settings**
3. Scroll to **Approved Integrations**
4. Click **New Access Token**
5. Name it "MCP Server"
6. Copy the token (save securely)

### OAuth Configuration

The server uses OAuth 2.1 with PKCE. Configuration is in
`packages/remote-mcp-server-authless/src/oauth-config.ts`:

```typescript
export const OAUTH_CONFIG = {
  clientWhitelist: [
    "claude-desktop",
    "mcp-client"
  ],
  redirectUris: [
    "http://localhost:*",
    "https://canvas-mcp-sse.ariff.dev/*"
  ]
}
```

## 📚 Available Tools

### Course Management

- `list_courses` - Get all active courses
- `get_modules` - Get modules for a course
- `get_user_profile` - Get user profile information

### Assignment Tools

- `get_assignments` - Get course assignments
- `get_upcoming_assignments` - Get upcoming assignments
- `get_submission_status` - Check submission status
- `get_todo_items` - Get todo list
- `get_grades` - Get course grades

### Communication

- `get_announcements` - Get course announcements
- `get_discussions` - Get discussion topics
- `get_calendar_events` - Get calendar events

### Quiz Tools

- `get_quizzes` - Get quiz information

## 🎯 Use Cases

### Student Use Cases

- 📚 Quick access to all course materials
- 📅 Track deadlines and upcoming assignments
- 💬 Stay updated with announcements
- 📊 Monitor grades and submissions
- 🤖 Use AI to help organize your coursework

### Developer Use Cases

- 🔌 Easy Canvas API integration
- 🛠️ Built on modern standards (OAuth 2.1, TypeScript)
- ⚡ Serverless deployment (no infrastructure management)
- 🌐 Global edge network (fast anywhere)
- 🔒 Security best practices out of the box

## 🛠️ Development

### Local Development

```bash
# Navigate to MCP server
cd packages/remote-mcp-server-authless

# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing

```bash
# Test OAuth endpoint
curl https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server

# Test health endpoint
curl https://canvas-mcp-sse.ariff.dev/health
```

### Available Scripts

```bash
# Root workspace
npm run install:all    # Install all package dependencies
npm run build          # Build both packages
npm run deploy:mcp     # Deploy MCP server
npm run deploy:api     # Deploy API proxy
npm run clean          # Clean all node_modules and dist

# MCP Server (packages/remote-mcp-server-authless)
npm run dev            # Development mode with hot reload
npm run deploy         # Deploy to Cloudflare Workers
npm test               # Run tests
npm run type-check     # TypeScript type checking

# API Proxy (packages/cloudflare-canvas-api)
npm run dev            # Development mode
npm run deploy         # Deploy to Cloudflare Workers
```

## 🔐 Security

### OAuth 2.1 Implementation

- PKCE (Proof Key for Code Exchange) required
- State parameter validation
- Client ID whitelist
- Redirect URI validation
- Secure token storage in Durable Objects

### Best Practices

- Never commit API tokens
- Use environment variables for secrets
- Regularly rotate Canvas tokens
- Monitor access logs
- Use HTTPS only

## 🌟 Why This MCP Server?

| Feature | This Server | Others |
|---------|-------------|--------|
| **Deployment** | Cloudflare Workers (Global Edge) | Traditional servers |
| **Authentication** | OAuth 2.1 with PKCE | API keys only |
| **Response Time** | <100ms worldwide | Varies by location |
| **Uptime** | 99.9% (Cloudflare SLA) | Depends on hosting |
| **Cost** | Free tier available | Monthly fees |
| **Security** | Enterprise-grade | Basic |
| **Maintenance** | Serverless (auto-scaling) | Manual management |

## 📖 Documentation

- [Changelog](CHANGELOG.md) - Version history and release notes
- [MCP Server README](packages/remote-mcp-server-authless/README.md) -
  Detailed server docs
- [API Proxy README](packages/cloudflare-canvas-api/README.md) -
  REST API documentation
- [Privacy Policy](PRIVACY_POLICY.md) - Data handling and privacy
- [Security Guide](packages/remote-mcp-server-authless/SECURITY-FIXES.md) -
  Security details

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for
guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔗 Links

- [🚀 Install from Smithery](https://smithery.ai/server/@a-ariff/canvas-student-mcp)
- [💻 Live Server](https://canvas-mcp-sse.ariff.dev)
- [📦 GitHub Repository](https://github.com/a-ariff/canvas-student-mcp-server)
- [📚 MCP Documentation](https://modelcontextprotocol.io)
- [🎓 Canvas API Docs](https://canvas.instructure.com/doc/api/)
- [⚡ Cloudflare Workers](https://workers.cloudflare.com/)

## 💬 Support

For issues or questions:

1. Check the [Documentation](#-documentation)
2. Search
   [existing issues](https://github.com/a-ariff/canvas-student-mcp-server/issues)
3. Open a
   [new issue](https://github.com/a-ariff/canvas-student-mcp-server/issues/new)
4. Review Canvas API documentation

## 🎯 Roadmap

- [ ] Gradescope integration
- [ ] Additional Canvas tools (files, rubrics)
- [ ] Enhanced caching layer
- [ ] Analytics dashboard
- [ ] Multi-institution support
- [ ] Mobile app support
- [ ] Webhook notifications

## ⭐ Show Your Support

If you find this project useful, please consider:

- **⭐ Star this repository** - Help us reach 16 stars for the GitHub achievement!
- **🔀 Fork and contribute** - Your improvements help everyone
- **📢 Share with classmates** - Spread the word about automated Canvas management
- **💬 Join the discussion** - Share your use cases and ideas

### Share on Social Media

```text
🎓 Just discovered Canvas Student MCP Server - connects AI directly to Canvas LMS!

✨ Features:
• Auto-track assignments & deadlines
• AI-powered study planning
• Grade monitoring
• OAuth 2.1 security

Built with @CloudflareWorkers & TypeScript
100% open source!

⭐ GitHub: github.com/a-ariff/canvas-student-mcp-server
🚀 Install: smithery.ai/server/@a-ariff/canvas-student-mcp

#EdTech #AI #Canvas #OpenSource #MCP
```

---

**Built with ❤️ by [Ariff](https://ariff.dev) | MIT License**

*Making education smarter with AI, one Canvas integration at a time.*

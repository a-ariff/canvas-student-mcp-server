# Repository Structure

This document provides a complete overview of the Canvas Student MCP Server repository structure.

```
canvas-student-mcp-server/
├── .github/                          # GitHub configuration
│   └── workflows/                    # GitHub Actions CI/CD workflows
│
├── packages/                         # Monorepo packages
│   ├── remote-mcp-server-authless/  # Main MCP Server with OAuth
│   │   ├── src/                     # Source code
│   │   │   ├── __tests__/          # Test files
│   │   │   │   ├── oauth.test.ts
│   │   │   │   └── oauth-security.test.ts
│   │   │   ├── index.ts            # Main worker entry point
│   │   │   ├── oauth-config.ts     # OAuth client configuration
│   │   │   ├── oauth-handlers.ts   # OAuth authorization & token handlers
│   │   │   ├── well-known.ts       # OAuth discovery endpoints
│   │   │   ├── types.ts            # TypeScript type definitions
│   │   │   └── smithery-wrapper.ts # Smithery integration wrapper
│   │   │
│   │   ├── biome.json              # Biome linter/formatter config
│   │   ├── package.json            # Package dependencies
│   │   ├── tsconfig.json           # TypeScript configuration
│   │   ├── wrangler.jsonc          # Cloudflare Workers configuration
│   │   ├── worker-configuration.d.ts # Worker type definitions
│   │   ├── smithery.yaml           # Smithery marketplace config
│   │   ├── README.md               # Package documentation
│   │   ├── AUTHENTICATION.md       # OAuth authentication guide
│   │   └── SECURITY-FIXES.md       # Security implementation notes
│   │
│   └── cloudflare-canvas-api/      # Canvas API Proxy (REST)
│       ├── src/                    # Source code
│       │   ├── index.ts           # Main Hono app entry point
│       │   ├── canvas-proxy.ts    # Canvas API proxy logic
│       │   ├── auth.ts            # Authentication manager
│       │   ├── landing-page.ts    # HTML landing page
│       │   └── types.ts           # TypeScript type definitions
│       │
│       ├── scripts/               # Helper scripts
│       │   └── curl/             # cURL test scripts
│       │       ├── README.md
│       │       ├── auth.sh
│       │       ├── get-assignments.sh
│       │       ├── get-courses.sh
│       │       ├── get-upcoming.sh
│       │       └── health-check.sh
│       │
│       ├── docs/                  # Documentation
│       │   └── examples.http     # HTTP request examples
│       │
│       ├── static/               # Static assets
│       │   └── index.html       # Landing page HTML
│       │
│       ├── package.json          # Package dependencies
│       ├── tsconfig.json         # TypeScript configuration
│       ├── wrangler.toml         # Cloudflare Workers configuration
│       ├── README.md             # Package documentation
│       └── TROUBLESHOOTING.md    # Debugging guide
│
├── .gitignore                    # Git ignore rules
├── package.json                  # Root package.json (workspace)
├── package-lock.json             # Lock file
├── README.md                     # Main project README
├── AGENTS.md                     # AI agent development guidelines
├── CHANGELOG.md                  # Version history
├── CONTRIBUTING.md               # Contribution guidelines
├── PRIVACY_POLICY.md             # Privacy policy for OAuth
└── LICENSE                       # MIT License

```

## Key Directories

### `/packages/remote-mcp-server-authless`
The main MCP server implementation with:
- **OAuth 2.1** authentication (PKCE support)
- **Server-Sent Events (SSE)** transport
- **12 Canvas LMS tools** (courses, assignments, submissions, etc.)
- **ChatGPT integration** support
- **REST API endpoints** for external clients
- **Privacy policy** endpoint for public GPT requirements

### `/packages/cloudflare-canvas-api`
A standalone REST API proxy for Canvas LMS:
- **Multi-user support** with rate limiting
- **Caching layer** for performance
- **Authentication management**
- **Health checks** and monitoring
- **cURL scripts** for testing

## Configuration Files

| File | Purpose |
|------|---------|
| `wrangler.jsonc` / `wrangler.toml` | Cloudflare Workers deployment config |
| `tsconfig.json` | TypeScript compiler settings |
| `biome.json` | Code linting and formatting rules |
| `smithery.yaml` | Smithery marketplace metadata |
| `package.json` | NPM dependencies and scripts |

## Important Files

- **`src/index.ts`**: Main Cloudflare Worker entry point with MCP agent
- **`src/oauth-handlers.ts`**: OAuth 2.1 authorization code flow implementation
- **`src/oauth-config.ts`**: OAuth client whitelist and validation
- **`src/well-known.ts`**: OAuth discovery metadata (RFC 8414)

## Development Workflow

```bash
# Install dependencies
npm run install:all

# Development
npm run dev:mcp          # Start MCP server locally
npm run dev:api          # Start API proxy locally

# Testing
npm test                 # Run tests
npm run lint            # Lint code

# Deployment
npm run deploy:mcp      # Deploy MCP server
npm run deploy:api      # Deploy API proxy
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Canvas Student MCP Server                 │
│                                                               │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │   MCP Server     │           │   API Proxy      │        │
│  │  (OAuth + SSE)   │           │   (REST + KV)    │        │
│  │                  │           │                  │        │
│  │  • OAuth 2.1     │           │  • Multi-user    │        │
│  │  • PKCE          │           │  • Rate limit    │        │
│  │  • 12 Tools      │           │  • Caching       │        │
│  │  • REST API      │           │  • Analytics     │        │
│  └──────────────────┘           └──────────────────┘        │
│           │                              │                    │
│           └──────────────┬───────────────┘                   │
│                          │                                    │
│                          ▼                                    │
│                 ┌─────────────────┐                          │
│                 │  Canvas LMS API  │                          │
│                 │  (Instructure)   │                          │
│                 └─────────────────┘                          │
│                                                               │
│  Deployment: Cloudflare Workers (Global Edge Network)        │
│  Storage: KV Namespaces + Durable Objects                    │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Runtime**: Cloudflare Workers (V8 Isolates)
- **Language**: TypeScript 5.9.2
- **Framework**: MCP SDK 1.17.3, Agents 0.2.7, Hono
- **Storage**: Cloudflare KV + Durable Objects
- **Authentication**: OAuth 2.1 with PKCE
- **Transport**: Server-Sent Events (SSE)
- **Deployment**: Wrangler 4.40.3

## Security Features

- ✅ OAuth 2.1 with PKCE (RFC 7636)
- ✅ Client ID whitelist validation
- ✅ Redirect URI validation
- ✅ State parameter for CSRF protection
- ✅ Bearer token authentication
- ✅ Per-user credential isolation
- ✅ Secure credential storage in KV

## API Endpoints

### MCP Server (`canvas-mcp-sse.ariff.dev`)
- `GET /.well-known/oauth-authorization-server` - OAuth metadata
- `GET /oauth/authorize` - OAuth authorization endpoint
- `POST /oauth/token` - OAuth token endpoint
- `GET /sse` - MCP Server-Sent Events endpoint
- `GET /health` - Health check
- `GET /privacy` - Privacy policy
- `POST /api/v1/canvas/config` - Save Canvas credentials
- `GET /api/v1/canvas/courses` - List courses
- `GET /api/v1/canvas/courses/:id/assignments` - List assignments
- `GET /api/v1/canvas/assignments/upcoming` - Upcoming assignments

### API Proxy (`canvas-mcp.ariff.dev`)
- `GET /health` - Health check
- `POST /auth` - Authenticate and get user ID
- `GET /proxy/:userId/courses` - Get user's courses
- `GET /proxy/:userId/courses/:courseId/assignments` - Get assignments
- `GET /proxy/:userId/upcoming` - Get upcoming assignments

## Documentation

- **README.md**: Main project overview and quick start
- **AGENTS.md**: Development guidelines for AI agents
- **CONTRIBUTING.md**: How to contribute to the project
- **AUTHENTICATION.md**: OAuth implementation details
- **SECURITY-FIXES.md**: Security improvements and fixes
- **TROUBLESHOOTING.md**: Common issues and solutions
- **PRIVACY_POLICY.md**: Privacy policy for public GPT usage
- **CHANGELOG.md**: Version history and release notes

## License

MIT License - See LICENSE file for details

---

**Maintained by**: Ariff  
**Repository**: https://github.com/a-ariff/canvas-student-mcp-server  
**Issues**: https://github.com/a-ariff/canvas-student-mcp-server/issues

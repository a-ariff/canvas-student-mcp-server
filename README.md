# Canvas Student MCP Server# Canvas Student MCP Server



A production-ready Model Context Protocol (MCP) server for Canvas LMS, deployed on Cloudflare Workers with OAuth 2.1 authentication.A production-ready Model Context Protocol (MCP) server for Canvas LMS, deployed on Cloudflare Workers with OAuth 2.1 authentication.



[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)



## 🚀 Live Server## 🚀 Live Server



Production URL: <https://canvas-mcp-sse.ariff.dev>**Production URL:** https://canvas-mcp-sse.ariff.dev



Available Endpoints:**Available Endpoints:**

- `/sse` - OAuth 2.1 authenticated SSE transport (recommended)

- `/sse` - OAuth 2.1 authenticated SSE transport (recommended)- `/mcp` - MCP endpoint with API key or OAuth

- `/mcp` - MCP endpoint with API key or OAuth- `/public` - Public endpoint (config via query params)

- `/public` - Public endpoint (config via query params)- `/.well-known/oauth-authorization-server` - OAuth discovery

- `/.well-known/oauth-authorization-server` - OAuth discovery- `/health` - Health check endpoint

- `/health` - Health check endpoint

## ✨ Features

## ✨ Features

### 🎓 Canvas Integration (12 Tools)

### Canvas Integration (12 Tools)- **Course Management** - List courses, modules, and user profiles

- **Assignment Tools** - Get assignments, grades, submissions, and todos

- **Course Management** - List courses, modules, and user profiles- **Communication** - Access announcements, discussions, and calendar events

- **Assignment Tools** - Get assignments, grades, submissions, and todos- **Quiz Tools** - View quiz information and results

- **Communication** - Access announcements, discussions, and calendar events- **Upcoming Tracking** - See all upcoming assignments across courses

- **Quiz Tools** - View quiz information and results

- **Upcoming Tracking** - See all upcoming assignments across courses### 🔐 Security

- **OAuth 2.1 with PKCE** - Secure authorization flow

### Security- **Client Whitelist** - Restricted access control

- **Secure Token Storage** - Durable Objects for session management

- **OAuth 2.1 with PKCE** - Secure authorization flow- **Rate Limiting** - API protection

- **Client Whitelist** - Restricted access control- **CORS Protection** - Cross-origin security

- **Secure Token Storage** - Durable Objects for session management

- **Rate Limiting** - API protection### ⚡ Performance

- **CORS Protection** - Cross-origin security- **Edge Deployment** - Low latency via Cloudflare Workers

- **<100ms Response** - Fast API responses

### Performance- **99.9% Uptime** - Production-grade reliability

- **Global Distribution** - Deployed to multiple regions

- **Edge Deployment** - Low latency via Cloudflare Workers

- **<100ms Response** - Fast API responses## 📦 Repository Structure

- **99.9% Uptime** - Production-grade reliability

- **Global Distribution** - Deployed to multiple regions```

canvas-student-mcp-server/

## 📦 Repository Structure├── README.md                       # This file

├── package.json                    # Workspace configuration

```text└── packages/

canvas-student-mcp-server/    ├── remote-mcp-server-authless/ # Main Cloudflare Workers MCP server

├── README.md                       # This file    │   ├── src/

├── package.json                    # Workspace configuration    │   │   ├── index.ts            # Main server implementation

└── packages/    │   │   ├── oauth-config.ts     # OAuth 2.1 configuration

    ├── remote-mcp-server-authless/ # Main Cloudflare Workers MCP server    │   │   ├── oauth-handlers.ts   # Authorization flow handlers

    │   ├── src/    │   │   ├── types.ts            # TypeScript type definitions

    │   │   ├── index.ts            # Main server implementation    │   │   └── well-known.ts       # OAuth discovery endpoints

    │   │   ├── oauth-config.ts     # OAuth 2.1 configuration    │   ├── package.json            # Server dependencies

    │   │   ├── oauth-handlers.ts   # Authorization flow handlers    │   ├── tsconfig.json           # TypeScript configuration

    │   │   ├── types.ts            # TypeScript type definitions    │   ├── wrangler.jsonc          # Cloudflare deployment config

    │   │   └── well-known.ts       # OAuth discovery endpoints    │   └── README.md               # Detailed server documentation

    │   ├── package.json            # Server dependencies    └── cloudflare-canvas-api/      # Canvas API proxy (optional)

    │   ├── tsconfig.json           # TypeScript configuration        ├── src/

    │   ├── wrangler.jsonc          # Cloudflare deployment config        │   ├── index.ts            # API proxy implementation

    │   └── README.md               # Detailed server documentation        │   └── landing-page.ts     # Marketing landing page

    └── cloudflare-canvas-api/      # Canvas API proxy (optional)        └── static/

        ├── src/            └── index.html          # Landing page HTML

        │   ├── index.ts            # API proxy implementation```

        │   └── landing-page.ts     # Marketing landing page

        └── static/## 🚀 Quick Start

            └── index.html          # Landing page HTML

```### Option 1: Use Hosted Server (Recommended)



## 🚀 Quick Start# Build the TypeScript project

npm run build

### Option 1: Use Hosted Server (Recommended)```



Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):### 3. Configure Environment



```json```bash

{# Copy the example configuration

  "mcpServers": {cp .env.example .env

    "canvas-mcp": {

      "command": "npx",# Edit .env with your details

      "args": [nano .env

        "-y",```

        "@modelcontextprotocol/client-oauth2",

        "https://canvas-mcp-sse.ariff.dev/sse"Required configuration:

      ]```env

    }CANVAS_API_KEY=your_actual_api_token_here

  }CANVAS_BASE_URL=https://your-school.instructure.com

}```

```

### 4. Configure Claude Desktop

Restart Claude Desktop and you'll be prompted for OAuth authorization.

Add to your Claude Desktop config (`~/.config/claude/claude_desktop_config.json` or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

### Option 2: Deploy Your Own

```json

#### Prerequisites{

  "mcpServers": {

- Cloudflare account (free tier works)    "canvas-student": {

- Wrangler CLI installed (`npm install -g wrangler`)      "command": "node",

- Canvas API token      "args": ["/path/to/canvas-student-mcp-server/dist/index.js"],

      "cwd": "/path/to/canvas-student-mcp-server",

#### Deploy Steps      "env": {

        "NODE_ENV": "production"

```bash      }

# Clone the repository    }

git clone https://github.com/a-ariff/canvas-student-mcp-server.git  }

cd canvas-student-mcp-server}

```

# Navigate to the server package

cd packages/remote-mcp-server-authless### 5. Test the Connection



# Install dependenciesRestart Claude Desktop and ask:

npm install> "Show me my Canvas courses"



# Login to Cloudflare## 📁 Monorepo Structure

wrangler login

```text

# Deploy to Cloudflare Workerscanvas-student-mcp-server/

npm run deploy├── README.md                           # This file

```├── package.json                        # Root package.json for workspace

├── .gitignore                         # Combined gitignore

## 🔧 Configuration├── .github/workflows/                  # CI/CD workflows (disabled during restructure)

│   ├── markdown-lint.yml              # Markdown linting workflow

### Canvas API Token│   └── security.yml                   # Security scanning

└── packages/

1. Log into Canvas    ├── canvas-student-mcp-server/     # TypeScript MCP Server (Main)

2. Go to **Account → Settings**    │   ├── src/                       # TypeScript source code

3. Scroll to **Approved Integrations**    │   │   ├── index.ts               # MCP server entry point

4. Click **New Access Token**    │   │   ├── canvas-api.ts          # Canvas API client

5. Name it "MCP Server"    │   │   ├── workflow-engine.ts     # Academic workflow automation

6. Copy the token (save securely)    │   │   ├── config.ts              # Configuration management

    │   │   ├── cache.ts               # Caching system

### OAuth Configuration    │   │   └── types.ts               # TypeScript definitions

    │   ├── dist/                      # Built JavaScript

The server uses OAuth 2.1 with PKCE. Configuration is in `packages/remote-mcp-server-authless/src/oauth-config.ts`:    │   ├── docs/                      # Documentation

    │   ├── examples/                  # Usage examples

```typescript    │   ├── package.json               # Node.js dependencies

export const OAUTH_CONFIG = {    │   ├── tsconfig.json              # TypeScript config

  clientWhitelist: [    │   ├── Dockerfile                 # Docker configuration

    "claude-desktop",    │   ├── docker-compose.yml         # Docker Compose setup

    "mcp-client"    │   └── README.md                  # MCP server docs

  ],    ├── cloudflare-canvas-api/         # Cloudflare Workers Proxy

  redirectUris: [    │   ├── src/                       # TypeScript source

    "http://localhost:*",    │   ├── package.json               # Dependencies

    "https://canvas-mcp-sse.ariff.dev/*"    │   └── README.md                  # Proxy docs

  ]    └── remote-mcp-server-authless/    # Legacy Remote Server

}        ├── src/                       # TypeScript source

```        ├── package.json               # Node.js dependencies

        └── README.md                  # Remote server docs

## 📚 Available Tools```



### Course Management## 🛠 Development



- `list_courses` - Get all active coursesThis monorepo contains all Canvas MCP implementations in one place for easier development and maintenance.

- `get_modules` - Get modules for a course

- `get_user_profile` - Get user profile information### 🔄 CI/CD Workflows



### Assignment Tools- **Markdown Linting**: Ensures documentation quality

- **Security Scans**: Weekly security audits for TypeScript packages

- `get_assignments` - Get course assignments- **Manual Testing**: Type checking and builds validated locally

- `get_upcoming_assignments` - Get upcoming assignments

- `get_submission_status` - Check submission status*Note: Full CI/CD workflows temporarily disabled during monorepo restructuring.*

- `get_todo_items` - Get todo list### 📝 Available Scripts

- `get_grades` - Get course grades

```bash

### Communication# Install dependencies

cd packages/canvas-student-mcp-server

- `get_announcements` - Get course announcementsnpm install

- `get_discussions` - Get discussion topics

- `get_calendar_events` - Get calendar events# Build TypeScript

npm run build

### Quiz Tools

# Development mode (watch for changes)

- `get_quizzes` - Get quiz informationnpm run dev



## 🛠️ Development# Type checking

npm run type-check

### Local Development

# Start MCP server (for testing)

```bashnpm start

cd packages/remote-mcp-server-authless

npm install# Cleanup

npm run devnpm run clean

``````



### Testing### 🚀 Getting Started



```bash1. Clone the repository:

# Test OAuth endpoint```bash

curl https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-servergit clone https://github.com/a-ariff/canvas-student-mcp-server.git

cd canvas-student-mcp-server

# Test health endpoint```

curl https://canvas-mcp-sse.ariff.dev/health

```2. Install dependencies and build:

```bash

### Project Structurecd packages/canvas-student-mcp-server

npm install

- `src/index.ts` - Main server implementation with 12 MCP toolsnpm run build

- `src/oauth-handlers.ts` - OAuth 2.1 authorization flow```

- `src/oauth-config.ts` - OAuth configuration and validation

- `src/well-known.ts` - OAuth discovery endpoints3. Configure your Canvas API credentials:

- `src/types.ts` - TypeScript type definitions```bash

cp .env.example .env

## 🔐 Security# Edit .env with your Canvas API token and URL

```

### OAuth 2.1 Implementation

4. Configure Claude Desktop:

- PKCE (Proof Key for Code Exchange) requiredEdit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `~/.config/claude/claude_desktop_config.json` (Linux):

- State parameter validation```json

- Client ID whitelist{

- Redirect URI validation  "mcpServers": {

- Secure token storage in Durable Objects    "canvas-student": {

      "command": "node",

### Best Practices      "args": ["/absolute/path/to/canvas-student-mcp-server/packages/canvas-student-mcp-server/dist/index.js"],

      "env": {

- Never commit API tokens        "CANVAS_API_KEY": "your_token_here",

- Use environment variables for secrets        "CANVAS_BASE_URL": "https://your-school.instructure.com"

- Regularly rotate Canvas tokens      }

- Monitor access logs    }

- Use HTTPS only  }

}

## 📄 License```



MIT License - see LICENSE file for details5. Restart Claude Desktop to load the MCP server



## 🤝 Contributing## 🔒 Security & Compliance



Contributions welcome! Please open an issue first to discuss changes.- **Automated Security Scanning**: Weekly scans for both Python and TypeScript dependencies

- **Code Quality**: Enforced through CI/CD with linting and formatting checks

## 🔗 Links- **Dependency Management**: Regular updates and vulnerability monitoring

## 📚 Documentation

- [Live Server](https://canvas-mcp-sse.ariff.dev)

- [GitHub Repository](https://github.com/a-ariff/canvas-student-mcp-server)- **MCP Server Setup**: See `packages/canvas-student-mcp-server/README.md`

- [MCP Documentation](https://modelcontextprotocol.io)- **Workflow Automation**: Built-in academic workflow processing tools

- [Canvas API Docs](https://canvas.instructure.com/doc/api/)- **API Documentation**: Available in `packages/canvas-student-mcp-server/docs/`

- **Integration Guide**: See `packages/canvas-student-mcp-server/MCP_INTEGRATION.md`

## 💬 Support- **Docker Guide**: See `packages/canvas-student-mcp-server/DOCKER_TESTING.md`

- **Troubleshooting**: See `packages/canvas-student-mcp-server/TROUBLESHOOTING.md`

For issues or questions:## 🔧 Recent Fixes & Improvements



1. Check the [README in packages/remote-mcp-server-authless](packages/remote-mcp-server-authless/README.md)**✅ Security Issues Fixed:**

2. Open an issue on GitHub- Removed hardcoded credentials from source code

3. Review Canvas API documentation- Added proper environment variable configuration

- Implemented secure credential handling

## 🎯 Roadmap

**✅ MCP Implementation Fixed:**

- [ ] Gradescope integration enhancements- Corrected MCP server architecture and entry point

- [ ] Additional Canvas tools (files, rubrics)- Fixed Claude Desktop integration configuration

- [ ] Caching layer improvements- Updated dependencies and requirements

- [ ] Admin dashboard

- [ ] Multi-institution support**✅ Configuration Improvements:**

- Added Claude Desktop setup guide (`CLAUDE_DESKTOP_SETUP.md`)

---- Updated smithery.yaml with correct MCP server configuration

- Added proper Python path configuration

**Built with ❤️ using Cloudflare Workers and MCP**

## 🚀 Quick Start for Claude Desktop

1. **Clone and setup:**
   ```bash
   git clone https://github.com/a-ariff/canvas-student-mcp-server.git
   cd canvas-student-mcp-server
   npm run install:all
   ```

2. **Build the project:**
   ```bash
   cd packages/canvas-student-mcp-server
   npm install
   npm run build
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Canvas API token
   ```

4. **Setup Claude Desktop:**
   Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "canvas-student": {
         "command": "node",
         "args": ["/path/to/packages/canvas-student-mcp-server/dist/index.js"],
         "env": {
           "CANVAS_API_KEY": "your_api_token",
           "CANVAS_BASE_URL": "https://your-school.instructure.com"
         }
       }
     }
   }
   ```

5. **Restart Claude Desktop** - Your Canvas MCP server is ready!

## 🐳 Docker Support

Run the MCP server in a container:

```bash
cd packages/canvas-student-mcp-server

# Build image
docker build -t canvas-mcp-server .

# Run with environment variables
docker run -e CANVAS_API_KEY=your_token \
           -e CANVAS_BASE_URL=https://your-school.instructure.com \
           canvas-mcp-server

# Or use Docker Compose
docker-compose up -d
```

## ⚠️ Important Notice

This project is designed for educational purposes and personal academic
management. **Node.js 18+ is required**. Users are responsible for complying
with their institution's terms of service and applicable policies. Always
respect rate limits and use responsibly.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
1. Commit your changes (`git commit -m 'Add some amazing feature'`)
1. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
The CI/CD pipeline will automatically test your changes across multiple Python
and Node.js versions!

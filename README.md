# Canvas Student MCP Server# Canvas Student MCP Server# Canvas Student MCP Server# Canvas Student MCP Server



A production-ready Model Context Protocol (MCP) server for Canvas LMS, deployed on Cloudflare Workers with OAuth 2.1 authentication.



[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)A production-ready Model Context Protocol (MCP) server for Canvas LMS, deployed on Cloudflare Workers with OAuth 2.1 authentication.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

[![GitHub Stars](https://img.shields.io/github/stars/a-ariff/canvas-student-mcp-server?style=social)](https://github.com/a-ariff/canvas-student-mcp-server)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)A production-ready Model Context Protocol (MCP) server for Canvas LMS, deployed on Cloudflare Workers with OAuth 2.1 authentication.A production-ready Model Context Protocol (MCP) server for Canvas LMS, deployed on Cloudflare Workers with OAuth 2.1 authentication.

[![Status](https://img.shields.io/website?url=https%3A%2F%2Fcanvas-mcp-sse.ariff.dev%2Fhealth&label=server)](https://canvas-mcp-sse.ariff.dev/health)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Live Server

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

**Production URL:** <https://canvas-mcp-sse.ariff.dev>

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

**Available Endpoints:**

- `/sse` - OAuth 2.1 authenticated SSE transport (recommended)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- `/mcp` - MCP endpoint with API key or OAuth

- `/public` - Public endpoint (config via query params)## 🚀 Live Server

- `/.well-known/oauth-authorization-server` - OAuth discovery

- `/health` - Health check endpoint[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)



## ✨ Features**Production URL:** https://canvas-mcp-sse.ariff.dev



### 🎓 Canvas Integration (12 Tools)[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

- **Course Management** - List courses, modules, and user profiles

- **Assignment Tools** - Get assignments, grades, submissions, and todos**Available Endpoints:**

- **Communication** - Access announcements, discussions, and calendar events

- **Quiz Tools** - View quiz information and results- `/sse` - OAuth 2.1 authenticated SSE transport (recommended)[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

- **Upcoming Tracking** - See all upcoming assignments across courses

- `/mcp` - MCP endpoint with API key or OAuth

### 🔐 Security

- **OAuth 2.1 with PKCE** - Secure authorization flow- `/public` - Public endpoint (config via query params)

- **Client Whitelist** - Restricted access control

- **Secure Token Storage** - Durable Objects for session management- `/.well-known/oauth-authorization-server` - OAuth discovery

- **Rate Limiting** - API protection

- **CORS Protection** - Cross-origin security- `/health` - Health check endpoint## 🚀 Live Server## 🚀 Live Server



### ⚡ Performance

- **Edge Deployment** - Low latency via Cloudflare Workers

- **<100ms Response** - Fast API responses## ✨ Features

- **99.9% Uptime** - Production-grade reliability

- **Global Distribution** - Deployed to multiple regions



## 📦 Repository Structure### 🎓 Canvas Integration (12 Tools)Production URL: <https://canvas-mcp-sse.ariff.dev>**Production URL:** https://canvas-mcp-sse.ariff.dev



```- **Course Management** - List courses, modules, and user profiles

canvas-student-mcp-server/

├── README.md                       # This file- **Assignment Tools** - Get assignments, grades, submissions, and todos

├── CHANGELOG.md                    # Version history

├── package.json                    # Workspace configuration- **Communication** - Access announcements, discussions, and calendar events

└── packages/

    ├── remote-mcp-server-authless/ # Main MCP Server with OAuth 2.1- **Quiz Tools** - View quiz information and resultsAvailable Endpoints:**Available Endpoints:**

    │   ├── src/

    │   │   ├── index.ts            # Main server implementation- **Upcoming Tracking** - See all upcoming assignments across courses

    │   │   ├── oauth-config.ts     # OAuth 2.1 configuration

    │   │   ├── oauth-handlers.ts   # Authorization flow handlers- `/sse` - OAuth 2.1 authenticated SSE transport (recommended)

    │   │   ├── types.ts            # TypeScript type definitions

    │   │   └── well-known.ts       # OAuth discovery endpoints### 🔐 Security

    │   ├── package.json            # Server dependencies

    │   ├── tsconfig.json           # TypeScript configuration- **OAuth 2.1 with PKCE** - Secure authorization flow- `/sse` - OAuth 2.1 authenticated SSE transport (recommended)- `/mcp` - MCP endpoint with API key or OAuth

    │   ├── wrangler.jsonc          # Cloudflare deployment config

    │   └── README.md               # Detailed server documentation- **Client Whitelist** - Restricted access control

    └── cloudflare-canvas-api/      # Canvas REST API Proxy

        ├── src/- **Secure Token Storage** - Durable Objects for session management- `/mcp` - MCP endpoint with API key or OAuth- `/public` - Public endpoint (config via query params)

        │   ├── index.ts            # API proxy implementation

        │   ├── canvas-proxy.ts     # Canvas API forwarding- **Rate Limiting** - API protection

        │   └── landing-page.ts     # Marketing landing page

        ├── static/- **CORS Protection** - Cross-origin security- `/public` - Public endpoint (config via query params)- `/.well-known/oauth-authorization-server` - OAuth discovery

        │   └── index.html          # Landing page HTML

        └── README.md               # Proxy documentation

```

### ⚡ Performance- `/.well-known/oauth-authorization-server` - OAuth discovery- `/health` - Health check endpoint

## 🚀 Quick Start

- **Edge Deployment** - Low latency via Cloudflare Workers

### Option 1: Use Hosted Server (Recommended)

- **<100ms Response** - Fast API responses- `/health` - Health check endpoint

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

- **99.9% Uptime** - Production-grade reliability

```json

{- **Global Distribution** - Deployed to multiple regions## ✨ Features

  "mcpServers": {

    "canvas-mcp": {

      "command": "npx",

      "args": [## 📦 Repository Structure## ✨ Features

        "-y",

        "@modelcontextprotocol/client-oauth2",

        "https://canvas-mcp-sse.ariff.dev/sse"

      ]```### 🎓 Canvas Integration (12 Tools)

    }

  }canvas-student-mcp-server/

}

```├── README.md                       # This file### Canvas Integration (12 Tools)- **Course Management** - List courses, modules, and user profiles



Restart Claude Desktop and you'll be prompted for OAuth authorization.├── package.json                    # Workspace configuration



### Option 2: Deploy Your Own└── packages/- **Assignment Tools** - Get assignments, grades, submissions, and todos



#### Prerequisites    ├── remote-mcp-server-authless/ # Main MCP Server with OAuth 2.1

- Cloudflare account (free tier works)

- Wrangler CLI installed (`npm install -g wrangler`)    │   ├── src/- **Course Management** - List courses, modules, and user profiles- **Communication** - Access announcements, discussions, and calendar events

- Canvas API token

    │   │   ├── index.ts            # Main server implementation

#### Deploy Steps

    │   │   ├── oauth-config.ts     # OAuth 2.1 configuration- **Assignment Tools** - Get assignments, grades, submissions, and todos- **Quiz Tools** - View quiz information and results

```bash

# Clone the repository    │   │   ├── oauth-handlers.ts   # Authorization flow handlers

git clone https://github.com/a-ariff/canvas-student-mcp-server.git

cd canvas-student-mcp-server    │   │   ├── types.ts            # TypeScript type definitions- **Communication** - Access announcements, discussions, and calendar events- **Upcoming Tracking** - See all upcoming assignments across courses



# Install dependencies    │   │   └── well-known.ts       # OAuth discovery endpoints

npm run install:all

    │   ├── package.json            # Server dependencies- **Quiz Tools** - View quiz information and results

# Navigate to the MCP server

cd packages/remote-mcp-server-authless    │   ├── tsconfig.json           # TypeScript configuration



# Login to Cloudflare    │   ├── wrangler.jsonc          # Cloudflare deployment config- **Upcoming Tracking** - See all upcoming assignments across courses### 🔐 Security

wrangler login

    │   └── README.md               # Detailed server documentation

# Deploy to Cloudflare Workers

npm run deploy    └── cloudflare-canvas-api/      # Canvas REST API Proxy- **OAuth 2.1 with PKCE** - Secure authorization flow

```

        ├── src/

## 🔧 Configuration

        │   ├── index.ts            # API proxy implementation### Security- **Client Whitelist** - Restricted access control

### Canvas API Token

        │   ├── canvas-proxy.ts     # Canvas API forwarding

1. Log into Canvas

2. Go to **Account → Settings**        │   └── landing-page.ts     # Marketing landing page- **Secure Token Storage** - Durable Objects for session management

3. Scroll to **Approved Integrations**

4. Click **New Access Token**        ├── static/

5. Name it "MCP Server"

6. Copy the token (save securely)        │   └── index.html          # Landing page HTML- **OAuth 2.1 with PKCE** - Secure authorization flow- **Rate Limiting** - API protection



### OAuth Configuration        └── README.md               # Proxy documentation



The server uses OAuth 2.1 with PKCE. Configuration is in `packages/remote-mcp-server-authless/src/oauth-config.ts`:```- **Client Whitelist** - Restricted access control- **CORS Protection** - Cross-origin security



```typescript

export const OAUTH_CONFIG = {

  clientWhitelist: [## 🚀 Quick Start- **Secure Token Storage** - Durable Objects for session management

    "claude-desktop",

    "mcp-client"

  ],

  redirectUris: [### Option 1: Use Hosted Server (Recommended)- **Rate Limiting** - API protection### ⚡ Performance

    "http://localhost:*",

    "https://canvas-mcp-sse.ariff.dev/*"

  ]

}Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):- **CORS Protection** - Cross-origin security- **Edge Deployment** - Low latency via Cloudflare Workers

```



## 📚 Available Tools

```json- **<100ms Response** - Fast API responses

### Course Management

- `list_courses` - Get all active courses{

- `get_modules` - Get modules for a course

- `get_user_profile` - Get user profile information  "mcpServers": {### Performance- **99.9% Uptime** - Production-grade reliability



### Assignment Tools    "canvas-mcp": {

- `get_assignments` - Get course assignments

- `get_upcoming_assignments` - Get upcoming assignments      "command": "npx",- **Global Distribution** - Deployed to multiple regions

- `get_submission_status` - Check submission status

- `get_todo_items` - Get todo list      "args": [

- `get_grades` - Get course grades

        "-y",- **Edge Deployment** - Low latency via Cloudflare Workers

### Communication

- `get_announcements` - Get course announcements        "@modelcontextprotocol/client-oauth2",

- `get_discussions` - Get discussion topics

- `get_calendar_events` - Get calendar events        "https://canvas-mcp-sse.ariff.dev/sse"- **<100ms Response** - Fast API responses## 📦 Repository Structure



### Quiz Tools      ]

- `get_quizzes` - Get quiz information

    }- **99.9% Uptime** - Production-grade reliability

## 🎯 Use Cases

  }

### For Students

- 📚 Quick access to all course materials}- **Global Distribution** - Deployed to multiple regions```

- 📅 Track deadlines and upcoming assignments

- 💬 Stay updated with announcements```

- 📊 Monitor grades and submissions

- 🤖 Use AI to help organize your courseworkcanvas-student-mcp-server/



### For DevelopersRestart Claude Desktop and you'll be prompted for OAuth authorization.

- 🔌 Easy Canvas API integration

- 🛠️ Built on modern standards (OAuth 2.1, TypeScript)## 📦 Repository Structure├── README.md                       # This file

- ⚡ Serverless deployment (no infrastructure management)

- 🌐 Global edge network (fast anywhere)### Option 2: Deploy Your Own

- 🔒 Security best practices out of the box

├── package.json                    # Workspace configuration

## 🛠️ Development

#### Prerequisites

### Local Development

- Cloudflare account (free tier works)```text└── packages/

```bash

# Navigate to MCP server- Wrangler CLI installed (`npm install -g wrangler`)

cd packages/remote-mcp-server-authless

- Canvas API tokencanvas-student-mcp-server/    ├── remote-mcp-server-authless/ # Main Cloudflare Workers MCP server

# Install dependencies

npm install



# Start development server#### Deploy Steps├── README.md                       # This file    │   ├── src/

npm run dev

```



### Testing```bash├── package.json                    # Workspace configuration    │   │   ├── index.ts            # Main server implementation



```bash# Clone the repository

# Test OAuth endpoint

curl https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-servergit clone https://github.com/a-ariff/canvas-student-mcp-server.git└── packages/    │   │   ├── oauth-config.ts     # OAuth 2.1 configuration



# Test health endpointcd canvas-student-mcp-server

curl https://canvas-mcp-sse.ariff.dev/health

```    ├── remote-mcp-server-authless/ # Main Cloudflare Workers MCP server    │   │   ├── oauth-handlers.ts   # Authorization flow handlers



### Available Scripts# Install dependencies



```bashnpm run install:all    │   ├── src/    │   │   ├── types.ts            # TypeScript type definitions

# Root workspace

npm run install:all    # Install all package dependencies

npm run build          # Build both packages

npm run deploy:mcp     # Deploy MCP server# Navigate to the MCP server    │   │   ├── index.ts            # Main server implementation    │   │   └── well-known.ts       # OAuth discovery endpoints

npm run deploy:api     # Deploy API proxy

npm run clean          # Clean all node_modules and distcd packages/remote-mcp-server-authless



# MCP Server (packages/remote-mcp-server-authless)    │   │   ├── oauth-config.ts     # OAuth 2.1 configuration    │   ├── package.json            # Server dependencies

npm run dev            # Development mode with hot reload

npm run deploy         # Deploy to Cloudflare Workers# Login to Cloudflare

npm test               # Run tests

npm run type-check     # TypeScript type checkingwrangler login    │   │   ├── oauth-handlers.ts   # Authorization flow handlers    │   ├── tsconfig.json           # TypeScript configuration



# API Proxy (packages/cloudflare-canvas-api)

npm run dev            # Development mode

npm run deploy         # Deploy to Cloudflare Workers# Deploy to Cloudflare Workers    │   │   ├── types.ts            # TypeScript type definitions    │   ├── wrangler.jsonc          # Cloudflare deployment config

```

npm run deploy

## 🔐 Security

```    │   │   └── well-known.ts       # OAuth discovery endpoints    │   └── README.md               # Detailed server documentation

### OAuth 2.1 Implementation

- PKCE (Proof Key for Code Exchange) required

- State parameter validation

- Client ID whitelist## 🔧 Configuration    │   ├── package.json            # Server dependencies    └── cloudflare-canvas-api/      # Canvas API proxy (optional)

- Redirect URI validation

- Secure token storage in Durable Objects



### Best Practices### Canvas API Token    │   ├── tsconfig.json           # TypeScript configuration        ├── src/

- Never commit API tokens

- Use environment variables for secrets

- Regularly rotate Canvas tokens

- Monitor access logs1. Log into Canvas    │   ├── wrangler.jsonc          # Cloudflare deployment config        │   ├── index.ts            # API proxy implementation

- Use HTTPS only

2. Go to **Account → Settings**

## 🌟 Why This MCP Server?

3. Scroll to **Approved Integrations**    │   └── README.md               # Detailed server documentation        │   └── landing-page.ts     # Marketing landing page

| Feature | This Server | Others |

|---------|-------------|--------|4. Click **New Access Token**

| **Deployment** | Cloudflare Workers (Global Edge) | Traditional servers |

| **Authentication** | OAuth 2.1 with PKCE | API keys only |5. Name it "MCP Server"    └── cloudflare-canvas-api/      # Canvas API proxy (optional)        └── static/

| **Response Time** | <100ms worldwide | Varies by location |

| **Uptime** | 99.9% (Cloudflare SLA) | Depends on hosting |6. Copy the token (save securely)

| **Cost** | Free tier available | Monthly fees |

| **Security** | Enterprise-grade | Basic |        ├── src/            └── index.html          # Landing page HTML

| **Maintenance** | Serverless (auto-scaling) | Manual management |

### OAuth Configuration

## 📖 Documentation

        │   ├── index.ts            # API proxy implementation```

- [Changelog](CHANGELOG.md) - Version history and release notes

- [MCP Server README](packages/remote-mcp-server-authless/README.md) - Detailed server docsThe server uses OAuth 2.1 with PKCE. Configuration is in `packages/remote-mcp-server-authless/src/oauth-config.ts`:

- [API Proxy README](packages/cloudflare-canvas-api/README.md) - REST API documentation

- [Privacy Policy](PRIVACY_POLICY.md) - Data handling and privacy        │   └── landing-page.ts     # Marketing landing page

- [Security Guide](packages/remote-mcp-server-authless/SECURITY-FIXES.md) - Security details

```typescript

## 📄 License

export const OAUTH_CONFIG = {        └── static/## 🚀 Quick Start

MIT License - see [LICENSE](LICENSE) file for details

  clientWhitelist: [

## 🤝 Contributing

    "claude-desktop",            └── index.html          # Landing page HTML

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

    "mcp-client"

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)  ],```### Option 1: Use Hosted Server (Recommended)

3. Commit your changes (`git commit -m 'Add some amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)  redirectUris: [

5. Open a Pull Request

    "http://localhost:*",

## 🔗 Links

    "https://canvas-mcp-sse.ariff.dev/*"

- [Live Server](https://canvas-mcp-sse.ariff.dev)

- [GitHub Repository](https://github.com/a-ariff/canvas-student-mcp-server)  ]## 🚀 Quick Start# Build the TypeScript project

- [MCP Documentation](https://modelcontextprotocol.io)

- [Canvas API Docs](https://canvas.instructure.com/doc/api/)}

- [Cloudflare Workers](https://workers.cloudflare.com/)

```npm run build

## 💬 Support



For issues or questions:

1. Check the [Documentation](#-documentation)## 📚 Available Tools### Option 1: Use Hosted Server (Recommended)```

2. Search [existing issues](https://github.com/a-ariff/canvas-student-mcp-server/issues)

3. Open a [new issue](https://github.com/a-ariff/canvas-student-mcp-server/issues/new)

4. Review Canvas API documentation

### Course Management

## 🎯 Roadmap

- `list_courses` - Get all active courses

- [ ] Gradescope integration

- [ ] Additional Canvas tools (files, rubrics)- `get_modules` - Get modules for a courseAdd to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):### 3. Configure Environment

- [ ] Enhanced caching layer

- [ ] Analytics dashboard- `get_user_profile` - Get user profile information

- [ ] Multi-institution support

- [ ] Mobile app support

- [ ] Webhook notifications

### Assignment Tools

---

- `get_assignments` - Get course assignments```json```bash

**Built with ❤️ using Cloudflare Workers and MCP**

- `get_upcoming_assignments` - Get upcoming assignments

⭐ Star this repo if you find it useful!

- `get_submission_status` - Check submission status{# Copy the example configuration

- `get_todo_items` - Get todo list

- `get_grades` - Get course grades  "mcpServers": {cp .env.example .env



### Communication    "canvas-mcp": {

- `get_announcements` - Get course announcements

- `get_discussions` - Get discussion topics      "command": "npx",# Edit .env with your details

- `get_calendar_events` - Get calendar events

      "args": [nano .env

### Quiz Tools

- `get_quizzes` - Get quiz information        "-y",```



## 🛠️ Development        "@modelcontextprotocol/client-oauth2",



### Local Development        "https://canvas-mcp-sse.ariff.dev/sse"Required configuration:



```bash      ]```env

# Navigate to MCP server

cd packages/remote-mcp-server-authless    }CANVAS_API_KEY=your_actual_api_token_here



# Install dependencies  }CANVAS_BASE_URL=https://your-school.instructure.com

npm install

}```

# Start development server

npm run dev```

```

### 4. Configure Claude Desktop

### Testing

Restart Claude Desktop and you'll be prompted for OAuth authorization.

```bash

# Test OAuth endpointAdd to your Claude Desktop config (`~/.config/claude/claude_desktop_config.json` or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

curl https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server

### Option 2: Deploy Your Own

# Test health endpoint

curl https://canvas-mcp-sse.ariff.dev/health```json

```

#### Prerequisites{

### Available Scripts

  "mcpServers": {

```bash

# Root workspace- Cloudflare account (free tier works)    "canvas-student": {

npm run install:all    # Install all package dependencies

npm run build          # Build both packages- Wrangler CLI installed (`npm install -g wrangler`)      "command": "node",

npm run deploy:mcp     # Deploy MCP server

npm run deploy:api     # Deploy API proxy- Canvas API token      "args": ["/path/to/canvas-student-mcp-server/dist/index.js"],

npm run clean          # Clean all node_modules and dist

      "cwd": "/path/to/canvas-student-mcp-server",

# MCP Server (packages/remote-mcp-server-authless)

npm run dev            # Development mode with hot reload#### Deploy Steps      "env": {

npm run deploy         # Deploy to Cloudflare Workers

npm test               # Run tests        "NODE_ENV": "production"

npm run type-check     # TypeScript type checking

```bash      }

# API Proxy (packages/cloudflare-canvas-api)

npm run dev            # Development mode# Clone the repository    }

npm run deploy         # Deploy to Cloudflare Workers

```git clone https://github.com/a-ariff/canvas-student-mcp-server.git  }



## 🔐 Securitycd canvas-student-mcp-server}



### OAuth 2.1 Implementation```

- PKCE (Proof Key for Code Exchange) required

- State parameter validation# Navigate to the server package

- Client ID whitelist

- Redirect URI validationcd packages/remote-mcp-server-authless### 5. Test the Connection

- Secure token storage in Durable Objects



### Best Practices

- Never commit API tokens# Install dependenciesRestart Claude Desktop and ask:

- Use environment variables for secrets

- Regularly rotate Canvas tokensnpm install> "Show me my Canvas courses"

- Monitor access logs

- Use HTTPS only



## 📄 License# Login to Cloudflare## 📁 Monorepo Structure



MIT License - see LICENSE file for detailswrangler login



## 🤝 Contributing```text



Contributions welcome! Please open an issue first to discuss changes.# Deploy to Cloudflare Workerscanvas-student-mcp-server/



1. Fork the repositorynpm run deploy├── README.md                           # This file

2. Create a feature branch (`git checkout -b feature/amazing-feature`)

3. Commit your changes (`git commit -m 'Add some amazing feature'`)```├── package.json                        # Root package.json for workspace

4. Push to the branch (`git push origin feature/amazing-feature`)

5. Open a Pull Request├── .gitignore                         # Combined gitignore



## 🔗 Links## 🔧 Configuration├── .github/workflows/                  # CI/CD workflows (disabled during restructure)



- [Live Server](https://canvas-mcp-sse.ariff.dev)│   ├── markdown-lint.yml              # Markdown linting workflow

- [GitHub Repository](https://github.com/a-ariff/canvas-student-mcp-server)

- [MCP Documentation](https://modelcontextprotocol.io)### Canvas API Token│   └── security.yml                   # Security scanning

- [Canvas API Docs](https://canvas.instructure.com/doc/api/)

- [Cloudflare Workers](https://workers.cloudflare.com/)└── packages/



## 💬 Support1. Log into Canvas    ├── canvas-student-mcp-server/     # TypeScript MCP Server (Main)



For issues or questions:2. Go to **Account → Settings**    │   ├── src/                       # TypeScript source code

1. Check the [MCP Server README](packages/remote-mcp-server-authless/README.md)

2. Review the [API Proxy README](packages/cloudflare-canvas-api/README.md)3. Scroll to **Approved Integrations**    │   │   ├── index.ts               # MCP server entry point

3. Open an issue on GitHub

4. Review Canvas API documentation4. Click **New Access Token**    │   │   ├── canvas-api.ts          # Canvas API client



## 🎯 Roadmap5. Name it "MCP Server"    │   │   ├── workflow-engine.ts     # Academic workflow automation



- [ ] Gradescope integration6. Copy the token (save securely)    │   │   ├── config.ts              # Configuration management

- [ ] Additional Canvas tools (files, rubrics)

- [ ] Enhanced caching layer    │   │   ├── cache.ts               # Caching system

- [ ] Admin dashboard

- [ ] Multi-institution support### OAuth Configuration    │   │   └── types.ts               # TypeScript definitions



---    │   ├── dist/                      # Built JavaScript



**Built with ❤️ using Cloudflare Workers and MCP**The server uses OAuth 2.1 with PKCE. Configuration is in `packages/remote-mcp-server-authless/src/oauth-config.ts`:    │   ├── docs/                      # Documentation


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

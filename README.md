# Canvas Student MCP Server v2.0

A clean, advanced **Model Context Protocol (MCP) server** for Canvas LMS integration with Claude Desktop. This implementation uses Canvas API tokens instead of credentials for a simple, secure, and reliable experience.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

## ✨ Features

### 🚀 Core Features
- **API Token Authentication** - Secure, no credentials needed
- **Multi-Course Support** - Access all your enrolled courses
- **Assignment Management** - Track due dates, submissions, and grades
- **Content Search** - Smart search across assignments, pages, and modules
- **Calendar Integration** - View upcoming events and deadlines

### 🧠 Advanced Features
- **Smart Caching** - Optimized performance with intelligent caching
- **Content Analysis** - Get insights into your academic progress
- **Grade Tracking** - Monitor your performance across courses
- **File Access** - Download and view course files
- **Real-time Data** - Always up-to-date information from Canvas

### 🛡️ Security & Performance
- **Rate Limiting** - Respects Canvas API limits
- **Memory Efficient** - Optimized caching with TTL
- **Error Handling** - Comprehensive error management
- **Configurable** - Extensive customization options
## 🚀 Quick Start

### 1. Get Your Canvas API Token

1. Log into your Canvas account
2. Go to **Account → Settings**
3. Scroll to **"Approved Integrations"**
4. Click **"+ New Access Token"**
5. Name it "Claude MCP Server"
6. Set expiration (optional, recommended: 1 year)
7. **Copy the token** (save it securely!)

### 2. Install Dependencies

```bash
# Navigate to the project directory
cd packages/canvas-student-mcp-server

# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

### 3. Configure Environment

```bash
# Copy the example configuration
cp .env.example .env

# Edit .env with your details
nano .env
```

Required configuration:
```env
CANVAS_API_KEY=your_actual_api_token_here
CANVAS_BASE_URL=https://your-school.instructure.com
```

### 4. Configure Claude Desktop

Add to your Claude Desktop config (`~/.config/claude/claude_desktop_config.json` or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "canvas-student": {
      "command": "node",
      "args": ["/path/to/canvas-student-mcp-server/dist/index.js"],
      "cwd": "/path/to/canvas-student-mcp-server",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 5. Test the Connection

Restart Claude Desktop and ask:
> "Show me my Canvas courses"

## 📁 Monorepo Structure

```text
canvas-student-mcp-server/
├── README.md                           # This file
├── package.json                        # Root package.json for workspace
├── .gitignore                         # Combined gitignore
├── .github/workflows/                  # CI/CD workflows (disabled during restructure)
│   ├── markdown-lint.yml              # Markdown linting workflow
│   └── security.yml                   # Security scanning
└── packages/
    ├── canvas-student-mcp-server/     # TypeScript MCP Server (Main)
    │   ├── src/                       # TypeScript source code
    │   │   ├── index.ts               # MCP server entry point
    │   │   ├── canvas-api.ts          # Canvas API client
    │   │   ├── workflow-engine.ts     # Academic workflow automation
    │   │   ├── config.ts              # Configuration management
    │   │   ├── cache.ts               # Caching system
    │   │   └── types.ts               # TypeScript definitions
    │   ├── dist/                      # Built JavaScript
    │   ├── docs/                      # Documentation
    │   ├── examples/                  # Usage examples
    │   ├── package.json               # Node.js dependencies
    │   ├── tsconfig.json              # TypeScript config
    │   ├── Dockerfile                 # Docker configuration
    │   ├── docker-compose.yml         # Docker Compose setup
    │   └── README.md                  # MCP server docs
    ├── cloudflare-canvas-api/         # Cloudflare Workers Proxy
    │   ├── src/                       # TypeScript source
    │   ├── package.json               # Dependencies
    │   └── README.md                  # Proxy docs
    └── remote-mcp-server-authless/    # Legacy Remote Server
        ├── src/                       # TypeScript source
        ├── package.json               # Node.js dependencies
        └── README.md                  # Remote server docs
```

## 🛠 Development

This monorepo contains all Canvas MCP implementations in one place for easier development and maintenance.

### 🔄 CI/CD Workflows

- **Markdown Linting**: Ensures documentation quality
- **Security Scans**: Weekly security audits for TypeScript packages
- **Manual Testing**: Type checking and builds validated locally

*Note: Full CI/CD workflows temporarily disabled during monorepo restructuring.*
### 📝 Available Scripts

```bash
# Install dependencies
cd packages/canvas-student-mcp-server
npm install

# Build TypeScript
npm run build

# Development mode (watch for changes)
npm run dev

# Type checking
npm run type-check

# Start MCP server (for testing)
npm start

# Cleanup
npm run clean
```

### 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/a-ariff/canvas-student-mcp-server.git
cd canvas-student-mcp-server
```

2. Install dependencies and build:
```bash
cd packages/canvas-student-mcp-server
npm install
npm run build
```

3. Configure your Canvas API credentials:
```bash
cp .env.example .env
# Edit .env with your Canvas API token and URL
```

4. Configure Claude Desktop:
Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `~/.config/claude/claude_desktop_config.json` (Linux):
```json
{
  "mcpServers": {
    "canvas-student": {
      "command": "node",
      "args": ["/absolute/path/to/canvas-student-mcp-server/packages/canvas-student-mcp-server/dist/index.js"],
      "env": {
        "CANVAS_API_KEY": "your_token_here",
        "CANVAS_BASE_URL": "https://your-school.instructure.com"
      }
    }
  }
}
```

5. Restart Claude Desktop to load the MCP server

## 🔒 Security & Compliance

- **Automated Security Scanning**: Weekly scans for both Python and TypeScript dependencies
- **Code Quality**: Enforced through CI/CD with linting and formatting checks
- **Dependency Management**: Regular updates and vulnerability monitoring
## 📚 Documentation

- **MCP Server Setup**: See `packages/canvas-student-mcp-server/README.md`
- **Workflow Automation**: Built-in academic workflow processing tools
- **API Documentation**: Available in `packages/canvas-student-mcp-server/docs/`
- **Integration Guide**: See `packages/canvas-student-mcp-server/MCP_INTEGRATION.md`
- **Docker Guide**: See `packages/canvas-student-mcp-server/DOCKER_TESTING.md`
- **Troubleshooting**: See `packages/canvas-student-mcp-server/TROUBLESHOOTING.md`
## 🔧 Recent Fixes & Improvements

**✅ Security Issues Fixed:**
- Removed hardcoded credentials from source code
- Added proper environment variable configuration
- Implemented secure credential handling

**✅ MCP Implementation Fixed:**
- Corrected MCP server architecture and entry point
- Fixed Claude Desktop integration configuration
- Updated dependencies and requirements

**✅ Configuration Improvements:**
- Added Claude Desktop setup guide (`CLAUDE_DESKTOP_SETUP.md`)
- Updated smithery.yaml with correct MCP server configuration
- Added proper Python path configuration

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

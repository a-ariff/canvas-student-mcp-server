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
├── .github/workflows/                  # CI/CD workflows
│   ├── test-python.yml                # Python testing workflow
│   ├── test-typescript.yml            # TypeScript testing workflow
│   ├── ci.yml                         # Full monorepo CI/CD
│   └── security.yml                   # Security scanning
└── packages/
    ├── canvas-student-mcp-server/     # Python MCP Server
    │   ├── app.py                     # Main Flask application
    │   ├── src/                       # Python source code
    │   ├── docs/                      # Documentation
    │   ├── examples/                  # Usage examples
    │   ├── requirements.txt           # Python dependencies
    │   ├── Dockerfile                 # Docker configuration
    │   └── README.md                  # Python server docs
    └── remote-mcp-server-authless/    # TypeScript Remote Server
        ├── src/                       # TypeScript source
        ├── package.json               # Node.js dependencies
        ├── tsconfig.json              # TypeScript config
        ├── wrangler.jsonc             # Cloudflare Worker config
        └── README.md                  # TypeScript server docs
```

## 🛠 Development

This monorepo contains all Canvas MCP implementations in one place for easier development and maintenance.

### 🔄 CI/CD Workflows

- **Python Tests**: Runs on Python 3.8-3.11 with linting, formatting, and test coverage
- **TypeScript Tests**: Runs on Node.js 16-20 with ESLint, type checking, and Jest tests  
- **Security Scans**: Weekly security audits for both Python and TypeScript packages
- **Integration Tests**: Full monorepo testing when both packages change
- **Smart Change Detection**: Only tests what changed to optimize CI time
### 📝 Available Scripts

```bash
# Install dependencies for all packages
npm run install:all

# Start servers
npm run start:python        # Start Python MCP server
npm run start:remote        # Start TypeScript remote server

# Testing
npm run test               # Run all tests
npm run test:python        # Test Python package only
npm run test:typescript    # Test TypeScript package only

# Linting
npm run lint              # Lint all packages
npm run lint:python       # Lint Python code only
npm run lint:typescript   # Lint TypeScript code only

# Building
npm run build             # Build TypeScript package

# Cleanup
npm run clean             # Remove all node_modules
```

### 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/a-ariff/canvas-student-mcp-server.git
cd canvas-student-mcp-server
```

1. Install dependencies for both packages:
```bash
npm run install:all
```

1. Configure your Canvas API credentials:
```bash
cp packages/canvas-student-mcp-server/.env.example packages/canvas-student-mcp-server/.env
# Edit the .env file with your Canvas API details
```

1. Run the servers:
```bash
# Python MCP Server
npm run start:python

# TypeScript Remote Server  
npm run start:remote
```

## 🔒 Security & Compliance

- **Automated Security Scanning**: Weekly scans for both Python and TypeScript dependencies
- **Code Quality**: Enforced through CI/CD with linting and formatting checks
- **Dependency Management**: Regular updates and vulnerability monitoring
## 📚 Documentation

- **Python MCP Server**: See `packages/canvas-student-mcp-server/README.md`
- **TypeScript Remote Server**: See `packages/remote-mcp-server-authless/README.md`
- **API Documentation**: Available in `packages/canvas-student-mcp-server/docs/`
- **Integration Guide**: See `packages/canvas-student-mcp-server/MCP_INTEGRATION.md`
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

2. **Configure environment:**
   ```bash
   cp packages/canvas-student-mcp-server/.env.example packages/canvas-student-mcp-server/.env
   # Edit .env with your Canvas credentials
   ```

3. **Setup Claude Desktop:**
   ```bash
   cp claude-desktop-config.json ~/.config/claude-desktop/config.json
   # Edit paths in config.json to match your installation
   ```

4. **Restart Claude Desktop** - Your Canvas MCP server is ready!

## ⚠️ Important Notice

This project is designed for educational purposes and personal academic
management. **Python 3.10+ is required** for full MCP compatibility.
Users are responsible for complying with their institution's
terms of service and applicable policies. Always respect rate limits and
use responsibly.

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

# Canvas Student MCP Server - Complete Toolkit

Complete Canvas LMS integration monorepo with Python MCP server and TypeScript remote server implementations for Model Context Protocol.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 16+](https://img.shields.io/badge/node.js-16+-green.svg)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

## 📦 Packages

### 🐍 Python MCP Server
- **Location**: `packages/canvas-student-mcp-server/`
- **Description**: Flask-based MCP server for Canvas LMS integration
- **Language**: Python 3.8+
- **Features**: Student data access, course management, assignment handling
- **Main File**: `packages/canvas-student-mcp-server/app.py`

### 🔧 Remote MCP Server (Authless)
- **Location**: `packages/remote-mcp-server-authless/`  
- **Description**: TypeScript MCP server for remote operations
- **Language**: TypeScript/Node.js
- **Features**: Cloudflare Worker deployment, authentication-free operations
- **Main File**: `packages/remote-mcp-server-authless/src/index.ts`

## 🚀 Quick Start

### Install All Dependencies
```bash
npm run install:all
```

### Python MCP Server
```bash
cd packages/canvas-student-mcp-server
pip install -r requirements.txt
python app.py
```

### TypeScript Remote Server
```bash
cd packages/remote-mcp-server-authless
npm install
npm start
```

## 📁 Monorepo Structure

```
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

2. Install dependencies for both packages:
```bash
npm run install:all
```

3. Configure your Canvas API credentials:
```bash
cp packages/canvas-student-mcp-server/.env.example packages/canvas-student-mcp-server/.env
# Edit the .env file with your Canvas API details
```

4. Run the servers:
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

## ⚠️ Important Notice

This project is designed for educational purposes and personal academic management. Users are responsible for complying with their institution's terms of service and applicable policies. Always respect rate limits and use responsibly.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

The CI/CD pipeline will automatically test your changes across multiple Python and Node.js versions!
# Smithery Deployment Guide for Canvas Student MCP Server

This guide explains how to use the Canvas Student MCP Server through Smithery and how it works for classmates and other users.

## Table of Contents

- [What is Smithery?](#what-is-smithery)
- [How Remote MCP Servers Work](#how-remote-mcp-servers-work)
- [Installation Methods](#installation-methods)
- [Prerequisites](#prerequisites)
- [Step-by-Step Installation](#step-by-step-installation)
- [Troubleshooting](#troubleshooting)
- [For Developers: How Smithery Works](#for-developers-how-smithery-works)

## What is Smithery?

Smithery is a registry and hosting platform for Model Context Protocol (MCP) servers. It allows developers to publish MCP servers and users to easily discover and install them without complex setup.

**Key Benefits:**
- One-command installation
- No need to clone repositories or manage dependencies
- Automatic updates when new versions are published
- Works with Claude Desktop, Cline, and other MCP clients

## How Remote MCP Servers Work

The Canvas Student MCP Server is a **remote-hosted server**, meaning:

1. **Already Running**: The server is deployed and running at `https://canvas-mcp-sse.ariff.dev`
2. **No Local Installation**: You don't need to download or run the server code
3. **OAuth Authentication**: Secure connection using OAuth 2.1 with your Canvas credentials
4. **Zero Maintenance**: Server is managed and updated automatically

### Architecture

```
Claude Desktop (Your Computer)
         ↓
MCP Client (OAuth2 Client)
         ↓
Canvas MCP Server (https://canvas-mcp-sse.ariff.dev/sse)
         ↓
Canvas LMS API (Your Institution's Canvas)
```

### Smithery Compatibility Note

- Smithery’s GitHub publishing path currently expects a buildable entry (TypeScript/Node) and does not accept a repo that only declares `remote:` in `smithery.yaml`.
- This repo includes a small TypeScript wrapper (`src/index.ts`) that bridges locally to the hosted SSE server via `@modelcontextprotocol/client-oauth2`.
- Result: You install a “local” package from Smithery, but it simply connects to the remote, OAuth-protected MCP server.

## Installation Methods

### Method 1: Smithery CLI (Recommended)

**Easiest method** - Let Smithery configure everything automatically.

### Method 2: Manual Configuration

**More control** - Add configuration directly to Claude Desktop config file.

### Method 3: Use Already-Deployed Server

**Direct connection** - Connect to the hosted server without Smithery.

## Prerequisites

Before installation, ensure you have:

1. **Claude Desktop** installed ([download here](https://claude.ai/download))
2. **Canvas Account** at your institution
3. **Node.js** installed (v18 or higher) - [download here](https://nodejs.org/)
4. **Terminal/Command Line** access

### Check Prerequisites

Run these commands to verify:

```bash
# Check Node.js version
node --version
# Should show v18.0.0 or higher

# Check npm version
npm --version
# Should show 8.0.0 or higher

# Check Claude Desktop is installed
# On macOS:
ls ~/Library/Application\ Support/Claude/
# Should show claude_desktop_config.json
```

## Step-by-Step Installation

### Option 1: Install via Smithery CLI (Easiest)

This is the simplest method and works for most users.

#### Step 1: Install via Smithery

Open your terminal and run:

```bash
npx -y @smithery/cli install @a-ariff/canvas-ai-assistant
```

**What this does:**
- Downloads the Smithery CLI temporarily
- Installs the Canvas MCP server configuration
- Updates your Claude Desktop config automatically

#### Step 2: Restart Claude Desktop

1. Quit Claude Desktop completely (Cmd+Q on macOS)
2. Reopen Claude Desktop
3. Look for a notification about new MCP server

#### Step 3: Authenticate with Canvas

1. Start a conversation in Claude Desktop
2. Click the "Authenticate" button when prompted
3. Your browser will open to Canvas login
4. Log in with your Canvas credentials
5. Authorize the Canvas MCP Server
6. Return to Claude Desktop

#### Step 4: Verify Installation

Try asking Claude:

```
Can you list my Canvas courses?
```

If successful, Claude will show your courses!

---

### Option 2: Manual Configuration

If the Smithery CLI doesn't work, you can configure manually.

#### Step 1: Locate Config File

**On macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**On Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**On Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

#### Step 2: Edit Config File

Open the config file and add this configuration:

```json
{
  "mcpServers": {
    "canvas-ai-assistant": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "@a-ariff/canvas-ai-assistant"]
    }
  }
}
```

**Important Notes:**
- If you already have other MCP servers, add this inside the existing `mcpServers` object
- Make sure JSON syntax is correct (commas between entries)
- Don't duplicate the `mcpServers` key

**Example with existing servers:**

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "some-command",
      "args": ["some-args"]
    },
    "canvas-ai-assistant": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "@a-ariff/canvas-ai-assistant"]
    }
  }
}
```

#### Step 3: Save and Restart

1. Save the config file
2. Quit Claude Desktop (Cmd+Q)
3. Reopen Claude Desktop
4. Follow authentication steps from Option 1

---

### Option 3: Direct Connection (Without Smithery)

Connect directly to the hosted server without using Smithery.

#### Configuration

Add this to your Claude Desktop config:

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

**Pros:**
- Direct connection to production server
- No Smithery intermediary
- Faster updates

**Cons:**
- Manual updates needed
- No version management
- Must track deployment URL

## Troubleshooting

### Issue: "Failed to install" or 500 Error

**Symptoms:**
```
Error: Failed to install @a-ariff/canvas-student-mcp
Status: 500 (Internal Server Error)
```

**Solutions:**

1. **Try Direct Installation Method:**
   Use Option 3 (Direct Connection) instead of Smithery

2. **Check Network Connection:**
   ```bash
   curl https://canvas-mcp-sse.ariff.dev/health
   ```
   Should return: `{"status": "ok"}`

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

4. **Verify Node.js version:**
   ```bash
   node --version
   ```
   Must be v18 or higher

### Issue: "Connection timeout after 30000ms"

**Symptoms:**
- Claude Desktop shows timeout error
- MCP server not responding

**Solutions:**

1. **Check Server Status:**
   ```bash
   curl https://canvas-mcp-sse.ariff.dev/health
   ```

2. **Verify OAuth Configuration:**
   - Make sure you completed OAuth authentication
   - Try re-authenticating

3. **Check Firewall:**
   - Ensure your firewall allows connections to `canvas-mcp-sse.ariff.dev`
   - Check if your institution blocks SSE connections

4. **Restart Claude Desktop:**
   - Completely quit (Cmd+Q)
   - Wait 5 seconds
   - Reopen

### Issue: "smitheryConfigError"

**Symptoms:**
```
Error: smitheryConfigError
Failed to fetch repo files
```

**Cause:**
This error usually occurs when Smithery’s backend cannot read your repository or config, or when trying to publish a remote-only server. Typical root causes:
- smithery.yaml not in the repository root of the default branch (must be at repo root)
- Repository is private or rate-limited (GitHub API access blocked)
- Wrong repo URL/branch configured during submission
- Invalid or unparseable smithery.yaml (YAML syntax, bad keys)
- Large/LFS files or submodules preventing simple fetch
 - Attempting to publish a `remote:`-only configuration (not supported via GitHub publishing). Use the included TypeScript wrapper and `runtime: typescript` instead.

**For Users:**
- This doesn't affect you! The server is already deployed and working
- Use Option 3 (Direct Connection) to bypass Smithery entirely

**For Developers:**
See the [Developer Troubleshooting](#developer-troubleshooting) section below. Verify smithery.yaml matches the remote schema used in this repo (remote → transport.sse + authentication.oauth2).

### Issue: OAuth Authentication Fails

**Symptoms:**
- Browser opens but shows error
- "Authorization failed" message

**Solutions:**

1. **Check Canvas URL:**
   - Verify your institution's Canvas domain is correct
   - Default is configured for your institution

2. **Canvas Token Expired:**
   - Log out of Canvas
   - Log back in
   - Try authentication again

3. **Browser Cookies:**
   - Enable third-party cookies for Canvas domain
   - Clear Canvas cookies and try again

4. **Try Different Browser:**
   - Some browsers block OAuth popups
   - Try Chrome or Firefox

### Issue: "No tools available"

**Symptoms:**
- Claude connects but can't access Canvas tools
- No course information returned

**Solutions:**

1. **Re-authenticate:**
   - Remove the MCP server from config
   - Add it back
   - Complete OAuth flow again

2. **Check Canvas Permissions:**
   - Verify you're logged into Canvas
   - Ensure your Canvas account is active
   - Check Canvas API is accessible

3. **Review Canvas Token:**
   - The OAuth token may have expired
   - Re-authenticate to get a new token

### Issue: Commands Not Working

**Symptoms:**
- Claude doesn't understand Canvas-related requests
- Tools not being invoked

**Solutions:**

1. **Be Specific in Prompts:**
   Instead of: "Show my stuff"
   Try: "List my Canvas courses"

2. **Check MCP Server is Running:**
   ```bash
   # On macOS
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

3. **Verify Tool List:**
   Ask Claude: "What Canvas tools do you have access to?"

## For Developers: How Smithery Works

### Smithery Deployment Architecture

When you submit to Smithery, the platform:

1. **Fetches Repository**: Clones your GitHub repo
2. **Reads Configuration**: Parses `smithery.yaml` in repo root
3. **Determines Runtime**: Uses `runtime` field to decide deployment method
4. **Builds Project**:
   - For TypeScript: Runs `@smithery/cli build`
   - For Container: Builds Docker image
5. **Hosts Server**: Deploys to Smithery's infrastructure
6. **Provides Endpoint**: Makes available at `https://server.smithery.ai/...`

### Understanding smithery.yaml

```yaml
# Required Fields
name: canvas-ai-assistant          # Server identifier
runtime: "typescript"              # "typescript" or "container"

# Optional Fields
description: "..."                 # Short description
version: "3.0.0"                  # Semantic version
author: a-ariff                   # GitHub username
homepage: https://github.com/...  # Repository URL
license: MIT                      # License type

# Environment Variables (Optional)
env:
  NODE_ENV: "production"          # Injected at runtime
```

### Runtime Types

#### TypeScript Runtime

**When to use:**
- Project is written in TypeScript
- Uses standard Node.js dependencies
- Follows MCP SDK patterns

**What Smithery does:**
1. Runs `npm install` to get dependencies
2. Runs `@smithery/cli build` to compile TypeScript
3. Starts as Streamable HTTP server
4. Handles /mcp endpoint routing

**Requirements:**
- `package.json` in repository root OR in a package subdirectory
- TypeScript source files
- Exports MCP server handlers

#### Container Runtime

**When to use:**
- Custom deployment requirements
- Non-TypeScript languages (Python, Go, etc.)
- Need specific system dependencies
- Custom HTTP server implementation

**Configuration:**
```yaml
runtime: "container"
startCommand:
  type: "http"
  configSchema:
    type: "object"
    properties:
      # Define configuration options
build:
  dockerfile: "Dockerfile"
  dockerBuildPath: "."
```

**Requirements:**
- Server listens on PORT environment variable (set to 8081)
- Implements Streamable HTTP protocol
- Handles /mcp endpoint
- Accepts config via query parameter

### Why "Failed to fetch repo files" Happens

This error occurs when:

1. **Missing package.json**: Smithery can't find a valid package.json
   - **Fix**: Ensure package.json exists in repo root or packages/*

2. **Wrong Runtime Type**: Using "typescript" but project structure is wrong
   - **Fix**: Use "container" runtime for complex deployments

3. **Private Repository**: Smithery can't access private repos
   - **Fix**: Make repository public

4. **Branch Not Found**: Smithery looks at default branch
   - **Fix**: Merge your changes to main/master branch

5. **Smithery Service Issues**: Backend problems
   - **Fix**: Wait and retry, or deploy directly without Smithery

### Testing Before Smithery Deployment

Before submitting to Smithery:

1. **Test Locally:**
   ```bash
   cd packages/remote-mcp-server-authless
   npm run dev
   ```

2. **Test with Claude:**
   Configure Claude to use your local server:
   ```json
   {
     "mcpServers": {
       "canvas-local": {
         "command": "node",
         "args": ["/path/to/your/server/dist/index.js"]
       }
     }
   }
   ```

3. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   ```
   Test with your Cloudflare Workers URL

4. **Then Submit to Smithery:**
   Only after confirming everything works

### Developer Troubleshooting

#### Issue: smitheryConfigError

**Root Causes:**
1. Incorrect workspace structure
2. Missing package.json in expected location
3. Invalid smithery.yaml format

**Solutions:**

1. **Simplify Structure:**
   - Move package.json to repository root
   - Or use monorepo structure with workspaces

2. **Switch to Container Runtime:**
   ```yaml
   runtime: "container"
   ```
   More control over deployment

3. **Bypass Smithery:**
   - Deploy directly to Cloudflare Workers
   - Users connect directly to your URL
   - Skip Smithery entirely

#### Issue: Build Failures

**Check Smithery Build Logs:**
- Look for deployment status on Smithery dashboard
- Check for npm install errors
- Verify TypeScript compilation succeeds

**Common Fixes:**
- Lock dependency versions in package.json
- Use Node.js LTS version (18 or 20)
- Remove platform-specific dependencies

## Best Practices

### For Users

1. **Keep Claude Updated**: New versions have better MCP support
2. **Restart After Changes**: Always restart Claude after config changes
3. **Check Server Status**: Visit https://canvas-mcp-sse.ariff.dev/health
4. **Use Specific Prompts**: Be clear about what Canvas data you need

### For Developers

1. **Test Locally First**: Don't deploy untested code
2. **Use Semantic Versioning**: Update version in smithery.yaml
3. **Document Changes**: Keep CHANGELOG.md updated
4. **Monitor Deployment**: Check Smithery dashboard for errors
5. **Provide Health Endpoint**: Makes troubleshooting easier

## Additional Resources

- **Smithery Documentation**: https://smithery.ai/docs
- **MCP Documentation**: https://modelcontextprotocol.io
- **Canvas API Docs**: https://canvas.instructure.com/doc/api/
- **GitHub Repository**: https://github.com/a-ariff/canvas-student-mcp-server
- **Live Server**: https://canvas-mcp-sse.ariff.dev

## Support

If you encounter issues:

1. **Check This Guide**: Most issues are covered in Troubleshooting
2. **Review Server Status**: https://canvas-mcp-sse.ariff.dev/health
3. **Check GitHub Issues**: https://github.com/a-ariff/canvas-student-mcp-server/issues
4. **Open New Issue**: Include error messages and config file (redact sensitive info)

## Quick Reference Card

**Installation Command:**
```bash
npx -y @smithery/cli install @a-ariff/canvas-ai-assistant
```

**Direct Connection Config:**
```json
{
  "mcpServers": {
    "canvas-mcp": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/client-oauth2", "https://canvas-mcp-sse.ariff.dev/sse"]
    }
  }
}
```

**Check Server Health:**
```bash
curl https://canvas-mcp-sse.ariff.dev/health
```

**Config File Locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

---

**Last Updated**: October 31, 2025
**Version**: 3.0.1
**Author**: Ariff (a-ariff)

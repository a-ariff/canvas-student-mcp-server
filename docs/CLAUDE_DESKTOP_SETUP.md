# Claude Desktop Setup Guide

Complete guide to integrate Canvas Student MCP Server with Claude Desktop.

## 🚀 Quick Start (Hosted Server)

The easiest way to get started is using our hosted production server with OAuth 2.1 authentication.

### Prerequisites

- Claude Desktop installed (download from [claude.ai](https://claude.ai/download))
- Canvas LMS account with API access
- Your Canvas institution URL (e.g., `canvas.instructure.com` or `learn.yourschool.edu`)

### Step 1: Locate Your Configuration File

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/claude/claude_desktop_config.json
```

If the file doesn't exist, create it with empty JSON: `{}`

### Step 2: Add MCP Server Configuration

Edit your `claude_desktop_config.json` and add:

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

### Step 3: Restart Claude Desktop

1. **Quit Claude Desktop completely** (not just close the window)
   - macOS: `Cmd + Q`
   - Windows: Right-click tray icon → Exit
   - Linux: Kill the process

2. **Relaunch Claude Desktop**

### Step 4: Authenticate with OAuth

1. When you first interact with Canvas commands, Claude will prompt you to authenticate
2. Click the authentication link that appears
3. You'll be redirected to the OAuth authorization page
4. Authorize the application
5. Your browser will redirect back with confirmation
6. Return to Claude Desktop - you're now connected!

### Step 5: Configure Your Canvas Credentials

After OAuth authentication, you need to provide your Canvas API token and base URL. In Claude, send this message:

```
Please save my Canvas configuration:
- Base URL: https://canvas.instructure.com
- API Token: YOUR_CANVAS_API_TOKEN
```

#### How to Get Your Canvas API Token

1. Log into your Canvas LMS instance
2. Go to **Account** → **Settings**
3. Scroll down to **Approved Integrations**
4. Click **+ New Access Token**
5. Enter a purpose (e.g., "Claude Desktop MCP")
6. Click **Generate Token**
7. Copy the token immediately (you won't see it again!)

### Step 6: Test the Connection

Try these commands in Claude Desktop:

```
List my Canvas courses
```

```
Show me my upcoming assignments
```

```
What's due this week?
```

```
Get my course grades
```

## 🔧 Advanced Configuration

### Using Multiple MCP Servers

You can run multiple MCP servers alongside Canvas:

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
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/your-name"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

### Environment Variables (Self-Hosted)

If you're running your own deployment:

```json
{
  "mcpServers": {
    "canvas-mcp": {
      "command": "node",
      "args": ["/path/to/canvas-mcp-server/dist/index.js"],
      "env": {
        "CANVAS_API_KEY": "your_canvas_api_token",
        "CANVAS_BASE_URL": "https://your-school.instructure.com",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 🛠️ Troubleshooting

### Issue: "MCP server not found" or "Connection failed"

**Solution:**
1. Verify the config file path is correct
2. Ensure JSON syntax is valid (use [jsonlint.com](https://jsonlint.com))
3. Restart Claude Desktop completely
4. Check that `npx` is available in your PATH: `which npx` (macOS/Linux) or `where npx` (Windows)

### Issue: "OAuth authentication failed"

**Solution:**
1. Clear your OAuth tokens:
   ```bash
   # macOS/Linux
   rm -rf ~/Library/Application\ Support/Claude/oauth_tokens/
   
   # Windows
   rmdir /s %APPDATA%\Claude\oauth_tokens
   ```
2. Restart Claude Desktop
3. Try authenticating again

### Issue: "Canvas API returned 401 Unauthorized"

**Solution:**
1. Verify your Canvas API token is valid
2. Check that your token hasn't expired
3. Ensure you're using the correct Canvas base URL
4. Re-configure your Canvas credentials in Claude

### Issue: "No courses found" or empty results

**Solution:**
1. Verify you're enrolled in courses on Canvas
2. Check that your API token has the correct permissions
3. Try accessing Canvas directly in a browser to confirm your account status

### Issue: Commands are slow or timing out

**Solution:**
1. Check your internet connection
2. Verify Canvas API is accessible: `curl https://your-canvas-url/api/v1/users/self/profile -H "Authorization: Bearer YOUR_TOKEN"`
3. Check Cloudflare Workers status: [cloudflarestatus.com](https://www.cloudflarestatus.com)

### Issue: "Invalid JSON in config file"

**Solution:**
1. Validate your JSON at [jsonlint.com](https://jsonlint.com)
2. Common issues:
   - Missing commas between objects
   - Trailing commas (not allowed in JSON)
   - Unescaped backslashes in Windows paths (use `\\` or `/`)
   - Missing closing brackets `}` or `]`

## 📚 Available Commands

Once connected, you can ask Claude to:

### Course Management
- "List all my Canvas courses"
- "Show me modules in [course name]"
- "What's my profile information?"

### Assignments
- "Show me assignments for [course name]"
- "What assignments are due this week?"
- "List all my upcoming assignments"
- "What's my grade on [assignment name]?"

### Submissions
- "Show me my submission for [assignment]"
- "List my recent submissions"
- "What feedback did I get on [assignment]?"

### Communication
- "Show me recent announcements"
- "What discussions are active in [course]?"
- "What's on my Canvas calendar?"

### Grades & Progress
- "What are my current grades?"
- "Show me my todo list"
- "What courses am I failing?"

## 🔐 Security & Privacy

### OAuth 2.1 Security Features

- ✅ **PKCE (Proof Key for Code Exchange)** - Protects against authorization code interception
- ✅ **State parameter validation** - Prevents CSRF attacks
- ✅ **Secure token storage** - Tokens stored in Cloudflare KV with encryption
- ✅ **Token expiration** - OAuth tokens automatically expire and refresh
- ✅ **Client ID whitelist** - Only authorized clients can authenticate

### Privacy Policy

Read our full privacy policy at: [https://canvas-mcp-sse.ariff.dev/privacy](https://canvas-mcp-sse.ariff.dev/privacy)

**Key points:**
- We never store your Canvas API token permanently
- Your credentials are isolated per OAuth session
- No analytics or tracking
- Open source - audit the code yourself

### Best Practices

1. **Never share your Canvas API token** - It's as sensitive as your password
2. **Use token expiration** - Generate tokens with expiration dates
3. **Revoke unused tokens** - Remove old tokens from Canvas settings
4. **Monitor access logs** - Check Canvas for unexpected API activity
5. **Use HTTPS only** - Never send tokens over unencrypted connections

## 🆘 Getting Help

### Resources

- **Documentation**: [GitHub Repository](https://github.com/a-ariff/canvas-student-mcp-server)
- **Issues**: [Report a bug](https://github.com/a-ariff/canvas-student-mcp-server/issues)
- **OAuth Details**: [AUTHENTICATION.md](../packages/remote-mcp-server-authless/AUTHENTICATION.md)
- **API Reference**: [Canvas LMS REST API](https://canvas.instructure.com/doc/api/)

### Common Questions

**Q: Is this official Canvas software?**  
A: No, this is a third-party integration built using Canvas's public API.

**Q: Can I use this with any Canvas instance?**  
A: Yes! It works with canvas.instructure.com and any self-hosted Canvas LMS installation.

**Q: Does this work with Canvancement?**  
A: This is independent of Canvancement. It's a direct Canvas API integration.

**Q: Will this affect my Canvas account?**  
A: No, this only reads data from Canvas. It doesn't modify anything unless you explicitly ask Claude to take action.

**Q: Is my data sent to third parties?**  
A: Your Canvas API token is only used to make requests directly to Canvas. The MCP server acts as a proxy and doesn't store or log your token.

## 🎯 What's Next?

- ✅ Explore all 12 Canvas tools available
- ✅ Create custom workflows with Claude (e.g., "Summarize all my assignments due this week")
- ✅ Combine with other MCP servers for powerful automation
- ✅ Check out [ChatGPT integration](./CHATGPT_SETUP.md) if you prefer ChatGPT

---

**Built with ❤️ using Cloudflare Workers and MCP**  
**Star us on [GitHub](https://github.com/a-ariff/canvas-student-mcp-server)** ⭐

---

## 🏷️ Tags & Keywords

`#claude-desktop` `#claude-ai` `#canvas-lms` `#canvas-integration` `#mcp` `#model-context-protocol` `#oauth2` `#canvas-api` `#student-tools` `#education-technology` `#edtech` `#learning-management-system` `#ai-assistant` `#chatbot` `#cloudflare-workers` `#serverless` `#instructure-canvas` `#canvas-student` `#mcp-server` `#sse` `#server-sent-events` `#typescript` `#oauth-authentication` `#canvas-courses` `#canvas-assignments` `#canvas-grades` `#academic-tools` `#study-assistant`

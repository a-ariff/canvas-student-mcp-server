# Smithery Test Profile Configuration

**CRITICAL:** This is the missing piece that allows Smithery scanner to connect to your remote SSE + OAuth server!

---

## The Problem

Smithery scanner logs showed:
```
[1:09:37 AM] No test config found, using best guess
[1:10:10 AM] OAuth check result: {"requiresOAuth":false,"oauthCheckOk":false}
[1:10:10 AM] Failed to fetch .well-known/mcp-config
[1:10:20 AM] HTTP error: This operation was aborted
```

**Why it failed:**
- Scanner defaulted to HTTP JSON transport
- Tried to connect directly to your server
- Your server is SSE + OAuth, not HTTP JSON
- Connection timed out
- Scanner couldn't extract tools

---

## The Solution

**Configure a Test Profile** on Smithery dashboard to tell the scanner how to connect properly.

### Step-by-Step Instructions

#### 1. Go to Your Server Page
Visit: https://smithery.ai/server/@a-ariff/canvas-ai-assistant

#### 2. Navigate to Test Profile
- Look for **"Test Profile"** tab or **"Configure"** button
- Click to access test configuration

#### 3. Configure Connection Settings

**Transport:**
```
SSE
```

**SSE URL:**
```
https://canvas-mcp-sse.ariff.dev/sse
```

**Authentication:**
```
OAuth 2.0 / 2.1 (Authorization Code + PKCE)
```

**Discovery URL:**
```
https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server
```

**Client ID:**
```
canvas-mcp-client
```

**Scopes:**
```
openid, profile, email
```

#### 4. Add Environment Variables

Under **Env** section, add:

| Name | Value |
|------|-------|
| `CANVAS_BASE_URL` | `https://learn.mywhitecliffe.com` |

#### 5. Test Connection

- Click **"Connect"** button
- You'll be redirected to OAuth authorization
- Approve the authorization
- Should return to Smithery with "Connected" status

#### 6. Save and Rescan

- Click **"Save"** to save the test profile
- Click **"Rescan"** to trigger new tool extraction
- Scanner will now use SSE + OAuth to connect
- Tools should be extracted successfully

---

## Why This Fixes It

### Before Configuration (Failed)
```
Scanner → Assumes HTTP JSON
        → Tries direct MCP protocol
        → Times out
        → Reports: "No OAuth", "No config"
        → Cannot extract tools
```

### After Configuration (Works)
```
Scanner → Reads test profile
        → Uses SSE transport
        → Connects to https://canvas-mcp-sse.ariff.dev/sse
        → Authenticates via OAuth
        → Speaks MCP over SSE
        → Successfully extracts tools ✅
```

---

## Verification

After configuring and rescanning, check:

### 1. Scanner Logs Should Show Success
```
✅ Connected via SSE
✅ OAuth authentication succeeded
✅ MCP initialized
✅ Tools extracted: 10 tools
```

### 2. Server Page Should Display Tools
- Get Courses
- Get Assignments
- Get Calendar Events
- Get Grades
- Get Announcements
- Get Modules
- Get Todos
- Get Discussions
- Get Quizzes
- Get Profile

### 3. Deployment Status Should Be Active
- No more "No deployments found"
- Shows version, tools, description
- Installation command available

---

## Test Profile Configuration Summary

```yaml
# Smithery Test Profile Configuration

transport: SSE
url: https://canvas-mcp-sse.ariff.dev/sse

auth:
  type: oauth2.1
  flow: authorization_code_pkce
  discovery_url: https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server
  client_id: canvas-mcp-client
  scopes:
    - openid
    - profile
    - email

environment:
  CANVAS_BASE_URL: https://learn.mywhitecliffe.com
```

---

## For Other Remote MCP Servers

If you have other remote MCP servers with OAuth:

1. Always configure a test profile
2. Specify exact transport (SSE/HTTP/WebSocket)
3. Provide OAuth discovery URL
4. Add required environment variables
5. Test connection before saving
6. Rescan after configuration

**Don't rely on "best guess" - it will fail for OAuth servers!**

---

## Troubleshooting

### Issue: "Connect" Button Does Nothing

**Cause:** OAuth discovery URL might be wrong

**Fix:**
```bash
# Test discovery URL
curl https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server

# Should return JSON with authorization_endpoint, token_endpoint, etc.
```

### Issue: OAuth Authorization Fails

**Cause:** Client ID mismatch or scopes invalid

**Fix:**
- Verify client_id matches your server configuration
- Check scopes are supported by your OAuth server
- Look at server logs for authorization errors

### Issue: Scanner Still Times Out After Config

**Cause:** SSE URL might be incorrect or server is down

**Fix:**
```bash
# Test SSE endpoint
curl -N -H "Accept: text/event-stream" https://canvas-mcp-sse.ariff.dev/sse

# Should return event stream (may require auth)
```

### Issue: Tools Not Extracted After Successful Connection

**Cause:** MCP protocol mismatch or server error

**Fix:**
- Check server supports `tools/list` method
- Verify MCP protocol version compatibility
- Look at Smithery scanner logs for specific errors

---

## Architecture Note

Your Canvas MCP server has a unique architecture:

```
User Installation (via Smithery)
    ↓
npx @smithery/cli install @a-ariff/canvas-ai-assistant
    ↓
Downloads wrapper package (dist/index.js)
    ↓
Wrapper spawns: npx @modelcontextprotocol/client-oauth2
    ↓
Client connects to: https://canvas-mcp-sse.ariff.dev/sse
    ↓
SSE + OAuth authentication
    ↓
MCP server on Cloudflare Workers
```

**Key Point:** The Smithery scanner needs to test the actual SSE server, not the wrapper. That's why the test profile points directly to the SSE endpoint.

---

## Next Steps After Configuration

1. **Save test profile**
2. **Click "Rescan"**
3. **Wait 30-60 seconds** for scanner
4. **Refresh page** to see updated tools
5. **Test installation:**
   ```bash
   npx @smithery/cli install @a-ariff/canvas-ai-assistant
   ```
6. **Verify tools are listed** in Smithery UI

---

## Update Deployment Status

After successful configuration and rescan:

```bash
# Check if deployment now shows
curl -s https://smithery.ai/server/@a-ariff/canvas-ai-assistant | grep -i "no deployments"

# Should return NOTHING (no "No deployments found")

# Check tools are listed
curl -s https://smithery.ai/server/@a-ariff/canvas-ai-assistant | grep -i "get_courses"

# Should find the tool
```

If all checks pass, update `SMITHERY_DEPLOYMENT_STATUS.md`:
```markdown
**Status:** ✅ DEPLOYED AND VERIFIED

**Test Profile:** Configured
**Scanner:** Successfully connected via SSE + OAuth
**Tools:** 10 tools extracted
**Verified:** [timestamp]
```

---

**Last Updated:** October 31, 2025 22:15 UTC
**Status:** Configuration instructions ready
**Action Required:** User must configure test profile on Smithery dashboard

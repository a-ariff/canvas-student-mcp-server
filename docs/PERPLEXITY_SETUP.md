# Perplexity Integration Guide

Complete guide to integrate Canvas Student MCP Server with Perplexity AI.

## 🚀 Overview

Perplexity AI now supports MCP (Model Context Protocol) connectors! You can connect Canvas MCP Server directly to Perplexity Desktop app, similar to Claude Desktop integration.

## 📋 Quick Start (Native MCP Support)

**Good News:** Perplexity Desktop app has native MCP connector support through the Advanced Settings!

### Method 1: MCP Connector (Recommended)

Use Perplexity's built-in MCP connector feature to connect directly to Canvas MCP Server.

### Method 2: REST API Integration

Use our REST API endpoints for custom integrations or web-based access.

### Method 3: Webhooks & Automation

Set up webhooks with tools like Zapier or Make.com to connect Perplexity with Canvas.

## 🎯 Method 1: Native MCP Connector (Recommended)

### Prerequisites

- Perplexity Desktop app installed (macOS)
- Canvas LMS account with API access
- Your Canvas institution URL

### Step 1: Open Perplexity Settings

1. Launch Perplexity Desktop app
2. Go to **Settings** (⚙️ icon or `Cmd + ,`)
3. Navigate to **Connectors** section
4. Click **Add Connector**
5. Select **Advanced** option

### Step 2: Configure MCP Connector

Add the following JSON configuration (similar to Claude Desktop setup):

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

### Step 3: Save and Restart

1. Click **Save** or **Add Connector**
2. Restart Perplexity Desktop app
3. You should see "Canvas MCP" connector available

### Step 4: Authenticate via OAuth

1. When you first use Canvas commands, Perplexity will prompt for OAuth authentication
2. Click the authentication link
3. Authorize the application in your browser
4. Return to Perplexity - you're connected!

### Step 5: Configure Canvas Credentials

After OAuth, provide your Canvas API token:

```
Please save my Canvas configuration:
- Base URL: https://canvas.instructure.com
- API Token: YOUR_CANVAS_API_TOKEN
```

**How to get your Canvas API token:** See [Canvas Token Setup](#canvas-token-setup) below.

### Step 6: Start Using Canvas Tools

Try these queries in Perplexity:

```
What are my Canvas courses?
```

```
Show me assignments due this week
```

```
What's my current grade in Computer Science?
```

## 📸 Visual Guide

![Perplexity MCP Connector Setup](/Users/ariff/Downloads/perplexity%20sample.jpg)

The setup screen shows:
- Settings → Connectors → Add Connector → Advanced
- JSON configuration field (same format as Claude Desktop)
- Save button to activate the connector

## 🔧 Method 2: REST API Integration

### Step 1: Get Your Canvas API Token

1. Log into your Canvas LMS instance
2. Go to **Account** → **Settings**
3. Scroll to **Approved Integrations**
4. Click **+ New Access Token**
5. Purpose: "Perplexity Canvas Integration"
6. Click **Generate Token** and copy it

### Step 2: Authenticate with MCP Server

Make a POST request to save your credentials:

```bash
curl -X POST https://canvas-mcp-sse.ariff.dev/api/v1/canvas/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -d '{
    "canvas_base_url": "https://canvas.instructure.com",
    "canvas_api_key": "YOUR_CANVAS_API_TOKEN"
  }'
```

**Note:** You'll need an OAuth token from the MCP server first. See [OAuth Setup](#oauth-setup) below.

### Step 3: Query Canvas Data

Once authenticated, you can make API calls:

#### List All Courses

```bash
curl https://canvas-mcp-sse.ariff.dev/api/v1/canvas/courses \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN"
```

#### Get Course Assignments

```bash
curl https://canvas-mcp-sse.ariff.dev/api/v1/canvas/courses/COURSE_ID/assignments \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN"
```

#### Get Upcoming Assignments

```bash
curl https://canvas-mcp-sse.ariff.dev/api/v1/canvas/assignments/upcoming \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN"
```

### Step 4: Use in Perplexity Queries

While Perplexity doesn't directly execute API calls, you can:

1. **Fetch data externally** and paste it into Perplexity
2. **Use browser extensions** to inject Canvas data
3. **Create custom scripts** that fetch data and format it for Perplexity

## 🔗 OAuth Setup

To get an OAuth token for API access:

### Option 1: Browser Flow

1. Visit: `https://canvas-mcp-sse.ariff.dev/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&state=random_state`
2. Authorize the application
3. Exchange the code for a token at `/oauth/token`

### Option 2: Use Claude Desktop or ChatGPT

Since Perplexity doesn't natively support OAuth:

1. Set up Canvas MCP in Claude Desktop (see [Claude Setup Guide](./CLAUDE_DESKTOP_SETUP.md))
2. Get Canvas data in Claude
3. Copy the formatted results to Perplexity for further analysis

## 🛠️ Alternative Integrations

### Method A: Zapier Automation

**Setup:**

1. Create a Zapier account
2. Create a new Zap:
   - **Trigger**: Schedule (daily) or Webhook
   - **Action**: HTTP Request to Canvas MCP API
3. Send results to:
   - Email
   - Slack
   - Google Sheets
   - Any other service

**Example Zap:**
```
Schedule (Daily 8 AM)
  ↓
HTTP Request: GET /api/v1/canvas/assignments/upcoming
  ↓
Format as Email
  ↓
Send Email with Assignment Summary
```

You can then ask Perplexity to analyze the data from your email or sheet.

### Method B: Make.com (Integromat)

**Setup:**

1. Create a Make.com account
2. Create a scenario:
   - **Trigger**: Schedule or Webhook
   - **Modules**: HTTP → Data Store → Output
3. Store Canvas data in Make.com's data store
4. Access via API endpoint

**Example Scenario:**
```
Schedule → Canvas API → Parse JSON → Store in Airtable
```

Then query Airtable in Perplexity or other tools.

### Method C: Custom Middleware

Build a simple middleware that:

1. Fetches Canvas data from MCP server
2. Formats it for Perplexity's context
3. Provides a web interface or API endpoint

**Example with Node.js:**

```javascript
const express = require('express');
const axios = require('axios');

const app = express();

app.get('/canvas-summary', async (req, res) => {
  const oauthToken = req.headers.authorization;
  
  // Fetch from Canvas MCP
  const courses = await axios.get(
    'https://canvas-mcp-sse.ariff.dev/api/v1/canvas/courses',
    { headers: { Authorization: oauthToken } }
  );
  
  const assignments = await axios.get(
    'https://canvas-mcp-sse.ariff.dev/api/v1/canvas/assignments/upcoming',
    { headers: { Authorization: oauthToken } }
  );
  
  // Format for easy reading
  const summary = {
    courseCount: courses.data.length,
    upcomingAssignments: assignments.data.length,
    urgentItems: assignments.data.filter(a => 
      new Date(a.due_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
  };
  
  res.json(summary);
});

app.listen(3000);
```

Then paste the JSON output into Perplexity for analysis.

## 📊 Use Cases with Perplexity

### 1. Assignment Analysis

**Workflow:**
1. Fetch your assignments from Canvas API
2. Paste the data into Perplexity
3. Ask: *"Analyze these assignments and create a study schedule prioritizing by difficulty and due date"*

### 2. Course Planning

**Workflow:**
1. Get course syllabi and assignment list
2. Share with Perplexity
3. Ask: *"Create a semester plan that balances my workload across these courses"*

### 3. Grade Tracking

**Workflow:**
1. Fetch current grades from Canvas
2. Input into Perplexity
3. Ask: *"What GPA do I need on remaining assignments to achieve a 3.5 overall?"*

### 4. Study Resource Recommendations

**Workflow:**
1. Share assignment topics from Canvas
2. Ask Perplexity: *"What are the best resources to learn [topic] for this assignment?"*

## 🔐 Security Best Practices

### Token Management

1. **Never share OAuth tokens** - Treat them like passwords
2. **Use short-lived tokens** when possible
3. **Revoke tokens** after use if doing one-time queries
4. **Monitor Canvas access logs** for unexpected activity

### Data Privacy

1. **Don't paste sensitive data** into Perplexity (student IDs, grades of others, etc.)
2. **Use summarized data** instead of raw API responses when possible
3. **Check your institution's policies** on third-party AI tool usage
4. **Be aware of data retention** - Perplexity may store conversation history

### API Security

1. **Use HTTPS only** for all API requests
2. **Validate SSL certificates** in scripts
3. **Store credentials securely** (environment variables, secret managers)
4. **Rotate tokens regularly** (monthly recommended)

## 🆘 Troubleshooting

### Issue: "Cannot make API calls from Perplexity directly"

**Solution:**
Perplexity doesn't execute code or make HTTP requests. Use one of these alternatives:
- Fetch data externally and paste results
- Use automation tools (Zapier, Make.com)
- Build a custom middleware

### Issue: "OAuth token expired"

**Solution:**
1. OAuth tokens from the MCP server expire after 24 hours
2. Re-authenticate to get a new token
3. Consider building a refresh token mechanism in your middleware

### Issue: "Canvas API rate limiting"

**Solution:**
1. Canvas limits API calls to ~100 requests per 10 seconds per token
2. Implement caching in your middleware
3. Batch requests when possible
4. Use the Canvas API's pagination properly

### Issue: "CORS errors in browser"

**Solution:**
- The MCP server API has CORS restrictions
- Use server-side requests (Node.js, Python) instead of browser fetch
- Or use a proxy service that handles CORS

## 📚 API Reference

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/canvas/config` | POST | Save Canvas credentials |
| `/api/v1/canvas/courses` | GET | List all courses |
| `/api/v1/canvas/courses/:id/assignments` | GET | Get course assignments |
| `/api/v1/canvas/assignments/upcoming` | GET | Get upcoming assignments |

### Authentication

All endpoints require OAuth Bearer token:

```
Authorization: Bearer YOUR_OAUTH_TOKEN
```

### Response Format

All responses are JSON:

```json
{
  "data": [...],
  "meta": {
    "count": 10,
    "timestamp": "2025-10-13T12:00:00Z"
  }
}
```

## 🎯 MCP Support Status

### ✅ Perplexity HAS MCP Support!

As of October 2025, Perplexity Desktop app includes native MCP connector support through the Advanced settings. This means:

1. ✅ Direct SSE connection to `https://canvas-mcp-sse.ariff.dev/sse`
2. ✅ OAuth authentication flow built-in
3. ✅ Real-time Canvas data access in conversations
4. ✅ Same setup experience as Claude Desktop

### How It Works

The MCP connector in Perplexity uses the same configuration format as Claude Desktop:
- JSON-based server configuration
- OAuth 2.1 authentication
- Server-Sent Events (SSE) transport
- Access to all 12 Canvas tools

**Stay Updated:**
- Follow Perplexity's [changelog](https://www.perplexity.ai/hub/changelog) for connector updates
- Check MCP protocol updates: [modelcontextprotocol.io](https://modelcontextprotocol.io)

## 🆘 Getting Help

### Resources

- **Main Repository**: [github.com/a-ariff/canvas-student-mcp-server](https://github.com/a-ariff/canvas-student-mcp-server)
- **API Documentation**: [Canvas LMS REST API](https://canvas.instructure.com/doc/api/)
- **Perplexity Help**: [Perplexity AI Help Center](https://www.perplexity.ai/help)
- **Report Issues**: [GitHub Issues](https://github.com/a-ariff/canvas-student-mcp-server/issues)

### Other AI Tools with MCP Support

Confirmed working with Canvas MCP Server:

- ✅ **Perplexity Desktop** - Native MCP connectors (This guide!)
- ✅ **Claude Desktop** - Full MCP support ([Setup Guide](./CLAUDE_DESKTOP_SETUP.md))
- ✅ **ChatGPT GPTs** - OAuth & API Actions ([Setup Guide](./CHATGPT_SETUP.md))
- 🚧 **Cursor IDE** - MCP support in development
- 🚧 **Zed Editor** - MCP support coming soon

## 🎯 Quick Wins

### 1. Daily Assignment Email

Use Zapier to send daily Canvas assignment summaries, then analyze with Perplexity.

### 2. Grade Calculator

Fetch current grades, paste into Perplexity, and ask for GPA calculations.

### 3. Study Schedule Generator

Get all assignments, share with Perplexity, and generate an optimal study plan.

### 4. Course Comparison

Compare course workloads across semesters using Canvas data + Perplexity analysis.

---

**Note:** This guide will be updated as Perplexity adds new integration capabilities.

**Built with ❤️ using Cloudflare Workers and OAuth 2.1**  
**Star us on [GitHub](https://github.com/a-ariff/canvas-student-mcp-server)** ⭐

# ChatGPT Integration Guide

Complete guide to integrate Canvas Student MCP Server with ChatGPT using GPT Actions.

## 🚀 Overview

This guide shows you how to create a custom ChatGPT GPT that can access your Canvas LMS data using OAuth 2.1 authentication and REST API endpoints.

## 📋 Prerequisites

- ChatGPT Plus or Enterprise account (required for GPTs)
- Canvas LMS account with API access
- Your Canvas institution URL (e.g., `canvas.instructure.com`)
- Canvas API token

## 🔧 Step-by-Step Setup

### Step 1: Create a New GPT

1. Go to [ChatGPT](https://chat.openai.com)
2. Click your profile picture → **My GPTs**
3. Click **Create a GPT**
4. Click **Configure** tab (skip the Create tab)

### Step 2: Configure Basic Settings

Fill in these fields:

**Name:**
```
Canvas Student Assistant
```

**Description:**
```
Access your Canvas LMS courses, assignments, grades, and more directly in ChatGPT.
```

**Instructions:**
```
You are a Canvas Student Assistant that helps students manage their coursework on Canvas LMS.

You have access to the following Canvas data via API:
- Courses and enrollments
- Assignments and submissions
- Grades and todos
- Announcements and discussions
- Calendar events
- User profile

When a user asks about their Canvas data:
1. Use the appropriate API action to fetch the data
2. Present the information in a clear, organized format
3. Offer helpful insights (e.g., prioritize urgent assignments)
4. Suggest study strategies when relevant

Always be encouraging and supportive in your responses.
```

**Conversation Starters:**
```
📚 What courses am I taking?
📝 What assignments are due soon?
📊 Show me my current grades
📅 What's on my Canvas calendar?
```

### Step 3: Configure Canvas Credentials Action

Scroll down to **Actions** section and click **Create new action**.

#### Action 1: Save Canvas Configuration

**Schema:**

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Canvas Student MCP Server",
    "description": "Access Canvas LMS data via MCP server",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://canvas-mcp-sse.ariff.dev"
    }
  ],
  "paths": {
    "/api/v1/canvas/config": {
      "post": {
        "operationId": "saveCanvasConfig",
        "summary": "Save Canvas API credentials",
        "description": "Store Canvas base URL and API token for the authenticated user",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["canvas_base_url", "canvas_api_key"],
                "properties": {
                  "canvas_base_url": {
                    "type": "string",
                    "description": "Canvas instance URL (e.g., https://canvas.instructure.com)"
                  },
                  "canvas_api_key": {
                    "type": "string",
                    "description": "Canvas API access token"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Configuration saved successfully"
          }
        }
      }
    },
    "/api/v1/canvas/courses": {
      "get": {
        "operationId": "getCourses",
        "summary": "List all courses",
        "description": "Get all Canvas courses for the authenticated user",
        "responses": {
          "200": {
            "description": "List of courses",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {"type": "integer"},
                      "name": {"type": "string"},
                      "course_code": {"type": "string"},
                      "enrollment_term_id": {"type": "integer"}
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/canvas/courses/{courseId}/assignments": {
      "get": {
        "operationId": "getAssignments",
        "summary": "Get course assignments",
        "description": "List all assignments for a specific course",
        "parameters": [
          {
            "name": "courseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "Canvas course ID"
          }
        ],
        "responses": {
          "200": {
            "description": "List of assignments"
          }
        }
      }
    },
    "/api/v1/canvas/assignments/upcoming": {
      "get": {
        "operationId": "getUpcomingAssignments",
        "summary": "Get upcoming assignments",
        "description": "List all upcoming assignments across all courses",
        "responses": {
          "200": {
            "description": "List of upcoming assignments"
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "oauth2": {
        "type": "oauth2",
        "flows": {
          "authorizationCode": {
            "authorizationUrl": "https://canvas-mcp-sse.ariff.dev/oauth/authorize",
            "tokenUrl": "https://canvas-mcp-sse.ariff.dev/oauth/token",
            "scopes": {}
          }
        }
      }
    }
  },
  "security": [
    {
      "oauth2": []
    }
  ]
}
```

### Step 4: Configure OAuth Authentication

In the **Authentication** section of Actions:

1. **Authentication Type:** OAuth
2. **Client ID:** `YOUR_CLIENT_ID_HERE` (provided by server admin)
3. **Client Secret:** `YOUR_CLIENT_SECRET_HERE` (provided by server admin)
4. **Authorization URL:** `https://canvas-mcp-sse.ariff.dev/oauth/authorize`
5. **Token URL:** `https://canvas-mcp-sse.ariff.dev/oauth/token`
6. **Scope:** Leave empty
7. **Token Exchange Method:** Default (Basic authorization header)

**Note:** If you're using the public hosted server, OAuth may be pre-configured. Contact the server administrator for client credentials.

### Step 5: Set Privacy Policy

In the **Settings** section:

**Privacy Policy URL:**
```
https://canvas-mcp-sse.ariff.dev/privacy
```

This is required for public GPTs.

### Step 6: Test the Configuration

1. Click **Save** in the top-right corner
2. Switch to the **Preview** pane on the right
3. Try these test prompts:

```
First, save my Canvas config with base URL https://canvas.instructure.com and token [YOUR_TOKEN]
```

```
Now show me my courses
```

```
What assignments are due soon?
```

### Step 7: Publish Your GPT

1. Click **Update** or **Create** (top-right)
2. Choose visibility:
   - **Only me** - Private, just for you
   - **Anyone with a link** - Shareable with friends
   - **Public** - Listed in GPT store (requires privacy policy)

## 💡 Usage Examples

### Initial Setup

Every user needs to configure their Canvas credentials once:

```
Save my Canvas configuration:
- Base URL: https://canvas.instructure.com
- API Token: [paste your token here]
```

### Common Queries

**View Courses:**
```
What courses am I enrolled in?
```

**Check Assignments:**
```
What assignments are due this week?
```

**Get Specific Course Details:**
```
Show me all assignments for "Introduction to Computer Science"
```

**Priority Management:**
```
What should I work on first? Prioritize by due date and grade weight.
```

**Grade Tracking:**
```
How am I doing in my courses? Show my current grades.
```

## 🔐 Security Considerations

### Canvas API Token Security

1. **Generate a dedicated token** for ChatGPT (don't reuse existing tokens)
2. **Set an expiration date** (Canvas allows this in token settings)
3. **Name it clearly** (e.g., "ChatGPT GPT - Canvas Assistant")
4. **Revoke immediately** if you suspect compromise

### OAuth Security Features

- ✅ **Authorization Code Flow** - Most secure OAuth 2.1 flow
- ✅ **State parameter** - CSRF protection
- ✅ **Per-user isolation** - Each OAuth session gets unique user ID
- ✅ **Token storage in KV** - Encrypted storage in Cloudflare
- ✅ **No PKCE required** - ChatGPT Actions don't support PKCE automatically

### Privacy & Data Handling

- Your Canvas token is stored **per OAuth session**
- Credentials are isolated - other users cannot access your data
- No logging of API tokens or sensitive data
- API calls go directly from MCP server → Canvas (no intermediate storage)

## 🛠️ Troubleshooting

### Issue: "Authentication failed"

**Solution:**
1. Verify OAuth client credentials are correct
2. Check that redirect URI matches ChatGPT's callback URL
3. Ensure authorization and token URLs are correct
4. Try re-authorizing in GPT settings

### Issue: "Canvas API returned 401 Unauthorized"

**Solution:**
1. Verify your Canvas API token is valid and not expired
2. Re-save your Canvas configuration with a fresh token
3. Check that Canvas base URL is correct (with https://)
4. Test token manually: `curl -H "Authorization: Bearer YOUR_TOKEN" https://canvas.instructure.com/api/v1/users/self/profile`

### Issue: "No courses found"

**Solution:**
1. Ensure you're enrolled in courses on Canvas
2. Check that you saved your Canvas config first
3. Verify the token has permissions to read courses
4. Try accessing Canvas directly to confirm enrollment

### Issue: "Action schema validation failed"

**Solution:**
1. Copy the exact OpenAPI schema from this guide
2. Verify JSON is valid at [jsonlint.com](https://jsonlint.com)
3. Ensure all URLs use `https://` (not `http://`)
4. Check that `operationId` fields are unique

## 📚 Advanced Configuration

### Adding More Endpoints

You can extend the OpenAPI schema to add more Canvas API endpoints:

```json
"/api/v1/canvas/courses/{courseId}/modules": {
  "get": {
    "operationId": "getCourseModules",
    "summary": "Get course modules",
    "parameters": [
      {
        "name": "courseId",
        "in": "path",
        "required": true,
        "schema": {"type": "integer"}
      }
    ],
    "responses": {
      "200": {
        "description": "List of modules"
      }
    }
  }
}
```

### Custom Instructions for Better Responses

Add to the GPT instructions:

```
When displaying assignments:
- Sort by due date (soonest first)
- Highlight overdue items in bold
- Show point values and submission status
- Suggest time estimates based on assignment type

When showing grades:
- Calculate overall GPA
- Identify courses needing attention
- Provide encouraging feedback
```

## 🆘 Getting Help

### Resources

- **Main Repository**: [github.com/a-ariff/canvas-student-mcp-server](https://github.com/a-ariff/canvas-student-mcp-server)
- **API Documentation**: [Canvas LMS REST API](https://canvas.instructure.com/doc/api/)
- **OpenAPI Spec**: [OpenAPI 3.1 Guide](https://swagger.io/specification/)
- **Report Issues**: [GitHub Issues](https://github.com/a-ariff/canvas-student-mcp-server/issues)

### Common Questions

**Q: Do I need ChatGPT Plus?**  
A: Yes, custom GPTs require ChatGPT Plus or Enterprise subscription.

**Q: Can I share my GPT with classmates?**  
A: Yes! Set visibility to "Anyone with a link" or "Public". Each user will need their own Canvas API token.

**Q: Is this approved by Canvas?**  
A: This uses Canvas's official public API. Check your institution's policies on third-party integrations.

**Q: Can this modify my Canvas data?**  
A: Currently, the API is read-only. It can fetch data but not submit assignments or modify courses.

## 🎯 What's Next?

- ✅ Add more Canvas API endpoints to your GPT
- ✅ Create workflow automations (e.g., daily assignment summaries)
- ✅ Share your GPT with classmates
- ✅ Try [Claude Desktop setup](./CLAUDE_DESKTOP_SETUP.md) for comparison

---

**Built with ❤️ using Cloudflare Workers and OAuth 2.1**  
**Star us on [GitHub](https://github.com/a-ariff/canvas-student-mcp-server)** ⭐

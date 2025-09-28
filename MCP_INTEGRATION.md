# 🤖 MCP Integration Guide

This guide explains how to integrate the Canvas Student MCP Server with popular AI tools and clients that support the Model Context Protocol (MCP).

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Local Server Setup](#local-server-setup)
- [Integrate with Claude Desktop](#integrate-with-claude-desktop)
- [Integrate with ChatGPT (via Actions)](#integrate-with-chatgpt-via-actions)
- [Integrate with OpenAI Assistants API](#integrate-with-openai-assistants-api)
- [HTTP API Examples](#http-api-examples)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Overview
The Canvas Student MCP Server exposes student-friendly endpoints for Canvas LMS and speaks the MCP so AI clients can query course data safely from your local machine.

- Protocol: Model Context Protocol (MCP)
- Transport: Local HTTP (default: http://localhost:8000)
- Scope: Student course access, assignments, modules, and searchable corpus building

## Prerequisites
- Python 3.9+
- Canvas credentials for your institution
- A running instance of this server (local or Docker)
- An AI client that supports MCP (Claude Desktop or other)

## Local Server Setup

1. Clone and install:
```bash
git clone https://github.com/a-ariff/canvas-student-mcp-server.git
cd canvas-student-mcp-server
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Canvas URL and credentials
```

3. Start server:
```bash
python app.py
# Server runs at http://localhost:8000
```

## Integrate with Claude Desktop
Claude Desktop supports MCP servers via configuration in its settings file.

1. Confirm the server is reachable:
```bash
curl http://localhost:8000/health
```

2. Add the server to Claude Desktop config (example):
```json
{
  "mcpServers": {
    "student-canvas": {
      "command": "python",
      "args": ["/absolute/path/to/canvas-student-mcp-server/app.py"],
      "env": {
        "CANVAS_URL": "https://your-school.instructure.com",
        "CANVAS_USERNAME": "your_username",
        "CANVAS_PASSWORD": "your_password",
        "RATE_LIMIT": "60"
      }
    }
  }
}
```
Notes:
- Use absolute paths for reliability
- Prefer environment variables over hardcoding secrets
- Restart Claude Desktop after changes

3. Test inside Claude:
- Ask: "List my courses via student-canvas MCP"
- If tools appear, try: "Get assignments for course 12345"

## Integrate with ChatGPT (via Actions)
You can expose the server through an OpenAPI spec so ChatGPT Actions can call it locally.

1. Minimal OpenAPI snip:
```yaml
openapi: 3.0.0
info:
  title: Student Canvas MCP
  version: 1.0.0
servers:
  - url: http://localhost:8000
paths:
  /courses:
    get:
      summary: List enrolled courses
  /courses/{id}/assignments:
    get:
      summary: Get course assignments
```

2. In ChatGPT, add a new Action and point to your local OpenAPI HTTP URL or paste the document.

3. Test an Action call: "List my Canvas courses".

Tip: Some clients cannot reach localhost due to sandboxing. If so, use a tunneling service (ngrok, Cloudflared) carefully and only for testing.

## Integrate with OpenAI Assistants API
If you build your own agent using the Assistants API, call the HTTP endpoints directly.

Example with Python:
```python
import requests

BASE = "http://localhost:8000"

# Authenticate (if endpoint exists) or rely on server-side env
requests.post(f"{BASE}/authenticate", json={})

# List courses
courses = requests.get(f"{BASE}/courses").json()

# Get assignments for a course
cid = courses[0]["id"]
assignments = requests.get(f"{BASE}/courses/{cid}/assignments").json()
print(assignments)
```

## HTTP API Examples
Common endpoints implemented by this project:

- POST /authenticate — Start a Canvas session
- GET /courses — List enrolled courses
- GET /courses/{id}/modules — List course modules
- GET /courses/{id}/assignments — Get assignments
- GET /courses/{id}/modules/{module_id}/items — Module contents
- POST /courses/{id}/corpus/build — Build searchable course content

Curl examples:
```bash
# List courses
curl http://localhost:8000/courses

# Get assignments for course 12345
curl http://localhost:8000/courses/12345/assignments

# Build corpus for course 12345
curl -X POST http://localhost:8000/courses/12345/corpus/build
```

## Security Considerations
- Local-first: Credentials remain on your machine
- Never commit .env with real credentials
- Respect your institution’s Terms of Service and privacy policies
- Set reasonable RATE_LIMIT to avoid throttling
- If using tunnels, restrict access and disable when done

Recommended .env options:
```env
RATE_LIMIT=60
REQUEST_DELAY=0
ENABLE_CACHE=true
CACHE_TTL=3600
LOG_LEVEL=INFO
```

## Troubleshooting
If an AI client doesn’t see the server:
- Verify server is running: curl http://localhost:8000/health
- Check firewall/local network settings
- Confirm correct path to app.py and environment variables
- See TROUBLESHOOTING.md for detailed steps

---
Maintained by the community. Contributions welcome!

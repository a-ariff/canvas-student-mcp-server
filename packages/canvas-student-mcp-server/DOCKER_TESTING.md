# Docker Testing Guide

Complete guide for building, running, and testing the Canvas MCP Server in Docker.

## Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ (optional)
- Canvas API token

## Quick Start

### 1. Build the Docker Image

\`\`\`bash
cd packages/canvas-student-mcp-server
docker build -t canvas-mcp-server:latest .
\`\`\`

### 2. Run with Environment Variables

\`\`\`bash
docker run \\
  -e CANVAS_API_KEY=your_actual_api_token_here \\
  -e CANVAS_BASE_URL=https://your-school.instructure.com \\
  -e DEBUG=false \\
  --name canvas-mcp \\
  -it \\
  canvas-mcp-server:latest
\`\`\`

### 3. Using Docker Compose

\`\`\`bash
# Set environment variables in .env file
docker-compose up -d
\`\`\`

## Configuration

See .env.example for all available environment variables.

## Testing

\`\`\`bash
# View logs
docker logs -f canvas-mcp

# Access shell
docker exec -it canvas-mcp sh

# Test MCP server
docker exec -it canvas-mcp node dist/index.js
\`\`\`

## Troubleshooting

Check logs for errors:
\`\`\`bash
docker logs canvas-mcp 2>&1 | grep -i error
\`\`\`

For detailed documentation, see the project README.

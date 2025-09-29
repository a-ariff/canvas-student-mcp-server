# 🐳 Docker Testing Guide

This guide provides a complete Docker-based testing sequence for the Canvas Student MCP Server, including commands, expected outputs, and troubleshooting steps.

## Prerequisites
- Docker 20.10+
- Docker Compose v2 (or Compose plugin)
- Internet access to pull base images

Verify installation:
```bash
docker --version
docker compose version  # or: docker-compose --version
```

## 1) Build Images

### Option A: Using docker compose (recommended)
```bash
docker compose build --no-cache
```
Expected output (abridged):
- “=> [builder X/Y] …” build stages
- “Successfully built <IMAGE_ID>”
- “Successfully tagged canvas-student-mcp-server:latest”

### Option B: Using Dockerfile directly
```bash
docker build -t canvas-student-mcp-server:local .
```
Expected output:
- “=> [stage-0 X/Y] …”
- “Successfully built <IMAGE_ID>”
- “Successfully tagged canvas-student-mcp-server:local”

Troubleshooting:
- If build fails on dependency install, ensure internet connectivity and Python version in base image supports requirements.
- If pip cache corruption: add `--no-cache` and/or clear `~/.cache/pip`.

## 2) Configure Environment

Copy and edit environment:
```bash
cp .env.example .env
# Edit values for your Canvas instance
```
Required keys:
- CANVAS_URL=https://your-school.instructure.com
- CANVAS_USERNAME=your_username
- CANVAS_PASSWORD=your_password
Optional keys:
- RATE_LIMIT=60
- REQUEST_DELAY=0
- LOG_LEVEL=INFO

Security note: Never commit .env with real credentials.

## 3) Start Services

Using compose (foreground):
```bash
docker compose up
```
Using compose (detached):
```bash
docker compose up -d
```
Expected output:
- Service logs showing FastAPI/Uvicorn startup
- “Uvicorn running on http://0.0.0.0:8000”

Check container status:
```bash
docker compose ps
```
Expected:
- STATUS “Up” for the server container

## 4) Health Check
```bash
curl -f http://localhost:8000/health
```
Expected output:
```json
{"status":"ok"}
```
Troubleshooting:
- Connection refused: see Network section below
- 5xx error: check logs (next section)

## 5) Logs and Debugging
Follow logs:
```bash
docker compose logs -f --tail=200
```
Enable more verbose logs by adding to .env:
```env
DEBUG=true
LOG_LEVEL=DEBUG
```
Then restart:
```bash
docker compose restart
```

## 6) Functional Tests
List courses:
```bash
curl http://localhost:8000/courses | jq .
```
Expected:
- JSON array of courses (may be empty if account has none)

Get assignments for a course:
```bash
COURSE_ID=12345
curl http://localhost:8000/courses/$COURSE_ID/assignments | jq .
```
Build corpus:
```bash
curl -X POST http://localhost:8000/courses/$COURSE_ID/corpus/build
```
Expected:
- JSON with job status or summary

## 7) Port and Network Checks
Find mapped ports:
```bash
docker compose ps
# Or
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
```
If port 8000 is taken:
- Update compose file or set `PORT=8001` in .env
- Start with `-p` project name to avoid collision with another stack

Test from inside the container:
```bash
CID=$(docker ps --filter name=canvas --format '{{.ID}}')
docker exec -it "$CID" sh -lc "apk add --no-cache curl || true; curl -I http://localhost:8000/health"
```

## 8) Common Issues and Fixes

### Image Pull or Build Failures
- Check internet and registry access
- Corporate proxies: set `HTTP_PROXY`/`HTTPS_PROXY` in build args or .env

### Container Exits Immediately
- Run `docker compose logs` to see Python exceptions
- Missing env vars: ensure .env is loaded by compose

### Permission Errors on Linux
- Map a non-root port or run as user matching host UID/GID
- Use volume permissions fix: `:Z` on SELinux systems

### SSL Certificate Errors
- Add `SSL_VERIFY=false` in .env for testing only
- Ensure CA certs are present in base image

### Rate Limiting (HTTP 429)
- Lower `RATE_LIMIT` in .env (e.g., 30)
- Add `REQUEST_DELAY=2`

## 9) Stopping and Cleanup
Stop services:
```bash
docker compose down
```
Remove volumes (if defined):
```bash
docker compose down -v
```
Remove images:
```bash
docker rmi canvas-student-mcp-server:latest || true
```

## 10) CI/Automation Hints
- Use `--quiet-pull` and layer caching in CI to speed builds
- Add a healthcheck in compose for automated readiness

Example healthcheck (docker-compose.yml):
```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    env_file: .env
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 15s
```

---
For deeper troubleshooting, see TROUBLESHOOTING.md.

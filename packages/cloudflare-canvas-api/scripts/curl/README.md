# Canvas API Proxy - curl Scripts

Bash scripts for testing and interacting with the Canvas API Proxy.

## Quick Start

### 1. Authenticate

First, get your user ID:

```bash
export CANVAS_API_KEY="your_canvas_api_token"
export CANVAS_URL="https://learn.mywhitecliffe.com"
export INSTITUTION_NAME="Your School"

./auth.sh
```

Save the returned `USER_ID` for future requests:

```bash
export CANVAS_USER_ID="user_abc123xyz"
```

### 2. Get Your Courses

```bash
./get-courses.sh
```

### 3. Get Assignments for a Course

```bash
export COURSE_ID="123456"
./get-assignments.sh
```

### 4. Get Upcoming Events

```bash
./get-upcoming.sh
```

### 5. Health Check

```bash
./health-check.sh
```

## Scripts Reference

### auth.sh

Authenticate with Canvas and get your user ID.

**Environment Variables:**
- `CANVAS_API_KEY` (required): Your Canvas API token
- `CANVAS_URL` (optional): Canvas instance URL (default: https://learn.mywhitecliffe.com)
- `INSTITUTION_NAME` (optional): Your institution name (default: My Institution)
- `API_BASE_URL` (optional): Proxy API URL (default: https://canvas-mcp.ariff.dev)

**Example:**
```bash
CANVAS_API_KEY="19765~token" \
CANVAS_URL="https://canvas.instructure.com" \
INSTITUTION_NAME="My University" \
./auth.sh
```

**Output:**
```json
{
  "success": true,
  "userId": "user_abc123xyz",
  "message": "Authentication successful"
}
```

---

### get-courses.sh

Retrieve all courses for authenticated user.

**Environment Variables:**
- `CANVAS_USER_ID` (required): Your user ID from auth.sh
- `API_BASE_URL` (optional): Proxy API URL

**Example:**
```bash
CANVAS_USER_ID="user_abc123xyz" ./get-courses.sh
```

**Output:**
```json
{
  "data": [
    {
      "id": 123456,
      "name": "Web Development 101",
      "course_code": "WEB101",
      "enrollment_term_id": 789
    }
  ]
}
```

---

### get-assignments.sh

Retrieve assignments for a specific course.

**Environment Variables:**
- `CANVAS_USER_ID` (required): Your user ID
- `COURSE_ID` (required): Canvas course ID
- `API_BASE_URL` (optional): Proxy API URL

**Example:**
```bash
CANVAS_USER_ID="user_abc123xyz" \
COURSE_ID="123456" \
./get-assignments.sh
```

**Output:**
```json
{
  "data": [
    {
      "id": 789012,
      "name": "Build a REST API",
      "due_at": "2025-03-15T23:59:00Z",
      "points_possible": 100
    }
  ]
}
```

---

### get-upcoming.sh

Retrieve upcoming assignments and events.

**Environment Variables:**
- `CANVAS_USER_ID` (required): Your user ID
- `API_BASE_URL` (optional): Proxy API URL

**Example:**
```bash
CANVAS_USER_ID="user_abc123xyz" ./get-upcoming.sh
```

**Output:**
```json
{
  "data": [
    {
      "type": "assignment",
      "id": 789012,
      "title": "Build a REST API",
      "start_at": "2025-03-15T23:59:00Z"
    }
  ]
}
```

---

### health-check.sh

Check API health and status.

**Environment Variables:**
- `API_BASE_URL` (optional): Proxy API URL

**Example:**
```bash
./health-check.sh
```

**Output:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-01T12:34:56.789Z",
  "environment": "production",
  "version": "2.0.0"
}
```

---

## Complete Workflow Example

```bash
# 1. Set up authentication
export CANVAS_API_KEY="19765~your_token"
export CANVAS_URL="https://learn.mywhitecliffe.com"
export INSTITUTION_NAME="Whitecliffe College"

# 2. Authenticate and get user ID
./auth.sh

# Save the returned user ID
export CANVAS_USER_ID="user_abc123xyz"

# 3. Check API health
./health-check.sh

# 4. Get all your courses
./get-courses.sh

# 5. Get assignments for a specific course
export COURSE_ID="123456"
./get-assignments.sh

# 6. Get upcoming events
./get-upcoming.sh
```

## Troubleshooting

### Script Permissions

If you get "Permission denied":

```bash
chmod +x *.sh
```

### Python Not Found

Scripts use Python 3 for JSON formatting. If not available:

```bash
# macOS
brew install python3

# Ubuntu/Debian
sudo apt install python3
```

### curl Not Found

```bash
# macOS
brew install curl

# Ubuntu/Debian
sudo apt install curl
```

### Environment Variables

Create a `.env` file and source it:

```bash
# .env
export CANVAS_API_KEY="your_token"
export CANVAS_URL="https://learn.mywhitecliffe.com"
export INSTITUTION_NAME="Your School"
export CANVAS_USER_ID="user_abc123xyz"
export API_BASE_URL="https://canvas-mcp.ariff.dev"

# Load environment
source .env

# Run scripts
./get-courses.sh
```

## Advanced Usage

### Custom API Base URL

```bash
API_BASE_URL="http://localhost:8787" ./health-check.sh
```

### Save Response to File

```bash
./get-courses.sh > courses.json
./get-assignments.sh > assignments.json
```

### Parse with jq

```bash
# Install jq first
brew install jq

# Get just course names
./get-courses.sh | jq '.data[].name'

# Count assignments
./get-assignments.sh | jq '.data | length'

# Filter upcoming events
./get-upcoming.sh | jq '.data[] | select(.type == "assignment")'
```

---

For more information, see the main [README.md](../../README.md) or [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md).

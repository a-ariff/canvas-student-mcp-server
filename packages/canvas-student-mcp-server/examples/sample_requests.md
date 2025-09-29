# 🧪 Sample API Requests

**Test your Canvas Student MCP server with these examples!**

## Prerequisites
- Canvas Student MCP server running (`python app.py`)
- `curl` installed (comes with most systems)
- Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with actual credentials

## Basic Requests

### 1. Server Health Check
```bash
curl http://localhost:8000/
```

**Expected Response:**
```json
{
  "message": "Authentication Server is running",
  "status": "OK"
}
```

### 2. Authenticate User
```bash
curl -X POST http://localhost:8000/authenticate \
     -H "Content-Type: application/json" \
     -d '{
       "username": "YOUR_USERNAME@school.edu",
       "password": "YOUR_PASSWORD"
     }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "token_for_yourusername"
}
```

## Course Management

### 3. List All Courses
```bash
curl http://localhost:8000/courses
```

**Expected Response:**
```json
{
  "success": true,
  "courses": [
    {
      "id": 1,
      "name": "Technology Management",
      "code": "TECH501",
      "instructor": "Dr. Smith",
      "credits": 3,
      "status": "active"
    }
  ],
  "total": 1
}
```

### 4. Get Specific Course Details
```bash
# Replace '1' with actual course ID from step 3
curl http://localhost:8000/courses/1
```

## Course Content

### 5. Get Course Modules
```bash
# Replace '1' with actual course ID
curl http://localhost:8000/courses/1/modules
```

**Expected Response:**
```json
{
  "success": true,
  "modules": [
    {
      "id": 101,
      "name": "Week 1: Introduction",
      "position": 1
    },
    {
      "id": 102,
      "name": "Week 2: Advanced Topics",
      "position": 2
    }
  ],
  "total": 2
}
```

### 6. Get Module Items
```bash
# Replace course_id and module_id with actual values
curl http://localhost:8000/courses/1/modules/101/items
```

**Expected Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": 9001,
      "type": "Page",
      "title": "Lecture Notes",
      "page_url": "lecture-notes"
    },
    {
      "id": 9002,
      "type": "Assignment",
      "title": "Assignment 1",
      "assignment_id": 5001
    }
  ],
  "total": 2
}
```

### 7. Get Course Assignments
```bash
# Replace '1' with actual course ID
curl http://localhost:8000/courses/1/assignments
```

**Expected Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "id": 5001,
      "name": "Assignment 1",
      "due_at": "2025-10-05T23:59:00Z",
      "points": 100
    }
  ],
  "total": 1
}
```

## Advanced Features

### 8. Build Course Corpus
```bash
# This indexes course content for searching
curl -X POST http://localhost:8000/courses/1/corpus/build
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Corpus built for course 1",
  "documents_indexed": 42
}
```

## Automation Examples

### 9. Get All Data for Course (Shell Script)
```bash
#!/bin/bash
COURSE_ID=1

echo "=== Course Details ==="
curl -s http://localhost:8000/courses/$COURSE_ID | jq .

echo "\n=== Modules ==="
curl -s http://localhost:8000/courses/$COURSE_ID/modules | jq .

echo "\n=== Assignments ==="
curl -s http://localhost:8000/courses/$COURSE_ID/assignments | jq .
```

### 10. Check for Upcoming Deadlines (Python)
```python
import requests
from datetime import datetime, timedelta

# Get all courses
response = requests.get('http://localhost:8000/courses')
courses = response.json()

print("Upcoming Assignments (Next 7 Days):")
for course in courses['courses']:
    # Get assignments for each course
    assignments_response = requests.get(f'http://localhost:8000/courses/{course["id"]}/assignments')
    assignments = assignments_response.json()
    
    for assignment in assignments['assignments']:
        due_date = datetime.fromisoformat(assignment['due_at'].replace('Z', '+00:00'))
        if due_date <= datetime.now() + timedelta(days=7):
            print(f"📝 {assignment['name']} ({course['name']}) - Due: {due_date.strftime('%Y-%m-%d')}")
```

## Error Testing

### 11. Test Invalid Authentication
```bash
curl -X POST http://localhost:8000/authenticate \
     -H "Content-Type: application/json" \
     -d '{"username": "wrong", "password": "wrong"}'
```

**Expected Error:**
```json
{
  "detail": "Invalid username or password"
}
```

### 12. Test Non-existent Course
```bash
curl http://localhost:8000/courses/99999
```

**Expected Error:**
```json
{
  "detail": "Course not found"
}
```

## Performance Testing

### 13. Concurrent Requests (Bash)
```bash
#!/bin/bash
# Test multiple simultaneous requests
for i in {1..5}; do
    curl -s http://localhost:8000/courses &
done
wait
echo "All requests completed"
```

### 14. Load Test with Apache Bench
```bash
# Install apache2-utils first
# Ubuntu/Debian: sudo apt install apache2-utils
# macOS: brew install httpd

# 100 requests with 10 concurrent connections
ab -n 100 -c 10 http://localhost:8000/courses
```

## Integration Examples

### 15. Use with jq for JSON Processing
```bash
# Get just course names
curl -s http://localhost:8000/courses | jq -r '.courses[].name'

# Get assignments due this week (requires date calculation)
curl -s http://localhost:8000/courses/1/assignments | jq '.assignments[] | select(.due_at | fromdateiso8601 < (now + 604800))'
```

### 16. Export to CSV
```bash
# Export courses to CSV
echo "ID,Name,Code,Instructor,Credits" > courses.csv
curl -s http://localhost:8000/courses | jq -r '.courses[] | [.id, .name, .code, .instructor, .credits] | @csv' >> courses.csv
```

## Troubleshooting

### Common Issues

**Connection Refused:**
```bash
# Check if server is running
curl http://localhost:8000/health

# If fails, restart server
python app.py
```

**Invalid JSON:**
```bash
# Validate your JSON with jq
echo '{"username": "test", "password": "test"}' | jq .
```

**Missing Dependencies:**
```bash
# Install missing tools
# macOS:
brew install curl jq

# Ubuntu/Debian:
sudo apt install curl jq

# Windows (via chocolatey):
choco install curl jq
```

---

**💡 Pro Tips:**
- Save frequently used requests as shell aliases
- Use environment variables for sensitive data
- Combine with `watch` for real-time monitoring: `watch -n 30 'curl -s http://localhost:8000/courses'`
- Use `httpie` as a more user-friendly alternative to curl: `http localhost:8000/courses`

# 📡 Canvas Student MCP API Documentation

Complete reference for all endpoints in the Canvas Student MCP server.

## Base URL
```
http://localhost:8000
```

## Authentication

### POST /authenticate
Authenticate with your Canvas student credentials.

**Request:**
```json
{
  "username": "your.email@school.edu",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "token_for_yourusername"
}
```

**Error Response:**
```json
{
  "detail": "Invalid username or password"
}
```

## Health & Status

### GET /
Server status check.

**Response:**
```json
{
  "message": "Authentication Server is running",
  "status": "OK"
}
```

### GET /health
Detailed health check.

**Response:**
```json
{
  "status": "healthy",
  "service": "auth-server"
}
```

## Courses

### GET /courses
List all your enrolled courses.

**Response:**
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

### GET /courses/{course_id}
Get details for a specific course.

**Response:**
```json
{
  "success": true,
  "course": {
    "id": 1,
    "name": "Technology Management",
    "code": "TECH501",
    "instructor": "Dr. Smith",
    "credits": 3,
    "status": "active"
  }
}
```

## Modules

### GET /courses/{course_id}/modules
Get all modules for a course.

**Response:**
```json
{
  "success": true,
  "modules": [
    {
      "id": 101,
      "name": "Week 1: Intro",
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

### GET /courses/{course_id}/modules/{module_id}/items
Get all items within a module.

**Response:**
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
    },
    {
      "id": 9003,
      "type": "File",
      "title": "Reading.pdf",
      "file_id": 7001
    }
  ],
  "total": 3
}
```

## Assignments

### GET /courses/{course_id}/assignments
Get all assignments for a course.

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "id": 5001,
      "name": "Assignment 1",
      "due_at": "2025-10-05T23:59:00Z",
      "points": 100
    },
    {
      "id": 5002,
      "name": "Assignment 2",
      "due_at": "2025-11-01T23:59:00Z",
      "points": 100
    }
  ],
  "total": 2
}
```

## Course Corpus

### POST /courses/{course_id}/corpus/build
Build a searchable corpus of course content.

**Response:**
```json
{
  "success": true,
  "message": "Corpus built for course 2261",
  "documents_indexed": 42
}
```

## Error Handling

All endpoints return consistent error formats:

**400 Bad Request:**
```json
{
  "detail": "Invalid request format"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Invalid username or password"
}
```

**404 Not Found:**
```json
{
  "detail": "Course not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production use.

## CORS

CORS is configured to allow requests from:
- `localhost` on any port
- Your Canvas domain
- AI tool domains (when configured)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Authentication Server", version="1.0.0")

# Request model for authentication
class AuthRequest(BaseModel):
    username: str
    password: str

# Response model for successful authentication
class AuthResponse(BaseModel):
    success: bool
    message: str
    token: str = None

# Mock user database (in production, use a real database)
USERS = {
    "20231592@mywhitecliffe.com": "3M6sb6qobNwSanK"
}

@app.get("/")
async def root():
    return {"message": "Authentication Server is running", "status": "OK"}

@app.post("/authenticate", response_model=AuthResponse)
async def authenticate(auth_request: AuthRequest):
    """
    Authenticate user with username and password
    """
    username = auth_request.username
    password = auth_request.password
    
    # Check if user exists and password is correct
    if username in USERS and USERS[username] == password:
        # In a real app, generate a proper JWT token
        fake_token = f"token_for_{username.split('@')[0]}"
        return AuthResponse(
            success=True,
            message="Authentication successful",
            token=fake_token
        )
    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth-server"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Mock courses data
COURSES = [
    {
        "id": 1,
        "name": "Technology Management",
        "code": "TECH501",
        "instructor": "Dr. Smith",
        "credits": 3,
        "status": "active"
    },
    {
        "id": 2, 
        "name": "Advanced Programming Languages",
        "code": "APL601",
        "instructor": "Prof. Johnson",
        "credits": 4,
        "status": "active"
    },
    {
        "id": 3,
        "name": "Database Systems",
        "code": "DB401",
        "instructor": "Dr. Wilson",
        "credits": 3,
        "status": "active"
    }
]

@app.get("/courses")
async def get_courses():
    """
    Get all available courses
    """
    return {
        "success": True,
        "courses": COURSES,
        "total": len(COURSES)
    }

@app.get("/courses/{course_id}")
async def get_course(course_id: int):
    """
    Get specific course by ID
    """
    course = next((c for c in COURSES if c["id"] == course_id), None)
    if course:
        return {"success": True, "course": course}
    else:
        raise HTTPException(status_code=404, detail="Course not found")

# Helper functions (not async, can be called directly)
def get_all_courses():
    """Helper function to get all courses"""
    return COURSES

def get_course_by_id(course_id: int):
    """Helper function to get course by ID"""
    return next((c for c in COURSES if c["id"] == course_id), None)

def get_courses_data(course_id=None):
    """Helper function that matches your usage"""
    if course_id:
        course = get_course_by_id(course_id)
        return [course] if course else []
    return get_all_courses()

# =============================================================================
# STAGE 1: Additional Canvas-like endpoints
# =============================================================================

@app.get("/courses/{course_id}/modules")
async def get_modules(course_id: int):
    """
    Get all modules for a specific course
    TODO: replace with real Canvas fetch
    """
    modules = [
        {"id": 101, "name": "Week 1: Intro", "position": 1},
        {"id": 102, "name": "Week 2: Advanced Topics", "position": 2},
    ]
    return {"success": True, "modules": modules, "total": len(modules)}

@app.get("/courses/{course_id}/modules/{module_id}/items")
async def get_module_items(course_id: int, module_id: int):
    """
    Get all items within a specific module
    TODO: replace with real Canvas fetch
    """
    items = [
        {"id": 9001, "type": "Page", "title": "Lecture Notes", "page_url": "lecture-notes"},
        {"id": 9002, "type": "Assignment", "title": "Assignment 1", "assignment_id": 5001},
        {"id": 9003, "type": "File", "title": "Reading.pdf", "file_id": 7001},
    ]
    return {"success": True, "items": items, "total": len(items)}

@app.get("/courses/{course_id}/assignments")
async def get_assignments(course_id: int):
    """
    Get all assignments for a specific course
    TODO: replace with real Canvas fetch
    """
    assignments = [
        {"id": 5001, "name": "Assignment 1", "due_at": "2025-10-05T23:59:00Z", "points": 100},
        {"id": 5002, "name": "Assignment 2", "due_at": "2025-11-01T23:59:00Z", "points": 100},
    ]
    return {"success": True, "assignments": assignments, "total": len(assignments)}

@app.post("/courses/{course_id}/corpus/build")
async def build_corpus(course_id: int):
    """
    Build search corpus for a course by aggregating all content
    TODO: replace with real aggregation
    """
    return {
        "success": True, 
        "message": f"Corpus built for course {course_id}", 
        "documents_indexed": 42
    }

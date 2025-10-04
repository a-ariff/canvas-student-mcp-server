#!/usr/bin/env python3
"""
Canvas MCP Server using FastMCP with real Canvas integration
"""
import os
import sys
import asyncio
from typing import Optional
from dotenv import load_dotenv
import warnings

# Suppress urllib3 SSL warnings
warnings.filterwarnings("ignore", message="urllib3 v2 only supports OpenSSL 1.1.1+")
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Load environment variables
load_dotenv()

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from fastmcp import FastMCP
from canvas_client import CanvasClient

# Initialize FastMCP server (with minimal output)
app = FastMCP("canvas-student")

# Global state
canvas_client: Optional[CanvasClient] = None
session_data = {}

@app.tool()
async def authenticate_student(username: str, password: str) -> str:
    """Authenticate with Canvas using student credentials"""
    global canvas_client, session_data

    try:
        # Initialize Canvas client with your institution URL
        canvas_client = CanvasClient(canvas_url="https://canvas.instructure.com")

        # Log the attempt (without password for security)
        print(f"Attempting authentication for {username} to Canvas", file=sys.stderr)

        success = await canvas_client.authenticate(username, password)

        if success:
            session_data["authenticated"] = True
            session_data["username"] = username
            print(f"✅ Authentication successful for {username}", file=sys.stderr)
            return f"✅ Successfully authenticated as {username}! Connected to Canvas. You can now access your courses."
        else:
            print(f"❌ Authentication failed for {username}", file=sys.stderr)
            return "❌ Authentication failed. Please check your username and password. Make sure you can log in to your Canvas instance manually first."

    except Exception as e:
        print(f"❌ Authentication exception: {str(e)}", file=sys.stderr)
        return f"❌ Authentication error: {str(e)}"

@app.tool()
async def get_student_courses() -> str:
    """Get all courses for authenticated student"""
    global canvas_client, session_data

    if not canvas_client or not session_data.get("authenticated"):
        return "❌ Please authenticate first using authenticate_student"

    try:
        courses = await canvas_client.list_courses()

        if not courses:
            return "📋 No courses found in your Canvas account."

        course_list = "\n".join([
            f"📚 {course['name']} ({course.get('course_code', course.get('code', 'N/A'))}) - ID: {course['id']}"
            for course in courses
        ])

        return f"📋 Your Canvas Courses ({len(courses)} total):\n\n{course_list}"

    except Exception as e:
        return f"❌ Error fetching courses: {str(e)}"

@app.tool()
async def get_course_assignments(course_id: int) -> str:
    """Get assignments for a specific course"""
    global canvas_client, session_data

    if not canvas_client or not session_data.get("authenticated"):
        return "❌ Please authenticate first using authenticate_student"

    try:
        assignments = await canvas_client.list_assignments(course_id)

        if not assignments:
            return f"📋 No assignments found for course {course_id}."

        assignment_list = "\n".join([
            f"📝 {assignment['name']} - Due: {assignment.get('due_at', 'No due date')} ({assignment.get('points_possible', 'N/A')} pts)"
            for assignment in assignments
        ])

        return f"📋 Course {course_id} Assignments ({len(assignments)} total):\n\n{assignment_list}"

    except Exception as e:
        return f"❌ Error fetching assignments: {str(e)}"

@app.tool()
async def get_course_modules(course_id: int) -> str:
    """Get modules for a specific course"""
    global canvas_client, session_data

    if not canvas_client or not session_data.get("authenticated"):
        return "❌ Please authenticate first using authenticate_student"

    try:
        modules = await canvas_client.list_modules(course_id)

        if not modules:
            return f"📋 No modules found for course {course_id}."

        module_list = "\n".join([
            f"📁 {module['name']} (Position: {module.get('position', 'N/A')})"
            for module in modules
        ])

        return f"📚 Course {course_id} Modules ({len(modules)} total):\n\n{module_list}"

    except Exception as e:
        return f"❌ Error fetching modules: {str(e)}"

@app.resource("canvas://student/profile")
async def student_profile() -> str:
    """Current authenticated student profile"""
    global session_data

    if session_data.get("authenticated"):
        username = session_data.get("username", "Unknown")
        return f"✅ Authenticated Canvas Student: {username}\n🏫 Institution: Whitecliffe College\n🌐 Canvas URL: https://learn.mywhitecliffe.com"
    else:
        return "❌ Not authenticated. Please use authenticate_student tool first."

if __name__ == "__main__":
    # Don't output startup message to avoid JSON parsing issues
    app.run()

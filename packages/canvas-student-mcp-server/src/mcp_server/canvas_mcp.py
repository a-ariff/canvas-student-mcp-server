"""
Canvas Student MCP Server
Revolutionary approach: Use student credentials, not API tokens!
"""

import asyncio
import json
from typing import Any, Dict, List, Optional, Sequence
from mcp.server import Server
from mcp.types import (
    Resource, 
    Tool, 
    TextContent,
    ImageContent,
    EmbeddedResource
)
import structlog

# Import our Canvas client and FastAPI app
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from canvas_client import CanvasClient

logger = structlog.get_logger(__name__)

class CanvasStudentMCP:
    """Canvas MCP Server for Students - Revolutionary credential-based approach"""
    
    def __init__(self):
        self.server = Server("canvas-student-mcp")
        self.canvas_client: Optional[CanvasClient] = None
        self.session_data: Dict[str, Any] = {}
        
        # Register MCP handlers
        self._register_tools()
        self._register_resources()
        
    def _register_tools(self):
        """Register MCP tools for Canvas operations"""
        
        @self.server.list_tools()
        async def list_tools() -> List[Tool]:
            return [
                Tool(
                    name="authenticate_student",
                    description="Authenticate with Canvas using student credentials",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "username": {"type": "string", "description": "Student username/email"},
                            "password": {"type": "string", "description": "Student password"}
                        },
                        "required": ["username", "password"]
                    }
                ),
                Tool(
                    name="get_student_courses",
                    description="Get all courses for the authenticated student",
                    inputSchema={"type": "object", "properties": {}}
                ),
                Tool(
                    name="get_course_modules",
                    description="Get all modules for a specific course",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "course_id": {"type": "integer", "description": "Canvas course ID"}
                        },
                        "required": ["course_id"]
                    }
                ),
                Tool(
                    name="get_module_content",
                    description="Get all content items within a module",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "course_id": {"type": "integer", "description": "Canvas course ID"},
                            "module_id": {"type": "integer", "description": "Canvas module ID"}
                        },
                        "required": ["course_id", "module_id"]
                    }
                ),
                Tool(
                    name="get_course_assignments",
                    description="Get all assignments for a specific course",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "course_id": {"type": "integer", "description": "Canvas course ID"}
                        },
                        "required": ["course_id"]
                    }
                ),
                Tool(
                    name="search_course_content",
                    description="Search through all course content using natural language",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "course_id": {"type": "integer", "description": "Canvas course ID"},
                            "query": {"type": "string", "description": "Search query"}
                        },
                        "required": ["course_id", "query"]
                    }
                ),
                Tool(
                    name="build_course_corpus",
                    description="Build searchable corpus for a course by indexing all content",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "course_id": {"type": "integer", "description": "Canvas course ID"}
                        },
                        "required": ["course_id"]
                    }
                )
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: Dict[str, Any]) -> Sequence[TextContent]:
            """Handle tool calls"""
            try:
                if name == "authenticate_student":
                    return await self._authenticate_student(arguments)
                elif name == "get_student_courses":
                    return await self._get_student_courses()
                elif name == "get_course_modules":
                    return await self._get_course_modules(arguments["course_id"])
                elif name == "get_module_content":
                    return await self._get_module_content(arguments["course_id"], arguments["module_id"])
                elif name == "get_course_assignments":
                    return await self._get_course_assignments(arguments["course_id"])
                elif name == "search_course_content":
                    return await self._search_course_content(arguments["course_id"], arguments["query"])
                elif name == "build_course_corpus":
                    return await self._build_course_corpus(arguments["course_id"])
                else:
                    raise ValueError(f"Unknown tool: {name}")
                    
            except Exception as e:
                logger.error(f"Tool call failed: {name}", error=str(e))
                return [TextContent(type="text", text=f"Error: {str(e)}")]

    def _register_resources(self):
        """Register MCP resources for Canvas data"""
        
        @self.server.list_resources()
        async def list_resources() -> List[Resource]:
            resources = [
                Resource(
                    uri="canvas://student/profile",
                    name="Student Profile",
                    description="Current authenticated student profile"
                )
            ]
            
            # Add course resources if authenticated
            if self.canvas_client and self.session_data.get("authenticated"):
                try:
                    courses = await self._fetch_courses()
                    for course in courses:
                        resources.append(
                            Resource(
                                uri=f"canvas://course/{course['id']}",
                                name=f"Course: {course['name']}",
                                description=f"Canvas course {course['code']}"
                            )
                        )
                except Exception as e:
                    logger.error("Failed to list course resources", error=str(e))
            
            return resources

    # Tool implementation methods
    async def _authenticate_student(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Authenticate student with Canvas credentials"""
        try:
            username = args["username"]
            password = args["password"]
            
            # Initialize Canvas client with credentials
            self.canvas_client = CanvasClient()
            success = await self.canvas_client.authenticate(username, password)
            
            if success:
                self.session_data["authenticated"] = True
                self.session_data["username"] = username
                return [TextContent(
                    type="text", 
                    text=f"✅ Successfully authenticated as {username}! You can now access your Canvas courses."
                )]
            else:
                return [TextContent(
                    type="text",
                    text="❌ Authentication failed. Please check your username and password."
                )]
                
        except Exception as e:
            return [TextContent(type="text", text=f"Authentication error: {str(e)}")]

    async def _get_student_courses(self) -> Sequence[TextContent]:
        """Get all courses for authenticated student"""
        if not self._check_authentication():
            return [TextContent(type="text", text="❌ Please authenticate first using authenticate_student")]
            
        try:
            courses = await self.canvas_client.list_courses()
            course_list = "\n".join([
                f"📚 {course['name']} ({course['code']}) - ID: {course['id']}"
                for course in courses
            ])
            
            return [TextContent(
                type="text",
                text=f"📋 Your Canvas Courses ({len(courses)} total):\n\n{course_list}"
            )]
            
        except Exception as e:
            return [TextContent(type="text", text=f"Error fetching courses: {str(e)}")]

    async def _get_course_modules(self, course_id: int) -> Sequence[TextContent]:
        """Get all modules for a course"""
        if not self._check_authentication():
            return [TextContent(type="text", text="❌ Please authenticate first")]
            
        try:
            modules = await self.canvas_client.list_modules(course_id)
            module_list = "\n".join([
                f"�� {module['name']} (Position: {module.get('position', 'N/A')})"
                for module in modules
            ])
            
            return [TextContent(
                type="text",
                text=f"📚 Course Modules ({len(modules)} total):\n\n{module_list}"
            )]
            
        except Exception as e:
            return [TextContent(type="text", text=f"Error fetching modules: {str(e)}")]

    async def _get_module_content(self, course_id: int, module_id: int) -> Sequence[TextContent]:
        """Get content items within a module"""
        if not self._check_authentication():
            return [TextContent(type="text", text="❌ Please authenticate first")]
            
        try:
            items = await self.canvas_client.list_module_items(course_id, module_id)
            content_list = "\n".join([
                f"📄 {item['title']} ({item['type']})"
                for item in items
            ])
            
            return [TextContent(
                type="text",
                text=f"📋 Module Content ({len(items)} items):\n\n{content_list}"
            )]
            
        except Exception as e:
            return [TextContent(type="text", text=f"Error fetching module content: {str(e)}")]

    async def _get_course_assignments(self, course_id: int) -> Sequence[TextContent]:
        """Get assignments for a course"""
        if not self._check_authentication():
            return [TextContent(type="text", text="❌ Please authenticate first")]
            
        try:
            assignments = await self.canvas_client.list_assignments(course_id)
            assignment_list = "\n".join([
                f"📝 {assignment['name']} - Due: {assignment.get('due_at', 'No due date')} ({assignment.get('points_possible', 'N/A')} pts)"
                for assignment in assignments
            ])
            
            return [TextContent(
                type="text",
                text=f"📋 Course Assignments ({len(assignments)} total):\n\n{assignment_list}"
            )]
            
        except Exception as e:
            return [TextContent(type="text", text=f"Error fetching assignments: {str(e)}")]

    async def _search_course_content(self, course_id: int, query: str) -> Sequence[TextContent]:
        """Search through course content"""
        if not self._check_authentication():
            return [TextContent(type="text", text="❌ Please authenticate first")]
            
        try:
            # This would integrate with the corpus search functionality
            results = await self.canvas_client.search_content(course_id, query)
            
            if not results:
                return [TextContent(type="text", text=f"🔍 No results found for '{query}'")]
                
            result_list = "\n".join([
                f"📄 {result['title']} - {result['type']} (Relevance: {result.get('score', 'N/A')})"
                for result in results[:10]  # Limit to top 10
            ])
            
            return [TextContent(
                type="text",
                text=f"🔍 Search Results for '{query}' ({len(results)} found):\n\n{result_list}"
            )]
            
        except Exception as e:
            return [TextContent(type="text", text=f"Search error: {str(e)}")]

    async def _build_course_corpus(self, course_id: int) -> Sequence[TextContent]:
        """Build searchable corpus for a course"""
        if not self._check_authentication():
            return [TextContent(type="text", text="❌ Please authenticate first")]
            
        try:
            result = await self.canvas_client.build_corpus(course_id)
            
            return [TextContent(
                type="text",
                text=f"🚀 Corpus built successfully!\n📊 Indexed {result.get('documents_indexed', 0)} documents for course {course_id}"
            )]
            
        except Exception as e:
            return [TextContent(type="text", text=f"Corpus build error: {str(e)}")]

    def _check_authentication(self) -> bool:
        """Check if user is authenticated"""
        return (self.canvas_client is not None and 
                self.session_data.get("authenticated", False))

    async def _fetch_courses(self) -> List[Dict[str, Any]]:
        """Helper to fetch courses for resources"""
        if self.canvas_client:
            return await self.canvas_client.list_courses()
        return []

    def run(self, host: str = "0.0.0.0", port: int = 3000):
        """Run the MCP server"""
        logger.info(f"🚀 Starting Canvas Student MCP Server on {host}:{port}")
        
        async def main():
            async with self.server.run_server() as server_context:
                await server_context.serve(host=host, port=port)
        
        asyncio.run(main())

if __name__ == "__main__":
    mcp_server = CanvasStudentMCP()
    mcp_server.run()

#!/usr/bin/env python3
"""
Simple MCP Server for Python 3.9 compatibility
Uses JSON-RPC over stdio for Claude Desktop integration
"""

import asyncio
import json
import sys
import os
from typing import Any, Dict, List, Optional
import structlog
from dataclasses import dataclass

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from canvas_client import CanvasClient

logger = structlog.get_logger(__name__)

@dataclass
class TextContent:
    type: str = "text"
    text: str = ""

class SimpleMCPServer:
    """Simple MCP Server compatible with Python 3.9"""

    def __init__(self):
        self.name = "canvas-student-mcp"
        self.version = "1.0.0"
        self.canvas_client: Optional[CanvasClient] = None
        self.session_data: Dict[str, Any] = {}

    async def handle_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP message"""
        try:
            method = message.get("method")
            params = message.get("params", {})
            id_val = message.get("id")

            if method == "initialize":
                return {
                    "jsonrpc": "2.0",
                    "id": id_val,
                    "result": {
                        "capabilities": {
                            "tools": {},
                            "resources": {},
                            "prompts": {}
                        },
                        "serverInfo": {
                            "name": self.name,
                            "version": self.version
                        }
                    }
                }

            elif method == "tools/list":
                tools = [
                    {
                        "name": "authenticate_student",
                        "description": "Authenticate with Canvas using student credentials",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "username": {"type": "string", "description": "Canvas username"},
                                "password": {"type": "string", "description": "Canvas password"}
                            },
                            "required": ["username", "password"]
                        }
                    },
                    {
                        "name": "get_student_courses",
                        "description": "Get all courses for authenticated student",
                        "inputSchema": {"type": "object", "properties": {}}
                    },
                    {
                        "name": "get_course_modules",
                        "description": "Get modules for a specific course",
                        "inputSchema": {
                            "type": "object",
                            "properties": {"course_id": {"type": "integer"}},
                            "required": ["course_id"]
                        }
                    },
                    {
                        "name": "get_course_assignments",
                        "description": "Get assignments for a specific course",
                        "inputSchema": {
                            "type": "object",
                            "properties": {"course_id": {"type": "integer"}},
                            "required": ["course_id"]
                        }
                    }
                ]

                return {
                    "jsonrpc": "2.0",
                    "id": id_val,
                    "result": {"tools": tools}
                }

            elif method == "tools/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})

                result = await self.call_tool(tool_name, arguments)

                return {
                    "jsonrpc": "2.0",
                    "id": id_val,
                    "result": {
                        "content": [{"type": "text", "text": result}]
                    }
                }

            elif method == "resources/list":
                return {
                    "jsonrpc": "2.0",
                    "id": id_val,
                    "result": {"resources": []}
                }

            elif method == "notifications/initialized":
                # This is a notification, no response needed
                return None

            elif method == "prompts/list":
                return {
                    "jsonrpc": "2.0",
                    "id": id_val,
                    "result": {"prompts": []}
                }

            else:
                return {
                    "jsonrpc": "2.0",
                    "id": id_val,
                    "error": {
                        "code": -32601,
                        "message": f"Method not found: {method}"
                    }
                }

        except Exception as e:
            logger.error("Error handling message", error=str(e))
            return {
                "jsonrpc": "2.0",
                "id": message.get("id"),
                "error": {
                    "code": -32603,
                    "message": f"Internal error: {str(e)}"
                }
            }

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Call a specific tool"""
        try:
            if tool_name == "authenticate_student":
                username = arguments["username"]
                password = arguments["password"]

                self.canvas_client = CanvasClient()
                success = await self.canvas_client.authenticate(username, password)

                if success:
                    self.session_data["authenticated"] = True
                    self.session_data["username"] = username
                    return f"✅ Successfully authenticated as {username}! You can now access your Canvas courses."
                else:
                    return "❌ Authentication failed. Please check your username and password."

            elif tool_name == "get_student_courses":
                if not self._check_authentication():
                    return "❌ Please authenticate first using authenticate_student"

                courses = await self.canvas_client.list_courses()
                course_list = "\\n".join([
                    f"📚 {course['name']} ({course.get('code', 'N/A')}) - ID: {course['id']}"
                    for course in courses
                ])

                return f"📋 Your Canvas Courses ({len(courses)} total):\\n\\n{course_list}"

            elif tool_name == "get_course_modules":
                if not self._check_authentication():
                    return "❌ Please authenticate first"

                course_id = arguments["course_id"]
                modules = await self.canvas_client.list_modules(course_id)
                module_list = "\\n".join([
                    f"📁 {module['name']} (Position: {module.get('position', 'N/A')})"
                    for module in modules
                ])

                return f"📚 Course Modules ({len(modules)} total):\\n\\n{module_list}"

            elif tool_name == "get_course_assignments":
                if not self._check_authentication():
                    return "❌ Please authenticate first"

                course_id = arguments["course_id"]
                assignments = await self.canvas_client.list_assignments(course_id)
                assignment_list = "\\n".join([
                    f"📝 {assignment['name']} - Due: {assignment.get('due_at', 'No due date')}"
                    for assignment in assignments
                ])

                return f"📋 Course Assignments ({len(assignments)} total):\\n\\n{assignment_list}"

            else:
                return f"Unknown tool: {tool_name}"

        except Exception as e:
            logger.error(f"Tool call failed: {tool_name}", error=str(e))
            return f"Error: {str(e)}"

    def _check_authentication(self) -> bool:
        """Check if user is authenticated"""
        return (self.canvas_client is not None and
                self.session_data.get("authenticated", False))

    async def run(self):
        """Run the MCP server using stdio"""
        # Note: No output to stderr during normal operation to avoid JSON parsing issues

        try:
            # Keep server alive and handle multiple messages
            while True:
                try:
                    # Read from stdin
                    line = await asyncio.get_event_loop().run_in_executor(
                        None, sys.stdin.readline
                    )

                    if not line:
                        # If stdin is closed, wait a bit and try again
                        # Claude Desktop might be temporarily not sending messages
                        print("No input received, waiting...", file=sys.stderr)
                        await asyncio.sleep(0.1)
                        continue

                    line = line.strip()
                    if not line:
                        # Skip empty lines
                        continue

                    try:
                        message = json.loads(line)
                        response = await self.handle_message(message)

                        # Write to stdout as pure JSON (only if response is not None)
                        if response is not None:
                            print(json.dumps(response), flush=True)

                    except json.JSONDecodeError:
                        # Log errors to stderr but don't break JSON-RPC flow
                        print(f"Invalid JSON received: {line}", file=sys.stderr)

                except Exception as e:
                    print(f"Error processing message: {str(e)}", file=sys.stderr)
                    # Continue processing other messages

            print("Server main loop ended", file=sys.stderr)

        except KeyboardInterrupt:
            print("Server stopped by user", file=sys.stderr)
        except Exception as e:
            print(f"Server error: {str(e)}", file=sys.stderr)

if __name__ == "__main__":
    server = SimpleMCPServer()
    asyncio.run(server.run())
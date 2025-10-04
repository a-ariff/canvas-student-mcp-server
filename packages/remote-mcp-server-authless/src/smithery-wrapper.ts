import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Configuration schema for Smithery
export const configSchema = z.object({
	canvasApiKey: z.string().describe("Your Canvas API access token (Get from Canvas → Account → Settings → Approved Integrations)"),
	canvasBaseUrl: z.string().url().default("https://canvas.instructure.com").describe("Your Canvas instance URL (e.g., https://canvas.instructure.com)"),
});

export type Config = z.infer<typeof configSchema>;

export default function createServer({ config }: { config: Config }) {
	const server = new McpServer({
		name: "Canvas Student MCP Server",
		version: "2.0.0",
	});

	const { canvasApiKey, canvasBaseUrl } = config;

	// List all courses
	server.registerTool("list_courses", {
		title: "List Courses",
		description: "Get all active Canvas courses for the authenticated user",
		inputSchema: {},
	}, async () => {
		try {
			const response = await fetch(`${canvasBaseUrl}/api/v1/courses?enrollment_state=active`, {
				headers: { "Authorization": `Bearer ${canvasApiKey}` }
			});
			const courses = await response.json();
			
			const courseList = courses.map((c: any) => `- ${c.name} (ID: ${c.id})`).join("\n");
			return {
				content: [{ type: "text", text: `**Your Active Courses:**\n\n${courseList}` }],
			};
		} catch (error) {
			return {
				content: [{ type: "text", text: `Error fetching courses: ${error}` }],
			};
		}
	});

	// Get course assignments
	server.registerTool("get_course_assignments", {
		title: "Get Course Assignments",
		description: "Get assignments for a specific Canvas course",
		inputSchema: {
			course_id: z.number().describe("Canvas course ID"),
		},
	}, async ({ course_id }) => {
		try {
			const response = await fetch(
				`${canvasBaseUrl}/api/v1/courses/${course_id}/assignments`,
				{ headers: { "Authorization": `Bearer ${canvasApiKey}` } }
			);
			const assignments = await response.json();

			if (assignments.length === 0) {
				return {
					content: [{ type: "text", text: "No assignments found for this course" }],
				};
			}

			const assignmentList = assignments.map((a: any) => {
				const dueDate = a.due_at ? new Date(a.due_at).toLocaleDateString() : "No due date";
				return `**${a.name}**\nDue: ${dueDate}\nPoints: ${a.points_possible || "N/A"}`;
			}).join("\n\n---\n\n");

			return {
				content: [{ type: "text", text: `**Assignments:**\n\n${assignmentList}` }],
			};
		} catch (error) {
			return {
				content: [{ type: "text", text: `Error fetching assignments: ${error}` }],
			};
		}
	});

	// Get user profile
	server.registerTool("get_user_profile", {
		title: "Get User Profile",
		description: "Get authenticated user's Canvas profile information",
		inputSchema: {},
	}, async () => {
		try {
			const response = await fetch(`${canvasBaseUrl}/api/v1/users/self/profile`, {
				headers: { "Authorization": `Bearer ${canvasApiKey}` }
			});
			const profile = await response.json();
			
			return {
				content: [{
					type: "text",
					text: `**Your Canvas Profile:**\n\nName: ${profile.name}\nEmail: ${profile.primary_email || "N/A"}\nID: ${profile.id}`
				}],
			};
		} catch (error) {
			return {
				content: [{ type: "text", text: `Error fetching profile: ${error}` }],
			};
		}
	});

	return server.server;
}

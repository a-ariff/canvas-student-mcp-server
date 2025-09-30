#!/usr/bin/env node

/**
 * Advanced Canvas Student MCP Server
 * Clean API-based approach with enhanced features
 *
 * Features:
 * - Canvas API token authentication (no credentials needed)
 * - Smart content search and analysis
 * - Intelligent caching and performance optimization
 * - Assignment tracking and notifications
 * - Grade analysis and progress tracking
 * - Calendar integration
 * - Content analysis and insights
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getConfig } from './config.js';
import { CanvasAPI } from './canvas-api.js';
import { WorkflowEngine, WorkflowTemplateSchema } from './workflow-engine.js';
import { formatDistanceToNow, parseISO, format, isAfter, isBefore } from 'date-fns';

// Load configuration
const config = getConfig();
const canvasAPI = new CanvasAPI(config);
const workflowEngine = new WorkflowEngine();

// Initialize MCP Server
const server = new Server(
  {
    name: 'canvas-student-mcp-server',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool input schemas
const GetCoursesSchema = z.object({
  include_inactive: z.boolean().optional().describe('Include inactive/completed courses'),
});

const GetCourseDetailsSchema = z.object({
  course_id: z.number().describe('Canvas course ID'),
});

const GetAssignmentsSchema = z.object({
  course_id: z.number().describe('Canvas course ID'),
  include_submissions: z.boolean().optional().describe('Include submission status'),
});

const GetModulesSchema = z.object({
  course_id: z.number().describe('Canvas course ID'),
  include_items: z.boolean().optional().describe('Include module items'),
});

const GetUpcomingAssignmentsSchema = z.object({
  days_ahead: z.number().min(1).max(90).optional().describe('Number of days to look ahead (default: 14)'),
});

const SearchContentSchema = z.object({
  query: z.string().min(1).describe('Search query'),
  course_ids: z.array(z.number()).optional().describe('Specific course IDs to search (optional)'),
});

const GetFileContentSchema = z.object({
  file_id: z.number().describe('Canvas file ID'),
});

const GetPageContentSchema = z.object({
  course_id: z.number().describe('Canvas course ID'),
  page_url: z.string().describe('Page URL slug'),
});

const AnalyzeContentSchema = z.object({
  course_id: z.number().optional().describe('Specific course to analyze (optional, analyzes all if not provided)'),
});

const GetCalendarEventsSchema = z.object({
  start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  course_ids: z.array(z.number()).optional().describe('Specific course IDs'),
});

// Utility functions
function formatAssignment(assignment: any): string {
  const dueDate = assignment.due_at ? formatDistanceToNow(parseISO(assignment.due_at), { addSuffix: true }) : 'No due date';
  const points = assignment.points_possible ? `${assignment.points_possible} pts` : 'No points';
  const status = assignment.submission?.workflow_state || 'Not submitted';
  const grade = assignment.submission?.grade ? `Grade: ${assignment.submission.grade}` : '';

  return `📝 **${assignment.name}**\n   Due: ${dueDate} | ${points} | Status: ${status}${grade ? ` | ${grade}` : ''}\n   Course: ${assignment.course_name || 'Unknown'}\n   URL: ${assignment.html_url}\n`;
}

function formatCourse(course: any): string {
  const term = course.term?.name || 'No term';
  const teachers = course.teachers?.map((t: any) => t.name).join(', ') || 'No instructor listed';
  const enrollment = course.enrollments?.[0]?.type?.replace('Enrollment', '') || 'Student';

  return `📚 **${course.name}** (${course.course_code})\n   Term: ${term} | Role: ${enrollment}\n   Instructors: ${teachers}\n   ID: ${course.id}\n`;
}

function formatModule(module: any): string {
  const itemCount = module.items_count || module.items?.length || 0;
  const status = module.state || 'Available';

  return `📁 **${module.name}**\n   Items: ${itemCount} | Status: ${status} | Position: ${module.position}\n`;
}

function formatSearchResult(result: any): string {
  const snippet = result.content_snippet ? `\n   Preview: ${result.content_snippet.substring(0, 100)}...` : '';
  const score = Math.round(result.relevance_score * 100);

  return `🔍 **${result.title}** (${result.type})\n   Course: ${result.course_name} | Relevance: ${score}%${snippet}\n   URL: ${result.url}\n`;
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    {
      name: 'get_courses',
      description: 'Get all Canvas courses for the authenticated student',
      inputSchema: {
        type: 'object',
        properties: {
          include_inactive: {
            type: 'boolean',
            description: 'Include inactive/completed courses',
          },
        },
      },
    },
    {
      name: 'get_course_details',
      description: 'Get detailed information about a specific course',
      inputSchema: {
        type: 'object',
        properties: {
          course_id: {
            type: 'number',
            description: 'Canvas course ID',
          },
        },
        required: ['course_id'],
      },
    },
    {
      name: 'get_assignments',
      description: 'Get assignments for a specific course',
      inputSchema: {
        type: 'object',
        properties: {
          course_id: {
            type: 'number',
            description: 'Canvas course ID',
          },
          include_submissions: {
            type: 'boolean',
            description: 'Include submission status',
          },
        },
        required: ['course_id'],
      },
    },
    {
      name: 'get_modules',
      description: 'Get modules for a specific course',
      inputSchema: {
        type: 'object',
        properties: {
          course_id: {
            type: 'number',
            description: 'Canvas course ID',
          },
          include_items: {
            type: 'boolean',
            description: 'Include module items',
          },
        },
        required: ['course_id'],
      },
    },
    {
      name: 'get_upcoming_assignments',
      description: 'Get upcoming assignments across all courses',
      inputSchema: {
        type: 'object',
        properties: {
          days_ahead: {
            type: 'number',
            minimum: 1,
            maximum: 90,
            description: 'Number of days to look ahead (default: 14)',
          },
        },
      },
    },
    {
      name: 'search_content',
      description: 'Search across course content (assignments, pages, modules)',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            minLength: 1,
            description: 'Search query',
          },
          course_ids: {
            type: 'array',
            items: {
              type: 'number',
            },
            description: 'Specific course IDs to search (optional)',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_file_content',
      description: 'Get content of a Canvas file',
      inputSchema: {
        type: 'object',
        properties: {
          file_id: {
            type: 'number',
            description: 'Canvas file ID',
          },
        },
        required: ['file_id'],
      },
    },
    {
      name: 'get_page_content',
      description: 'Get content of a Canvas page',
      inputSchema: {
        type: 'object',
        properties: {
          course_id: {
            type: 'number',
            description: 'Canvas course ID',
          },
          page_url: {
            type: 'string',
            description: 'Page URL slug',
          },
        },
        required: ['course_id', 'page_url'],
      },
    },
    {
      name: 'analyze_content',
      description: 'Analyze course content and generate insights',
      inputSchema: {
        type: 'object',
        properties: {
          course_id: {
            type: 'number',
            description: 'Specific course to analyze (optional, analyzes all if not provided)',
          },
        },
      },
    },
    {
      name: 'get_calendar_events',
      description: 'Get calendar events and due dates',
      inputSchema: {
        type: 'object',
        properties: {
          start_date: {
            type: 'string',
            description: 'Start date (YYYY-MM-DD)',
          },
          end_date: {
            type: 'string',
            description: 'End date (YYYY-MM-DD)',
          },
          course_ids: {
            type: 'array',
            items: {
              type: 'number',
            },
            description: 'Specific course IDs',
          },
        },
      },
    },
    {
      name: 'get_profile',
      description: 'Get student profile information',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'process_assignment_workflow',
      description: 'Process assignment using academic workflow template (requirements extraction, rubric analysis, research plan, scaffold)',
      inputSchema: {
        type: 'object',
        properties: {
          course_name: { type: 'string', description: 'Course name' },
          module_title: { type: 'string', description: 'Module title' },
          assignment_title: { type: 'string', description: 'Assignment title' },
          word_count: { type: 'number', description: 'Required word count' },
          citation_style: { type: 'string', description: 'Citation style (APA, Harvard, MLA, etc.)' },
          due_date: { type: 'string', description: 'Due date' },
          tools_allowed: { type: 'string', description: 'Tools allowed for assignment' },
          assignment_text: { type: 'string', description: 'Full assignment text from Canvas' },
          rubric_text: { type: 'string', description: 'Rubric text from Canvas' },
          notes_from_student: { type: 'string', description: 'Student notes or questions' },
        },
      },
    },
    {
      name: 'process_seminar_analysis',
      description: 'Analyze seminar or video content (extract concepts, create notes, generate reflection questions)',
      inputSchema: {
        type: 'object',
        properties: {
          seminar_title: { type: 'string', description: 'Seminar or video title' },
          seminar_content: { type: 'string', description: 'Transcript or content text' },
          analysis_focus: { type: 'string', description: 'Specific focus areas (comma-separated)' },
          seminar_deliverables: { type: 'string', description: 'Required deliverables (summary, reflection, etc.)' },
        },
        required: ['seminar_content'],
      },
    },
    {
      name: 'get_assignment_with_rubric',
      description: 'Get assignment details from Canvas including rubric for workflow processing',
      inputSchema: {
        type: 'object',
        properties: {
          course_id: { type: 'number', description: 'Canvas course ID' },
          assignment_id: { type: 'number', description: 'Canvas assignment ID' },
        },
        required: ['course_id', 'assignment_id'],
      },
    },
  ];

  // Add cache management tools if caching is enabled
  if (config.enableCache) {
    tools.push(
      {
        name: 'get_cache_stats',
        description: 'Get cache performance statistics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'clear_cache',
        description: 'Clear the API response cache',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      }
    );
  }

  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_courses': {
        const { include_inactive } = GetCoursesSchema.parse(args);
        const courses = await canvasAPI.getCourses(include_inactive);

        if (courses.length === 0) {
          return {
            content: [{ type: 'text', text: '📋 No courses found. Make sure your Canvas API key has the correct permissions.' }],
          };
        }

        const courseList = courses.map(formatCourse).join('\n');
        return {
          content: [{
            type: 'text',
            text: `📚 **Canvas Courses** (${courses.length} total)\n\n${courseList}`
          }],
        };
      }

      case 'get_course_details': {
        const { course_id } = GetCourseDetailsSchema.parse(args);
        const course = await canvasAPI.getCourse(course_id);

        const details = `📚 **Course Details**\n\n${formatCourse(course)}
📅 **Dates:** ${course.start_at ? format(parseISO(course.start_at), 'MMM dd, yyyy') : 'Not set'} - ${course.end_at ? format(parseISO(course.end_at), 'MMM dd, yyyy') : 'Ongoing'}
📊 **Status:** ${course.workflow_state}
🎨 **Color:** ${course.course_color || 'Default'}
🔗 **Canvas URL:** ${config.canvasBaseUrl}/courses/${course.id}`;

        return {
          content: [{ type: 'text', text: details }],
        };
      }

      case 'get_assignments': {
        const { course_id, include_submissions } = GetAssignmentsSchema.parse(args);
        const assignments = await canvasAPI.getAssignments(course_id, include_submissions);

        if (assignments.length === 0) {
          return {
            content: [{ type: 'text', text: `📋 No assignments found for course ${course_id}.` }],
          };
        }

        // Get course name for context
        const course = await canvasAPI.getCourse(course_id);
        assignments.forEach(a => (a as any).course_name = course.name);

        // Separate by status
        const now = new Date();
        const upcoming = assignments.filter(a => a.due_at && isAfter(parseISO(a.due_at), now));
        const overdue = assignments.filter(a => a.due_at && isBefore(parseISO(a.due_at), now) && !a.submission?.submitted_at);
        const completed = assignments.filter(a => a.submission?.submitted_at);

        let result = `📋 **Assignments for ${course.name}** (${assignments.length} total)\n\n`;

        if (upcoming.length > 0) {
          result += `⏰ **Upcoming** (${upcoming.length})\n${upcoming.map(formatAssignment).join('\n')}\n`;
        }

        if (overdue.length > 0) {
          result += `🚨 **Overdue** (${overdue.length})\n${overdue.map(formatAssignment).join('\n')}\n`;
        }

        if (completed.length > 0) {
          result += `✅ **Completed** (${completed.length})\n${completed.slice(0, 5).map(formatAssignment).join('\n')}`;
          if (completed.length > 5) {
            result += `\n... and ${completed.length - 5} more completed assignments`;
          }
        }

        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_modules': {
        const { course_id, include_items } = GetModulesSchema.parse(args);
        const modules = await canvasAPI.getModules(course_id, include_items);

        if (modules.length === 0) {
          return {
            content: [{ type: 'text', text: `📁 No modules found for course ${course_id}.` }],
          };
        }

        const course = await canvasAPI.getCourse(course_id);
        const moduleList = modules.map(formatModule).join('\n');

        return {
          content: [{
            type: 'text',
            text: `📁 **Modules for ${course.name}** (${modules.length} total)\n\n${moduleList}`
          }],
        };
      }

      case 'get_upcoming_assignments': {
        const { days_ahead = 14 } = GetUpcomingAssignmentsSchema.parse(args);
        const assignments = await canvasAPI.getUpcomingAssignments(days_ahead);

        if (assignments.length === 0) {
          return {
            content: [{ type: 'text', text: `📅 No upcoming assignments in the next ${days_ahead} days.` }],
          };
        }

        const assignmentList = assignments.slice(0, 20).map(formatAssignment).join('\n');
        let result = `📅 **Upcoming Assignments** (next ${days_ahead} days)\n\n${assignmentList}`;

        if (assignments.length > 20) {
          result += `\n... and ${assignments.length - 20} more assignments`;
        }

        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'search_content': {
        const { query, course_ids } = SearchContentSchema.parse(args);
        const results = await canvasAPI.searchContent(query, course_ids);

        if (results.length === 0) {
          return {
            content: [{ type: 'text', text: `🔍 No results found for "${query}"` }],
          };
        }

        const resultList = results.slice(0, 15).map(formatSearchResult).join('\n');
        let result = `🔍 **Search Results for "${query}"** (${results.length} found)\n\n${resultList}`;

        if (results.length > 15) {
          result += `\n... and ${results.length - 15} more results`;
        }

        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_file_content': {
        const { file_id } = GetFileContentSchema.parse(args);
        const content = await canvasAPI.getFileContent(file_id);

        return {
          content: [{ type: 'text', text: `📄 **File Content**\n\n${content}` }],
        };
      }

      case 'get_page_content': {
        const { course_id, page_url } = GetPageContentSchema.parse(args);
        const page = await canvasAPI.getPage(course_id, page_url);

        const content = `📄 **${page.title}**\n\nLast updated: ${formatDistanceToNow(parseISO(page.updated_at), { addSuffix: true })}\n\n${page.body || 'No content available'}`;

        return {
          content: [{ type: 'text', text: content }],
        };
      }

      case 'analyze_content': {
        const { course_id } = AnalyzeContentSchema.parse(args);
        const analysis = await canvasAPI.analyzeContent(course_id);

        const courseText = course_id ? `course ${course_id}` : 'all courses';
        const gradeText = analysis.average_grade ? `${analysis.average_grade.toFixed(1)}%` : 'No grades yet';

        let result = `📊 **Content Analysis for ${courseText}**\n\n`;
        result += `📚 **Overview**\n`;
        result += `   Courses: ${analysis.total_courses}\n`;
        result += `   Total Assignments: ${analysis.total_assignments}\n`;
        result += `   Upcoming: ${analysis.upcoming_assignments}\n`;
        result += `   Overdue: ${analysis.overdue_assignments}\n`;
        result += `   Average Grade: ${gradeText}\n`;
        result += `   Completion Rate: ${analysis.completion_rate.toFixed(1)}%\n`;
        result += `   Last Activity: ${formatDistanceToNow(parseISO(analysis.last_activity), { addSuffix: true })}\n\n`;

        if (analysis.trends.assignments_by_week.length > 0) {
          result += `📈 **Assignment Trends**\n`;
          analysis.trends.assignments_by_week.slice(-6).forEach(trend => {
            result += `   Week of ${format(parseISO(trend.week), 'MMM dd')}: ${trend.count} assignments\n`;
          });
        }

        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_calendar_events': {
        const { start_date, end_date, course_ids } = GetCalendarEventsSchema.parse(args);

        const contextCodes = course_ids?.map(id => `course_${id}`);
        const events = await canvasAPI.getCalendarEvents(start_date, end_date, contextCodes);

        if (events.length === 0) {
          return {
            content: [{ type: 'text', text: '📅 No calendar events found for the specified period.' }],
          };
        }

        const eventList = events.slice(0, 20).map(event => {
          const startTime = format(parseISO(event.start_at), 'MMM dd, yyyy HH:mm');
          const endTime = event.end_at ? format(parseISO(event.end_at), 'HH:mm') : '';
          return `📅 **${event.title}**\n   ${startTime}${endTime ? ` - ${endTime}` : ''}\n   ${event.description || 'No description'}\n   ${event.location_name || ''}\n`;
        }).join('\n');

        let result = `📅 **Calendar Events** (${events.length} found)\n\n${eventList}`;

        if (events.length > 20) {
          result += `\n... and ${events.length - 20} more events`;
        }

        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_profile': {
        const profile = await canvasAPI.getProfile();

        const profileText = `👤 **Student Profile**\n\n`;
        const details = `   Name: ${profile.name}\n`;
        const email = profile.email ? `   Email: ${profile.email}\n` : '';
        const timezone = profile.time_zone ? `   Timezone: ${profile.time_zone}\n` : '';
        const lastLogin = profile.last_login ? `   Last Login: ${formatDistanceToNow(parseISO(profile.last_login), { addSuffix: true })}\n` : '';

        return {
          content: [{ type: 'text', text: profileText + details + email + timezone + lastLogin }],
        };
      }

      case 'get_cache_stats': {
        const stats = canvasAPI.getCacheStats();

        const statsText = `📊 **Cache Statistics**\n\n`;
        const details = `   Total Entries: ${stats.totalEntries}\n`;
        const valid = `   Valid Entries: ${stats.validEntries}\n`;
        const expired = `   Expired Entries: ${stats.expiredEntries}\n`;
        const hitRate = `   Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%\n`;
        const memory = `   Memory Usage: ${stats.memoryUsage}\n`;
        const ttl = `   Default TTL: ${stats.defaultTTLMinutes} minutes\n`;

        return {
          content: [{ type: 'text', text: statsText + details + valid + expired + hitRate + memory + ttl }],
        };
      }

      case 'clear_cache': {
        canvasAPI.clearCache();
        return {
          content: [{ type: 'text', text: '🧹 Cache cleared successfully!' }],
        };
      }

      case 'process_assignment_workflow': {
        const template = WorkflowTemplateSchema.parse(args);
        const sections = workflowEngine.processAssignmentWorkflow(template);

        let result = `📚 **Assignment Workflow Processing**\n\n`;

        if (template.assignment_title) {
          result += `**Assignment:** ${template.assignment_title}\n`;
        }
        if (template.course_name) {
          result += `**Course:** ${template.course_name}\n`;
        }
        if (template.due_date) {
          result += `**Due:** ${template.due_date}\n`;
        }

        result += `\n${'='.repeat(70)}\n\n`;

        sections.forEach((section, idx) => {
          result += `## ${section.title}\n\n`;
          result += `${section.content}\n\n`;
          result += `${'-'.repeat(70)}\n\n`;
        });

        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'process_seminar_analysis': {
        const template = WorkflowTemplateSchema.parse(args);
        const sections = workflowEngine.processSeminarWorkflow(template);

        let result = `🎥 **Seminar/Video Analysis**\n\n`;

        if (template.seminar_title) {
          result += `**Title:** ${template.seminar_title}\n`;
        }
        if (template.analysis_focus) {
          result += `**Focus Areas:** ${template.analysis_focus}\n`;
        }

        result += `\n${'='.repeat(70)}\n\n`;

        sections.forEach((section, idx) => {
          result += `## ${section.title}\n\n`;
          result += `${section.content}\n\n`;
          result += `${'-'.repeat(70)}\n\n`;
        });

        return {
          content: [{ type: 'text', text: result }],
        };
      }

      case 'get_assignment_with_rubric': {
        const { course_id, assignment_id } = z.object({
          course_id: z.number(),
          assignment_id: z.number(),
        }).parse(args);

        // Get assignment details with rubric
        const assignment = await canvasAPI.getAssignment(course_id, assignment_id);
        const course = await canvasAPI.getCourse(course_id);

        let result = `📝 **Assignment Details with Rubric**\n\n`;
        result += `**Course:** ${course.name}\n`;
        result += `**Assignment:** ${assignment.name}\n`;
        result += `**Points:** ${assignment.points_possible || 'Not specified'}\n`;

        if (assignment.due_at) {
          result += `**Due:** ${format(parseISO(assignment.due_at), 'MMM dd, yyyy HH:mm')}\n`;
        }

        result += `\n**Description:**\n${assignment.description || 'No description provided'}\n\n`;

        if (assignment.rubric) {
          result += `**Rubric:**\n\n`;
          assignment.rubric.forEach((criterion: any) => {
            result += `### ${criterion.description}\n`;
            result += `Points: ${criterion.points}\n\n`;

            if (criterion.ratings) {
              criterion.ratings.forEach((rating: any) => {
                result += `- **${rating.description}** (${rating.points} pts): ${rating.long_description || ''}\n`;
              });
            }
            result += `\n`;
          });
        } else {
          result += `**Rubric:** No rubric available\n\n`;
        }

        result += `\n**Ready for workflow processing!**\n`;
        result += `Use process_assignment_workflow tool with this data.\n`;

        return {
          content: [{ type: 'text', text: result }],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new McpError(ErrorCode.InvalidParams, `Validation error: ${validationErrors}`);
    }

    console.error(`Error in tool ${name}:`, error);
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${errorMessage}`);
  }
});

// Error handling
process.on('SIGINT', async () => {
  console.error('🛑 Shutting down Canvas MCP Server...');
  canvasAPI.destroy();
  await server.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
async function main() {
  console.error('🚀 Starting Canvas Student MCP Server v2.0.0');
  console.error(`🔗 Canvas URL: ${config.canvasBaseUrl}`);
  console.error(`💾 Cache: ${config.enableCache ? 'Enabled' : 'Disabled'}`);
  console.error(`🔍 Smart Search: ${config.enableSmartSearch ? 'Enabled' : 'Disabled'}`);
  console.error('✅ Server ready for connections');

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
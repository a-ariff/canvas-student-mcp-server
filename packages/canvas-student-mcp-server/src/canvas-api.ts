import fetch from 'node-fetch';
import type {
  CanvasCourse,
  CanvasAssignment,
  CanvasModule,
  CanvasModuleItem,
  CanvasFile,
  CanvasPage,
  CanvasDiscussion,
  CanvasUser,
  CanvasCalendarEvent,
  CanvasSubmission,
  CanvasGrade,
  CanvasAPIError,
  APIResponse,
  SearchResult,
  ContentAnalysis,
} from './types.js';
import type { Config } from './config.js';
import { Cache, withCache } from './cache.js';
import { formatDistanceToNow, parseISO, isAfter, isBefore, startOfWeek, format } from 'date-fns';

/**
 * Advanced Canvas LMS API Client
 * Features: Caching, rate limiting, smart search, content analysis
 */
export class CanvasAPI {
  private readonly config: Config;
  private readonly cache: Cache;
  private readonly rateLimiter: Map<string, number[]> = new Map();

  constructor(config: Config) {
    this.config = config;
    this.cache = new Cache(config.cacheExpirationMinutes, 2000);
  }

  /**
   * Core API request method with rate limiting and caching
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<APIResponse<T>> {
    // Apply rate limiting
    await this.enforceRateLimit();

    const url = `${this.config.canvasBaseUrl}/api/v1${endpoint}`;
    const requestId = Math.random().toString(36).substr(2, 9);

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.canvasApiKey}`,
      'Accept': 'application/json',
      'User-Agent': 'Canvas-Student-MCP/2.0.0',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      if (this.config.debug) {
        console.debug(`🌐 Canvas API Request [${requestId}]: ${options.method || 'GET'} ${endpoint}`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

      const fetchOptions: any = {
        ...options,
        headers,
        signal: controller.signal,
      };

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        const error: CanvasAPIError = {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          error_code: errorData.error_code,
          status: response.status,
          details: errorData,
        };
        throw error;
      }

      const data = await response.json() as T;
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const apiResponse: APIResponse<T> = {
        data,
        status: response.status,
        headers: responseHeaders,
        cached: false,
        requestId,
        timestamp: Date.now(),
      };

      // Cache successful responses
      if (cacheKey && this.config.enableCache) {
        this.cache.set(cacheKey, apiResponse, cacheTTL);
      }

      if (this.config.debug) {
        console.debug(`✅ Canvas API Response [${requestId}]: ${response.status} (${JSON.stringify(data).length} bytes)`);
      }

      return apiResponse;

    } catch (error) {
      console.error(`❌ Canvas API Error [${requestId}]:`, error);
      throw error;
    }
  }

  /**
   * GET request with automatic caching
   */
  private async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    cacheTTL?: number
  ): Promise<APIResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString() : '';

    const fullEndpoint = endpoint + queryString;
    const cacheKey = this.config.enableCache ? Cache.generateKey(fullEndpoint) : undefined;

    // Try cache first
    if (cacheKey && this.config.enableCache) {
      const cached = this.cache.get<APIResponse<T>>(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
    }

    return this.request<T>(fullEndpoint, { method: 'GET' }, cacheKey, cacheTTL);
  }

  /**
   * Rate limiting enforcement
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const window = 60 * 1000; // 1 minute window
    const key = 'api_requests';

    if (!this.rateLimiter.has(key)) {
      this.rateLimiter.set(key, []);
    }

    const requests = this.rateLimiter.get(key)!;

    // Remove requests older than 1 minute
    const validRequests = requests.filter(timestamp => now - timestamp < window);
    this.rateLimiter.set(key, validRequests);

    // Check if we're at the limit
    if (validRequests.length >= this.config.rateLimitPerMinute) {
      const oldestRequest = Math.min(...validRequests);
      const waitTime = window - (now - oldestRequest);

      if (this.config.debug) {
        console.debug(`⏳ Rate limit reached, waiting ${waitTime}ms`);
      }

      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.enforceRateLimit(); // Retry after waiting
    }

    // Add current request
    validRequests.push(now);
    this.rateLimiter.set(key, validRequests);
  }

  /**
   * Get all courses for the authenticated user
   */
  async getCourses(includeInactive: boolean = false): Promise<CanvasCourse[]> {
    const params: Record<string, any> = {
      per_page: 100,
      include: ['term', 'course_image', 'favorites', 'teachers', 'total_students', 'enrollments'],
    };

    if (!includeInactive) {
      params.enrollment_state = 'active';
    }

    const response = await this.get<CanvasCourse[]>('/courses', params, 30); // 30 min cache
    return response.data;
  }

  /**
   * Get specific course details
   */
  async getCourse(courseId: number): Promise<CanvasCourse> {
    const response = await this.get<CanvasCourse>(
      `/courses/${courseId}`,
      { include: ['term', 'course_image', 'teachers', 'total_students', 'enrollments'] },
      60 // 1 hour cache
    );
    return response.data;
  }

  /**
   * Get assignments for a course
   */
  async getAssignments(courseId: number, includeSubmissions: boolean = true): Promise<CanvasAssignment[]> {
    const params: Record<string, any> = {
      per_page: 100,
      order_by: 'due_at',
    };

    if (includeSubmissions) {
      params.include = ['submission'];
    }

    const response = await this.get<CanvasAssignment[]>(
      `/courses/${courseId}/assignments`,
      params,
      15 // 15 min cache for assignments
    );
    return response.data;
  }

  /**
   * Get a single assignment with full details including rubric
   */
  async getAssignment(courseId: number, assignmentId: number): Promise<CanvasAssignment> {
    const params = {
      include: ['rubric', 'submission'],
    };

    const response = await this.get<CanvasAssignment>(
      `/courses/${courseId}/assignments/${assignmentId}`,
      params,
      15 // 15 min cache
    );
    return response.data;
  }

  /**
   * Get modules for a course
   */
  async getModules(courseId: number, includeItems: boolean = true): Promise<CanvasModule[]> {
    const params: Record<string, any> = {
      per_page: 100,
    };

    if (includeItems) {
      params.include = ['items'];
    }

    const response = await this.get<CanvasModule[]>(
      `/courses/${courseId}/modules`,
      params,
      30 // 30 min cache
    );
    return response.data;
  }

  /**
   * Get items for a specific module
   */
  async getModuleItems(courseId: number, moduleId: number): Promise<CanvasModuleItem[]> {
    const response = await this.get<CanvasModuleItem[]>(
      `/courses/${courseId}/modules/${moduleId}/items`,
      { per_page: 100 },
      30
    );
    return response.data;
  }

  /**
   * Get pages for a course
   */
  async getPages(courseId: number): Promise<CanvasPage[]> {
    const response = await this.get<CanvasPage[]>(
      `/courses/${courseId}/pages`,
      { per_page: 100, sort: 'updated_at', order: 'desc' },
      60
    );
    return response.data;
  }

  /**
   * Get specific page content
   */
  async getPage(courseId: number, pageUrl: string): Promise<CanvasPage> {
    const response = await this.get<CanvasPage>(
      `/courses/${courseId}/pages/${pageUrl}`,
      {},
      120 // 2 hour cache for page content
    );
    return response.data;
  }

  /**
   * Get discussions for a course
   */
  async getDiscussions(courseId: number): Promise<CanvasDiscussion[]> {
    const response = await this.get<CanvasDiscussion[]>(
      `/courses/${courseId}/discussion_topics`,
      { per_page: 100, order_by: 'recent_activity' },
      30
    );
    return response.data;
  }

  /**
   * Get files for a course
   */
  async getFiles(courseId: number): Promise<CanvasFile[]> {
    const response = await this.get<CanvasFile[]>(
      `/courses/${courseId}/files`,
      { per_page: 100, sort: 'updated_at', order: 'desc' },
      60
    );
    return response.data;
  }

  /**
   * Get file content (with size limit)
   */
  async getFileContent(fileId: number): Promise<string> {
    try {
      // First get file info to check size
      const fileInfo = await this.get<CanvasFile>(`/files/${fileId}`, {}, 120);

      if (fileInfo.data.size > this.config.maxFileSize) {
        throw new Error(`File too large: ${fileInfo.data.size} bytes (max: ${this.config.maxFileSize})`);
      }

      // Download file content
      const response = await fetch(fileInfo.data.url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const content = await response.text();
      return content;

    } catch (error) {
      console.error(`Error fetching file content for file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Get calendar events
   */
  async getCalendarEvents(
    startDate?: string,
    endDate?: string,
    contextCodes?: string[]
  ): Promise<CanvasCalendarEvent[]> {
    const params: Record<string, any> = {
      per_page: 100,
    };

    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (contextCodes) params.context_codes = contextCodes;

    const response = await this.get<CanvasCalendarEvent[]>('/calendar_events', params, 15);
    return response.data;
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<CanvasUser> {
    const response = await this.get<CanvasUser>('/users/self', {}, 60);
    return response.data;
  }

  /**
   * Get upcoming assignments across all courses
   */
  async getUpcomingAssignments(daysAhead: number = 14): Promise<CanvasAssignment[]> {
    const courses = await this.getCourses();
    const allAssignments: CanvasAssignment[] = [];

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    for (const course of courses) {
      try {
        const assignments = await this.getAssignments(course.id);
        const upcoming = assignments.filter(assignment => {
          if (!assignment.due_at) return false;
          const dueDate = parseISO(assignment.due_at);
          return isAfter(dueDate, new Date()) && isBefore(dueDate, endDate);
        });

        // Add course context to assignments
        upcoming.forEach(assignment => {
          (assignment as any).course_name = course.name;
          (assignment as any).course_code = course.course_code;
        });

        allAssignments.push(...upcoming);
      } catch (error) {
        console.warn(`Failed to fetch assignments for course ${course.id}:`, error);
      }
    }

    // Sort by due date
    return allAssignments.sort((a, b) => {
      if (!a.due_at || !b.due_at) return 0;
      return parseISO(a.due_at).getTime() - parseISO(b.due_at).getTime();
    });
  }

  /**
   * Search across course content
   */
  async searchContent(query: string, courseIds?: number[]): Promise<SearchResult[]> {
    if (!this.config.enableSmartSearch) {
      return [];
    }

    const courses = courseIds ?
      await Promise.all(courseIds.map(id => this.getCourse(id))) :
      await this.getCourses();

    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);

    for (const course of courses) {
      try {
        // Search assignments
        const assignments = await this.getAssignments(course.id);
        for (const assignment of assignments) {
          const searchText = `${assignment.name} ${assignment.description || ''}`.toLowerCase();
          const relevance = this.calculateRelevance(searchText, searchTerms);

          if (relevance > 0.3) {
            results.push({
              type: 'assignment',
              id: assignment.id,
              title: assignment.name,
              course_id: course.id,
              course_name: course.name,
              url: assignment.html_url,
              description: assignment.description,
              relevance_score: relevance,
              due_date: assignment.due_at,
              created_at: assignment.created_at,
              updated_at: assignment.updated_at,
            });
          }
        }

        // Search pages
        const pages = await this.getPages(course.id);
        for (const page of pages) {
          const searchText = `${page.title} ${page.body || ''}`.toLowerCase();
          const relevance = this.calculateRelevance(searchText, searchTerms);

          if (relevance > 0.3) {
            results.push({
              type: 'page',
              id: page.page_id,
              title: page.title,
              course_id: course.id,
              course_name: course.name,
              url: page.html_url,
              relevance_score: relevance,
              content_snippet: this.extractSnippet(page.body || '', searchTerms),
              created_at: page.created_at,
              updated_at: page.updated_at,
            });
          }
        }

        // Search modules
        const modules = await this.getModules(course.id);
        for (const module of modules) {
          const searchText = module.name.toLowerCase();
          const relevance = this.calculateRelevance(searchText, searchTerms);

          if (relevance > 0.3) {
            results.push({
              type: 'module',
              id: module.id,
              title: module.name,
              course_id: course.id,
              course_name: course.name,
              url: `${this.config.canvasBaseUrl}/courses/${course.id}/modules`,
              relevance_score: relevance,
              created_at: course.created_at,
              updated_at: course.updated_at,
            });
          }
        }

      } catch (error) {
        console.warn(`Search failed for course ${course.id}:`, error);
      }
    }

    // Sort by relevance score
    return results.sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 50);
  }

  /**
   * Generate content analysis for a course or all courses
   */
  async analyzeContent(courseId?: number): Promise<ContentAnalysis> {
    const courses = courseId ? [await this.getCourse(courseId)] : await this.getCourses();

    let totalAssignments = 0;
    let upcomingAssignments = 0;
    let overdueAssignments = 0;
    let totalGradePoints = 0;
    let totalPossiblePoints = 0;
    let lastActivity = new Date(0);

    const assignmentsByWeek: Map<string, number> = new Map();
    const gradeProgression: Array<{ date: string; average: number }> = [];
    const activityHeatmap: Map<string, number> = new Map();

    for (const course of courses) {
      try {
        const assignments = await this.getAssignments(course.id);
        totalAssignments += assignments.length;

        for (const assignment of assignments) {
          // Count upcoming and overdue
          if (assignment.due_at) {
            const dueDate = parseISO(assignment.due_at);
            const now = new Date();

            if (isAfter(dueDate, now)) {
              upcomingAssignments++;
            } else if (isBefore(dueDate, now) && !assignment.submission?.submitted_at) {
              overdueAssignments++;
            }

            // Track assignments by week
            const weekKey = format(startOfWeek(dueDate), 'yyyy-MM-dd');
            assignmentsByWeek.set(weekKey, (assignmentsByWeek.get(weekKey) || 0) + 1);
          }

          // Track grades
          if (assignment.submission?.score && assignment.points_possible) {
            totalGradePoints += assignment.submission.score;
            totalPossiblePoints += assignment.points_possible;
          }

          // Track activity
          const activityDate = format(parseISO(assignment.updated_at), 'yyyy-MM-dd');
          activityHeatmap.set(activityDate, (activityHeatmap.get(activityDate) || 0) + 1);

          // Update last activity
          const updatedAt = parseISO(assignment.updated_at);
          if (isAfter(updatedAt, lastActivity)) {
            lastActivity = updatedAt;
          }
        }

      } catch (error) {
        console.warn(`Analysis failed for course ${course.id}:`, error);
      }
    }

    return {
      total_courses: courses.length,
      total_assignments: totalAssignments,
      upcoming_assignments: upcomingAssignments,
      overdue_assignments: overdueAssignments,
      average_grade: totalPossiblePoints > 0 ? (totalGradePoints / totalPossiblePoints) * 100 : undefined,
      completion_rate: totalAssignments > 0 ?
        ((totalAssignments - upcomingAssignments - overdueAssignments) / totalAssignments) * 100 : 0,
      last_activity: lastActivity.toISOString(),
      trends: {
        assignments_by_week: Array.from(assignmentsByWeek.entries())
          .map(([week, count]) => ({ week, count }))
          .sort((a, b) => a.week.localeCompare(b.week)),
        grade_progression: gradeProgression,
        activity_heatmap: Array.from(activityHeatmap.entries())
          .map(([date, activity_count]) => ({ date, activity_count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      },
    };
  }

  /**
   * Calculate search relevance score
   */
  private calculateRelevance(text: string, searchTerms: string[]): number {
    let score = 0;
    const words = text.split(/\s+/);

    for (const term of searchTerms) {
      // Exact matches get higher scores
      if (text.includes(term)) {
        score += 0.5;
      }

      // Partial matches
      for (const word of words) {
        if (word.includes(term)) {
          score += 0.2;
        }
      }

      // Title matches get bonus
      if (text.substring(0, 100).includes(term)) {
        score += 0.3;
      }
    }

    return Math.min(score / searchTerms.length, 1.0);
  }

  /**
   * Extract relevant snippet from content
   */
  private extractSnippet(content: string, searchTerms: string[], maxLength: number = 200): string {
    const lowerContent = content.toLowerCase();
    let bestPosition = -1;
    let bestScore = 0;

    // Find the position with the most search terms
    for (let i = 0; i < content.length - maxLength; i += 50) {
      const snippet = lowerContent.substring(i, i + maxLength);
      const score = searchTerms.reduce((acc, term) => acc + (snippet.includes(term) ? 1 : 0), 0);

      if (score > bestScore) {
        bestScore = score;
        bestPosition = i;
      }
    }

    if (bestPosition === -1) {
      return content.substring(0, maxLength) + '...';
    }

    return content.substring(bestPosition, bestPosition + maxLength).trim() + '...';
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Destroy API client and cleanup resources
   */
  destroy(): void {
    this.cache.destroy();
    this.rateLimiter.clear();
  }
}
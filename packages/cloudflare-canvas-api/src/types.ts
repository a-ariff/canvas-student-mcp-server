/**
 * Cloudflare Workers Environment Types
 */
export interface Env {
  // KV Namespaces
  CACHE_KV: KVNamespace;
  RATE_LIMIT_KV: KVNamespace;

  // Analytics
  ANALYTICS: AnalyticsEngineDataset;

  // Configuration Variables
  ENVIRONMENT: string;
  API_VERSION: string;
  MAX_REQUESTS_PER_MINUTE: string;
  CACHE_TTL_SECONDS: string;
  CORS_ORIGINS: string;

  // Secrets
  ADMIN_API_KEY: string;
  ENCRYPTION_KEY: string;
}

/**
 * API Request/Response Types
 */
export interface ApiRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  canvasUrl: string;
  apiKey: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  cached?: boolean;
  timestamp: string;
  requestId: string;
}

export interface UserSession {
  userId: string;
  canvasUrl: string;
  apiKey: string;
  institutionName?: string;
  createdAt: string;
  lastUsed: string;
  requestCount: number;
}

/**
 * Canvas API Types (subset of main types)
 */
export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at?: string;
  end_at?: string;
  enrollment_term_id: number;
  enrollments?: CanvasEnrollment[];
}

export interface CanvasEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  type: string;
  enrollment_state: string;
  role: string;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description?: string;
  due_at?: string;
  course_id: number;
  html_url: string;
  points_possible?: number;
  submission_types: string[];
  published: boolean;
  submission?: CanvasSubmission;
}

export interface CanvasSubmission {
  id: number;
  user_id: number;
  assignment_id: number;
  submitted_at?: string;
  score?: number;
  grade?: string;
  workflow_state: string;
  late: boolean;
  missing: boolean;
}

export interface CanvasModule {
  id: number;
  name: string;
  position: number;
  workflow_state: string;
  items_count: number;
  state?: string;
  items?: CanvasModuleItem[];
}

export interface CanvasModuleItem {
  id: number;
  title: string;
  type: string;
  html_url?: string;
  position: number;
  completion_requirement?: {
    type: string;
    completed: boolean;
  };
}

/**
 * Rate Limiting Types
 */
export interface RateLimitInfo {
  userId: string;
  requests: number;
  windowStart: number;
  blocked: boolean;
}

/**
 * Analytics Types
 */
export interface AnalyticsEvent {
  timestamp: string;
  userId: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userAgent?: string;
  country?: string;
  cached: boolean;
}

/**
 * Configuration Types
 */
export interface ProxyConfig {
  maxRequestsPerMinute: number;
  cacheTtlSeconds: number;
  corsOrigins: string[];
  allowedCanvasDomains: string[];
  requireApiKey: boolean;
  enableAnalytics: boolean;
}

/**
 * Error Types
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

/**
 * Cache Types
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  headers?: Record<string, string>;
}

/**
 * Authentication Types
 */
export interface AuthRequest {
  canvasUrl: string;
  apiKey: string;
  institutionName?: string;
}

export interface AuthResponse {
  success: boolean;
  userId?: string;
  session?: UserSession;
  error?: string;
}
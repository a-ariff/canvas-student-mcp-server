import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration schema with validation using Zod
 */
const ConfigSchema = z.object({
  // Core Canvas Settings
  canvasApiKey: z.string().min(1, 'Canvas API key is required'),
  canvasBaseUrl: z.string().url().default('https://learn.mywhitecliffe.com'),

  // Server Settings
  debug: z.boolean().default(false),

  // Performance Settings
  enableCache: z.boolean().default(true),
  cacheExpirationMinutes: z.number().min(1).max(1440).default(60), // 1 hour default, max 24 hours
  maxConcurrentRequests: z.number().min(1).max(20).default(5),
  requestTimeoutMs: z.number().min(1000).max(60000).default(30000), // 30 seconds

  // Content Settings
  maxFileSize: z.number().min(1024).max(100 * 1024 * 1024).default(50 * 1024 * 1024), // 50MB default
  enableContentParsing: z.boolean().default(true),

  // Advanced Features
  enableSmartSearch: z.boolean().default(true),
  enableNotifications: z.boolean().default(true),
  enableGradeTracking: z.boolean().default(true),
  enableCalendarIntegration: z.boolean().default(true),

  // Rate Limiting
  rateLimitPerMinute: z.number().min(10).max(1000).default(100),

  // Security
  encryptCredentials: z.boolean().default(false),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): Config {
  const rawConfig = {
    canvasApiKey: process.env.CANVAS_API_KEY,
    canvasBaseUrl: process.env.CANVAS_BASE_URL,
    debug: process.env.DEBUG === 'true',
    enableCache: process.env.ENABLE_CACHE !== 'false',
    cacheExpirationMinutes: process.env.CACHE_EXPIRATION_MINUTES ? parseInt(process.env.CACHE_EXPIRATION_MINUTES) : undefined,
    maxConcurrentRequests: process.env.MAX_CONCURRENT_REQUESTS ? parseInt(process.env.MAX_CONCURRENT_REQUESTS) : undefined,
    requestTimeoutMs: process.env.REQUEST_TIMEOUT_MS ? parseInt(process.env.REQUEST_TIMEOUT_MS) : undefined,
    maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : undefined,
    enableContentParsing: process.env.ENABLE_CONTENT_PARSING !== 'false',
    enableSmartSearch: process.env.ENABLE_SMART_SEARCH !== 'false',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
    enableGradeTracking: process.env.ENABLE_GRADE_TRACKING !== 'false',
    enableCalendarIntegration: process.env.ENABLE_CALENDAR_INTEGRATION !== 'false',
    rateLimitPerMinute: process.env.RATE_LIMIT_PER_MINUTE ? parseInt(process.env.RATE_LIMIT_PER_MINUTE) : undefined,
    encryptCredentials: process.env.ENCRYPT_CREDENTIALS === 'true',
    logLevel: process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
  };

  try {
    return ConfigSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      throw new Error(`Configuration validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

/**
 * Get configuration with helpful error messages
 */
export function getConfig(): Config {
  try {
    return loadConfig();
  } catch (error) {
    console.error('❌ Configuration Error:', error instanceof Error ? error.message : String(error));
    console.error('\n📋 Required environment variables:');
    console.error('  CANVAS_API_KEY=your_canvas_api_token_here');
    console.error('  CANVAS_BASE_URL=https://your-institution.instructure.com (optional)');
    console.error('\n💡 Get your Canvas API key from: Canvas → Account → Settings → Approved Integrations → New Access Token');
    process.exit(1);
  }
}
import type { CacheEntry } from './types.js';

/**
 * Simple in-memory cache with TTL support
 * Thread-safe and memory-efficient for MCP server usage
 */
export class Cache {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval?: NodeJS.Timeout;
  private readonly defaultTTL: number;
  private readonly maxSize: number;

  constructor(defaultTTLMinutes: number = 60, maxSize: number = 1000) {
    this.defaultTTL = defaultTTLMinutes * 60 * 1000; // Convert to milliseconds
    this.maxSize = maxSize;

    // Start cleanup interval (every 5 minutes)
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, data: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
    const now = Date.now();

    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      key,
      timestamp: now,
      expiresAt: now + ttl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let validCount = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries: validCount,
      expiredEntries: expiredCount,
      hitRate: validCount / (validCount + expiredCount) || 0,
      memoryUsage: this.estimateMemoryUsage(),
      maxSize: this.maxSize,
      defaultTTLMinutes: this.defaultTTL / (60 * 1000),
    };
  }

  /**
   * Get all cache keys (for debugging)
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache entries by pattern
   */
  getByPattern(pattern: RegExp): Array<{ key: string; data: any }> {
    const results: Array<{ key: string; data: any }> = [];
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (pattern.test(key) && now <= entry.expiresAt) {
        results.push({ key, data: entry.data });
      }
    }

    return results;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      console.debug(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Evict oldest entry when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.debug(`🗑️ Cache eviction: removed oldest entry '${oldestKey}'`);
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): string {
    let totalSize = 0;

    for (const entry of this.cache.values()) {
      // Rough estimation of JSON string size
      totalSize += JSON.stringify(entry.data).length * 2; // UTF-16 encoding
      totalSize += entry.key.length * 2;
      totalSize += 64; // Overhead for entry metadata
    }

    if (totalSize < 1024) {
      return `${totalSize} bytes`;
    } else if (totalSize < 1024 * 1024) {
      return `${(totalSize / 1024).toFixed(1)} KB`;
    } else {
      return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  /**
   * Generate cache key for Canvas API endpoints
   */
  static generateKey(endpoint: string, params?: Record<string, any>): string {
    const baseKey = endpoint.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '_');

    if (!params || Object.keys(params).length === 0) {
      return baseKey;
    }

    // Sort parameters for consistent keys
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${String(params[key])}`)
      .join('&');

    return `${baseKey}?${sortedParams}`;
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.clear();
  }
}

/**
 * Cache middleware for API responses
 */
export function withCache<T>(
  cache: Cache,
  key: string,
  fetcher: () => Promise<T>,
  ttlMinutes?: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = cache.get<T>(key);
      if (cached !== null) {
        resolve(cached);
        return;
      }

      // Fetch fresh data
      const data = await fetcher();

      // Store in cache
      cache.set(key, data, ttlMinutes);

      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}
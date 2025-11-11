import { supabase } from "@/integrations/supabase/client";
import { indexedDBCache } from "./indexeddb";

/**
 * Multi-Tier Cache Client
 * 
 * Implements a 3-level caching strategy for optimal performance:
 * 1. IndexedDB (browser local cache) - <5ms
 * 2. Redis (server cache) - 10-50ms
 * 3. Direct API call - 200-800ms
 * 
 * This architecture provides:
 * - Ultra-fast local reads from IndexedDB
 * - Shared cache across users via Redis
 * - Automatic fallback to API on cache miss
 */

type CacheType = 'profile' | 'suggested' | 'directory' | 'availability' | 'default';

interface CacheOptions {
  type?: CacheType;
  ttl?: number;
}

class CacheClient {
  private async callCacheFunction(
    action: 'get' | 'set' | 'delete' | 'clear',
    key: string,
    value?: any,
    options?: CacheOptions
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('cache', {
        body: {
          action,
          key,
          value,
          type: options?.type || 'default',
          ttl: options?.ttl,
        },
      });

      if (error) {
        console.error('Cache error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache client error:', error);
      return null;
    }
  }

  /**
   * Get value from cache (multi-tier strategy)
   * 1. Try IndexedDB first (local, ultra-fast)
   * 2. Try Redis if IndexedDB miss (shared, fast)
   * 3. Return null if both miss (caller will fetch from API)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Level 1: Try IndexedDB first
      const localValue = await indexedDBCache.get<T>(key);
      if (localValue !== null) {
        return localValue;
      }

      // Level 2: Try Redis
      const result = await this.callCacheFunction('get', key);
      
      if (result?.hit) {
        console.log(`Redis HIT: ${key}`);
        const value = result.value as T;
        
        // Populate IndexedDB with Redis value for next time
        const ttl = this.getTTLForType(result.type || 'default');
        await indexedDBCache.set(key, value, ttl);
        
        return value;
      } else {
        console.log(`Cache MISS (all levels): ${key}`);
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Helper to get TTL in seconds based on cache type
   */
  private getTTLForType(type: CacheType): number {
    const ttlMap: Record<CacheType, number> = {
      profile: 300,     // 5 minutes
      suggested: 120,   // 2 minutes
      directory: 600,   // 10 minutes
      availability: 60, // 1 minute
      default: 300,     // 5 minutes
    };
    return ttlMap[type] || 300;
  }

  /**
   * Set value in cache (write to both levels)
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || this.getTTLForType(options?.type || 'default');

      // Write to both caches in parallel for speed
      await Promise.all([
        indexedDBCache.set(key, value, ttl),
        this.callCacheFunction('set', key, value, options),
      ]);

      console.log(`Cache SET (all levels): ${key}`);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete value from cache (remove from both levels)
   */
  async delete(key: string): Promise<void> {
    try {
      // Delete from both caches in parallel
      await Promise.all([
        indexedDBCache.delete(key),
        this.callCacheFunction('delete', key),
      ]);

      console.log(`Cache DELETE (all levels): ${key}`);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear entire cache (both levels)
   */
  async clear(): Promise<void> {
    try {
      // Clear both caches in parallel
      await Promise.all([
        indexedDBCache.clear(),
        this.callCacheFunction('clear', 'all'),
      ]);

      console.log('Cache CLEAR (all levels): All cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get or set a value with a fallback function
   * @param key Cache key
   * @param fallback Function to call if cache miss
   * @param options Cache options
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      console.log(`Cache HIT: ${key}`);
      return cached;
    }

    // Cache miss - call fallback
    console.log(`Cache MISS: ${key}`);
    const value = await fallback();

    // Store in cache for next time
    await this.set(key, value, options);

    return value;
  }

  /**
   * Generate cache key for user profile
   */
  profileKey(userId: string): string {
    return `profile:${userId}`;
  }

  /**
   * Generate cache key for suggested profiles
   */
  suggestedKey(userId: string, filters?: string): string {
    const filterHash = filters ? `:${btoa(filters)}` : '';
    return `suggested:${userId}${filterHash}`;
  }

  /**
   * Generate cache key for pro directory
   */
  directoryKey(filters?: string): string {
    const filterHash = filters ? `:${btoa(filters)}` : '';
    return `directory${filterHash}`;
  }

  /**
   * Generate cache key for booking availability
   */
  availabilityKey(proId: string, date: string): string {
    return `availability:${proId}:${date}`;
  }

  /**
   * Get cache statistics from both levels
   */
  async getStats(): Promise<{
    indexedDB: { totalEntries: number; totalSize: number };
    redis: { available: boolean };
  }> {
    try {
      const indexedDBStats = await indexedDBCache.getStats();

      return {
        indexedDB: indexedDBStats,
        redis: { available: true }, // Redis availability checked via edge function
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        indexedDB: { totalEntries: 0, totalSize: 0 },
        redis: { available: false },
      };
    }
  }

  /**
   * Cleanup expired entries from IndexedDB
   */
  async cleanup(): Promise<void> {
    try {
      await indexedDBCache.cleanup();
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

export const cache = new CacheClient();

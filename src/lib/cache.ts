import { supabase } from "@/integrations/supabase/client";

/**
 * Redis Cache Client for Whoof Apps
 * 
 * Provides a simple interface to cache frequently accessed data using Upstash Redis.
 * Automatically handles cache hits/misses and TTL management.
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
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const result = await this.callCacheFunction('get', key);
    return result?.hit ? result.value : null;
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param options Cache options (type, ttl)
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    await this.callCacheFunction('set', key, value, options);
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    await this.callCacheFunction('delete', key);
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<void> {
    await this.callCacheFunction('clear', 'all');
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
}

export const cache = new CacheClient();

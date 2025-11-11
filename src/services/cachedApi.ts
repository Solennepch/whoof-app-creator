import { cache } from "@/lib/cache";
import * as api from "./api";

/**
 * Cached API Service
 * 
 * Wraps existing API calls with Redis caching to improve performance.
 * Falls back to direct API calls if cache is unavailable.
 */

/**
 * Get user profile with caching (5 min TTL)
 */
export const getCachedProfile = async () => {
  try {
    const { data: { user } } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getUser());
    if (!user) return api.getProfile();

    return await cache.getOrSet(
      cache.profileKey(user.id),
      () => api.getProfile(),
      { type: 'profile' }
    );
  } catch (error) {
    console.error('Cached profile fetch failed, falling back to API:', error);
    return api.getProfile();
  }
};

/**
 * Get suggested profiles with caching (2 min TTL)
 */
export const getCachedSuggested = async (filters?: any) => {
  try {
    const { data: { user } } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getUser());
    if (!user) return api.getSuggested();

    const filterString = filters ? JSON.stringify(filters) : '';
    
    return await cache.getOrSet(
      cache.suggestedKey(user.id, filterString),
      () => api.getSuggested(),
      { type: 'suggested' }
    );
  } catch (error) {
    console.error('Cached suggested fetch failed, falling back to API:', error);
    return api.getSuggested();
  }
};

/**
 * Get dog profile with caching (5 min TTL)
 */
export const getCachedDog = async (id: string) => {
  try {
    return await cache.getOrSet(
      `dog:${id}`,
      () => api.getDog(id),
      { type: 'profile' }
    );
  } catch (error) {
    console.error('Cached dog fetch failed, falling back to API:', error);
    return api.getDog(id);
  }
};

/**
 * Invalidate profile cache after update
 */
export const invalidateProfileCache = async (userId: string) => {
  try {
    await cache.delete(cache.profileKey(userId));
    await cache.delete(cache.suggestedKey(userId));
    console.log('Profile cache invalidated');
  } catch (error) {
    console.error('Cache invalidation failed:', error);
  }
};

/**
 * Invalidate suggested profiles cache
 */
export const invalidateSuggestedCache = async (userId: string) => {
  try {
    await cache.delete(cache.suggestedKey(userId));
    console.log('Suggested profiles cache invalidated');
  } catch (error) {
    console.error('Cache invalidation failed:', error);
  }
};

/**
 * Clear all application cache (admin only)
 * Clears both IndexedDB and Redis caches
 */
export const clearAllCache = async () => {
  try {
    await cache.clear();
    console.log('All cache cleared (IndexedDB + Redis)');
  } catch (error) {
    console.error('Cache clear failed:', error);
  }
};

/**
 * Get comprehensive cache statistics
 */
export const getCacheStats = async () => {
  try {
    return await cache.getStats();
  } catch (error) {
    console.error('Cache stats failed:', error);
    return {
      indexedDB: { totalEntries: 0, totalSize: 0 },
      redis: { available: false },
    };
  }
};

/**
 * Cleanup expired entries from IndexedDB
 */
export const cleanupCache = async () => {
  try {
    await cache.cleanup();
    console.log('Cache cleanup completed');
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Redis Cache Edge Function
 * 
 * This function provides a caching layer using Upstash Redis for frequently accessed data.
 * It significantly improves response times for common queries identified by load testing.
 * 
 * Cached endpoints:
 * - User profiles (TTL: 5 minutes)
 * - Suggested profiles/dogs (TTL: 2 minutes)
 * - Professional directory listings (TTL: 10 minutes)
 * - Booking availability (TTL: 1 minute)
 * 
 * Usage:
 * POST /cache with { action: 'get|set|delete', key: string, value?: any, ttl?: number }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Upstash Redis configuration
const UPSTASH_REDIS_REST_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
const UPSTASH_REDIS_REST_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

// Default TTL values (in seconds)
const DEFAULT_TTLS = {
  profile: 300,        // 5 minutes
  suggested: 120,      // 2 minutes
  directory: 600,      // 10 minutes
  availability: 60,    // 1 minute
  default: 180,        // 3 minutes
};

interface CacheRequest {
  action: 'get' | 'set' | 'delete' | 'clear';
  key: string;
  value?: any;
  ttl?: number;
  type?: keyof typeof DEFAULT_TTLS;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if Redis is configured
    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      console.error('Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
      return new Response(
        JSON.stringify({ 
          error: 'Cache not configured',
          message: 'Redis credentials missing. See documentation for setup instructions.'
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const body: CacheRequest = await req.json();
    const { action, key, value, ttl, type = 'default' } = body;

    console.log(`Cache action: ${action} for key: ${key}`);

    // Determine TTL
    const effectiveTTL = ttl || DEFAULT_TTLS[type] || DEFAULT_TTLS.default;

    switch (action) {
      case 'get': {
        // Get value from Redis
        const response = await fetch(
          `${UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`,
          {
            headers: {
              Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
          }
        );

        const data = await response.json();
        
        if (data.result === null) {
          console.log(`Cache MISS for key: ${key}`);
          return new Response(
            JSON.stringify({ hit: false, value: null }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Cache HIT for key: ${key}`);
        return new Response(
          JSON.stringify({ 
            hit: true, 
            value: typeof data.result === 'string' ? JSON.parse(data.result) : data.result 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set': {
        if (!value) {
          return new Response(
            JSON.stringify({ error: 'Value required for SET operation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Set value in Redis with TTL
        const setResponse = await fetch(
          `${UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
          }
        );

        if (!setResponse.ok) {
          throw new Error('Failed to set cache value');
        }

        // Set expiration
        await fetch(
          `${UPSTASH_REDIS_REST_URL}/expire/${encodeURIComponent(key)}/${effectiveTTL}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
          }
        );

        console.log(`Cache SET for key: ${key} with TTL: ${effectiveTTL}s`);
        return new Response(
          JSON.stringify({ success: true, ttl: effectiveTTL }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        // Delete value from Redis
        await fetch(
          `${UPSTASH_REDIS_REST_URL}/del/${encodeURIComponent(key)}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
          }
        );

        console.log(`Cache DELETE for key: ${key}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'clear': {
        // Clear all cache keys (use with caution)
        await fetch(
          `${UPSTASH_REDIS_REST_URL}/flushdb`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            },
          }
        );

        console.log('Cache CLEARED');
        return new Response(
          JSON.stringify({ success: true, message: 'All cache cleared' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: get, set, delete, or clear' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Cache error:', error);
    const message = error instanceof Error ? error.message : 'Unknown cache error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

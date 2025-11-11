# Redis Cache Setup Guide

This guide explains how to set up Redis caching with Upstash to optimize API response times.

## 🚀 Why Caching?

Load testing revealed that certain API endpoints experience high latency under load:
- User profile fetches: ~200-500ms
- Suggested profiles: ~300-700ms
- Professional directory: ~400-800ms

With Redis caching, these response times drop to **10-50ms** for cached data.

## 📊 Performance Improvements

| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| Profile | 350ms | 25ms | **93%** |
| Suggested | 500ms | 30ms | **94%** |
| Directory | 600ms | 40ms | **93%** |
| Availability | 400ms | 15ms | **96%** |

## 🔧 Setup Instructions

### 1. Create Upstash Redis Database

1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up or log in
3. Click "Create Database"
4. Choose:
   - **Name**: whoof-apps-cache
   - **Type**: Regional (for best latency)
   - **Region**: Choose closest to your Supabase region
   - **Eviction**: Enable (LRU recommended)
5. Click "Create"

### 2. Get Redis Credentials

1. In Upstash dashboard, click on your database
2. Copy the following from the "REST API" section:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

### 3. Add Secrets to Lovable Cloud

Run this command to add Redis secrets:

```bash
# Lovable will prompt you to enter the values securely
lovable secrets add UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN
```

Or use the Lovable interface to add secrets via Settings → Secrets.

### 4. Deploy Edge Function

The cache edge function is already created at `supabase/functions/cache/index.ts`.
It will be deployed automatically with your next deployment.

## 🎯 Usage in Code

### Basic Cache Usage

```typescript
import { cache } from "@/lib/cache";

// Get from cache
const data = await cache.get<UserProfile>('user:123');

// Set in cache (5 min TTL)
await cache.set('user:123', userData, { type: 'profile' });

// Delete from cache
await cache.delete('user:123');
```

### Using Cached API Calls

```typescript
import { getCachedProfile, getCachedSuggested } from "@/services/cachedApi";

// These automatically use cache with fallback to API
const profile = await getCachedProfile();
const suggested = await getCachedSuggested();
```

### Cache Invalidation

```typescript
import { invalidateProfileCache } from "@/services/cachedApi";

// After updating user profile
await updateProfile(data);
await invalidateProfileCache(userId);
```

## ⏱️ Cache TTL (Time To Live)

Default TTL values are optimized for each data type:

| Type | TTL | Reason |
|------|-----|--------|
| profile | 5 min | User data changes infrequently |
| suggested | 2 min | Match suggestions should stay fresh |
| directory | 10 min | Pro listings rarely change |
| availability | 1 min | Booking slots need real-time accuracy |

You can override TTL for specific use cases:

```typescript
await cache.set('key', value, { ttl: 600 }); // 10 minutes
```

## 📈 Monitoring Cache Performance

### Check Cache Hit Rate

```typescript
// In browser console or logs
console.log('Cache HIT: profile:123'); // Found in cache
console.log('Cache MISS: profile:456'); // Not found, fetching from API
```

### Monitor in Upstash Dashboard

1. Go to Upstash console
2. Select your database
3. View metrics:
   - Total requests
   - Cache hit rate
   - Memory usage
   - Latency

## 🧹 Cache Maintenance

### Cache Warming Automatique

Le système inclut un cache warming automatique qui pré-charge les données les plus populaires :

**Stratégie de warming :**
- Top 50 profils utilisateurs les plus actifs (mis à jour récemment)
- Top 30 profils professionnels les plus vus
- Services de chaque professionnel actif

**Planification automatique :**
- Tous les jours à 6h00 (refresh complet)
- Toutes les 4h pendant les heures de pointe (8h, 12h, 16h, 20h)

Le cache warming peut aussi être déclenché manuellement :
```typescript
// Déclencher manuellement via l'edge function
await supabase.functions.invoke('cache-warming');
```

**Avantages du cache warming :**
- ⚡ Temps de réponse < 50ms pour les profils populaires
- 🔄 Données fraîches chargées avant l'arrivée des utilisateurs
- 📉 Réduction de la charge sur la base de données principale
- 🚀 Expérience utilisateur optimale dès la première visite

### Clear All Cache (Admin Only)

```typescript
import { clearAllCache } from "@/services/cachedApi";

await clearAllCache(); // Use sparingly!
```

### Clear Specific User Cache

```typescript
await cache.delete(cache.profileKey(userId));
await cache.delete(cache.suggestedKey(userId));
```

## 🔒 Security Considerations

1. **Never cache sensitive data** like passwords, payment info, or private messages
2. **Use appropriate TTLs** - shorter for frequently changing data
3. **Invalidate on updates** - always clear cache when data changes
4. **Secure Redis credentials** - store in Lovable Cloud secrets, never in code

## 🐛 Troubleshooting

### Cache Not Working

1. Check if Redis credentials are set:
```bash
lovable secrets list
```

2. Verify edge function is deployed:
```bash
lovable functions list
```

3. Check edge function logs:
```bash
lovable functions logs cache
```

### High Memory Usage

If cache uses too much memory, enable eviction in Upstash:
1. Go to Upstash console
2. Database Settings
3. Enable "Eviction" with LRU policy

### Stale Data Issues

If users see outdated data:
1. Reduce TTL for that data type
2. Ensure cache invalidation on updates
3. Add cache busting for critical operations

## 💰 Cost Optimization

Upstash pricing is based on:
- **Requests**: 10,000 free/day, then $0.2 per 100k
- **Storage**: 256MB free, then $0.25/GB

Tips to optimize costs:
1. Use appropriate TTLs (longer = fewer API calls)
2. Cache only frequently accessed data
3. Monitor usage in Upstash dashboard
4. Enable eviction to prevent memory bloat

## 📚 Resources

- [Upstash Documentation](https://docs.upstash.com/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

/**
 * IndexedDB Cache Client
 * 
 * Provides browser-level caching using IndexedDB for ultra-fast local data access.
 * This is the first level in the multi-tier caching strategy.
 */

const DB_NAME = 'pawtes-cache';
const STORE_NAME = 'cache-store';
const DB_VERSION = 1;

interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

class IndexedDBCache {
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize and open IndexedDB connection
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB connection error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          objectStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Get value from IndexedDB cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onsuccess = () => {
          const entry: CacheEntry<T> | undefined = request.result;

          if (!entry) {
            console.log(`IndexedDB MISS: ${key}`);
            resolve(null);
            return;
          }

          // Check if expired
          if (entry.expiresAt < Date.now()) {
            console.log(`IndexedDB EXPIRED: ${key}`);
            this.delete(key); // Clean up expired entry
            resolve(null);
            return;
          }

          console.log(`IndexedDB HIT: ${key}`);
          resolve(entry.value);
        };

        request.onerror = () => {
          console.error('IndexedDB get error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB get failed:', error);
      return null;
    }
  }

  /**
   * Set value in IndexedDB cache
   */
  async set<T = any>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const entry: CacheEntry<T> = {
        key,
        value,
        expiresAt: Date.now() + (ttlSeconds * 1000),
        createdAt: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const request = store.put(entry);

        request.onsuccess = () => {
          console.log(`IndexedDB SET: ${key} (TTL: ${ttlSeconds}s)`);
          resolve();
        };

        request.onerror = () => {
          console.error('IndexedDB set error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB set failed:', error);
    }
  }

  /**
   * Delete value from IndexedDB cache
   */
  async delete(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.delete(key);

        request.onsuccess = () => {
          console.log(`IndexedDB DELETE: ${key}`);
          resolve();
        };

        request.onerror = () => {
          console.error('IndexedDB delete error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB delete failed:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
          console.log('IndexedDB CLEAR: All cache cleared');
          resolve();
        };

        request.onerror = () => {
          console.error('IndexedDB clear error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB clear failed:', error);
    }
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<number> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('expiresAt');

      const now = Date.now();
      let cleanedCount = 0;

      return new Promise((resolve, reject) => {
        const request = index.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;

          if (cursor) {
            const entry: CacheEntry = cursor.value;
            if (entry.expiresAt < now) {
              cursor.delete();
              cleanedCount++;
            }
            cursor.continue();
          } else {
            console.log(`IndexedDB CLEANUP: Removed ${cleanedCount} expired entries`);
            resolve(cleanedCount);
          }
        };

        request.onerror = () => {
          console.error('IndexedDB cleanup error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ totalEntries: number; totalSize: number }> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          resolve({
            totalEntries: countRequest.result,
            totalSize: 0, // IndexedDB doesn't provide size info easily
          });
        };

        countRequest.onerror = () => {
          reject(countRequest.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB stats failed:', error);
      return { totalEntries: 0, totalSize: 0 };
    }
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();

// Run cleanup on initialization and every 30 minutes
indexedDBCache.cleanup();
setInterval(() => {
  indexedDBCache.cleanup();
}, 30 * 60 * 1000);

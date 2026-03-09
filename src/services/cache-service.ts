/**
 * Cache Service - Unified caching for all data types
 * 
 * PATTERN: Check cache → Return if fresh → Fetch if stale → Save to DB
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface CacheStatus {
  dataType: string;
  status: 'fresh' | 'stale' | 'empty';
  isFresh: boolean;
  lastUpdated: string | null;
  recordCount: number;
  ageMinutes?: number;
  ttlMinutes: number;
}

export interface CacheStatusResponse {
  success: boolean;
  data: CacheStatus[];
}

/**
 * Get cache status for all data types
 */
export async function getCacheStatus(): Promise<CacheStatus[]> {
  try {
    const res = await fetch(`${API_BASE}/cache/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: CacheStatusResponse = await res.json();
    return json.data;
  } catch (err) {
    console.error('[Cache Service] Error getting cache status:', err);
    return [];
  }
}

/**
 * Check if specific data type cache is fresh
 */
export async function isCacheFresh(dataType: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cache/check/${dataType}`);
    if (!res.ok) return false;
    const json = await res.json();
    return json.data?.isFresh ?? false;
  } catch (err) {
    console.error(`[Cache Service] Error checking ${dataType}:`, err);
    return false;
  }
}

/**
 * Invalidate cache for specific data types (force refresh)
 */
export async function invalidateCache(dataTypes: string[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cache/invalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataTypes }),
    });
    return res.ok;
  } catch (err) {
    console.error('[Cache Service] Error invalidating cache:', err);
    return false;
  }
}

/**
 * Touch cache (mark as fresh) after manual update
 */
export async function refreshCache(dataType: string, recordCount: number, source?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/cache/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType, recordCount, source }),
    });
    return res.ok;
  } catch (err) {
    console.error('[Cache Service] Error refreshing cache:', err);
    return false;
  }
}

/**
 * Cache-first wrapper: check cache before executing expensive operation
 * 
 * @example
 * const jobs = await cacheFirst('jobs', 
 *   async () => {
 *     // Fetch from API/scrape
 *     const data = await scrapeJobs();
 *     // Save to DB
 *     await saveJobs(data);
 *     return data;
 *   }
 * );
 */
export async function cacheFirst<T>(
  dataType: string,
  fetchFn: () => Promise<T>,
  options?: { forceFresh?: boolean }
): Promise<{ data: T | null; fromCache: boolean; error?: string }> {
  try {
    // Check if cache is fresh (unless forceFresh is true)
    if (!options?.forceFresh) {
      const fresh = await isCacheFresh(dataType);
      if (fresh) {
        console.log(`[Cache Service] ✅ ${dataType} cache is fresh, skipping fetch`);
        return { data: null, fromCache: true };
      }
    }

    // Cache is stale or forceFresh requested — execute fetch function
    console.log(`[Cache Service] 🔄 ${dataType} cache stale, fetching...`);
    const data = await fetchFn();
    console.log(`[Cache Service] ✅ ${dataType} fetched successfully`);
    
    return { data, fromCache: false };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[Cache Service] ❌ ${dataType} error:`, error);
    return { data: null, fromCache: false, error };
  }
}

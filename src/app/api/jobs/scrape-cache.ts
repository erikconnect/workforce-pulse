/**
 * Scrape Cache Manager
 * Tracks last scrape time and prevents duplicate concurrent scrapes
 * Cache duration: 4 hours (14400000ms)
 * Auto-triggers scraping when user visits dashboard or /api/jobs
 */

import { aggregateJobs } from "@/lib/job-aggregator";
import { jobStore } from "./store";

const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
const MIN_SCRAPE_INTERVAL_MS = 60 * 1000; // Prevent concurrent scrapes within 60s

interface ScrapeCacheState {
  lastScrapeAt: number;
  isScraping: boolean;
  scrapeStartedAt: number;
  totalResults: number;
  lastSources?: Record<string, { count: number; errors: string[]; url: string; source: string }>;
  scrapePromise?: Promise<void>;
}

const cache: ScrapeCacheState = {
  lastScrapeAt: 0,
  isScraping: false,
  scrapeStartedAt: 0,
  totalResults: 0,
  lastSources: undefined,
  scrapePromise: undefined,
};

export async function shouldTriggerScrape(): Promise<boolean> {
  const now = Date.now();
  const timeSinceLastScrape = now - cache.lastScrapeAt;
  const isCacheExpired = timeSinceLastScrape > CACHE_DURATION_MS;
  const minIntervalPassed = timeSinceLastScrape > MIN_SCRAPE_INTERVAL_MS;

  return (isCacheExpired || (await jobStore.count()) === 0) && minIntervalPassed;
}

/**
 * Trigger background scrape (non-blocking)
 * Includes: JobAps + USAJOBS + Indeed + LinkedIn (if Bright Data configured)
 * On first run (no cache), waits for scrape to complete
 */
export async function triggerBackgroundScrape(): Promise<void> {
  if (cache.isScraping) {
    console.log("[Scrape Cache] Already scraping, waiting...");
    if (cache.scrapePromise) {
      await cache.scrapePromise;
    }
    return;
  }

  const shouldScrape = await shouldTriggerScrape();
  if (!shouldScrape) {
    console.log("[Scrape Cache] Cache still valid, skipping scrape");
    return;
  }

  const isFirstRun = cache.lastScrapeAt === 0;
  const brightDataConfigured = !!process.env.BRIGHT_DATA_BROWSER_WSS;
  console.log(`[Scrape Cache] Starting ${isFirstRun ? "INITIAL" : "background"} scrape (Bright Data: ${brightDataConfigured ? "enabled" : "not configured"})`);
  
  cache.isScraping = true;
  cache.scrapeStartedAt = Date.now();

  const scrapePromise = (async () => {
    try {
      // Let aggregateJobs() check BRIGHT_DATA_BROWSER_WSS itself;
      // don't force scraping when the env var isn't set.
      const result = await aggregateJobs();

      cache.lastScrapeAt = Date.now();
      cache.totalResults = result.totalStored;
      cache.lastSources = result.sources;
      
      const duration = Date.now() - cache.scrapeStartedAt;
      console.log(`[Scrape Cache] ✅ Scrape complete in ${(duration / 1000).toFixed(1)}s`);
      console.log(`[Scrape Cache] 📊 Total jobs: ${result.totalStored}`);
      console.log(`[Scrape Cache] Sources:`, result.sources);
    } catch (err) {
      console.error(
        "[Scrape Cache] ❌ Background scrape failed:",
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      cache.isScraping = false;
      cache.scrapePromise = undefined;
    }
  })();

  cache.scrapePromise = scrapePromise;

  // If first run, wait for completion; otherwise background
  if (isFirstRun) {
    await scrapePromise;
  }
}

export function getCacheStatus() {
  const now = Date.now();
  const timeSinceLastScrape = now - cache.lastScrapeAt;
  const cacheExpiresIn = Math.max(0, CACHE_DURATION_MS - timeSinceLastScrape);

  return {
    lastScrapeAt: cache.lastScrapeAt,
    isScraping: cache.isScraping,
    totalResults: cache.totalResults,
    cacheExpiresInMs: cacheExpiresIn,
    cacheExpiresInMinutes: Math.ceil(cacheExpiresIn / 60000),
    cacheValidUntil: new Date(cache.lastScrapeAt + CACHE_DURATION_MS).toISOString(),
  };
}

export function getLastSources() {
  return cache.lastSources ?? {
    jobaps: { count: 0, errors: ["No scrape yet"], url: "https://jobapscloud.com/MGM/rss.asp", source: "JobAps (City of Montgomery)" },
    usajobs: { count: 0, errors: ["No scrape yet"], url: "https://data.usajobs.gov/api/search", source: "USAJOBS API (Federal)" },
    indeed: { count: 0, errors: ["No scrape yet"], url: "https://indeed.com (via Bright Data)", source: "Indeed (via Bright Data)" },
    linkedin: { count: 0, errors: ["No scrape yet"], url: "https://linkedin.com (via Bright Data)", source: "LinkedIn (via Bright Data)" },
    glassdoor: { count: 0, errors: ["No scrape yet"], url: "https://glassdoor.com (via Bright Data)", source: "Glassdoor (via Bright Data)" },
  };
}

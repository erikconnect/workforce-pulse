/**
 * POST /api/jobs/scrape
 *   Manually trigger full scrape: Indeed + LinkedIn + Glassdoor + JobAps + USAJOBS
 *   Uses Bright Data Scraping Browser (Playwright over CDP).
 *
 *   Body (optional):
 *     { queries?: { keyword: string; location: string }[] }
 *
 *   Returns: Detailed scraping results including new vs recurring job counts
 *
 * GET /api/jobs/scrape
 *   Returns the current job store state + cache status
 */

import { NextRequest, NextResponse } from "next/server";
import { scrapeIndeedJobs, scrapeLinkedInJobs, scrapeGlassdoorJobs, DEFAULT_SCRAPE_QUERIES } from "@/lib/scraper";
import { normalizeIndeedRecord, normalizeLinkedInRecord, normalizeGlassdoorRecord, deriveInsights } from "@/lib/job-processing";
import type { RawIndeedRecord, RawLinkedInRecord, RawGlassdoorRecord } from "@/lib/job-processing";
import { jobStore } from "../store";
import { getCacheStatus } from "../scrape-cache";

// Allow up to 180s — scraping multiple sources (Indeed + LinkedIn + Glassdoor) takes ~90-150s
export const maxDuration = 180;

// Helper: Timeout wrapper (returns empty result if scraper times out)
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutLabel: string
): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error(`${timeoutLabel} timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  } catch (err) {
    console.warn(`[withTimeout] ⏱️ ${timeoutLabel} failed:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const queries: { keyword: string; location: string }[] =
    body.queries ?? DEFAULT_SCRAPE_QUERIES;

  const startTime = Date.now();
  const results = {
    sources: {
      indeed: { jobs: 0, new: 0, updated: 0, errors: 0 },
      linkedin: { jobs: 0, new: 0, updated: 0, errors: 0 },
      glassdoor: { jobs: 0, new: 0, updated: 0, errors: 0 },
    },
    summary: {
      totalCollected: 0,
      totalNew: 0,
      totalUpdated: 0,
      totalStored: 0,
    },
  };

  try {
    console.log("[Jobs Scrape API] Starting scrape with sources: Indeed + LinkedIn + Glassdoor");

    // Scrape Indeed (45s timeout)
    try {
      console.log("[Jobs Scrape API] Scraping Indeed...");
      const indeedResult = await withTimeout(scrapeIndeedJobs(queries), 45000, "Indeed scraper");
      if (indeedResult === null) {
        results.sources.indeed.errors = 1;
        console.warn("[Jobs Scrape API] ⏱️ Indeed scraper timed out");
      } else {
        const postings = indeedResult.jobs.map(raw => normalizeIndeedRecord(raw as unknown as RawIndeedRecord));
        const stats = postings.length > 0 ? await jobStore.bulkUpsert(postings) : null;
        results.sources.indeed.jobs = indeedResult.jobs.length;
        results.sources.indeed.new = stats?.newJobs ?? 0;
        results.sources.indeed.updated = stats?.updatedJobs ?? 0;
        results.summary.totalCollected += indeedResult.jobs.length;
        results.summary.totalNew += stats?.newJobs ?? 0;
        results.summary.totalUpdated += stats?.updatedJobs ?? 0;
        console.log(`[Jobs Scrape API] ✅ Indeed: ${indeedResult.jobs.length} jobs (${stats?.newJobs ?? 0} new, ${stats?.updatedJobs ?? 0} updated)`);
      }
    } catch (err) {
      console.error("[Jobs Scrape API] ❌ Indeed failed:", err);
      results.sources.indeed.errors = 1;
    }

    // Scrape LinkedIn (45s timeout)
    try {
      console.log("[Jobs Scrape API] Scraping LinkedIn...");
      const linkedinResult = await withTimeout(scrapeLinkedInJobs(queries), 45000, "LinkedIn scraper");
      if (linkedinResult === null) {
        results.sources.linkedin.errors = 1;
        console.warn("[Jobs Scrape API] ⏱️ LinkedIn scraper timed out");
      } else {
        const postings = linkedinResult.jobs.map(raw => normalizeLinkedInRecord(raw as unknown as RawLinkedInRecord));
        const stats = postings.length > 0 ? await jobStore.bulkUpsert(postings) : null;
        results.sources.linkedin.jobs = linkedinResult.jobs.length;
        results.sources.linkedin.new = stats?.newJobs ?? 0;
        results.sources.linkedin.updated = stats?.updatedJobs ?? 0;
        results.summary.totalCollected += linkedinResult.jobs.length;
        results.summary.totalNew += stats?.newJobs ?? 0;
        results.summary.totalUpdated += stats?.updatedJobs ?? 0;
        console.log(`[Jobs Scrape API] ✅ LinkedIn: ${linkedinResult.jobs.length} jobs (${stats?.newJobs ?? 0} new, ${stats?.updatedJobs ?? 0} updated)`);
      }
    } catch (err) {
      console.error("[Jobs Scrape API] ❌ LinkedIn failed:", err);
      results.sources.linkedin.errors = 1;
    }

    // Scrape Glassdoor (45s timeout)
    try {
      console.log("[Jobs Scrape API] Scraping Glassdoor...");
      const glassdoorResult = await withTimeout(scrapeGlassdoorJobs(queries), 45000, "Glassdoor scraper");
      if (glassdoorResult === null) {
        results.sources.glassdoor.errors = 1;
        console.warn("[Jobs Scrape API] ⏱️ Glassdoor scraper timed out");
      } else {
        const postings = glassdoorResult.jobs.map(raw => normalizeGlassdoorRecord(raw as unknown as RawGlassdoorRecord));
        const stats = postings.length > 0 ? await jobStore.bulkUpsert(postings) : null;
        results.sources.glassdoor.jobs = glassdoorResult.jobs.length;
        results.sources.glassdoor.new = stats?.newJobs ?? 0;
        results.sources.glassdoor.updated = stats?.updatedJobs ?? 0;
        results.summary.totalCollected += glassdoorResult.jobs.length;
        results.summary.totalNew += stats?.newJobs ?? 0;
        results.summary.totalUpdated += stats?.updatedJobs ?? 0;
        console.log(`[Jobs Scrape API] ✅ Glassdoor: ${glassdoorResult.jobs.length} jobs (${stats?.newJobs ?? 0} new, ${stats?.updatedJobs ?? 0} updated)`);
      }
    } catch (err) {
      console.error("[Jobs Scrape API] ❌ Glassdoor failed:", err);
      results.sources.glassdoor.errors = 1;
    }

    // Derive insights
    const insights = deriveInsights(await jobStore.getAll());
    jobStore.setInsights(insights);

    results.summary.totalStored = await jobStore.count();

    const duration = Date.now() - startTime;
    console.log(`[Jobs Scrape API] ✅ Complete in ${(duration / 1000).toFixed(1)}s`);
    console.log(`[Jobs Scrape API] 📊 Summary - Collected: ${results.summary.totalCollected}, New: ${results.summary.totalNew}, Updated: ${results.summary.totalUpdated}, Total in DB: ${results.summary.totalStored}`);

    return NextResponse.json({
      ...results,
      durationMs: duration,
      insights,
      cache: getCacheStatus(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Jobs Scrape API] Fatal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    count: await jobStore.count(),
    insights: jobStore.getInsights(),
    cache: getCacheStatus(),
  });
}

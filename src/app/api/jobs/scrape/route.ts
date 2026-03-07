/**
 * POST /api/jobs/scrape
 *   Manually trigger full scrape: Indeed + LinkedIn + Glassdoor + JobAps + USAJOBS
 *   Uses Bright Data Scraping Browser (Playwright over CDP).
 *
 *   Body (optional):
 *     { queries?: { keyword: string; location: string }[] }
 *
 *   Returns: { jobs: number; insights: JobInsights; durationMs: number }
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const queries: { keyword: string; location: string }[] =
    body.queries ?? DEFAULT_SCRAPE_QUERIES;

  const startTime = Date.now();
  const results = {
    indeed: { jobs: 0, errors: 0 },
    linkedin: { jobs: 0, errors: 0 },
    glassdoor: { jobs: 0, errors: 0 },
    totalNew: 0,
    totalStored: 0,
  };

  try {
    console.log("[Jobs Scrape API] Starting scrape with sources: Indeed + LinkedIn + Glassdoor");

    // Scrape Indeed
    try {
      console.log("[Jobs Scrape API] Scraping Indeed...");
      const indeedResult = await scrapeIndeedJobs(queries);
      for (const raw of indeedResult.jobs) {
        const posting = normalizeIndeedRecord(raw as unknown as RawIndeedRecord);
        jobStore.upsert(posting);
      }
      results.indeed.jobs = indeedResult.jobs.length;
      console.log(`[Jobs Scrape API] ✅ Indeed: ${indeedResult.jobs.length} jobs`);
    } catch (err) {
      console.error("[Jobs Scrape API] ❌ Indeed failed:", err);
      results.indeed.errors = 1;
    }

    // Scrape LinkedIn
    try {
      console.log("[Jobs Scrape API] Scraping LinkedIn...");
      const linkedinResult = await scrapeLinkedInJobs(queries);
      for (const raw of linkedinResult.jobs) {
        const posting = normalizeLinkedInRecord(raw as unknown as RawLinkedInRecord);
        jobStore.upsert(posting);
      }
      results.linkedin.jobs = linkedinResult.jobs.length;
      console.log(`[Jobs Scrape API] ✅ LinkedIn: ${linkedinResult.jobs.length} jobs`);
    } catch (err) {
      console.error("[Jobs Scrape API] ❌ LinkedIn failed:", err);
      results.linkedin.errors = 1;
    }

    // Scrape Glassdoor
    try {
      console.log("[Jobs Scrape API] Scraping Glassdoor...");
      const glassdoorResult = await scrapeGlassdoorJobs(queries);
      for (const raw of glassdoorResult.jobs) {
        const posting = normalizeGlassdoorRecord(raw as unknown as RawGlassdoorRecord);
        jobStore.upsert(posting);
      }
      results.glassdoor.jobs = glassdoorResult.jobs.length;
      console.log(`[Jobs Scrape API] ✅ Glassdoor: ${glassdoorResult.jobs.length} jobs`);
    } catch (err) {
      console.error("[Jobs Scrape API] ❌ Glassdoor failed:", err);
      results.glassdoor.errors = 1;
    }

    // Derive insights
    const insights = deriveInsights(jobStore.getAll());
    jobStore.setInsights(insights);

    results.totalNew = results.indeed.jobs + results.linkedin.jobs + results.glassdoor.jobs;
    results.totalStored = jobStore.count();

    const duration = Date.now() - startTime;
    console.log(`[Jobs Scrape API] ✅ Complete in ${(duration / 1000).toFixed(1)}s`);

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
    count: jobStore.count(),
    insights: jobStore.getInsights(),
    cache: getCacheStatus(),
  });
}

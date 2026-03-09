/**
 * GET /api/jobs
 *   Returns cached JobInsights derived from all aggregated postings.
 *   Auto-triggers background scrape if cache expired.
 *   Scraping includes: JobAps + USAJOBS + Indeed + LinkedIn
 *   Cache duration: 4 hours
 *
 * DELETE /api/jobs
 *   Clears the in-process job store (useful for dev/demo resets).
 */

import { NextResponse } from "next/server";
import { jobStore } from "./store";
import { triggerBackgroundScrape, getCacheStatus, getLastSources } from "./scrape-cache";

function triggerScrapeInBackground(): void {
  void triggerBackgroundScrape().catch((err) => {
    console.error(
      "[Jobs API] Background scrape trigger failed:",
      err instanceof Error ? err.message : String(err)
    );
  });
}

export async function GET() {
  // Never block response on scraping. Return current DB-backed data immediately.
  triggerScrapeInBackground();

  const count = await jobStore.count();
  const insights = jobStore.getInsights();
  const cacheStatus = getCacheStatus();
  const sources = getLastSources();

  return NextResponse.json({
    count,
    insights: insights ?? null,
    cache: cacheStatus,
    sources: sources, // Include detailed source information with URLs
    _meta: {
      message: "Jobs automatically scraped from multiple sources",
      sources: {
        jobaps: "City of Montgomery official jobs (RSS)",
        usajobs: "Federal jobs database",
        indeed: "Job board (via Bright Data Scraping Browser)",
        linkedin: "Professional network (via Bright Data Scraping Browser)",
        glassdoor: "Company reviews & jobs (via Bright Data Scraping Browser)"
      },
      nextRefreshAt: new Date(cacheStatus.lastScrapeAt + 4 * 60 * 60 * 1000).toISOString(),
    },
  });
}

export async function DELETE() {
  await jobStore.clear();
  return NextResponse.json({ cleared: true });
}

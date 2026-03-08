/**
 * Client-side service layer for job postings and insights.
 * Calls Next.js API routes (/api/jobs, /api/jobs/scrape).
 *
 * The Scraping Browser approach is synchronous:
 *   POST /api/jobs/scrape → scrapes, processes, stores, returns insights
 *   No polling needed — the request takes ~60-90s to complete.
 */

import type { JobInsights } from "../types";

export interface ScrapeResult {
  jobs: number;
  totalStored: number;
  queriesRun: number;
  queriesFailed: number;
  durationMs: number;
  insights: JobInsights;
}

/**
 * Run automatic job aggregation (JobAps, USAJOBS, optionally Indeed).
 * Fast when includeIndeed=false (~5s); slower with Indeed (~60-90s).
 */
export async function runAggregate(includeIndeed = false): Promise<{
  totalStored: number;
  totalNew: number;
  sources: Record<string, { count: number; errors: string[] }>;
  insights: JobInsights;
}> {
  const res = await fetch("/api/jobs/aggregate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ includeIndeed }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? `Aggregate failed (${res.status})`);
  }
  const data = await res.json();
  return data;
}

/**
 * Run a full Bright Data scrape for Montgomery, AL job listings.
 * Connects to the Scraping Browser, scrapes all configured queries,
 * processes and stores results, then returns derived insights.
 *
 * Takes 60-90 seconds — use in a long-running context or show a loading state.
 */
export async function runScrape(
  queries?: { keyword: string; location: string }[]
): Promise<ScrapeResult> {
  const res = await fetch("/api/jobs/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(queries ? { queries } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? `Scrape failed (${res.status})`);
  }
  return res.json();
}

/** Fetch the latest cached job insights (null insights if no scrape has run). */
export async function fetchJobInsights(): Promise<{
  count: number;
  insights: JobInsights | null;
  sources?: Record<string, { count: number; errors: string[]; url: string; source: string }>;
}> {
  console.log("%c🔄 [Jobs] Fetching job insights from /api/jobs...", "color: #007bff; font-weight: bold;");
  
  const res = await fetch("/api/jobs");
  if (!res.ok) throw new Error("Failed to fetch job insights");
  
  const data = await res.json() as {
    count: number;
    insights: JobInsights | null;
    sources?: Record<string, { count: number; errors: string[]; url: string; source: string }>;
    cache?: { isScraping: boolean; cacheExpiresInMinutes: number };
  };
  
  // Log to console with detailed source information
  console.group("%c📊 Job Sources Report", "color: #28a745; font-weight: bold; font-size: 14px;");
  
  if (data.sources) {
    console.table(
      Object.entries(data.sources).map(([, source]) => ({
        "Source": source.source,
        "URL": source.url,
        "Jobs Found": source.count,
        "Errors": source.errors?.length > 0 ? source.errors.join("; ") : "None",
      }))
    );
    
    // Detailed breakdown
    console.log("%c📈 Total Summary:", "color: #17a2b8; font-weight: bold;");
    console.log(`%cTotal Jobs: ${data.count}`, "color: #28a745; font-size: 12px;");
    
    if (data.cache) {
      console.log(`%cCache Status: ${data.cache.isScraping ? "Scraping..." : "Cached"}`, 
        data.cache.isScraping ? "color: #ffc107;" : "color: #28a745;");
      console.log(`%cCache Expires In: ${data.cache.cacheExpiresInMinutes} minutes`, "color: #6c757d; font-size: 11px;");
    }
    
    // Individual source logs
    Object.entries(data.sources).forEach(([, source]) => {
      const isDisabled = source.errors?.some((e) =>
        e === "Scraping disabled" || e.includes("not configured")
      );
      const color = source.count > 0 ? "#28a745" : isDisabled ? "#6c757d" : "#dc3545";
      const icon = source.count > 0 ? "✅" : isDisabled ? "⚙️" : "❌";
      console.log(
        `%c${icon} ${source.source}: ${source.count} jobs from ${source.url}`,
        `color: ${color};`
      );
      
      if (source.errors?.length > 0 && !isDisabled) {
        console.warn(`   Errors: ${source.errors.join(", ")}`);
      }
    });
  }
  
  console.groupEnd();
  
  return data;
}

/** Clear all cached job data — useful for dev resets and demo resets. */
export async function clearJobStore(): Promise<void> {
  await fetch("/api/jobs", { method: "DELETE" });
}

/**
 * Automatic job aggregation from multiple sources.
 * Fetches JobAps, USAJOBS, and optionally Indeed (Scraping Browser).
 * Populates the job store with normalized JobPosting records.
 */

import { jobStore } from "@/app/api/jobs/store";
import {
  normalizeJobApsRecord,
  normalizeUsaJobsRecord,
  deriveInsights,
} from "@/lib/job-processing";
import type { RawIndeedRecord, RawLinkedInRecord, RawGlassdoorRecord } from "@/lib/job-processing";
import type { JobPosting } from "@/services/types";
import { isCacheFresh } from "@/services/cache-service";

const JOBAPS_RSS_URL =
  process.env.JOBAPS_RSS_URL ?? "https://jobapscloud.com/MGM/rss.asp";
const USAJOBS_API = "https://data.usajobs.gov/api/search";
const USAJOBS_KEY = process.env.USAJOBS_API_KEY ?? "";
const USAJOBS_EMAIL = process.env.USAJOBS_USER_AGENT ?? "WorkforcePulse/1.0";
const API_FETCH_TIMEOUT_MS = 15000; // 15s for external APIs (Vercel serverless limit)

// Extract text from XML tag
function extractTag(xml: string, tag: string): string {
  const cdataRe = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`,
    "i"
  );
  const cdata = xml.match(cdataRe);
  if (cdata) return cdata[1].trim();
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const plain = xml.match(plainRe);
  return plain ? plain[1].trim() : "";
}

function extractLink(itemXml: string): string {
  const standard = extractTag(itemXml, "link");
  if (standard) return standard;
  const match = itemXml.match(/<link\s*\/?>([\s\S]*?)(?:<|$)/);
  return match ? match[1].trim() : "";
}

const DEPT_TO_SECTOR: Record<string, string> = {
  police: "public-safety",
  fire: "public-safety",
  ems: "public-safety",
  corrections: "public-safety",
  health: "healthcare",
  medical: "healthcare",
  inspections: "construction",
  engineering: "construction",
  school: "education",
  education: "education",
  "information technology": "technology",
  finance: "finance",
  parks: "retail",
  fleet: "logistics",
};

function classifyDept(department: string): string | null {
  const lower = department.toLowerCase();
  for (const [kw, sectorId] of Object.entries(DEPT_TO_SECTOR)) {
    if (lower.includes(kw)) return sectorId;
  }
  return null;
}

async function fetchWithTimeout(
  url: string,
  opts: RequestInit & { timeout?: number }
): Promise<Response> {
  const { timeout = API_FETCH_TIMEOUT_MS, ...rest } = opts;
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...rest,
      signal: ctrl.signal,
      cache: "no-store",
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function logSourceSample(source: string, postings: JobPosting[]): void {
  if (postings.length === 0) {
    console.log(`[${source}] ℹ️ No normalized postings to upsert`);
    return;
  }

  const sample = postings[0];
  console.log(`[${source}] 🧪 Sample normalized posting:`, {
    id: sample.id,
    title: sample.title,
    org: sample.org,
    location: sample.location,
    source: sample.source,
    postedDate: sample.postedDate,
    url: sample.url,
  });
}

/** Fetch and upsert JobAps (City of Montgomery) jobs */
async function fetchJobAps(): Promise<{ count: number; errors: string[]; url: string; source: string }> {
  const errors: string[] = [];
  console.log(`[JobAps] 🔸 Fetching from: ${JOBAPS_RSS_URL}`);
  try {
    const res = await fetchWithTimeout(JOBAPS_RSS_URL, {
      timeout: API_FETCH_TIMEOUT_MS,
      headers: {
        "User-Agent": "WorkforcePulse/1.0",
        Accept: "application/rss+xml, application/xml",
      },
    });
    if (!res.ok) {
      const err = `JobAps fetch failed (${res.status})`;
      console.error(`[JobAps] ❌ ${err}`);
      errors.push(err);
      return { count: 0, errors, url: JOBAPS_RSS_URL, source: "JobAps (City of Montgomery)" };
    }
    const xml = await res.text();
    const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];
    const postings = [];
    for (const block of itemBlocks) {
      const title = extractTag(block, "title");
      if (!title || title.toLowerCase().includes("application on-file"))
        continue;
      const department = extractTag(block, "department");
      const posting = normalizeJobApsRecord({
        title,
        link: extractLink(block),
        pubDate: extractTag(block, "pubDate"),
        salary: extractTag(block, "salary"),
        department,
        jobType: extractTag(block, "jobType"),
        sectorId: classifyDept(department),
      });
      postings.push(posting);
    }
    await jobStore.bulkUpsert(postings);
    console.log(`[JobAps] ✅ Found ${postings.length} jobs`);
    return { count: postings.length, errors, url: JOBAPS_RSS_URL, source: "JobAps (City of Montgomery)" };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error(`[JobAps] ❌ Error: ${err}`);
    errors.push(err);
    return { count: 0, errors, url: JOBAPS_RSS_URL, source: "JobAps (City of Montgomery)" };
  }
}

/** Fetch and upsert USAJOBS (Federal) jobs for Montgomery, AL area */
async function fetchUsaJobs(): Promise<{ count: number; errors: string[]; url: string; source: string }> {
  const errors: string[] = [];
  console.log(`[USAJOBS] 🔹 Fetching from: ${USAJOBS_API}`);
  if (!USAJOBS_KEY) {
    console.warn(`[USAJOBS] ⚠️ No API key configured`);
    return { count: 0, errors: ["USAJOBS_API_KEY not configured"], url: USAJOBS_API, source: "USAJOBS API" };
  }
  try {
    const params = new URLSearchParams({
      Keyword: "Montgomery",
      LocationName: "Montgomery, Alabama",
      ResultsPerPage: "100",
      Page: "1",
    });
    const res = await fetchWithTimeout(`${USAJOBS_API}?${params}`, {
      timeout: API_FETCH_TIMEOUT_MS,
      headers: {
        "User-Agent": USAJOBS_EMAIL,
        "Authorization-Key": USAJOBS_KEY,
      },
    });
    if (!res.ok) {
      const err = `USAJOBS fetch failed (${res.status})`;
      console.error(`[USAJOBS] ❌ ${err}`);
      errors.push(err);
      return { count: 0, errors, url: USAJOBS_API, source: "USAJOBS API" };
    }
    const json = await res.json();
    const items =
      json?.SearchResult?.SearchResultItems ?? json?.SearchResultItems ?? [];
    const postings = items.map((item: any) => normalizeUsaJobsRecord(item));
    await jobStore.bulkUpsert(postings);
    console.log(`[USAJOBS] ✅ Found ${postings.length} jobs`);
    return { count: postings.length, errors, url: USAJOBS_API, source: "USAJOBS API (Federal)" };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error(`[USAJOBS] ❌ Error: ${err}`);
    errors.push(err);
    return { count: 0, errors, url: USAJOBS_API, source: "USAJOBS API (Federal)" };
  }
}

/** Run Indeed scrape via Scraping Browser (optional, can timeout) */
async function fetchIndeed(): Promise<{ count: number; errors: string[]; url: string; source: string }> {
  const errors: string[] = [];
  const url = "https://indeed.com (via Bright Data Scraping Browser)";
  console.log(`[Indeed] 🔸 Scraping from Bright Data Scraping Browser`);
  try {
    const { scrapeIndeedJobs, DEFAULT_SCRAPE_QUERIES } = await import(
      "@/lib/scraper"
    );
    const { normalizeIndeedRecord: norm } = await import("@/lib/job-processing");
    const result = await scrapeIndeedJobs(DEFAULT_SCRAPE_QUERIES);
    const postings = result.jobs.map(job => norm(job as unknown as RawIndeedRecord));
    console.log(`[Indeed] ℹ️ Raw scraped jobs: ${result.jobs.length}`);
    logSourceSample("Indeed", postings);
    if (postings.length > 0) {
      const stats = await jobStore.bulkUpsert(postings);
      console.log(`[Indeed] ✅ Upserted ${postings.length} jobs (new=${stats?.newJobs ?? 0}, updated=${stats?.updatedJobs ?? 0})`);
    }
    return { count: result.jobs.length, errors, url, source: "Indeed (via Bright Data)" };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error(`[Indeed] ❌ Error: ${err}`);
    errors.push(err);
    return { count: 0, errors, url, source: "Indeed (via Bright Data)" };
  }
}

/** Run LinkedIn scrape via Scraping Browser (optional, can timeout) */
async function fetchLinkedIn(): Promise<{ count: number; errors: string[]; url: string; source: string }> {
  const errors: string[] = [];
  const url = "https://linkedin.com (via Bright Data Scraping Browser)";
  console.log(`[LinkedIn] 🔹 Scraping from Bright Data Scraping Browser`);
  try {
    const { scrapeLinkedInJobs, DEFAULT_SCRAPE_QUERIES } = await import(
      "@/lib/scraper"
    );
    const { normalizeLinkedInRecord: norm } = await import("@/lib/job-processing");
    const result = await scrapeLinkedInJobs(DEFAULT_SCRAPE_QUERIES);
    const postings = result.jobs.map(job => norm(job as unknown as RawLinkedInRecord));
    console.log(`[LinkedIn] ℹ️ Raw scraped jobs: ${result.jobs.length}`);
    logSourceSample("LinkedIn", postings);
    if (postings.length > 0) {
      const stats = await jobStore.bulkUpsert(postings);
      console.log(`[LinkedIn] ✅ Upserted ${postings.length} jobs (new=${stats?.newJobs ?? 0}, updated=${stats?.updatedJobs ?? 0})`);
    }
    return { count: result.jobs.length, errors, url, source: "LinkedIn (via Bright Data)" };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error(`[LinkedIn] ❌ Error: ${err}`);
    errors.push(err);
    return { count: 0, errors, url, source: "LinkedIn (via Bright Data)" };
  }
}

/** Run Glassdoor scrape via Scraping Browser (optional, can timeout) */
async function fetchGlassdoor(): Promise<{ count: number; errors: string[]; url: string; source: string }> {
  const errors: string[] = [];
  const url = "https://glassdoor.com (via Bright Data Scraping Browser)";
  console.log(`[Glassdoor] 🔸 Scraping from Bright Data Scraping Browser`);
  try {
    const { scrapeGlassdoorJobs, DEFAULT_SCRAPE_QUERIES } = await import(
      "@/lib/scraper"
    );
    const { normalizeGlassdoorRecord: norm } = await import("@/lib/job-processing");
    const result = await scrapeGlassdoorJobs(DEFAULT_SCRAPE_QUERIES);
    const postings = result.jobs.map(job => norm(job as unknown as RawGlassdoorRecord));
    console.log(`[Glassdoor] ℹ️ Raw scraped jobs: ${result.jobs.length}`);
    logSourceSample("Glassdoor", postings);
    if (postings.length > 0) {
      const stats = await jobStore.bulkUpsert(postings);
      console.log(`[Glassdoor] ✅ Upserted ${postings.length} jobs (new=${stats?.newJobs ?? 0}, updated=${stats?.updatedJobs ?? 0})`);
    }
    return { count: result.jobs.length, errors, url, source: "Glassdoor (via Bright Data)" };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error(`[Glassdoor] ❌ Error: ${err}`);
    errors.push(err);
    return { count: 0, errors, url, source: "Glassdoor (via Bright Data)" };
  }
}

export interface AggregateResult {
  sources: Record<string, { count: number; errors: string[]; url: string; source: string }>;
  totalNew: number;
  totalStored: number;
  insights: ReturnType<typeof deriveInsights>;
}

/**
 * Aggregate jobs from all configured sources.
 * Runs JobAps + USAJOBS always; runs Indeed/LinkedIn/Glassdoor if BRIGHT_DATA_BROWSER_WSS is set.
 * 
 * CACHE-FIRST: If jobs cache is fresh (< 24h old), returns stored data without scraping.
 */
export async function aggregateJobs(options?: {
  includeIndeed?: boolean;
  includeLinkedIn?: boolean;
  includeGlassdoor?: boolean;
  forceFresh?: boolean;
}): Promise<AggregateResult> {
  // ✅ CACHE-FIRST: Check if we have fresh data already
  if (!options?.forceFresh) {
    const cacheFresh = await isCacheFresh('jobs');
    if (cacheFresh) {
      console.log('[Aggregator] ⚡ Jobs cache is fresh, returning stored data (skip scraping)');
      const allPostings = await jobStore.getAll();
      const insights = deriveInsights(allPostings);
      jobStore.setInsights(insights);
      
      return {
        sources: {
          jobaps: { count: 0, errors: [], url: JOBAPS_RSS_URL, source: "JobAps (cached)" },
          usajobs: { count: 0, errors: [], url: USAJOBS_API, source: "USAJOBS (cached)" },
          indeed: { count: 0, errors: [], url: "cached", source: "Indeed (cached)" },
          linkedin: { count: 0, errors: [], url: "cached", source: "LinkedIn (cached)" },
          glassdoor: { count: 0, errors: [], url: "cached", source: "Glassdoor (cached)" },
        },
        totalNew: 0,
        totalStored: await jobStore.count(),
        insights,
      };
    }
  }

  // Cache is stale or forceFresh requested — proceed with scraping
  console.log('[Aggregator] 🔄 Jobs cache stale, fetching from all sources');
  
  const includeScraping = !!process.env.BRIGHT_DATA_BROWSER_WSS;
  const includeIndeed = options?.includeIndeed ?? includeScraping;
  const includeLinkedIn = options?.includeLinkedIn ?? includeScraping;
  const includeGlassdoor = options?.includeGlassdoor ?? includeScraping;

  const [jobApsResult, usaJobsResult, indeedResult, linkedInResult, glassdoorResult] = await Promise.all([
    fetchJobAps(),
    fetchUsaJobs(),
    includeIndeed ? fetchIndeed() : Promise.resolve({ count: 0, errors: ["Scraping disabled"], url: "https://indeed.com", source: "Indeed (via Bright Data)" }),
    includeLinkedIn ? fetchLinkedIn() : Promise.resolve({ count: 0, errors: ["Scraping disabled"], url: "https://linkedin.com", source: "LinkedIn (via Bright Data)" }),
    includeGlassdoor ? fetchGlassdoor() : Promise.resolve({ count: 0, errors: ["Scraping disabled"], url: "https://glassdoor.com", source: "Glassdoor (via Bright Data)" }),
  ]);

  const sources = {
    jobaps: jobApsResult,
    usajobs: usaJobsResult,
    indeed: indeedResult,
    linkedin: linkedInResult,
    glassdoor: glassdoorResult,
  };

  const allPostings = await jobStore.getAll();
  const insights = deriveInsights(allPostings);
  jobStore.setInsights(insights);

  return {
    sources,
    totalNew:
      jobApsResult.count + usaJobsResult.count + indeedResult.count + linkedInResult.count + glassdoorResult.count,
    totalStored: await jobStore.count(),
    insights,
  };
}

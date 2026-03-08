/**
 * GET /api/jobs/postings
 *   Returns all individual job postings from the in-process job store.
 *   Intended for admin use — gives access to all sources (JobAps, USAJOBS, scraped).
 *   Auto-triggers background scrape if cache expired (same as /api/jobs).
 */

import { NextResponse } from "next/server";
import { jobStore } from "../store";
import { triggerBackgroundScrape } from "../scrape-cache";

export async function GET() {
  await triggerBackgroundScrape();
  const postings = await jobStore.getAll();
  return NextResponse.json({ postings, count: postings.length });
}

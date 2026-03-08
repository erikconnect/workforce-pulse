/**
 * GET /api/city-jobs
 *   Fetches real City of Montgomery job openings from the JobAps RSS feed.
 *   Feed URL: https://jobapscloud.com/MGM/rss.asp
 *
 *   No auth required. Revalidates hourly.
 *   Returns structured job listings with department-to-sector mapping.
 */

import { NextResponse } from "next/server";

// Revalidate cache every hour
export const revalidate = 3600;

export interface CityJob {
  title: string;
  link: string;
  pubDate: string;
  salary: string;
  department: string;
  jobType: string;
  filingDeadline: string;
  employmentType: string;
  recruitCode: string;
  sectorId: string | null;
  description: string;
  location: string;
}

// Map JobAps department names → our sector IDs
const DEPT_TO_SECTOR: Record<string, string> = {
  police:             "public-safety",
  fire:               "public-safety",
  ems:                "public-safety",
  "emergency management": "public-safety",
  "public safety":    "public-safety",
  corrections:        "public-safety",
  "911":              "public-safety",

  health:             "healthcare",
  medical:            "healthcare",
  "mental health":    "healthcare",

  inspections:        "construction",
  engineering:        "construction",
  planning:           "construction",
  "building maintenance": "construction",
  "traffic engineering":  "construction",

  school:             "education",
  education:          "education",
  library:            "education",

  "information technology": "technology",
  "it ":              "technology",

  finance:            "finance",
  budget:             "finance",
  revenue:            "finance",
  "city clerk":       "finance",

  "parks":            "retail",
  "recreation":       "retail",
  zoo:                "retail",

  logistics:          "logistics",
  fleet:              "logistics",
  landfill:           "logistics",
  "community development": "logistics",
};

function classifyDept(department: string): string | null {
  const lower = department.toLowerCase();
  for (const [keyword, sectorId] of Object.entries(DEPT_TO_SECTOR)) {
    if (lower.includes(keyword)) return sectorId;
  }
  return null;
}

// Extract text from an XML tag — handles plain text and CDATA
function extractTag(xml: string, tag: string): string {
  // CDATA: <tag><![CDATA[value]]></tag>
  const cdataRe = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`,
    "i"
  );
  const cdata = xml.match(cdataRe);
  if (cdata) return cdata[1].trim();

  // Plain text: <tag>value</tag>
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const plain = xml.match(plainRe);
  return plain ? plain[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim() : "";
}

// RSS <link> is sometimes a self-closing tag followed by the URL as a text node
function extractLink(itemXml: string): string {
  // Standard CDATA or plain form
  const standard = extractTag(itemXml, "link");
  if (standard) return standard;

  // RSS 2.0 weird form: link text between </description> and next tag
  const match = itemXml.match(/<link\s*\/?>([\s\S]*?)(?:<|$)/);
  return match ? match[1].trim() : "";
}

function parseRecruitCode(link: string): string {
  // URL pattern: /BulPreview.asp?R1=26&R2=CI3010&R3=01
  const r2 = link.match(/R2=([^&\s]+)/);
  const r1 = link.match(/R1=([^&\s]+)/);
  if (r1 && r2) return `FY${r1[1]}-${r2[1]}`;
  if (r2) return r2[1];
  return "";
}

export interface CityJobsResponse {
  count: number;
  lastFetched: string;
  bySector: Record<string, number>;
  jobs: CityJob[];
}

const JOBAPS_RSS =
  process.env.JOBAPS_RSS_URL ?? "https://jobapscloud.com/MGM/rss.asp";
const FETCH_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      next: init?.next ?? { revalidate: 3600 },
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function GET() {
  try {
    const res = await fetchWithTimeout(JOBAPS_RSS, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WorkforcePulse/1.0; +https://workforcepulse.gov)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `JobAps RSS fetch failed (${res.status})` },
        { status: 502 }
      );
    }

    const xml = await res.text();

    // Extract all <item> blocks
    const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];

    const jobs: CityJob[] = itemBlocks
      .map((block): CityJob => {
        const link = extractLink(block);
        const department = extractTag(block, "department");
        const rawDesc = extractTag(block, "description");
        // Strip any leftover HTML tags from the RSS description
        const description = rawDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        return {
          title:          extractTag(block, "title"),
          link,
          pubDate:        extractTag(block, "pubDate"),
          salary:         extractTag(block, "salary"),
          department,
          jobType:        extractTag(block, "jobType"),
          filingDeadline: extractTag(block, "filingDeadline"),
          employmentType: extractTag(block, "employmentType"),
          recruitCode:    parseRecruitCode(link),
          sectorId:       classifyDept(department),
          description,
          location:       "Montgomery, AL",
        };
      })
      // Filter out the "Application On-File" template placeholder
      .filter((j) => j.title && !j.title.toLowerCase().includes("application on-file"));

    // Count jobs per sector
    const bySector: Record<string, number> = {};
    for (const job of jobs) {
      const key = job.sectorId ?? "other";
      bySector[key] = (bySector[key] ?? 0) + 1;
    }

    const response: CityJobsResponse = {
      count: jobs.length,
      lastFetched: new Date().toISOString(),
      bySector,
      jobs,
    };

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

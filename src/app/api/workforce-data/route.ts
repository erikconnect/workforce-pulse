/**
 * GET /api/workforce-data
 *   Aggregates real data from all configured Montgomery open data sources:
 *   - JobAps RSS  (city job openings by dept/sector)
 *   - ArcGIS 911 Calls (public safety demand volume)
 *   - ArcGIS Construction Permits (development activity)
 *   - ArcGIS Population Trends (commuter/population counts)
 *
 *   Always returns real data — no stub flag. Use this to supplement or
 *   overlay the stub-based sector data on the dashboard.
 *
 *   Revalidates every hour.
 */

import { NextResponse } from "next/server";

export const revalidate = 3600;

const FETCH_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      next: init?.next ?? { revalidate: 3600 },
    });
  } finally {
    clearTimeout(id);
  }
}

// ArcGIS FeatureServer count query
async function arcgisCount(url: string): Promise<number> {
  try {
    const res = await fetchWithTimeout(
      `${url}/query?where=1%3D1&returnCountOnly=true&f=json`
    );
    if (!res.ok) return 0;
    const json = await res.json();
    return json.count ?? 0;
  } catch {
    return 0;
  }
}

// Strip XML tags for text extraction
function extractTagText(xml: string, tag: string): string {
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

const DEPT_TO_SECTOR: Record<string, string> = {
  police: "public-safety",  fire: "public-safety",  ems: "public-safety",
  "emergency management": "public-safety", corrections: "public-safety",
  health: "healthcare",     medical: "healthcare",
  inspections: "construction", engineering: "construction", planning: "construction",
  "building maintenance": "construction", "traffic engineering": "construction",
  school: "education",      library: "education",
  "information technology": "technology",
  finance: "finance",       budget: "finance",      revenue: "finance",
  parks: "retail",          recreation: "retail",   zoo: "retail",
  fleet: "logistics",       landfill: "logistics",  "community development": "logistics",
};

function classifyDept(dept: string): string {
  const lower = dept.toLowerCase();
  for (const [kw, sec] of Object.entries(DEPT_TO_SECTOR)) {
    if (lower.includes(kw)) return sec;
  }
  return "other";
}

export interface SectorStats {
  sectorId: string;
  cityOpenJobs: number;       // from JobAps RSS
  demandSignal: number;       // from ArcGIS (calls/permits/etc.) where applicable
  populationBase?: number;    // from ArcGIS population trends
}

export interface WorkforceDataResponse {
  lastUpdated: string;
  cityJobsTotal: number;
  arcgis911CallCount: number;
  arcgisPermitCount: number;
  arcgisPopulationCount: number;
  sectorStats: SectorStats[];
  topDepartments: { department: string; openJobs: number; sectorId: string }[];
}

export async function GET() {
  const ARCGIS_911    = process.env.NEXT_PUBLIC_ARCGIS_911_URL ?? "";
  const ARCGIS_PERMITS = process.env.NEXT_PUBLIC_ARCGIS_PERMITS_URL ?? "";
  const ARCGIS_POP    = process.env.NEXT_PUBLIC_ARCGIS_POPULATION_URL ?? "";
  const JOBAPS_RSS    = process.env.JOBAPS_RSS_URL ?? "https://jobapscloud.com/MGM/rss.asp";

  // Fetch all sources in parallel
  const [callCount, permitCount, popCount, rssRes] = await Promise.all([
    ARCGIS_911     ? arcgisCount(ARCGIS_911)     : Promise.resolve(0),
    ARCGIS_PERMITS ? arcgisCount(ARCGIS_PERMITS) : Promise.resolve(0),
    ARCGIS_POP     ? arcgisCount(ARCGIS_POP)     : Promise.resolve(0),
    fetchWithTimeout(JOBAPS_RSS, {
      headers: { "User-Agent": "WorkforcePulse/1.0" },
    }).catch(() => null),
  ]);

  // Parse JobAps RSS
  let cityJobsTotal = 0;
  const deptMap = new Map<string, number>();

  if (rssRes?.ok) {
    const xml = await rssRes.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];
    for (const block of items) {
      const title = extractTagText(block, "title");
      if (title.toLowerCase().includes("application on-file")) continue;
      const dept = extractTagText(block, "department");
      if (!dept) continue;
      deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1);
      cityJobsTotal++;
    }
  }

  // Aggregate jobs per sector
  const sectorJobMap = new Map<string, number>();
  const topDepartments: WorkforceDataResponse["topDepartments"] = [];

  for (const [dept, count] of Array.from(deptMap.entries())) {
    const sectorId = classifyDept(dept);
    sectorJobMap.set(sectorId, (sectorJobMap.get(sectorId) ?? 0) + count);
    topDepartments.push({ department: dept, openJobs: count, sectorId });
  }

  topDepartments.sort((a, b) => b.openJobs - a.openJobs);

  // Build per-sector stats
  const allSectors = [
    "public-safety", "healthcare", "construction", "education",
    "technology", "finance", "logistics", "retail",
  ];

  const sectorStats: SectorStats[] = allSectors.map((sectorId) => ({
    sectorId,
    cityOpenJobs: sectorJobMap.get(sectorId) ?? 0,
    demandSignal:
      sectorId === "public-safety"  ? callCount :
      sectorId === "construction"   ? permitCount :
      0,
    populationBase: sectorId === "public-safety" ? popCount : undefined,
  }));

  const response: WorkforceDataResponse = {
    lastUpdated: new Date().toISOString(),
    cityJobsTotal,
    arcgis911CallCount: callCount,
    arcgisPermitCount: permitCount,
    arcgisPopulationCount: popCount,
    sectorStats,
    topDepartments,
  };

  return NextResponse.json(response);
}

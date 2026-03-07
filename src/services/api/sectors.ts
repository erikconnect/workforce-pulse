import type { Sector, SectorDetail, PulseStatus } from "../types";
import { stubSectors } from "../stubs/sectors.stub";
import { stubSectorDetails } from "../stubs/sector-detail.stub";
import { stubRoles } from "../stubs/roles.stub";
import { stubSkills } from "../stubs/skills.stub";
import { stubMissions } from "../stubs/missions.stub";
import { stubPlaybooks } from "../stubs/playbooks.stub";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const ARCGIS_911_URL = process.env.NEXT_PUBLIC_ARCGIS_911_URL ?? "";
const ARCGIS_PERMITS_URL = process.env.NEXT_PUBLIC_ARCGIS_PERMITS_URL ?? "";

/**
 * Helper: Enrich stub sectors with real job posting data
 */
async function enrichSectorsWithJobData(baseSectors: Sector[]): Promise<Sector[]> {
  try {
    // Fetch job insights from /api/jobs
    const jobRes = await fetch("http://localhost:3000/api/jobs", {
      cache: "no-store",
    }).catch(() => null);

    if (!jobRes || !jobRes.ok) {
      // Jobs API unavailable — return stub sectors as-is
      return baseSectors;
    }

    type SectorBreakdown = { sectorId: string; count: number; percentChange: number };
    const jobData = (await jobRes.json()) as { insights?: { sectorBreakdown?: SectorBreakdown[] } };
    const sectorBreakdown = jobData.insights?.sectorBreakdown ?? [];

    // Update sectors with job counts
    return baseSectors.map((sector) => {
      const jobsInSector = sectorBreakdown.find((sb: SectorBreakdown) => sb.sectorId === sector.id);
      const openJobCount = jobsInSector?.count ?? 0;

      // Calculate pulse score based on open jobs
      // More jobs = higher pressure, so higher score
      const score = Math.min(100, Math.round((openJobCount / 5) * 100));
      const status: PulseStatus = score >= 75 ? "critical" : score >= 45 ? "watch" : "stable";

      return {
        ...sector,
        openRolesCount: openJobCount,
        pulseScore: score,
        status,
      };
    });
  } catch {
    // Silently fall back to stub sectors if enrichment fails
    return baseSectors;
  }
}

function buildFallbackHiringTrend(base: Sector) {
  const monthLabels = ["Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026"];
  const demandSeries = base.sparklineData?.length ? base.sparklineData.slice(-7) : [40, 42, 45, 44, 46, 48, 50];
  const maxDemand = Math.max(...demandSeries, 1);

  return demandSeries.map((value, index) => {
    const hires = Math.max(8, Math.round((value / maxDemand) * (base.openRolesCount * 0.22)));
    const attritionPressure = 100 - base.pulseScore;
    const attrition = Math.max(6, Math.round(hires * (0.72 + attritionPressure / 180)));

    return {
      month: monthLabels[index] ?? `Month ${index + 1}`,
      hires,
      attrition,
    };
  });
}

function buildFallbackSectorDetail(id: string): SectorDetail | undefined {
  if (stubSectorDetails[id]) return stubSectorDetails[id];

  const base = stubSectors.find((sector) => sector.id === id);
  if (!base) return undefined;

  const criticalRoles = stubRoles
    .filter((role) => role.sectorId === id)
    .sort((a, b) => {
      const urgencyWeight = { critical: 0, watch: 1, stable: 2 };
      return (urgencyWeight[a.urgency] - urgencyWeight[b.urgency]) || (b.openCount - a.openCount);
    })
    .slice(0, 4);

  const roleIds = new Set(criticalRoles.map((role) => role.id));
  const skills = stubSkills
    .filter((skill) => skill.relatedRoles.some((roleId) => roleIds.has(roleId)))
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 6);

  return {
    ...base,
    hiringTrend: buildFallbackHiringTrend(base),
    criticalRoles,
    skills,
    missions: stubMissions.filter((mission) => mission.sectorId === id),
    playbooks: stubPlaybooks.filter((playbook) => playbook.sectorId === id),
  };
}

export async function fetchSectors(): Promise<Sector[]> {
  if (USE_STUBS) {
    // Try to enrich stubs with real job data
    const enriched = await enrichSectorsWithJobData(stubSectors);
    return enriched;
  }

  // If a REST API is configured, use it
  if (API) {
    const res = await fetch(`${API}/sectors`);
    if (!res.ok) throw new Error("Failed to fetch sectors");
    return res.json();
  }

  // Otherwise augment stub data with live ArcGIS counts + job data
  try {
    const [callsRes, permitsRes] = await Promise.all([
      ARCGIS_911_URL
        ? fetch(`${ARCGIS_911_URL}/query?where=1%3D1&returnCountOnly=true&f=json`, { next: { revalidate: 3600 } })
        : Promise.resolve(null),
      ARCGIS_PERMITS_URL
        ? fetch(`${ARCGIS_PERMITS_URL}/query?where=1%3D1&returnCountOnly=true&f=json`, { next: { revalidate: 3600 } })
        : Promise.resolve(null),
    ]);

    const callCount: number = callsRes ? (await callsRes.json()).count ?? 0 : 0;
    const permitCount: number = permitsRes ? (await permitsRes.json()).count ?? 0 : 0;

    const arcgisEnriched = stubSectors.map((sector) => {
      if (sector.id === "public-safety" && callCount > 0) {
        const score = Math.min(100, Math.round(callCount / 50));
        const status: PulseStatus = score >= 75 ? "critical" : score >= 45 ? "watch" : "stable";
        return { ...sector, pulseScore: score, status, openRolesCount: Math.max(1, Math.round(callCount * 0.005)) };
      }
      if (sector.id === "construction" && permitCount > 0) {
        const score = Math.min(100, Math.round(permitCount / 20));
        const status: PulseStatus = score >= 75 ? "critical" : score >= 45 ? "watch" : "stable";
        return { ...sector, pulseScore: score, status, openRolesCount: Math.max(1, Math.round(permitCount * 0.02)) };
      }
      return sector;
    });

    // Also try to enrich with job data for other sectors
    const jobEnriched = await enrichSectorsWithJobData(arcgisEnriched);
    return jobEnriched;
  } catch {
    // ArcGIS unreachable — try job data enrichment only
    const jobEnriched = await enrichSectorsWithJobData(stubSectors);
    return jobEnriched;
  }
}

export async function fetchSectorById(id: string): Promise<SectorDetail | undefined> {
  if (USE_STUBS) {
    return buildFallbackSectorDetail(id);
  }

  if (API) {
    const res = await fetch(`${API}/sectors/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch sector ${id}`);
    return res.json();
  }

  return buildFallbackSectorDetail(id);
}

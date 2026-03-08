import type { Mission, Playbook, Role, Sector, SectorDetail, Skill } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiEnvelope<T> = { success?: boolean; data?: T };

type JobInsights = {
  topRoles?: Array<{ title: string; count: number; sectorId: string | null }>;
};

type PlaybookListData = {
  playbooks?: Playbook[];
};

function assertApiConfigured() {
  if (!API) {
    throw new Error("NEXT_PUBLIC_API_URL not configured");
  }
}

function buildFallbackHiringTrend(base: Sector): SectorDetail["hiringTrend"] {
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

function inferUrgency(openCount: number): "critical" | "watch" | "stable" {
  if (openCount >= 20) return "critical";
  if (openCount >= 8) return "watch";
  return "stable";
}

function mapTopRolesToCriticalRoles(topRoles: Array<{ title: string; count: number; sectorId: string | null }>, sectorId: string): Role[] {
  return topRoles
    .filter((role) => role.sectorId === sectorId)
    .slice(0, 6)
    .map((role, index) => ({
      id: `${sectorId}-role-${index + 1}`,
      title: role.title,
      sectorId,
      openCount: role.count,
      urgency: inferUrgency(role.count),
      requiredSkills: [],
      avgTimeToFill: 30,
    }));
}

export async function fetchSectors(): Promise<Sector[]> {
  assertApiConfigured();

  const res = await fetch(`${API}/sectors`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch sectors: ${res.status}`);

  const payload = (await res.json()) as ApiEnvelope<Sector[]> | Sector[];
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
}

export async function fetchSectorById(id: string): Promise<SectorDetail | undefined> {
  assertApiConfigured();

  const [sectorRes, skillsRes, missionsRes, playbooksRes, insightsRes] = await Promise.all([
    fetch(`${API}/sectors/${id}`, { cache: "no-store" }),
    fetch(`${API}/skills`, { cache: "no-store" }),
    fetch(`${API}/missions?sectorId=${encodeURIComponent(id)}`, { cache: "no-store" }),
    fetch(`${API}/playbooks?sectorId=${encodeURIComponent(id)}`, { cache: "no-store" }),
    fetch(`${API}/jobs/insights`, { cache: "no-store" }),
  ]);

  if (sectorRes.status === 404) return undefined;
  if (!sectorRes.ok) throw new Error(`Failed to fetch sector ${id}: ${sectorRes.status}`);

  const sectorPayload = (await sectorRes.json()) as ApiEnvelope<Sector> | Sector;
  const sector = "data" in (sectorPayload as ApiEnvelope<Sector>) ? (sectorPayload as ApiEnvelope<Sector>).data : (sectorPayload as Sector);
  if (!sector) return undefined;

  const skillsPayload = skillsRes.ok ? ((await skillsRes.json()) as ApiEnvelope<Skill[]> | Skill[]) : [];
  const allSkills = Array.isArray(skillsPayload)
    ? skillsPayload
    : (skillsPayload as ApiEnvelope<Skill[]>).data ?? [];

  const missionsPayload = missionsRes.ok ? ((await missionsRes.json()) as ApiEnvelope<Mission[]> | Mission[]) : [];
  const missions = Array.isArray(missionsPayload)
    ? missionsPayload
    : (missionsPayload as ApiEnvelope<Mission[]>).data ?? [];

  const playbooksPayload = playbooksRes.ok
    ? ((await playbooksRes.json()) as ApiEnvelope<PlaybookListData | Playbook[]> | PlaybookListData | Playbook[])
    : [];

  let playbooks: Playbook[] = [];
  if (Array.isArray(playbooksPayload)) {
    playbooks = playbooksPayload;
  } else if ((playbooksPayload as ApiEnvelope<PlaybookListData>).data?.playbooks) {
    playbooks = (playbooksPayload as ApiEnvelope<PlaybookListData>).data?.playbooks ?? [];
  } else if ((playbooksPayload as PlaybookListData).playbooks) {
    playbooks = (playbooksPayload as PlaybookListData).playbooks ?? [];
  }

  const insightsPayload = insightsRes.ok ? ((await insightsRes.json()) as ApiEnvelope<JobInsights> | JobInsights) : {};
  const insights = "data" in (insightsPayload as ApiEnvelope<JobInsights>)
    ? (insightsPayload as ApiEnvelope<JobInsights>).data
    : (insightsPayload as JobInsights);

  const criticalRoles = mapTopRolesToCriticalRoles(insights?.topRoles ?? [], id);
  const skills = allSkills
    .slice()
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 8);

  return {
    ...sector,
    hiringTrend: buildFallbackHiringTrend(sector),
    criticalRoles,
    skills,
    missions,
    playbooks,
  };
}

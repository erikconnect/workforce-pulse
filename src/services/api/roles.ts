import type { Role } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiEnvelope<T> = { success?: boolean; data?: T };

type JobInsights = {
  topRoles?: Array<{ title: string; count: number; sectorId: string | null }>;
};

function assertApiConfigured() {
  if (!API) {
    throw new Error("NEXT_PUBLIC_API_URL not configured");
  }
}

function inferUrgency(openCount: number): "critical" | "watch" | "stable" {
  if (openCount >= 20) return "critical";
  if (openCount >= 8) return "watch";
  return "stable";
}

function mapTopRoles(topRoles: Array<{ title: string; count: number; sectorId: string | null }>): Role[] {
  return topRoles
    .filter((role) => Boolean(role.sectorId))
    .map((role, index) => ({
      id: `${role.sectorId}-role-${index + 1}`,
      title: role.title,
      sectorId: role.sectorId as string,
      openCount: role.count,
      urgency: inferUrgency(role.count),
      requiredSkills: [],
      avgTimeToFill: 30,
    }));
}

export async function fetchRoles(): Promise<Role[]> {
  assertApiConfigured();

  const res = await fetch(`${API}/jobs/insights`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch roles from job insights: ${res.status}`);

  const payload = (await res.json()) as ApiEnvelope<JobInsights> | JobInsights;
  const insights = "data" in (payload as ApiEnvelope<JobInsights>)
    ? (payload as ApiEnvelope<JobInsights>).data
    : (payload as JobInsights);

  return mapTopRoles(insights?.topRoles ?? []);
}

export async function fetchRolesBySector(sectorId: string): Promise<Role[]> {
  const roles = await fetchRoles();
  return roles.filter((role) => role.sectorId === sectorId);
}

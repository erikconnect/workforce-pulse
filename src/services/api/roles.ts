import type { Role } from "../types";
import { stubRoles } from "../stubs/roles.stub";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiEnvelope<T> = { success?: boolean; data?: T };

type JobInsights = {
  topRoles?: Array<{ title: string; count: number; sectorId: string | null }>;
};

function inferUrgency(openCount: number): "critical" | "watch" | "stable" {
  if (openCount >= 20) return "critical";
  if (openCount >= 8) return "watch";
  return "stable";
}

function mapTopRoles(topRoles: Array<{ title: string; count: number; sectorId: string | null; requiredSkills?: string[] }>): Role[] {
  return topRoles
    .filter((role) => Boolean(role.sectorId))
    .map((role) => {
      // Normalize title to match backend generation
      const normalizedTitle = role.title.toLowerCase()
        .replace(/[/:()]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      return {
        id: `${role.sectorId}-${normalizedTitle}`,
        title: role.title,
        sectorId: role.sectorId as string,
        openCount: role.count,
        urgency: inferUrgency(role.count),
        requiredSkills: role.requiredSkills || [],
        avgTimeToFill: 30,
      };
    });
}

export async function fetchRoles(): Promise<Role[]> {
  if (!API) return stubRoles;

  try {
    const res = await fetch(`${API}/jobs/insights`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch roles: ${res.status}`);
    const payload = (await res.json()) as ApiEnvelope<JobInsights> | JobInsights;
    const insights = "data" in (payload as ApiEnvelope<JobInsights>)
      ? (payload as ApiEnvelope<JobInsights>).data
      : (payload as JobInsights);
    return mapTopRoles(insights?.topRoles ?? []);
  } catch {
    return stubRoles;
  }
}

export async function fetchRolesBySector(sectorId: string): Promise<Role[]> {
  const roles = await fetchRoles();
  return roles.filter((role) => role.sectorId === sectorId);
}

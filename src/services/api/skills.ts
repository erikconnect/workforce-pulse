import type { Skill, PulseStatus } from "../types";
import { stubSkills } from "../stubs/skills.stub";

export interface SkillFilters {
  category?: string;
  status?: PulseStatus;
  search?: string;
}

function resolveSkillsApiBase(): string {
  if (typeof window !== "undefined") return "";

  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL;
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "";
}

/**
 * Fetch all skills from the local Next.js API route.
 * Falls back to stubs if the API is unavailable.
 */
export async function fetchSkills(filters?: SkillFilters): Promise<Skill[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);

  try {
    const base = resolveSkillsApiBase();
    const endpoint = `${base}/api/skills?${params}`;
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch skills: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("Failed to fetch skills, using stubs:", err);
    return stubSkills;
  }
}

/**
 * Fetch a skill by ID - looks up from the full skills list.
 */
export async function fetchSkillById(id: string): Promise<Skill | undefined> {
  const skills = await fetchSkills();
  return skills.find((s) => s.id === id);
}

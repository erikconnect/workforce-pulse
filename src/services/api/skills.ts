import type { Skill, PulseStatus } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface SkillFilters {
  category?: string;
  status?: PulseStatus;
  search?: string;
}

/**
 * Fetch all skills from backend API
 */
export async function fetchSkills(filters?: SkillFilters): Promise<Skill[]> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL not configured");
  
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);
  
  try {
    const res = await fetch(`${API}/skills?${params}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch skills: ${res.status}`);
    const data = await res.json();
    return data.data || data;
  } catch (err) {
    console.error("❌ Failed to fetch skills:", err);
    throw err;
  }
}

/**
 * Fetch a skill by ID
 */
export async function fetchSkillById(id: string): Promise<Skill | undefined> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL not configured");
  
  try {
    const res = await fetch(`${API}/skills/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch skill ${id}`);
    const data = await res.json();
    return data.data || data;
  } catch (err) {
    console.error(`❌ Failed to fetch skill ${id}:`, err);
    throw err;
  }
}

/**
 * GET /api/skills
 *   Returns stub skills enriched with live job demand data.
 *   Infers demandLevel from how many live job postings mention each skill.
 *
 *   Query params:
 *     category?: string
 *     status?:   "critical" | "watch" | "stable"
 *     search?:   string
 */

import { NextRequest, NextResponse } from "next/server";
import { stubSkills } from "@/services/stubs/skills.stub";
import { jobStore } from "@/app/api/jobs/store";
import type { PulseStatus } from "@/services/types";

function inferDemandLevel(count: number): PulseStatus {
  if (count >= 10) return "critical";
  if (count >= 4) return "watch";
  return "stable";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status") as PulseStatus | null;
  const search = searchParams.get("search");

  // Build skill frequency map from live job postings
  let skillFreq = new Map<string, number>();
  try {
    const jobs = await jobStore.getAll();
    for (const job of jobs) {
      for (const skill of job.extractedSkills ?? []) {
        const key = skill.toLowerCase().trim();
        skillFreq.set(key, (skillFreq.get(key) ?? 0) + 1);
      }
    }
  } catch {
    // No job data yet — fall through with empty freq map
  }

  let skills = stubSkills.map((skill) => {
    const count = skillFreq.get(skill.name.toLowerCase()) ?? 0;
    return {
      ...skill,
      jobCount: count,
      demandLevel: count > 0 ? inferDemandLevel(count) : skill.demandLevel,
    };
  });

  if (category) skills = skills.filter((s) => s.category === category);
  if (status) skills = skills.filter((s) => s.demandLevel === status);
  if (search) {
    const q = search.toLowerCase();
    skills = skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(skills);
}

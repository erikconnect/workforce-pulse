/**
 * GET /api/skills/aggregate
 *   Aggregates extracted skills from all stored job postings.
 *   Returns skill frequency counts and inferred demand levels.
 *
 *   Returns:
 *     { totalJobs: number; skills: { name, count, demandLevel }[] }
 */

import { NextResponse } from "next/server";
import { jobStore } from "@/app/api/jobs/store";
import type { PulseStatus } from "@/services/types";

function inferDemandLevel(count: number): PulseStatus {
  if (count >= 10) return "critical";
  if (count >= 4) return "watch";
  return "stable";
}

export async function GET() {
  try {
    const jobs = await jobStore.getAll();

    const freq = new Map<string, number>();
    for (const job of jobs) {
      for (const skill of job.extractedSkills ?? []) {
        const key = skill.toLowerCase().trim();
        freq.set(key, (freq.get(key) ?? 0) + 1);
      }
    }

    const skills = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        demandLevel: inferDemandLevel(count),
      }));

    return NextResponse.json({ totalJobs: jobs.length, skills });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

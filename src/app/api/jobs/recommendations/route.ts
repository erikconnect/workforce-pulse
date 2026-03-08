/**
 * GET /api/jobs/recommendations
 *   Analyzes available jobs and provides:
 *   - Top skills in demand
 *   - Job opportunities by skill
 *   - Recommended missions to learn needed skills
 *   - Playbook suggestions based on job requirements
 */

import { NextResponse } from "next/server"
import { jobStore } from "../store"
import { triggerBackgroundScrape } from "../scrape-cache"
import type { JobPosting } from "@/services/types"

interface SkillDemand {
  skill: string
  count: number
  relatedJobs: Pick<JobPosting, "id" | "title" | "org">[]
}

interface MissionRecommendation {
  missionId: string
  reason: string
  skillsProvided: string[]
  jobsUnlocked: number
}

interface PlaybookRecommendation {
  playbookId: string
  title: string
  reason: string
  skillsGained: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
}

interface JobRecommendationsResponse {
  topSkillsInDemand: SkillDemand[]
  jobsBySkill: Record<string, JobPosting[]>
  criticalSkillGaps: { skill: string; jobsRequiring: number }[]
  missionSuggestions: MissionRecommendation[]
  playbookSuggestions: PlaybookRecommendation[]
  summary: {
    totalJobs: number
    uniqueSkills: number
    mostCommonSector: string
    averageSalaryRange: string
  }
}

export async function GET() {
  try {
    await triggerBackgroundScrape()
    const postings = await jobStore.getAll()

    // Aggregate skill demand
    const skillCount = new Map<string, { count: number; jobs: JobPosting[] }>()
    const sectorCount = new Map<string, number>()

    for (const job of postings) {
      // Count sectors
      if (job.sectorId) {
        sectorCount.set(job.sectorId, (sectorCount.get(job.sectorId) ?? 0) + 1)
      }

      // Aggregate skills
      for (const skill of job.extractedSkills ?? []) {
        const current = skillCount.get(skill) ?? { count: 0, jobs: [] }
        current.count++
        if (current.jobs.length < 3) {
          current.jobs.push(job)
        }
        skillCount.set(skill, current)
      }
    }

    // Top skills in demand
    const topSkillsInDemand: SkillDemand[] = Array.from(skillCount.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([skill, data]) => ({
        skill,
        count: data.count,
        relatedJobs: data.jobs.map((j) => ({
          id: j.id,
          title: j.title,
          org: j.org,
        })),
      }))

    // Find most common sector
    const mostCommonSector = sectorCount.size > 0
      ? Array.from(sectorCount.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "technology"
      : "technology"

    // Create mission recommendations based on top skills
    const missionSuggestions: MissionRecommendation[] = topSkillsInDemand.slice(0, 5).map((sd, idx) => ({
      missionId: `skill-mission-${idx}`,
      reason: `Master ${sd.skill} — needed for ${sd.count} job${sd.count > 1 ? "s" : ""}`,
      skillsProvided: [sd.skill],
      jobsUnlocked: sd.count,
    }))

    // Create playbook recommendations
    const playbookDifficulties: ("beginner" | "intermediate" | "advanced")[] = [
      "beginner",
      "intermediate",
      "advanced",
    ]
    const playbookSuggestions: PlaybookRecommendation[] = topSkillsInDemand.slice(0, 3).map((sd, idx) => ({
      playbookId: `playbook-${sd.skill.replace(/\s+/g, "-")}`,
      title: `${sd.skill} Mastery Path`,
      reason: `High demand: ${sd.count} companies hiring for this skill`,
      skillsGained: [sd.skill],
      difficulty: playbookDifficulties[idx % playbookDifficulties.length],
    }))

    // Estimate salary range from available data
    const salaries = postings
      .filter((j) => j.salary)
      .map((j) => {
        const match = j.salary?.match(/\$?(\d+(?:,\d{3})*)/g)
        if (match && match[0]) {
          return parseInt(match[0].replace(/[^0-9]/g, ""))
        }
        return null
      })
      .filter((s): s is number => s !== null)
      .sort((a, b) => a - b)

    const averageSalaryRange =
      salaries.length > 0
        ? `$${(salaries[Math.floor(salaries.length * 0.25)] ?? 0).toLocaleString()} - $${(salaries[Math.floor(salaries.length * 0.75)] ?? 0).toLocaleString()}`
        : "N/A"

    const response: JobRecommendationsResponse = {
      topSkillsInDemand,
      jobsBySkill: Object.fromEntries(
        topSkillsInDemand.map((sd) => [
          sd.skill,
          postings.filter((j) => j.extractedSkills?.includes(sd.skill)),
        ]),
      ),
      criticalSkillGaps: topSkillsInDemand.slice(0, 5).map((sd) => ({
        skill: sd.skill,
        jobsRequiring: sd.count,
      })),
      missionSuggestions,
      playbookSuggestions,
      summary: {
        totalJobs: postings.length,
        uniqueSkills: skillCount.size,
        mostCommonSector,
        averageSalaryRange,
      },
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error("[JobRecommendations] Error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate recommendations" },
      { status: 500 },
    )
  }
}

"use client"

import { useQuery } from "@tanstack/react-query"

export interface SkillDemand {
  skill: string
  count: number
  relatedJobs: { id: string; title: string; org: string }[]
}

export interface MissionRecommendation {
  missionId: string
  reason: string
  skillsProvided: string[]
  jobsUnlocked: number
}

export interface PlaybookRecommendation {
  playbookId: string
  title: string
  reason: string
  skillsGained: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
}

export interface JobRecommendationsData {
  topSkillsInDemand: SkillDemand[]
  jobsBySkill: Record<string, any[]>
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

/**
 * Hook to fetch job-based recommendations for skills, missions, and playbooks
 * Analyzes all available jobs and provides actionable suggestions
 */
export function useJobRecommendations() {
  return useQuery<JobRecommendationsData>({
    queryKey: ["jobRecommendations"],
    queryFn: () => fetch("/api/jobs/recommendations").then((r) => r.json()),
    staleTime: 3600_000, // 1 hour
    gcTime: 24 * 3600_000, // 24 hours
  })
}

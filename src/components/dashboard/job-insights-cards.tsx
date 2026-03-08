"use client"

import { useMemo } from "react"
import { TrendingUp, BookOpen, Target, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useJobRecommendations } from "@/hooks/use-job-recommendations"
import type { SkillDemand, PlaybookRecommendation, MissionRecommendation } from "@/hooks/use-job-recommendations"

export function JobInsightsCards() {
  const { data: recommendations, isLoading } = useJobRecommendations()

  const topSkills = useMemo(() => recommendations?.topSkillsInDemand.slice(0, 3) ?? [], [recommendations])
  const missionTips = useMemo(() => recommendations?.missionSuggestions.slice(0, 3) ?? [], [recommendations])
  const playbookTips = useMemo(() => recommendations?.playbookSuggestions.slice(0, 3) ?? [], [recommendations])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top Skills in Demand */}
      <div className="grid gap-4 md:grid-cols-3">
        {topSkills.map((skill: SkillDemand) => (
          <Card key={skill.skill} className="glass-panel rounded-2xl p-4 bordered">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground">{skill.skill}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {skill.count} open position{skill.count !== 1 ? "s" : ""}
                </p>
              </div>
              <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            </div>

            {/* Sample jobs */}
            <div className="mt-3 space-y-2">
              {skill.relatedJobs.slice(0, 2).map((job) => (
                <div key={job.id} className="text-[11px] text-muted-foreground line-clamp-1">
                  <span className="font-medium text-foreground">{job.org}</span> • {job.title}
                </div>
              ))}
            </div>

            <Badge className="mt-3 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              High Demand
            </Badge>
          </Card>
        ))}
      </div>

      {/* Missions & Playbooks */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recommended Missions */}
        <Card className="glass-panel rounded-2xl p-4 bordered">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-sm">Mission Tips</h3>
          </div>
          <div className="space-y-3">
            {missionTips.map((mission: MissionRecommendation) => (
              <div key={mission.missionId} className="text-xs">
                <p className="font-medium text-foreground">{mission.reason}</p>
                <p className="text-muted-foreground mt-1">
                  Unlocks {mission.jobsUnlocked} job opportunity
                  {mission.jobsUnlocked !== 1 ? "ies" : ""}
                </p>
                <div className="flex gap-1 mt-2">
                  {mission.skillsProvided.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-[9px]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Playbooks */}
        <Card className="glass-panel rounded-2xl p-4 bordered">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-purple-500" />
            <h3 className="font-semibold text-sm">Playbook Recommendations</h3>
          </div>
          <div className="space-y-3">
            {playbookTips.map((playbook: PlaybookRecommendation) => (
              <div key={playbook.playbookId} className="text-xs">
                <p className="font-medium text-foreground">{playbook.title}</p>
                <p className="text-muted-foreground mt-1">{playbook.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px]",
                      playbook.difficulty === "beginner"
                        ? "bg-green-50 text-green-800 dark:bg-green-900/30"
                        : playbook.difficulty === "intermediate"
                          ? "bg-amber-50 text-amber-800 dark:bg-amber-900/30"
                          : "bg-red-50 text-red-800 dark:bg-red-900/30",
                    )}
                  >
                    {playbook.difficulty}
                  </Badge>
                  {playbook.skillsGained.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-[9px]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Summary Stats */}
      {recommendations && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-panel rounded-2xl p-3 bordered">
            <p className="text-xs text-muted-foreground">Total Jobs</p>
            <p className="text-xl font-bold text-foreground mt-1">{recommendations.summary.totalJobs}</p>
          </Card>
          <Card className="glass-panel rounded-2xl p-3 bordered">
            <p className="text-xs text-muted-foreground">Unique Skills</p>
            <p className="text-xl font-bold text-foreground mt-1">{recommendations.summary.uniqueSkills}</p>
          </Card>
          <Card className="glass-panel rounded-2xl p-3 bordered">
            <p className="text-xs text-muted-foreground">Top Sector</p>
            <p className="text-sm font-bold text-foreground mt-1 capitalize">
              {recommendations.summary.mostCommonSector}
            </p>
          </Card>
          <Card className="glass-panel rounded-2xl p-3 bordered">
            <p className="text-xs text-muted-foreground">Salary Range</p>
            <p className="text-sm font-bold text-foreground mt-1">{recommendations.summary.averageSalaryRange}</p>
          </Card>
        </div>
      )}
    </div>
  )
}

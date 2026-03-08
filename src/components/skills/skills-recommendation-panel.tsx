"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Briefcase, TrendingUp } from "lucide-react"
import { useJobRecommendations } from "@/hooks/use-job-recommendations"

export function SkillsRecommendationPanel() {
  const { data: recommendations, isLoading } = useJobRecommendations()

  const topSkills = useMemo(() => recommendations?.topSkillsInDemand ?? [], [recommendations])
  const skillGaps = useMemo(() => recommendations?.criticalSkillGaps ?? [], [recommendations])

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />
  }

  if (!recommendations) {
    return null
  }

  return (
    <Card className="glass-panel rounded-2xl p-6 bordered">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Skills in Demand</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Based on {recommendations.summary.totalJobs} active job listings
      </p>

      {/* Top Skills */}
      <div className="space-y-3 mb-6">
        {topSkills.slice(0, 5).map((skill) => (
          <div key={skill.skill} className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-sm text-foreground">{skill.skill}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {skill.count} company {skill.count === 1 ? "is" : "are"} hiring
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 whitespace-nowrap">
              {Math.round((skill.count / recommendations.summary.totalJobs) * 100)}%
            </Badge>
          </div>
        ))}
      </div>

      {/* Critical Skill Gaps */}
      <div className="pt-6 border-t border-border/40">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Critical Skill Gaps
        </h3>
        <div className="space-y-2">
          {skillGaps.map((gap) => (
            <div key={gap.skill} className="text-xs flex items-center justify-between">
              <span className="text-muted-foreground">{gap.skill}</span>
              <Badge variant="outline" className="text-[10px]">
                {gap.jobsRequiring} positions
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

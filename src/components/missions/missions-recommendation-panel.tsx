"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Target, AlertCircle, Zap } from "lucide-react"
import { useJobRecommendations } from "@/hooks/use-job-recommendations"
import { Button } from "@/components/ui/button"

export function MissionsRecommendationPanel() {
  const { data: recommendations, isLoading } = useJobRecommendations()

  const missions = useMemo(() => recommendations?.missionSuggestions ?? [], [recommendations])

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />
  }

  if (!recommendations || missions.length === 0) {
    return null
  }

  return (
    <Card className="glass-panel rounded-2xl p-6 bordered">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold">Recommended Missions</h2>
        <Badge variant="secondary" className="ml-auto">{missions.length} available</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Complete these missions to master high-demand skills and unlock more job opportunities
      </p>

      <div className="space-y-3">
        {missions.map((mission) => (
          <div key={mission.missionId} className="p-3 rounded-lg bg-white/5 dark:bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{mission.reason}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {mission.skillsProvided.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-[10px]">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Unlocks {mission.jobsUnlocked} job opportunity{mission.jobsUnlocked !== 1 ? "ies" : ""}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4 rounded-xl">
        View all missions
      </Button>
    </Card>
  )
}

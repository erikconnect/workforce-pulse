"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Circle, Target, ArrowRight } from "lucide-react"
import Link from "next/link"
import { fetchMissions, updateMissionStep } from "@/services"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const PRIORITY_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

export function QuickActions() {
  const queryClient = useQueryClient()
  const { data: missions } = useQuery({
    queryKey: ["missions"],
    queryFn: fetchMissions,
  })

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const stepMutation = useMutation({
    mutationFn: ({ missionId, stepId }: { missionId: string; stepId: string }) =>
      updateMissionStep(missionId, stepId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] })
    },
  })

  // Get the next 3 incomplete steps from active missions
  const quickSteps = (missions ?? [])
    .filter((m) => m.status === "active")
    .flatMap((m) =>
      m.steps
        .filter((s) => !s.completed)
        .slice(0, 1)
        .map((s) => ({ mission: m, step: s }))
    )
    .slice(0, 3)

  if (quickSteps.length === 0) return null

  return (
    <div data-tour="quick-actions">
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/missions">
                All missions <ArrowRight className="h-3 w-3 ml-0.5" />
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Next steps from your active missions
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickSteps.map(({ mission, step }) => {
            const justCompleted = completedIds.has(step.id)
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border border-border transition-all duration-300",
                  justCompleted && "bg-green-50 border-green-200"
                )}
              >
                <button
                  onClick={() => {
                    setCompletedIds((prev) => new Set(prev).add(step.id))
                    stepMutation.mutate({ missionId: mission.id, stepId: step.id })
                  }}
                  disabled={justCompleted}
                  className="mt-0.5 shrink-0"
                  aria-label={`Complete step: ${step.title}`}
                >
                  {justCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 check-complete" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    justCompleted && "line-through text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0", PRIORITY_CLASS[mission.priority])}
                    >
                      {mission.title}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

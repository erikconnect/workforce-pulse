"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Lightbulb } from "lucide-react"
import { useJobRecommendations } from "@/hooks/use-job-recommendations"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PlaybooksRecommendationPanel() {
  const { data: recommendations, isLoading } = useJobRecommendations()

  const playbooks = useMemo(() => recommendations?.playbookSuggestions ?? [], [recommendations])

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />
  }

  if (!recommendations || playbooks.length === 0) {
    return null
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      case "intermediate":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="glass-panel rounded-2xl p-6 bordered">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-purple-500" />
        <h2 className="text-lg font-semibold">Learning Paths</h2>
        <Badge variant="secondary" className="ml-auto">{playbooks.length} paths</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Follow these structured learning paths to build skills employers are actively seeking
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {playbooks.map((playbook) => (
          <div
            key={playbook.playbookId}
            className="p-4 rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/2 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-sm text-foreground leading-tight flex-1">{playbook.title}</h3>
              <Badge className={cn("text-[9px] shrink-0", getDifficultyColor(playbook.difficulty))}>
                {playbook.difficulty}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-3">{playbook.reason}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {playbook.skillsGained.map((skill) => (
                <Badge key={skill} variant="outline" className="text-[9px]">
                  {skill}
                </Badge>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs rounded-lg">
              <Lightbulb className="h-3 w-3 mr-1" />
              Start path
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

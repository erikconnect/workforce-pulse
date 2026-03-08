"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { TrendingUp, BookOpen, Briefcase, ArrowUpRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SkillDemand {
  skill: string
  count: number
  relatedJobs: { id: string; title: string; org: string }[]
}

interface PlaybookSuggestion {
  playbookId: string
  title: string
  reason: string
  skillsGained: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
}

interface RecommendationsData {
  topSkillsInDemand: SkillDemand[]
  playbookSuggestions: PlaybookSuggestion[]
  summary: {
    totalJobs: number
    uniqueSkills: number
    mostCommonSector: string
    averageSalaryRange: string
  }
}

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner:     "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  advanced:     "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
}

function SkillBar({ skill, count, max }: { skill: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium capitalize truncate">{skill}</span>
        <span className="text-[10px] text-muted-foreground shrink-0">{count} job{count !== 1 ? "s" : ""}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/30 dark:bg-white/10">
        <div
          className="h-1.5 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function JobRecommendationsPanel() {
  const { data, isLoading } = useQuery<RecommendationsData>({
    queryKey: ["jobRecommendations"],
    queryFn: () => fetch("/api/jobs/recommendations").then((r) => r.json()),
    staleTime: 300_000, // 5 min
  })

  const topSkills = data?.topSkillsInDemand?.slice(0, 6) ?? []
  const maxCount = topSkills[0]?.count ?? 1
  const playbooks = data?.playbookSuggestions?.slice(0, 3) ?? []

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-3xl" />
        <Skeleton className="h-52 rounded-3xl" />
      </div>
    )
  }

  if (!data || topSkills.length === 0) return null

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Top Skills in Demand */}
      <div className="glass-panel rounded-3xl border border-white/35 p-5 dark:border-white/10">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Skills in Demand</p>
              <p className="text-[10px] text-muted-foreground">From live job postings</p>
            </div>
          </div>
          <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
            {data.summary.uniqueSkills} skills tracked
          </Badge>
        </div>

        <div className="space-y-3">
          {topSkills.map((sd) => (
            <SkillBar key={sd.skill} skill={sd.skill} count={sd.count} max={maxCount} />
          ))}
        </div>

        {data.summary.averageSalaryRange !== "N/A" && (
          <div className="mt-4 rounded-2xl bg-white/30 px-3 py-2 dark:bg-white/5">
            <span className="text-[10px] text-muted-foreground">Avg salary range </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {data.summary.averageSalaryRange}
            </span>
          </div>
        )}
      </div>

      {/* Playbook Recommendations */}
      <div className="glass-panel rounded-3xl border border-white/35 p-5 dark:border-white/10">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Recommended Playbooks</p>
            <p className="text-[10px] text-muted-foreground">Learn the skills employers need most</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {playbooks.map((pb) => (
            <Link
              key={pb.playbookId}
              href="/playbooks"
              className="group flex items-start gap-3 rounded-2xl border border-white/30 bg-white/35 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold leading-tight">{pb.title}</p>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">{pb.reason}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <Badge className={cn("text-[10px] border-0 capitalize", DIFFICULTY_BADGE[pb.difficulty])}>
                    {pb.difficulty}
                  </Badge>
                  {pb.skillsGained.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px] capitalize">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/playbooks"
          className="mt-3 flex items-center justify-center gap-1 rounded-2xl border border-white/30 bg-white/20 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary dark:border-white/10 dark:bg-white/5"
        >
          <Briefcase className="h-3.5 w-3.5" />
          Browse all playbooks
        </Link>
      </div>
    </div>
  )
}

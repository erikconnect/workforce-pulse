"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, TrendingUp, ExternalLink, ChevronDown, ChevronUp, Building2, GraduationCap } from "lucide-react"
import { fetchSkills, fetchRoles } from "@/services"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, statusToColor } from "@/lib/utils"
import { SparklineChart } from "@/components/sectors/sparkline-chart"
import type { PulseStatus, Skill } from "@/services/types"

const CATEGORIES = [
  "All",
  "Cloud Infrastructure",
  "Data Science",
  "Healthcare",
  "Leadership",
  "Operations",
  "Safety Compliance",
  "Software Development",
]

const DEMAND_LEVELS: { value: PulseStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "watch", label: "Watch" },
  { value: "stable", label: "Stable" },
]

const BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

function SkillSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  )
}

const ALIGNMENT_LABEL: Record<PulseStatus, { text: string; cls: string }> = {
  critical: { text: "High Demand", cls: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700" },
  watch: { text: "Moderate", cls: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700" },
  stable: { text: "Steady", cls: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700" },
}

function SkillCardExpanded({ skill, sectorMap }: { skill: Skill; sectorMap: Map<string, string> }) {
  const [expanded, setExpanded] = useState(false)
  const relatedSectors = useMemo(() => {
    const sectorIds = new Set<string>()
    for (const roleId of skill.relatedRoles) {
      const sid = sectorMap.get(roleId)
      if (sid) sectorIds.add(sid)
    }
    return Array.from(sectorIds)
  }, [skill.relatedRoles, sectorMap])

  const alignment = ALIGNMENT_LABEL[skill.demandLevel]

  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight">{skill.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{skill.category}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className={cn("text-xs border capitalize", BADGE_CLASS[skill.demandLevel])}>
              {skill.demandLevel}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] border", alignment.cls)}>
              {alignment.text}
            </Badge>
          </div>
        </div>

        <SparklineChart data={skill.sparklineData} status={skill.demandLevel} height={36} />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Growth rate</span>
          </div>
          <span className={cn("font-semibold", statusToColor(skill.demandLevel))}>
            +{skill.growthRate}%
          </span>
        </div>

        {/* Sector mapping */}
        {relatedSectors.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
            {relatedSectors.map((sid) => (
              <Badge key={sid} variant="secondary" className="text-[10px] capitalize">
                {sid.replace(/-/g, " ")}
              </Badge>
            ))}
          </div>
        )}

        {skill.relatedRoles.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {skill.relatedRoles.length} related role{skill.relatedRoles.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Training Pathways */}
        {skill.trainingResources.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-xs text-muted-foreground h-7 px-1"
              onClick={() => setExpanded((v) => !v)}
            >
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {expanded ? "Hide" : "Show"} training pathways ({skill.trainingResources.length})
              </span>
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            {expanded && (
              <div className="space-y-1.5 pl-1">
                {skill.trainingResources.map((tr) => (
                  <div key={tr.title} className="flex items-start gap-2 text-xs">
                    <ExternalLink className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <a
                        href={tr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {tr.title}
                      </a>
                      <p className="text-muted-foreground">{tr.provider}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function SkillsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [demandLevel, setDemandLevel] = useState<PulseStatus | "all">("all")

  const { data: skills, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: () => fetchSkills(),
  })

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchRoles(),
  })

  // Map roleId → sectorId for sector mapping
  const sectorMap = useMemo(() => {
    const map = new Map<string, string>()
    if (roles) {
      for (const role of roles) map.set(role.id, role.sectorId)
    }
    return map
  }, [roles])

  const filtered = useMemo(() => {
    if (!skills) return []
    return skills.filter((s) => {
      if (category !== "All" && s.category !== category) return false
      if (demandLevel !== "all" && s.demandLevel !== demandLevel) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [skills, category, demandLevel, search])

  const criticalSkills = skills?.filter((s) => s.demandLevel === "critical").length ?? 0
  const watchSkills = skills?.filter((s) => s.demandLevel === "watch").length ?? 0
  const stableSkills = skills?.filter((s) => s.demandLevel === "stable").length ?? 0
  const total = skills?.length ?? 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Skills</h2>
        <p className="text-muted-foreground text-sm mt-1">
          In-demand skills across all workforce sectors.
        </p>
      </div>

      {/* Gap Analysis Summary */}
      {skills && skills.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Skill Gap Analysis</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-pulse-critical font-semibold">{criticalSkills} critical</span>
              <span className="text-pulse-watch font-semibold">{watchSkills} watch</span>
              <span className="text-pulse-stable font-semibold">{stableSkills} stable</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              <div className="bg-red-500 transition-all" style={{ width: `${(criticalSkills / total) * 100}%` }} />
              <div className="bg-amber-500 transition-all" style={{ width: `${(watchSkills / total) * 100}%` }} />
              <div className="bg-green-500 transition-all" style={{ width: `${(stableSkills / total) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              {criticalSkills} of {total} tracked skills are in critical demand — these represent the largest workforce gaps in Montgomery.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 rounded-md border border-input p-1">
          {DEMAND_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDemandLevel(value)}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                demandLevel === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {skills?.length ?? 0} skills
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(9)].map((_, i) => <SkillSkeleton key={i} />)
          : filtered.map((skill) => (
              <SkillCardExpanded key={skill.id} skill={skill} sectorMap={sectorMap} />
            ))}

        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No skills match your filters.
          </div>
        )}
      </div>
    </div>
  )
}

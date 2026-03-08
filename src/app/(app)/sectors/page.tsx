"use client"

import { useState, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchMissionMemberProfile, fetchRoles, fetchSectors, fetchSkills, recordSectorAction } from "@/services"
import { SectorCard } from "@/components/sectors/sector-card"
import { SectorCompare } from "@/components/sectors/sector-compare"
import { SectorRadar } from "@/components/sectors/sector-radar"
import { useTotalJobs } from "@/hooks/use-total-jobs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { GitCompareArrows, X, Users, Briefcase, ArrowUpDown, Sparkles, ShieldAlert, TrendingUp, Activity, Search, ArrowUpRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { PulseStatus } from "@/services/types"

function SectorCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-16" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full" />
      <div className="flex justify-between pt-1 border-t">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export default function SectorsPage() {
  const queryClient = useQueryClient()
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [statusFilter, setStatusFilter] = useState<PulseStatus | "all">("all")
  const [sortBy, setSortBy] = useState<"score" | "roles" | "name">("score")
  const [search, setSearch] = useState("")
  const isComparing = compareMode

  const { data: sectors, isLoading, isError } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  })
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  })
  const { data: skills } = useQuery({
    queryKey: ["skills"],
    queryFn: () => fetchSkills(),
  })
  const { data: memberProfile } = useQuery({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })
  const { totalJobs } = useTotalJobs()
  
  const recordSectorCompare = useMutation({
    mutationFn: (sectorId: string) => Promise.resolve(recordSectorAction(sectorId, "compare")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
    },
  })

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 2
          ? [...prev, id]
          : prev
    )
  }

  const criticalCount = sectors?.filter((s) => s.status === "critical").length ?? 0
  const watchCount = sectors?.filter((s) => s.status === "watch").length ?? 0
  const stableCount = totalJobs > 0 ? totalJobs : (sectors?.reduce((sum, s) => sum + s.openRolesCount, 0) ?? 0)
  const totalEmployees = sectors?.reduce((sum, s) => sum + s.employeeCount, 0) ?? 0
  const totalOpenRoles = sectors?.reduce((sum, s) => sum + s.openRolesCount, 0) ?? 0
  const topCriticalSector = useMemo(() => {
    if (!sectors) return null
    return [...sectors]
      .filter((sector) => sector.status === "critical")
      .sort((a, b) => b.openRolesCount - a.openRolesCount)[0] ?? null
  }, [sectors])
  const fastestRisingSector = useMemo(() => {
    if (!sectors) return null
    return [...sectors]
      .sort((a, b) => {
        const aDelta = a.kpis.find((kpi) => kpi.label === "WoW Change")?.delta ?? 0
        const bDelta = b.kpis.find((kpi) => kpi.label === "WoW Change")?.delta ?? 0
        return bDelta - aDelta
      })[0] ?? null
  }, [sectors])
  const healthiestSector = useMemo(() => {
    if (!sectors) return null
    return [...sectors].sort((a, b) => b.pulseScore - a.pulseScore)[0] ?? null
  }, [sectors])
  const workersInCriticalSectors = useMemo(() => {
    if (!sectors) return 0
    return sectors
      .filter((sector) => sector.status === "critical")
      .reduce((sum, sector) => sum + sector.employeeCount, 0)
  }, [sectors])
  const sectorInsights = useMemo(() => {
    const rolesBySector = new Map<string, typeof roles>()
    for (const role of roles ?? []) {
      const bucket = rolesBySector.get(role.sectorId) ?? []
      bucket.push(role)
      rolesBySector.set(role.sectorId, bucket)
    }

    const skillMap = new Map((skills ?? []).map((skill) => [skill.id, skill]))
    const result = new Map<string, {
      avgTimeToFill: number
      readinessPct: number
      trainingPathways: number
      topSkills: string[]
      criticalRoleCount: number
    }>()

    for (const sector of sectors ?? []) {
      const sectorRoles = rolesBySector.get(sector.id) ?? []
      const criticalSectorRoles = sectorRoles.filter((role) => role.urgency === "critical" || role.urgency === "watch")
      const skillIds = Array.from(new Set(sectorRoles.flatMap((role) => role.requiredSkills)))
      const sectorSkills = skillIds
        .map((skillId) => skillMap.get(skillId))
        .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill))
      const mappedSkills = sectorSkills.filter((skill) => skill.trainingResources.length > 0)
      const trainingPathways = mappedSkills.reduce((sum, skill) => sum + skill.trainingResources.length, 0)
      const avgTimeToFill = criticalSectorRoles.length > 0
        ? Math.round(criticalSectorRoles.reduce((sum, role) => sum + role.avgTimeToFill, 0) / criticalSectorRoles.length)
        : 0
      const readinessPct = skillIds.length > 0
        ? Math.round((mappedSkills.length / skillIds.length) * 100)
        : 0

      result.set(sector.id, {
        avgTimeToFill,
        readinessPct,
        trainingPathways,
        topSkills: sectorSkills
          .sort((a, b) => b.growthRate - a.growthRate)
          .slice(0, 4)
          .map((skill) => skill.name),
        criticalRoleCount: criticalSectorRoles.length,
      })
    }

    return result
  }, [roles, sectors, skills])
  const topDemandRoles = useMemo(() => {
    return [...(roles ?? [])]
      .sort((a, b) => {
        const urgencyWeight = { critical: 0, watch: 1, stable: 2 }
        return (urgencyWeight[a.urgency] - urgencyWeight[b.urgency]) || (b.openCount - a.openCount)
      })
      .slice(0, 10)
      .map((role) => {
        const sector = sectors?.find((item) => item.id === role.sectorId)
        return {
          ...role,
          sectorName: sector?.name ?? "Sector",
        }
      })
  }, [roles, sectors])
  const filtered = useMemo(() => {
    if (!sectors) return []
    let result = statusFilter === "all" ? sectors : sectors.filter((s) => s.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((sector) => {
        const skillNames = sectorInsights.get(sector.id)?.topSkills.join(" ").toLowerCase() ?? ""
        return (
          sector.name.toLowerCase().includes(q) ||
          sector.description.toLowerCase().includes(q) ||
          skillNames.includes(q)
        )
      })
    }
    if (sortBy === "score") result = [...result].sort((a, b) => a.pulseScore - b.pulseScore)
    else if (sortBy === "roles") result = [...result].sort((a, b) => b.openRolesCount - a.openRolesCount)
    else result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [search, sectorInsights, sectors, statusFilter, sortBy])

  const sectorA = sectors?.find((s) => s.id === compareIds[0])
  const sectorB = sectors?.find((s) => s.id === compareIds[1])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-card-strong card-hover-lift overflow-hidden rounded-[30px] border border-white/40 p-6 dark:border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="primary">
                  Sector intelligence
                </Badge>
                <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
                  {sectors?.length ?? 0} sectors tracked
                </Badge>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Sectors</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Monitor workforce health across Montgomery&apos;s major sectors, surface where hiring pressure is building, and compare operational demand before it becomes a staffing bottleneck.
              </p>
            </div>
            <Button
              variant={isComparing ? "default" : "outline"}
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={() => {
                setCompareMode((prev) => {
                  const next = !prev
                  if (!next) setCompareIds([])
                  return next
                })
              }}
            >
              {isComparing ? (
                <>
                  <X className="h-4 w-4" /> Exit Compare
                </>
              ) : (
                <>
                  <GitCompareArrows className="h-4 w-4" /> Compare Sectors
                </>
              )}
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
              <Users className="mr-1 h-3 w-3" />
              {(totalEmployees / 1000).toFixed(0)}K workforce
            </Badge>
            <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
              <Briefcase className="mr-1 h-3 w-3" />
              {totalOpenRoles.toLocaleString()} open roles
            </Badge>
            <Badge variant="outline" className="border-red-300/70 bg-red-50/70 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              <ShieldAlert className="mr-1 h-3 w-3" />
              {criticalCount} critical
            </Badge>
            <Badge variant="outline" className="border-emerald-300/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
              <Activity className="mr-1 h-3 w-3" />
              {stableCount} stable
            </Badge>
            <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
              {watchCount} watch
            </Badge>
            <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
              {(workersInCriticalSectors / 1000).toFixed(0)}K exposed workers
            </Badge>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/30 bg-white/30 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Highest-demand jobs</p>
                <p className="mt-1 text-sm font-semibold">Top roles driving current pressure</p>
              </div>
              <Badge variant="primary">
                {topDemandRoles.length} roles
              </Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {topDemandRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between rounded-2xl bg-white/45 px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/60 dark:bg-white/6 dark:hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{role.title}</p>
                    <p className="text-xs text-muted-foreground">{role.sectorName} · avg {role.avgTimeToFill}d to fill</p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        role.urgency === "critical"
                          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300"
                          : role.urgency === "watch"
                            ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300"
                            : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300"
                      )}
                    >
                      {role.openCount} open
                    </Badge>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel card-hover-lift rounded-[30px] border border-white/35 p-5 dark:border-white/10">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Executive Signals</h3>
          </div>
          {sectors ? (
            <div className="space-y-4">
              {memberProfile && (
                <>
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">Sector points</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">{memberProfile.sectorPoints} pts</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {memberProfile.sectorActionsCompleted} actions: compare, monitor, strategize.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Earn points</p>
                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                      <p>Sector comparison: +12 pts</p>
                    </div>
                  </div>
                </>
              )}
              <div>
                <SectorRadar sectors={sectors} />
              </div>
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Highest pressure</p>
                  <p className="mt-1 text-sm font-semibold">{topCriticalSector?.name ?? "No critical sector"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {topCriticalSector ? `${topCriticalSector.openRolesCount} open roles.` : "Critical risk is contained."}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Fastest weekly rise</p>
                  <p className="mt-1 text-sm font-semibold">{fastestRisingSector?.name ?? "—"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {fastestRisingSector ? `${fastestRisingSector.kpis.find((kpi) => kpi.label === "WoW Change")?.value ?? "0%"}.` : "Trend data loading."}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Most stable baseline</p>
                  <p className="mt-1 text-sm font-semibold">{healthiestSector?.name ?? "—"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {healthiestSector ? `Pulse ${healthiestSector.pulseScore}.` : "Baseline loading."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Skeleton className="h-[320px] w-full rounded-2xl" />
          )}
        </div>
      </div>

      {/* Filters + Sort */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/35 p-3 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sectors, skills, or workforce signals..."
              className="h-9 rounded-xl border-input/70 bg-white/30 pl-9 text-sm dark:bg-white/5"
            />
          </div>
          <div className="flex items-center gap-1 rounded-2xl border border-input/70 bg-white/30 p-1 dark:bg-white/5">
          {([
            { value: "all" as const, label: "All" },
            { value: "critical" as const, label: "Critical" },
            { value: "watch" as const, label: "Watch" },
            { value: "stable" as const, label: "Stable" },
          ]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {label}
            </button>
          ))}
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-8 w-[170px] rounded-xl bg-white/30 text-xs dark:bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Pulse Score (Low→High)</SelectItem>
                <SelectItem value="roles">Open Roles (High→Low)</SelectItem>
                <SelectItem value="name">Name (A→Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
            {filtered.length} visible
          </Badge>
          {statusFilter !== "all" && (
            <Badge variant="primary">
              Filter: {statusFilter}
            </Badge>
          )}
          {search.trim() && (
            <Badge variant="primary">
              Search: {search.trim()}
            </Badge>
          )}
          {isComparing && (
            <Badge variant="primary">
              Compare mode
            </Badge>
          )}
        </div>
      </div>

      {isComparing && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          {compareIds.length === 0
            ? "Select two sector cards to open a side-by-side comparison."
            : compareIds.length === 1
              ? `Selected: ${sectorA?.name}. Pick one more sector to compare.`
              : "Two sectors selected. Review the comparison panel below."}
        </div>
      )}

      {/* Comparison panel */}
      {sectorA && sectorB && (
        <div className="glass-panel rounded-[28px] border border-white/35 p-6 dark:border-white/10">
          <SectorCompare sectorA={sectorA} sectorB={sectorB} />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">Failed to load sectors. Please try again.</p>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Sector Portfolio</h3>
            <p className="text-sm text-muted-foreground">
              Review sector health, demand movement, and training linkage across Montgomery.
            </p>
          </div>
          {fastestRisingSector && (
            <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
              <TrendingUp className="mr-1 h-3 w-3" />
              Fastest rise: {fastestRisingSector.name}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {isLoading
          ? [...Array(8)].map((_, i) => <SectorCardSkeleton key={i} />)
          : filtered.map((sector) => (
              <div
                key={sector.id}
                onClick={isComparing ? () => {
                  toggleCompare(sector.id)
                  recordSectorCompare.mutate(sector.id)
                } : undefined}
                className={
                  isComparing
                    ? `h-full cursor-pointer rounded-[28px] ring-2 transition-all ${
                        compareIds.includes(sector.id)
                          ? "ring-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.22)]"
                          : "ring-transparent hover:ring-primary/30"
                      }`
                    : "h-full"
                }
              >
                <SectorCard sector={sector} insights={sectorInsights.get(sector.id)} />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

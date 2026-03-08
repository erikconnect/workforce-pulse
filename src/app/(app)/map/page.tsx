"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { MapLayers, type MapLayer } from "@/components/map/map-layers"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { fetchSectors } from "@/services"
import { useWorkforceData } from "@/hooks/use-workforce-data"
import { useJobInsights } from "@/hooks/use-job-insights"
import { useTotalJobs } from "@/hooks/use-total-jobs"
import { MontgomeryFact } from "@/components/dashboard/montgomery-fact"
import {
  Briefcase,
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  RadioTower,
  Building2,
  ShieldCheck,
  Sparkles,
  Layers3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserRole } from "@/hooks/use-user-role"
import dynamic from "next/dynamic"

interface FeatureCollection {
  features?: Array<unknown>
}

function createDefaultLayers(isAdmin: boolean): MapLayer[] {
  return isAdmin
    ? [
        { id: "zones", label: "Neighborhood Health", color: "#22c55e", enabled: true },
        { id: "calls", label: "911 Calls", color: "#ef4444", enabled: true },
        { id: "stations", label: "Stations", color: "#3b82f6", enabled: true },
        { id: "schools", label: "Schools", color: "#1d4ed8", enabled: true },
        { id: "permits", label: "Permits", color: "#f59e0b", enabled: false },
        { id: "business", label: "Business Opportunities", color: "#ea580c", enabled: true },
        { id: "jobs", label: "City Jobs", color: "#8b5cf6", enabled: true },
        { id: "heritage", label: "Heritage Trail", color: "#b98646", enabled: true },
        { id: "military", label: "Military", color: "#005e95", enabled: true },
      ]
    : [
        { id: "zones", label: "Neighborhood Health", color: "#22c55e", enabled: true },
        { id: "stations", label: "Stations", color: "#3b82f6", enabled: true },
        { id: "schools", label: "Schools", color: "#1d4ed8", enabled: true },
        { id: "business", label: "Business Opportunities", color: "#ea580c", enabled: true },
        { id: "jobs", label: "City Jobs", color: "#8b5cf6", enabled: true },
        { id: "heritage", label: "Heritage Trail", color: "#b98646", enabled: true },
      ]
}

async function fetchArcgisLayer(layer: string): Promise<FeatureCollection> {
  const r = await fetch(`/api/arcgis/${layer}`)
  const json = await r.json()
  if (!r.ok) throw new Error(json.error ?? `HTTP ${r.status}`)
  return json
}

function formatSectorName(sectorId: string) {
  return sectorId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const MontgomeryMapInner = dynamic(
  () => import("@/components/map/montgomery-map-inner").then((m) => m.MontgomeryMapInner),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-lg" /> }
)

// Dynamically import layers so they only load when enabled
const CallsHeatmapLayer = dynamic(
  () => import("@/components/map/layers/calls-heatmap").then((m) => m.CallsHeatmapLayer),
  { ssr: false }
)
const StationsLayer = dynamic(
  () => import("@/components/map/layers/stations-layer").then((m) => m.StationsLayer),
  { ssr: false }
)
const PermitsLayer = dynamic(
  () => import("@/components/map/layers/permits-layer").then((m) => m.PermitsLayer),
  { ssr: false }
)
const SchoolsLayer = dynamic(
  () => import("@/components/map/layers/schools-layer").then((m) => m.SchoolsLayer),
  { ssr: false }
)
const BusinessOpportunitiesLayer = dynamic(
  () => import("@/components/map/layers/business-opportunities-layer").then((m) => m.BusinessOpportunitiesLayer),
  { ssr: false }
)
const JobsLayer = dynamic(
  () => import("@/components/map/layers/jobs-layer").then((m) => m.JobsLayer),
  { ssr: false }
)
const HealthScoresLayer = dynamic(
  () => import("@/components/map/layers/health-scores").then((m) => m.HealthScoresLayer),
  { ssr: false }
)
const HeritageLayer = dynamic(
  () => import("@/components/map/layers/heritage-layer").then((m) => m.HeritageLayer),
  { ssr: false }
)
const MilitaryLayer = dynamic(
  () => import("@/components/map/layers/military-layer").then((m) => m.MilitaryLayer),
  { ssr: false }
)

export default function MapPage() {
  const { isAdmin, isLoading: roleLoading } = useUserRole()
  const [layers, setLayers] = useState<MapLayer[]>(createDefaultLayers(false))
  const [panelOpen, setPanelOpen] = useState(true)

  const { data: sectors } = useQuery({ queryKey: ["sectors"], queryFn: fetchSectors })
  const { data: workforceData } = useWorkforceData()
  const { data: jobInsights } = useJobInsights()
  const { totalJobs } = useTotalJobs()
  const { data: callsData } = useQuery({
    queryKey: ["arcgis", "911-calls"],
    queryFn: () => fetchArcgisLayer("911-calls"),
    staleTime: 3600_000,
    retry: 1,
  })
  const { data: permitsData } = useQuery({
    queryKey: ["arcgis", "permits"],
    queryFn: () => fetchArcgisLayer("permits"),
    staleTime: 3600_000,
    retry: 1,
  })

  useEffect(() => {
    if (roleLoading) return
    setLayers((prev) => {
      const allowed = new Set(createDefaultLayers(isAdmin).map((layer) => layer.id))
      const defaults = createDefaultLayers(isAdmin)
      const byId = new Map(prev.map((layer) => [layer.id, layer]))

      // Keep existing toggles for shared layers and add/remove role-specific layers as needed.
      const next = defaults.map((layer) => {
        const existing = byId.get(layer.id)
        return existing ? { ...layer, enabled: existing.enabled } : layer
      })

      return next
    })
  }, [isAdmin, roleLoading])

  const toggleLayer = useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    )
  }, [])

  const enabled = (id: string) => layers.find((l) => l.id === id)?.enabled

  const fallbackOpenRoles = sectors?.reduce((sum, s) => sum + s.openRolesCount, 0) ?? 0
  const totalWorkers = sectors ? sectors.reduce((sum, sector) => sum + sector.employeeCount, 0) : 0
  const sectorNameById = useMemo(() => {
    return new Map((sectors ?? []).map((sector) => [sector.id, sector.name]))
  }, [sectors])

  const liveSectorSignals = useMemo(() => {
    const sectorStats = workforceData?.sectorStats ?? []
    if (sectorStats.length === 0) return []

    const maxJobs = Math.max(...sectorStats.map((stat) => stat.cityOpenJobs), 1)
    const maxDemand = Math.max(...sectorStats.map((stat) => stat.demandSignal ?? 0), 1)

    return sectorStats.map((stat) => {
      const jobsRatio = stat.cityOpenJobs / maxJobs
      const demandRatio = (stat.demandSignal ?? 0) / maxDemand
      const pressureScore = jobsRatio * 0.65 + demandRatio * 0.35
      const status = pressureScore >= 0.66 ? "critical" : pressureScore >= 0.4 ? "watch" : "stable"

      return {
        id: stat.sectorId,
        name: sectorNameById.get(stat.sectorId) ?? formatSectorName(stat.sectorId),
        cityOpenJobs: stat.cityOpenJobs,
        demandSignal: stat.demandSignal ?? 0,
        status,
        pressureScore,
      }
    })
  }, [sectorNameById, workforceData?.sectorStats])

  const liveCriticalSectors = useMemo(
    () => liveSectorSignals.filter((signal) => signal.status === "critical"),
    [liveSectorSignals]
  )
  const liveWatchSectors = useMemo(
    () => liveSectorSignals.filter((signal) => signal.status === "watch"),
    [liveSectorSignals]
  )

  const liveOpenRoles = useMemo(() => {
    if (totalJobs > 0) return totalJobs
    const fromWorkforce = workforceData?.sectorStats?.reduce((sum, stat) => sum + stat.cityOpenJobs, 0) ?? 0
    return fromWorkforce > 0 ? fromWorkforce : fallbackOpenRoles
  }, [fallbackOpenRoles, totalJobs, workforceData?.sectorStats])

  const liveCriticalRoles = useMemo(() => {
    const fromInsights = jobInsights?.insights?.criticalRolesCount ?? 0
    if (fromInsights > 0) return fromInsights
    const fromPressure = liveCriticalSectors.reduce((sum, sector) => sum + sector.cityOpenJobs, 0)
    if (fromPressure > 0) return fromPressure
    const publicSafety = workforceData?.sectorStats?.find((stat) => stat.sectorId === "public-safety")
    return publicSafety?.cityOpenJobs ?? 0
  }, [jobInsights?.insights?.criticalRolesCount, liveCriticalSectors, workforceData?.sectorStats])

  const risingSkills = useMemo(
    () => (jobInsights?.insights?.topSkills ?? []).filter((skill) => skill.growthSignal === "rising"),
    [jobInsights?.insights?.topSkills]
  )
  const liveTrainingGaps = useMemo(() => {
    if (risingSkills.length > 0) return risingSkills.length
    const topSkillCount = jobInsights?.insights?.topSkills?.length ?? 0
    return topSkillCount > 0 ? Math.min(topSkillCount, 8) : 0
  }, [jobInsights?.insights?.topSkills?.length, risingSkills.length])

  const workersMappedLabel = useMemo(() => {
    const populationBase = workforceData?.arcgisPopulationCount ?? 0
    if (populationBase > 0) return `${(populationBase / 1000).toFixed(0)}K`
    if (totalWorkers > 0) return `${(totalWorkers / 1000).toFixed(0)}K`
    return "—"
  }, [workforceData?.arcgisPopulationCount, totalWorkers])

  const activeLayerCount = layers.filter((layer) => layer.enabled).length
  const topDepartments = workforceData?.topDepartments.slice(0, 3) ?? []
  const standoutSkills = (risingSkills.length > 0 ? risingSkills : jobInsights?.insights?.topSkills ?? []).slice(0, 4)
  const liveCallsCount = callsData?.features?.length ?? workforceData?.arcgis911CallCount ?? 0
  const livePermitsCount = permitsData?.features?.length ?? workforceData?.arcgisPermitCount ?? 0
  const citySignals = useMemo(() => ([
    {
      label: "911 Calls",
      value: liveCallsCount > 0 ? liveCallsCount.toLocaleString("en-US") : "—",
      icon: RadioTower,
      tone: "text-red-600 dark:text-red-300",
      surface: "from-red-100/80 to-red-50/40 dark:from-red-950/40 dark:to-red-900/10",
    },
    {
      label: "Permits",
      value: livePermitsCount > 0 ? livePermitsCount.toLocaleString("en-US") : "—",
      icon: Building2,
      tone: "text-amber-700 dark:text-amber-300",
      surface: "from-amber-100/80 to-amber-50/40 dark:from-amber-950/40 dark:to-amber-900/10",
    },
    {
      label: "Open Jobs",
      value: liveOpenRoles.toLocaleString("en-US"),
      icon: Briefcase,
      tone: "text-emerald-700 dark:text-emerald-300",
      surface: "from-emerald-100/80 to-emerald-50/40 dark:from-emerald-950/40 dark:to-emerald-900/10",
    },
  ]), [liveCallsCount, livePermitsCount, liveOpenRoles])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card-strong card-hover-lift overflow-hidden rounded-[28px] border border-white/40 p-5 dark:border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="primary">
                    Live city intelligence
                  </Badge>
                  <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
                    {activeLayerCount} active layers
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Montgomery Map</h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Explore how workforce demand intersects with 911 activity, city hiring, permits, stations, heritage anchors, and neighborhood health across Montgomery.
                </p>
              </div>
              <MontgomeryFact className="max-w-2xl" />
            </div>

            {isAdmin && (
              <div className="grid min-w-[250px] flex-1 gap-3 sm:grid-cols-3 xl:max-w-[430px] xl:grid-cols-1">
                {citySignals.map((signal) => (
                  <div
                    key={signal.label}
                    className={cn(
                      "rounded-2xl border border-white/35 bg-gradient-to-br p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/10",
                      signal.surface
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("rounded-xl bg-white/70 p-2 shadow-sm dark:bg-white/8", signal.tone)}>
                        <signal.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{signal.label}</p>
                        <p className={cn("text-lg font-semibold leading-none", signal.tone)}>{signal.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="glass-panel card-hover-lift rounded-[28px] border border-white/35 p-4 dark:border-white/10">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">City workforce posture</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white/30 p-3 dark:bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Critical roles</p>
                  <p className="mt-1 text-xl font-semibold text-red-600 dark:text-red-300">{liveCriticalRoles}</p>
                </div>
                <div className="rounded-2xl bg-white/30 p-3 dark:bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Training gaps</p>
                  <p className="mt-1 text-xl font-semibold text-amber-700 dark:text-amber-300">{liveTrainingGaps}</p>
                </div>
                <div className="rounded-2xl bg-white/30 p-3 dark:bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Critical sectors</p>
                  <p className="mt-1 text-xl font-semibold">{liveCriticalSectors.length}</p>
                </div>
                <div className="rounded-2xl bg-white/30 p-3 dark:bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Workers mapped</p>
                  <p className="mt-1 text-xl font-semibold">{workersMappedLabel}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel card-hover-lift rounded-[28px] border border-white/35 p-4 dark:border-white/10">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">What stands out</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Top departments</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topDepartments.length > 0 ? topDepartments.map((dept) => (
                      <Badge
                        key={dept.department}
                        variant="outline"
                        className="border-white/35 bg-white/40 text-[10px] dark:border-white/10 dark:bg-white/5"
                      >
                        {dept.department} · {dept.openJobs}
                      </Badge>
                    )) : (
                      <span className="text-xs text-muted-foreground">Waiting for city department data.</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Rising skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {standoutSkills.length > 0 ? standoutSkills.map((skill) => (
                      <Badge
                        key={skill.name}
                        variant="primary"
                        className="text-[10px]"
                      >
                        {skill.name} · {skill.count}
                      </Badge>
                    )) : (
                      <span className="text-xs text-muted-foreground">Run a refresh to surface live skill demand.</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Live pressure signals</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="border-white/35 bg-white/40 text-[10px] dark:border-white/10 dark:bg-white/5">
                      911 calls · {liveCallsCount.toLocaleString("en-US")}
                    </Badge>
                    <Badge variant="outline" className="border-white/35 bg-white/40 text-[10px] dark:border-white/10 dark:bg-white/5">
                      Permits · {livePermitsCount.toLocaleString("en-US")}
                    </Badge>
                    <Badge variant="outline" className="border-white/35 bg-white/40 text-[10px] dark:border-white/10 dark:bg-white/5">
                      Open jobs · {liveOpenRoles.toLocaleString("en-US")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-white/35 bg-white/10 shadow-[0_24px_80px_rgba(87,73,53,0.14)] dark:border-white/10 dark:bg-black/10 h-[calc(100vh-12rem)]">
        <MapLayers layers={layers} onToggle={toggleLayer} />

        {/* Workforce Stats Panel */}
        {isAdmin && (
          <div className={cn(
            "absolute left-3 top-3 z-[1000] transition-all duration-200",
            panelOpen ? "w-64" : "w-8"
          )}>
            {panelOpen ? (
              <Card className="border-white/35 bg-card/90 shadow-[0_22px_46px_rgba(0,0,0,0.14)] backdrop-blur-xl dark:border-white/10">
                <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Workforce Intel
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-xl" onClick={() => setPanelOpen(false)}>
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                </div>
                <CardContent className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5 rounded-2xl bg-white/40 p-2.5 dark:bg-white/5">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> Open Roles
                      </p>
                      <p className="text-lg font-bold">{liveOpenRoles}</p>
                    </div>
                    <div className="space-y-0.5 rounded-2xl bg-white/40 p-2.5 dark:bg-white/5">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Critical Roles
                      </p>
                      <p className="text-lg font-bold text-pulse-critical">{liveCriticalRoles}</p>
                    </div>
                    <div className="space-y-0.5 rounded-2xl bg-white/40 p-2.5 dark:bg-white/5">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> Training Gaps
                      </p>
                      <p className="text-lg font-bold text-pulse-watch">{liveTrainingGaps}</p>
                    </div>
                    <div className="space-y-0.5 rounded-2xl bg-white/40 p-2.5 dark:bg-white/5">
                      <p className="text-[10px] text-muted-foreground">Total Workers</p>
                      <p className="text-lg font-bold">{workersMappedLabel}</p>
                    </div>
                  </div>

                  <div className="border-t border-border/70 pt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Active layers</p>
                      <Badge variant="primary" className="text-[10px]">
                        {activeLayerCount} on
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {layers.filter((layer) => layer.enabled).map((layer) => (
                        <span
                          key={layer.id}
                          className="rounded-full border border-white/35 bg-white/45 px-2 py-1 text-[10px] font-medium text-foreground/80 dark:border-white/10 dark:bg-white/5"
                        >
                          {layer.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border/70 pt-2 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Sector Breakdown</p>
                    {liveCriticalSectors.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-xl bg-red-50/70 px-2 py-1.5 text-xs dark:bg-red-950/20">
                        <span className="truncate">{s.name}</span>
                        <Badge variant="outline" className="text-[10px] text-red-600 border-red-300 dark:text-red-400 dark:border-red-700 ml-1">
                          {s.cityOpenJobs} open
                        </Badge>
                      </div>
                    ))}
                    {liveWatchSectors.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-xl bg-amber-50/70 px-2 py-1.5 text-xs dark:bg-amber-950/20">
                        <span className="truncate">{s.name}</span>
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700 ml-1">
                          {s.cityOpenJobs} open
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl border-white/35 bg-card/95 shadow-lg backdrop-blur"
                onClick={() => setPanelOpen(true)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}

        {isAdmin && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[1000] hidden xl:flex items-end justify-between gap-3">
            <div className="pointer-events-auto glass-panel flex max-w-[540px] flex-wrap items-center gap-2 rounded-2xl border border-white/35 bg-white/75 px-3 py-2 shadow-[0_18px_34px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-black/30">
              <span className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/55" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                Live city signals
              </span>
              <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] text-muted-foreground dark:bg-white/5">
                {liveCriticalSectors.length} critical sector{liveCriticalSectors.length === 1 ? "" : "s"}
              </span>
              <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] text-muted-foreground dark:bg-white/5">
                {liveWatchSectors.length} watch sector{liveWatchSectors.length === 1 ? "" : "s"}
              </span>
              <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] text-muted-foreground dark:bg-white/5">
                {topDepartments[0]?.department ?? "Department data loading"}
              </span>
            </div>

            <div className="pointer-events-auto glass-panel flex items-center gap-2 rounded-2xl border border-white/35 bg-white/75 px-3 py-2 text-[11px] text-muted-foreground shadow-[0_18px_34px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-black/30">
              <Layers3 className="h-3.5 w-3.5 text-primary" />
              Toggle layers to compare workforce pressure with place-based signals.
            </div>
          </div>
        )}

        <MontgomeryMapInner className="h-full w-full">
          {enabled("zones") && <HealthScoresLayer />}
          {enabled("calls") && <CallsHeatmapLayer />}
          {enabled("stations") && <StationsLayer />}
          {enabled("schools") && <SchoolsLayer />}
          {enabled("permits") && <PermitsLayer />}
          {enabled("business") && <BusinessOpportunitiesLayer />}
          {enabled("jobs") && <JobsLayer />}
          {enabled("heritage") && <HeritageLayer />}
          {enabled("military") && <MilitaryLayer />}
        </MontgomeryMapInner>
      </div>
    </div>
  )
}

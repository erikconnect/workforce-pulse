"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ExternalLink, AlertTriangle, BookOpen, MapPin, Briefcase, RadioTower, GraduationCap, Building2, Shield } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { fetchPulseSummary, fetchSectors } from "@/services"
import { useTotalJobs } from "@/hooks/use-total-jobs"

const MontgomeryMapInner = dynamic(
  () =>
    import("@/components/map/montgomery-map-inner").then(
      (mod) => mod.MontgomeryMapInner
    ),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-lg" /> }
)

const HealthScoresLayer = dynamic(
  () => import("@/components/map/layers/health-scores").then((m) => m.HealthScoresLayer),
  { ssr: false }
)

const JobsLayer = dynamic(
  () => import("@/components/map/layers/jobs-layer").then((m) => m.JobsLayer),
  { ssr: false }
)

const CallsHeatmapLayer = dynamic(
  () => import("@/components/map/layers/calls-heatmap").then((m) => m.CallsHeatmapLayer),
  { ssr: false }
)

const StationsLayer = dynamic(
  () => import("@/components/map/layers/stations-layer").then((m) => m.StationsLayer),
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

interface FeatureCollection {
  features?: Array<unknown>
}

export function DashboardMiniMap({ embedded = false }: { embedded?: boolean }) {
  const [layerFilters, setLayerFilters] = useState({
    jobs: true,
    calls: true,
    stations: true,
    schools: true,
    business: true,
  })
  const { data: summary } = useQuery({ queryKey: ["pulseSummary"], queryFn: fetchPulseSummary })
  const { data: sectors } = useQuery({ queryKey: ["sectors"], queryFn: fetchSectors })
  const { totalJobs } = useTotalJobs()
  const { data: callsData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "911-calls"],
    queryFn: () => fetch("/api/arcgis/911-calls").then((r) => r.json()),
    staleTime: 3600_000,
    retry: 1,
  })
  const { data: stationsData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "stations"],
    queryFn: () => fetch("/api/arcgis/stations").then((r) => r.json()),
    staleTime: 3600_000,
    retry: 1,
  })
  const { data: schoolsData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "education"],
    queryFn: () => fetch("/api/arcgis/education").then((r) => r.json()),
    staleTime: 3600_000,
    retry: 1,
  })
  const { data: permitsData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "permits"],
    queryFn: () => fetch("/api/arcgis/permits").then((r) => r.json()),
    staleTime: 3600_000,
    retry: 1,
  })

  const criticalCount = sectors?.filter((s) => s.status === "critical").length ?? 0
  const totalOpenRoles = totalJobs > 0 ? totalJobs : (sectors?.reduce((sum, s) => sum + s.openRolesCount, 0) ?? 0)
  const callsCount = callsData?.features?.length ?? 0
  const stationsCount = stationsData?.features?.length ?? 0
  const schoolsCount = schoolsData?.features?.length ?? 0
  const permitsCount = permitsData?.features?.length ?? 0

  function toggleLayer(layer: keyof typeof layerFilters) {
    setLayerFilters((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  const filterChips: Array<{ key: keyof typeof layerFilters; label: string }> = [
    { key: "jobs", label: "Jobs" },
    { key: "calls", label: "911" },
    { key: "schools", label: "Schools" },
    { key: "stations", label: "Fire / Police" },
    { key: "business", label: "Business Ops" },
  ]

  return (
    <div className={`relative overflow-hidden h-[320px] lg:h-[400px] bg-[#f0eee9] dark:bg-[#3a3a3a] ${embedded ? "rounded-[28px]" : "rounded-xl"}`}>
      <MontgomeryMapInner className="h-full w-full" zoom={11}>
        <HealthScoresLayer />
        {layerFilters.jobs ? <JobsLayer /> : null}
        {layerFilters.calls ? <CallsHeatmapLayer /> : null}
        {layerFilters.stations ? <StationsLayer /> : null}
        {layerFilters.schools ? <SchoolsLayer /> : null}
        {layerFilters.business ? <BusinessOpportunitiesLayer /> : null}
      </MontgomeryMapInner>
      <div className="absolute inset-0 dashboard-map-fade z-[450]" aria-hidden />

      <div className="absolute left-2 top-2 z-[1000] flex flex-wrap gap-1.5">
        {filterChips.map((chip) => {
          const active = layerFilters[chip.key]
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => toggleLayer(chip.key)}
              className={`rounded-full border px-2 py-1 text-[10px] font-medium backdrop-blur-sm transition-colors ${
                active
                  ? "border-white/50 bg-white/55 text-foreground"
                  : "border-white/35 bg-white/20 text-muted-foreground"
              }`}
              aria-pressed={active}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {/* Workforce legend overlay */}
      <div className="absolute bottom-2 left-2 z-[1000] rounded-lg bg-white/20 backdrop-blur-md px-2.5 py-2 text-[10px] border border-white/30 shadow-sm space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <AlertTriangle className="h-3 w-3 text-pulse-critical" />
          <span>{summary?.criticalRolesCount ?? 0} critical roles</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          <span>{summary?.trainingNeedsCount ?? 0} training gaps</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{totalOpenRoles} open roles across {criticalCount} critical sector{criticalCount !== 1 ? "s" : ""}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 border-t border-white/25">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            <span>{totalOpenRoles} jobs</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <RadioTower className="h-3 w-3" />
            <span>{callsCount} 911 calls</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>{stationsCount} stations</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <GraduationCap className="h-3 w-3" />
            <span>{schoolsCount} schools</span>
          </div>
          <div className="col-span-2 flex items-center gap-1 text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span>{permitsCount} permit signals for business opportunity</span>
          </div>
        </div>
      </div>

      <Link
        href="/map"
        className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1 rounded-lg bg-white/20 backdrop-blur-md px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm border border-white/30 hover:bg-white/30 transition-colors"
      >
        Full map <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  )
}

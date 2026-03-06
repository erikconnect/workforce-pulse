"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ExternalLink, AlertTriangle, BookOpen, MapPin } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { fetchPulseSummary, fetchSectors } from "@/services"

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

const HeritageLayer = dynamic(
  () => import("@/components/map/layers/heritage-layer").then((m) => m.HeritageLayer),
  { ssr: false }
)

const JobsLayer = dynamic(
  () => import("@/components/map/layers/jobs-layer").then((m) => m.JobsLayer),
  { ssr: false }
)

const StationsLayer = dynamic(
  () => import("@/components/map/layers/stations-layer").then((m) => m.StationsLayer),
  { ssr: false }
)

export function DashboardMiniMap() {
  const { data: summary } = useQuery({ queryKey: ["pulseSummary"], queryFn: fetchPulseSummary })
  const { data: sectors } = useQuery({ queryKey: ["sectors"], queryFn: fetchSectors })

  const criticalCount = sectors?.filter((s) => s.status === "critical").length ?? 0
  const totalOpenRoles = sectors?.reduce((sum, s) => sum + s.openRolesCount, 0) ?? 0

  return (
    <div className="relative rounded-lg overflow-hidden border border-border h-[280px]">
      <MontgomeryMapInner className="h-full w-full" zoom={11}>
        <HealthScoresLayer />
        <HeritageLayer />
        <JobsLayer />
        <StationsLayer />
      </MontgomeryMapInner>

      {/* Workforce legend overlay */}
      <div className="absolute bottom-2 left-2 z-[1000] rounded-md bg-card/90 backdrop-blur px-2.5 py-2 text-[10px] border border-border shadow-sm space-y-1">
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
      </div>

      <Link
        href="/map"
        className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1 rounded-md bg-card/90 backdrop-blur px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm border border-border hover:bg-card transition-colors"
      >
        Full map <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  )
}

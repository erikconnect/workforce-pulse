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

export function DashboardMiniMap({ embedded = false }: { embedded?: boolean }) {
  const { data: summary } = useQuery({ queryKey: ["pulseSummary"], queryFn: fetchPulseSummary })
  const { data: sectors } = useQuery({ queryKey: ["sectors"], queryFn: fetchSectors })

  const criticalCount = sectors?.filter((s) => s.status === "critical").length ?? 0
  const totalOpenRoles = sectors?.reduce((sum, s) => sum + s.openRolesCount, 0) ?? 0

  return (
    <div className={`relative overflow-hidden h-[320px] lg:h-[400px] bg-[#f0eee9] dark:bg-[#3a3a3a] ${embedded ? "rounded-[28px]" : "rounded-xl"}`}>
      <MontgomeryMapInner className="h-full w-full" zoom={11}>
        <HealthScoresLayer />
      </MontgomeryMapInner>
      <div className="absolute inset-0 dashboard-map-fade z-[450]" aria-hidden />

      {/* Workforce legend overlay */}
      <div className="absolute bottom-2 left-2 z-[1000] rounded-lg bg-white/20 backdrop-blur-md px-2.5 py-2 text-[10px] border border-white/30 shadow-sm space-y-1">
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
        className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1 rounded-lg bg-white/20 backdrop-blur-md px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm border border-white/30 hover:bg-white/30 transition-colors"
      >
        Full map <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  )
}

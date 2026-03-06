"use client"

import { useState, useCallback } from "react"
import { MapLayers, type MapLayer } from "@/components/map/map-layers"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { fetchSectors, fetchPulseSummary } from "@/services"
import { Briefcase, AlertTriangle, BookOpen, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

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

const DEFAULT_LAYERS: MapLayer[] = [
  { id: "zones", label: "Neighborhood Health", color: "#22c55e", enabled: true },
  { id: "calls", label: "911 Calls", color: "#ef4444", enabled: false },
  { id: "stations", label: "Stations", color: "#3b82f6", enabled: true },
  { id: "permits", label: "Permits", color: "#f59e0b", enabled: false },
  { id: "jobs", label: "City Jobs", color: "#8b5cf6", enabled: true },
  { id: "heritage", label: "Heritage Trail", color: "#b98646", enabled: true },
  { id: "military", label: "Military", color: "#005e95", enabled: true },
]

export default function MapPage() {
  const [layers, setLayers] = useState<MapLayer[]>(DEFAULT_LAYERS)
  const [panelOpen, setPanelOpen] = useState(true)

  const { data: sectors } = useQuery({ queryKey: ["sectors"], queryFn: fetchSectors })
  const { data: summary } = useQuery({ queryKey: ["pulseSummary"], queryFn: fetchPulseSummary })

  const toggleLayer = useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    )
  }, [])

  const enabled = (id: string) => layers.find((l) => l.id === id)?.enabled

  const totalOpenRoles = sectors?.reduce((sum, s) => sum + s.openRolesCount, 0) ?? 0
  const criticalSectors = sectors?.filter((s) => s.status === "critical") ?? []
  const watchSectors = sectors?.filter((s) => s.status === "watch") ?? []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Montgomery Map</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Interactive workforce intelligence map — explore 911 calls, jobs, stations, heritage sites, and neighborhood health.
        </p>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-border h-[calc(100vh-12rem)]">
        <MapLayers layers={layers} onToggle={toggleLayer} />

        {/* Workforce Stats Panel */}
        <div className={cn(
          "absolute top-3 left-3 z-[1000] transition-all duration-200",
          panelOpen ? "w-64" : "w-8"
        )}>
          {panelOpen ? (
            <Card className="bg-card/95 backdrop-blur shadow-lg border-border">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Workforce Intel
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPanelOpen(false)}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              </div>
              <CardContent className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Open Roles
                    </p>
                    <p className="text-lg font-bold">{totalOpenRoles}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Critical Roles
                    </p>
                    <p className="text-lg font-bold text-pulse-critical">{summary?.criticalRolesCount ?? 0}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Training Gaps
                    </p>
                    <p className="text-lg font-bold text-pulse-watch">{summary?.trainingNeedsCount ?? 0}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">Total Workers</p>
                    <p className="text-lg font-bold">{sectors ? (sectors.reduce((s, x) => s + x.employeeCount, 0) / 1000).toFixed(0) + "K" : "—"}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-2 space-y-1.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Sector Breakdown</p>
                  {criticalSectors.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs">
                      <span className="truncate">{s.name}</span>
                      <Badge variant="outline" className="text-[10px] text-red-600 border-red-300 dark:text-red-400 dark:border-red-700 ml-1">
                        {s.openRolesCount} open
                      </Badge>
                    </div>
                  ))}
                  {watchSectors.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs">
                      <span className="truncate">{s.name}</span>
                      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700 ml-1">
                        {s.openRolesCount} open
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
              className="h-8 w-8 bg-card/95 backdrop-blur shadow-lg"
              onClick={() => setPanelOpen(true)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <MontgomeryMapInner className="h-full w-full">
          {enabled("zones") && <HealthScoresLayer />}
          {enabled("calls") && <CallsHeatmapLayer />}
          {enabled("stations") && <StationsLayer />}
          {enabled("permits") && <PermitsLayer />}
          {enabled("jobs") && <JobsLayer />}
          {enabled("heritage") && <HeritageLayer />}
          {enabled("military") && <MilitaryLayer />}
        </MontgomeryMapInner>
      </div>
    </div>
  )
}

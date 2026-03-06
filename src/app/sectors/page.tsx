"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchSectors } from "@/services"
import { SectorCard } from "@/components/sectors/sector-card"
import { SectorCompare } from "@/components/sectors/sector-compare"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Eye, CheckCircle, GitCompareArrows, X, Users, Briefcase, ArrowUpDown } from "lucide-react"
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
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<PulseStatus | "all">("all")
  const [sortBy, setSortBy] = useState<"score" | "roles" | "name">("score")
  const isComparing = compareIds.length > 0

  const { data: sectors, isLoading, isError } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
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
  const stableCount = sectors?.filter((s) => s.status === "stable").length ?? 0
  const totalEmployees = sectors?.reduce((sum, s) => sum + s.employeeCount, 0) ?? 0
  const totalOpenRoles = sectors?.reduce((sum, s) => sum + s.openRolesCount, 0) ?? 0

  const filtered = useMemo(() => {
    if (!sectors) return []
    let result = statusFilter === "all" ? sectors : sectors.filter((s) => s.status === statusFilter)
    if (sortBy === "score") result = [...result].sort((a, b) => a.pulseScore - b.pulseScore)
    else if (sortBy === "roles") result = [...result].sort((a, b) => b.openRolesCount - a.openRolesCount)
    else result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [sectors, statusFilter, sortBy])

  const sectorA = sectors?.find((s) => s.id === compareIds[0])
  const sectorB = sectors?.find((s) => s.id === compareIds[1])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sectors</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor workforce health across all industry sectors.
          </p>
        </div>
        <Button
          variant={isComparing ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setCompareIds(isComparing ? [] : [])}
        >
          {isComparing ? (
            <>
              <X className="h-4 w-4" /> Exit Compare
            </>
          ) : (
            <>
              <GitCompareArrows className="h-4 w-4" /> Compare
            </>
          )}
        </Button>
      </div>

      {/* Summary stats */}
      {sectors && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Total Workforce</p>
                <p className="text-lg font-bold">{(totalEmployees / 1000).toFixed(0)}K</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Open Roles</p>
                <p className="text-lg font-bold">{totalOpenRoles.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-pulse-critical shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-lg font-bold text-pulse-critical">{criticalCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-pulse-watch shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Watch</p>
                <p className="text-lg font-bold text-pulse-watch">{watchCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-pulse-stable shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Stable</p>
                <p className="text-lg font-bold text-pulse-stable">{stableCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-md border border-input p-1">
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
            <SelectTrigger className="h-8 w-[150px] text-xs">
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

      {isComparing && (
        <p className="text-sm text-muted-foreground">
          {compareIds.length === 0
            ? "Select two sectors to compare."
            : compareIds.length === 1
              ? `Selected: ${sectorA?.name}. Pick one more.`
              : null}
        </p>
      )}

      {/* Comparison panel */}
      {sectorA && sectorB && (
        <div className="rounded-lg border bg-card p-6">
          <SectorCompare sectorA={sectorA} sectorB={sectorB} />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">Failed to load sectors. Please try again.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {isLoading
          ? [...Array(8)].map((_, i) => <SectorCardSkeleton key={i} />)
          : filtered.map((sector) => (
              <div
                key={sector.id}
                onClick={isComparing ? () => toggleCompare(sector.id) : undefined}
                className={
                  isComparing
                    ? `cursor-pointer rounded-lg ring-2 ${
                        compareIds.includes(sector.id)
                          ? "ring-civic-navy"
                          : "ring-transparent hover:ring-civic-navy/30"
                      }`
                    : ""
                }
              >
                <SectorCard sector={sector} />
              </div>
            ))}
      </div>
    </div>
  )
}

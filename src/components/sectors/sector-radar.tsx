"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Sector } from "@/services/types"

interface SectorRadarProps {
  sectors: Sector[]
}

function computeDimensions(sector: Sector) {
  // Normalize metrics to 0-100 scale for radar display
  const demandRaw = sector.kpis.find((k) => k.label.includes("Postings"))
  const demand = demandRaw ? Math.min(100, (Number(demandRaw.value) / 400) * 100) : 50

  const growthRaw = sector.kpis.find((k) => k.label.includes("WoW"))
  const growth = growthRaw ? Math.min(100, Math.abs(growthRaw.delta) * 5) : 20

  const criticality = 100 - sector.pulseScore // lower pulse = higher criticality

  const skillGapRaw = sector.kpis.find((k) => k.label.includes("Unmapped"))
  const skillGap = skillGapRaw ? Math.min(100, Number(skillGapRaw.value) * 8) : 30

  return { demand, growth, criticality, skillGap }
}

const STATUS_BADGE: Record<string, string> = {
  critical: "border-red-300 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300",
  watch: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300",
  stable: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300",
}

export function SectorRadar({ sectors }: SectorRadarProps) {
  if (!sectors.length) return null

  // Show top 4 most interesting sectors (2 critical/watch + 2 others)
  const critical = sectors.filter((s) => s.status === "critical").slice(0, 2)
  const others = sectors.filter((s) => s.status !== "critical").slice(0, 2)
  const displayed = [...critical, ...others].slice(0, 4)

  return (
    <div className="space-y-3">
      {displayed.map((sector) => {
        const d = computeDimensions(sector)
        const metrics = [
          { label: "Demand", value: Math.round(d.demand) },
          { label: "Growth", value: Math.round(d.growth) },
          { label: "Criticality", value: Math.round(d.criticality) },
          { label: "Skills Gap", value: Math.round(d.skillGap) },
        ]

        return (
          <div
            key={sector.id}
            className="rounded-2xl border border-white/35 bg-white/35 p-3 dark:border-white/10 dark:bg-white/5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{sector.name}</p>
                <p className="text-[11px] text-muted-foreground">Pulse {sector.pulseScore}</p>
              </div>
              <Badge variant="outline" className={STATUS_BADGE[sector.status]}>
                {sector.status}
              </Badge>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                    <span>{metric.label}</span>
                    <span>{metric.value}</span>
                  </div>
                  <Progress
                    value={metric.value}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

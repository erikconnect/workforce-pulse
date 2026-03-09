"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlertCircle, TrendingUp } from "lucide-react"
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

const METRIC_DESCRIPTIONS: Record<string, string> = {
  "Demand": "Number of job postings (higher = more hiring activity)",
  "Growth": "Week-over-week change in postings (higher = rapid growth)",
  "Criticality": "Inverse of pulse score (higher = more critical)",
  "Skills Gap": "Unmapped skills requiring training (higher = more gap)",
}

export function SectorRadar({ sectors }: SectorRadarProps) {
  if (!sectors.length) return null

  // Show top 4 most interesting sectors (2 critical/watch + 2 others)
  const critical = sectors.filter((s) => s.status === "critical").slice(0, 2)
  const others = sectors.filter((s) => s.status !== "critical").slice(0, 2)
  const displayed = [...critical, ...others].slice(0, 4)

  return (
    <div className="space-y-3">
      {displayed.map((sector, index) => {
        const d = computeDimensions(sector)
        const metrics = [
          { label: "Demand", value: Math.round(d.demand) },
          { label: "Growth", value: Math.round(d.growth) },
          { label: "Criticality", value: Math.round(d.criticality) },
          { label: "Skills Gap", value: Math.round(d.skillGap) },
        ]
        const isCritical = sector.status === "critical"

        return (
          <div
            key={sector.id}
            className="rounded-2xl border border-white/35 bg-white/35 p-3 dark:border-white/10 dark:bg-white/5 transition-all duration-300 hover:bg-white/45 dark:hover:bg-white/8 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="mb-3 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{sector.name}</p>
                  {isCritical && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Critical sector requiring immediate attention</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Pulse {sector.pulseScore}</p>
              </div>
              <Badge variant="outline" className={STATUS_BADGE[sector.status]} style={{ fontSize: "10px" }}>
                {sector.status}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {metrics.map((metric) => (
                <TooltipProvider key={metric.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1.5 cursor-help">
                        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span>{metric.label}</span>
                            {metric.value > 70 && <TrendingUp className="h-3 w-3 text-amber-500" />}
                          </span>
                          <span className="font-semibold text-foreground">{metric.value}</span>
                        </div>
                        <Progress
                          value={metric.value}
                          className="h-2"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">{METRIC_DESCRIPTIONS[metric.label]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

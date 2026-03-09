"use client"

import { Sector } from "@/services/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Trophy, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectorCompareProps {
  sectorA: Sector
  sectorB: Sector
}

interface Metric {
  label: string
  a: number
  b: number
}

function extractMetrics(sectorA: Sector, sectorB: Sector): Metric[] {
  const metrics: Metric[] = [
    { label: "Pulse Score", a: sectorA.pulseScore, b: sectorB.pulseScore },
    { label: "Open Roles", a: sectorA.openRolesCount, b: sectorB.openRolesCount },
    { label: "Employees", a: sectorA.employeeCount, b: sectorB.employeeCount },
  ]

  // Match KPIs by label between the two sectors
  for (const kpiA of sectorA.kpis) {
    const kpiB = sectorB.kpis.find((k) => k.label === kpiA.label)
    if (kpiB) {
      const valA = typeof kpiA.value === "number" ? kpiA.value : parseFloat(String(kpiA.value))
      const valB = typeof kpiB.value === "number" ? kpiB.value : parseFloat(String(kpiB.value))
      if (!isNaN(valA) && !isNaN(valB)) {
        metrics.push({ label: kpiA.label, a: valA, b: valB })
      }
    }
  }

  return metrics
}

const COLORS = {
  a: "#005e95",
  b: "#b98646",
}

export function SectorCompare({ sectorA, sectorB }: SectorCompareProps) {
  const metrics = extractMetrics(sectorA, sectorB)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4">
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 cursor-help">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS.a }}
                />
                <span className="font-semibold text-sm sm:text-base">{sectorA.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pulse Score: {sectorA.pulseScore} | Open Roles: {sectorA.openRolesCount} | Status: {sectorA.status}</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
        <span className="text-muted-foreground text-xs sm:text-sm font-medium">vs</span>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 cursor-help">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS.b }}
                />
                <span className="font-semibold text-sm sm:text-base">{sectorB.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pulse Score: {sectorB.pulseScore} | Open Roles: {sectorB.openRolesCount} | Status: {sectorB.status}</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72 w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%" minWidth={300}>
          <BarChart
            data={metrics}
            layout="vertical"
            margin={{ left: 80, right: 20, top: 5, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={75}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => [
                Number(value).toLocaleString(),
                name === "a" ? sectorA.name : sectorB.name,
              ]}
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
            />
            <Legend
              formatter={(value: string) =>
                value === "a" ? sectorA.name : sectorB.name
              }
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Bar dataKey="a" fill={COLORS.a} radius={[0, 4, 4, 0]} barSize={14}>
              {metrics.map((_, i) => (
                <Cell key={`a-${i}`} fill={COLORS.a} />
              ))}
            </Bar>
            <Bar dataKey="b" fill={COLORS.b} radius={[0, 4, 4, 0]} barSize={14}>
              {metrics.map((_, i) => (
                <Cell key={`b-${i}`} fill={COLORS.b} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metric-by-metric breakdown */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => {
          const diff = m.a - m.b
          const winner = diff > 0 ? "a" : diff < 0 ? "b" : null
          const winnerName = winner === "a" ? sectorA.name : winner === "b" ? sectorB.name : null
          const percentDiff = m.a !== 0 ? Math.abs((diff / m.a) * 100).toFixed(1) : "—"

          return (
            <TooltipProvider key={m.label}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <div
                    className="border rounded-lg p-3 space-y-1.5 bg-card cursor-help transition-all hover:bg-card/80 hover:shadow-md"
                  >
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em]">{m.label}</p>
                    <div className="flex items-end justify-between gap-2">
                      <span
                        className="text-base sm:text-lg font-bold"
                        style={{ color: COLORS.a }}
                      >
                        {m.a.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground mx-1">vs</span>
                      <span
                        className="text-base sm:text-lg font-bold"
                        style={{ color: COLORS.b }}
                      >
                        {m.b.toLocaleString()}
                      </span>
                    </div>
                    {winnerName && (
                      <Badge variant="secondary" className="gap-1 text-[9px] sm:text-[10px] w-fit mt-2">
                        <Trophy className="h-3 w-3" />
                        <span className="hidden xs:inline">{winnerName}</span> +{Math.abs(diff).toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{winnerName} leads by {percentDiff}%</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}

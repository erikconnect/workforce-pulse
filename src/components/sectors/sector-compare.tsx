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
import { Trophy } from "lucide-react"

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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS.a }}
          />
          <span className="font-semibold">{sectorA.name}</span>
        </div>
        <span className="text-muted-foreground text-sm font-medium">vs</span>
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS.b }}
          />
          <span className="font-semibold">{sectorB.name}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={metrics}
            layout="vertical"
            margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => [
                Number(value).toLocaleString(),
                name === "a" ? sectorA.name : sectorB.name,
              ]}
            />
            <Legend
              formatter={(value: string) =>
                value === "a" ? sectorA.name : sectorB.name
              }
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

          return (
            <div
              key={m.label}
              className="border rounded-lg p-3 space-y-1.5 bg-card"
            >
              <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
              <div className="flex items-end justify-between">
                <span
                  className="text-lg font-bold"
                  style={{ color: COLORS.a }}
                >
                  {m.a.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground mx-2">vs</span>
                <span
                  className="text-lg font-bold"
                  style={{ color: COLORS.b }}
                >
                  {m.b.toLocaleString()}
                </span>
              </div>
              {winnerName && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Trophy className="h-3 w-3" />
                  {winnerName} +{Math.abs(diff).toLocaleString()}
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

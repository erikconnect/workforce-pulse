"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
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

const STATUS_FILLS: Record<string, string> = {
  critical: "rgba(239, 68, 68, 0.25)",
  watch: "rgba(245, 158, 11, 0.2)",
  stable: "rgba(34, 197, 94, 0.15)",
}

const STATUS_STROKES: Record<string, string> = {
  critical: "#ef4444",
  watch: "#f59e0b",
  stable: "#22c55e",
}

export function SectorRadar({ sectors }: SectorRadarProps) {
  if (!sectors.length) return null

  // Shape data so each data point is a dimension, with sector names as keys
  const dimensions = ["Demand", "Growth", "Criticality", "Skills Gap"]
  const data = dimensions.map((dim) => {
    const row: Record<string, string | number> = { dimension: dim }
    sectors.forEach((s) => {
      const d = computeDimensions(s)
      const key = dim.toLowerCase().replace(" ", "")
      if (key === "demand") row[s.name] = d.demand
      else if (key === "growth") row[s.name] = d.growth
      else if (key === "criticality") row[s.name] = d.criticality
      else if (key === "skillsgap") row[s.name] = d.skillGap
    })
    return row
  })

  // Show top 4 most interesting sectors (2 critical/watch + 2 others)
  const critical = sectors.filter((s) => s.status === "critical").slice(0, 2)
  const others = sectors.filter((s) => s.status !== "critical").slice(0, 2)
  const displayed = [...critical, ...others].slice(0, 4)

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          {displayed.map((sector) => (
            <Radar
              key={sector.id}
              name={sector.name}
              dataKey={sector.name}
              stroke={STATUS_STROKES[sector.status]}
              fill={STATUS_FILLS[sector.status]}
              fillOpacity={0.6}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { PulseStatus } from "@/services/types"

interface ImpactGaugeProps {
  score: number // 0-100
  status: PulseStatus
  size?: number
  label?: string
  className?: string
}

export function ImpactGauge({
  score,
  status,
  size = 200,
  label,
  className,
}: ImpactGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const strokeWidth = size * 0.06
  const center = size / 2
  const radius = center - strokeWidth - 10
  // Arc spans 240 degrees (from 150° to 390°)
  const startAngle = 150
  const endAngle = 390
  const totalAngle = endAngle - startAngle

  function polarToCartesian(angle: number) {
    const rad = (angle * Math.PI) / 180
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    }
  }

  function describeArc(start: number, end: number) {
    const s = polarToCartesian(start)
    const e = polarToCartesian(end)
    const largeArc = end - start > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`
  }

  // Three zones: 0-40 red, 40-70 amber, 70-100 green
  const zones = [
    { start: 0, end: 40, color: "#ef4444" },
    { start: 40, end: 70, color: "#f59e0b" },
    { start: 70, end: 100, color: "#22c55e" },
  ]

  // Needle angle
  const needleAngle = startAngle + (animatedScore / 100) * totalAngle

  // Needle tip
  const needleLength = radius - 10
  const needleRad = (needleAngle * Math.PI) / 180
  const needleTip = {
    x: center + needleLength * Math.cos(needleRad),
    y: center + needleLength * Math.sin(needleRad),
  }

  const statusColors: Record<PulseStatus, string> = {
    critical: "text-red-500",
    watch: "text-amber-500",
    stable: "text-green-500",
  }

  const statusLabels: Record<PulseStatus, string> = {
    critical: "Critical",
    watch: "Watch",
    stable: "Stable",
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Zone arcs */}
        {zones.map((zone) => {
          const arcStart = startAngle + (zone.start / 100) * totalAngle
          const arcEnd = startAngle + (zone.end / 100) * totalAngle
          return (
            <path
              key={zone.start}
              d={describeArc(arcStart, arcEnd)}
              fill="none"
              stroke={zone.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={0.25}
            />
          )
        })}

        {/* Active arc up to score */}
        {animatedScore > 0 && (
          <path
            d={describeArc(startAngle, needleAngle)}
            fill="none"
            stroke={zones.find((z) => score <= z.end)?.color ?? "#22c55e"}
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
            style={{ transition: "d 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
        )}

        {/* Needle */}
        <line
          x1={center}
          y1={center}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="hsl(var(--foreground))"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{
            transition: "x2 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), y2 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* Center cap */}
        <circle cx={center} cy={center} r={6} fill="hsl(var(--foreground))" />
        <circle cx={center} cy={center} r={3} fill="hsl(var(--background))" />

        {/* Score labels */}
        <text
          x={polarToCartesian(startAngle).x - 5}
          y={polarToCartesian(startAngle).y + 15}
          textAnchor="middle"
          fontSize={10}
          fill="hsl(var(--muted-foreground))"
        >
          0
        </text>
        <text
          x={polarToCartesian(endAngle).x + 5}
          y={polarToCartesian(endAngle).y + 15}
          textAnchor="middle"
          fontSize={10}
          fill="hsl(var(--muted-foreground))"
        >
          100
        </text>
      </svg>

      <div className="flex flex-col items-center -mt-2">
        <span className={cn("text-3xl font-bold", statusColors[status])}>
          {animatedScore}
        </span>
        <span className={cn("text-sm font-medium", statusColors[status])}>
          {statusLabels[status]}
        </span>
        {label && (
          <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
        )}
      </div>
    </div>
  )
}

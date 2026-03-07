"use client"

import { cn } from "@/lib/utils"
import type { PulseStatus } from "@/services/types"

const STATUS_COLOR: Record<PulseStatus, string> = {
  critical: "#ef4444",
  watch: "#f59e0b",
  stable: "#22c55e",
}

interface SemicircleGaugeProps {
  score: number
  status: PulseStatus
  size?: number
  strokeWidth?: number
  className?: string
}

/** Semicircular gauge (180°) for sector cards — Montgomery V1 style */
export function SemicircleGauge({
  score,
  status,
  size = 56,
  strokeWidth = 6,
  className,
}: SemicircleGaugeProps) {
  const r = (size - strokeWidth) / 2
  const cx = size / 2
  const viewH = size * 0.55
  const cy = viewH - strokeWidth / 2
  const circumference = Math.PI * r
  const progress = Math.max(0, Math.min(100, score))
  const offset = circumference - (progress / 100) * circumference
  const color = STATUS_COLOR[status]
  const startX = cx - r
  const endX = cx + r

  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox={`0 0 ${size} ${size * 0.55}`}
      className={cn("transition-opacity", className)}
      aria-label={`Pulse score ${score}`}
    >
      {/* Track — bottom semicircle */}
      <path
        d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <path
        d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  )
}

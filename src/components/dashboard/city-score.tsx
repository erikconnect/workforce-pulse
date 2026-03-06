"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchSectors } from "@/services"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

function scoreColor(score: number): string {
  if (score < 40) return "#ef4444"
  if (score < 70) return "#f59e0b"
  return "#22c55e"
}

export function CityScore() {
  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  })

  if (!sectors) return null

  // Composite score based on sector health
  const stableCount = sectors.filter((s) => s.status === "stable").length
  const watchCount = sectors.filter((s) => s.status === "watch").length
  const total = sectors.length || 1
  const avgPulse = sectors.reduce((sum, s) => sum + s.pulseScore, 0) / total
  const healthRatio = ((stableCount * 1.0 + watchCount * 0.5) / total) * 100
  const compositeScore = Math.round(avgPulse * 0.6 + healthRatio * 0.4)
  const color = scoreColor(compositeScore)

  // SVG gauge (reuses impact-gauge pattern)
  const size = 120
  const cx = size / 2
  const cy = size / 2
  const r = 45
  const startAngle = 135
  const endAngle = 405
  const sweep = endAngle - startAngle
  const scoreAngle = startAngle + (compositeScore / 100) * sweep
  const circumference = (sweep / 360) * 2 * Math.PI * r
  const offset = circumference * (1 - compositeScore / 100)

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const needleTip = polarToCartesian(scoreAngle)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Montgomery Workforce Health
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.8}`}>
          {/* Background arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={8}
            strokeDasharray={`${circumference} 1000`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle - 90} ${cx} ${cy})`}
          />
          {/* Score arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={`${circumference} 1000`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(${startAngle - 90} ${cx} ${cy})`}
            className="transition-all duration-1000 ease-out"
          />
          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={3} fill={color} />
          {/* Score text */}
          <text
            x={cx}
            y={cy + r + 14}
            textAnchor="middle"
            className="text-[11px] fill-muted-foreground font-medium"
          >
            {compositeScore}/100
          </text>
        </svg>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>{stableCount} stable sectors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{watchCount} sectors on watch</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>{total - stableCount - watchCount} critical sectors</span>
          </div>
          <p className="text-muted-foreground pt-1">
            Avg. pulse: {avgPulse.toFixed(0)}/100
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

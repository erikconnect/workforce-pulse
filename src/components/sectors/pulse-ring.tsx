import { cn } from "@/lib/utils"
import type { PulseStatus } from "@/services/types"

interface PulseRingProps {
  score: number // 0–100
  status: PulseStatus
  size?: number // SVG size in px, default 80
  strokeWidth?: number
  className?: string
  animate?: boolean // enable heartbeat/breathe animation, default true
}

const STATUS_COLOR: Record<PulseStatus, string> = {
  critical: "#ef4444",
  watch: "#f59e0b",
  stable: "#22c55e",
}

const STATUS_ANIMATION: Record<PulseStatus, string> = {
  critical: "pulse-heartbeat",
  watch: "pulse-breathe",
  stable: "pulse-calm",
}

export function PulseRing({
  score,
  status,
  size = 80,
  strokeWidth = 7,
  className,
  animate = true,
}: PulseRingProps) {
  const center = size / 2
  const radius = center - strokeWidth
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, score))
  const offset = circumference - (progress / 100) * circumference
  const color = STATUS_COLOR[status]

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn(
        "rotate-[-90deg] transition-opacity hover:opacity-90",
        status === "critical" && "drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]",
        animate && STATUS_ANIMATION[status],
        className
      )}
      aria-label={`Pulse score ${score}`}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/30"
      />
      {/* Progress arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      {/* Center label — counter-rotate so text reads correctly */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(90, ${center}, ${center})`}
        style={{
          fontSize: size * 0.22,
          fontWeight: 700,
          fill: color,
        }}
      >
        {score}
      </text>
    </svg>
  )
}

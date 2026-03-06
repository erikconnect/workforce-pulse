import Link from "next/link"
import { Users, Briefcase, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, statusToColor, formatNumber, formatDelta } from "@/lib/utils"
import type { Sector } from "@/services/types"
import { PulseRing } from "./pulse-ring"
import { SparklineChart } from "./sparkline-chart"

interface SectorCardProps {
  sector: Sector
}

const STATUS_LABEL: Record<string, string> = {
  critical: "Critical",
  watch: "Watch",
  stable: "Stable",
}

const BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

const GLOW_CLASS: Record<string, string> = {
  critical: "glow-critical",
  watch: "glow-watch",
  stable: "glow-stable",
}

export function SectorCard({ sector }: SectorCardProps) {
  const isPublicSafety = sector.id === "public-safety"
  return (
    <Link href={`/sectors/${sector.id}`} className="block group">
      <Card
        className={cn(
          "h-full transition-all duration-200 card-hover-lift",
          GLOW_CLASS[sector.status],
          isPublicSafety && "ring-1 ring-red-200/60 ring-offset-2 ring-offset-background"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {sector.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {sector.description}
              </p>
            </div>
            <PulseRing score={sector.pulseScore} status={sector.status} size={64} strokeWidth={6} />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Badge
              className={cn("text-xs border font-medium", BADGE_CLASS[sector.status])}
            >
              {STATUS_LABEL[sector.status]}
            </Badge>
            {isPublicSafety && (
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                Critical Sector
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2">
            {sector.kpis.map((kpi) => (
              <div key={kpi.label} className="space-y-0.5">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{kpi.value}</span>
                  {kpi.delta !== 0 && (
                    <span
                      className={cn(
                        "text-xs",
                        statusToColor(kpi.status)
                      )}
                    >
                      {formatDelta(kpi.delta)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sparkline */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>7-day posting trend</span>
            </div>
            <SparklineChart data={sector.sparklineData} status={sector.status} height={36} />
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{formatNumber(sector.employeeCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              <span>{sector.openRolesCount} open</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

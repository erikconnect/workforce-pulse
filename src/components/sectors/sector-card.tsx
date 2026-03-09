"use client"

import Link from "next/link"
import { Users, TrendingUp, ArrowUpRight, GraduationCap, Clock3, Zap, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn, statusToColor, formatNumber, formatDelta } from "@/lib/utils"
import type { Sector } from "@/services/types"
import { SparklineChart } from "./sparkline-chart"

interface SectorCardProps {
  sector: Sector
  insights?: {
    avgTimeToFill: number
    readinessPct: number
    trainingPathways: number
    topSkills: string[]
    criticalRoleCount: number
  }
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

const STATUS_TONE: Record<string, string> = {
  critical: "text-red-600 dark:text-red-300",
  watch: "text-amber-700 dark:text-amber-300",
  stable: "text-emerald-700 dark:text-emerald-300",
}

export function SectorCard({ sector, insights }: SectorCardProps) {
  const isPublicSafety = sector.id === "public-safety"
  const wowChange = sector.kpis.find((kpi) => kpi.label === "WoW Change")
  const criticalRolesCount = insights?.criticalRoleCount ?? 0
  const gaugeX = 10 + (Math.max(0, Math.min(100, sector.pulseScore)) / 100) * 84
  
  const pulseStatusDescription = sector.status === "critical" 
    ? "High hiring pressure - immediate staffing needs"
    : sector.status === "watch"
    ? "Emerging hiring pressure - monitor closely"
    : "Stable hiring environment"

  return (
    <Link href={`/sectors/${sector.id}`} className="group block h-full">
      <Card
        className={cn(
          "h-full overflow-hidden border-white/35 bg-white/65 transition-all duration-300 card-hover-lift dark:border-white/10 dark:bg-white/5 hover:shadow-lg",
          GLOW_CLASS[sector.status],
          isPublicSafety && "ring-1 ring-red-200/60 ring-offset-2 ring-offset-background"
        )}
      >
        <CardHeader className="relative pb-3 sm:pb-2">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/35 to-transparent dark:from-white/5" aria-hidden />
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                {sector.name}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {sector.description}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="min-w-[86px] rounded-2xl bg-white/45 px-2.5 py-2 dark:bg-white/6 cursor-help transition-transform hover:scale-105">
                    <div className={cn("text-center text-[1.45rem] font-semibold leading-none tracking-[-0.04em]", STATUS_TONE[sector.status])}>
                      {sector.pulseScore}
                    </div>
                    <svg viewBox="0 0 104 18" className="mt-2 h-4 w-full" aria-hidden>
                      <rect x="10" y="6" width="28" height="5" rx="2.5" fill="#ef706c" opacity="0.92" />
                      <rect x="38" y="6" width="28" height="5" rx="2.5" fill="#f4de72" opacity="0.96" />
                      <rect x="66" y="6" width="28" height="5" rx="2.5" fill="#9ef4a7" opacity="0.96" />
                      <circle cx={gaugeX} cy="8.5" r="4" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="1.8" />
                    </svg>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  <p>Pulse Score: {pulseStatusDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={cn("text-xs border font-medium cursor-help", BADGE_CLASS[sector.status])}
                  >
                    {STATUS_LABEL[sector.status]}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{pulseStatusDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {criticalRolesCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="rounded-full bg-white/55 px-2 py-0.5 text-[10px] font-medium text-foreground/80 dark:bg-white/8 dark:text-white/75 cursor-help inline-flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {criticalRolesCount} priority
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{criticalRolesCount} critical roles need immediate fill</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isPublicSafety && (
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                Critical Sector
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {insights && (
            <div className="grid grid-cols-2 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-2xl bg-white/40 p-2.5 dark:bg-white/6 cursor-help transition-all hover:bg-white/50 dark:hover:bg-white/8">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock3 className="h-3 w-3" />
                        Fill time
                      </div>
                      <p className="mt-1 text-sm font-semibold">{insights.avgTimeToFill || "—"}d</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average time to fill critical roles in {sector.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-2xl bg-white/40 p-2.5 dark:bg-white/6 cursor-help transition-all hover:bg-white/50 dark:hover:bg-white/8">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <GraduationCap className="h-3 w-3" />
                        Training
                      </div>
                      <p className="mt-1 text-sm font-semibold">{insights.trainingPathways}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Available training programs for workers upskilling</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-2xl bg-white/35 p-2.5 dark:bg-white/5 cursor-help transition-all hover:bg-white/45 dark:hover:bg-white/8">
                    <p className="text-[10px] text-muted-foreground">Open Roles</p>
                    <p className="mt-1 text-sm font-semibold">{sector.openRolesCount}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current active job openings in {sector.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-2xl bg-white/35 p-2.5 dark:bg-white/5 cursor-help transition-all hover:bg-white/45 dark:hover:bg-white/8">
                    <p className="text-[10px] text-muted-foreground">WoW</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-sm font-semibold">{wowChange?.value ?? "0%"}</span>
                      {wowChange && wowChange.delta !== 0 && (
                        <span className={cn("text-xs", statusToColor(wowChange.status))}>
                          {formatDelta(wowChange.delta)}
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Week-over-week change in job postings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-2xl bg-white/35 p-2.5 dark:bg-white/5 cursor-help transition-all hover:bg-white/45 dark:hover:bg-white/8">
                    <p className="text-[10px] text-muted-foreground">Readiness</p>
                    <p className="mt-1 text-sm font-semibold">{insights?.readinessPct ?? 0}%</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>% of required skills with training available</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>7-day trend</span>
            </div>
            <div className="rounded-2xl bg-white/35 px-2 py-2 dark:bg-white/5 hover:bg-white/45 dark:hover:bg-white/8 transition-colors">
              <SparklineChart data={sector.sparklineData} status={sector.status} height={36} />
            </div>
          </div>

          {insights && insights.topSkills.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>Top Skills</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{insights.trainingPathways} pathways</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Training programs available in this sector</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-wrap gap-1">
                {insights.topSkills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/35 bg-white/55 px-2 py-1 text-[10px] font-medium text-foreground/85 transition-all duration-200 group-hover:border-primary/30 group-hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-white/80 hover:border-primary/60 hover:bg-white/70 dark:hover:bg-white/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer stats */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between border-t border-border/70 pt-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 flex-shrink-0" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">{formatNumber(sector.employeeCount)} workforce</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total employees in {sector.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="inline-flex items-center gap-1 font-medium text-foreground transition-colors group-hover:text-primary text-[11px]">
              <span>View details</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

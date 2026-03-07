"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Sector } from "@/services/types"

const STATUS_COPY: Record<string, string> = {
  critical: "Critical",
  watch: "Watch",
  stable: "Stable",
}

const STATUS_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300",
  watch: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  stable: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
}

const STATUS_TONE: Record<string, string> = {
  critical: "text-red-600 dark:text-red-300",
  watch: "text-amber-700 dark:text-amber-300",
  stable: "text-emerald-700 dark:text-emerald-300",
}

interface SectorStripCardProps {
  sector: Sector
}

export function SectorStripCard({ sector }: SectorStripCardProps) {
  const wowChange = sector.kpis.find((kpi) => kpi.label === "WoW Change")?.value ?? "0%"
  const criticalRoles = sector.kpis.find((kpi) => kpi.label === "Critical Roles")?.value ?? 0
  const isPositiveChange = !String(wowChange).trim().startsWith("-")
  const wowChangeClass = isPositiveChange
    ? "text-emerald-600 dark:text-emerald-300"
    : "text-red-600 dark:text-red-300"
  const gaugeX = 12 + (Math.max(0, Math.min(100, sector.pulseScore)) / 100) * 96

  return (
    <Link href={`/sectors/${sector.id}`} className="group block h-full">
      <div className="glass-panel card-hover-lift h-full rounded-3xl p-5 transition-all duration-200">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {sector.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                {sector.description}
              </p>
            </div>
            <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold", STATUS_BADGE[sector.status])}>
              {STATUS_COPY[sector.status]}
            </span>
          </div>

          <div className="mt-4 grid flex-1 grid-cols-[116px_minmax(0,1fr)] gap-4">
            <div className="flex flex-col justify-center rounded-[24px] bg-white/20 px-3 py-3 dark:bg-white/5">
              <div className={cn("text-center text-[2rem] font-semibold leading-none tracking-[-0.04em]", STATUS_TONE[sector.status])}>
                {sector.pulseScore}
              </div>
              <div className="mt-1 text-center text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Pulse Score
              </div>
              <div className="mt-3">
                <svg viewBox="0 0 120 26" className="h-8 w-full" aria-hidden>
                  <rect x="12" y="10" width="32" height="6" rx="3" fill="#ef706c" opacity="0.9" />
                  <rect x="44" y="10" width="32" height="6" rx="3" fill="#f4de72" opacity="0.95" />
                  <rect x="76" y="10" width="32" height="6" rx="3" fill="#9ef4a7" opacity="0.95" />
                  <circle cx={gaugeX} cy="13" r="4.5" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="2" />
                </svg>
                <div className="mt-1 flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/18 p-3 dark:bg-black/10">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Open Roles</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{sector.openRolesCount}</p>
              </div>

              <div className="rounded-2xl bg-white/18 p-3 dark:bg-black/10">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Critical Roles</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{criticalRoles}</p>
              </div>

              <div className="rounded-2xl bg-white/18 p-3 dark:bg-black/10">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">WoW Change</p>
                <p className={cn("mt-1 inline-flex items-center gap-1 text-lg font-semibold", wowChangeClass)}>
                  <ArrowUpRight className={cn("h-3.5 w-3.5", !isPositiveChange && "rotate-90")} />
                  {wowChange}
                </p>
              </div>

              <div className="rounded-2xl bg-white/18 p-3 dark:bg-black/10">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Workforce</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {sector.employeeCount.toLocaleString("en-US")}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">workers in sector</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/20 pt-3 text-[10px] text-muted-foreground dark:border-white/10">
            <span className="font-medium text-foreground">{STATUS_COPY[sector.status]} priority</span>
            <span className="inline-flex items-center gap-1 transition-colors group-hover:text-foreground">
              View sector
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

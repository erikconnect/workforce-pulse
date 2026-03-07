"use client"

import { useMemo, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Phone, GraduationCap, CheckCircle2, MoreVertical, Trophy, Flame, Target } from "lucide-react"
import { fetchMissionMemberProfile, fetchPulseSummary, fetchSectors } from "@/services"
import { SectorStripCard } from "@/components/sectors/sector-strip-card"
import { useWorkforceData } from "@/hooks/use-workforce-data"
import { useJobInsights } from "@/hooks/use-job-insights"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CityProfile } from "@/components/dashboard/city-profile"
import { CityScore } from "@/components/dashboard/city-score"
import { DashboardMiniMap } from "@/components/dashboard/dashboard-mini-map"
import { LiveScrapeCompact } from "@/components/dashboard/live-scrape"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type MiniSignalDatum = {
  label: string
  shortLabel: string
  value: number
}

type TimelinePoint = {
  date: string
  value: number
}

function toMiniLabel(label: string) {
  const cleaned = label.replace(/[^a-zA-Z0-9\s]/g, "").trim()
  if (!cleaned) return "N/A"
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase()
  return words.slice(0, 2).map((word) => word[0]).join("").slice(0, 4).toUpperCase()
}

function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function MiniTimelineChart({
  points,
  tone,
  emptyLabel,
  footerLabel,
}: {
  points: TimelinePoint[]
  tone: "critical" | "watch"
  emptyLabel: string
  footerLabel: string
}) {
  if (points.length === 0) {
    return (
      <div className="flex h-[72px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-black/[0.02] px-3 text-center text-[10px] text-muted-foreground dark:bg-white/[0.03]">
        {emptyLabel}
      </div>
    )
  }

  const width = 260
  const height = 84
  const padX = 10
  const padTop = 8
  const padBottom = 20
  const innerHeight = height - padTop - padBottom
  const max = Math.max(...points.map((point) => point.value), 1)
  const toneStroke = tone === "critical" ? "#ef4444" : "#d19a47"
  const toneFill = tone === "critical" ? "rgba(239,68,68,0.18)" : "rgba(209,154,71,0.18)"
  const stepX = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0
  const coords = points.map((point, index) => {
    const x = padX + index * stepX
    const y = padTop + innerHeight - (point.value / max) * innerHeight
    return { ...point, x, y }
  })
  const linePath = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x ?? padX} ${height - padBottom} L ${coords[0]?.x ?? padX} ${height - padBottom} Z`
  const latest = points[points.length - 1]
  const previous = points[points.length - 2]
  const delta = latest && previous ? latest.value - previous.value : 0

  return (
    <div className="rounded-2xl border border-white/25 bg-white/20 px-2.5 py-2 dark:border-white/10 dark:bg-black/10">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[84px] w-full"
        role="img"
        aria-label="Live timeline chart"
      >
        <line x1={padX} y1={height - padBottom} x2={width - padX} y2={height - padBottom} stroke="currentColor" opacity="0.12" />
        <line x1={padX} y1={padTop} x2={width - padX} y2={padTop} stroke="currentColor" opacity="0.06" />
        <path d={areaPath} fill={toneFill} />
        <path d={linePath} fill="none" stroke={toneStroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((point, index) => (
          <g key={`${point.date}-${index}`}>
            <title>{`${formatShortDate(point.date)}: ${point.value}`}</title>
            <circle
              cx={point.x}
              cy={point.y}
              r={index === coords.length - 1 ? 3.5 : 2.5}
              fill={toneStroke}
              opacity={index === coords.length - 1 ? 1 : 0.75}
            />
          </g>
        ))}
        <text x={padX} y={height - 4} fontSize="8" fontWeight="600" fill="currentColor" opacity="0.62">
          {formatShortDate(points[0].date)}
        </text>
        <text x={width - padX} y={height - 4} textAnchor="end" fontSize="8" fontWeight="600" fill="currentColor" opacity="0.62">
          {formatShortDate(points[points.length - 1].date)}
        </text>
      </svg>
      <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
        <span>{footerLabel}</span>
        <span className={cn("font-semibold", delta > 0 ? "text-foreground" : delta < 0 ? "text-muted-foreground" : "text-muted-foreground")}>
          Latest: {latest?.value ?? 0}
        </span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const userName = "City Admin"
  const [greeting, setGreeting] = useState("Hello")
  
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["pulseSummary"],
    queryFn: fetchPulseSummary,
  })

  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  })
  const { data: missionMemberProfile } = useQuery({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })

  const { data: workforceData } = useWorkforceData()
  const { data: jobInsights } = useJobInsights()

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const greetingText =
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
    setGreeting(greetingText)
  }, [])

  const criticalRolesCount = useMemo(() => {
    if (jobInsights?.insights?.criticalRolesCount != null) return jobInsights.insights.criticalRolesCount
    const ps = workforceData?.sectorStats?.find((s) => s.sectorId === "public-safety")
    if (ps?.cityOpenJobs != null) return ps.cityOpenJobs
    return summary?.criticalRolesCount ?? 0
  }, [jobInsights?.insights?.criticalRolesCount, workforceData?.sectorStats, summary?.criticalRolesCount])
  const criticalRoleSignals = useMemo<TimelinePoint[]>(() => {
    const series = jobInsights?.insights?.sectorTimelines?.find((timeline) => timeline.sectorId === "public-safety")?.series ?? []
    return series.slice(-14).map((point) => ({
      date: point.date,
      value: point.count,
    }))
  }, [jobInsights?.insights?.sectorTimelines])
  const trainingNeedSignals = useMemo<TimelinePoint[]>(() => {
    return (jobInsights?.insights?.totalSkillMentionsByDay ?? []).slice(-14).map((point) => ({
      date: point.date,
      value: point.count,
    }))
  }, [jobInsights?.insights?.totalSkillMentionsByDay])
  const leadingTrainingSkills = useMemo<MiniSignalDatum[]>(() => {
    return (jobInsights?.insights?.topSkills ?? [])
      .slice(0, 3)
      .map((skill) => ({
        label: skill.name,
        shortLabel: toMiniLabel(skill.name),
        value: skill.count,
      }))
  }, [jobInsights?.insights?.topSkills])

  const sectorsOrdered = useMemo(() => {
    if (!sectors) return []
    const publicSafety = sectors.find((s) => s.id === "public-safety")
    const rest = sectors.filter((s) => s.id !== "public-safety")
    return publicSafety ? [publicSafety, ...rest] : sectors
  }, [sectors])

  const topSectors = useMemo(() => {
    const priority: Record<string, number> = { critical: 0, watch: 1, stable: 2 }
    return [...sectorsOrdered]
      .sort((a, b) => (priority[a.status] ?? 2) - (priority[b.status] ?? 2))
      .slice(0, 4)
  }, [sectorsOrdered])
  const statusMix = useMemo(() => {
    const total = sectors?.length ?? 0
    const stable = sectors?.filter((sector) => sector.status === "stable").length ?? 0
    const watch = sectors?.filter((sector) => sector.status === "watch").length ?? 0
    const critical = sectors?.filter((sector) => sector.status === "critical").length ?? 0
    const stabilityIndex = total === 0 ? 0 : Math.round((((stable * 1 + watch * 0.62 + critical * 0.28) / total) * 100) * 10) / 10

    return {
      total,
      stable,
      watch,
      critical,
      stabilityIndex,
      stablePct: total === 0 ? 0 : Math.round((stable / total) * 100),
      watchPct: total === 0 ? 0 : Math.round((watch / total) * 100),
      criticalPct: total === 0 ? 0 : Math.round((critical / total) * 100),
    }
  }, [sectors])
  const checkInPreview = useMemo(() => {
    const streak = summary?.checkInStreak ?? 0
    const completedToday = summary?.checkInCompleted ?? false
    // When completed today: show streak (1–5). When not: show prior streak only, max 4 (today unfilled)
    const activeCount = completedToday ? Math.min(5, Math.max(1, streak)) : Math.min(4, Math.max(0, streak))
    return Array.from({ length: 5 }, (_, index) => index < activeCount)
  }, [summary?.checkInCompleted, summary?.checkInStreak])

  const criticalRolesCaption =
    criticalRolesCount > 0
      ? "Dispatch, patrol and emergency response roles are driving current pressure."
      : "No urgent public safety hiring pressure detected right now."
  const trainingNeedsCaption =
    (summary?.trainingNeedsCount ?? 0) > 0
      ? "Training gaps are concentrated in certifications, field readiness and onboarding."
      : "Training demand is stable across the current hiring mix."

  return (
    <div className="space-y-6">
      <div className="space-y-4 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
        <div className="mb-6">
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground" suppressHydrationWarning>
            {greeting}, {userName}
          </h1>
        </div>
        <CityProfile />
      </div>

      <div data-tour="kpi-cards" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cn("glass-panel rounded-3xl p-6 tile-critical opacity-0 animate-fade-in-up animate-stagger-1 transition-all relative overflow-hidden bg-gradient-to-br from-red-50/50 to-pink-100/30 dark:from-red-900/20 dark:to-pink-900/10")} style={{ animationFillMode: "forwards" }}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-sm">Critical Roles</h3>
            <button className="text-muted-foreground hover:text-foreground" aria-label="More options"><MoreVertical className="h-5 w-5" /></button>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 text-red-500 dark:text-red-400">
            <Phone className="h-5 w-5" />
          </div>
          {(summaryLoading && !workforceData && !jobInsights) ? (
            <Skeleton className="h-9 w-16 relative" />
          ) : (
            <>
              <div className="mb-2 flex items-end gap-2">
                <span className="text-2xl font-bold"><AnimatedCounter value={criticalRolesCount} /></span>
                <span className="text-sm font-medium mb-1">critical Roles</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4 leading-tight">{criticalRolesCaption}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <span>Public safety postings trend</span>
                  <span>Last 14 days</span>
                </div>
                <MiniTimelineChart
                  points={criticalRoleSignals}
                  tone="critical"
                  emptyLabel="Waiting for public safety posting history."
                  footerLabel="Bright Data, JobAps, and federal feeds"
                />
              </div>
            </>
          )}
        </div>

        <div className={cn("glass-panel rounded-3xl p-6 opacity-0 animate-fade-in-up animate-stagger-2 transition-all relative overflow-hidden")} style={{ animationFillMode: "forwards" }}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-sm">Training Needs</h3>
            <button className="text-muted-foreground hover:text-foreground" aria-label="More options"><MoreVertical className="h-5 w-5" /></button>
          </div>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          {summaryLoading ? (
            <Skeleton className="h-9 w-16 relative" />
          ) : (
            <>
              <div className="mb-2 flex items-end gap-2">
                <span className="text-2xl font-bold"><AnimatedCounter value={summary?.trainingNeedsCount ?? 0} />+</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4 leading-tight">{trainingNeedsCaption}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <span>Skill demand trend</span>
                  <span>Last 14 days</span>
                </div>
                <MiniTimelineChart
                  points={trainingNeedSignals}
                  tone="watch"
                  emptyLabel="Run a live job refresh to populate skill demand."
                  footerLabel="Daily extracted skill mentions from live postings"
                />
                {leadingTrainingSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {leadingTrainingSkills.map((skill) => (
                      <span
                        key={skill.label}
                        className="rounded-full bg-amber-100/80 px-2 py-1 text-[10px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      >
                        {skill.label} · {skill.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className={cn("glass-panel rounded-3xl p-6 opacity-0 animate-fade-in-up animate-stagger-2 transition-all relative overflow-hidden bg-gradient-to-br from-green-50/50 via-yellow-50/30 to-red-50/50 dark:from-green-900/10 dark:via-yellow-900/10 dark:to-red-900/10")} style={{ animationFillMode: "forwards" }}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-sm">Overall Status</h3>
            <button className="text-muted-foreground hover:text-foreground" aria-label="More options"><MoreVertical className="h-5 w-5" /></button>
          </div>
          {summaryLoading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <>
              <div className="mb-1">
                <span className="text-3xl font-bold">{statusMix.stabilityIndex}%</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4 leading-tight">
                Sector stability mix across active workforce systems.
              </p>
              <div className="space-y-3 rounded-2xl bg-white/35 p-3 dark:bg-black/15">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-medium">
                    <span className="text-green-700 dark:text-green-300">Stable</span>
                    <span>{statusMix.stablePct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-300 to-green-500" style={{ width: `${statusMix.stablePct}%` }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-medium">
                    <span className="text-amber-700 dark:text-amber-300">Watch</span>
                    <span>{statusMix.watchPct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400" style={{ width: `${statusMix.watchPct}%` }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-medium">
                    <span className="text-red-700 dark:text-red-300">Critical</span>
                    <span>{statusMix.criticalPct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-300 to-rose-500" style={{ width: `${statusMix.criticalPct}%` }} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="glass-panel rounded-3xl p-6 opacity-0 animate-fade-in-up animate-stagger-3 transition-all relative overflow-hidden" style={{ animationFillMode: "forwards" }}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-sm">Check-In Streak</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          {summaryLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <>
              <p className="text-[11px] text-muted-foreground mb-4 leading-tight">
                Daily check-ins keep the pulse current, improve trend accuracy, and preserve your streak.
              </p>
              {missionMemberProfile && (
                <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">Mission progress</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{missionMemberProfile.points} pts</p>
                    </div>
                    <div className="rounded-xl bg-white/60 px-2.5 py-1.5 text-right dark:bg-white/10">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Level</p>
                      <p className="text-sm font-semibold">{missionMemberProfile.level}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                    <div className="rounded-xl bg-white/55 px-2.5 py-2 dark:bg-white/10">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Trophy className="h-3 w-3 text-primary" />
                        Points
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">{missionMemberProfile.points}</p>
                    </div>
                    <div className="rounded-xl bg-white/55 px-2.5 py-2 dark:bg-white/10">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Flame className="h-3 w-3 text-amber-500" />
                        Streak
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">{missionMemberProfile.streak}</p>
                    </div>
                    <div className="rounded-xl bg-white/55 px-2.5 py-2 dark:bg-white/10">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="h-3 w-3 text-sky-500" />
                        Missions
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">{missionMemberProfile.activeMissionCount}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
                    Check-ins and mission execution now work together: keep the pulse updated daily while earning points by moving workforce missions forward.
                  </p>
                </div>
              )}
              <div className="flex justify-between items-end mt-4">
                {[1, 2, 3, 4, 5].map((d) => {
                  const filled = checkInPreview[d - 1]
                  const isToday = d === 5
                  return (
                    <div key={d} className="flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "w-5 h-10 rounded-full transition-all",
                          filled
                            ? "bg-primary/75 shadow-[0_6px_14px_rgba(209,154,71,0.24)]"
                            : "bg-black/5 dark:bg-black/40 shadow-inner",
                          isToday && !filled && "border border-dashed border-primary/45 bg-transparent"
                        )}
                      />
                      <span className={cn("text-[10px] text-muted-foreground", isToday && "text-primary font-semibold")}>{d}</span>
                    </div>
                  )
                })}
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
                One check-in per calendar day. Missing a day breaks the run, and past or future dates cannot be submitted.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mb-8 opacity-0 animate-fade-in-up animate-stagger-3" style={{ animationFillMode: "forwards" }}>
        <div className="glass-panel rounded-[30px] p-4 md:p-5">
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1.55fr_0.9fr]">
            <DashboardMiniMap embedded />
            <div className="px-1 py-1 lg:h-[400px]">
              <CityScore embedded />
            </div>
          </div>
          <div className="mt-4">
            <LiveScrapeCompact />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch opacity-0 animate-fade-in-up animate-stagger-4" style={{ animationFillMode: "forwards" }}>
        <div data-tour="sector-strip" className="lg:col-span-2 space-y-4 order-2 lg:order-1 lg:min-h-[404px]">
          <h2 className="font-semibold text-lg">Sectors at a Glance</h2>
          <div className="grid grid-cols-2 gap-4">
            {topSectors.map((sector) => (
              <SectorStripCard key={sector.id} sector={sector} />
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:min-h-[404px]">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

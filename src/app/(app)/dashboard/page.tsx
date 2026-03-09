"use client"

import { useMemo, useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Phone, GraduationCap, CheckCircle2, Target } from "lucide-react"
import { fetchMissionMemberProfile, fetchPulseSummary, fetchSectors, submitDailyCheckIn } from "@/services"
import { SectorStripCard } from "@/components/sectors/sector-strip-card"
import { useWorkforceData } from "@/hooks/use-workforce-data"
import { useJobInsights } from "@/hooks/use-job-insights"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CityProfile } from "@/components/dashboard/city-profile"
import { CityScore } from "@/components/dashboard/city-score"
import { DashboardMiniMap } from "@/components/dashboard/dashboard-mini-map"
import { LiveScrapeCompact } from "@/components/dashboard/live-scrape"
import { DashboardSignalCard } from "@/components/dashboard/signal-card"
import { JobInsightsCards } from "@/components/dashboard/job-insights-cards"
import { MontgomeryCityBadge } from "@/components/branding/montgomery-city-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { computeCompositeScore } from "@/lib/workforce-health"
import { useUserRole } from "@/hooks/use-user-role"
import { CitizenDashboard } from "@/components/dashboard/citizen-dashboard"
import type { Sector } from "@/services/types"

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

function seriesDelta(points: TimelinePoint[]) {
  if (points.length < 2) return 0
  const latest = points[points.length - 1]?.value ?? 0
  const previous = points[points.length - 2]?.value ?? 0
  return latest - previous
}

function formatTrendValue(delta: number, noun: string) {
  if (delta === 0) return `No change in ${noun}`
  return `${delta > 0 ? "+" : ""}${delta} ${noun}`
}

function formatStatusLabel(status?: string) {
  if (!status) return "Watch"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatRefreshLabel(value?: string) {
  if (!value) return "Awaiting refresh"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatSectorName(sectorId: string) {
  return sectorId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
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
  const { isCitizen, isLoading: roleLoading } = useUserRole()

  if (roleLoading) {
    return (
      <div className="space-y-6 pb-10">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (isCitizen) return <CitizenDashboard />

  return <AdminDashboard />
}

function AdminDashboard() {
  const STREAK_DAYS = 7
  const userName = "City Admin"
  const [greeting, setGreeting] = useState("Hello")
  const queryClient = useQueryClient()
  
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
  const checkInMutation = useMutation({
    mutationFn: submitDailyCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pulseSummary"] })
      queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
    },
  })

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const greetingText =
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
    setGreeting(greetingText)
  }, [])

  const liveSectors = useMemo<Sector[]>(() => {
    const baseline = sectors ?? []
    const byId = new Map(baseline.map((sector) => [sector.id, sector]))
    const sectorStats = workforceData?.sectorStats ?? []
    if (sectorStats.length === 0) return baseline

    const maxJobs = Math.max(...sectorStats.map((stat) => stat.cityOpenJobs), 1)
    const maxDemand = Math.max(...sectorStats.map((stat) => stat.demandSignal ?? 0), 1)

    return sectorStats.map((stat) => {
      const base = byId.get(stat.sectorId)
      const jobsRatio = stat.cityOpenJobs / maxJobs
      const demandRatio = (stat.demandSignal ?? 0) / maxDemand
      const pulseScore = Math.round(20 + (jobsRatio * 0.62 + demandRatio * 0.38) * 80)
      const status = pulseScore >= 70 ? "critical" : pulseScore >= 45 ? "watch" : "stable"

      return {
        id: stat.sectorId,
        name: base?.name ?? formatSectorName(stat.sectorId),
        pulseScore,
        status,
        kpis: [
          {
            label: "Open roles",
            value: stat.cityOpenJobs,
            delta: 0,
            status,
          },
          {
            label: "Demand signal",
            value: stat.demandSignal ?? 0,
            delta: 0,
            status,
          },
        ],
        sparklineData:
          base?.sparklineData ??
          [
            Math.max(12, Math.round(pulseScore * 0.72)),
            Math.max(12, Math.round(pulseScore * 0.78)),
            Math.max(12, Math.round(pulseScore * 0.84)),
            Math.max(12, Math.round(pulseScore * 0.9)),
            Math.max(12, Math.round(pulseScore * 0.96)),
            pulseScore,
          ],
        employeeCount: base?.employeeCount ?? 0,
        openRolesCount: stat.cityOpenJobs,
        description: base?.description ?? `Live workforce signal for ${formatSectorName(stat.sectorId)}.`,
      }
    })
  }, [sectors, workforceData?.sectorStats])

  const effectiveSectors = useMemo(() => {
    return liveSectors.length > 0 ? liveSectors : (sectors ?? [])
  }, [liveSectors, sectors])

  const sectorTimelineSummary = useMemo(() => {
    const timelines = jobInsights?.insights?.sectorTimelines ?? []
    if (timelines.length === 0) return [] as Array<{
      sectorId: string
      name: string
      series: Array<{ date: string; count: number }>
      last7: number
      previous7: number
      last14: number
      wowDelta: number
      status: "critical" | "watch" | "stable"
    }>

    return timelines
      .map((timeline) => {
        const series = Array.isArray(timeline.series) ? timeline.series : []
        const last7 = series.slice(-7).reduce((sum, point) => sum + point.count, 0)
        const previous7 = series.slice(-14, -7).reduce((sum, point) => sum + point.count, 0)
        const last14 = series.slice(-14).reduce((sum, point) => sum + point.count, 0)
        const wowDelta = previous7 > 0 ? Math.round(((last7 - previous7) / previous7) * 100) : (last7 > 0 ? 100 : 0)
        const status: "critical" | "watch" | "stable" = last14 >= 20 ? "critical" : last14 >= 8 ? "watch" : "stable"
        return {
          sectorId: timeline.sectorId,
          name: effectiveSectors.find((sector) => sector.id === timeline.sectorId)?.name ?? formatSectorName(timeline.sectorId),
          series,
          last7,
          previous7,
          last14,
          wowDelta,
          status,
        }
      })
      .sort((left, right) => right.last14 - left.last14)
  }, [effectiveSectors, jobInsights?.insights?.sectorTimelines])

  const criticalRolesCount = useMemo(() => {
    if (sectorTimelineSummary.length > 0) {
      const sumCritical = sectorTimelineSummary
        .filter((sector) => sector.status === "critical")
        .reduce((sum, sector) => sum + sector.last14, 0)
      if (sumCritical > 0) return sumCritical
      return sectorTimelineSummary[0]?.last14 ?? 0
    }
    if (jobInsights?.insights?.criticalRolesCount != null) return jobInsights.insights.criticalRolesCount
    const criticalOpenings = effectiveSectors
      .filter((sector) => sector.status === "critical")
      .reduce((sum, sector) => sum + sector.openRolesCount, 0)
    if (criticalOpenings > 0) return criticalOpenings
    const ps = workforceData?.sectorStats?.find((s) => s.sectorId === "public-safety")
    return ps?.cityOpenJobs ?? 0
  }, [effectiveSectors, jobInsights?.insights?.criticalRolesCount, sectorTimelineSummary, workforceData?.sectorStats])
  const criticalRoleSignals = useMemo<TimelinePoint[]>(() => {
    const selectedSectorId =
      sectorTimelineSummary.find((sector) => sector.status === "critical")?.sectorId
      ?? sectorTimelineSummary[0]?.sectorId
      ?? "public-safety"
    const series = jobInsights?.insights?.sectorTimelines?.find((timeline) => timeline.sectorId === selectedSectorId)?.series ?? []
    return series.slice(-14).map((point) => ({
      date: point.date,
      value: point.count,
    }))
  }, [jobInsights?.insights?.sectorTimelines, sectorTimelineSummary])
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

  const liveTrainingNeedsCount = useMemo(() => {
    const risingSkills = (jobInsights?.insights?.topSkills ?? []).filter((skill) => skill.growthSignal === "rising")
    if (risingSkills.length > 0) return risingSkills.length
    const allSkills = jobInsights?.insights?.topSkills?.length ?? 0
    return allSkills > 0 ? Math.min(allSkills, 8) : 0
  }, [jobInsights?.insights?.topSkills])

  const sectorsOrdered = useMemo(() => {
    if (!effectiveSectors || effectiveSectors.length === 0) return []
    const publicSafety = effectiveSectors.find((s) => s.id === "public-safety")
    const rest = effectiveSectors.filter((s) => s.id !== "public-safety")
    return publicSafety ? [publicSafety, ...rest] : effectiveSectors
  }, [effectiveSectors])
  const topPressureSector = useMemo(() => {
    if (sectorsOrdered.length === 0) return null
    const priority: Record<string, number> = { critical: 0, watch: 1, stable: 2 }
    return [...sectorsOrdered].sort((left, right) => {
      const statusDelta = (priority[left.status] ?? 2) - (priority[right.status] ?? 2)
      if (statusDelta !== 0) return statusDelta
      return right.openRolesCount - left.openRolesCount
    })[0] ?? null
  }, [sectorsOrdered])
  const topPressureSectorFromPostings = useMemo(() => {
    if (sectorTimelineSummary.length === 0) return null
    const top = sectorTimelineSummary[0]
    if (!top) return null
    return {
      sectorId: top.sectorId,
      name: top.name,
      openRoles: top.last14,
      status: top.status,
    }
  }, [sectorTimelineSummary])
  const strongestSector = useMemo(() => {
    if (!effectiveSectors || effectiveSectors.length === 0) return null
    return [...effectiveSectors].sort((left, right) => right.pulseScore - left.pulseScore)[0] ?? null
  }, [effectiveSectors])
  const weakestSector = useMemo(() => {
    if (!effectiveSectors || effectiveSectors.length === 0) return null
    return [...effectiveSectors].sort((left, right) => left.pulseScore - right.pulseScore)[0] ?? null
  }, [effectiveSectors])
  const compositeScore = useMemo(() => {
    if (!effectiveSectors || effectiveSectors.length === 0) return null
    return computeCompositeScore(effectiveSectors)
  }, [effectiveSectors])

  const topSectors = useMemo(() => {
    if (sectorTimelineSummary.length === 0) {
      const priority: Record<string, number> = { critical: 0, watch: 1, stable: 2 }
      return [...sectorsOrdered]
        .sort((a, b) => (priority[a.status] ?? 2) - (priority[b.status] ?? 2))
        .slice(0, 4)
    }

    const byId = new Map(effectiveSectors.map((sector) => [sector.id, sector]))
    const maxLast7 = Math.max(...sectorTimelineSummary.map((sector) => sector.last7), 1)

    const sectorsFromPostedDate = sectorTimelineSummary
      .map((timeline) => {
        const base = byId.get(timeline.sectorId)
        const last7 = timeline.last7
        const wowDelta = timeline.wowDelta
        const pulseScore = Math.min(100, Math.max(8, Math.round((last7 / maxLast7) * 100)))
        const status: "critical" | "watch" | "stable" = timeline.status
        const criticalRoles = status === "critical" ? last7 : 0

        return {
          id: timeline.sectorId,
          name: timeline.name,
          pulseScore,
          status,
          kpis: [
            {
              label: "Postings (7d)",
              value: last7,
              delta: wowDelta,
              status,
            },
            {
              label: "WoW Change",
              value: wowDelta,
              delta: wowDelta,
              status: (wowDelta > 10 ? "critical" : wowDelta > 0 ? "watch" : "stable") as "critical" | "watch" | "stable",
            },
            {
              label: "Critical Roles",
              value: criticalRoles,
              delta: 0,
              status,
            },
          ],
          sparklineData: timeline.series.slice(-7).map((point) => point.count),
          employeeCount: base?.employeeCount ?? 0,
          openRolesCount: last7,
          description: base?.description ?? `Posted-date trend for ${formatSectorName(timeline.sectorId)}.`,
        }
      })

    const priority: Record<string, number> = { critical: 0, watch: 1, stable: 2 }
    return sectorsFromPostedDate
      .sort((left, right) => {
        const statusDelta = (priority[left.status] ?? 2) - (priority[right.status] ?? 2)
        if (statusDelta !== 0) return statusDelta
        return right.openRolesCount - left.openRolesCount
      })
      .slice(0, 4)
  }, [effectiveSectors, sectorTimelineSummary, sectorsOrdered])
  const statusMix = useMemo(() => {
    const total = effectiveSectors?.length ?? 0
    const stable = effectiveSectors?.filter((sector) => sector.status === "stable").length ?? 0
    const watch = effectiveSectors?.filter((sector) => sector.status === "watch").length ?? 0
    const critical = effectiveSectors?.filter((sector) => sector.status === "critical").length ?? 0
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
  }, [effectiveSectors])
  const checkInPreview = useMemo(() => {
    const streak = summary?.checkInStreak ?? 0
    const completedToday = summary?.checkInCompleted ?? false
    // When completed today: show streak (1–7). When not: show prior streak only, max 6 (today unfilled)
    const activeCount = completedToday
      ? Math.min(STREAK_DAYS, Math.max(1, streak))
      : Math.min(STREAK_DAYS - 1, Math.max(0, streak))
    return Array.from({ length: STREAK_DAYS }, (_, index) => index < activeCount)
  }, [STREAK_DAYS, summary?.checkInCompleted, summary?.checkInStreak])
  const criticalRolesDelta = useMemo(() => seriesDelta(criticalRoleSignals), [criticalRoleSignals])
  const trainingNeedsDelta = useMemo(() => seriesDelta(trainingNeedSignals), [trainingNeedSignals])
  const trainingFocusChips = useMemo(() => {
    const prominentSkills = leadingTrainingSkills.map((skill) => `${skill.label} · ${skill.value}`)
    if (prominentSkills.length > 0) return prominentSkills
    return (summary?.fastestRisingSkills ?? []).slice(0, 3)
  }, [leadingTrainingSkills, summary?.fastestRisingSkills])
  const latestTrainingMentions = trainingNeedSignals[trainingNeedSignals.length - 1]?.value ?? 0
  const refreshLabel = formatRefreshLabel(jobInsights?.insights?.lastUpdated)
  const nextStreakMilestone = useMemo(() => {
    const streak = summary?.checkInStreak ?? 0
    return Math.max(7, Math.ceil((streak + 1) / 7) * 7)
  }, [summary?.checkInStreak])
  const streakProgress = useMemo(() => {
    const streak = summary?.checkInStreak ?? 0
    return Math.min(100, Math.round((streak / nextStreakMilestone) * 100))
  }, [nextStreakMilestone, summary?.checkInStreak])

  const criticalRolesCaption =
    criticalRolesCount > 0
      ? "Dispatch, patrol and emergency response roles are driving current pressure."
      : "No urgent public safety hiring pressure detected right now."
  const trainingNeedsCaption =
    liveTrainingNeedsCount > 0
      ? "Training gaps are concentrated in certifications, field readiness and onboarding."
      : "Training demand is stable across the current hiring mix."

  const liveSystemStatus: "critical" | "watch" | "stable" =
    (compositeScore?.compositeScore ?? 0) >= 70
      ? "stable"
      : (compositeScore?.compositeScore ?? 0) >= 45
        ? "watch"
        : "critical"

  const liveMetricsLoading = !workforceData && !jobInsights && effectiveSectors.length === 0
  const criticalOpenRolesValue =
    (topPressureSectorFromPostings?.openRoles ?? 0) > 0
      ? topPressureSectorFromPostings?.openRoles ?? 0
      : (topPressureSector?.openRolesCount ?? 0) > 0
      ? topPressureSector?.openRolesCount ?? 0
      : criticalRolesCount > 0
        ? criticalRolesCount
        : workforceData?.cityJobsTotal ?? 0

  return (
    <div className="space-y-6">
      <div className="space-y-4 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight text-foreground" suppressHydrationWarning>
              {greeting}, {userName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Workforce conditions anchored to Montgomery&apos;s local operating context.
            </p>
          </div>
          <MontgomeryCityBadge size="md" tone="muted" className="hidden shrink-0 opacity-90 md:inline-flex" />
        </div>
        <CityProfile />
      </div>

      {/* 4 KPI Cards - Critical Metrics */}
      <div data-tour="kpi-cards" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 opacity-0 animate-fade-in-up animate-stagger-1" style={{ animationFillMode: "forwards" }}>
        <DashboardSignalCard
          tone="critical"
          eyebrow="Priority coverage"
          title="Critical Roles"
          status={criticalRolesDelta > 0 ? "Escalating" : criticalRolesDelta < 0 ? "Cooling" : "Holding"}
          icon={Phone}
          value={liveMetricsLoading ? <Skeleton className="h-9 w-16" /> : <AnimatedCounter value={criticalRolesCount} />}
          suffix="roles"
          description={criticalRolesCaption}
          stats={[
            {
              label: "Hot sector",
              value: topPressureSectorFromPostings?.name ?? topPressureSector?.name ?? "Public Safety",
              tone:
                topPressureSectorFromPostings?.status === "stable"
                  ? "stable"
                  : topPressureSectorFromPostings?.status === "critical"
                    ? "critical"
                    : topPressureSector?.status === "stable"
                      ? "stable"
                      : topPressureSector?.status === "critical"
                        ? "critical"
                        : "watch",
            },
            {
              label: "Open roles",
              value: criticalOpenRolesValue.toLocaleString("en-US"),
            },
            {
              label: "14-day shift",
              value: formatTrendValue(criticalRolesDelta, "roles"),
              tone: criticalRolesDelta > 0 ? "critical" : criticalRolesDelta < 0 ? "stable" : "neutral",
            },
          ]}
          action={{ label: "Review hiring gaps", href: "/jobs" }}
          className="opacity-0 animate-fade-in-up animate-stagger-1 transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span>Public safety posting pressure</span>
              <span>Last 14 days</span>
            </div>
            <MiniTimelineChart
              points={criticalRoleSignals}
              tone="critical"
              emptyLabel="Waiting for public safety posting history."
              footerLabel="Bright Data, JobAps, and federal feeds"
            />
          </div>
        </DashboardSignalCard>

        <DashboardSignalCard
          tone="watch"
          eyebrow="Capability watch"
          title="Training Needs"
          status={trainingNeedsDelta > 0 ? "Demand rising" : trainingNeedsDelta < 0 ? "Cooling" : "Steady demand"}
          icon={GraduationCap}
          value={liveMetricsLoading ? <Skeleton className="h-9 w-20" /> : <><AnimatedCounter value={liveTrainingNeedsCount} />+</>}
          description={trainingNeedsCaption}
          stats={[
            {
              label: "Lead skill",
              value: leadingTrainingSkills[0]?.label ?? summary?.fastestRisingSkills?.[0] ?? "Awaiting data",
              tone: "watch",
            },
            {
              label: "Latest mentions",
              value: latestTrainingMentions.toLocaleString("en-US"),
            },
            {
              label: "Updated",
              value: refreshLabel,
            },
          ]}
          chips={trainingFocusChips}
          action={{ label: "Open skill planning", href: "/skills" }}
          className="opacity-0 animate-fade-in-up animate-stagger-2 transition-all"
        >
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
          </div>
        </DashboardSignalCard>

        <DashboardSignalCard
          tone={liveSystemStatus === "critical" ? "critical" : liveSystemStatus === "stable" ? "stable" : "watch"}
          eyebrow="System balance"
          title="Overall Status"
          status={formatStatusLabel(liveSystemStatus)}
          icon={Target}
          value={liveMetricsLoading ? <Skeleton className="h-9 w-20" /> : `${statusMix.stabilityIndex}%`}
          suffix="stability"
          description="Sector stability mix across active workforce systems, weighted by live pulse health." 
          stats={[
            {
              label: "Avg pulse",
              value: compositeScore ? compositeScore.avgPulse.toFixed(1) : "--",
              tone: liveSystemStatus === "critical" ? "critical" : liveSystemStatus === "stable" ? "stable" : "watch",
            },
            {
              label: "Strongest",
              value: strongestSector?.name ?? "No sector data",
              tone: "stable",
            },
            {
              label: "Needs focus",
              value: weakestSector?.name ?? "No sector data",
              tone: weakestSector?.status === "critical" ? "critical" : weakestSector?.status === "stable" ? "stable" : "watch",
            },
          ]}
          action={{ label: "Inspect sector mix", href: "/sectors" }}
          className="opacity-0 animate-fade-in-up animate-stagger-2 transition-all"
        >
          <div className="space-y-3 rounded-2xl border border-white/25 bg-white/35 p-3 dark:border-white/10 dark:bg-black/15">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {statusMix.total} sectors tracked
            </div>
            <div className="space-y-2.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span className="text-emerald-700 dark:text-emerald-300">Stable</span>
                  <span>{statusMix.stablePct}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500" style={{ width: `${statusMix.stablePct}%` }} />
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
          </div>
        </DashboardSignalCard>

        <DashboardSignalCard
          tone={summary?.checkInCompleted ? "stable" : "watch"}
          eyebrow="Daily workflow"
          title="Check-In Streak"
          status={summary?.checkInCompleted ? "Checked in today" : "Action needed"}
          icon={CheckCircle2}
          value={summaryLoading ? <Skeleton className="h-9 w-16" /> : <AnimatedCounter value={summary?.checkInStreak ?? 0} />}
          suffix="days"
          description={
            summary?.checkInCompleted
              ? "Today’s pulse is locked in. Keep the streak going tomorrow to preserve trend continuity."
              : "Daily check-ins keep the pulse current, improve trend accuracy, and preserve your streak."
          }
          stats={[
            {
              label: "Level",
              value: missionMemberProfile ? `Lv. ${missionMemberProfile.level}` : "--",
            },
            {
              label: "Points",
              value: missionMemberProfile ? missionMemberProfile.points.toLocaleString("en-US") : "--",
              tone: "stable",
            },
            {
              label: "Active missions",
              value: missionMemberProfile?.activeMissionCount ?? 0,
            },
          ]}
          action={{
            label: summary?.checkInCompleted ? "Checked in today" : "Submit daily check-in",
            onClick: () => checkInMutation.mutate(),
            disabled: summaryLoading || checkInMutation.isPending || summary?.checkInCompleted,
            loading: checkInMutation.isPending,
          }}
          className="opacity-0 animate-fade-in-up animate-stagger-3 transition-all"
        >
          <div className="rounded-2xl border border-white/25 bg-white/35 p-3 dark:border-white/10 dark:bg-black/15">
            <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span>Next milestone</span>
              <span>{summary?.checkInStreak ?? 0}/{nextStreakMilestone} days</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-amber-400" style={{ width: `${streakProgress}%` }} />
            </div>
            <div className="mt-4 flex justify-between items-end">
              {Array.from({ length: STREAK_DAYS }, (_, i) => i + 1).map((day) => {
                const filled = checkInPreview[day - 1]
                const isToday = day === STREAK_DAYS
                return (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "h-10 w-5 rounded-full transition-all",
                        filled
                          ? "bg-primary/75 shadow-[0_6px_14px_rgba(0,93,122,0.24)]"
                          : "bg-black/5 shadow-inner dark:bg-black/40",
                        isToday && !filled && "border border-dashed border-primary/45 bg-transparent",
                      )}
                    />
                    <span className={cn("text-[10px] text-muted-foreground", isToday && "font-semibold text-primary")}>{day}</span>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
              One check-in per calendar day. Missing a day breaks the run, and past or future dates cannot be submitted.
            </p>
            {checkInMutation.isError ? (
              <p className="mt-3 rounded-xl border border-red-200/70 bg-red-50/85 px-3 py-2 text-[11px] text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {checkInMutation.error instanceof Error ? checkInMutation.error.message : "Check-in could not be completed."}
              </p>
            ) : null}
          </div>
        </DashboardSignalCard>
      </div>

      {/* Job Insights & Recommendations */}
      <div className="opacity-0 animate-fade-in-up animate-stagger-2" style={{ animationFillMode: "forwards" }}>
        <JobInsightsCards />
      </div>

      <div className="mb-8 opacity-0 animate-fade-in-up animate-stagger-3" style={{ animationFillMode: "forwards" }}>
        <div className="glass-panel rounded-[30px] p-4 md:p-5">
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1.55fr_0.9fr]">
            <DashboardMiniMap embedded />
            <div className="px-1 py-1 lg:h-[400px]">
              <CityScore embedded sectorsOverride={effectiveSectors} />
            </div>
          </div>
          <div className="mt-8 lg:mt-10">
            <LiveScrapeCompact />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch opacity-0 animate-fade-in-up animate-stagger-4" style={{ animationFillMode: "forwards" }}>
        <div data-tour="sector-strip" className="lg:col-span-2 space-y-4 order-2 lg:order-1 lg:min-h-[404px]">
          <h2 className="font-semibold text-lg">Sectors at a Glance</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {topSectors.map((sector) => (
              <SectorStripCard key={sector.id} sector={sector} />
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:min-h-[404px] min-w-0 space-y-4">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, BookOpen, CheckCircle2, Zap, ChevronRight, Building2, RefreshCw, MapPin } from "lucide-react"
import { fetchPulseSummary, fetchSectors, runAggregate } from "@/services"
import { SectorStripCard } from "@/components/sectors/sector-strip-card"
import { useWorkforceData } from "@/hooks/use-workforce-data"
import { useJobInsights } from "@/hooks/use-job-insights"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { InsightCards } from "@/components/dashboard/insight-cards"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CityProfile } from "@/components/dashboard/city-profile"
import { LiveScrape } from "@/components/dashboard/live-scrape"
import { CityScore } from "@/components/dashboard/city-score"
import { DataSource } from "@/components/dashboard/data-source"
import { MontgomeryFact } from "@/components/dashboard/montgomery-fact"
import { DashboardMiniMap } from "@/components/dashboard/dashboard-mini-map"
import { generateInsights } from "@/lib/insight-generator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STATUS_COLOR_CLASS: Record<string, string> = {
  critical: "text-pulse-critical",
  watch: "text-pulse-watch",
  stable: "text-pulse-stable",
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
  watch: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  stable: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
}

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["pulseSummary"],
    queryFn: fetchPulseSummary,
  })

  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  })

  const { data: workforceData } = useWorkforceData()
  const { data: jobInsights } = useJobInsights()
  const queryClient = useQueryClient()
  const aggregateMutation = useMutation({
    mutationFn: () => runAggregate(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-insights"] })
    },
  })

  const criticalRolesCount = useMemo(() => {
    if (jobInsights?.insights?.criticalRolesCount != null) return jobInsights.insights.criticalRolesCount
    const ps = workforceData?.sectorStats?.find((s) => s.sectorId === "public-safety")
    if (ps?.cityOpenJobs != null) return ps.cityOpenJobs
    return summary?.criticalRolesCount ?? 0
  }, [jobInsights?.insights?.criticalRolesCount, workforceData?.sectorStats, summary?.criticalRolesCount])

  const fastestRisingSkills = useMemo(() => {
    if (jobInsights?.insights?.topSkills?.length) {
      return jobInsights.insights.topSkills.slice(0, 8).map((s) => s.name)
    }
    return summary?.fastestRisingSkills ?? []
  }, [jobInsights?.insights?.topSkills, summary?.fastestRisingSkills])

  const sectorsOrdered = useMemo(() => {
    if (!sectors) return []
    const publicSafety = sectors.find((s) => s.id === "public-safety")
    const rest = sectors.filter((s) => s.id !== "public-safety")
    return publicSafety ? [publicSafety, ...rest] : sectors
  }, [sectors])

  const insights = useMemo(() => {
    if (!sectorsOrdered.length) return []
    return generateInsights(sectorsOrdered)
  }, [sectorsOrdered])

  // Limit sectors to top 4 by urgency (critical first, then watch, then stable)
  const topSectors = useMemo(() => {
    const priority: Record<string, number> = { critical: 0, watch: 1, stable: 2 }
    return [...sectorsOrdered]
      .sort((a, b) => (priority[a.status] ?? 2) - (priority[b.status] ?? 2))
      .slice(0, 4)
  }, [sectorsOrdered])

  // Limit skills to 6
  const topSkills = useMemo(() => fastestRisingSkills.slice(0, 6), [fastestRisingSkills])

  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-6">
      {/* Hero greeting + City Profile */}
      <div className="space-y-4 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {greeting}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here is what is happening across Montgomery&apos;s workforce today.
          </p>
        </div>
        <CityProfile />
      </div>

      {/* KPI cards */}
      <div data-tour="kpi-cards" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="tile-critical card-shadow opacity-0 animate-fade-in-up animate-stagger-1 transition-shadow hover:shadow-lg" style={{ animationFillMode: "forwards" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-pulse-critical" />
              Critical Roles
              <span className="ml-1 rounded bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                Public Safety
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(summaryLoading && !workforceData && !jobInsights) ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <AnimatedCounter value={criticalRolesCount} className="text-2xl font-bold text-pulse-critical" />
                <p className="text-xs text-muted-foreground mt-1">Unfilled for 30+ days</p>
                <DataSource source="jobaps" />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="tile-watch card-shadow opacity-0 animate-fade-in-up animate-stagger-2 transition-shadow hover:shadow-lg" style={{ animationFillMode: "forwards" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Training Needs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <AnimatedCounter value={summary?.trainingNeedsCount ?? 0} className="text-2xl font-bold" />
                <p className="text-xs text-muted-foreground mt-1">Identified gaps across sectors</p>
                <DataSource source="stub" />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="tile-accent card-shadow opacity-0 animate-fade-in-up animate-stagger-2 transition-shadow hover:shadow-lg" style={{ animationFillMode: "forwards" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Status</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className={cn("text-2xl font-bold capitalize", STATUS_COLOR_CLASS[summary?.overallStatus ?? "stable"])}>
                    {summary?.overallStatus}
                  </span>
                  <Badge className={cn("text-xs border", STATUS_BADGE_CLASS[summary?.overallStatus ?? "stable"])}>
                    {summary?.overallStatus === "critical" ? "Act now" : summary?.overallStatus === "watch" ? "Monitor" : "On track"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">As of today</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow opacity-0 animate-fade-in-up animate-stagger-3 transition-shadow hover:shadow-lg" style={{ animationFillMode: "forwards" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-pulse-stable" />
              Check-In Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <AnimatedCounter value={summary?.checkInStreak ?? 0} className="text-2xl font-bold" />
                <span className="text-sm text-muted-foreground ml-1">days</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.checkInCompleted ? "Completed today" : "Use header button to check in"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map + Live Scrape / City Score — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 opacity-0 animate-fade-in-up animate-stagger-3" style={{ animationFillMode: "forwards" }}>
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Montgomery at a Glance</h3>
          </div>
          <DashboardMiniMap />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <LiveScrape />
          <CityScore />
        </div>
      </div>

      {/* Did You Know */}
      <MontgomeryFact />

      {/* AI Insight Cards */}
      {insights.length > 0 && <InsightCards insights={insights} />}

      {/* Sectors at a Glance (top 4) + Fastest Rising Skills — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 opacity-0 animate-fade-in-up animate-stagger-4" style={{ animationFillMode: "forwards" }}>
        <div data-tour="sector-strip" className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Sectors at a Glance
            </h3>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/sectors">View all <ChevronRight className="h-3 w-3 ml-0.5" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {topSectors.map((sector) => (
              <SectorStripCard key={sector.id} sector={sector} />
            ))}
          </div>
        </div>

        <Card className="card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-pulse-watch" />
              Fastest Rising Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-20 rounded-full" />)}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Quick links + Refresh jobs */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/sectors">View all sectors <ChevronRight className="h-3 w-3 ml-1" /></Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/missions">Active missions <ChevronRight className="h-3 w-3 ml-1" /></Link>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => aggregateMutation.mutate()}
          disabled={aggregateMutation.isPending}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", aggregateMutation.isPending && "animate-spin")} />
          {aggregateMutation.isPending ? "Updating…" : "Refresh job data"}
        </Button>
      </div>
    </div>
  )
}

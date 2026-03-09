"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Briefcase, Clock, GraduationCap, Sparkles, ShieldAlert, ArrowUpRight, Link2, BookOpen, Target, ExternalLink } from "lucide-react"
import { fetchSectorById } from "@/services"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, statusToColor, formatNumber, formatDelta } from "@/lib/utils"
import { ImpactGauge } from "@/components/sectors/impact-gauge"
import { HiringTrendChart } from "@/components/sectors/hiring-trend-chart"
import { SparklineChart } from "@/components/sectors/sparkline-chart"

const BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

const STATUS_LABEL: Record<string, string> = {
  critical: "Critical",
  watch: "Watch",
  stable: "Stable",
}

const MISSION_STATUS_CLASS: Record<string, string> = {
  active: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  paused: "bg-gray-100 text-gray-700 border-gray-300",
}

const DETAIL_TABS = ["overview", "roles", "skills", "missions", "playbooks"] as const
type DetailTab = typeof DETAIL_TABS[number]

export default function SectorDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const requestedTab = searchParams.get("tab")
  const selectedSkillId = searchParams.get("skill")
  const normalizedRequestedTab: DetailTab = DETAIL_TABS.includes((requestedTab ?? "") as DetailTab)
    ? (requestedTab as DetailTab)
    : "overview"
  const [activeTab, setActiveTab] = useState<DetailTab>(normalizedRequestedTab)

  const { data: sector, isLoading, isError } = useQuery({
    queryKey: ["sector", id],
    queryFn: () => fetchSectorById(id),
  })

  useEffect(() => {
    setActiveTab(normalizedRequestedTab)
  }, [normalizedRequestedTab])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !sector) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sectors"><ArrowLeft className="h-4 w-4 mr-1" />Sectors</Link>
        </Button>
        <p className="text-sm text-destructive">Sector not found.</p>
      </div>
    )
  }

  const avgTimeToFill = sector.criticalRoles.length > 0
    ? Math.round(sector.criticalRoles.reduce((sum, role) => sum + role.avgTimeToFill, 0) / sector.criticalRoles.length)
    : 0
  const mappedTrainingCount = sector.skills.reduce((sum, skill) => sum + skill.trainingResources.length, 0)
  const skillMap = new Map(sector.skills.map((skill) => [skill.id, skill]))
  const selectedSkill = selectedSkillId ? skillMap.get(selectedSkillId) : undefined
  const roleTrainingMap = sector.criticalRoles.map((role) => {
    const matchedSkills = role.requiredSkills
      .map((skillId) => skillMap.get(skillId))
      .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill))

    const totalTrainingOptions = matchedSkills.reduce((sum, skill) => sum + skill.trainingResources.length, 0)
    const readinessPct = role.requiredSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / role.requiredSkills.length) * 100)

    return {
      role,
      matchedSkills,
      totalTrainingOptions,
      readinessPct,
    }
  })
  const displayedRoleTrainingMap = !selectedSkillId
    ? roleTrainingMap
    : [...roleTrainingMap].sort((a, b) => {
      const aMatches = a.role.requiredSkills.includes(selectedSkillId)
      const bMatches = b.role.requiredSkills.includes(selectedSkillId)
      if (aMatches === bMatches) return 0
      return aMatches ? -1 : 1
    })
  const displayedSkills = !selectedSkillId
    ? sector.skills
    : [...sector.skills].sort((a, b) => {
      const aMatches = a.id === selectedSkillId
      const bMatches = b.id === selectedSkillId
      if (aMatches === bMatches) return 0
      return aMatches ? -1 : 1
    })
  const topSkillGaps = [...sector.skills]
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 3)
  const totalOpenCriticalRoles = sector.criticalRoles.reduce((sum, role) => sum + role.openCount, 0)

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/sectors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Sectors
        </Link>
      </Button>

      {/* Header */}
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card-strong card-hover-lift rounded-[30px] border border-white/40 p-6 dark:border-white/10">
          <div className="flex flex-wrap items-start gap-6">
            <ImpactGauge score={sector.pulseScore} status={sector.status} size={180} label="Impact Score" />
            <div className="min-w-0 flex-1 pt-2">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className={cn("text-xs border font-medium", BADGE_CLASS[sector.status])}>
                  {STATUS_LABEL[sector.status]}
                </Badge>
                <Badge variant="primary">
                  {sector.openRolesCount} open roles
                </Badge>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-bold tracking-tight">{sector.name}</h2>
              </div>
              <p className="text-muted-foreground text-sm mt-2 max-w-2xl">{sector.description}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">Employees</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold">{formatNumber(sector.employeeCount)}</p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-300">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">Critical roles</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold">{totalOpenCriticalRoles}</p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">Training paths</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold">{mappedTrainingCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[26px] border border-white/25 bg-white/30 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Role-to-training readiness</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/45 p-3 dark:bg-white/5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Avg time to fill</p>
                <p className="mt-1 text-2xl font-semibold">{avgTimeToFill || "—"}d</p>
                <p className="mt-1 text-xs text-muted-foreground">Average across critical roles in this sector.</p>
              </div>
              <div className="rounded-2xl bg-white/45 p-3 dark:bg-white/5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Mapped skills</p>
                <p className="mt-1 text-2xl font-semibold">{sector.skills.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Skills currently linked to active role demand.</p>
              </div>
              <div className="rounded-2xl bg-white/45 p-3 dark:bg-white/5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Training options</p>
                <p className="mt-1 text-2xl font-semibold">{mappedTrainingCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">Named pathways available to close readiness gaps.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel card-hover-lift rounded-[30px] border border-white/35 p-5 dark:border-white/10">
          <div className="mb-3 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Priority talent bridge</h3>
          </div>
          <div className="space-y-3">
            {roleTrainingMap.slice(0, 3).map(({ role, matchedSkills, totalTrainingOptions, readinessPct }) => (
              <div key={role.id} className="rounded-2xl bg-white/30 p-3 transition-all duration-200 hover:bg-white/40 dark:bg-white/5 dark:hover:bg-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{role.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {role.openCount} open roles · avg {role.avgTimeToFill}d to fill
                    </p>
                  </div>
                  <Badge className={cn("text-xs border", BADGE_CLASS[role.urgency])}>
                    {STATUS_LABEL[role.urgency]}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Skills mapped to training</span>
                  <span className="font-semibold">{readinessPct}%</span>
                </div>
                <Progress value={readinessPct} className="mt-1.5 h-1.5" />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {matchedSkills.map((skill) => (
                    <Link
                      key={skill.id}
                      href={`/sectors/${id}?tab=skills&skill=${skill.id}`}
                      className="rounded-full border border-white/35 bg-white/50 px-2 py-1 text-[10px] font-medium text-foreground/85 dark:border-white/10 dark:bg-white/5"
                    >
                      {skill.name}
                    </Link>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {totalTrainingOptions} training option{totalTrainingOptions !== 1 ? "s" : ""} currently linked to this role.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sector.kpis.map((kpi) => (
          <Card key={kpi.label} className="glass-panel card-hover-lift border-white/35 dark:border-white/10">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xl font-bold">{kpi.value}</span>
                {kpi.delta !== 0 && (
                  <span className={cn("text-xs font-medium", statusToColor(kpi.status))}>
                    {formatDelta(kpi.delta)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DetailTab)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="shrink-0">Overview</TabsTrigger>
          <TabsTrigger value="roles" className="shrink-0">
            Roles
            {sector.criticalRoles.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted rounded px-1">
                {sector.criticalRoles.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="skills" className="shrink-0">
            Skills
            {sector.skills.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted rounded px-1">
                {sector.skills.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="missions" className="shrink-0">
            Missions
            {sector.missions.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted rounded px-1">
                {sector.missions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="playbooks" className="shrink-0">
            Playbooks
            {sector.playbooks.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted rounded px-1">
                {sector.playbooks.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            {sector.hiringTrend.length > 0 ? (
              <Card className="glass-panel border-white/35 dark:border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Hiring vs. Attrition (12 months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HiringTrendChart data={sector.hiringTrend} />
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">No hiring trend data available.</p>
            )}

            <Card className="glass-panel border-white/35 dark:border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Sector action focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Priority roles</p>
                  <p className="mt-1 text-sm font-semibold">{sector.criticalRoles.map((role) => role.title).slice(0, 2).join(" and ") || "No critical roles"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Focus recruiting and training capacity where fill time is longest and vacancy counts are highest.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Top skill gaps</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {topSkillGaps.map((skill) => (
                      <Link key={skill.id} href={`/sectors/${id}?tab=skills&skill=${skill.id}`}>
                        <Badge variant="primary">
                          {skill.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Training linkage</p>
                  <p className="mt-1 text-sm font-semibold">{mappedTrainingCount} mapped pathways</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Training resources are now surfaced alongside role demand to support faster intervention design.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roles */}
        <TabsContent value="roles" className="mt-4">
          {selectedSkill && (
            <div className="mb-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              Showing roles related to <span className="font-semibold text-foreground">{selectedSkill.name}</span>.
            </div>
          )}
          {sector.criticalRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No critical roles data available.</p>
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {displayedRoleTrainingMap.map(({ role, matchedSkills, totalTrainingOptions, readinessPct }) => {
                const matchesSelectedSkill = selectedSkillId ? role.requiredSkills.includes(selectedSkillId) : false
                return (
                <Card
                  key={role.id}
                  className={cn(
                    "glass-panel card-hover-lift border-white/35 dark:border-white/10",
                    matchesSelectedSkill && "ring-2 ring-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.16)]"
                  )}
                >
                  <CardContent className="space-y-4 pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{role.title}</p>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {role.openCount} open
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Avg {role.avgTimeToFill}d to fill
                          </span>
                        </div>
                      </div>
                      <Badge className={cn("text-xs border shrink-0", BADGE_CLASS[role.urgency])}>
                        {STATUS_LABEL[role.urgency]}
                      </Badge>
                    </div>

                    <div className="rounded-2xl bg-white/30 p-3 dark:bg-white/5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Training readiness</span>
                        <span className="font-semibold">{readinessPct}%</span>
                      </div>
                      <Progress value={readinessPct} className="mt-1.5 h-1.5" />
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Required skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSkills.map((skill) => (
                          <Link
                            key={skill.id}
                            href={`/sectors/${id}?tab=skills&skill=${skill.id}`}
                            className={cn(
                              "rounded-full border border-white/35 bg-white/50 px-2 py-1 text-[10px] font-medium text-foreground/85 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-white/5",
                              selectedSkillId === skill.id && "border-primary/35 bg-primary/10 text-primary"
                            )}
                          >
                            {skill.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Linked training pathways</p>
                      <div className="space-y-2">
                        {matchedSkills.flatMap((skill) =>
                          skill.trainingResources.map((resource) => (
                            <a
                              key={`${skill.id}-${resource.title}`}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-start justify-between gap-3 rounded-2xl border border-white/35 bg-white/45 px-3 py-2 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 dark:border-white/10 dark:bg-white/5"
                            >
                              <div>
                                <p className="font-medium text-foreground">{resource.title}</p>
                                <p className="mt-0.5 text-muted-foreground">{resource.provider} · for {skill.name}</p>
                              </div>
                              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                            </a>
                          ))
                        )}
                        {totalTrainingOptions === 0 && (
                          <p className="text-xs text-muted-foreground">No training pathways currently mapped to this role.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills" className="mt-4">
          {selectedSkill && (
            <div className="mb-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              Showing details for <span className="font-semibold text-foreground">{selectedSkill.name}</span>.
            </div>
          )}
          {sector.skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills data available.</p>
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {displayedSkills.map((skill) => (
                <Card
                  key={skill.id}
                  className={cn(
                    "glass-panel card-hover-lift border-white/35 dark:border-white/10",
                    selectedSkillId === skill.id && "ring-2 ring-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.16)]"
                  )}
                >
                  <CardContent className="space-y-4 pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{skill.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{skill.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("text-xs font-medium", statusToColor(skill.demandLevel))}>
                          +{skill.growthRate}%
                        </span>
                        <Badge className={cn("text-xs border", BADGE_CLASS[skill.demandLevel])}>
                          {STATUS_LABEL[skill.demandLevel]}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/30 p-3 dark:bg-white/5">
                      <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>7-day demand signal</span>
                        <span className={cn("font-semibold", statusToColor(skill.demandLevel))}>+{skill.growthRate}%</span>
                      </div>
                      <SparklineChart data={skill.sparklineData} status={skill.demandLevel} height={56} />
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Connected roles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sector.criticalRoles
                          .filter((role) => skill.relatedRoles.includes(role.id))
                          .map((role) => (
                            <span
                              key={role.id}
                              className="rounded-full border border-white/35 bg-white/50 px-2 py-1 text-[10px] font-medium text-foreground/85 dark:border-white/10 dark:bg-white/5"
                            >
                              {role.title}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Training pathways</p>
                      <div className="space-y-2">
                        {skill.trainingResources.map((resource) => (
                          <a
                            key={resource.title}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start justify-between gap-3 rounded-2xl border border-white/35 bg-white/45 px-3 py-2 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 dark:border-white/10 dark:bg-white/5"
                          >
                            <div>
                              <p className="font-medium text-foreground">{resource.title}</p>
                              <p className="mt-0.5 text-muted-foreground">{resource.provider}</p>
                            </div>
                            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Missions */}
        <TabsContent value="missions" className="mt-4">
          {sector.missions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No missions found for this sector.</p>
          ) : (
            <div className="space-y-3">
              {sector.missions.map((mission) => (
                <Card key={mission.id} className="glass-panel card-hover-lift border-white/35 dark:border-white/10">
                  <CardContent className="pt-4 pb-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{mission.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {mission.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn("text-xs border", MISSION_STATUS_CLASS[mission.status])}>
                          {mission.status}
                        </Badge>
                        <Badge className={cn("text-xs border", BADGE_CLASS[mission.priority])}>
                          {STATUS_LABEL[mission.priority]}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{mission.progress}%</span>
                      </div>
                      <Progress value={mission.progress} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playbooks" className="mt-4">
          {sector.playbooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No playbooks found for this sector.</p>
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {sector.playbooks.map((playbook) => (
                <Card key={playbook.id} className="glass-panel card-hover-lift border-white/35 dark:border-white/10">
                  <CardContent className="space-y-3 pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{playbook.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{playbook.summary}</p>
                      </div>
                      <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {playbook.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-white/35 bg-white/40 text-[10px] dark:border-white/10 dark:bg-white/5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="rounded-2xl bg-white/30 p-3 dark:bg-white/5">
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        <Target className="h-3.5 w-3.5" />
                        Key steps
                      </div>
                      <div className="space-y-1.5">
                        {playbook.steps.slice(0, 3).map((step) => (
                          <div key={step.order} className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{step.order}.</span> {step.instruction}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

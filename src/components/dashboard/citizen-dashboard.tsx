"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import {
  Briefcase,
  ExternalLink,
  Target,
  Trophy,
  Zap,
  Star,
  ChevronRight,
  BookOpen,
  User,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { fetchMissions, fetchMissionMemberProfile, fetchPulseSummary, submitDailyCheckIn } from "@/services"
import { DashboardMiniMap } from "@/components/dashboard/dashboard-mini-map"
import { CityProfile } from "@/components/dashboard/city-profile"
import { DashboardSignalCard } from "@/components/dashboard/signal-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useTotalJobs } from "@/hooks/use-total-jobs"

interface CityJob {
  title: string
  link: string
  salary: string
  department: string
  jobType: string
  filingDeadline: string
  employmentType: string
  sectorId: string | null
}

interface CityJobsResponse {
  count: number
  lastFetched: string
  jobs: CityJob[]
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Good morning")

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting("Good morning")
    else if (h < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  return greeting
}

function formatTimestamp(value?: string) {
  if (!value) return "Awaiting refresh"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatDeadline(value?: string) {
  if (!value) return "No deadline listed"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed)
}

export function CitizenDashboard() {
  const { data: session } = useSession()
  const userName = session?.user?.name ?? "Citizen"
  const greeting = useGreeting()
  const queryClient = useQueryClient()

  const { data: jobsData, isLoading: jobsLoading } = useQuery<CityJobsResponse>({
    queryKey: ["cityJobs"],
    queryFn: () => fetch("/api/city-jobs").then((r) => r.json()),
    staleTime: 3600_000,
  })

  const { data: missions } = useQuery({
    queryKey: ["missions"],
    queryFn: fetchMissions,
  })

  const { data: profile } = useQuery({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })

  const { data: pulseSummary, isLoading: pulseLoading } = useQuery({
    queryKey: ["pulseSummary"],
    queryFn: fetchPulseSummary,
  })

  const checkInMutation = useMutation({
    mutationFn: submitDailyCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pulseSummary"] })
    },
  })

  const { totalJobs } = useTotalJobs()

  const activeMissions = missions?.filter((m) => m.status === "active") ?? []
  const featuredJobs = jobsData?.jobs?.slice(0, 6) ?? []
  const nextLevelGap = useMemo(() => {
    if (!profile?.nextLevelPoints) return 0
    return Math.max(profile.nextLevelPoints - (profile.points ?? 0), 0)
  }, [profile?.nextLevelPoints, profile?.points])
  const levelProgress = useMemo(() => {
    if (!profile?.nextLevelPoints || profile.nextLevelPoints <= 0) return 0
    return Math.min(100, Math.round(((profile.points ?? 0) / profile.nextLevelPoints) * 100))
  }, [profile?.nextLevelPoints, profile?.points])
  const featuredDepartment = useMemo(() => {
    if (featuredJobs.length === 0) return null
    const counts = new Map<string, number>()
    for (const job of featuredJobs) {
      const department = job.department?.trim() || "Citywide"
      counts.set(department, (counts.get(department) ?? 0) + 1)
    }
    return [...counts.entries()].sort((left, right) => right[1] - left[1])[0] ?? null
  }, [featuredJobs])
  const nextDeadlineJob = useMemo(() => {
    return [...featuredJobs]
      .filter((job) => Boolean(job.filingDeadline))
      .sort((left, right) => new Date(left.filingDeadline).getTime() - new Date(right.filingDeadline).getTime())[0] ?? null
  }, [featuredJobs])
  const highRewardMission = useMemo(() => {
    return [...activeMissions].sort((left, right) => right.rewardPoints - left.rewardPoints)[0] ?? null
  }, [activeMissions])
  const missionCompletionRate = useMemo(() => {
    const completed = profile?.completedMissionCount ?? 0
    const active = profile?.activeMissionCount ?? 0
    const total = completed + active
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }, [profile?.activeMissionCount, profile?.completedMissionCount])
  const recentBadge = profile?.badges?.[profile.badges.length - 1] ?? null
  const checkInPreview = useMemo(() => {
    const streak = pulseSummary?.checkInStreak ?? 0
    const completedToday = pulseSummary?.checkInCompleted ?? false
    const activeCount = completedToday ? Math.min(5, Math.max(1, streak)) : Math.min(4, Math.max(0, streak))
    return Array.from({ length: 5 }, (_, index) => index < activeCount)
  }, [pulseSummary?.checkInCompleted, pulseSummary?.checkInStreak])
  const nextStreakMilestone = useMemo(() => {
    const streak = pulseSummary?.checkInStreak ?? 0
    return Math.max(7, Math.ceil((streak + 1) / 7) * 7)
  }, [pulseSummary?.checkInStreak])
  const streakProgress = useMemo(() => {
    const streak = pulseSummary?.checkInStreak ?? 0
    return Math.min(100, Math.round((streak / nextStreakMilestone) * 100))
  }, [nextStreakMilestone, pulseSummary?.checkInStreak])
  const jobsRefreshedLabel = formatTimestamp(jobsData?.lastFetched)

  return (
    <div className="space-y-6 pb-10">
      {/* Greeting */}
      <div className="opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
        <div className="mb-6">
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground" suppressHydrationWarning>
            {greeting}, {userName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore job opportunities, join community missions, and grow your skills.
          </p>
        </div>
        <CityProfile variant="citizen" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardSignalCard
          tone="watch"
          eyebrow="Progress"
          title="My Points"
          status={`Level ${profile?.level ?? 1}`}
          icon={Trophy}
          value={<AnimatedCounter value={profile?.points ?? 0} />}
          suffix="pts"
          description={
            profile?.nextLevelPoints
              ? `${nextLevelGap} pts to reach your next level milestone.`
              : "Complete missions and tasks to earn points and unlock rewards."
          }
          stats={[
            {
              label: "Mission pts",
              value: profile?.missionPoints?.toLocaleString("en-US") ?? "0",
            },
            {
              label: "Skill pts",
              value: profile?.skillPoints?.toLocaleString("en-US") ?? "0",
            },
            {
              label: "Next level",
              value: profile?.nextLevelPoints?.toLocaleString("en-US") ?? "Open",
            },
          ]}
          action={{ label: "View rewards", href: "/settings" }}
          className="opacity-0 animate-fade-in-up animate-stagger-1 transition-all"
        >
          <div className="rounded-2xl border border-white/25 bg-white/35 p-3 dark:border-white/10 dark:bg-black/15">
            <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span>Level progress</span>
              <span>{levelProgress}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-primary to-amber-500" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </DashboardSignalCard>

        <DashboardSignalCard
          tone="stable"
          eyebrow="Community work"
          title="Active Missions"
          status={activeMissions.length > 0 ? "Open now" : "No active missions"}
          icon={Target}
          value={<AnimatedCounter value={profile?.activeMissionCount ?? 0} />}
          suffix="active"
          description={`${profile?.completedMissionCount ?? 0} completed and ${profile?.contributedSteps ?? 0} steps delivered across community missions.`}
          stats={[
            {
              label: "Completion",
              value: `${missionCompletionRate}%`,
              tone: missionCompletionRate >= 60 ? "stable" : "watch",
            },
            {
              label: "Top mission",
              value: highRewardMission?.title ?? "Browse missions",
            },
            {
              label: "Reward",
              value: highRewardMission ? `+${highRewardMission.rewardPoints} pts` : "--",
              tone: "stable",
            },
          ]}
          chips={activeMissions.slice(0, 3).map((mission) => `${mission.title} · ${mission.progress}%`)}
          action={{ label: "Join a mission", href: "/missions" }}
          className="opacity-0 animate-fade-in-up animate-stagger-2 transition-all"
        />

        <DashboardSignalCard
          tone="stable"
          eyebrow="Opportunity"
          title="Open Jobs"
          status={jobsLoading ? "Refreshing" : "Hiring across Montgomery"}
          icon={Briefcase}
          value={jobsLoading ? <Skeleton className="h-9 w-20" /> : <AnimatedCounter value={totalJobs} />}
          suffix="roles"
          description="Browse and apply to local openings with live city and workforce feeds." 
          stats={[
            {
              label: "Featured dept",
              value: featuredDepartment?.[0] ?? "Citywide",
            },
            {
              label: "Openings shown",
              value: featuredJobs.length,
            },
            {
              label: "Updated",
              value: jobsRefreshedLabel,
            },
          ]}
          chips={featuredJobs.slice(0, 3).map((job) => job.title)}
          action={{ label: "Browse open jobs", href: "/jobs" }}
          className="opacity-0 animate-fade-in-up animate-stagger-2 transition-all"
        >
          <div className="rounded-2xl border border-white/25 bg-white/35 p-3 dark:border-white/10 dark:bg-black/15">
            <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span>Next filing deadline</span>
              <span>{formatDeadline(nextDeadlineJob?.filingDeadline)}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">{nextDeadlineJob?.title ?? "Browse jobs to see application windows"}</p>
          </div>
        </DashboardSignalCard>

        <DashboardSignalCard
          tone={pulseSummary?.checkInCompleted ? "stable" : "watch"}
          eyebrow="Consistency"
          title="Check-In & Badges"
          status={pulseSummary?.checkInCompleted ? "Checked in today" : "Keep your streak alive"}
          icon={CheckCircle2}
          value={pulseLoading ? <Skeleton className="h-9 w-16" /> : <AnimatedCounter value={pulseSummary?.checkInStreak ?? 0} />}
          suffix="days"
          description={
            recentBadge?.label
              ? `Latest badge: ${recentBadge.label}. Daily check-ins keep your workforce pulse current.`
              : "Check in daily and complete missions to build streaks and unlock badges."
          }
          stats={[
            {
              label: "Badges",
              value: profile?.badges?.length ?? 0,
              tone: "stable",
            },
            {
              label: "Helped workers",
              value: profile?.helpedWorkers?.toLocaleString("en-US") ?? "0",
            },
            {
              label: "Playbooks",
              value: profile?.playbooksSaved ?? 0,
            },
          ]}
          action={{
            label: pulseSummary?.checkInCompleted ? "Checked in today" : "Submit daily check-in",
            onClick: () => checkInMutation.mutate(),
            disabled: pulseLoading || checkInMutation.isPending || pulseSummary?.checkInCompleted,
            loading: checkInMutation.isPending,
          }}
          className="opacity-0 animate-fade-in-up animate-stagger-3 transition-all"
        >
          <div className="rounded-2xl border border-white/25 bg-white/35 p-3 dark:border-white/10 dark:bg-black/15">
            <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span>Next streak milestone</span>
              <span>{pulseSummary?.checkInStreak ?? 0}/{nextStreakMilestone} days</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-emerald-400" style={{ width: `${streakProgress}%` }} />
            </div>
            <div className="mt-4 flex justify-between items-end">
              {[1, 2, 3, 4, 5].map((day) => {
                const filled = checkInPreview[day - 1]
                const isToday = day === 5
                return (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "h-10 w-5 rounded-full transition-all",
                        filled
                          ? "bg-primary/75 shadow-[0_6px_14px_rgba(209,154,71,0.24)]"
                          : "bg-black/5 shadow-inner dark:bg-black/40",
                        isToday && !filled && "border border-dashed border-primary/45 bg-transparent",
                      )}
                    />
                    <span className={cn("text-[10px] text-muted-foreground", isToday && "font-semibold text-primary")}>{day}</span>
                  </div>
                )
              })}
            </div>
            {checkInMutation.isError ? (
              <p className="mt-3 rounded-xl border border-red-200/70 bg-red-50/85 px-3 py-2 text-[11px] text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {checkInMutation.error instanceof Error ? checkInMutation.error.message : "Check-in could not be completed."}
              </p>
            ) : null}
          </div>
        </DashboardSignalCard>
      </div>

      {/* Featured Jobs */}
      <div className="glass-panel rounded-[30px] p-6 opacity-0 animate-fade-in-up animate-stagger-3" style={{ animationFillMode: "forwards" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Job Opportunities</h2>
            {jobsData && (
              <Badge variant="secondary" className="text-xs">
                {jobsData.count} total
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs" className="gap-1">
              Browse all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/20 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No open positions at the moment. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featuredJobs.map((job) => (
              <a
                key={job.link}
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel rounded-2xl p-4 flex items-center gap-4 hover:bg-white/40 dark:hover:bg-white/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{job.department}</span>
                    {job.salary && (
                      <>
                        <span className="text-muted-foreground/40">|</span>
                        <span>{job.salary}</span>
                      </>
                    )}
                  </div>
                  {job.filingDeadline && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Deadline: {job.filingDeadline}
                    </p>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Map + Community Missions */}
      <div className="opacity-0 animate-fade-in-up animate-stagger-3" style={{ animationFillMode: "forwards" }}>
        <div className="glass-panel rounded-[30px] p-4 md:p-5">
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1.55fr_0.9fr]">
            <DashboardMiniMap embedded />
            <div className="px-1 py-1 lg:h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Community Missions</h2>
                </div>
                <Link href="/missions" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {activeMissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No active missions yet. Check back soon!
                  </p>
                ) : (
                  activeMissions.slice(0, 4).map((mission) => (
                    <Link
                      key={mission.id}
                      href="/missions"
                      className="block glass-panel rounded-2xl p-4 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-xs font-semibold leading-tight">{mission.title}</h4>
                        <Badge
                          variant={mission.priority === "critical" ? "destructive" : "secondary"}
                          className="text-[10px] shrink-0"
                        >
                          +{mission.rewardPoints} pts
                        </Badge>
                      </div>
                      <Progress value={mission.progress} className="h-1.5 mb-1" />
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{mission.progress}% complete</span>
                        <span>{mission.participantCount} participants</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 opacity-0 animate-fade-in-up animate-stagger-4" style={{ animationFillMode: "forwards" }}>
        {[
          { href: "/jobs", label: "Browse Open Jobs", icon: Briefcase, desc: "View open city positions on the map" },
          { href: "/missions", label: "Join a Mission", icon: Target, desc: "Earn points and help the community" },
          { href: "/skills", label: "Explore Training", icon: Zap, desc: "Discover in-demand skills & training" },
          { href: "/playbooks", label: "View Playbooks", icon: BookOpen, desc: "Community playbooks & guides" },
          { href: "/settings", label: "Redeem Rewards", icon: Star, desc: "Use your points for rewards" },
          { href: "/profile", label: "Update Profile", icon: User, desc: "Manage your account and stats" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="glass-panel rounded-2xl p-5 flex items-center gap-4 hover:bg-white/40 dark:hover:bg-white/10 transition-colors group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

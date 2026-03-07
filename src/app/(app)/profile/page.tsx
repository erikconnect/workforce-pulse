"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import {
  User,
  Trophy,
  Flame,
  Medal,
  CheckCircle2,
  Target,
  BookOpen,
  Zap,
  Grid3X3,
  Settings,
  ChevronRight,
} from "lucide-react"
import { fetchMissionMemberProfile } from "@/services"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { MissionMemberProfile } from "@/services/types"

function progressToNextLevel(profile: MissionMemberProfile) {
  const previousLevelPoints = Math.max(0, (profile.level - 1) * 250)
  const currentBand = profile.nextLevelPoints - previousLevelPoints
  const earnedInBand = profile.points - previousLevelPoints
  return Math.max(0, Math.min(100, Math.round((earnedInBand / Math.max(1, currentBand)) * 100)))
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { data: memberProfile, isLoading } = useQuery({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })

  const userName = session?.user?.name ?? "City Admin"
  const userEmail = (session?.user as { email?: string })?.email ?? ""
  const userCity = (session?.user as { city?: string })?.city ?? "Montgomery, AL"

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account and mission progress
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="glass-card-strong overflow-hidden rounded-[30px] border border-white/40 p-6 dark:border-white/10">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary/10 text-primary">
                <User className="h-10 w-10" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold">{userName}</h2>
                {userEmail && (
                  <p className="mt-1 text-sm text-muted-foreground">{userEmail}</p>
                )}
                <p className="mt-0.5 text-sm text-muted-foreground">{userCity}</p>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="mt-4 gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[30px] border border-white/35 p-6 dark:border-white/10">
            <h3 className="text-base font-semibold">Points breakdown</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Points earned across missions, skills, sectors, and playbooks.
            </p>
            {isLoading ? (
              <div className="mt-6 space-y-3">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
            ) : memberProfile ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Missions</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold">{memberProfile.missionPoints} pts</p>
                </div>
                <div className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Skills</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold">{memberProfile.skillPoints} pts</p>
                </div>
                <div className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Grid3X3 className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Sectors</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold">{memberProfile.sectorPoints} pts</p>
                </div>
                <div className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Playbooks</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold">{memberProfile.playbookPoints} pts</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[30px] border border-white/35 p-5 dark:border-white/10">
            {!memberProfile ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="primary">Level {memberProfile.level}</Badge>
                    <p className="mt-3 text-2xl font-bold text-primary">{memberProfile.points} pts</p>
                    <p className="text-xs text-muted-foreground mt-1">Total points</p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                    <Trophy className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress to next level</span>
                    <span className="font-medium text-primary">{memberProfile.nextLevelPoints} pts</span>
                  </div>
                  <Progress value={progressToNextLevel(memberProfile)} className="mt-2 h-2" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Streak</span>
                    </div>
                    <p className="mt-1.5 text-lg font-semibold">{memberProfile.streak} cycles</p>
                  </div>
                  <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Medal className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Completed</span>
                    </div>
                    <p className="mt-1.5 text-lg font-semibold">{memberProfile.completedMissionCount} missions</p>
                  </div>
                  <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Steps</span>
                    </div>
                    <p className="mt-1.5 text-lg font-semibold">{memberProfile.contributedSteps} contributed</p>
                  </div>
                  <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-3.5 w-3.5 text-sky-500" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Helped</span>
                    </div>
                    <p className="mt-1.5 text-lg font-semibold">{memberProfile.helpedWorkers} workers</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {memberProfile && memberProfile.badges.length > 0 && (
            <div className="glass-panel rounded-[30px] border border-white/35 p-5 dark:border-white/10">
              <h3 className="text-sm font-semibold">Badges</h3>
              <p className="mt-1 text-xs text-muted-foreground">Achievements unlocked</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {memberProfile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-2xl border border-white/25 bg-white/35 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5"
                  >
                    <p className="font-medium">{badge.label}</p>
                    <p className="mt-0.5 text-muted-foreground">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

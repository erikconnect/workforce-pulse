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
  Briefcase,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Shield,
  Rocket,
  MapPin,
  Clock,
  Heart,
  Star,
} from "lucide-react"
import { fetchMissionMemberProfile } from "@/services/api/missions"
import { useUserRole } from "@/hooks/use-user-role"
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

function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Admin Quick Actions */}
      <div className="glass-panel rounded-[30px] border border-white/35 p-6 dark:border-white/10">
        <h3 className="text-base font-semibold">Quick Actions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Common administrative tasks
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href="/missions">
            <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Manage Missions</div>
                <div className="text-xs text-muted-foreground">Create & edit workforce missions</div>
              </div>
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Job Board</div>
                <div className="text-xs text-muted-foreground">Review & publish job listings</div>
              </div>
            </Button>
          </Link>
          <Link href="/playbooks">
            <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Playbooks</div>
                <div className="text-xs text-muted-foreground">Manage training resources</div>
              </div>
            </Button>
          </Link>
          <Link href="/crawl">
            <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Activity className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Data Sources</div>
                <div className="text-xs text-muted-foreground">Configure job scrapers</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <div className="glass-panel rounded-[30px] border border-white/35 p-6 dark:border-white/10">
        <h3 className="text-base font-semibold">System Overview</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform health and engagement
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider">Active Users</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">1,247</p>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">+12% this month</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Active Missions</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">23</p>
            <p className="mt-1 text-xs text-muted-foreground">8 completed this month</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Job Listings</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">456</p>
            <p className="mt-1 text-xs text-muted-foreground">32 new this week</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Engagement</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">87%</p>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">+5% increase</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel rounded-[30px] border border-white/35 p-6 dark:border-white/10">
        <h3 className="text-base font-semibold">Recent Activity</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest platform events
        </p>
        <div className="mt-4 space-y-3">
          {[
            { icon: Target, color: "text-primary", text: "New mission 'Healthcare Careers' created", time: "2 hours ago" },
            { icon: Users, color: "text-sky-500", text: "15 new citizens joined the platform", time: "5 hours ago" },
            { icon: Briefcase, color: "text-violet-500", text: "42 jobs added from Indeed integration", time: "1 day ago" },
            { icon: CheckCircle2, color: "text-green-500", text: "Mission 'Manufacturing Skills' completed", time: "2 days ago" },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/25 p-3 dark:border-white/10 dark:bg-white/5">
              <div className={`mt-0.5 ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.text}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CitizenDashboard({ memberProfile }: { memberProfile?: MissionMemberProfile }) {
  return (
    <div className="space-y-6">
      {/* Saved & Recommended Jobs */}
      <div className="glass-panel rounded-[30px] border border-white/35 p-6 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Your Jobs</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Saved opportunities and recommendations
            </p>
          </div>
          <Link href="/jobs">
            <Button size="sm" variant="ghost" className="gap-1">
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {[
            { title: "Healthcare Navigator", company: "Baptist Health", location: "Montgomery", saved: true, match: 95 },
            { title: "Manufacturing Technician", company: "Hyundai Motor", location: "Montgomery", saved: true, match: 88 },
            { title: "Customer Service Rep", company: "Maxwell AFB", location: "Montgomery", saved: false, match: 92 },
          ].map((job, i) => (
            <div key={i} className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{job.title}</h4>
                    {job.saved && <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  <Star className="mr-1 h-3 w-3" />
                  {job.match}% match
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Progress */}
      <div className="glass-panel rounded-[30px] border border-white/35 p-6 dark:border-white/10">
        <h3 className="text-base font-semibold">Skills in Progress</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Training and certifications you're working on
        </p>
        <div className="mt-4 space-y-3">
          {[
            { skill: "Customer Service Excellence", progress: 75, color: "bg-sky-500" },
            { skill: "Manufacturing Safety", progress: 45, color: "bg-violet-500" },
            { skill: "Healthcare Basics", progress: 30, color: "bg-green-500" },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{item.skill}</p>
                <span className="text-xs font-semibold text-primary">{item.progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/50 dark:bg-black/20">
                <div
                  className={`h-full ${item.color} transition-all`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <Link href="/playbooks">
          <Button variant="outline" size="sm" className="mt-4 w-full gap-2">
            <Rocket className="h-4 w-4" />
            Browse More Training
          </Button>
        </Link>
      </div>

      {/* Community Impact */}
      <div className="glass-panel rounded-[30px] border border-white/35 p-6 dark:border-white/10">
        <h3 className="text-base font-semibold">Community Impact</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your contribution to Montgomery's workforce
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/25 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <div className="flex items-center gap-2 text-primary">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Workers Helped</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{memberProfile?.helpedWorkers ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Through mission participation</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-gradient-to-br from-green-500/10 to-green-500/5 p-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Steps Completed</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{memberProfile?.contributedSteps ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Across all missions</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Keep up the great work!</p>
              <p className="mt-1 text-xs text-muted-foreground">
                You're in the top 25% of active community members
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function ProfilePage() {
  const { data: session } = useSession()
  const { role, isAdmin } = useUserRole()
  const { data: memberProfile, isLoading } = useQuery<MissionMemberProfile>({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })

  const userName = session?.user?.name ?? "City Admin"
  const userEmail = (session?.user as { email?: string })?.email ?? ""
  const userCity = (session?.user as { city?: string })?.city ?? "Montgomery, AL"
  const roleDisplay = isAdmin ? "Administrator" : "Citizen"

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin ? "Administrative account and system overview" : "Your account and mission progress"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Profile Info Card */}
          <div className="glass-card-strong overflow-hidden rounded-[30px] border border-white/40 p-6 dark:border-white/10">
            <div className="flex items-start gap-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary/10 text-primary">
                {isAdmin ? (
                  <Shield className="h-10 w-10" />
                ) : (
                  <User className="h-10 w-10" />
                )}
                {isAdmin && (
                  <Badge className="absolute -right-2 -top-2" variant="default">
                    Admin
                  </Badge>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold">{userName}</h2>
                <p className="mt-0.5 text-sm font-medium text-primary">{roleDisplay}</p>
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

          {/* Role-Specific Content */}
          {isAdmin ? <AdminDashboard /> : <CitizenDashboard memberProfile={memberProfile} />}

          {/* Points Breakdown */}
          <div className="glass-panel rounded-[30px] border border-white/35 p-6 dark:border-white/10">
            <h3 className="text-base font-semibold">
              {isAdmin ? "Platform Activity" : "Points breakdown"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin
                ? "Overall platform engagement metrics"
                : "Points earned across missions, skills, sectors, and playbooks."}
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

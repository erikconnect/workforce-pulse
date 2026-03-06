"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { User, Trophy, Gift, Bell, Plug, Flame, Target, Zap, Grid3X3, BookOpen } from "lucide-react"
import { fetchMissionMemberProfile, fetchBenefitsCatalog, fetchRedemptions, checkBenefitEligibility, redeemBenefit } from "@/services"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { BrightDataSettingsTab } from "@/components/settings/BrightDataSettingsTab"
import { Button } from "@/components/ui/button"
import type { MissionMemberProfile } from "@/services/types"

function BenefitsTab({ profile }: { profile: MissionMemberProfile | undefined }) {
  const queryClient = useQueryClient()
  const { data: catalog } = useQuery({
    queryKey: ["benefitsCatalog"],
    queryFn: fetchBenefitsCatalog,
  })
  const { data: redemptions } = useQuery({
    queryKey: ["benefitRedemptions"],
    queryFn: () => fetchRedemptions(),
  })
  const redeemMutation = useMutation({
    mutationFn: (benefitId: string) => {
      if (!profile) throw new Error("No profile")
      return Promise.resolve(redeemBenefit(benefitId, profile))
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
        queryClient.invalidateQueries({ queryKey: ["benefitRedemptions"] })
      }
    },
  })

  if (!profile) return <p className="text-sm text-muted-foreground">Loading…</p>

  return (
    <Card className="glass-panel border-white/35 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-base">Benefits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Your points unlock exclusive benefits: priority candidacy, training vouchers, and premium resources.
        </p>
        <div className="space-y-3">
          {catalog?.map((benefit) => {
            const check = checkBenefitEligibility(benefit.id, profile)
            const redeemed = redemptions?.some((r) => r.benefitId === benefit.id)
            return (
              <div
                key={benefit.id}
                className="rounded-2xl border border-white/25 dark:border-white/10 bg-white/20 dark:bg-white/5 p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{benefit.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{benefit.description}</p>
                  <p className="text-xs text-primary mt-2">{benefit.costPoints} pts</p>
                </div>
                <Button
                  size="sm"
                  disabled={!check.eligible || redeemed || redeemMutation.isPending}
                  onClick={() => redeemMutation.mutate(benefit.id)}
                >
                  {redeemed ? "Redeemed" : check.eligible ? "Redeem" : "Locked"}
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { data: profile } = useQuery({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })

  const userName = session?.user?.name ?? "City Admin"
  const userEmail = session?.user?.email ?? ""
  const userCity = (session?.user as { city?: string })?.city ?? "Montgomery, AL"

  const pointsToNext = (profile?.nextLevelPoints ?? 250) - (profile?.points ?? 0)
  const progressPct = profile?.nextLevelPoints
    ? Math.min(100, Math.round(((profile?.points ?? 0) / profile.nextLevelPoints) * 100))
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account, points, benefits, and preferences.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="points" className="gap-2">
            <Trophy className="h-4 w-4" />
            Points
          </TabsTrigger>
          <TabsTrigger value="benefits" className="gap-2">
            <Gift className="h-4 w-4" />
            Benefits
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Bell className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card className="glass-panel border-white/35 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-white/30 dark:bg-white/5 p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Name</p>
                  <p className="font-medium">{userName}</p>
                </div>
                {userEmail && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Email</p>
                    <p className="font-medium">{userEmail}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">City</p>
                  <p className="font-medium">{userCity}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Account details are managed by your sign-in provider. Contact your administrator to update your profile.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="mt-6">
          <Card className="glass-panel border-white/35 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Points & Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile && (
                <>
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-primary">Level {profile.level}</span>
                      <span className="text-sm font-semibold">{profile.points} pts</span>
                    </div>
                    <Progress value={progressPct} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {pointsToNext} points to Level {profile.level + 1}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">Breakdown by domain</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-2xl bg-white/30 dark:bg-white/5 p-3 flex items-center gap-3">
                        <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-2">
                          <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Missions</p>
                          <p className="font-semibold">{profile.missionPoints}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/30 dark:bg-white/5 p-3 flex items-center gap-3">
                        <div className="rounded-xl bg-sky-100 dark:bg-sky-900/30 p-2">
                          <Zap className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Skills</p>
                          <p className="font-semibold">{profile.skillPoints}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/30 dark:bg-white/5 p-3 flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/30 p-2">
                          <Grid3X3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sectors</p>
                          <p className="font-semibold">{profile.sectorPoints}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/30 dark:bg-white/5 p-3 flex items-center gap-3">
                        <div className="rounded-xl bg-violet-100 dark:bg-violet-900/30 p-2">
                          <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Playbooks</p>
                          <p className="font-semibold">{profile.playbookPoints}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">Streak</p>
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-amber-500" />
                      <span className="font-semibold">{profile.streak} days</span>
                    </div>
                  </div>

                  {profile.badges.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">Badges</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.badges.map((badge) => (
                          <Badge key={badge.id} variant="primary">
                            {badge.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {!profile && (
                <p className="text-sm text-muted-foreground">Loading your points and level…</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="mt-6">
          <BenefitsTab profile={profile} />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card className="glass-panel border-white/35 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="emailAlerts" defaultChecked />
                <Label htmlFor="emailAlerts">Email alerts for critical workforce signals</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="dailyDigest" />
                <Label htmlFor="dailyDigest">Daily digest of sector updates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="missionReminders" defaultChecked />
                <Label htmlFor="missionReminders">Mission step reminders</Label>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Preferences are saved locally. Full sync with account coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card className="glass-panel border-white/35 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Bright Data</CardTitle>
            </CardHeader>
            <CardContent>
              <BrightDataSettingsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

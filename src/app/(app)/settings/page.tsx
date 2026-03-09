"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { User, Trophy, Gift, Bell, Plug, Flame, Target, Zap, Grid3X3, BookOpen, Mail, Briefcase, MapPin, Shield, Lock, Camera, Upload, Calendar, GraduationCap, Car, Clock, FileText, Sparkles } from "lucide-react"
import { fetchMissionMemberProfile } from "@/services/api/missions"
import { fetchBenefitsCatalog, fetchRedemptions, checkBenefitEligibility, redeemBenefit } from "@/services/api/benefits"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { BrightDataSettingsTab } from "@/components/settings/BrightDataSettingsTab"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import type { MissionMemberProfile, Benefit, RewardRedemption } from "@/services/types"
import { useUserRole } from "@/hooks/use-user-role"
import { cn } from "@/lib/utils"

interface CareerProfileData {
  photo?: string
  bio: string
  age: string
  education: string
  experience: string
  skills: string[]
  interests: string[]
  careerGoals: string
  availability: string
  transportation: string
  preferredSectors: string[]
  certifications: string
  languages: string[]
}

function CareerProfileTab() {
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<CareerProfileData>({
    photo: undefined,
    bio: "",
    age: "",
    education: "high-school",
    experience: "0-1",
    skills: [],
    interests: [],
    careerGoals: "",
    availability: "full-time",
    transportation: "own-vehicle",
    preferredSectors: [],
    certifications: "",
    languages: ["English"],
  })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("careerProfile")
    if (saved) {
      try {
        setProfileData(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load career profile", e)
      }
    }
  }, [])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, photo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoRemove = () => {
    setProfileData(prev => ({ ...prev, photo: undefined }))
  }

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item]
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem("careerProfile", JSON.stringify(profileData))
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
  }

  const commonSkills = [
    "Customer Service", "Communication", "Teamwork", "Problem Solving",
    "Time Management", "Leadership", "Microsoft Office", "Data Entry",
    "Sales", "Marketing", "Healthcare", "Manufacturing", "Logistics"
  ]

  const sectors = [
    "Healthcare", "Manufacturing", "Technology", "Retail",
    "Government", "Education", "Transportation", "Hospitality"
  ]

  return (
    <Card className="glass-panel border-white/35 dark:border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Career Profile</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Build your profile to get personalized job, mission, and training recommendations
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Upload */}
        <div>
          <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Profile Photo
          </Label>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0">
              {profileData.photo ? (
                <img
                  src={profileData.photo}
                  alt="Profile"
                  className="h-full w-full rounded-2xl object-cover border-2 border-white/25"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-white/25 bg-white/10">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Upload a professional photo to help employers get to know you better.
              </p>
              {profileData.photo && (
                <Button type="button" variant="outline" size="sm" onClick={handlePhotoRemove}>
                  Remove photo
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            About You
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself, your experience, what you're looking for in your next opportunity..."
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {profileData.bio.length}/500 characters
          </p>
        </div>

        {/* Basic Info Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="age" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Age Range
            </Label>
            <Select value={profileData.age} onValueChange={(v) => setProfileData(prev => ({ ...prev, age: v }))}>
              <SelectTrigger id="age">
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-24">18-24</SelectItem>
                <SelectItem value="25-34">25-34</SelectItem>
                <SelectItem value="35-44">35-44</SelectItem>
                <SelectItem value="45-54">45-54</SelectItem>
                <SelectItem value="55+">55+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="education" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education Level
            </Label>
            <Select value={profileData.education} onValueChange={(v) => setProfileData(prev => ({ ...prev, education: v }))}>
              <SelectTrigger id="education">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high-school">High School Diploma/GED</SelectItem>
                <SelectItem value="some-college">Some College</SelectItem>
                <SelectItem value="associates">Associate's Degree</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="masters">Master's Degree or Higher</SelectItem>
                <SelectItem value="vocational">Vocational/Technical Certification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="experience" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Years of Experience
            </Label>
            <Select value={profileData.experience} onValueChange={(v) => setProfileData(prev => ({ ...prev, experience: v }))}>
              <SelectTrigger id="experience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1">Less than 1 year</SelectItem>
                <SelectItem value="1-3">1-3 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="availability" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Availability
            </Label>
            <Select value={profileData.availability} onValueChange={(v) => setProfileData(prev => ({ ...prev, availability: v }))}>
              <SelectTrigger id="availability">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time (40+ hrs/week)</SelectItem>
                <SelectItem value="part-time">Part-time (20-39 hrs/week)</SelectItem>
                <SelectItem value="flexible">Flexible Hours</SelectItem>
                <SelectItem value="weekends">Weekends Only</SelectItem>
                <SelectItem value="evenings">Evenings Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transportation" className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Transportation
            </Label>
            <Select value={profileData.transportation} onValueChange={(v) => setProfileData(prev => ({ ...prev, transportation: v }))}>
              <SelectTrigger id="transportation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="own-vehicle">Own Vehicle</SelectItem>
                <SelectItem value="public-transit">Public Transportation</SelectItem>
                <SelectItem value="bicycle">Bicycle</SelectItem>
                <SelectItem value="need-assistance">Need Transportation Assistance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Skills */}
        <div>
          <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Your Skills
          </Label>
          <div className="flex flex-wrap gap-2">
            {commonSkills.map(skill => (
              <Badge
                key={skill}
                variant={profileData.skills.includes(skill) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setProfileData(prev => ({
                  ...prev,
                  skills: toggleArrayItem(prev.skills, skill)
                }))}
              >
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click to select skills you have ({profileData.skills.length} selected)
          </p>
        </div>

        {/* Preferred Sectors */}
        <div>
          <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Preferred Sectors
          </Label>
          <div className="flex flex-wrap gap-2">
            {sectors.map(sector => (
              <Badge
                key={sector}
                variant={profileData.preferredSectors.includes(sector) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setProfileData(prev => ({
                  ...prev,
                  preferredSectors: toggleArrayItem(prev.preferredSectors, sector)
                }))}
              >
                {sector}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Select industries you're interested in ({profileData.preferredSectors.length} selected)
          </p>
        </div>

        {/* Career Goals */}
        <div>
          <Label htmlFor="careerGoals" className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Career Goals
          </Label>
          <Textarea
            id="careerGoals"
            placeholder="What are your career aspirations? What kind of work are you looking for?"
            value={profileData.careerGoals}
            onChange={(e) => setProfileData(prev => ({ ...prev, careerGoals: e.target.value }))}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Certifications */}
        <div>
          <Label htmlFor="certifications" className="text-sm font-semibold mb-2">
            Certifications & Licenses
          </Label>
          <Input
            id="certifications"
            placeholder="e.g., CDL, CPR, Forklift Certified, CNA..."
            value={profileData.certifications}
            onChange={(e) => setProfileData(prev => ({ ...prev, certifications: e.target.value }))}
          />
        </div>

        {/* Info Box */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                Get Personalized Recommendations
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The more complete your profile, the better we can match you with relevant jobs, missions, and training opportunities in Montgomery.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BenefitsTab({ profile }: { profile: MissionMemberProfile | undefined }) {
  const queryClient = useQueryClient()
  const { data: catalog } = useQuery<Benefit[]>({
    queryKey: ["benefitsCatalog"],
    queryFn: fetchBenefitsCatalog,
  })
  const { data: redemptions } = useQuery<RewardRedemption[]>({
    queryKey: ["benefitRedemptions"],
    queryFn: () => fetchRedemptions(),
  })
  const redeemMutation = useMutation<
    { success: boolean; redemption?: RewardRedemption; error?: string },
    Error,
    string
  >({
    mutationFn: (benefitId: string) => {
      if (!profile) throw new Error("No profile")
      return redeemBenefit(benefitId, profile, catalog ?? [])
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
        queryClient.invalidateQueries({ queryKey: ["benefitRedemptions"] })
      }
    },
  })

  if (!profile) return <p className="text-sm text-muted-foreground">Loading…</p>

  const availableBenefits = catalog?.filter(b => {
    const check = checkBenefitEligibility(b.id, profile, catalog ?? [])
    return check.eligible || redemptions?.some(r => r.benefitId === b.id)
  }) ?? []

  const lockedBenefits = catalog?.filter(b => {
    const check = checkBenefitEligibility(b.id, profile, catalog ?? [])
    return !check.eligible && !redemptions?.some(r => r.benefitId === b.id)
  }) ?? []

  return (
    <Card className="glass-panel border-white/35 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-base">Benefits & Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">You have {profile?.points ?? 0} points</p>
              <p className="text-sm text-muted-foreground">
                {availableBenefits.length} benefit{availableBenefits.length !== 1 ? 's' : ''} unlocked
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Your points unlock exclusive benefits: priority application status, training vouchers, career coaching, and premium resources.
        </p>

        {availableBenefits.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3">Available Benefits</h4>
            <div className="space-y-3">
              {availableBenefits.map((benefit) => {
                const redeemed = redemptions?.some((r) => r.benefitId === benefit.id)
                return (
                  <div
                    key={benefit.id}
                    className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{benefit.title}</p>
                        {redeemed && <Badge variant="secondary" className="text-xs">Redeemed</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{benefit.description}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <p className="text-xs font-semibold text-primary">{benefit.costPoints} pts</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={redeemed || redeemMutation.isPending}
                      onClick={() => redeemMutation.mutate(benefit.id)}
                    >
                      {redeemed ? "Redeemed" : "Redeem"}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {lockedBenefits.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Locked Benefits
            </h4>
            <div className="space-y-3">
              {lockedBenefits.map((benefit) => {
                const check = checkBenefitEligibility(benefit.id, profile, catalog ?? [])
                return (
                  <div
                    key={benefit.id}
                    className="rounded-2xl border border-white/20 bg-white/10 p-4 opacity-60"
                  >
                    <p className="font-medium">{benefit.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{benefit.description}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <p className="text-xs font-semibold text-muted-foreground">{benefit.costPoints} pts</p>
                      {check.reason && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">• {check.reason}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {catalog?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No benefits available at this time. Check back soon!
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { isAdmin } = useUserRole()
  const { data: profile } = useQuery<MissionMemberProfile>({
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

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex w-full justify-start gap-1 overflow-x-auto">
          <TabsTrigger value="profile" className="shrink-0 gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="shrink-0 gap-2">
            <Shield className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="points" className="shrink-0 gap-2">
            <Trophy className="h-4 w-4" />
            Points
          </TabsTrigger>
          <TabsTrigger value="benefits" className="shrink-0 gap-2">
            <Gift className="h-4 w-4" />
            Benefits
          </TabsTrigger>
          <TabsTrigger value="preferences" className="shrink-0 gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="integrations" className="shrink-0 gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <CareerProfileTab />
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <Card className="glass-panel border-white/35 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/25 bg-white/30 dark:border-white/10 dark:bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      {isAdmin ? <Shield className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Name</p>
                        <p className="font-medium">{userName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Role</p>
                        <Badge variant={isAdmin ? "default" : "secondary"}>
                          {isAdmin ? "Administrator" : "Citizen"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {userEmail && (
                  <div className="rounded-2xl border border-white/25 bg-white/30 dark:border-white/10 dark:bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
                        <Mail className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Email</p>
                        <p className="font-medium">{userEmail}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-white/25 bg-white/30 dark:border-white/10 dark:bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">City</p>
                      <p className="font-medium">{userCity}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-sm text-muted-foreground">
                  💡 Account details are managed by your sign-in provider. Contact your administrator to update your profile information.
                </p>
              </div>
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
              <CardTitle className="text-base">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mission & Activity Notifications */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Missions & Activities
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="missionReminders" defaultChecked />
                    <Label htmlFor="missionReminders" className="text-sm font-normal">
                      Mission step reminders and deadlines
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="missionComplete" defaultChecked />
                    <Label htmlFor="missionComplete" className="text-sm font-normal">
                      Mission completion and rewards
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="newMissions" defaultChecked />
                    <Label htmlFor="newMissions" className="text-sm font-normal">
                      New missions in your sectors
                    </Label>
                  </div>
                </div>
              </div>

              {/* Job Alerts */}
              {!isAdmin && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-sky-500" />
                    Job Opportunities
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="jobMatches" defaultChecked />
                      <Label htmlFor="jobMatches" className="text-sm font-normal">
                        New jobs matching your skills
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="jobSaved" defaultChecked />
                      <Label htmlFor="jobSaved" className="text-sm font-normal">
                        Updates on saved jobs
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="jobWeekly" />
                      <Label htmlFor="jobWeekly" className="text-sm font-normal">
                        Weekly job digest email
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* System & Platform Notifications */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-violet-500" />
                  {isAdmin ? "System Alerts" : "Platform Updates"}
                </h4>
                <div className="space-y-3">
                  {isAdmin ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="emailAlerts" defaultChecked />
                        <Label htmlFor="emailAlerts" className="text-sm font-normal">
                          Critical workforce signals and alerts
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="dailyDigest" />
                        <Label htmlFor="dailyDigest" className="text-sm font-normal">
                          Daily digest of sector updates
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="userActivity" defaultChecked />
                        <Label htmlFor="userActivity" className="text-sm font-normal">
                          User activity and engagement reports
                        </Label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="communityUpdates" defaultChecked />
                        <Label htmlFor="communityUpdates" className="text-sm font-normal">
                          Community updates and announcements
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="achievementBadges" defaultChecked />
                        <Label htmlFor="achievementBadges" className="text-sm font-normal">
                          Achievement unlocks and badges
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="levelUp" defaultChecked />
                        <Label htmlFor="levelUp" className="text-sm font-normal">
                          Level up and milestone notifications
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs text-muted-foreground">
                  💡 Preferences are saved locally. Email notification settings will sync with your account in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
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
        )}
      </Tabs>
    </div>
  )
}

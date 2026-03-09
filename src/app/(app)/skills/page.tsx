"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Search,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  GraduationCap,
  Sparkles,
  Briefcase,
  Activity,
  ArrowUpRight,
  Link2,
  ShieldAlert,
  MapPin,
} from "lucide-react"
import { fetchMissionMemberProfile, fetchPlaybooks, fetchRoles, fetchSectors, fetchSkills, recordSkillAction } from "@/services"
import { SkillsGapPanel } from "@/components/skills/skills-gap-panel"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, statusToColor } from "@/lib/utils"
import { SparklineChart } from "@/components/sectors/sparkline-chart"
import type { PulseStatus, Skill } from "@/services/types"

const CATEGORIES = [
  "All",
  "Cloud Infrastructure",
  "Data Science",
  "Healthcare",
  "Leadership",
  "Operations",
  "Safety Compliance",
  "Software Development",
]

const DEMAND_LEVELS: { value: PulseStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "watch", label: "Watch" },
  { value: "stable", label: "Stable" },
]

const BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

function SkillSkeleton() {
  return (
    <Card className="glass-panel h-full border-white/35 dark:border-white/10">
      <CardContent className="space-y-3 pt-4 pb-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const ALIGNMENT_LABEL: Record<PulseStatus, { text: string; cls: string }> = {
  critical: { text: "High Demand", cls: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700" },
  watch: { text: "Moderate", cls: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700" },
  stable: { text: "Steady", cls: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700" },
}

function SkillCardExpanded({
  skill,
  sectorMap,
  cityJobs,
}: {
  skill: Skill
  sectorMap: Map<string, string>
  cityJobs: { title: string; link: string; salary: string; department: string; sectorId: string | null }[]
}) {
  const [expanded, setExpanded] = useState(false)
  const [jobsExpanded, setJobsExpanded] = useState(false)

  const queryClient = useQueryClient()
  const relatedSectors = useMemo(() => {
    const sectorIds = new Set<string>()
    for (const roleId of skill.relatedRoles) {
      const sid = sectorMap.get(roleId)
      if (sid) sectorIds.add(sid)
    }
    return Array.from(sectorIds)
  }, [skill.relatedRoles, sectorMap])

  // Match city jobs by sector — guaranteed live data from JobAps
  const relatedJobs = useMemo(() => {
    if (relatedSectors.length === 0) return []
    return cityJobs
      .filter((j) => j.sectorId && relatedSectors.includes(j.sectorId))
      .slice(0, 4)
  }, [cityJobs, relatedSectors])

  const alignment = ALIGNMENT_LABEL[skill.demandLevel]
  const trainingCount = skill.trainingResources.length
  const primarySector = relatedSectors[0]
  const awardSkillAction = useMutation({
    mutationFn: ({ action }: { action: "fit" | "pathway" }) => recordSkillAction(skill.id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
    },
  })

  return (
    <Card className="glass-panel card-hover-lift h-full overflow-hidden border-white/35 bg-white/65 dark:border-white/10 dark:bg-white/5">
      <CardContent className="flex h-full flex-col space-y-3 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">{skill.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{skill.category}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge className={cn("text-xs border capitalize", BADGE_CLASS[skill.demandLevel])}>
              {skill.demandLevel}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] border", alignment.cls)}>
              {alignment.text}
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl bg-white/35 px-2 py-2 dark:bg-white/5">
          <SparklineChart data={skill.sparklineData} status={skill.demandLevel} height={40} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/35 p-2.5 dark:bg-white/5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Growth
            </div>
            <span className={cn("mt-1 block text-sm font-semibold", statusToColor(skill.demandLevel))}>
              +{skill.growthRate}%
            </span>
          </div>
          <div className="rounded-2xl bg-white/35 p-2.5 dark:bg-white/5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              Roles
            </div>
            <span className="mt-1 block text-sm font-semibold">{skill.relatedRoles.length}</span>
          </div>
          <div className="rounded-2xl bg-white/35 p-2.5 dark:bg-white/5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <GraduationCap className="h-3 w-3" />
              Pathways
            </div>
            <span className="mt-1 block text-sm font-semibold">{trainingCount}</span>
          </div>
        </div>

        {relatedSectors.length > 0 && (
          <div className="flex flex-wrap items-start gap-1.5">
            <Building2 className="mt-1 h-3 w-3 shrink-0 text-muted-foreground" />
            {relatedSectors.map((sid) => (
              <Badge key={sid} variant="secondary" className="bg-white/60 text-[10px] capitalize dark:bg-white/10">
                {sid.replace(/-/g, " ")}
              </Badge>
            ))}
          </div>
        )}

        {skill.relatedRoles.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>
              {skill.relatedRoles.length} related role{skill.relatedRoles.length !== 1 ? "s" : ""}
            </p>
            {primarySector ? (
              <Link
                href={`/sectors/${primarySector}?tab=roles&skill=${skill.id}`}
                className="inline-flex items-center gap-1 font-medium text-foreground/85 transition-colors hover:text-primary"
                onClick={() => {
                  awardSkillAction.mutate({ action: "fit" })
                }}
              >
                Explore fit
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium text-foreground/85 transition-colors group-hover:text-primary">
                Explore fit
                <ArrowUpRight className="h-3 w-3" />
              </span>
            )}
          </div>
        )}

        {skill.trainingResources.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-between rounded-xl border border-white/30 bg-white/35 px-2 text-xs text-muted-foreground hover:bg-white/55 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              onClick={() => {
                const nextExpanded = !expanded
                setExpanded(nextExpanded)
                if (nextExpanded) {
                  awardSkillAction.mutate({ action: "pathway" })
                }
              }}
            >
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {expanded ? "Hide" : "Show"} training pathways ({skill.trainingResources.length})
              </span>
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            {expanded && (
              <div className="space-y-1.5 pl-1">
                {skill.trainingResources.map((tr) => (
                  <a
                    key={tr.title}
                    href={tr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 rounded-2xl border border-white/30 bg-white/40 px-3 py-2 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 dark:border-white/10 dark:bg-white/5"
                  >
                    <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground group-hover:text-primary" />
                    <div className="min-w-0">
                      <span className="font-medium text-primary hover:underline">
                        {tr.title}
                      </span>
                      <p className="text-muted-foreground">{tr.provider}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-between rounded-xl border border-white/30 bg-white/35 px-2 text-xs text-muted-foreground hover:bg-white/55 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              onClick={() => setJobsExpanded(!jobsExpanded)}
            >
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {jobsExpanded ? "Hide" : "Show"} related jobs ({relatedJobs.length})
              </span>
              {jobsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            {jobsExpanded && (
              <div className="space-y-1.5 pl-1">
                {relatedJobs.slice(0, 4).map((job) => (
                  <a
                    key={job.title}
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 rounded-2xl border border-white/30 bg-white/40 px-3 py-2 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 dark:border-white/10 dark:bg-white/5"
                  >
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground group-hover:text-primary" />
                    <div className="min-w-0">
                      <span className="font-medium text-primary hover:underline line-clamp-1">{job.title}</span>
                      <p className="text-muted-foreground">{job.department}{job.salary ? ` · ${job.salary}` : ""}</p>
                    </div>
                    <ExternalLink className="ml-auto mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function SkillsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [demandLevel, setDemandLevel] = useState<PulseStatus | "all">("all")

  const { data: skills, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: () => fetchSkills(),
  })

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchRoles(),
  })

  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  })
  const { data: memberProfile } = useQuery({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })

  const { data: cityJobsData } = useQuery({
    queryKey: ["cityJobs"],
    queryFn: () => fetch("/api/city-jobs").then((r) => r.json()),
    staleTime: 3600_000,
  })

  const { data: playbooks } = useQuery({
    queryKey: ["playbooks"],
    queryFn: fetchPlaybooks,
    staleTime: 3600_000,
  })
  const cityJobs: { title: string; link: string; salary: string; department: string; sectorId: string | null }[] =
    cityJobsData?.jobs ?? []

  const sectorMap = useMemo(() => {
    const map = new Map<string, string>()
    if (roles) {
      for (const role of roles) map.set(role.id, role.sectorId)
    }
    return map
  }, [roles])

  const filtered = useMemo(() => {
    if (!skills) return []
    return skills.filter((skill) => {
      if (category !== "All" && skill.category !== category) return false
      if (demandLevel !== "all" && skill.demandLevel !== demandLevel) return false
      if (search) {
        const q = search.toLowerCase()
        if (!skill.name.toLowerCase().includes(q) && !skill.category.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [skills, category, demandLevel, search])

  const criticalSkills = skills?.filter((skill) => skill.demandLevel === "critical").length ?? 0
  const watchSkills = skills?.filter((skill) => skill.demandLevel === "watch").length ?? 0
  const stableSkills = skills?.filter((skill) => skill.demandLevel === "stable").length ?? 0
  const topGrowthSkill = useMemo(() => [...(skills ?? [])].sort((a, b) => b.growthRate - a.growthRate)[0] ?? null, [skills])
  const mostConnectedSkill = useMemo(() => [...(skills ?? [])].sort((a, b) => b.relatedRoles.length - a.relatedRoles.length)[0] ?? null, [skills])
  const mostTrainingRichSkill = useMemo(() => [...(skills ?? [])].sort((a, b) => b.trainingResources.length - a.trainingResources.length)[0] ?? null, [skills])
  const sectorCoverage = useMemo(() => {
    const set = new Set<string>()
    if (roles) {
      for (const role of roles) set.add(role.sectorId)
    }
    return set.size
  }, [roles])
  const topLinkedSectors = useMemo(() => {
    const counts = new Map<string, number>()
    for (const skill of skills ?? []) {
      for (const roleId of skill.relatedRoles) {
        const sectorId = sectorMap.get(roleId)
        if (!sectorId) continue
        counts.set(sectorId, (counts.get(sectorId) ?? 0) + 1)
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([sectorId, count]) => ({
        sectorId,
        count,
        label: sectors?.find((sector) => sector.id === sectorId)?.name ?? sectorId.replace(/-/g, " "),
      }))
  }, [sectorMap, sectors, skills])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card-strong card-hover-lift overflow-hidden rounded-[30px] border border-white/40 p-6 dark:border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="primary">
                  Skills intelligence
                </Badge>
                <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
                  {skills?.length ?? 0} tracked skills
                </Badge>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Skills</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Track in-demand skills across Montgomery, connect them to real roles, and surface training pathways that can close workforce readiness gaps faster.
              </p>
            </div>
            <div className="hidden rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary md:block">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-red-300/70 bg-red-50/70 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              <ShieldAlert className="mr-1 h-3 w-3" />
              {criticalSkills} critical
            </Badge>
            <Badge variant="outline" className="border-amber-300/70 bg-amber-50/70 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
              <Activity className="mr-1 h-3 w-3" />
              {watchSkills} watch
            </Badge>
            <Badge variant="outline" className="border-emerald-300/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
              <Sparkles className="mr-1 h-3 w-3" />
              {stableSkills} stable
            </Badge>
            <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
              <Briefcase className="mr-1 h-3 w-3" />
              {roles?.length ?? 0} linked roles
            </Badge>
            <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
              {sectorCoverage} sectors covered
            </Badge>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/30 bg-white/30 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sector linkage</p>
                <p className="mt-1 text-sm font-semibold">Where skill demand is clustering</p>
              </div>
              <Badge variant="primary">
                {topLinkedSectors.length} sectors
              </Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {topLinkedSectors.map((sector) => (
                <div
                  key={sector.sectorId}
                  className="rounded-2xl bg-white/45 px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/60 dark:bg-white/6 dark:hover:bg-white/10"
                >
                  <p className="text-sm font-semibold">{sector.label}</p>
                  <p className="text-xs text-muted-foreground">{sector.count} skill-to-role links</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel card-hover-lift rounded-[30px] border border-white/35 p-5 dark:border-white/10">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Executive Signals</h3>
          </div>
          <div className="space-y-3">
            {memberProfile && (
              <>
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">Skill points</p>
                  <p className="mt-1 text-2xl font-semibold text-primary">{memberProfile.skillPoints} pts</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {memberProfile.skillActionsCompleted} actions: explore fit, open pathways, save trilhas.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Earn points</p>
                  <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                    <p>Role-fit exploration: +10 pts</p>
                    <p>Pathway review: +14 pts</p>
                  </div>
                </div>
              </>
            )}
            <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Fastest growing skill</p>
              <p className="mt-1 text-sm font-semibold">{topGrowthSkill?.name ?? "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {topGrowthSkill ? `+${topGrowthSkill.growthRate}% growth with ${topGrowthSkill.relatedRoles.length} linked roles.` : "Growth data loading."}
              </p>
            </div>
            <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Most connected skill</p>
              <p className="mt-1 text-sm font-semibold">{mostConnectedSkill?.name ?? "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mostConnectedSkill ? `${mostConnectedSkill.relatedRoles.length} roles currently depend on this capability.` : "Connectivity data loading."}
              </p>
            </div>
            <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Best training coverage</p>
              <p className="mt-1 text-sm font-semibold">{mostTrainingRichSkill?.name ?? "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mostTrainingRichSkill ? `${mostTrainingRichSkill.trainingResources.length} mapped training pathways ready to activate.` : "Training coverage loading."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/35 p-3 dark:border-white/10">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border-input/70 bg-white/30 pl-8 dark:bg-white/5"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px] rounded-xl bg-white/30 dark:bg-white/5">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-2xl border border-input/70 bg-white/30 p-1 dark:bg-white/5">
            {DEMAND_LEVELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDemandLevel(value)}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium transition-colors",
                  demandLevel === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
            {filtered.length} visible
          </Badge>
          {category !== "All" && (
            <Badge variant="primary">
              {category}
            </Badge>
          )}
          {search.trim() && (
            <Badge variant="primary">
              Search: {search.trim()}
            </Badge>
          )}
        </div>
      </div>

      {roles && skills && (
        <SkillsGapPanel
          roles={roles}
          skills={skills}
          playbooks={playbooks ?? []}
        />
      )}

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Skill Portfolio</h3>
            <p className="text-sm text-muted-foreground">
              Review demand, sector linkage, and training coverage across Montgomery&apos;s skill base.
            </p>
          </div>
          {topGrowthSkill && (
            <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
              <Link2 className="mr-1 h-3 w-3" />
              Top growth: {topGrowthSkill.name}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? [...Array(9)].map((_, i) => <SkillSkeleton key={i} />)
            : filtered.map((skill) => (
                <SkillCardExpanded key={skill.id} skill={skill} sectorMap={sectorMap} cityJobs={cityJobs} />
              ))}

          {!isLoading && filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No skills match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

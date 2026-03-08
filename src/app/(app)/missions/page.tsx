"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  ArrowRight,
  Plus,
  X,
  Building2,
  Clock,
  CheckCircle2,
  Pause,
  AlertTriangle,
  Trophy,
  Flame,
  Users2,
  Target,
  Medal,
  Sparkles,
  Zap,
} from "lucide-react"
import { fetchMissions, updateMissionStep, createMission, fetchMissionMemberProfile } from "@/services"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUserRole } from "@/hooks/use-user-role"
import type { CreateMissionPayload, Mission, MissionMemberProfile, PulseStatus } from "@/services/types"

type StatusFilter = "all" | "active" | "completed" | "paused"

const STATUS_FILTER_LABELS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
]

const PRIORITY_BADGE: Record<PulseStatus, string> = {
  critical: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
  watch: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  stable: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
}

const STATUS_BADGE: Record<Mission["status"], string> = {
  active: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  completed: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
  paused: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
}

const SECTORS: Record<string, string> = {
  "public-safety": "Public Safety",
  healthcare: "Healthcare",
  technology: "Technology",
  construction: "Construction",
  education: "Education",
  logistics: "Logistics",
  finance: "Finance",
  retail: "Retail",
}

const EMPTY_MISSION_FORM: CreateMissionPayload = {
  title: "",
  description: "",
  priority: "watch",
  sectorId: "",
  dueDate: "",
  steps: [{ title: "", description: "", dueDate: "" }],
}


function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function progressToNextLevel(profile: MissionMemberProfile) {
  const previousLevelPoints = Math.max(0, (profile.level - 1) * 250)
  const currentBand = profile.nextLevelPoints - previousLevelPoints
  const earnedInBand = profile.points - previousLevelPoints
  return Math.max(0, Math.min(100, Math.round((earnedInBand / Math.max(1, currentBand)) * 100)))
}

function MissionCard({ mission }: { mission: Mission }) {
  const [expanded, setExpanded] = useState(false)
  const queryClient = useQueryClient()

  const stepMutation = useMutation({
    mutationFn: ({ stepId, completed }: { stepId: string; completed: boolean }) =>
      updateMissionStep(mission.id, stepId, completed),
    onSuccess: (updatedMission) => {
      queryClient.setQueryData<Mission[]>(["missions"], (old) =>
        old?.map((entry) => (entry.id === updatedMission.id ? updatedMission : entry)) ?? []
      )
      queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
    },
  })

  const completedSteps = mission.steps.filter((step) => step.completed).length
  const stepPoints = Math.max(12, Math.round(mission.rewardPoints / Math.max(3, mission.steps.length + 1)))
  const isOverdue = mission.status !== "completed" && new Date(mission.dueDate) < new Date()
  const sectorLabel = SECTORS[mission.sectorId] ?? mission.sectorId

  return (
    <Card
      className={cn(
        "glass-panel card-hover-lift h-full overflow-hidden border-white/35 bg-white/65 dark:border-white/10 dark:bg-white/5",
        mission.status === "completed" && "border-primary/20 bg-primary/5",
        mission.status === "paused" && "bg-white/45 dark:bg-white/5"
      )}
    >
      <CardContent className="flex h-full flex-col space-y-4 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="bg-white/60 text-[10px] dark:bg-white/10">
                {sectorLabel}
              </Badge>
              <Badge className={cn("border text-[10px] capitalize", STATUS_BADGE[mission.status])}>
                {mission.status}
              </Badge>
              <Badge className={cn("border text-[10px] capitalize", PRIORITY_BADGE[mission.priority])}>
                {mission.priority}
              </Badge>
            </div>
            <p className="mt-3 text-base font-semibold leading-tight">{mission.title}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{mission.description}</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/70">Reward</div>
            <div className="mt-1 text-lg font-semibold text-primary">{mission.rewardPoints}</div>
            <div className="text-[10px] text-primary/80">pts</div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/25 bg-white/35 p-3 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{completedSteps}/{mission.steps.length} steps completed</span>
            <span>{mission.progress}% mission health</span>
          </div>
          <Progress value={mission.progress} className="mt-2 h-2" />
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/55 px-3 py-2 dark:bg-white/5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Users2 className="h-3 w-3" />
                Squad
              </div>
              <p className="mt-1 text-sm font-semibold">{mission.participantCount} members</p>
            </div>
            <div className="rounded-2xl bg-white/55 px-3 py-2 dark:bg-white/5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Due
              </div>
              <p className="mt-1 text-sm font-semibold">{formatShortDate(mission.dueDate)}</p>
            </div>
            <div className="rounded-2xl bg-white/55 px-3 py-2 dark:bg-white/5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <Zap className="h-3 w-3" />
                Step reward
              </div>
              <p className="mt-1 text-sm font-semibold">+{stepPoints} pts</p>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-white/25 bg-white/30 px-3 py-3 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Community impact</p>
              <p className="mt-1 text-sm font-medium leading-relaxed">{mission.communityImpact}</p>
            </div>
            {isOverdue && (
              <Badge className="border border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300">
                Overdue
              </Badge>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {mission.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/65 text-[10px] dark:bg-white/10">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            {mission.assignee ? (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {mission.assignee}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Open for a community lead
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {sectorLabel}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-xl px-2 text-xs text-muted-foreground"
            onClick={() => setExpanded((value) => !value)}
          >
            <span>{expanded ? "Hide" : "Open"} mission loop</span>
            {expanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
          </Button>
        </div>

        {expanded && (
          <div className="grid gap-4 border-t border-white/20 pt-4 dark:border-white/10">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Mission steps</p>
              <div className="space-y-2">
                {mission.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      "rounded-2xl border px-3 py-3 transition-all duration-200",
                      step.completed
                        ? "border-primary/20 bg-primary/5"
                        : "border-white/25 bg-white/35 hover:border-primary/20 hover:bg-white/50 dark:border-white/10 dark:bg-white/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2",
                            step.completed
                              ? "border-green-500 bg-green-500"
                              : "border-muted-foreground/30 bg-background"
                          )}
                        >
                          {step.completed ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : <span className="text-[10px]">{index + 1}</span>}
                        </div>
                        {index < mission.steps.length - 1 && (
                          <div className={cn("mt-1 w-0.5 flex-1 min-h-[22px]", step.completed ? "bg-green-500" : "bg-muted-foreground/20")} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <label htmlFor={step.id} className="cursor-pointer">
                            <p className={cn("text-sm font-medium", step.completed && "line-through text-muted-foreground")}>{step.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                          </label>
                          <Checkbox
                            id={step.id}
                            checked={step.completed}
                            disabled={stepMutation.isPending || mission.status === "completed"}
                            onCheckedChange={(checked) => stepMutation.mutate({ stepId: step.id, completed: !!checked })}
                            className="mt-0.5 shrink-0"
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due {formatShortDate(step.dueDate)}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-primary">
                            <Trophy className="h-3 w-3" />
                            +{stepPoints} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {mission.impactMetrics.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Impact targets</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {mission.impactMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/25 bg-white/35 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                        <span className="text-muted-foreground/80">
                          {metric.before}
                          {metric.unit}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-primary">
                          {metric.after}
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MissionSkeleton() {
  return (
    <Card className="glass-panel border-white/35 dark:border-white/10">
      <CardContent className="space-y-4 pt-4 pb-4">
        <div className="flex justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-16 w-16 rounded-2xl" />
        </div>
        <Skeleton className="h-20 w-full rounded-[24px]" />
        <Skeleton className="h-24 w-full rounded-[24px]" />
      </CardContent>
    </Card>
  )
}

function CreateMissionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreateMissionPayload>({
    ...EMPTY_MISSION_FORM,
    steps: [{ ...EMPTY_MISSION_FORM.steps[0] }],
  })

  const mutation = useMutation({
    mutationFn: () => createMission(form),
    onSuccess: (newMission) => {
      queryClient.setQueryData<Mission[]>(["missions"], (old) => (old ? [newMission, ...old] : [newMission]))
      queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
      setForm({ ...EMPTY_MISSION_FORM, steps: [{ ...EMPTY_MISSION_FORM.steps[0] }] })
      onClose()
    },
  })

  function addStep() {
    setForm((current) => ({
      ...current,
      steps: [...current.steps, { title: "", description: "", dueDate: "" }],
    }))
  }

  function removeStep(index: number) {
    setForm((current) => ({
      ...current,
      steps: current.steps.filter((_, stepIndex) => stepIndex !== index),
    }))
  }

  function updateStep(index: number, field: "title" | "description" | "dueDate", value: string) {
    setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [field]: value } : step
      ),
    }))
  }

  const isValid =
    form.title.trim() !== "" &&
    form.description.trim() !== "" &&
    form.sectorId !== "" &&
    form.dueDate !== "" &&
    form.steps.every((step) => step.title.trim() !== "")

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="glass-panel max-h-[90vh] max-w-2xl overflow-y-auto border-white/30 bg-background/95 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl">Launch a new mission</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-[24px] border border-white/25 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm text-muted-foreground">
              Every new mission creates a visible challenge for the community. Publishing one grants initiative points to your member profile and opens a shared action loop.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-title">Title</Label>
            <Input
              id="m-title"
              placeholder="e.g. Reduce Public Safety Vacancy Rate"
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-desc">Description</Label>
            <Textarea
              id="m-desc"
              placeholder="Describe the outcome this mission should unlock for the community..."
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(value) => setForm((current) => ({ ...current, priority: value as PulseStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sector</Label>
              <Select value={form.sectorId} onValueChange={(value) => setForm((current) => ({ ...current, sectorId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SECTORS).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-due">Due date</Label>
              <Input
                id="m-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((current) => ({ ...current, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mission steps</Label>
              <Badge variant="secondary" className="bg-white/60 dark:bg-white/10">
                {form.steps.length} planned steps
              </Badge>
            </div>
            <div className="space-y-2">
              {form.steps.map((step, index) => (
                <div key={index} className="rounded-2xl border border-white/25 bg-white/35 p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/70 text-[10px] dark:bg-white/10">
                      Step {index + 1}
                    </Badge>
                    {form.steps.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={() => removeStep(index)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder={`Step ${index + 1} title`}
                      value={step.title}
                      onChange={(e) => updateStep(index, "title", e.target.value)}
                    />
                    <Textarea
                      placeholder="Describe the step and what success looks like..."
                      value={step.description}
                      onChange={(e) => updateStep(index, "description", e.target.value)}
                      rows={2}
                    />
                    <Input
                      type="date"
                      value={step.dueDate}
                      onChange={(e) => updateStep(index, "dueDate", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-1 w-full gap-1.5" onClick={addStep}>
              <Plus className="h-3.5 w-3.5" />
              Add step
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? "Launching..." : "Launch mission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MissionsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [createOpen, setCreateOpen] = useState(false)
  const { isAdmin } = useUserRole()

  const { data: missions, isLoading } = useQuery({
    queryKey: ["missions"],
    queryFn: fetchMissions,
  })

  const { data: memberProfile } = useQuery({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })

  const now = new Date()
  const filtered = missions?.filter((mission) => statusFilter === "all" || mission.status === statusFilter) ?? []
  const counts = {
    all: missions?.length ?? 0,
    active: missions?.filter((mission) => mission.status === "active").length ?? 0,
    paused: missions?.filter((mission) => mission.status === "paused").length ?? 0,
    completed: missions?.filter((mission) => mission.status === "completed").length ?? 0,
  }
  const overdueCount =
    missions?.filter((mission) => mission.status !== "completed" && new Date(mission.dueDate) < now).length ?? 0

  const featuredMissions = useMemo(
    () =>
      [...(missions ?? [])]
        .filter((mission) => mission.status !== "completed")
        .sort((a, b) => b.rewardPoints - a.rewardPoints)
        .slice(0, 3),
    [missions]
  )

  const totalAvailablePoints = useMemo(
    () =>
      (missions ?? [])
        .filter((mission) => mission.status === "active")
        .reduce((sum, mission) => sum + mission.rewardPoints, 0),
    [missions]
  )

  const totalParticipants = useMemo(
    () => (missions ?? []).reduce((sum, mission) => sum + mission.participantCount, 0),
    [missions]
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card-strong card-hover-lift overflow-hidden rounded-[30px] border border-white/40 p-6 dark:border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">Mission Hub</Badge>
                <Badge variant="outline" className="border-white/25 bg-white/25 dark:border-white/10 dark:bg-white/5">
                  Community gamification
                </Badge>
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Turn workforce missions into visible community challenges.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Missions now work like a civic progression system: members earn points for moving real initiatives forward, see which challenges matter most, and rally around measurable outcomes instead of passive tracking.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/55 px-3 py-1 text-xs dark:bg-white/10">
                  {counts.active} active missions
                </Badge>
                <Badge variant="secondary" className="bg-white/55 px-3 py-1 text-xs dark:bg-white/10">
                  {totalAvailablePoints} pts available
                </Badge>
                <Badge variant="secondary" className="bg-white/55 px-3 py-1 text-xs dark:bg-white/10">
                  {totalParticipants} members engaged
                </Badge>
                <Badge variant="secondary" className="bg-white/55 px-3 py-1 text-xs dark:bg-white/10">
                  {overdueCount} overdue interventions
                </Badge>
              </div>
            </div>
            {isAdmin && (
              <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Launch Mission
              </Button>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {featuredMissions.map((mission) => (
              <div
                key={mission.id}
                className="rounded-[24px] border border-white/25 bg-white/35 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white/45 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{SECTORS[mission.sectorId] ?? mission.sectorId}</p>
                    <p className="mt-1 text-sm font-semibold leading-tight">{mission.title}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 px-2.5 py-1.5 text-right">
                    <p className="text-sm font-semibold text-primary">{mission.rewardPoints}</p>
                    <p className="text-[10px] text-primary/80">pts</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{mission.communityImpact}</p>
                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users2 className="h-3 w-3" />
                    {mission.participantCount} in squad
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatShortDate(mission.dueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel card-hover-lift rounded-[30px] border border-white/35 p-5 dark:border-white/10">
          {!memberProfile ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-[24px]" />
              <Skeleton className="h-14 w-full rounded-[24px]" />
              <Skeleton className="h-24 w-full rounded-[24px]" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Member profile</p>
                  <p className="mt-1 text-xl font-semibold">{memberProfile.name}</p>
                  <p className="text-sm text-muted-foreground">{memberProfile.role} · {memberProfile.city}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-primary/20 bg-primary/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-primary/80">Level {memberProfile.level}</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">{memberProfile.points} pts</p>
                  </div>
                  <div className="rounded-2xl bg-white/60 px-3 py-2 text-right dark:bg-white/10">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Next unlock</p>
                    <p className="mt-1 text-sm font-semibold">{memberProfile.nextLevelPoints} pts</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-primary/80">
                  <span>Progress to next level</span>
                  <span>{progressToNextLevel(memberProfile)}%</span>
                </div>
                <Progress value={progressToNextLevel(memberProfile)} className="mt-1.5 h-2" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <Flame className="h-3 w-3 text-amber-500" />
                    Streak
                  </div>
                  <p className="mt-1 text-lg font-semibold">{memberProfile.streak} cycles</p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <Medal className="h-3 w-3 text-primary" />
                    Completed
                  </div>
                  <p className="mt-1 text-lg font-semibold">{memberProfile.completedMissionCount}</p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Steps done
                  </div>
                  <p className="mt-1 text-lg font-semibold">{memberProfile.contributedSteps}</p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <Target className="h-3 w-3 text-sky-500" />
                    Workers helped
                  </div>
                  <p className="mt-1 text-lg font-semibold">{memberProfile.helpedWorkers}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Unlocked badges</p>
                <div className="flex flex-wrap gap-2">
                  {memberProfile.badges.map((badge) => (
                    <div key={badge.id} className="rounded-2xl border border-white/25 bg-white/35 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5">
                      <p className="font-medium">{badge.label}</p>
                      <p className="mt-0.5 text-muted-foreground">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/35 px-4 py-3 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTER_LABELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                statusFilter === value
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-transparent bg-white/25 text-muted-foreground hover:border-white/15 hover:bg-white/40 hover:text-foreground dark:bg-white/5 dark:hover:border-white/10 dark:hover:bg-white/10"
              )}
            >
              {label}
              <span className="ml-1.5 opacity-70">({counts[value]})</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1.5 dark:bg-white/5">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            {counts.active} in progress
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1.5 dark:bg-white/5">
            <Pause className="h-3.5 w-3.5 text-slate-500" />
            {counts.paused} paused
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1.5 dark:bg-white/5">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            {overdueCount} overdue
          </span>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Mission board</h3>
            <p className="text-sm text-muted-foreground">
              Each mission mixes real workforce goals with clear rewards, visible progress, and shared participation.
            </p>
          </div>
          {memberProfile && (
            <Badge variant="primary">
              <Trophy className="mr-1 h-3 w-3" />
              {memberProfile.points} pts
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-2">
          {isLoading
            ? [...Array(4)].map((_, index) => <MissionSkeleton key={index} />)
            : filtered.map((mission) => <MissionCard key={mission.id} mission={mission} />)}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-white/30 bg-white/20 px-6 py-12 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
            No missions with status &ldquo;{statusFilter}&rdquo; yet.
          </div>
        )}
      </div>

      <CreateMissionDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

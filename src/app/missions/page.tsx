"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown, ChevronUp, User, Calendar, ArrowRight,
  Plus, X, Building2, Clock, CheckCircle2, Pause, AlertTriangle,
} from "lucide-react"
import { fetchMissions, updateMissionStep, createMission } from "@/services"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import type { Mission, PulseStatus } from "@/services/types"

type StatusFilter = "all" | "active" | "completed" | "paused"

const STATUS_FILTER_LABELS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
]

const PRIORITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  paused: "bg-gray-100 text-gray-700 border-gray-300",
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

function MissionCard({ mission }: { mission: Mission }) {
  const [expanded, setExpanded] = useState(false)
  const queryClient = useQueryClient()

  const stepMutation = useMutation({
    mutationFn: ({ stepId, completed }: { stepId: string; completed: boolean }) =>
      updateMissionStep(mission.id, stepId, completed),
    onSuccess: (updatedMission) => {
      queryClient.setQueryData<Mission[]>(["missions"], (old) =>
        old?.map((m) => (m.id === updatedMission.id ? updatedMission : m)) ?? []
      )
    },
  })

  const completedSteps = mission.steps.filter((s) => s.completed).length

  return (
    <Card className={cn(mission.status === "completed" && "opacity-75")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug">{mission.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mission.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge className={cn("text-xs border capitalize", STATUS_BADGE[mission.status])}>
              {mission.status}
            </Badge>
            <Badge className={cn("text-xs border capitalize", PRIORITY_BADGE[mission.priority])}>
              {mission.priority}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1 mt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedSteps}/{mission.steps.length} steps</span>
            <span>{mission.progress}%</span>
          </div>
          <Progress value={mission.progress} className="h-1.5" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
          {mission.sectorId && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {SECTORS[mission.sectorId] ?? mission.sectorId}
            </span>
          )}
          {mission.assignee && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {mission.assignee}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Due {new Date(mission.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-xs text-muted-foreground h-7 px-1"
          onClick={() => setExpanded((v) => !v)}
        >
          <span>{expanded ? "Hide" : "Show"} steps &amp; impact</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {expanded && (
          <div className="mt-3 space-y-4">
            {/* Step Timeline */}
            <div className="space-y-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Steps</p>
              {mission.steps.map((step, idx) => (
                <div key={step.id} className="flex gap-3">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      step.completed
                        ? "bg-green-500 border-green-500"
                        : "border-muted-foreground/30 bg-background"
                    )}>
                      {step.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    {idx < mission.steps.length - 1 && (
                      <div className={cn(
                        "w-0.5 flex-1 min-h-[24px]",
                        step.completed ? "bg-green-500" : "bg-muted-foreground/20"
                      )} />
                    )}
                  </div>
                  <div className="pb-3 flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id={step.id}
                        checked={step.completed}
                        disabled={stepMutation.isPending || mission.status === "completed"}
                        onCheckedChange={(checked) =>
                          stepMutation.mutate({ stepId: step.id, completed: !!checked })
                        }
                        className="mt-0.5 shrink-0"
                      />
                      <label
                        htmlFor={step.id}
                        className={cn(
                          "text-xs leading-relaxed cursor-pointer",
                          step.completed ? "line-through text-muted-foreground" : ""
                        )}
                      >
                        <span className="font-medium">{step.title}</span>
                        <br />
                        <span className="text-muted-foreground">{step.description}</span>
                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                          Due {new Date(step.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Impact metrics */}
            {mission.impactMetrics.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Impact Targets
                </p>
                <div className="space-y-1.5">
                  {mission.impactMetrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{metric.label}</span>
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-muted-foreground">{metric.before}{metric.unit}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-pulse-stable">{metric.after}{metric.unit}</span>
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
    <Card>
      <CardContent className="pt-4 pb-3 space-y-3">
        <div className="flex justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
      </CardContent>
    </Card>
  )
}

const EMPTY_MISSION_FORM = {
  title: "",
  description: "",
  priority: "watch" as PulseStatus,
  sectorId: "",
  dueDate: "",
  steps: [{ title: "", description: "", dueDate: "" }],
}

function CreateMissionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ ...EMPTY_MISSION_FORM, steps: [{ ...EMPTY_MISSION_FORM.steps[0] }] })

  const mutation = useMutation({
    mutationFn: () => createMission(form),
    onSuccess: (newMission) => {
      queryClient.setQueryData<Mission[]>(["missions"], (old) =>
        old ? [newMission, ...old] : [newMission]
      )
      setForm({ ...EMPTY_MISSION_FORM, steps: [{ title: "", description: "", dueDate: "" }] })
      onClose()
    },
  })

  function addStep() {
    setForm((f) => ({
      ...f,
      steps: [...f.steps, { title: "", description: "", dueDate: "" }],
    }))
  }

  function removeStep(idx: number) {
    setForm((f) => ({
      ...f,
      steps: f.steps.filter((_, i) => i !== idx),
    }))
  }

  function updateStep(idx: number, field: string, value: string) {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }))
  }

  const isValid =
    form.title.trim() !== "" &&
    form.description.trim() !== "" &&
    form.sectorId !== "" &&
    form.dueDate !== "" &&
    form.steps.every((s) => s.title.trim() !== "")

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Mission</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="m-title">Title</Label>
            <Input
              id="m-title"
              placeholder="e.g. Reduce Public Safety Vacancy Rate"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-desc">Description</Label>
            <Textarea
              id="m-desc"
              placeholder="Describe the mission objective..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as PulseStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sector</Label>
              <Select value={form.sectorId} onValueChange={(v) => setForm((f) => ({ ...f, sectorId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SECTORS).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-due">Due Date</Label>
            <Input
              id="m-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Steps</Label>
            <div className="space-y-2">
              {form.steps.map((step, idx) => (
                <div key={idx} className="space-y-1.5 rounded-md border border-border p-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={`Step ${idx + 1} title`}
                      value={step.title}
                      onChange={(e) => updateStep(idx, "title", e.target.value)}
                      className="text-sm"
                    />
                    {form.steps.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeStep(idx)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Description..."
                    value={step.description}
                    onChange={(e) => updateStep(idx, "description", e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={step.dueDate}
                    onChange={(e) => updateStep(idx, "dueDate", e.target.value)}
                    className="text-sm w-auto"
                  />
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="w-full mt-1 gap-1.5" onClick={addStep}>
              <Plus className="h-3.5 w-3.5" /> Add step
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Mission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MissionsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [createOpen, setCreateOpen] = useState(false)

  const { data: missions, isLoading } = useQuery({
    queryKey: ["missions"],
    queryFn: fetchMissions,
  })

  const filtered = missions?.filter(
    (m) => statusFilter === "all" || m.status === statusFilter
  ) ?? []

  const now = new Date()
  const counts = {
    all: missions?.length ?? 0,
    active: missions?.filter((m) => m.status === "active").length ?? 0,
    paused: missions?.filter((m) => m.status === "paused").length ?? 0,
    completed: missions?.filter((m) => m.status === "completed").length ?? 0,
  }
  const overdueCount = missions?.filter(
    (m) => m.status !== "completed" && new Date(m.dueDate) < now
  ).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Missions</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Strategic workforce initiatives — track steps and measure impact.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Mission
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-bold">{counts.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Pause className="h-4 w-4 text-gray-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Paused</p>
              <p className="text-lg font-bold">{counts.paused}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-pulse-stable shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold text-pulse-stable">{counts.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-pulse-critical shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-lg font-bold text-pulse-critical">{overdueCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1 rounded-md border border-input p-1 w-fit">
        {STATUS_FILTER_LABELS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {label}
            <span className="ml-1.5 opacity-60">({counts[value]})</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading
          ? [...Array(4)].map((_, i) => <MissionSkeleton key={i} />)
          : filtered.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}

        {!isLoading && filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No missions with status &ldquo;{statusFilter}&rdquo;.
          </p>
        )}
      </div>

      <CreateMissionDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

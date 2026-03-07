"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Heart,
  Bookmark,
  Plus,
  X,
  GripVertical,
  Search,
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Clock3,
  Target,
  BookOpen,
  Zap,
} from "lucide-react"
import { createPlaybook, fetchMissionMemberProfile, fetchPlaybooks, likePlaybook, savePlaybook } from "@/services"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { CreatePlaybookPayload, Playbook } from "@/services/types"

const SECTORS = [
  { id: "public-safety", name: "Public Safety" },
  { id: "healthcare", name: "Healthcare" },
  { id: "technology", name: "Technology" },
  { id: "construction", name: "Construction" },
  { id: "education", name: "Education" },
  { id: "logistics", name: "Logistics" },
  { id: "finance", name: "Finance" },
  { id: "retail", name: "Retail" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function difficultyLabel(playbook: Playbook) {
  return playbook.difficulty === "starter"
    ? "Starter"
    : playbook.difficulty === "operator"
      ? "Operator"
      : "Advanced"
}

const DIFFICULTY_BADGE: Record<Playbook["difficulty"], string> = {
  starter: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300",
  operator: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300",
  advanced: "border-red-300 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300",
}

function effectivenessScore(pb: Playbook): number {
  return Math.min(5, Math.round(((pb.likes * 2 + pb.saves * 3) / Math.max(1, pb.steps.length)) * 0.5 + 1))
}

function EffectivenessStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("h-3 w-3", n <= score ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  )
}

function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const [expanded, setExpanded] = useState(false)
  const queryClient = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: () => likePlaybook(playbook.id),
    onSuccess: ({ likes }) => {
      queryClient.setQueryData<Playbook[]>(["playbooks"], (old) =>
        old?.map((p) =>
          p.id === playbook.id ? { ...p, likes, hasLiked: !playbook.hasLiked } : p
        ) ?? []
      )
      queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
    },
  })

  const saveMutation = useMutation({
    mutationFn: () => savePlaybook(playbook.id),
    onSuccess: ({ saves }) => {
      queryClient.setQueryData<Playbook[]>(["playbooks"], (old) =>
        old?.map((p) =>
          p.id === playbook.id ? { ...p, saves, hasSaved: !playbook.hasSaved } : p
        ) ?? []
      )
      queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
    },
  })

  const sectorLabel = SECTORS.find((s) => s.id === playbook.sectorId)?.name ?? playbook.sectorId
  const score = effectivenessScore(playbook)

  return (
    <Card className="glass-panel card-hover-lift h-full overflow-hidden border-white/35 bg-white/65 dark:border-white/10 dark:bg-white/5">
      <CardContent className="flex h-full flex-col space-y-4 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-xs">{initials(playbook.authorName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10px]">{sectorLabel}</Badge>
                <Badge className={cn("text-[10px]", DIFFICULTY_BADGE[playbook.difficulty])}>
                  {difficultyLabel(playbook)}
                </Badge>
              </div>
              <p className="mt-2 text-sm font-semibold leading-snug">{playbook.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">by {playbook.authorName}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-[0.14em] text-primary/70">Reward</p>
            <p className="mt-1 text-lg font-semibold text-primary">{playbook.rewardPoints}</p>
            <p className="text-[10px] text-primary/80">pts</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{playbook.summary}</p>

        <div className="rounded-[22px] border border-white/25 bg-white/35 p-3 dark:border-white/10 dark:bg-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Execution & impact</p>
          <p className="mt-1 text-sm font-medium">{playbook.impactSummary}</p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-2xl bg-white/55 px-2.5 py-2 dark:bg-white/10">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock3 className="h-3 w-3" />
                Effort
              </div>
              <p className="mt-1 text-sm font-semibold">{playbook.estimatedHours}h</p>
            </div>
            <div className="rounded-2xl bg-white/55 px-2.5 py-2 dark:bg-white/10">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Trophy className="h-3 w-3 text-primary" />
                Gain
              </div>
              <p className="mt-1 text-sm font-semibold text-primary">{playbook.rewardPoints} pts</p>
            </div>
            <div className="rounded-2xl bg-white/55 px-2.5 py-2 dark:bg-white/10">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                Steps
              </div>
              <p className="mt-1 text-sm font-semibold">{playbook.steps.length}</p>
            </div>
            <div className="rounded-2xl bg-white/55 px-2.5 py-2 dark:bg-white/10">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Target className="h-3 w-3" />
                Fit
              </div>
              <p className="mt-1 text-sm font-semibold">{score}/5</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {playbook.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-white/60 text-[10px] dark:bg-white/10">
              {tag}
            </Badge>
          ))}
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Linked skills</p>
          <div className="flex flex-wrap gap-1.5">
            {playbook.linkedSkills.map((skill) => (
              <Badge key={skill} variant="primary" className="text-[10px]">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <EffectivenessStars score={score} />
          <p className="text-xs text-muted-foreground">
            {new Date(playbook.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-between rounded-xl border border-white/30 bg-white/35 px-2 text-xs text-muted-foreground hover:bg-white/55 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          onClick={() => setExpanded((value) => !value)}
        >
          <span>{expanded ? "Hide" : "Open"} playbook</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {expanded && (
          <div className="space-y-3 border-t border-white/20 pt-3 dark:border-white/10">
            <ol className="space-y-2">
              {playbook.steps.map((step) => (
                <li key={step.order} className="flex gap-2 rounded-2xl bg-white/35 px-3 py-2 text-xs dark:bg-white/5">
                  <span className="font-semibold text-primary shrink-0">{step.order}.</span>
                  <span>{step.instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-white/20 pt-3 dark:border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5 h-8 rounded-xl px-2 text-xs", playbook.hasLiked ? "text-red-500" : "text-muted-foreground")}
            disabled={likeMutation.isPending}
            onClick={() => likeMutation.mutate()}
          >
            <Heart className={cn("h-3.5 w-3.5", playbook.hasLiked && "fill-current")} />
            {playbook.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5 h-8 rounded-xl px-2 text-xs", playbook.hasSaved ? "text-primary" : "text-muted-foreground")}
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Bookmark className={cn("h-3.5 w-3.5", playbook.hasSaved && "fill-current")} />
            {playbook.saves}
          </Button>
          <div className="ml-auto rounded-xl bg-white/35 px-2.5 py-1.5 text-[10px] text-muted-foreground dark:bg-white/5">
            <span className="font-medium text-foreground">{playbook.rewardPoints}</span> pts contributor value
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const EMPTY_FORM: CreatePlaybookPayload = {
  title: "",
  summary: "",
  sectorId: "",
  tags: [],
  steps: [{ order: 1, instruction: "" }],
}

function CreatePlaybookDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreatePlaybookPayload>(EMPTY_FORM)
  const [tagInput, setTagInput] = useState("")

  const createMutation = useMutation({
    mutationFn: () => createPlaybook(form),
    onSuccess: (newPlaybook) => {
      queryClient.setQueryData<Playbook[]>(["playbooks"], (old) =>
        old ? [newPlaybook, ...old] : [newPlaybook]
      )
      queryClient.invalidateQueries({ queryKey: ["missionMemberProfile"] })
      setForm(EMPTY_FORM)
      setTagInput("")
      onClose()
    },
  })

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
    }
    setTagInput("")
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  function addStep() {
    setForm((f) => ({
      ...f,
      steps: [...f.steps, { order: f.steps.length + 1, instruction: "" }],
    }))
  }

  function removeStep(index: number) {
    setForm((f) => ({
      ...f,
      steps: f.steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i + 1 })),
    }))
  }

  function updateStep(index: number, instruction: string) {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) => (i === index ? { ...s, instruction } : s)),
    }))
  }

  const isValid =
    form.title.trim() !== "" &&
    form.summary.trim() !== "" &&
    form.sectorId !== "" &&
    form.steps.every((s) => s.instruction.trim() !== "")

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-panel max-w-2xl max-h-[90vh] overflow-y-auto border-white/30 bg-background/95 dark:border-white/10">
        <DialogHeader>
          <DialogTitle>Create Playbook</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-[22px] border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
            Publishing a playbook adds reusable operating knowledge to the platform and rewards contribution points to your community profile.
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pb-title">Title</Label>
            <Input
              id="pb-title"
              placeholder="e.g. Rapid Onboarding for New Hires"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pb-summary">Summary</Label>
            <Textarea
              id="pb-summary"
              placeholder="Describe what this playbook achieves..."
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Sector</Label>
            <Select
              value={form.sectorId}
              onValueChange={(v) => setForm((f) => ({ ...f, sectorId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="rounded-sm opacity-70 hover:opacity-100"
                      aria-label={`Remove tag ${tag}`}
                      title={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Steps</Label>
            <div className="space-y-2">
              {form.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Step ${index + 1}...`}
                      value={step.instruction}
                      onChange={(e) => updateStep(index, e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  {form.steps.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 mt-1 text-muted-foreground hover:text-destructive"
                      onClick={() => removeStep(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full mt-1 gap-1.5"
              onClick={addStep}
            >
              <Plus className="h-3.5 w-3.5" />
              Add step
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!isValid || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Playbook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PlaybookSkeleton() {
  return (
    <Card className="glass-panel border-white/35 dark:border-white/10">
      <CardContent className="space-y-4 pt-4 pb-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-16 w-16 rounded-2xl" />
        </div>
        <Skeleton className="h-16 w-full rounded-[22px]" />
        <Skeleton className="h-20 w-full rounded-[22px]" />
      </CardContent>
    </Card>
  )
}

export default function PlaybooksPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")

  const { data: playbooks, isLoading } = useQuery({
    queryKey: ["playbooks"],
    queryFn: fetchPlaybooks,
  })
  const { data: memberProfile } = useQuery({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })

  const filtered = useMemo(() => {
    if (!playbooks) return []
    let list = playbooks
    if (sectorFilter !== "all") {
      list = list.filter((p) => p.sectorId === sectorFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [playbooks, sectorFilter, search])

  const recommended = useMemo(() => {
    if (!playbooks || playbooks.length === 0) return []
    return [...playbooks]
      .sort((a, b) => (b.likes * 2 + b.saves * 3) - (a.likes * 2 + a.saves * 3))
      .slice(0, 3)
  }, [playbooks])
  const totalLikes = playbooks?.reduce((sum, playbook) => sum + playbook.likes, 0) ?? 0
  const totalSaves = playbooks?.reduce((sum, playbook) => sum + playbook.saves, 0) ?? 0
  const highestValuePlaybook = recommended[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-card-strong card-hover-lift overflow-hidden rounded-[30px] border border-white/40 p-6 dark:border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="primary">Playbook exchange</Badge>
                <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
                  {playbooks?.length ?? 0} shared playbooks
                </Badge>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Playbooks</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Turn proven workforce tactics into reusable operating knowledge. Save what works, publish what teams can repeat, and reward contributions that make the product smarter.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
                  <Heart className="mr-1 h-3 w-3" />
                  {totalLikes} likes
                </Badge>
                <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
                  <Bookmark className="mr-1 h-3 w-3" />
                  {totalSaves} saves
                </Badge>
                {highestValuePlaybook && (
                  <Badge variant="primary">
                    <Trophy className="mr-1 h-3 w-3" />
                    Top value: {highestValuePlaybook.title}
                  </Badge>
                )}
              </div>
            </div>
            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Playbook
            </Button>
          </div>

          {!isLoading && recommended.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {recommended.map((pb) => (
                <div
                  key={`rec-${pb.id}`}
                  className="rounded-[24px] border border-primary/15 bg-primary/5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/10 dark:border-primary/20 dark:bg-primary/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {SECTORS.find((sector) => sector.id === pb.sectorId)?.name ?? pb.sectorId} · sector fit
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-tight">{pb.title}</p>
                    </div>
                    <div className="rounded-2xl bg-primary/20 px-2.5 py-1.5 text-right">
                      <p className="text-sm font-semibold text-primary">{pb.rewardPoints}</p>
                      <p className="text-[10px] text-primary/80">pts gain</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{pb.impactSummary}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{pb.estimatedHours}h effort</span>
                    <span>{pb.steps.length} steps · apply</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel card-hover-lift rounded-[30px] border border-white/35 p-5 dark:border-white/10">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Contributor Profile</h3>
          </div>
          {memberProfile ? (
            <div className="space-y-3">
              <div className="rounded-[24px] border border-primary/20 bg-primary/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-primary/80">Playbook points</p>
                <p className="mt-1 text-2xl font-semibold text-primary">{memberProfile.playbookPoints}</p>
                <p className="mt-1 text-xs text-muted-foreground">Earned from publishing, liking, and saving reusable interventions.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    Created
                  </div>
                  <p className="mt-1 text-lg font-semibold">{memberProfile.playbooksCreated}</p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Bookmark className="h-3 w-3" />
                    Saved
                  </div>
                  <p className="mt-1 text-lg font-semibold">{memberProfile.playbooksSaved}</p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    Liked
                  </div>
                  <p className="mt-1 text-lg font-semibold">{memberProfile.playbooksLiked}</p>
                </div>
                <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    Total level
                  </div>
                  <p className="mt-1 text-lg font-semibold">{memberProfile.level}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/35 p-3 dark:bg-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Points: contribution, curation, reuse</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>Create & publish: +24 pts</p>
                  <p>Save for reuse: +12 pts</p>
                  <p>Like / validate: +6 pts</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-[24px]" />
              <Skeleton className="h-24 w-full rounded-[24px]" />
            </div>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="glass-panel flex flex-col gap-3 rounded-[24px] border border-white/35 p-3 dark:border-white/10 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playbooks..."
            className="pl-9 h-9 rounded-xl bg-white/30 dark:bg-white/5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-full sm:w-[220px] h-9 rounded-xl bg-white/30 dark:bg-white/5">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {SECTORS.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Playbook Library</h3>
            <p className="text-sm text-muted-foreground">
              Reusable workforce actions with implementation effort, impact framing, and linked skills.
            </p>
          </div>
          <Badge variant="outline" className="border-white/35 bg-white/40 text-foreground/80 dark:border-white/10 dark:bg-white/5">
            {filtered.length} visible
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [...Array(6)].map((_, i) => <PlaybookSkeleton key={i} />)
          : filtered.length === 0
            ? (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                No playbooks match your filters.
              </p>
            )
            : filtered.map((pb) => <PlaybookCard key={pb.id} playbook={pb} />)}
        </div>
      </div>

      <CreatePlaybookDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

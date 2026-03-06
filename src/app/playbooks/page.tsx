"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Heart, Bookmark, Plus, X, GripVertical, Search, Star, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { fetchPlaybooks, likePlaybook, savePlaybook, createPlaybook } from "@/services"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import type { Playbook, CreatePlaybookPayload } from "@/services/types"

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
    },
  })

  const sectorLabel = SECTORS.find((s) => s.id === playbook.sectorId)?.name ?? playbook.sectorId
  const score = effectivenessScore(playbook)

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">{initials(playbook.authorName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm leading-snug">{playbook.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">by {playbook.authorName}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {playbook.summary}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">{sectorLabel}</Badge>
          {playbook.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
          {playbook.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">+{playbook.tags.length - 3}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <EffectivenessStars score={score} />
          <p className="text-xs text-muted-foreground">{playbook.steps.length} steps</p>
        </div>

        {/* Expandable steps */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-xs text-muted-foreground h-7 px-1"
          onClick={() => setExpanded((v) => !v)}
        >
          <span>{expanded ? "Hide" : "View"} steps</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
        {expanded && (
          <ol className="space-y-1.5 pl-1">
            {playbook.steps.map((step) => (
              <li key={step.order} className="text-xs flex gap-2">
                <span className="font-semibold text-muted-foreground shrink-0">{step.order}.</span>
                <span>{step.instruction}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border">
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5 h-7 px-2 text-xs",
              playbook.hasLiked ? "text-red-500" : "text-muted-foreground"
            )}
            disabled={likeMutation.isPending}
            onClick={() => likeMutation.mutate()}
          >
            <Heart
              className={cn("h-3.5 w-3.5", playbook.hasLiked && "fill-current")}
            />
            {playbook.likes}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5 h-7 px-2 text-xs",
              playbook.hasSaved ? "text-primary" : "text-muted-foreground"
            )}
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Bookmark
              className={cn("h-3.5 w-3.5", playbook.hasSaved && "fill-current")}
            />
            {playbook.saves}
          </Button>

          <span className="ml-auto text-xs text-muted-foreground">
            {new Date(playbook.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </CardFooter>
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Playbook</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
    <Card>
      <CardContent className="pt-4 pb-3 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Playbooks</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Community-shared workforce strategies. Like, save, and contribute your own.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Playbook
        </Button>
      </div>

      {/* Recommended for Montgomery */}
      {!isLoading && recommended.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Recommended for Montgomery</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {recommended.map((pb) => (
              <PlaybookCard key={`rec-${pb.id}`} playbook={pb} />
            ))}
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playbooks..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-9">
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

      <CreatePlaybookDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

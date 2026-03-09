"use client"

import { useMemo } from "react"
import { AlertCircle, CheckCircle2, Clock3, Database, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type SourceMap = Record<string, { count: number; errors: string[]; url: string; source: string }>

interface SourceJob {
  dataSource: string
  title: string
  link: string
  salary?: string
  filingDeadline?: string
  location?: string
  sectorId?: string | null
  description?: string
}

interface SourceMetadataGridProps {
  jobs: SourceJob[]
  sources?: SourceMap
  cityLastFetched?: string
}

type SourceCard = {
  id: string
  label: string
  host: string
  jobs: number
  errors: string[]
  freshness: string
  metadata: {
    salaryPct: number
    deadlinePct: number
    locationPct: number
    sectorPct: number
    descriptionPct: number
  }
  fields: string[]
}

const SOURCE_LABELS: Record<string, string> = {
  jobaps: "City of Montgomery",
  usajobs: "USAJOBS",
  indeed: "Indeed",
  linkedin: "LinkedIn",
  glassdoor: "Glassdoor",
}

function toPercent(part: number, total: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

function toHost(url?: string) {
  if (!url) return "Unknown"
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function formatRefreshLabel(value?: string) {
  if (!value) return "Unknown"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function sourceStatusVariant(jobs: number, errors: string[]) {
  const activeErrors = errors.filter((entry) => !(entry === "Scraping disabled" || entry.includes("not configured")))
  if (jobs > 0 && activeErrors.length === 0) return { label: "Healthy", variant: "primary" as const }
  if (jobs > 0 && activeErrors.length > 0) return { label: "Partial", variant: "secondary" as const }
  if (activeErrors.length > 0) return { label: "Blocked", variant: "destructive" as const }
  return { label: "Idle", variant: "secondary" as const }
}

export function SourceMetadataGrid({ jobs, sources, cityLastFetched }: SourceMetadataGridProps) {
  const cards = useMemo<SourceCard[]>(() => {
    const grouped = new Map<string, SourceJob[]>()
    for (const job of jobs) {
      const key = job.dataSource || "unknown"
      const list = grouped.get(key) ?? []
      list.push(job)
      grouped.set(key, list)
    }

    const sourceIds = new Set<string>([...grouped.keys(), ...Object.keys(sources ?? {})])

    return Array.from(sourceIds)
      .map((id) => {
        const bucket = grouped.get(id) ?? []
        const sourceMeta = sources?.[id]
        const total = bucket.length

        const salaryCount = bucket.filter((job) => Boolean(job.salary?.trim())).length
        const deadlineCount = bucket.filter((job) => Boolean(job.filingDeadline?.trim())).length
        const locationCount = bucket.filter((job) => Boolean(job.location?.trim())).length
        const sectorCount = bucket.filter((job) => Boolean(job.sectorId)).length
        const descriptionCount = bucket.filter((job) => Boolean(job.description?.trim())).length

        const fields = [
          total > 0 ? "title" : "",
          total > 0 ? "link" : "",
          locationCount > 0 ? "location" : "",
          salaryCount > 0 ? "salary" : "",
          deadlineCount > 0 ? "filingDeadline" : "",
          sectorCount > 0 ? "sectorId" : "",
          descriptionCount > 0 ? "description" : "",
        ].filter(Boolean)

        return {
          id,
          label: sourceMeta?.source ?? SOURCE_LABELS[id] ?? id,
          host: toHost(sourceMeta?.url),
          jobs: sourceMeta?.count ?? total,
          errors: sourceMeta?.errors ?? [],
          freshness: id === "jobaps" ? formatRefreshLabel(cityLastFetched) : "Live pull",
          metadata: {
            salaryPct: toPercent(salaryCount, total),
            deadlinePct: toPercent(deadlineCount, total),
            locationPct: toPercent(locationCount, total),
            sectorPct: toPercent(sectorCount, total),
            descriptionPct: toPercent(descriptionCount, total),
          },
          fields,
        }
      })
      .sort((a, b) => b.jobs - a.jobs)
  }, [jobs, sources, cityLastFetched])

  if (cards.length === 0) {
    return (
      <Card className="glass-panel border-white/35 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Source Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No source metadata is available yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-panel border-white/35 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Source Metadata
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const status = sourceStatusVariant(card.jobs, card.errors)
            return (
              <div
                key={card.id}
                className="rounded-2xl border border-white/25 bg-white/30 p-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight truncate">{card.label}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                      <LinkIcon className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{card.host}</span>
                    </p>
                  </div>
                  <Badge variant={status.variant} className="h-5 text-[10px] flex-shrink-0">
                    {status.label}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl bg-black/[0.04] p-2 dark:bg-white/[0.04]">
                    <p className="text-muted-foreground">Jobs</p>
                    <p className="font-semibold">{card.jobs.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-black/[0.04] p-2 dark:bg-white/[0.04]">
                    <p className="text-muted-foreground">Refresh</p>
                    <p className="font-semibold truncate">{card.freshness}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground truncate">Salary coverage</span>
                    <span className="font-medium ml-2">{card.metadata.salaryPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground truncate">Deadline coverage</span>
                    <span className="font-medium ml-2">{card.metadata.deadlinePct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground truncate">Location coverage</span>
                    <span className="font-medium ml-2">{card.metadata.locationPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground truncate">Sector tagging</span>
                    <span className="font-medium ml-2">{card.metadata.sectorPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground truncate">Description coverage</span>
                    <span className="font-medium ml-2">{card.metadata.descriptionPct}%</span>
                  </div>
                </div>

                {card.fields.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {card.fields.map((field) => (
                      <span
                        key={field}
                        className="rounded-md border border-white/30 bg-white/45 px-1.5 py-0.5 text-[10px] text-muted-foreground dark:border-white/15 dark:bg-white/10"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                )}

                {card.errors.length > 0 && (
                  <div
                    className={cn(
                      "mt-3 rounded-lg px-2 py-1.5 text-[10px]",
                      status.label === "Blocked"
                        ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {status.label === "Blocked" ? <AlertCircle className="h-3 w-3 flex-shrink-0" /> : <Clock3 className="h-3 w-3 flex-shrink-0" />}
                      <span className="font-medium">{card.errors.length} issue(s)</span>
                    </div>
                    <p className="mt-1 line-clamp-2 break-words">{card.errors.join("; ")}</p>
                  </div>
                )}

                {card.errors.length === 0 && (
                  <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>No ingestion issues reported</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

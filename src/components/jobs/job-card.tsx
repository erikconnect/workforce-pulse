"use client"

import { ExternalLink, Heart, Building2, DollarSign, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CityJob {
  title: string
  link: string
  salary: string
  department: string
  jobType: string
  filingDeadline: string
  employmentType: string
  sectorId: string | null
  description?: string
  location?: string
}

const SOURCE_LABELS: Record<string, string> = {
  jobaps:    "City of Montgomery",
  usajobs:   "Federal (USAJOBS)",
  indeed:    "Indeed",
  linkedin:  "LinkedIn",
  glassdoor: "Glassdoor",
}

const SOURCE_COLORS: Record<string, string> = {
  jobaps:    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  usajobs:   "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  indeed:    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  linkedin:  "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  glassdoor: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
}

const SECTOR_COLORS: Record<string, string> = {
  "public-safety": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  healthcare: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  technology: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  construction: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  education: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  logistics: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  finance: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  retail: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
}

const SECTOR_DOT: Record<string, string> = {
  "public-safety": "#ef4444",
  healthcare: "#10b981",
  technology: "#3b82f6",
  construction: "#f59e0b",
  education: "#8b5cf6",
  logistics: "#f97316",
  finance: "#06b6d4",
  retail: "#ec4899",
}

function formatSectorLabel(sectorId: string) {
  return sectorId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function getDeadlineDays(deadline: string): number | null {
  if (!deadline) return null
  const parsed = new Date(deadline)
  if (isNaN(parsed.getTime())) return null
  return Math.ceil((parsed.getTime() - Date.now()) / 86400000)
}

interface JobCardProps {
  job: CityJob
  interested: boolean
  onToggleInterest: () => void
  dataSource?: string
}

export function JobCard({ job, interested, onToggleInterest, dataSource }: JobCardProps) {
  const sectorColor = job.sectorId ? SECTOR_COLORS[job.sectorId] : undefined
  const sectorDot = job.sectorId ? (SECTOR_DOT[job.sectorId] ?? "#8b5cf6") : "#8b5cf6"
  const deadlineDays = getDeadlineDays(job.filingDeadline)
  const isUrgent = deadlineDays !== null && deadlineDays >= 0 && deadlineDays <= 7
  const isClosed = deadlineDays !== null && deadlineDays < 0
  const sourceLabel = dataSource ? (SOURCE_LABELS[dataSource] ?? dataSource) : null
  const sourceColor = dataSource ? (SOURCE_COLORS[dataSource] ?? "bg-muted text-muted-foreground") : null

  // Trim description to ~140 chars for the card preview
  const descriptionPreview = job.description
    ? job.description.length > 140
      ? job.description.slice(0, 140).trimEnd() + "…"
      : job.description
    : null

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-5 card-hover-lift transition-all flex flex-col",
        isUrgent && "ring-1 ring-amber-400/60"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: `${sectorDot}1a` }}
        >
          <Building2 className="h-5 w-5" style={{ color: sectorDot }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-tight">{job.title}</h3>
            {isUrgent && !isClosed && (
              <Badge className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-0 shrink-0">
                Closing soon
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{job.department}</p>
        </div>
      </div>

      {/* Description */}
      {descriptionPreview && (
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {descriptionPreview}
        </p>
      )}

      {/* Details */}
      <div className="mt-3 space-y-2">
        {/* Location */}
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">{job.location}</span>
          </div>
        )}

        {/* Salary */}
        {job.salary && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {job.salary}
            </span>
          </div>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          {job.sectorId && (
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-0", sectorColor)}>
              {formatSectorLabel(job.sectorId)}
            </Badge>
          )}
          {sourceLabel && (
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-0", sourceColor)}>
              {sourceLabel}
            </Badge>
          )}
          {job.employmentType && job.employmentType !== job.jobType && (
            <Badge variant="secondary" className="text-[10px]">
              {job.employmentType}
            </Badge>
          )}
          {job.jobType && (
            <Badge variant="secondary" className="text-[10px]">
              {job.jobType}
            </Badge>
          )}
        </div>

        {/* Deadline */}
        {job.filingDeadline && (
          <div
            className={cn(
              "flex items-center gap-1.5 text-[11px]",
              isClosed
                ? "text-red-500 dark:text-red-400"
                : isUrgent
                ? "text-amber-600 dark:text-amber-400 font-medium"
                : "text-muted-foreground"
            )}
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              {isClosed
                ? `Closed ${job.filingDeadline}`
                : isUrgent
                ? `Closes in ${deadlineDays}d — ${job.filingDeadline}`
                : `Deadline: ${job.filingDeadline}`}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/40">
        {isClosed ? (
          <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>Application Closed</span>
          </div>
        ) : (
          <Button size="sm" className="flex-1 gap-1.5 rounded-xl" asChild>
            <a href={job.link} target="_blank" rel="noopener noreferrer">
              View & Apply <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
        <Button
          size="sm"
          variant={interested ? "default" : "outline"}
          className="gap-1.5 rounded-xl"
          onClick={onToggleInterest}
        >
          <Heart className={cn("h-3.5 w-3.5", interested && "fill-current")} />
          {interested ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  )
}


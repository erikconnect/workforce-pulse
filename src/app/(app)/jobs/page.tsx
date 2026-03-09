"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Briefcase, Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { JobCard } from "@/components/jobs/job-card"
import { JobDataStatus } from "@/components/dashboard/job-data-status"
import { SourceMetadataGrid } from "@/components/jobs/source-metadata-grid"
import { JobRecommendationsPanel } from "@/components/jobs/job-recommendations-panel"
import { useUserRole } from "@/hooks/use-user-role"
import { fetchJobInsights } from "@/services"
import type { JobPosting } from "@/services/types"

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

// Unified shape used internally in this page
interface DisplayJob extends CityJob {
  dataSource: string
  description: string
  location: string
}

interface CityJobsResponse {
  count: number
  lastFetched: string
  bySector: Record<string, number>
  jobs: CityJob[]
}

interface PostingsResponse {
  count: number
  postings: JobPosting[]
}

interface JobInsightsResponse {
  count: number
  insights: unknown
  sources?: Record<string, { count: number; errors: string[]; url: string; source: string }>
}

function normalizePosting(p: JobPosting): DisplayJob {
  // For federal/scraped jobs, estimate deadline as 30 days from posted date
  const estimateDeadline = (postedDate: string) => {
    try {
      const posted = new Date(postedDate)
      const deadline = new Date(posted)
      deadline.setDate(deadline.getDate() + 30)
      return deadline.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    } catch {
      return ""
    }
  }

  return {
    title: p.title,
    link: p.url,
    salary: p.salary ?? "",
    department: p.org,
    jobType: p.jobType ?? "",
    filingDeadline: estimateDeadline(p.postedDate),
    employmentType: p.jobType ?? "",
    sectorId: p.sectorId,
    dataSource: p.source,
    description: p.description,
    location: p.location ?? "Montgomery, AL",
  }
}

const SECTORS = [
  { id: "all", label: "All Sectors" },
  { id: "public-safety", label: "Public Safety" },
  { id: "healthcare", label: "Healthcare" },
  { id: "technology", label: "Technology" },
  { id: "construction", label: "Construction" },
  { id: "education", label: "Education" },
  { id: "logistics", label: "Logistics" },
  { id: "finance", label: "Finance" },
  { id: "retail", label: "Retail" },
]

const DATA_SOURCES = [
  { id: "all", label: "All Sources" },
  { id: "jobaps", label: "City of Montgomery" },
  { id: "usajobs", label: "Federal (USAJOBS)" },
  { id: "indeed", label: "Indeed" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "glassdoor", label: "Glassdoor" },
]

function useInterestedJobs() {
  const [interested, setInterested] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wp-interested-jobs")
      if (stored) setInterested(new Set(JSON.parse(stored)))
    } catch { /* ignore */ }
  }, [])

  const toggle = useCallback((link: string) => {
    setInterested((prev) => {
      const next = new Set(prev)
      if (next.has(link)) next.delete(link)
      else next.add(link)
      try {
        localStorage.setItem("wp-interested-jobs", JSON.stringify(Array.from(next)))
      } catch { /* ignore */ }
      return next
    })
  }, [])

  return { interested, toggle }
}

function isJobOpen(filingDeadline: string): boolean {
  if (!filingDeadline) return true
  try {
    const deadline = new Date(filingDeadline)
    return deadline.getTime() > Date.now()
  } catch {
    return true
  }
}

export default function JobsPage() {
  const [search, setSearch] = useState("")
  const [sector, setSector] = useState("all")
  const [dataSource, setDataSource] = useState("all")
  const [openOnly, setOpenOnly] = useState(false)
  const { interested, toggle } = useInterestedJobs()
  const { isAdmin } = useUserRole()

  const { data: cityData, isLoading: cityLoading } = useQuery<CityJobsResponse>({
    queryKey: ["cityJobs"],
    queryFn: () => fetch("/api/city-jobs").then((r) => r.json()),
    staleTime: 3600_000,
  })

  // Admin-only: fetch all postings from the job store (USAJOBS + scraped sources)
  const { data: postingsData, isLoading: postingsLoading } = useQuery<PostingsResponse>({
    queryKey: ["allJobPostings"],
    queryFn: () => fetch("/api/jobs/postings").then((r) => r.json()),
    staleTime: 3600_000,
    enabled: isAdmin,
  })

  const { data: jobInsightsData } = useQuery<JobInsightsResponse>({
    queryKey: ["job-insights"],
    queryFn: fetchJobInsights,
    staleTime: 60_000,
    enabled: isAdmin,
  })

  // Merge city jobs + store postings for admin; city only for citizen
  const allJobs = useMemo<DisplayJob[]>(() => {
    const cityJobs: DisplayJob[] = (cityData?.jobs ?? []).map((job) => ({
      ...job,
      dataSource: "jobaps",
      description: job.description || `${job.title} position in ${job.department}`,
      location: job.location || "Montgomery, AL",
      salary: job.salary || "",
      jobType: job.jobType || "",
      employmentType: job.employmentType || job.jobType || "",
    }))

    if (!isAdmin) return cityJobs

    // Normalize store postings
    const storeJobs: DisplayJob[] = (postingsData?.postings ?? []).map(normalizePosting)

    // Deduplicate: prefer city-jobs entry (has deadline info) over store entry for jobaps source
    const seenLinks = new Set(cityJobs.map((j) => j.link))
    const extraJobs = storeJobs.filter((j) => j.link && !seenLinks.has(j.link))

    return [...cityJobs, ...extraJobs]
  }, [cityData?.jobs, postingsData?.postings, isAdmin])

  const isLoading = cityLoading || (isAdmin && postingsLoading)

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (sector !== "all" && job.sectorId !== sector) return false
      if (isAdmin && dataSource !== "all" && job.dataSource !== dataSource) return false
      if (openOnly && !isJobOpen(job.filingDeadline)) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          job.title.toLowerCase().includes(q) ||
          job.department.toLowerCase().includes(q) ||
          (job.salary && job.salary.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [allJobs, sector, dataSource, search, isAdmin, openOnly])

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="opacity-0 animate-fade-in-up animate-stagger-1">
        <div className="flex items-center gap-3">
          <Briefcase className="h-7 w-7 text-primary" />
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Job Opportunities
          </h1>
          {allJobs.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {allJobs.length} positions
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAdmin
            ? "All job sources — City of Montgomery, federal, and scraped listings."
            : "Browse open City of Montgomery positions and apply directly."}
        </p>
      </div>

      {isAdmin && (
        <div className="opacity-0 animate-fade-in-up animate-stagger-2">
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <JobDataStatus />
            <SourceMetadataGrid
              jobs={allJobs}
              sources={jobInsightsData?.sources}
              cityLastFetched={cityData?.lastFetched}
            />
          </div>
        </div>
      )}

      {/* Recommendations: skills in demand + playbooks */}
      <div className="opacity-0 animate-fade-in-up animate-stagger-2">
        <JobRecommendationsPanel />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 opacity-0 animate-fade-in-up animate-stagger-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, department, or salary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-white/30 dark:bg-white/5 border-white/30"
          />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl bg-white/30 dark:bg-white/5 border-white/30">
            <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            {SECTORS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={dataSource} onValueChange={setDataSource}>
            <SelectTrigger className="w-full sm:w-52 rounded-xl bg-white/30 dark:bg-white/5 border-white/30">
              <SelectValue placeholder="Data source" />
            </SelectTrigger>
            <SelectContent>
              {DATA_SOURCES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant={openOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setOpenOnly(!openOnly)}
          className="w-full rounded-xl sm:w-auto"
        >
          <Search className="h-4 w-4 mr-2" />
          {openOnly ? "Open Only" : "All Jobs"}
        </Button>
      </div>

      {/* Results */}
      <div className="opacity-0 animate-fade-in-up animate-stagger-3">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-white/20 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-semibold">No positions found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {search || sector !== "all" || (isAdmin && dataSource !== "all")
                ? "Try adjusting your filters."
                : "No open positions at the moment. Check back soon."}
            </p>
            {(search || sector !== "all" || (isAdmin && dataSource !== "all")) && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSearch("")
                  setSector("all")
                  setDataSource("all")
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Showing {filteredJobs.length} of {allJobs.length} positions
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.link || job.title}
                  job={job}
                  interested={interested.has(job.link)}
                  onToggleInterest={() => toggle(job.link)}
                  dataSource={isAdmin ? job.dataSource : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

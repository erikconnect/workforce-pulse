"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Briefcase, Search, SlidersHorizontal, Lock, ArrowRight, LayoutDashboard, User } from "lucide-react"
import Link from "next/link"
import { MontgomeryCityBadge } from "@/components/branding/montgomery-city-badge"
import { WorkforcePulseMark } from "@/components/branding/workforce-icons"
import { ThemeToggle } from "@/components/layout/theme-toggle"
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
  const { data: session } = useSession()
  const isAuthenticated = !!session
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

  // Fetch all persisted postings from the shared store for every visitor.
  // Role-based differences are handled in the UI, not in data availability.
  const { data: postingsData, isLoading: postingsLoading } = useQuery<PostingsResponse>({
    queryKey: ["allJobPostings"],
    queryFn: () => fetch("/api/jobs/postings").then((r) => r.json()),
    staleTime: 3600_000,
  })

  const { data: jobInsightsData } = useQuery<JobInsightsResponse>({
    queryKey: ["job-insights"],
    queryFn: fetchJobInsights,
    staleTime: 60_000,
    enabled: isAuthenticated && isAdmin,
  })

  // Merge city jobs + persisted store postings for all users.
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

    // Normalize store postings
    const storeJobs: DisplayJob[] = (postingsData?.postings ?? []).map(normalizePosting)

    // Deduplicate: prefer city-jobs entry over store entry for jobaps source
    const seenLinks = new Set(cityJobs.map((j) => j.link))
    const extraJobs = storeJobs.filter((j) => j.link && !seenLinks.has(j.link))

    return [...cityJobs, ...extraJobs]
  }, [cityData?.jobs, postingsData?.postings])

  const isLoading = cityLoading || postingsLoading

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (sector !== "all" && job.sectorId !== sector) return false
      if (isAuthenticated && isAdmin && dataSource !== "all" && job.dataSource !== dataSource) return false
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
  }, [allJobs, sector, dataSource, search, isAuthenticated, isAdmin, openOnly])

  // Main content component
  const jobsContent = (
    <>
      {/* Premium Features Banner - only for non-authenticated users */}
      {!isAuthenticated && (
        <div className="glass-card rounded-[24px] p-6 border-2 border-primary/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Unlock Full Features</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a free account to access personalized job recommendations, saved searches, skill tracking, and dashboard analytics tailored to your role.
                </p>
              </div>
            </div>
            <Button asChild className="rounded-xl shrink-0">
              <Link href="/login">
                Get Started <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Features Badge - for authenticated users */}
      {isAuthenticated && (
        <div className="glass-card rounded-[24px] p-4 border border-primary/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Premium Access Active</p>
                <p className="text-xs text-muted-foreground">
                  Viewing {allJobs.length} jobs from all sources
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="opacity-0 animate-fade-in-up animate-stagger-1">
        <div className="flex items-center gap-3">
          <Briefcase className="h-7 w-7 text-primary" />
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Job Opportunities in Montgomery
          </h1>
          {allJobs.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {allJobs.length} positions
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAuthenticated && isAdmin
            ? "All job sources — City of Montgomery, federal, and scraped listings from Indeed, LinkedIn, and Glassdoor."
            : isAuthenticated
            ? "Browse jobs aggregated from City of Montgomery, federal, and external sources."
            : "Browse all aggregated job listings. Sign in for personalized recommendations and advanced tools."}
        </p>
      </div>

      {/* Data sources info - for authenticated admin users */}
      {isAuthenticated && isAdmin && (
        <div className="opacity-0 animate-fade-in-up animate-stagger-2">
          <div className="glass-card rounded-[24px] p-4">
            <h3 className="text-sm font-semibold mb-3">Data Sources</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {jobInsightsData?.sources && Object.entries(jobInsightsData.sources).map(([source, data]) => (
                <div key={source} className="flex items-center justify-between p-2 rounded-lg bg-white/30 dark:bg-white/5">
                  <span className="text-xs font-medium capitalize">{source}</span>
                  <Badge variant="outline" className="text-xs">{data.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
        {isAuthenticated && isAdmin && (
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
        <div className="flex gap-1 bg-white/20 dark:bg-white/10 rounded-xl p-1 w-full sm:w-auto">
          <Button
            variant={!openOnly ? "default" : "ghost"}
            size="sm"
            onClick={() => setOpenOnly(false)}
            className="flex-1 sm:flex-none text-xs rounded-lg"
          >
            All Jobs
          </Button>
          <Button
            variant={openOnly ? "default" : "ghost"}
            size="sm"
            onClick={() => setOpenOnly(true)}
            className="flex-1 sm:flex-none text-xs rounded-lg"
          >
            Open Only
          </Button>
        </div>
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
              {search || sector !== "all" || (isAuthenticated && isAdmin && dataSource !== "all")
                ? "Try adjusting your filters."
                : "No open positions at the moment. Check back soon."}
            </p>
            {(search || sector !== "all" || (isAuthenticated && isAdmin && dataSource !== "all")) && (
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
                  dataSource={isAuthenticated && isAdmin ? job.dataSource : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA - only for non-authenticated users */}
      {!isAuthenticated && (
        <div className="glass-card rounded-[24px] p-8 text-center space-y-4 mt-12">
          <h3 className="font-display text-xl font-bold">Want More Opportunities?</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Sign up for a free account to save opportunities, receive recommendations based on your skills, and track progress from your dashboard.
          </p>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/login">Create Free Account</Link>
          </Button>
        </div>
      )}
    </>
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 glass-page-bg" aria-hidden />
      <div className="pointer-events-none absolute left-[-8rem] top-[-4rem] h-72 w-72 rounded-full bg-white/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(0,89,142,0.18)_0%,rgba(209,154,71,0.12)_52%,transparent_72%)] blur-3xl" aria-hidden />

      <div className="relative z-10 px-4 py-6 md:px-8 md:py-8">
        {/* Header with navigation */}
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 mb-8">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_16px_rgba(209,154,71,0.12),0_12px_24px_rgba(0,93,122,0.12)]">
              <WorkforcePulseMark className="h-7 w-7" />
            </div>
            <div>
              <span className="block font-display text-xl font-semibold">Workforce Pulse</span>
              <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Montgomery Jobs</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <MontgomeryCityBadge size="md" tone="muted" className="hidden md:inline-flex" />
            <ThemeToggle className="bg-white/30 hover:bg-white/45 dark:bg-white/10 dark:hover:bg-white/20" />
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="rounded-xl">
                  <Link href="/login">Create Account</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button asChild className="rounded-xl">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl space-y-6 pb-10">
          {jobsContent}
        </main>

        <footer className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 border-t border-border/50 px-1 py-6 text-sm text-muted-foreground mt-12">
          <p>Workforce Pulse, Montgomery workforce analytics.</p>
          <MontgomeryCityBadge size="md" compact tone="muted" className="opacity-75" />
        </footer>
      </div>
    </div>
  )
}

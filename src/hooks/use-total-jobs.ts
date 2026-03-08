"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useJobInsights } from "./use-job-insights"
import { useWorkforceData } from "./use-workforce-data"
import { useUserRole } from "./use-user-role"

interface CityJobsResponse {
  count: number
  lastFetched: string
  bySector: Record<string, number>
  jobs: unknown[]
}

interface PostingsResponse {
  count: number
  postings: unknown[]
}

/**
 * Centralized hook for total jobs count across the platform.
 * For admin: combines city jobs + all postings (USAJOBS, scraped sources)
 * For citizens: shows only city jobs
 */
export function useTotalJobs() {
  const { isAdmin } = useUserRole()
  
  const { data: cityJobsData } = useQuery<CityJobsResponse>({
    queryKey: ["cityJobs"],
    queryFn: () => fetch("/api/city-jobs").then((r) => r.json()),
    staleTime: 3600_000,
  })
  
  const { data: postingsData } = useQuery<PostingsResponse>({
    queryKey: ["allJobPostings"],
    queryFn: () => fetch("/api/jobs/postings").then((r) => r.json()),
    staleTime: 3600_000,
    enabled: isAdmin, // Only fetch for admin users
  })
  
  const { data: jobInsights } = useJobInsights()
  const { data: workforceData } = useWorkforceData()

  const totalJobs = useMemo(() => {
    // Admin users: combine city jobs + store postings (deduplicated on the jobs page)
    if (isAdmin) {
      const cityCount = cityJobsData?.count ?? 0
      const postingsCount = postingsData?.count ?? 0
      // Rough deduplication estimate: assume ~80% of city jobs might be duplicates with jobaps source
      const estimatedTotal = cityCount > 0 || postingsCount > 0 
        ? Math.max(cityCount, postingsCount)
        : 0
      if (estimatedTotal > 0) return estimatedTotal
    }

    // Citizens: city jobs only
    if (cityJobsData?.count != null && cityJobsData.count > 0) {
      return cityJobsData.count
    }

    // Fallback to job insights
    if (jobInsights?.count != null && jobInsights.count > 0) {
      return jobInsights.count
    }

    // Fallback to workforce data
    if (workforceData?.cityJobsTotal != null && workforceData.cityJobsTotal > 0) {
      return workforceData.cityJobsTotal
    }

    return 0
  }, [isAdmin, cityJobsData?.count, postingsData?.count, jobInsights?.count, workforceData?.cityJobsTotal])

  const source = useMemo(() => {
    if (isAdmin && (cityJobsData?.count || postingsData?.count)) return "all-sources" as const
    if (cityJobsData?.count != null && cityJobsData.count > 0) return "city-jobs" as const
    if (jobInsights?.count != null && jobInsights.count > 0) return "scraped" as const
    if (workforceData?.cityJobsTotal != null && workforceData.cityJobsTotal > 0) return "jobaps" as const
    return "none" as const
  }, [isAdmin, cityJobsData?.count, postingsData?.count, jobInsights?.count, workforceData?.cityJobsTotal])

  return {
    totalJobs,
    source,
    isLoading: !cityJobsData && !jobInsights && !workforceData && !(isAdmin && postingsData),
  }
}

"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Info, Database } from "lucide-react"
import { fetchJobInsights } from "@/services"
import { useTotalJobs } from "@/hooks/use-total-jobs"

/**
 * Job Data Status Component
 * Shows real-time status of scraped job data
 * Useful for debugging data persistence issues
 */
export function JobDataStatus() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["job-insights"],
    queryFn: fetchJobInsights,
    refetchInterval: 5000, // Refresh every 5 seconds
  })
  const { totalJobs, source } = useTotalJobs()

  if (isLoading) {
    return (
      <Card className="glass-panel w-full max-w-full overflow-hidden border-white/35 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Job Data Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-panel w-full max-w-full overflow-hidden border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            Job Data Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-red-600 break-words">{String(error)}</p>
        </CardContent>
      </Card>
    )
  }

  const sectorBreakdown = data?.insights?.sectorBreakdown ?? []
  const hasSources = data?.sources && Object.keys(data.sources).length > 0

  const sourceLabels = {
    "all-sources": "All Sources",
    "city-jobs": "City Jobs API",
    scraped: "Multi-Source Scraping",
    jobaps: "JobAps RSS Feed",
    none: "No Data",
  }

  return (
    <Card className="glass-panel w-full max-w-full overflow-hidden border-white/35 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          {totalJobs > 0 ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          )}
          Job Data Status
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 space-y-3">
        <div className="min-w-0 text-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Total Jobs:</span>
            <span className="font-semibold shrink-0">{totalJobs.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="text-muted-foreground">Data Source:</span>
            <Badge variant={source === "scraped" ? "default" : "secondary"} className="h-4 max-w-[65%] shrink-0 text-[10px]">
              <Database className="h-2.5 w-2.5 mr-1" />
              <span className="truncate">{sourceLabels[source]}</span>
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Sectors with Jobs:</span>
            <span className="font-semibold shrink-0">{sectorBreakdown.length}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Sources Active:</span>
            <span className="font-semibold shrink-0">{hasSources ? "Yes" : "No"}</span>
          </div>
        </div>

        {sectorBreakdown.length > 0 && (
          <div className="border-t border-white/20 pt-2">
            <p className="text-xs font-medium mb-1">Jobs by Sector:</p>
            <div className="space-y-0.5">
              {sectorBreakdown.slice(0, 5).map((sector) => (
                <div key={sector.sectorId} className="flex justify-between text-xs">
                  <span className="text-muted-foreground capitalize">
                    {sector.sectorId.replace(/-/g, " ")}:
                  </span>
                  <span className="font-medium">{sector.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalJobs === 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded p-2 text-xs text-amber-700 dark:text-amber-400">
            No jobs found. Run a scrape to populate data.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

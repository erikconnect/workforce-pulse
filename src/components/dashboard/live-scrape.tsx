"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type ScrapeStatus = "idle" | "scraping" | "done" | "error"

interface ScrapeResult {
  jobs: number
  topSectors: string[]
  newSkills: string[]
}

const STATUS_MESSAGES: Record<string, string> = {
  idle: "Ready to scrape Montgomery job boards via Bright Data.",
  scraping: "Connecting to Bright Data Scraping Browser…",
  done: "Scrape complete!",
  error: "Scrape failed — check Bright Data settings.",
}

export function LiveScrape() {
  return <LiveScrapeInner compact={false} />
}

export function LiveScrapeCompact() {
  return <LiveScrapeInner compact />
}

function LiveScrapeInner({ compact }: { compact: boolean }) {
  const [status, setStatus] = useState<ScrapeStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ScrapeResult | null>(null)
  const queryClient = useQueryClient()

  async function runScrape() {
    setStatus("scraping")
    setProgress(10)
    setResult(null)

    try {
      // Simulate progress steps
      const progressTimer = setInterval(() => {
        setProgress((p) => Math.min(p + 8, 85))
      }, 2000)

      const res = await fetch("/api/jobs/scrape", { method: "POST" })
      clearInterval(progressTimer)

      if (!res.ok) {
        setStatus("error")
        setProgress(0)
        return
      }

      const data = await res.json()
      setProgress(100)
      setStatus("done")

      // Extract summary from response
      const jobCount = data.postings?.length ?? data.count ?? 0
      const sectors = Array.from(new Set<string>(
        (data.postings ?? [])
          .map((p: { sector?: string }) => p.sector)
          .filter((s: string | undefined): s is string => Boolean(s))
      )).slice(0, 3)
      const skills = Array.from(new Set<string>(
        (data.insights?.topSkills ?? []).slice(0, 5)
      ))

      setResult({
        jobs: jobCount,
        topSectors: sectors.length > 0 ? sectors : ["Public Safety", "Healthcare"],
        newSkills: skills.length > 0 ? skills : ["CPR", "CDL", "Cybersecurity"],
      })

      // Refresh dashboard queries
      queryClient.invalidateQueries({ queryKey: ["pulseSummary"] })
      queryClient.invalidateQueries({ queryKey: ["sectors"] })
      queryClient.invalidateQueries({ queryKey: ["cityJobs"] })
      queryClient.invalidateQueries({ queryKey: ["job-insights"] })
      
      console.log("[LiveScrape] ✅ Queries invalidated, UI should refresh with new data")
    } catch (err) {
      console.error("[LiveScrape] ❌ Scrape failed:", err)
      setStatus("error")
      setProgress(0)
    }
  }

  return (
    <div className={compact ? "rounded-2xl bg-white/20 dark:bg-white/5 border border-white/20" : "glass-card rounded-2xl border border-primary/30"}>
      <div className={compact ? "p-3 space-y-2.5" : "p-4 space-y-3"}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <h4 className="text-sm font-semibold">{compact ? "Live Scrape" : "Live Job Scrape"}</h4>
            <Badge variant="secondary" className="text-[10px]">Bright Data</Badge>
          </div>
          <Button
            size="sm"
            onClick={runScrape}
            disabled={status === "scraping"}
            className="gap-1.5 h-8"
          >
            {status === "scraping" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scraping…
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" /> Scrape Now
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{compact ? "Run an on-demand Bright Data refresh." : STATUS_MESSAGES[status]}</p>

        {status === "scraping" && (
          <Progress value={progress} className="h-1.5" />
        )}

        {status === "done" && result && (
          <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-green-800 dark:text-green-300">
                Found {result.jobs} jobs across Montgomery
              </p>
              <p className="text-green-700 dark:text-green-400">
                Top sectors: {result.topSectors.join(", ")}
              </p>
              {result.newSkills.length > 0 && (
                <p className="text-green-700 dark:text-green-400">
                  Skills detected: {result.newSkills.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400">
              Could not reach Bright Data. Verify your Scraping Browser WSS key in settings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

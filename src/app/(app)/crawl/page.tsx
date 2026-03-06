"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CrawlRunner } from "@/components/brightdata/CrawlRunner"
import { SnapshotsList } from "@/components/brightdata/SnapshotsList"
import { DiagnosticsPanel } from "@/components/brightdata/DiagnosticsPanel"
import { Zap, Loader2, CheckCircle, ArrowRight, Shield, Stethoscope, Building2 } from "lucide-react"

const PRESETS = [
  { label: "Montgomery Jobs", icon: Building2, queries: "police officer Montgomery AL\nfirefighter Montgomery AL\nnurse Montgomery AL\nsoftware developer Montgomery AL" },
  { label: "Public Safety", icon: Shield, queries: "police officer Montgomery AL\nfirefighter Montgomery AL\nparamedic EMT Montgomery AL\n911 dispatcher Montgomery AL" },
  { label: "Healthcare", icon: Stethoscope, queries: "nurse RN Montgomery AL\nparamedic Montgomery AL\nmedical technician Montgomery AL" },
]

type PipelineStage = "idle" | "trigger" | "process" | "results"

export default function CrawlPage() {
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("idle")
  const [scrapeCount, setScrapeCount] = useState(0)

  async function runQuickCrawl(queries: string) {
    setPipelineStage("trigger")
    await new Promise((r) => setTimeout(r, 0)) // yield so React can paint "trigger" before fetch
    try {
      setPipelineStage("process")
      const res = await fetch("/api/jobs/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries: queries.split("\n").filter(Boolean) }),
      })
      if (!res.ok) throw new Error("Scrape failed")
      const data = await res.json()
      setScrapeCount(data.postings?.length ?? data.count ?? 0)
      setPipelineStage("results")
    } catch {
      setPipelineStage("idle")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Bright Data Crawl
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Trigger and monitor crawl jobs. Use presets for quick Montgomery scrapes.
        </p>
      </div>

      {/* Pipeline visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Scraping Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {(["trigger", "process", "results"] as const).map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  stage === "results" && pipelineStage === "results"
                    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                    : pipelineStage === stage
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                }`}>
                  {pipelineStage === stage && stage !== "results" && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {pipelineStage === "results" && stage === "results" && (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {stage === "trigger" && "Trigger"}
                  {stage === "process" && "Process"}
                  {stage === "results" && (pipelineStage === "results" ? `${scrapeCount} jobs` : "Results")}
                </div>
              </div>
            ))}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={pipelineStage === "trigger" || pipelineStage === "process"}
                onClick={() => runQuickCrawl(p.queries)}
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="runner" className="w-full">
        <TabsList>
          <TabsTrigger value="runner">Crawl Runner</TabsTrigger>
          <TabsTrigger value="snapshots">Recent Snapshots</TabsTrigger>
        </TabsList>
        <TabsContent value="runner" className="mt-4">
          <CrawlRunner />
        </TabsContent>
        <TabsContent value="snapshots" className="mt-4">
          <SnapshotsList />
        </TabsContent>
      </Tabs>

      <DiagnosticsPanel />
    </div>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  arcgis: { label: "ArcGIS", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  jobaps: { label: "JobAps", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  brightdata: { label: "Bright Data", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  stub: { label: "Sample", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
}

export function DataSource({ source }: { source: keyof typeof SOURCE_CONFIG }) {
  const cfg = SOURCE_CONFIG[source]
  if (!cfg) return null
  return (
    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-normal border-0 ${cfg.color}`}>
      via {cfg.label}
    </Badge>
  )
}

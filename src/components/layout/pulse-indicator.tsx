"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PulseIndicatorProps {
  lastRefresh?: Date
}

function getFreshness(lastRefresh: Date) {
  const ageMs = Date.now() - lastRefresh.getTime()
  const ageHours = ageMs / (1000 * 60 * 60)

  if (ageHours < 1) return { color: "bg-green-500", label: "Fresh", ring: "ring-green-500/30" }
  if (ageHours < 6) return { color: "bg-amber-500", label: "Aging", ring: "ring-amber-500/30" }
  return { color: "bg-red-500", label: "Stale", ring: "ring-red-500/30" }
}

function formatAge(date: Date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function PulseIndicator({ lastRefresh }: PulseIndicatorProps) {
  // Default to "now" for demo — in prod, this would come from API response headers
  const [refresh] = useState(() => lastRefresh ?? new Date())
  const freshness = getFreshness(refresh)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="relative flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors"
            aria-label={`Data freshness: ${freshness.label}`}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full ring-4",
                freshness.color,
                freshness.ring,
                "animate-pulse"
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="space-y-1">
            <p className="font-medium">Data: {freshness.label}</p>
            <p className="text-muted-foreground">Last refresh: {formatAge(refresh)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

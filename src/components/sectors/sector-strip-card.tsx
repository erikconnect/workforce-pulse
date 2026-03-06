"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PulseRing } from "./pulse-ring"
import { cn } from "@/lib/utils"
import type { Sector } from "@/services/types"

const BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
  watch: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  stable: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
}

interface SectorStripCardProps {
  sector: Sector
}

const GLOW_CLASS: Record<string, string> = {
  critical: "glow-critical",
  watch: "glow-watch",
  stable: "glow-stable",
}

export function SectorStripCard({ sector }: SectorStripCardProps) {
  const isPublicSafety = sector.id === "public-safety"

  return (
    <Link href={`/sectors/${sector.id}`} className="block">
      <Card
        className={cn(
          "h-full transition-all duration-200 card-hover-lift group",
          GLOW_CLASS[sector.status],
          isPublicSafety && "ring-1 ring-red-200/60 dark:ring-red-800/40"
        )}
      >
        <CardContent className="p-3 flex flex-col items-center text-center gap-2">
          <PulseRing score={sector.pulseScore} status={sector.status} size={48} strokeWidth={5} />
          <span className="font-medium text-xs leading-tight group-hover:text-primary transition-colors">
            {sector.name}
          </span>
          <Badge className={cn("text-[10px] border px-1.5 py-0", BADGE_CLASS[sector.status])}>
            {sector.status}
          </Badge>
          {isPublicSafety && (
            <span className="text-[9px] font-semibold uppercase text-red-600 dark:text-red-400">Priority</span>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

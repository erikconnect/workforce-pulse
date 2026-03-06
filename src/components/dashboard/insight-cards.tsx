"use client"

import Link from "next/link"
import { AlertTriangle, TrendingUp, HelpCircle, Trophy, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Insight } from "@/lib/insight-generator"

const ICON_MAP = {
  alert: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
  trend: { icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
  gap: { icon: HelpCircle, color: "text-blue-500", bg: "bg-blue-50" },
  win: { icon: Trophy, color: "text-green-500", bg: "bg-green-50" },
}

interface InsightCardsProps {
  insights: Insight[]
}

export function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) return null

  return (
    <div data-tour="insight-cards" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, i) => {
        const config = ICON_MAP[insight.icon]
        const Icon = config.icon
        return (
          <div
            key={insight.id}
            className={cn(
              "glass-card rounded-2xl card-hover-lift opacity-0 animate-fade-in-up",
              i === 0 && "animate-stagger-2",
              i === 1 && "animate-stagger-3",
              i === 2 && "animate-stagger-4",
            )}
            style={{ animationFillMode: "forwards" }}
          >
            <div className="pt-4 pb-3 px-4 space-y-2">
              <div className="flex items-start gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold leading-tight">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {insight.body}
                  </p>
                </div>
              </div>
              {insight.cta && (
                <Button variant="ghost" size="sm" className="text-xs w-full justify-start gap-1 -ml-1" asChild>
                  <Link href={insight.cta.href}>
                    {insight.cta.label}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

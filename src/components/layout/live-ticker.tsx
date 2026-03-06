"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchRecentPostings } from "@/services"
import { cn } from "@/lib/utils"

const STATUS_DOT: Record<string, string> = {
  critical: "bg-red-500",
  watch: "bg-amber-500",
  stable: "bg-green-500",
}

export function LiveTicker() {
  const { data: postings } = useQuery({
    queryKey: ["recentPostings"],
    queryFn: fetchRecentPostings,
    refetchInterval: 60_000,
  })

  if (!postings?.length) return null

  // Duplicate items for seamless scrolling loop
  const items = [...postings, ...postings]
  const duration = postings.length * 4 // ~4s per item

  return (
    <div className="relative w-full overflow-hidden glass-panel border-b border-glass-border-light dark:border-glass-border-dark h-8 flex items-center shrink-0 shadow-[inset_0_-1px_0_rgba(255,255,255,0.18),0_8px_18px_rgba(44,35,24,0.06)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[rgba(243,238,231,0.95)] to-transparent dark:from-[rgba(25,22,19,0.92)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[rgba(243,238,231,0.95)] to-transparent dark:from-[rgba(25,22,19,0.92)]" />
      <div
        className="ticker-scroll flex items-center gap-8 whitespace-nowrap px-5"
        style={{ ["--ticker-duration" as string]: `${duration}s` }}
      >
        {items.map((p, i) => (
          <span key={`${p.id}-${i}`} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[p.urgency])} />
            <span className="font-medium text-foreground">{p.title}</span>
            <span className="text-muted-foreground/70">—</span>
            <span>{p.org}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-muted-foreground/70">{p.timeAgo}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

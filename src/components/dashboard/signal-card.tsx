"use client"

import type { ElementType, ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CardTone = "critical" | "watch" | "stable" | "neutral"

type InsightItem = {
  label: string
  value: ReactNode
  tone?: CardTone
}

type CardAction = {
  label: string
  href?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

const TONE_STYLES: Record<CardTone, {
  shell: string
  glow: string
  iconWrap: string
  iconColor: string
  badge: string
  stat: string
}> = {
  critical: {
    shell: "border-red-200/70 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.22),_transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,245,245,0.82))] dark:border-red-900/50 dark:bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.22),_transparent_42%),linear-gradient(180deg,rgba(34,12,16,0.82),rgba(22,10,12,0.74))]",
    glow: "bg-red-400/20 dark:bg-red-500/20",
    iconWrap: "bg-red-100/85 dark:bg-red-950/45",
    iconColor: "text-red-600 dark:text-red-300",
    badge: "border-red-300/70 bg-red-100/80 text-red-700 dark:border-red-800/70 dark:bg-red-950/50 dark:text-red-300",
    stat: "bg-red-50/75 dark:bg-red-950/20",
  },
  watch: {
    shell: "border-amber-200/70 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,250,240,0.82))] dark:border-amber-900/50 dark:bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.22),_transparent_42%),linear-gradient(180deg,rgba(38,24,10,0.82),rgba(24,16,8,0.74))]",
    glow: "bg-amber-300/20 dark:bg-amber-500/20",
    iconWrap: "bg-amber-100/85 dark:bg-amber-950/45",
    iconColor: "text-amber-700 dark:text-amber-300",
    badge: "border-amber-300/70 bg-amber-100/80 text-amber-800 dark:border-amber-800/70 dark:bg-amber-950/50 dark:text-amber-300",
    stat: "bg-amber-50/75 dark:bg-amber-950/20",
  },
  stable: {
    shell: "border-emerald-200/70 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.2),_transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(240,255,249,0.82))] dark:border-emerald-900/50 dark:bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.2),_transparent_42%),linear-gradient(180deg,rgba(8,28,22,0.82),rgba(8,20,17,0.74))]",
    glow: "bg-emerald-300/20 dark:bg-emerald-500/20",
    iconWrap: "bg-emerald-100/85 dark:bg-emerald-950/45",
    iconColor: "text-emerald-700 dark:text-emerald-300",
    badge: "border-emerald-300/70 bg-emerald-100/80 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300",
    stat: "bg-emerald-50/75 dark:bg-emerald-950/20",
  },
  neutral: {
    shell: "border-white/35 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.16),_transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,246,248,0.82))] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_42%),linear-gradient(180deg,rgba(24,24,27,0.82),rgba(14,14,18,0.74))]",
    glow: "bg-slate-300/20 dark:bg-slate-500/20",
    iconWrap: "bg-white/70 dark:bg-white/10",
    iconColor: "text-foreground",
    badge: "border-white/40 bg-white/65 text-foreground dark:border-white/15 dark:bg-white/10 dark:text-foreground",
    stat: "bg-white/60 dark:bg-white/5",
  },
}

function toneTextClass(tone: CardTone) {
  switch (tone) {
    case "critical":
      return "text-red-700 dark:text-red-300"
    case "watch":
      return "text-amber-800 dark:text-amber-300"
    case "stable":
      return "text-emerald-800 dark:text-emerald-300"
    default:
      return "text-foreground"
  }
}

export function DashboardSignalCard({
  title,
  eyebrow,
  status,
  icon: Icon,
  tone,
  value,
  suffix,
  description,
  stats,
  chips,
  action,
  children,
  className,
}: {
  title: string
  eyebrow?: string
  status?: string
  icon: ElementType
  tone: CardTone
  value: ReactNode
  suffix?: string
  description: string
  stats?: InsightItem[]
  chips?: string[]
  action?: CardAction
  children?: ReactNode
  className?: string
}) {
  const toneStyles = TONE_STYLES[tone]
  const statColumns = stats && stats.length >= 3 ? "grid-cols-3" : "grid-cols-2"

  return (
    <section
      className={cn(
        "relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-3xl border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm",
        toneStyles.shell,
        className,
      )}
    >
      <div className={cn("absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl", toneStyles.glow)} aria-hidden />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/85">{eyebrow}</p>
            ) : null}
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 shadow-sm dark:border-white/10", toneStyles.iconWrap)}>
            <Icon className={cn("h-5 w-5", toneStyles.iconColor)} />
          </div>
        </div>

        {status ? (
          <Badge variant="outline" className={cn("mt-4 w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", toneStyles.badge)}>
            {status}
          </Badge>
        ) : null}

        <div className="mt-4 flex items-end gap-2">
          <div className="text-3xl font-semibold leading-none tracking-[-0.04em] text-foreground">{value}</div>
          {suffix ? <div className="pb-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{suffix}</div> : null}
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{description}</p>

        {stats?.length ? (
          <div className={cn("mt-4 grid gap-2", statColumns)}>
            {stats.map((item) => (
              <div key={item.label} className={cn("rounded-2xl border border-white/25 p-3 dark:border-white/10", toneStyles.stat)}>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                <p className={cn("mt-1 text-sm font-semibold leading-snug", toneTextClass(item.tone ?? "neutral"))}>{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {children ? <div className="mt-4">{children}</div> : null}

        {chips?.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/35 bg-white/55 px-2.5 py-1 text-[10px] font-medium text-foreground/80 dark:border-white/10 dark:bg-white/5 dark:text-foreground/75"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}

        {action ? (
          <div className="mt-auto pt-4">
            {action.href ? (
              <Button asChild variant="outline" className="h-10 w-full justify-between rounded-2xl border-white/40 bg-white/50 px-4 text-sm font-medium hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                <Link href={action.href}>
                  <span>{action.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-between rounded-2xl border-white/40 bg-white/50 px-4 text-sm font-medium hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
              >
                <span>{action.label}</span>
                {action.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
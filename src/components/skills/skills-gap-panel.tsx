"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Circle,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Role, Skill, Playbook } from "@/services/types"
import { useAcquiredSkills } from "@/hooks/use-acquired-skills"

interface GapItem {
  role: Role
  missingSkills: Skill[]
  coveredSkills: Skill[]
  coveragePercent: number
  suggestedPlaybooks: Playbook[]
}

interface SkillsGapPanelProps {
  roles: Role[]
  skills: Skill[]
  playbooks: Playbook[]
}

const URGENCY_ORDER = { critical: 0, watch: 1, stable: 2 }

const URGENCY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
  watch: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  stable: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
}

function matchPlaybooks(missingSkillIds: string[], playbooks: Playbook[]): Playbook[] {
  return playbooks
    .filter((pb) =>
      pb.linkedSkills.some((ls) =>
        missingSkillIds.some(
          (sid) =>
            ls.toLowerCase().replace(/\s+/g, "-").includes(sid.split("-")[0]) ||
            sid.includes(ls.toLowerCase().replace(/\s+/g, "-"))
        )
      )
    )
    .slice(0, 2)
}

export function SkillsGapPanel({ roles, skills, playbooks }: SkillsGapPanelProps) {
  const { acquired, toggle } = useAcquiredSkills()

  const skillMap = useMemo(() => {
    const m = new Map<string, Skill>()
    for (const s of skills) m.set(s.id, s)
    return m
  }, [skills])

  const gaps = useMemo<GapItem[]>(() => {
    return roles
      .filter((r) => r.requiredSkills.length > 0)
      .map((role) => {
        const required = role.requiredSkills
          .map((sid) => skillMap.get(sid))
          .filter((s): s is Skill => Boolean(s))

        const covered = required.filter((s) => acquired.has(s.id))
        const missing = required.filter((s) => !acquired.has(s.id))
        const coveragePercent = required.length === 0 ? 100 : Math.round((covered.length / required.length) * 100)

        return {
          role,
          missingSkills: missing,
          coveredSkills: covered,
          coveragePercent,
          suggestedPlaybooks: matchPlaybooks(missing.map((s) => s.id), playbooks),
        }
      })
      .filter((g) => g.missingSkills.length > 0)
      .sort((a, b) => {
        const urgencyDiff = URGENCY_ORDER[a.role.urgency] - URGENCY_ORDER[b.role.urgency]
        if (urgencyDiff !== 0) return urgencyDiff
        return a.coveragePercent - b.coveragePercent
      })
  }, [roles, skillMap, acquired, playbooks])

  const totalRequired = useMemo(() => {
    const ids = new Set<string>()
    for (const role of roles) for (const sid of role.requiredSkills) ids.add(sid)
    return ids.size
  }, [roles])

  const totalAcquiredCount = useMemo(() => {
    let count = 0
    for (const role of roles)
      for (const sid of role.requiredSkills)
        if (acquired.has(sid)) count++
    return Math.min(count, totalRequired)
  }, [roles, acquired, totalRequired])

  const coveragePercent = totalRequired === 0 ? 0 : Math.round((totalAcquiredCount / totalRequired) * 100)
  const criticalGaps = gaps.filter((g) => g.role.urgency === "critical")

  if (roles.length === 0 || skills.length === 0) return null

  return (
    <div className="glass-card-strong rounded-[30px] border border-white/40 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary">Skills Gap Analysis</Badge>
              {criticalGaps.length > 0 && (
                <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 text-xs border">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  {criticalGaps.length} critical gap{criticalGaps.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-bold tracking-tight">Your Workforce Readiness</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-lg">
              Mark the skills you have. See which critical roles you&apos;re close to qualifying for, and get playbook recommendations to close the remaining gaps.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/35 dark:bg-white/5 px-5 py-3 text-center shrink-0">
            <span className="text-3xl font-bold text-primary">{coveragePercent}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">coverage</span>
            <span className="text-xs text-muted-foreground mt-1">
              {totalAcquiredCount} / {totalRequired} skills
            </span>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Overall skill coverage across all roles</span>
            <span className="font-medium">{coveragePercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/30 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gap list */}
      <div className="px-6 pb-6 space-y-3">
        {gaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
            <p className="font-semibold text-sm">All role requirements covered!</p>
            <p className="text-xs text-muted-foreground mt-1">
              You&apos;ve marked all required skills as acquired.
            </p>
          </div>
        ) : (
          gaps.slice(0, 6).map((gap) => (
            <GapCard
              key={gap.role.id}
              gap={gap}
              acquired={acquired}
              onToggle={toggle}
            />
          ))
        )}

        {gaps.length > 6 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{gaps.length - 6} more roles with gaps — mark skills above to narrow results.
          </p>
        )}
      </div>
    </div>
  )
}

function GapCard({
  gap,
  acquired,
  onToggle,
}: {
  gap: GapItem
  acquired: Set<string>
  onToggle: (id: string) => void
}) {
  const { role, missingSkills, coveredSkills, coveragePercent, suggestedPlaybooks } = gap
  const allSkills = [...coveredSkills, ...missingSkills]

  return (
    <div className="rounded-2xl border border-white/30 bg-white/30 dark:border-white/10 dark:bg-white/5 p-4">
      {/* Role header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{role.title}</span>
            <Badge className={cn("text-[10px] border capitalize", URGENCY_BADGE[role.urgency])}>
              {role.urgency}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {role.sectorId.replace(/-/g, " ")} · {role.openCount} open positions
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className={cn("text-sm font-bold", coveragePercent >= 66 ? "text-emerald-600 dark:text-emerald-400" : coveragePercent >= 33 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
            {coveragePercent}%
          </span>
          <p className="text-[10px] text-muted-foreground">ready</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/30 dark:bg-white/10 overflow-hidden mb-3">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            coveragePercent >= 66 ? "bg-emerald-500" : coveragePercent >= 33 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${coveragePercent}%` }}
        />
      </div>

      {/* Skill toggles */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {allSkills.map((skill) => {
          const isAcquired = acquired.has(skill.id)
          return (
            <button
              key={skill.id}
              onClick={() => onToggle(skill.id)}
              className={cn(
                "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl border transition-all",
                isAcquired
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300"
                  : "bg-white/40 border-white/30 text-muted-foreground hover:border-primary/40 hover:text-foreground dark:bg-white/5 dark:border-white/10"
              )}
            >
              {isAcquired
                ? <CheckCircle2 className="h-3 w-3 shrink-0" />
                : <Circle className="h-3 w-3 shrink-0" />
              }
              {skill.name}
            </button>
          )
        })}
      </div>

      {/* Suggested playbooks */}
      {suggestedPlaybooks.length > 0 && missingSkills.length > 0 && (
        <div className="border-t border-white/20 dark:border-white/10 pt-2.5 mt-1">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Recommended playbooks to close this gap
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPlaybooks.map((pb) => (
              <Link
                key={pb.id}
                href={`/playbooks`}
                className="flex items-center gap-1.5 text-[11px] rounded-xl border border-primary/20 bg-primary/5 px-2.5 py-1 text-primary hover:bg-primary/10 transition-colors"
              >
                <TrendingUp className="h-3 w-3 shrink-0" />
                {pb.title}
                <ArrowUpRight className="h-2.5 w-2.5 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {missingSkills.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {missingSkills.length} skill{missingSkills.length !== 1 ? "s" : ""} needed — click to mark as acquired
        </div>
      )}
    </div>
  )
}

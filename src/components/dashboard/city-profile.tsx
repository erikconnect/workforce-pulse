"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { fetchWorkforceData } from "@/services/api/workforce-data"
import { MontgomeryFact } from "@/components/dashboard/montgomery-fact"

const CIRCLE_METRICS = [
  { key: "911", label: "Calls", labelFull: "911 Calls", valueKey: "arcgis911CallCount" as const, stroke: "#fca5a5", maxValue: 5000, glowClass: "hero-ring-glow-red" },
  { key: "permits", label: "Permits", labelFull: "Permits", valueKey: "arcgisPermitCount" as const, stroke: "#fcd34d", maxValue: 200, glowClass: "hero-ring-glow-amber" },
  { key: "jobs", label: "Jobs", labelFull: "Open Jobs", valueKey: "cityJobsTotal" as const, stroke: "#86efac", maxValue: 5000, glowClass: "hero-ring-glow-green" },
]

const CIRCUMFERENCE = 251.2

export function CityProfile() {
  const { data, isLoading } = useQuery({
    queryKey: ["workforceData"],
    queryFn: fetchWorkforceData,
    staleTime: 3600_000,
  })

  const metrics = CIRCLE_METRICS.map((m) => {
    const value = data?.[m.valueKey] ?? 0
    // Calculate dynamic dashOffset based on actual value
    // Formula: offset = circumference - (value / maxValue) * circumference
    const percentage = Math.min(value / m.maxValue, 1) // Cap at 100%
    const dashOffset = CIRCUMFERENCE - (percentage * CIRCUMFERENCE * 0.75) // 0.75 for 3/4 circle
    
    return {
      ...m,
      value,
      dashOffset,
    }
  })

  // Log data for debugging
  if (!isLoading && data) {
    console.log('[CityProfile] Workforce data loaded:', {
      cityJobsTotal: data.cityJobsTotal,
      arcgis911CallCount: data.arcgis911CallCount,
      arcgisPermitCount: data.arcgisPermitCount,
    })
  }

  return (
    <div className="glass-card-strong overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 shadow-lg">
      <div className="relative h-64 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 montgomery-hero-photo z-0 scale-[1.02]" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#6b645c] to-[#4a4640] mix-blend-multiply opacity-80 dark:opacity-90 z-10"
          aria-hidden
        />
        <div className="montgomery-hero-skyline absolute inset-0 opacity-35 z-0" aria-hidden />
        <div className="absolute inset-0 montgomery-hero-vignette z-[1]" aria-hidden />
        <div className="montgomery-hero-lights absolute inset-0 opacity-45 z-[2]" aria-hidden />

        <div className="relative z-20 w-full h-full p-8 flex justify-between items-center text-white">
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-medium mb-2 text-white">
              Montgomery, Alabama
            </h2>
            <MontgomeryFact compact className="mb-5 max-w-[24rem]" />
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-5 py-2 rounded-xl text-sm text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] hover:bg-white/30 transition-colors"
            >
              Montgomeryinfo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-8">
            {metrics.map((m) => {
              const val = isLoading ? "--" : (typeof m.value === "number" ? m.value.toLocaleString("en-US") : String(m.value))
              return (
                <div key={m.key} className="flex flex-col items-center">
                  <div className={`relative w-24 h-24 mb-2 ${m.glowClass}`}>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="40"
                        stroke="rgba(255,255,255,0.16)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="40"
                        stroke={m.stroke}
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={isLoading ? CIRCUMFERENCE : m.dashOffset}
                        strokeLinecap="round"
                        strokeWidth="8"
                        className={m.glowClass}
                      />
                    </svg>
                    <div className="absolute inset-[10px] rounded-full hero-ring-shell" aria-hidden />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold leading-none">{val}</span>
                      <span className="text-[10px] text-white/80 uppercase mt-1">{m.label}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium tracking-wide">{m.labelFull}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

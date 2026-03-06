"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchSectors } from "@/services"
import { computeCompositeScore } from "@/lib/workforce-health"
import { cn } from "@/lib/utils"

export function CityScore({ embedded = false }: { embedded?: boolean }) {
  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  })

  if (!sectors) return null

  const { displayScore } = computeCompositeScore(sectors)

  return (
    <div className={cn(
      "glass-panel rounded-3xl p-6 flex h-full flex-col relative bg-gradient-to-b from-transparent to-black/5 dark:to-black/20",
      embedded && "glass-panel-embedded bg-transparent border-0 shadow-none p-0"
    )}>
      <div className="mb-6">
        <h2 className="font-semibold text-lg">Workforce Health</h2>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center relative">
        <div className="relative flex h-[248px] w-[248px] items-center justify-center">
          <div className="absolute inset-0 rounded-full workforce-gauge-shell" />
          <div className="absolute inset-[12px] rounded-full border border-[hsl(var(--foreground)/0.24)] dark:border-[hsl(var(--foreground)/0.18)]" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 240" aria-hidden>
            <circle cx="120" cy="120" r="104" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.6" />
            <circle cx="120" cy="120" r="82" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
            <path className="gauge-segment-green" d="M 62 182 A 84 84 0 0 1 37 118" fill="none" stroke="#9ef4a7" strokeLinecap="round" strokeWidth="12" />
            <path className="gauge-segment-green" d="M 39 103 A 84 84 0 0 1 73 52" fill="none" stroke="#86eb9b" strokeLinecap="round" strokeWidth="12" />
            <path className="gauge-segment-yellow" d="M 85 44 A 84 84 0 0 1 154 43" fill="none" stroke="#f4de72" strokeLinecap="round" strokeWidth="12" />
            <path className="gauge-segment-yellow" d="M 168 49 A 84 84 0 0 1 196 89" fill="none" stroke="#f8b14d" strokeLinecap="round" strokeWidth="12" />
            <path className="gauge-segment-red" d="M 203 105 A 84 84 0 0 1 198 159" fill="none" stroke="#f3a461" strokeLinecap="round" strokeWidth="12" />
            <path className="gauge-segment-red" d="M 190 176 A 84 84 0 0 1 150 204" fill="none" stroke="#ef706c" strokeLinecap="round" strokeWidth="12" />
          </svg>
          <div className="absolute left-1/2 top-[31px] -translate-x-1/2 text-foreground">
            <div className="h-0 w-0 border-l-[13px] border-r-[13px] border-b-[28px] border-l-transparent border-r-transparent border-b-current drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_4px_12px_rgba(255,255,255,0.28)]" />
          </div>
          <div className="absolute inset-[46px] rounded-full border border-[hsl(var(--foreground)/0.2)] bg-[rgba(255,255,255,0.10)] dark:border-[hsl(var(--foreground)/0.16)] dark:bg-[rgba(255,255,255,0.05)] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_36px_rgba(0,0,0,0.08)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <span className="mb-2 text-[3.25rem] font-semibold leading-none tracking-[-0.03em] text-foreground">{displayScore}</span>
            <span className="w-28 text-center text-[10px] leading-tight text-foreground/75">Average Pulse score</span>
          </div>
        </div>
      </div>
      <div className="mt-auto flex justify-center gap-5 pt-5 text-[11px] font-medium">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#a5f0a8] shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
          Stable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f4de72] shadow-[0_0_8px_rgba(250,204,21,0.45)]" />
          Watch
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ef706c] shadow-[0_0_8px_rgba(248,113,113,0.45)]" />
          Critical
        </span>
      </div>
    </div>
  )
}

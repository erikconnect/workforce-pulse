"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface GuidedTourProps {
  isActive: boolean
  currentStep: number
  totalSteps: number
  step: {
    target: string
    title: string
    description: string
  } | undefined
  onNext: () => void
  onPrev: () => void
  onEnd: () => void
}

export function GuidedTour({
  isActive,
  currentStep,
  totalSteps,
  step,
  onNext,
  onPrev,
  onEnd,
}: GuidedTourProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !step) return

    const el = document.querySelector(step.target)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      // Small delay for scroll to finish
      const timer = setTimeout(() => {
        setRect(el.getBoundingClientRect())
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setRect(null)
    }
  }, [isActive, step, currentStep])

  useEffect(() => {
    if (!isActive) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onEnd()
      if (e.key === "ArrowRight" || e.key === "Enter") onNext()
      if (e.key === "ArrowLeft") onPrev()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isActive, onEnd, onNext, onPrev])

  if (!isActive || !step) return null

  const padding = 8
  const spotlightStyle = rect
    ? {
        clipPath: `polygon(
          0% 0%, 0% 100%, 
          ${rect.left - padding}px 100%, 
          ${rect.left - padding}px ${rect.top - padding}px, 
          ${rect.right + padding}px ${rect.top - padding}px, 
          ${rect.right + padding}px ${rect.bottom + padding}px, 
          ${rect.left - padding}px ${rect.bottom + padding}px, 
          ${rect.left - padding}px 100%, 
          100% 100%, 100% 0%
        )`,
      }
    : {}

  // Position tooltip below the spotlight target
  const tooltipTop = rect ? rect.bottom + padding + 12 : "50%"
  const tooltipLeft = rect ? Math.max(16, Math.min(rect.left, window.innerWidth - 340)) : "50%"

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Guided Tour">
      {/* Backdrop with spotlight cutout */}
      <div
        className="absolute inset-0 tour-overlay transition-all duration-300"
        style={spotlightStyle}
        onClick={onEnd}
      />

      {/* Spotlight ring */}
      {rect && (
        <div
          className="absolute border-2 border-primary rounded-lg pointer-events-none transition-all duration-300"
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-[101] w-[calc(100vw-2rem)] max-w-[320px] animate-fade-in-up rounded-xl border border-border bg-card p-4 shadow-2xl"
        style={{ top: tooltipTop, left: tooltipLeft }}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onEnd}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {step.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {currentStep + 1} of {totalSteps}
          </span>
          <div className="flex gap-1.5">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onPrev}>
                <ChevronLeft className="h-3 w-3" /> Back
              </Button>
            )}
            <Button size="sm" className="h-7 text-xs gap-1" onClick={onNext}>
              {currentStep < totalSteps - 1 ? (
                <>Next <ChevronRight className="h-3 w-3" /></>
              ) : (
                "Finish"
              )}
            </Button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep ? "w-4 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

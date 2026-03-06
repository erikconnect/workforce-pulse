"use client"

import { useState, useEffect, useCallback } from "react"
import { Lightbulb, ChevronRight } from "lucide-react"

const FACTS = [
  "Montgomery's bus boycott (1955–56) lasted 381 days and sparked the modern Civil Rights Movement.",
  "Maxwell Air Force Base contributes over $4.1 billion annually to the local economy.",
  "Montgomery is home to the Alabama Shakespeare Festival, one of the largest in the world.",
  "The city was the first capital of the Confederate States, but became a cradle of the Civil Rights Movement.",
  "Hank Williams, the legendary country musician, began his career on Montgomery's WSFA radio.",
  "The National Memorial for Peace and Justice is the nation's first memorial dedicated to victims of lynching.",
  "Montgomery's Hyundai manufacturing plant employs over 3,000 workers in the region.",
  "The Freedom Riders arrived at Montgomery's Greyhound station on May 20, 1961.",
  "Dr. Martin Luther King Jr. served as pastor of Dexter Avenue Baptist Church from 1954 to 1960.",
  "Montgomery Area Transit System (MATS) traces its roots to the very buses that Rosa Parks rode.",
]

export function MontgomeryFact() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setIndex(Math.floor(Math.random() * FACTS.length))
  }, [])

  const next = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setIndex((i) => (i + 1) % FACTS.length)
      setVisible(true)
    }, 200)
  }, [])

  return (
    <div className="flex items-start gap-2.5 rounded-md border border-secondary/30 bg-secondary/[0.05] px-4 py-3">
      <Lightbulb className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary mb-0.5">
          Did you know?
        </p>
        <p
          className={`text-xs text-muted-foreground leading-relaxed transition-opacity duration-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {FACTS[index]}
        </p>
      </div>
      <button
        onClick={next}
        className="shrink-0 rounded p-1 hover:bg-secondary/10 text-muted-foreground hover:text-secondary transition-colors"
        aria-label="Next fact"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

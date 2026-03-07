"use client"

import { useState, useCallback } from "react"

export interface TourStep {
  target: string // CSS selector
  title: string
  description: string
  action?: "navigate"
  href?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='kpi-cards']",
    title: "1. What's changing?",
    description: "Critical roles, training gaps, and rising skills — your Daily Pulse at a glance.",
  },
  {
    target: "[data-tour='sector-strip']",
    title: "2. Which sectors?",
    description: "Sectors at a glance — red means critical, amber is watch, green is stable. Click any to dive deeper.",
  },
  {
    target: "[data-tour='radar-chart']",
    title: "3. Multi-dimensional view",
    description: "Radar shows demand, growth, criticality, and skills gaps across sectors. Spikes need attention.",
  },
  {
    target: "[data-tour='insight-cards']",
    title: "4. AI Insights",
    description: "Auto-generated narratives explain what the numbers mean in plain English.",
  },
  {
    target: "[data-tour='quick-actions']",
    title: "5. Quick Actions",
    description: "Complete mission steps right from the dashboard — no navigation needed.",
  },
  {
    target: "[data-tour='nav-missions']",
    title: "6. Take Action",
    description: "Head to Missions for coordinated action, or Playbooks to share insight cards with your team.",
  },
]

export function useTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const startTour = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      setIsActive(false)
      setCurrentStep(0)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const endTour = useCallback(() => {
    setIsActive(false)
    setCurrentStep(0)
  }, [])

  return {
    isActive,
    currentStep,
    step: TOUR_STEPS[currentStep],
    totalSteps: TOUR_STEPS.length,
    startTour,
    nextStep,
    prevStep,
    endTour,
  }
}

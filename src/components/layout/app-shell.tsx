"use client"

import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { LiveTicker } from "./live-ticker"
import { CommandPalette } from "./command-palette"
import { GuidedTour } from "./guided-tour"
import { useTour } from "@/hooks/use-tour"
import { useScrapeJobs } from "@/hooks/use-scrape-jobs"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const tour = useTour()
  useScrapeJobs() // Auto-trigger scrape on mount
  return (
    <div className="relative min-h-screen overflow-hidden bg-background p-3 md:p-5">
      <div className="absolute inset-0 glass-page-bg pointer-events-none z-0" aria-hidden />
      <div className="pointer-events-none absolute left-[-10rem] top-[-8rem] z-0 h-72 w-72 rounded-full bg-white/35 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-6rem] z-0 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl" aria-hidden />
      <div className="relative z-10 mx-auto flex h-[calc(100vh-1.5rem)] w-full max-w-[1400px] overflow-hidden rounded-[32px] dashboard-shell md:h-[calc(100vh-2.5rem)]">
      {/* Desktop sidebar */}
        <aside className="relative hidden lg:flex lg:w-24 lg:shrink-0 lg:flex-col">
          <Sidebar />
        </aside>

        {/* Mobile sidebar (Sheet drawer) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-60 p-0">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main column: ticker + header + scrollable content */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <LiveTicker />
          <Header onMenuClick={() => setMobileMenuOpen(true)} onStartTour={tour.startTour} />
          <main className="dashboard-scroll-area relative flex-1 overflow-y-auto p-5 md:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global overlays */}
      <CommandPalette />
      <GuidedTour
        isActive={tour.isActive}
        currentStep={tour.currentStep}
        totalSteps={tour.totalSteps}
        step={tour.step}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onEnd={tour.endTour}
      />
    </div>
  )
}

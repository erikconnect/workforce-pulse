"use client"

import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { LiveTicker } from "./live-ticker"
import { CommandPalette } from "./command-palette"
import { GuidedTour } from "./guided-tour"
import { useTour } from "@/hooks/use-tour"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const tour = useTour()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col border-r border-border">
        <Sidebar />
      </aside>

      {/* Mobile sidebar (Sheet drawer) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column: ticker + header + scrollable content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <LiveTicker />
        <Header onMenuClick={() => setMobileMenuOpen(true)} onStartTour={tour.startTour} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
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

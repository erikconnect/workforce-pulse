"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, BarChart3, Target, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <header className="flex items-center justify-between px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <span className="font-display text-xl font-semibold">Workforce Pulse</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="text-center max-w-3xl space-y-8">
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Real-time workforce intelligence for Montgomery
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor sector health, critical roles, training gaps, and hiring pressure. Keep the pulse of your city&apos;s workforce in one place.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-xl px-8">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-8">
              <Link href="/dashboard">Explore Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="rounded-2xl border border-white/25 dark:border-white/10 bg-white/20 dark:bg-white/5 p-6 text-center">
            <MapPin className="h-10 w-10 mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-1">Live city signals</h3>
            <p className="text-sm text-muted-foreground">
              911 activity, permits, stations, jobs, and neighborhood health in one map.
            </p>
          </div>
          <div className="rounded-2xl border border-white/25 dark:border-white/10 bg-white/20 dark:bg-white/5 p-6 text-center">
            <Target className="h-10 w-10 mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-1">Sector intelligence</h3>
            <p className="text-sm text-muted-foreground">
              Track critical roles, training readiness, and hiring pressure by sector.
            </p>
          </div>
          <div className="rounded-2xl border border-white/25 dark:border-white/10 bg-white/20 dark:bg-white/5 p-6 text-center">
            <Zap className="h-10 w-10 mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-1">Skills & playbooks</h3>
            <p className="text-sm text-muted-foreground">
              Map pathways, earn points, and contribute to workforce missions.
            </p>
          </div>
        </div>
      </main>

      <footer className="px-4 py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>Workforce Pulse — Montgomery workforce analytics</p>
      </footer>
    </div>
  )
}

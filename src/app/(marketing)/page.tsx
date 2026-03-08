"use client"

import Link from "next/link"
import { MontgomeryCityBadge } from "@/components/branding/montgomery-city-badge"
import {
  CivicSignalIcon,
  PathwaysIcon,
  SectorFieldIcon,
  WorkforcePulseMark,
} from "@/components/branding/workforce-icons"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 glass-page-bg" aria-hidden />
      <div className="pointer-events-none absolute left-[-8rem] top-[-4rem] h-72 w-72 rounded-full bg-white/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(0,89,142,0.18)_0%,rgba(209,154,71,0.12)_52%,transparent_72%)] blur-3xl" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-6 md:px-8 md:py-8">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_16px_rgba(209,154,71,0.12),0_12px_24px_rgba(0,93,122,0.12)]">
              <WorkforcePulseMark className="h-7 w-7" />
            </div>
            <div>
              <span className="block font-display text-xl font-semibold">Workforce Pulse</span>
              <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Montgomery signals</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <MontgomeryCityBadge size="md" tone="muted" className="hidden md:inline-flex" />
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center py-12 md:py-20">
          <div className="grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <section className="space-y-8">
              <div className="space-y-4">
                <MontgomeryCityBadge size="md" tone="muted" className="md:hidden" />
                <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                  A civic pulse system built for Montgomery&apos;s workforce reality.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                  Track hiring pressure, city signals, training gaps, and sector resilience through a single local intelligence layer designed for Montgomery, Alabama.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-xl px-8">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl border-white/40 bg-white/40 px-8 backdrop-blur-xl">
                  <Link href="/dashboard">Explore Dashboard</Link>
                </Button>
              </div>

              <div className="grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
                <div className="glass-card rounded-[24px] p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CivicSignalIcon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Live city signals</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    911 activity, permitting velocity, neighborhood pressure, and jobs in one operational view.
                  </p>
                </div>

                <div className="glass-card rounded-[24px] p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <SectorFieldIcon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Sector intelligence</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Monitor which sectors are stable, under watch, or critical before pressure turns into shortages.
                  </p>
                </div>

                <div className="glass-card rounded-[24px] p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <PathwaysIcon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Skills pathways</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Turn demand signals into training plans, local pathways, and mission-ready workforce responses.
                  </p>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/15 via-background/55 to-accent/10 p-6 shadow-[0_18px_44px_rgba(209,154,71,0.16),0_30px_90px_rgba(0,46,61,0.16)] backdrop-blur-2xl">
              <div className="absolute inset-0 montgomery-hero-photo montgomery-hero-photo-2 opacity-20" aria-hidden />
              <div className="absolute inset-0 montgomery-hero-skyline opacity-25" aria-hidden />
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(209,154,71,0.18)_0%,rgba(255,255,255,0.18)_30%,rgba(0,93,122,0.16)_62%,rgba(0,46,61,0.24)_100%)]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.5),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(0,89,142,0.26),transparent_34%),radial-gradient(circle_at_70%_85%,rgba(209,154,71,0.18),transparent_36%)] blur-[1px]"
                aria-hidden
              />
              <div className="relative space-y-5">
                <div className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Civic operating system
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Now tracking</p>
                  <h2 className="mt-2 font-display text-3xl text-foreground">Montgomery, Alabama</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-2xl border border-primary/20 bg-white/50 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Critical roles</p>
                    <p className="mt-2 text-3xl font-semibold">27</p>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-white/50 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Training gaps</p>
                    <p className="mt-2 text-3xl font-semibold">16+</p>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-white/50 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">System status</p>
                    <p className="mt-2 text-3xl font-semibold">89.6%</p>
                  </div>
                </div>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  Built for civic teams that need local clarity, not generic dashboards. Workforce Pulse surfaces where Montgomery should act next.
                </p>
              </div>
            </section>
          </div>
        </main>

        <footer className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 border-t border-border/50 px-1 py-6 text-sm text-muted-foreground">
          <p>Workforce Pulse, Montgomery workforce analytics.</p>
          <MontgomeryCityBadge size="md" compact tone="muted" className="opacity-75" />
        </footer>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
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

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Improved Header */}
        <header className="glass-card mx-auto mb-8 flex w-full max-w-7xl items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-lg sm:h-10 sm:w-10">
              <WorkforcePulseMark className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col">
              <span className="block font-display text-base font-semibold leading-tight sm:text-lg">Workforce Pulse</span>
              <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">Montgomery, AL</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <MontgomeryCityBadge size="sm" tone="muted" className="hidden lg:inline-flex" />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl text-sm shadow-lg sm:px-5">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </nav>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-16 py-8 sm:space-y-20 sm:py-12 lg:space-y-28 lg:py-16">
          {/* Hero Section */}
          <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 xl:gap-16">
            <section className="flex flex-col justify-center space-y-8 sm:space-y-10">
              <div className="space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary shadow-lg sm:text-[11px]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></span>
                  Live Workforce Intelligence
                </div>
                <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                  Real-time insights for Montgomery&apos;s workforce ecosystem
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl lg:leading-relaxed">
                  Connect job seekers, employers, and city leaders with actionable workforce data. Track hiring trends, identify training gaps, and unlock opportunities across Montgomery, Alabama.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button asChild size="lg" className="rounded-2xl px-8 text-base shadow-xl transition-transform hover:scale-105">
                  <Link href="/job-listings">Explore Job Listings</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/40 bg-white/40 px-8 text-base backdrop-blur-xl transition-all hover:bg-white/50">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>

              {/* Montgomery City Image - Mobile */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] border border-primary/20 shadow-xl lg:hidden">
                <Image
                  src="/images/montgomery-1.jpg"
                  alt="Montgomery, Alabama skyline"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-display text-lg font-semibold text-white drop-shadow-lg">Montgomery, Alabama</p>
                  <p className="text-sm text-white/90 drop-shadow">Building a stronger workforce together</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                <div className="glass-card card-hover-lift group rounded-[20px] p-6 transition-all sm:rounded-[24px]">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg transition-transform group-hover:scale-110">
                    <CivicSignalIcon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold leading-tight">Live City Signals</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    911 activity, permitting velocity, neighborhood trends, and job market data in one unified view.
                  </p>
                </div>

                <div className="glass-card card-hover-lift group rounded-[20px] p-6 transition-all sm:rounded-[24px]">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg transition-transform group-hover:scale-110">
                    <SectorFieldIcon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold leading-tight">Sector Intelligence</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Monitor which sectors are stable, under watch, or critical before shortages emerge.
                  </p>
                </div>

                <div className="glass-card card-hover-lift group rounded-[20px] p-6 transition-all sm:rounded-[24px]">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg transition-transform group-hover:scale-110">
                    <PathwaysIcon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold leading-tight">Skills Pathways</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Transform demand signals into training plans and mission-ready workforce responses.
                  </p>
                </div>
              </div>
            </section>

            {/* Live Workforce Dashboard Preview */}
            <section className="relative hidden overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/20 via-background/60 to-accent/15 p-6 shadow-[0_20px_60px_rgba(209,154,71,0.18),0_35px_100px_rgba(0,46,61,0.18)] backdrop-blur-2xl sm:rounded-[32px] sm:p-8 lg:block lg:p-10">
              {/* Background Montgomery Image */}
              <div className="absolute inset-0 opacity-10">
                <Image
                  src="/images/montgomery-2.jpg"
                  alt="Montgomery background"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background/60 to-accent/40" />
              </div>
              
              {/* Background layers */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,89,142,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(209,154,71,0.12),transparent_50%)]" aria-hidden />
              
              <div className="relative space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary shadow-lg sm:text-[11px]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></span>
                      Live Dashboard
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">Sector Health Overview</h2>
                    <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Montgomery, Alabama · Updated 5 min ago</p>
                  </div>
                </div>

                {/* Sector Status Grid */}
                <div className="space-y-3">
                  {/* Healthcare - Critical */}
                  <div className="group rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent p-4 backdrop-blur-xl transition-all hover:border-red-500/50 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                          <h3 className="font-semibold text-foreground">Healthcare & Social</h3>
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Critical</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>342 open roles</span>
                          <span>•</span>
                          <span className="text-red-600 dark:text-red-400">↑ 28% this month</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold text-red-600 dark:text-red-400">67%</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Fill Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Construction - Watch */}
                  <div className="group rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent p-4 backdrop-blur-xl transition-all hover:border-amber-500/50 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500"></div>
                          <h3 className="font-semibold text-foreground">Construction & Trades</h3>
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Watch</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>189 open roles</span>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400">↑ 12% this month</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400">78%</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Fill Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Technology - Stable */}
                  <div className="group rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-transparent p-4 backdrop-blur-xl transition-all hover:border-green-500/50 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <h3 className="font-semibold text-foreground">Technology & IT</h3>
                          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Stable</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>94 open roles</span>
                          <span>•</span>
                          <span className="text-green-600 dark:text-green-400">↓ 3% this month</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold text-green-600 dark:text-green-400">91%</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Fill Rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-primary/20 bg-white/50 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Total Jobs Tracked</p>
                    <p className="mt-1.5 font-display text-2xl font-semibold">1,847</p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-white/50 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Active Employers</p>
                    <p className="mt-1.5 font-display text-2xl font-semibold">324</p>
                  </div>
                  <div className="col-span-2 rounded-xl border border-primary/20 bg-white/50 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/20 sm:col-span-1">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Data Sources</p>
                    <p className="mt-1.5 font-display text-2xl font-semibold">6</p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  Get instant access to real-time workforce trends. See what sectors need attention and where opportunities are growing.
                </p>
              </div>
            </section>
          </div>

          {/* Benefits Sections */}
          <section className="space-y-10 sm:space-y-12">
            <div className="space-y-4 text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Built for Everyone in Montgomery
              </h2>
              <p className="mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                Workforce Pulse serves the entire community with real-time workforce intelligence tailored to your needs
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              {/* For the City */}
              <div className="glass-card card-hover-lift group overflow-hidden rounded-[28px] transition-all sm:rounded-[32px]">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/images/montgomery-3.jpg"
                    alt="City of Montgomery"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                  <div className="absolute bottom-4 left-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/90 text-white shadow-xl backdrop-blur-sm transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                    <CivicSignalIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                </div>
                <div className="p-8 lg:p-10">
                  <h3 className="mb-4 font-display text-2xl font-bold sm:text-3xl">For the City</h3>
                  <ul className="space-y-3.5 text-base leading-relaxed text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Early detection of staffing shortages in critical roles like public safety and healthcare</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Data-driven workforce planning and resource allocation</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Track sector health and identify emerging training needs</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Coordinate across departments with shared intelligence</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Evidence-based reporting for grants and community initiatives</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* For Citizens */}
              <div className="glass-card card-hover-lift group overflow-hidden rounded-[28px] transition-all sm:rounded-[32px]">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/images/montgomery-1.jpg"
                    alt="Montgomery citizens"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                  <div className="absolute bottom-4 left-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/90 text-white shadow-xl backdrop-blur-sm transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                    <PathwaysIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                </div>
                <div className="p-8 lg:p-10">
                  <h3 className="mb-4 font-display text-2xl font-bold sm:text-3xl">For Citizens</h3>
                  <ul className="space-y-3.5 text-base leading-relaxed text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Free access to job listings from multiple sources in one place</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Discover in-demand skills and training opportunities</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Find career pathways aligned with Montgomery&apos;s needs</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Enhanced features with profile: personalized recommendations, saved searches, skill tracking</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Participate in community missions and earn recognition</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* For Business Owners */}
              <div className="glass-card card-hover-lift group overflow-hidden rounded-[28px] transition-all sm:rounded-[32px]">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/images/montgomery-2.jpg"
                    alt="Montgomery businesses"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                  <div className="absolute bottom-4 left-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/90 text-white shadow-xl backdrop-blur-sm transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                    <SectorFieldIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                </div>
                <div className="p-8 lg:p-10">
                  <h3 className="mb-4 font-display text-2xl font-bold sm:text-3xl">For Businesses</h3>
                  <ul className="space-y-3.5 text-base leading-relaxed text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Understand competitive hiring landscape in Montgomery</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Identify skill gaps and local training resources</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Benchmark salaries and benefits against market trends</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Connect with education partners for workforce development</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 text-primary">•</span>
                      <span>Access sector-specific hiring trends and forecasts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="glass-card-strong relative overflow-hidden rounded-[32px] p-10 text-center sm:p-12 lg:p-16">
            {/* Background Image */}
            <div className="absolute inset-0 opacity-5">
              <Image
                src="/images/montgomery-3.jpg"
                alt="Montgomery background"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            
            <div className="relative mx-auto max-w-3xl space-y-6 sm:space-y-8">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Start Exploring Montgomery&apos;s Job Market Today
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                Browse hundreds of job listings for free. Create an account to unlock personalized recommendations, save searches, and access advanced analytics.
              </p>
              <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row sm:gap-4">
                <Button asChild size="lg" className="rounded-2xl px-10 text-base shadow-xl transition-transform hover:scale-105">
                  <Link href="/job-listings">View All Jobs</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/40 bg-white/40 px-10 text-base backdrop-blur-xl transition-all hover:bg-white/50">
                  <Link href="/login">Create Free Account</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <footer className="glass-card mx-auto mt-12 flex w-full max-w-7xl flex-col items-center justify-between gap-4 rounded-2xl px-6 py-5 text-sm text-muted-foreground sm:flex-row sm:gap-6">
          <p className="text-center sm:text-left">© 2026 Workforce Pulse · Montgomery workforce analytics</p>
          <MontgomeryCityBadge size="sm" compact tone="muted" className="opacity-75" />
        </footer>
      </div>
    </div>
  )
}

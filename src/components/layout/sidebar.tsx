"use client"

import Link from "next/link"
import type { ComponentType } from "react"
import { usePathname } from "next/navigation"
import { Settings } from "lucide-react"
import { MontgomeryCityBadge } from "@/components/branding/montgomery-city-badge"
import {
  BeaconMapIcon,
  DashboardPulseIcon,
  MissionRouteIcon,
  PlaybookTilesIcon,
  RadarSweepIcon,
  SectorFieldIcon,
  SkillOrbitIcon,
  WorkStackIcon,
  WorkforcePulseMark,
} from "@/components/branding/workforce-icons"
import { useUserRole } from "@/hooks/use-user-role"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardPulseIcon },
  { href: "/map", label: "Map", icon: BeaconMapIcon },
  { href: "/sectors", label: "Sectors", icon: SectorFieldIcon },
  { href: "/jobs", label: "Jobs", icon: WorkStackIcon },
  { href: "/skills", label: "Skills", icon: SkillOrbitIcon },
  { href: "/missions", label: "Missions", icon: MissionRouteIcon },
  { href: "/playbooks", label: "Playbooks", icon: PlaybookTilesIcon },
  { href: "/crawl", label: "Crawl", icon: RadarSweepIcon },
]

const CITIZEN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: DashboardPulseIcon },
  { href: "/jobs", label: "Jobs", icon: WorkStackIcon },
  { href: "/map", label: "Map", icon: BeaconMapIcon },
  { href: "/skills", label: "Training", icon: SkillOrbitIcon },
  { href: "/missions", label: "Missions", icon: MissionRouteIcon },
  { href: "/playbooks", label: "Playbooks", icon: PlaybookTilesIcon },
]

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(href + "/")
}

interface SidebarProps {
  onNavigate?: () => void
}

function SidebarLogo() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_16px_rgba(209,154,71,0.12),0_10px_24px_rgba(0,93,122,0.1)] dark:border-primary/35 dark:bg-primary/18 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.28)]">
      <WorkforcePulseMark className="h-7 w-7" />
    </div>
  )
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { isAdmin } = useUserRole()
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : CITIZEN_NAV_ITEMS

  return (
    <div className="glass-panel flex h-full w-full shrink-0 flex-col rounded-none border-r border-glass-border-light px-3 py-4 dark:border-glass-border-dark lg:items-center lg:px-0 lg:py-8">
      <div className="mb-5 flex items-center gap-3 px-1 lg:mb-12 lg:flex-col lg:items-center lg:gap-2 lg:px-0">
        <SidebarLogo />
        <div className="min-w-0 lg:hidden">
          <p className="font-display text-sm font-semibold leading-none">Workforce Pulse</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Montgomery</p>
        </div>
      </div>

      <nav className="flex w-full flex-1 flex-col gap-1.5 lg:gap-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              scroll={false}
              onClick={() => onNavigate?.()}
              data-tour={item.label === "Missions" ? "nav-missions" : undefined}
              className={cn(
                "relative mx-0 flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all lg:mx-2 lg:flex-col lg:items-center lg:gap-0 lg:px-0 lg:py-1.5",
                active
                  ? "glass-panel border-primary/45 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_16px_rgba(209,154,71,0.08),0_10px_24px_rgba(0,93,122,0.1)] dark:border-primary/40 dark:bg-primary/14"
                  : "border-transparent text-muted-foreground hover:border-white/15 hover:bg-white/20 hover:text-foreground dark:hover:border-white/10 dark:hover:bg-white/5"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0 lg:mb-0.5", active ? "text-primary" : "")} />
              <span className={cn("text-xs font-medium lg:block lg:text-[9px]", active ? "text-primary" : "")}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex w-full flex-col items-start gap-3 pt-3 lg:items-center lg:gap-4 lg:px-2 lg:pt-4">
        <MontgomeryCityBadge size="md" compact tone="muted" className="opacity-80" />
        <Link
          href="/settings"
          scroll={false}
          onClick={() => onNavigate?.()}
          className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-muted-foreground transition-colors hover:border-white/15 hover:bg-white/20 hover:text-foreground dark:hover:border-white/10 dark:hover:bg-white/5 lg:w-auto lg:flex-col lg:border-none lg:px-0"
        >
          <Settings className="h-5 w-5 lg:mb-1" />
          <span className="text-xs lg:hidden">Settings</span>
          <span className="hidden text-[10px] lg:block">Settings</span>
        </Link>
      </div>
    </div>
  )
}
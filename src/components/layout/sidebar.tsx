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
    <div className="glass-panel flex h-full w-full shrink-0 flex-col items-center rounded-none border-r border-glass-border-light py-8 dark:border-glass-border-dark">
      <div className="mb-12">
        <SidebarLogo />
      </div>

      <nav className="flex w-full flex-1 flex-col gap-3 px-0">
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
                "relative mx-2 flex flex-col items-center rounded-2xl border py-1.5 transition-all lg:py-2",
                active
                  ? "glass-panel border-primary/45 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_16px_rgba(209,154,71,0.08),0_10px_24px_rgba(0,93,122,0.1)] dark:border-primary/40 dark:bg-primary/14"
                  : "border-transparent text-muted-foreground hover:border-white/15 hover:bg-white/20 hover:text-foreground dark:hover:border-white/10 dark:hover:bg-white/5"
              )}
            >
              <item.icon className={cn("mb-0.5 h-4 w-4 shrink-0", active ? "text-primary" : "")} />
              <span className={cn("hidden text-[9px] font-medium lg:block", active ? "text-primary" : "")}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex w-full flex-col items-center gap-4 px-2 pt-4">
        <MontgomeryCityBadge size="md" compact tone="muted" className="hidden opacity-80 lg:inline-flex" />
        <Link
          href="/settings"
          scroll={false}
          onClick={() => onNavigate?.()}
          className="flex flex-col items-center py-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings className="mb-1 h-5 w-5" />
          <span className="hidden text-[10px] lg:block">Settings</span>
        </Link>
      </div>
    </div>
  )
}
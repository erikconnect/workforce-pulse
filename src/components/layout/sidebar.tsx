"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MapPin,
  Grid3X3,
  Zap,
  Target,
  BookOpen,
  Search,
  GraduationCap,
  Briefcase,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserRole } from "@/hooks/use-user-role"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/sectors", label: "Sectors", icon: Grid3X3 },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/skills", label: "Skills", icon: Zap },
  { href: "/missions", label: "Missions", icon: Target },
  { href: "/playbooks", label: "Playbooks", icon: BookOpen },
  { href: "/crawl", label: "Crawl", icon: Search },
]

const CITIZEN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/skills", label: "Training", icon: GraduationCap },
  { href: "/missions", label: "Missions", icon: Target },
  { href: "/playbooks", label: "Playbooks", icon: BookOpen },
]

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(href + "/")
}

interface SidebarProps {
  onNavigate?: () => void
}

function SidebarLogo() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_rgba(209,154,71,0.18)] dark:border-primary/35 dark:bg-primary/18 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.28)]">
      <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden>
        <rect x="8" y="8" width="32" height="32" rx="11" fill="currentColor" opacity="0.12" />
        <path
          d="M12 26h7l3.2-7.5 4.4 15 4.1-10H36"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.35" />
      </svg>
    </div>
  )
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { isAdmin } = useUserRole()
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : CITIZEN_NAV_ITEMS

  return (
    <div className="flex h-full w-full flex-col items-center py-8 border-r border-glass-border-light dark:border-glass-border-dark shrink-0 glass-panel rounded-none">
      {/* Logo */}
      <div className="mb-12">
        <SidebarLogo />
      </div>

      <nav className="flex-1 w-full flex flex-col gap-6 px-0">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              data-tour={item.label === "Missions" ? "nav-missions" : undefined}
              className={cn(
                "relative mx-2 flex flex-col items-center rounded-2xl border py-2 transition-all lg:py-3",
                active
                  ? "glass-panel border-primary/45 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_24px_rgba(209,154,71,0.14)] dark:border-primary/40 dark:bg-primary/14"
                  : "border-transparent text-muted-foreground hover:border-white/15 hover:text-foreground hover:bg-white/20 dark:hover:border-white/10 dark:hover:bg-white/5"
              )}
            >
              <item.icon className={cn("mb-1 h-5 w-5 shrink-0", active ? "text-primary" : "")} />
              <span className={cn("hidden text-[10px] font-medium lg:block", active ? "text-primary" : "")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4">
        <Link
          href="/settings"
          onClick={() => onNavigate?.()}
          className="flex flex-col items-center py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-[10px] hidden lg:block">Settings</span>
        </Link>
      </div>
    </div>
  )
}

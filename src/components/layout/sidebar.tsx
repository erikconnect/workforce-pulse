"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  LayoutDashboard,
  Building2,
  Zap,
  Target,
  BookOpen,
  Globe,
  MapPin,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/sectors", label: "Sectors", icon: Building2 },
  { href: "/skills", label: "Skills", icon: Zap },
  { href: "/missions", label: "Missions", icon: Target },
  { href: "/playbooks", label: "Playbooks", icon: BookOpen },
  { href: "/crawl", label: "Crawl", icon: Globe },
]

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-border shrink-0">
        <Activity className="h-5 w-5 text-pulse-watch shrink-0" />
        <span className="font-semibold text-sm tracking-tight">
          Workforce Pulse
        </span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                data-tour={item.label === "Missions" ? "nav-missions" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator />
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground">v0.1.0</p>
      </div>
    </div>
  )
}

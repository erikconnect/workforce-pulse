"use client"

import { Map, Briefcase, Users, MapPin, RadioTower, Settings } from "lucide-react"
import Link from "next/link"

const STATIC_ACTIONS = [
  { icon: Briefcase, label: "Browse open jobs", href: "/jobs" },
  { icon: Users, label: "Map workforce skills", href: "/skills" },
  { icon: MapPin, label: "Explore sectors", href: "/sectors" },
  { icon: Map, label: "View city map", href: "/map" },
  { icon: RadioTower, label: "Launch job scraper", href: "/crawl" },
  { icon: Settings, label: "System settings", href: "/settings" },
]

export function QuickActions() {
  return (
    <div data-tour="quick-actions" className="glass-panel rounded-[30px] p-5 lg:min-h-[404px] h-full flex flex-col">
      <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
      <div className="flex flex-1 flex-col gap-3">
        {STATIC_ACTIONS.map(({ icon: Icon, label, href }) => (
          <Link
            key={href + label + Icon.displayName}
            href={href}
            className="glass-panel w-full min-h-0 flex-1 py-3.5 px-5 rounded-2xl flex items-center gap-4 text-sm font-medium hover:bg-white/40 dark:hover:bg-white/10 transition-colors text-left"
          >
            <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

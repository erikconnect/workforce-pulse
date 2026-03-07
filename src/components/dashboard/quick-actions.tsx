"use client"

import { Map, Award, Monitor, Briefcase, Rocket, Settings } from "lucide-react"
import Link from "next/link"

const STATIC_ACTIONS = [
  { icon: Map, label: "Map required skills", href: "/skills" },
  { icon: Award, label: "Validate competency", href: "/sectors" },
  { icon: Monitor, label: "Host 3 virtual job fairs", href: "/missions" },
  { icon: Briefcase, label: "Host 3 virtual job fairs", href: "/missions" },
  { icon: Rocket, label: "Host 3 virtual job fairs", href: "/missions" },
  { icon: Settings, label: "Configure settings", href: "/settings" },
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

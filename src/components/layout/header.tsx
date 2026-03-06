"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCircle, Menu, Search, Play, ChevronRight, User } from "lucide-react"
import { SettingsModal } from "@/components/settings/SettingsModal"
import { PulseIndicator } from "@/components/layout/pulse-indicator"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { fetchAlerts, submitDailyCheckIn } from "@/services"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const ALERT_DOT: Record<string, string> = {
  critical: "bg-red-500",
  watch: "bg-amber-500",
  stable: "bg-green-500",
}

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard"
  if (pathname === "/map") return "Map"
  if (pathname.startsWith("/sectors/")) return "Sector Detail"
  if (pathname === "/sectors") return "Sectors"
  if (pathname === "/skills") return "Skills"
  if (pathname === "/missions") return "Missions"
  if (pathname === "/playbooks") return "Playbooks"
  if (pathname === "/crawl") return "Crawl"
  return "Workforce Pulse"
}

interface HeaderProps {
  onMenuClick: () => void
  onStartTour?: () => void
}

export function Header({ onMenuClick, onStartTour }: HeaderProps) {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  })

  const totalAlerts = alerts?.length ?? 0
  const criticalCount = alerts?.filter((a) => a.severity === "critical").length ?? 0

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [notifOpen])

  const checkInMutation = useMutation({
    mutationFn: submitDailyCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pulseSummary"] })
    },
  })

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Separator orientation="vertical" className="lg:hidden h-5" />

      <h1 className="text-sm font-semibold">
        {getPageTitle(pathname)}
      </h1>

      {/* Search hint — opens command palette */}
      <button
        onClick={() => {
          const e = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
          window.dispatchEvent(e)
        }}
        className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-muted/50 text-xs text-muted-foreground hover:bg-muted transition-colors flex-1 max-w-xs"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="ml-auto text-[10px] bg-background border border-border rounded px-1 py-0.5">
          Ctrl K
        </kbd>
      </button>

      <div className="flex-1 sm:hidden" />

      <PulseIndicator />
      <ThemeToggle />

      {onStartTour && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs hidden sm:flex"
          onClick={onStartTour}
        >
          <Play className="h-3 w-3" />
          Tour
        </Button>
      )}

      {/* Notifications dropdown */}
      <div ref={notifRef} className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          onClick={() => setNotifOpen((o) => !o)}
        >
          <Bell className="h-5 w-5" />
          {totalAlerts > 0 && (
            <Badge
              variant={criticalCount > 0 ? "destructive" : "secondary"}
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 py-0 text-[10px] leading-none flex items-center justify-center"
            >
              {totalAlerts}
            </Badge>
          )}
        </Button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold">Notifications</span>
              {criticalCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {criticalCount} critical
                </Badge>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-border">
              {(alerts ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No notifications</p>
              ) : (
                alerts?.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors">
                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${ALERT_DOT[alert.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">{alert.message}</p>
                      {alert.cta && (
                        <Link
                          href={alert.cta.href}
                          onClick={() => setNotifOpen(false)}
                          className="text-[11px] text-accent hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          {alert.cta.label} <ChevronRight className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => checkInMutation.mutate()}
        disabled={checkInMutation.isPending}
        className="gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Daily Check-In</span>
      </Button>

      {/* User avatar */}
      <div className="flex items-center gap-2 pl-1 border-l border-border ml-1">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-medium leading-none">City Admin</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Montgomery, AL</p>
        </div>
      </div>

      <SettingsModal />
    </header>
  )
}

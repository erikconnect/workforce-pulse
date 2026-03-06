"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, Calendar, ChevronRight, ChevronDown, LogOut, Menu, Play, Search, Settings, User } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { fetchAlerts, fetchMissionMemberProfile, fetchPulseSummary, submitDailyCheckIn } from "@/services"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ALERT_DOT: Record<string, string> = {
  critical: "bg-red-500",
  watch: "bg-amber-500",
  stable: "bg-green-500",
}

interface HeaderProps {
  onMenuClick: () => void
  onStartTour?: () => void
}

export function Header({ onMenuClick, onStartTour }: HeaderProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const userName = session?.user?.name ?? "City Admin"
  const userCity = (session?.user as { city?: string })?.city ?? "Montgomery, AL"

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  })
  const { data: pulseSummary } = useQuery({
    queryKey: ["pulseSummary"],
    queryFn: fetchPulseSummary,
  })
  const { data: missionMemberProfile } = useQuery({
    queryKey: ["missionMemberProfile"],
    queryFn: fetchMissionMemberProfile,
  })

  const totalAlerts = alerts?.length ?? 0
  const criticalCount = alerts?.filter((a) => a.severity === "critical").length ?? 0

  const checkInMutation = useMutation({
    mutationFn: submitDailyCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pulseSummary"] })
    },
  })

  return (
    <header className="flex h-16 items-center gap-3 border-b border-glass-border-light/80 dark:border-glass-border-dark glass-panel px-4 md:px-6 shrink-0">
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

      {/* Search — opens command palette */}
      <button
        onClick={() => {
          const e = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
          window.dispatchEvent(e)
        }}
        className="hidden sm:flex min-w-[14rem] flex-1 items-center gap-2 h-10 pl-4 pr-4 py-2.5 rounded-2xl bg-white/25 dark:bg-black/10 border border-white/30 text-sm text-muted-foreground hover:bg-white/40 dark:hover:bg-white/15 transition-colors"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span>Search</span>
      </button>

      <div className="flex-1 sm:hidden" />

      {onStartTour && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs hidden"
          onClick={onStartTour}
        >
          <Play className="h-3 w-3" />
          Tour
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-2xl bg-white/20 dark:bg-white/5 hover:bg-white/35 dark:hover:bg-white/10"
            aria-label="Notifications"
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
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0 rounded-lg overflow-hidden">
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
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeToggle className="bg-white/20 dark:bg-white/5 hover:bg-white/35 dark:hover:bg-white/10" />

      <Button
        variant="outline"
        size="sm"
        onClick={() => checkInMutation.mutate()}
        disabled={checkInMutation.isPending || pulseSummary?.checkInCompleted}
        title={
          pulseSummary?.checkInCompleted
            ? "Today's check-in is already complete. A new check-in opens tomorrow."
            : "Check in once per day to keep workforce pulse trends current."
        }
        className="gap-2 glass-panel rounded-2xl px-6 py-3 text-sm font-medium hover:bg-white/40 dark:hover:bg-white/10"
      >
        <Calendar className="h-[18px] w-[18px]" />
        <span className="hidden sm:inline">
          {pulseSummary?.checkInCompleted ? "Checked In Today" : "Daily Check-In"}
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 pl-4 border-l border-glass-border-light dark:border-glass-border-dark ml-1 rounded-2xl hover:bg-white/10 transition-colors pr-2 py-1.5">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold leading-none">{userName}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{userCity}</p>
            </div>
            {missionMemberProfile && (
              <Badge variant="primary" className="hidden lg:inline-flex">
                {missionMemberProfile.points} pts
              </Badge>
            )}
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-white/50 dark:border-white/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass-panel">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

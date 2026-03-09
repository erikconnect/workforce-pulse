"use client"

import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ThemePreference = "light" | "dark" | "system"

const ORDER: ThemePreference[] = ["light", "dark", "system"]

function getNextTheme(current: ThemePreference): ThemePreference {
  const idx = ORDER.indexOf(current)
  return ORDER[(idx + 1) % ORDER.length]
}

function resolveDarkMode(theme: ThemePreference): boolean {
  if (theme === "dark") return true
  if (theme === "light") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function iconForTheme(theme: ThemePreference) {
  if (theme === "dark") return Moon
  if (theme === "light") return Sun
  return Monitor
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemePreference>("system")

  useEffect(() => {
    const stored = localStorage.getItem("wfp-theme")
    const initial: ThemePreference = stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system"

    setTheme(initial)
    document.documentElement.classList.toggle("dark", resolveDarkMode(initial))
  }, [])

  function toggle() {
    const next = getNextTheme(theme)
    setTheme(next)
    document.documentElement.classList.toggle("dark", resolveDarkMode(next))
    localStorage.setItem("wfp-theme", next)
  }

  useEffect(() => {
    if (theme !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      document.documentElement.classList.toggle("dark", media.matches)
    }

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme])

  const Icon = iconForTheme(theme)
  const nextTheme = getNextTheme(theme)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      title={`Theme: ${theme}. Click for ${nextTheme}.`}
      aria-label={`Theme ${theme}. Click to switch to ${nextTheme}.`}
      className={cn("h-9 w-9 rounded-2xl", className)}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}

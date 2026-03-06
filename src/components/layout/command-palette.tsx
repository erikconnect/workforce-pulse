"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Building2, Zap, Target, BookOpen, LayoutDashboard, Globe } from "lucide-react"
import { fetchSectors, fetchSkills, fetchMissions, fetchPlaybooks } from "@/services"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { data: sectors } = useQuery({ queryKey: ["sectors"], queryFn: fetchSectors })
  const { data: skills } = useQuery({ queryKey: ["skills"], queryFn: () => fetchSkills() })
  const { data: missions } = useQuery({ queryKey: ["missions"], queryFn: fetchMissions })
  const { data: playbooks } = useQuery({ queryKey: ["playbooks"], queryFn: fetchPlaybooks })

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const navigate = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  const pages = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Sectors", href: "/sectors", icon: Building2 },
    { label: "Skills", href: "/skills", icon: Zap },
    { label: "Missions", href: "/missions", icon: Target },
    { label: "Playbooks", href: "/playbooks", icon: BookOpen },
    { label: "Crawl", href: "/crawl", icon: Globe },
  ]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search sectors, skills, missions, playbooks…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem key={page.href} onSelect={() => navigate(page.href)}>
              <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {sectors && sectors.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Sectors">
              {sectors.map((s) => (
                <CommandItem key={s.id} onSelect={() => navigate(`/sectors/${s.id}`)}>
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  {s.name}
                  <span className="ml-auto text-xs text-muted-foreground capitalize">{s.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Skills">
              {skills.slice(0, 10).map((s) => (
                <CommandItem key={s.id} onSelect={() => navigate("/skills")}>
                  <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
                  {s.name}
                  <span className="ml-auto text-xs text-muted-foreground">{s.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {missions && missions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Missions">
              {missions.map((m) => (
                <CommandItem key={m.id} onSelect={() => navigate("/missions")}>
                  <Target className="mr-2 h-4 w-4 text-muted-foreground" />
                  {m.title}
                  <span className="ml-auto text-xs text-muted-foreground">{m.progress}%</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {playbooks && playbooks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Playbooks">
              {playbooks.slice(0, 8).map((p) => (
                <CommandItem key={p.id} onSelect={() => navigate("/playbooks")}>
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                  {p.title}
                  <span className="ml-auto text-xs text-muted-foreground">{p.likes} likes</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}

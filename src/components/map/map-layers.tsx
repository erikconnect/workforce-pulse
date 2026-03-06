"use client"

import { Layers, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface MapLayer {
  id: string
  label: string
  color: string
  enabled: boolean
}

interface MapLayersProps {
  layers: MapLayer[]
  onToggle: (id: string) => void
}

const LAYER_DOT_CLASS: Record<string, string> = {
  zones: "bg-green-500",
  calls: "bg-red-500",
  stations: "bg-blue-500",
  permits: "bg-amber-500",
  jobs: "bg-violet-500",
  heritage: "bg-[#b98646]",
  military: "bg-[#005e95]",
}

export function MapLayers({ layers, onToggle }: MapLayersProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="absolute top-3 right-3 z-[1000] max-w-[224px] overflow-hidden rounded-2xl border border-white/35 bg-card/90 shadow-[0_22px_46px_rgba(0,0,0,0.14)] backdrop-blur-xl dark:border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-white/20 dark:hover:bg-white/5"
      >
        <Layers className="h-3.5 w-3.5" />
        Layers
        {open ? (
          <ChevronUp className="h-3 w-3 ml-auto" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-auto" />
        )}
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-border/70 px-3 py-2">
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => onToggle(layer.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-xs transition-all",
                layer.enabled
                  ? "border-primary/30 bg-primary/10 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  : "border-transparent bg-white/20 text-foreground/80 hover:border-white/15 hover:bg-white/35 dark:bg-white/5 dark:hover:border-white/10 dark:hover:bg-white/10"
              )}
            >
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                  LAYER_DOT_CLASS[layer.id] ?? "bg-primary",
                )}
              />
              <span className="flex-1 text-left">{layer.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  layer.enabled
                    ? "bg-primary/15 text-primary"
                    : "bg-black/5 text-muted-foreground dark:bg-white/5"
                )}
              >
                {layer.enabled ? "On" : "Off"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

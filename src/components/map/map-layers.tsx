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

export function MapLayers({ layers, onToggle }: MapLayersProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="absolute top-3 right-3 z-[1000] bg-card border border-border rounded-lg shadow-lg max-w-[200px]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-foreground"
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
        <div className="border-t border-border px-3 py-2 space-y-1.5">
          {layers.map((layer) => (
            <label
              key={layer.id}
              className="flex items-center gap-2 text-xs cursor-pointer"
            >
              <input
                type="checkbox"
                checked={layer.enabled}
                onChange={() => onToggle(layer.id)}
                className="rounded border-border"
              />
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                )}
                style={{ backgroundColor: layer.color }}
              />
              <span className="text-foreground">{layer.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

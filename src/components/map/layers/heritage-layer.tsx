"use client"

import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { MONTGOMERY_LANDMARKS } from "@/data/montgomery-landmarks"

const HERITAGE_ICON = L.divIcon({
  html: `<span style="font-size:20px">⭐</span>`,
  className: "bg-transparent",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export function HeritageLayer() {
  return (
    <>
      {MONTGOMERY_LANDMARKS.map((lm) => (
        <Marker key={lm.id} position={[lm.lat, lm.lng]} icon={HERITAGE_ICON}>
          <Popup>
            <div className="text-xs space-y-1 max-w-[220px]">
              <p className="font-bold text-sm">{lm.name}</p>
              <p className="text-muted-foreground italic">Est. {lm.year}</p>
              <p>{lm.significance}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

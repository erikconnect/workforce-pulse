"use client"

import { Polygon, Marker, Popup, Tooltip } from "react-leaflet"
import L from "leaflet"

// Maxwell Air Force Base approximate boundary
const MAXWELL_BOUNDARY: [number, number][] = [
  [32.3905, -86.3710],
  [32.3905, -86.3500],
  [32.3780, -86.3500],
  [32.3710, -86.3580],
  [32.3710, -86.3710],
]

// Gunter Annex (east of downtown)
const GUNTER_BOUNDARY: [number, number][] = [
  [32.4080, -86.2750],
  [32.4080, -86.2580],
  [32.3990, -86.2580],
  [32.3990, -86.2750],
]

const MILITARY_ICON = L.divIcon({
  html: `<span style="font-size:20px">🎖️</span>`,
  className: "bg-transparent",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export function MilitaryLayer() {
  return (
    <>
      {/* Maxwell AFB */}
      <Polygon
        positions={MAXWELL_BOUNDARY}
        pathOptions={{
          color: "#005e95",
          fillColor: "#005e95",
          fillOpacity: 0.15,
          weight: 2,
          dashArray: "6 4",
        }}
      >
        <Tooltip sticky>
          <div className="text-xs">
            <p className="font-semibold">Maxwell Air Force Base</p>
            <p>Home of Air University — ~12,000 military and civilian personnel</p>
          </div>
        </Tooltip>
      </Polygon>
      <Marker position={[32.3830, -86.3610]} icon={MILITARY_ICON}>
        <Popup>
          <div className="text-xs space-y-1 max-w-[220px]">
            <p className="font-bold text-sm">Maxwell Air Force Base</p>
            <p>Headquarters of Air University and a major employer in the Montgomery region.</p>
            <p className="font-medium">~12,000 military & civilian personnel</p>
            <p className="text-muted-foreground">Established 1918 — named for 2nd Lt. William C. Maxwell</p>
          </div>
        </Popup>
      </Marker>

      {/* Gunter Annex */}
      <Polygon
        positions={GUNTER_BOUNDARY}
        pathOptions={{
          color: "#005e95",
          fillColor: "#005e95",
          fillOpacity: 0.12,
          weight: 2,
          dashArray: "6 4",
        }}
      >
        <Tooltip sticky>
          <div className="text-xs">
            <p className="font-semibold">Gunter Annex</p>
            <p>Maxwell AFB annex — IT, communications, and contractor workforce hub</p>
          </div>
        </Tooltip>
      </Polygon>
      <Marker position={[32.4035, -86.2665]} icon={MILITARY_ICON}>
        <Popup>
          <div className="text-xs space-y-1 max-w-[220px]">
            <p className="font-bold text-sm">Gunter Annex</p>
            <p>Focus on IT, communications, and technology operations. Major contractor and civilian employment center.</p>
          </div>
        </Popup>
      </Marker>
    </>
  )
}

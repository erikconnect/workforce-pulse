"use client"

import { Marker, Popup } from "react-leaflet"
import { useQuery } from "@tanstack/react-query"
import L from "leaflet"

function makeIcon(emoji: string) {
  return L.divIcon({
    html: `<span style="font-size:22px">${emoji}</span>`,
    className: "bg-transparent",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const ICONS: Record<string, L.DivIcon> = {
  police: makeIcon("🛡️"),
  fire: makeIcon("🔥"),
  ems: makeIcon("🏥"),
  default: makeIcon("📍"),
}

function guessType(props: Record<string, unknown>): string {
  const name = String(props.Name ?? props.name ?? props.FACILITY_NAME ?? "").toLowerCase()
  if (name.includes("police") || name.includes("precinct")) return "police"
  if (name.includes("fire") || name.includes("engine") || name.includes("station")) return "fire"
  if (name.includes("ems") || name.includes("medic") || name.includes("hospital")) return "ems"
  return "default"
}

interface Feature {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: Record<string, unknown>
}

export function StationsLayer() {
  const { data } = useQuery<{ type: string; features: Feature[] }>({
    queryKey: ["arcgis", "stations"],
    queryFn: async () => {
      const r = await fetch("/api/arcgis/stations")
      const json = await r.json()
      if (!r.ok) throw new Error(json.error ?? `HTTP ${r.status}`)
      return json
    },
    staleTime: 3600_000,
    retry: 1,
  })

  if (!data?.features) return null

  return (
    <>
      {data.features.map((f, i) => {
        if (f.geometry?.type !== "Point") return null
        const [lng, lat] = f.geometry.coordinates
        const type = guessType(f.properties)
        return (
          <Marker key={i} position={[lat, lng]} icon={ICONS[type]}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold">
                  {String(f.properties.Name ?? f.properties.name ?? f.properties.FACILITY_NAME ?? "Station")}
                </p>
                <p className="capitalize text-muted-foreground">{type}</p>
                {f.properties.Address ? (
                  <p>{String(f.properties.Address)}</p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

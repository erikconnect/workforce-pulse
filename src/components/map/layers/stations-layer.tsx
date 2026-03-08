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
  geometry: { type: string; coordinates: unknown }
  properties: Record<string, unknown>
}

function toLatLng(feature: Feature): [number, number] | null {
  const geometry = feature.geometry
  if (!geometry) return null

  if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
    const [lng, lat] = geometry.coordinates as [number, number]
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]
  }

  if (geometry.type === "MultiPoint" && Array.isArray(geometry.coordinates)) {
    const first = geometry.coordinates[0]
    if (Array.isArray(first) && first.length >= 2) {
      const [lng, lat] = first as [number, number]
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]
    }
  }

  const props = feature.properties ?? {}
  const lngCandidate = Number(props.LON ?? props.LONGITUDE ?? props.longitude ?? props.lng ?? props.X)
  const latCandidate = Number(props.LAT ?? props.LATITUDE ?? props.latitude ?? props.lat ?? props.Y)
  if (Number.isFinite(latCandidate) && Number.isFinite(lngCandidate)) return [latCandidate, lngCandidate]

  return null
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
        const center = toLatLng(f)
        if (!center) return null
        const type = guessType(f.properties)
        return (
          <Marker key={i} position={center} icon={ICONS[type]}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold">
                  {String(f.properties.Name ?? f.properties.name ?? f.properties.FACILITY_NAME ?? "Station")}
                </p>
                <p className="capitalize text-muted-foreground">{type}</p>
                {f.properties.Address ?? f.properties.address ?? f.properties.ADDRESS ? (
                  <p>{String(f.properties.Address ?? f.properties.address ?? f.properties.ADDRESS)}</p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

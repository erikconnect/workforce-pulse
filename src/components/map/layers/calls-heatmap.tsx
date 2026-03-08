"use client"

import { CircleMarker, Popup } from "react-leaflet"
import { useQuery } from "@tanstack/react-query"

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

export function CallsHeatmapLayer() {
  const { data } = useQuery<{ type: string; features: Feature[] }>({
    queryKey: ["arcgis", "911-calls"],
    queryFn: async () => {
      const r = await fetch("/api/arcgis/911-calls")
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
        return (
          <CircleMarker
            key={i}
            center={center}
            radius={7}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.5,
              weight: 1.2,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold">911 Call</p>
                {f.properties.type ?? f.properties.TYPE ? <p>Type: {String(f.properties.type ?? f.properties.TYPE)}</p> : null}
                {f.properties.address ?? f.properties.ADDRESS ? (
                  <p>{String(f.properties.address ?? f.properties.ADDRESS)}</p>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

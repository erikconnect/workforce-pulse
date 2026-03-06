"use client"

import { CircleMarker, Popup } from "react-leaflet"
import { useQuery } from "@tanstack/react-query"

interface Feature {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: Record<string, unknown>
}

export function CallsHeatmapLayer() {
  const { data } = useQuery<{ type: string; features: Feature[] }>({
    queryKey: ["arcgis", "911-calls"],
    queryFn: () => fetch("/api/arcgis/911-calls").then((r) => r.json()),
    staleTime: 3600_000,
  })

  if (!data?.features) return null

  return (
    <>
      {data.features.map((f, i) => {
        if (f.geometry?.type !== "Point") return null
        const [lng, lat] = f.geometry.coordinates
        return (
          <CircleMarker
            key={i}
            center={[lat, lng]}
            radius={6}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.4,
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold">911 Call</p>
                {f.properties.type ? <p>Type: {String(f.properties.type)}</p> : null}
                {f.properties.address ? (
                  <p>{String(f.properties.address)}</p>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

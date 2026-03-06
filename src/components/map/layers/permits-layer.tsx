"use client"

import { CircleMarker, Popup } from "react-leaflet"
import { useQuery } from "@tanstack/react-query"

interface Feature {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: Record<string, unknown>
}

export function PermitsLayer() {
  const { data } = useQuery<{ type: string; features: Feature[] }>({
    queryKey: ["arcgis", "permits"],
    queryFn: () => fetch("/api/arcgis/permits").then((r) => r.json()),
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
            radius={5}
            pathOptions={{
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: 0.5,
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold">Construction Permit</p>
                {f.properties.PermitType ? (
                  <p>Type: {String(f.properties.PermitType)}</p>
                ) : null}
                {f.properties.Address ? (
                  <p>{String(f.properties.Address)}</p>
                ) : null}
                {f.properties.IssuedDate ? (
                  <p>Issued: {String(f.properties.IssuedDate)}</p>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

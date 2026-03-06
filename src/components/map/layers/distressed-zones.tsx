"use client"

import { Polygon, Tooltip } from "react-leaflet"
import { MONTGOMERY_ZONES } from "@/data/montgomery-zones"
import { useQuery } from "@tanstack/react-query"

interface FeatureCollection {
  features: Array<{
    geometry: { type: string; coordinates: [number, number] }
    properties: Record<string, unknown>
  }>
}

function countPointsInZone(
  points: [number, number][],
  polygon: Array<[number, number]>
): number {
  // Simple bounding-box hit test for approximate zone scoring
  const lats = polygon.map((p) => p[0])
  const lngs = polygon.map((p) => p[1])
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  return points.filter(
    ([lat, lng]) => lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
  ).length
}

function distressColor(score: number): string {
  // 0 = deeply distressed (red), 50 = moderate (amber), 100 = healthy (green)
  if (score < 30) return "#ef4444"
  if (score < 60) return "#f59e0b"
  return "#22c55e"
}

export function DistressedZonesLayer() {
  const { data: callsData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "911-calls"],
    queryFn: () => fetch("/api/arcgis/911-calls").then((r) => r.json()),
    staleTime: 3600_000,
  })

  const { data: permitsData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "permits"],
    queryFn: async () => {
      const r = await fetch("/api/arcgis/permits")
      const json = await r.json()
      if (!r.ok) throw new Error(json.error ?? `HTTP ${r.status}`)
      return json
    },
    staleTime: 3600_000,
    retry: 1,
  })

  // Extract coordinate arrays
  const callPoints: [number, number][] = (callsData?.features ?? [])
    .filter((f) => f.geometry?.type === "Point")
    .map((f) => {
      const [lng, lat] = f.geometry.coordinates
      return [lat, lng] as [number, number]
    })

  const permitPoints: [number, number][] = (permitsData?.features ?? [])
    .filter((f) => f.geometry?.type === "Point")
    .map((f) => {
      const [lng, lat] = f.geometry.coordinates
      return [lat, lng] as [number, number]
    })

  return (
    <>
      {MONTGOMERY_ZONES.map((zone) => {
        const calls = countPointsInZone(callPoints, zone.polygon as Array<[number, number]>)
        const permits = countPointsInZone(permitPoints, zone.polygon as Array<[number, number]>)

        // Score: more permits = better, more calls = worse
        const maxCalls = Math.max(callPoints.length / MONTGOMERY_ZONES.length, 1)
        const maxPermits = Math.max(permitPoints.length / MONTGOMERY_ZONES.length, 1)
        const callScore = Math.max(0, 100 - (calls / maxCalls) * 100)
        const permitScore = Math.min(100, (permits / maxPermits) * 100)
        const compositeScore = Math.round(callScore * 0.5 + permitScore * 0.5)
        const color = distressColor(compositeScore)

        return (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.25,
              weight: 2,
            }}
          >
            <Tooltip sticky>
              <div className="text-xs">
                <p className="font-semibold">{zone.name}</p>
                <p className="text-muted-foreground">{zone.description}</p>
                <div className="mt-1 space-y-0.5">
                  <p>Health Score: <strong>{compositeScore}/100</strong></p>
                  <p>911 Calls: {calls} | Permits: {permits}</p>
                </div>
              </div>
            </Tooltip>
          </Polygon>
        )
      })}
    </>
  )
}

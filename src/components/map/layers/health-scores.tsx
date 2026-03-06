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

function countInBBox(
  points: [number, number][],
  polygon: Array<[number, number]>
): number {
  const lats = polygon.map((p) => p[0])
  const lngs = polygon.map((p) => p[1])
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)]
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)]
  return points.filter(
    ([lat, lng]) => lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
  ).length
}

function healthColor(score: number): string {
  if (score < 30) return "#ef4444"
  if (score < 50) return "#f97316"
  if (score < 70) return "#f59e0b"
  if (score < 85) return "#84cc16"
  return "#22c55e"
}

export function HealthScoresLayer() {
  const { data: callsData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "911-calls"],
    queryFn: () => fetch("/api/arcgis/911-calls").then((r) => r.json()),
    staleTime: 3600_000,
  })
  const { data: permitsData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "permits"],
    queryFn: () => fetch("/api/arcgis/permits").then((r) => r.json()),
    staleTime: 3600_000,
  })
  const { data: eduData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "education"],
    queryFn: () => fetch("/api/arcgis/education").then((r) => r.json()),
    staleTime: 3600_000,
  })

  const toPoints = (fc: FeatureCollection | undefined): [number, number][] =>
    (fc?.features ?? [])
      .filter((f) => f.geometry?.type === "Point")
      .map((f) => {
        const [lng, lat] = f.geometry.coordinates
        return [lat, lng] as [number, number]
      })

  const callPts = toPoints(callsData)
  const permitPts = toPoints(permitsData)
  const eduPts = toPoints(eduData)
  const zoneCount = MONTGOMERY_ZONES.length || 1

  return (
    <>
      {MONTGOMERY_ZONES.map((zone) => {
        const poly = zone.polygon as Array<[number, number]>
        const calls = countInBBox(callPts, poly)
        const permits = countInBBox(permitPts, poly)
        const edu = countInBBox(eduPts, poly)

        const avgCalls = Math.max(callPts.length / zoneCount, 1)
        const avgPermits = Math.max(permitPts.length / zoneCount, 1)
        const avgEdu = Math.max(eduPts.length / zoneCount, 1)

        // Score formula: inverseCalls(0.3) + permits(0.3) + education(0.2) + baseline(0.2)
        const callScore = Math.max(0, 100 - (calls / avgCalls) * 80)
        const permitScore = Math.min(100, (permits / avgPermits) * 80)
        const eduScore = Math.min(100, (edu / avgEdu) * 80)
        const score = Math.round(
          callScore * 0.3 + permitScore * 0.3 + eduScore * 0.2 + 20 * 0.2
        )
        const color = healthColor(score)

        return (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.3,
              weight: 2,
            }}
          >
            <Tooltip sticky>
              <div className="text-xs space-y-1">
                <p className="font-bold">{zone.name}</p>
                <p>Health Score: <strong style={{ color }}>{score}/100</strong></p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <p className="text-muted-foreground">911 Calls</p>
                    <p className="font-medium">{calls}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Permits</p>
                    <p className="font-medium">{permits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Schools</p>
                    <p className="font-medium">{edu}</p>
                  </div>
                </div>
                <p className="text-muted-foreground pt-0.5">{zone.description}</p>
              </div>
            </Tooltip>
          </Polygon>
        )
      })}
    </>
  )
}

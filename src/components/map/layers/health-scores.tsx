"use client"

import { Fragment } from "react"
import { CircleMarker, Polygon, Tooltip } from "react-leaflet"
import { MONTGOMERY_ZONES } from "@/data/montgomery-zones"
import { findDepartmentLocation } from "@/data/department-locations"
import { useQuery } from "@tanstack/react-query"
import { fetchSectors } from "@/services"
import { heatmapColor, pointInPolygon, computeCompositeScore } from "@/lib/workforce-health"

interface FeatureCollection {
  features: Array<{
    geometry: { type: string; coordinates: unknown }
    properties: Record<string, unknown>
  }>
}

interface CityJob {
  department: string
  sectorId: string | null
}

interface CityJobsResponse {
  jobs: CityJob[]
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

function centroid(polygon: Array<[number, number]>): [number, number] {
  const total = polygon.length || 1
  const lat = polygon.reduce((sum, point) => sum + point[0], 0) / total
  const lng = polygon.reduce((sum, point) => sum + point[1], 0) / total
  return [lat, lng]
}

export function HealthScoresLayer() {
  const { data: callsData } = useQuery<FeatureCollection>({
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
  const { data: eduData } = useQuery<FeatureCollection>({
    queryKey: ["arcgis", "education"],
    queryFn: async () => {
      const r = await fetch("/api/arcgis/education")
      const json = await r.json()
      if (!r.ok) throw new Error(json.error ?? `HTTP ${r.status}`)
      return json
    },
    staleTime: 3600_000,
    retry: 1,
  })
  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: fetchSectors,
  })
  const { data: cityJobsData } = useQuery<CityJobsResponse>({
    queryKey: ["cityJobs"],
    queryFn: () => fetch("/api/city-jobs").then((r) => r.json()),
    staleTime: 3600_000,
  })

  const toPoints = (fc: FeatureCollection | undefined): [number, number][] =>
    (fc?.features ?? [])
      .map((feature) => {
        const geometry = feature.geometry
        if (!geometry) return null

        if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
          const [lng, lat] = geometry.coordinates as [number, number]
          if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng] as [number, number]
        }

        if (geometry.type === "MultiPoint" && Array.isArray(geometry.coordinates)) {
          const first = geometry.coordinates[0]
          if (Array.isArray(first) && first.length >= 2) {
            const [lng, lat] = first as [number, number]
            if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng] as [number, number]
          }
        }

        const props = feature.properties ?? {}
        const lngCandidate = Number(props.LON ?? props.LONGITUDE ?? props.longitude ?? props.lng ?? props.X)
        const latCandidate = Number(props.LAT ?? props.LATITUDE ?? props.latitude ?? props.lat ?? props.Y)
        if (Number.isFinite(latCandidate) && Number.isFinite(lngCandidate)) {
          return [latCandidate, lngCandidate] as [number, number]
        }

        return null
      })
      .filter((point): point is [number, number] => point !== null)

  const callPts = toPoints(callsData)
  const permitPts = toPoints(permitsData)
  const eduPts = toPoints(eduData)
  const zoneCount = MONTGOMERY_ZONES.length || 1
  const jobs = cityJobsData?.jobs ?? []
  const sectorMap = new Map((sectors ?? []).map((s) => [s.id, s]))
  const cityComposite = sectors ? computeCompositeScore(sectors).compositeScore : 50

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

        const callScore = Math.max(0, 100 - (calls / avgCalls) * 80)
        const permitScore = Math.min(100, (permits / avgPermits) * 80)
        const eduScore = Math.min(100, (edu / avgEdu) * 80)
        const spatialScore = Math.round(
          callScore * 0.3 + permitScore * 0.3 + eduScore * 0.2 + 20 * 0.2
        )

        let zoneWorkforceHealth = cityComposite
        if (jobs.length > 0 && sectors) {
          const jobsInZone = jobs.filter((job) => {
            const loc = findDepartmentLocation(job.department)
            return pointInPolygon([loc.lat, loc.lng], poly)
          })
          if (jobsInZone.length > 0) {
            let weightedSum = 0
            let totalWeight = 0
            for (const job of jobsInZone) {
              const sectorId = job.sectorId ?? "other"
              const sector = sectorMap.get(sectorId)
              const pulseScore = sector?.pulseScore ?? 50
              weightedSum += pulseScore
              totalWeight += 1
            }
            zoneWorkforceHealth = Math.round(weightedSum / totalWeight)
          }
        }

        const integratedScore = Math.round(
          spatialScore * 0.5 + zoneWorkforceHealth * 0.5
        )
        const color = heatmapColor(integratedScore)
        const center = centroid(poly)
        const radius = Math.max(12, Math.round(integratedScore / 5))

        return (
          <Fragment key={zone.id}>
            <Polygon
              positions={zone.polygon}
              pathOptions={{
                color: "#f59e0b",
                fillColor: "#f59e0b",
                fillOpacity: 0.05,
                weight: 1,
                opacity: 0.15,
              }}
            />
            <CircleMarker
              center={center}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.12,
                opacity: 0,
              }}
            />
            <CircleMarker
              center={center}
              radius={Math.max(6, radius * 0.62)}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.24,
                opacity: 0,
              }}
            />
            <CircleMarker
              center={center}
              radius={Math.max(3, radius * 0.25)}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.7,
                opacity: 0,
              }}
            >
              <Tooltip sticky>
                <div className="text-xs space-y-1">
                  <p className="font-bold">{zone.name}</p>
                  <p>Workforce Health: <strong>{integratedScore}/100</strong></p>
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
            </CircleMarker>
          </Fragment>
        )
      })}
    </>
  )
}

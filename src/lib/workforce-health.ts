import type { Sector } from "@/services/types"
import type { LatLngTuple } from "leaflet"

export function computeCompositeScore(sectors: Sector[]) {
  const stableCount = sectors.filter((s) => s.status === "stable").length
  const watchCount = sectors.filter((s) => s.status === "watch").length
  const total = sectors.length || 1
  const avgPulse = sectors.reduce((sum, s) => sum + s.pulseScore, 0) / total
  const healthRatio = ((stableCount * 1.0 + watchCount * 0.5) / total) * 100
  const compositeScore = Math.round(avgPulse * 0.6 + healthRatio * 0.4)
  const displayScore = (avgPulse * 0.6 + healthRatio * 0.4).toFixed(1)
  return { avgPulse, healthRatio, compositeScore, displayScore }
}

export function healthColor(score: number): string {
  if (score < 40) return "#ef4444"
  if (score < 70) return "#f59e0b"
  return "#22c55e"
}

export function heatmapColor(score: number): string {
  if (score < 30) return "#ef4444"
  if (score < 50) return "#f97316"
  if (score < 70) return "#f59e0b"
  if (score < 85) return "#84cc16"
  return "#22c55e"
}

/** Point-in-polygon: point [lat, lng], polygon as [lat, lng][] ring */
export function pointInPolygon(
  point: [number, number],
  polygon: LatLngTuple[]
): boolean {
  const [lat, lng] = point
  const n = polygon.length
  let inside = false
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [latI, lngI] = polygon[i]
    const [latJ, lngJ] = polygon[j]
    const intersect =
      latI > lat !== latJ > lat &&
      lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI + 1e-9) + lngI
    if (intersect) inside = !inside
  }
  return inside
}

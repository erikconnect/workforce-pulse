import { NextRequest, NextResponse } from "next/server"

// ArcGIS layer name → (base URL + layer ID) mapping
const LAYER_MAP: Record<string, { baseUrl: string; layerId: number }> = {
  "911-calls": { baseUrl: process.env.NEXT_PUBLIC_ARCGIS_911_URL || "", layerId: 0 },
  stations: { baseUrl: process.env.NEXT_PUBLIC_ARCGIS_STATIONS_URL || "", layerId: 3 }, // Fire+Police is layer 3
  permits: { baseUrl: process.env.NEXT_PUBLIC_ARCGIS_PERMITS_URL || "", layerId: 0 },
  education: { baseUrl: process.env.NEXT_PUBLIC_ARCGIS_EDUCATION_URL || "", layerId: 0 },
  population: { baseUrl: process.env.NEXT_PUBLIC_ARCGIS_POPULATION_URL || "", layerId: 0 },
}

// Cache responses for 1 hour
export const revalidate = 3600

const ARCGIS_PAGE_SIZE = 1000
const ARCGIS_MAX_FEATURES = 15000

function normalizeArcgisLayerUrl(rawUrl: string) {
  // Remove trailing slash and any existing layer ID
  const trimmed = rawUrl.trim().replace(/\/$/, "")
  // Strip any existing layer ID (e.g., /FeatureServer/0 -> /FeatureServer)
  return trimmed.replace(/\/FeatureServer\/\d+$/i, "/FeatureServer")
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ layer: string }> }
) {
  const { layer } = await params
  const layerKey = layer
  const layerConfig = LAYER_MAP[layerKey]

  if (!layerConfig?.baseUrl) {
    return NextResponse.json(
      { error: `Unknown layer: ${layerKey}. Available: ${Object.keys(LAYER_MAP).join(", ")}` },
      { status: 400 }
    )
  }

  const queryBase = normalizeArcgisLayerUrl(layerConfig.baseUrl)
  const layerUrl = `${queryBase}/${layerConfig.layerId}`

  const buildQueryUrl = (offset: number) =>
    `${layerUrl}/query?where=1=1&outFields=*&returnGeometry=true&resultRecordCount=${ARCGIS_PAGE_SIZE}&resultOffset=${offset}&f=geojson`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    let offset = 0
    const allFeatures: unknown[] = []
    let collectionType = "FeatureCollection"
    let pageCount = 0

    while (allFeatures.length < ARCGIS_MAX_FEATURES) {
      pageCount += 1
      const res = await fetch(buildQueryUrl(offset), {
        next: { revalidate: 3600 },
        signal: controller.signal,
        headers: {
          "User-Agent": "WorkforcePulse/1.0 (data visualization)",
        },
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        return NextResponse.json(
          {
            error: `ArcGIS returned ${res.status}`,
            details: text.slice(0, 200),
          },
          { status: 502 }
        )
      }

      const data = await res.json()
      const pageFeatures = Array.isArray(data?.features) ? data.features : []
      collectionType = typeof data?.type === "string" ? data.type : collectionType
      allFeatures.push(...pageFeatures)

      if (pageFeatures.length < ARCGIS_PAGE_SIZE) {
        break
      }

      offset += ARCGIS_PAGE_SIZE
      if (pageCount > 50) break
    }

    clearTimeout(timeout)

    return NextResponse.json({
      type: collectionType,
      features: allFeatures.slice(0, ARCGIS_MAX_FEATURES),
      meta: {
        pageSize: ARCGIS_PAGE_SIZE,
        returned: Math.min(allFeatures.length, ARCGIS_MAX_FEATURES),
        cappedAt: ARCGIS_MAX_FEATURES,
      },
    })
  } catch (err) {
    clearTimeout(timeout)
    const isTimeout = err instanceof Error && err.name === "AbortError"
    return NextResponse.json(
      {
        error: isTimeout
          ? "ArcGIS request timed out"
          : `Failed to fetch ArcGIS layer: ${err instanceof Error ? err.message : "unknown"}`,
      },
      { status: 500 }
    )
  }
}

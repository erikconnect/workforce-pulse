import { NextRequest, NextResponse } from "next/server"

// ArcGIS layer name → env var URL mapping
const LAYER_MAP: Record<string, string | undefined> = {
  "911-calls": process.env.NEXT_PUBLIC_ARCGIS_911_URL,
  stations: process.env.NEXT_PUBLIC_ARCGIS_STATIONS_URL,
  permits: process.env.NEXT_PUBLIC_ARCGIS_PERMITS_URL,
  education: process.env.NEXT_PUBLIC_ARCGIS_EDUCATION_URL,
  population: process.env.NEXT_PUBLIC_ARCGIS_POPULATION_URL,
}

// Cache responses for 1 hour
export const revalidate = 3600

export async function GET(
  _request: NextRequest,
  { params }: { params: { layer: string } }
) {
  const layerKey = params.layer
  const baseUrl = LAYER_MAP[layerKey]

  if (!baseUrl) {
    return NextResponse.json(
      { error: `Unknown layer: ${layerKey}. Available: ${Object.keys(LAYER_MAP).join(", ")}` },
      { status: 400 }
    )
  }

  // For stations, we have a FeatureServer with multiple layers — add /0 if not present
  const queryBase =
    layerKey === "stations" && !baseUrl.includes("/FeatureServer/")
      ? `${baseUrl}/0`
      : baseUrl

  const queryUrl = `${queryBase}/query?where=1%3D1&outFields=*&returnGeometry=true&resultRecordCount=1000&f=geojson`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch(queryUrl, {
      next: { revalidate: 3600 },
      signal: controller.signal,
      headers: {
        "User-Agent": "WorkforcePulse/1.0 (data visualization)",
      },
    })

    clearTimeout(timeout)

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
    return NextResponse.json(data)
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

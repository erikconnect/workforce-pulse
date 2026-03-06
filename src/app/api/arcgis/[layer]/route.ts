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

  try {
    const res = await fetch(queryUrl, { next: { revalidate: 3600 } })

    if (!res.ok) {
      return NextResponse.json(
        { error: `ArcGIS returned ${res.status}` },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch ArcGIS layer: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 }
    )
  }
}

"use client"

import { CircleMarker, Popup } from "react-leaflet"
import { useMemo } from "react"
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

function pickField(props: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = props[key]
    if (value != null && String(value).trim() !== "") return String(value)
  }
  return ""
}

function isBusinessOpportunity(props: Record<string, unknown>) {
  const haystack = [
    pickField(props, ["PermitType", "permit_type", "TYPE", "description"]),
    pickField(props, ["WorkType", "work_type", "PROJECT_TYPE"]),
    pickField(props, ["Description", "DESCRIPTION", "project_desc"]),
  ]
    .join(" ")
    .toLowerCase()

  return /(commercial|business|retail|office|industrial|mixed use|tenant|restaurant|warehouse|store)/.test(
    haystack
  )
}

export function BusinessOpportunitiesLayer() {
  const { data } = useQuery<{ type: string; features: Feature[] }>({
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

  const businessFeatures = useMemo(() => {
    const features = data?.features ?? []
    const filtered = features.filter((f) => toLatLng(f) && isBusinessOpportunity(f.properties))

    // If dataset fields differ and filter is too strict, keep a small sample so layer never appears empty.
    return (filtered.length > 0 ? filtered : features.filter((f) => toLatLng(f))).slice(0, 220)
  }, [data?.features])

  if (!businessFeatures.length) return null

  return (
    <>
      {businessFeatures.map((feature, i) => {
        const center = toLatLng(feature)
        if (!center) return null
        const permitType = pickField(feature.properties, ["PermitType", "permit_type", "TYPE", "Description", "DESCRIPTION"])
        const address = pickField(feature.properties, ["Address", "address", "SITE_ADDRESS"])
        const issuedDate = pickField(feature.properties, ["IssuedDate", "issued_date", "ISSUE_DATE"])

        return (
          <CircleMarker
            key={`business-opportunity-${i}`}
            center={center}
            radius={5}
            pathOptions={{
              color: "#b45309",
              fillColor: "#f59e0b",
              fillOpacity: 0.6,
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold">Business Opportunity</p>
                {permitType ? <p>Type: {permitType}</p> : null}
                {address ? <p>{address}</p> : null}
                {issuedDate ? <p>Issued: {issuedDate}</p> : null}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

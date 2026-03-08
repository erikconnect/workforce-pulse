"use client"

import { Marker, Popup } from "react-leaflet"
import { useQuery } from "@tanstack/react-query"
import L from "leaflet"

interface Feature {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: Record<string, unknown>
}

function makeSchoolIcon() {
  return L.divIcon({
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:#1d4ed8;
      border:2px solid white;
      color:white;
      font-size:10px;
      font-weight:700;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    ">S</div>`,
    className: "bg-transparent",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

const SCHOOL_ICON = makeSchoolIcon()

function getName(props: Record<string, unknown>) {
  return String(
    props.Name ??
      props.name ??
      props.SCHOOL_NAME ??
      props.FacilityName ??
      props.site_name ??
      "School"
  )
}

function getAddress(props: Record<string, unknown>) {
  return String(props.Address ?? props.address ?? props.ADDRESS ?? "").trim()
}

export function SchoolsLayer() {
  const { data } = useQuery<{ type: string; features: Feature[] }>({
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

  if (!data?.features?.length) return null

  return (
    <>
      {data.features.slice(0, 600).map((feature, i) => {
        if (feature.geometry?.type !== "Point") return null
        const [lng, lat] = feature.geometry.coordinates
        const name = getName(feature.properties)
        const address = getAddress(feature.properties)

        return (
          <Marker key={`${name}-${i}`} position={[lat, lng]} icon={SCHOOL_ICON}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold">{name}</p>
                <p className="text-muted-foreground">Education</p>
                {address ? <p>{address}</p> : null}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

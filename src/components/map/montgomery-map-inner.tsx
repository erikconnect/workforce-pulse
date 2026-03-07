"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet"

// Fix Leaflet's default icon paths in Next.js
import L from "leaflet"

// Montgomery center coordinates
const MONTGOMERY_CENTER: [number, number] = [32.3792, -86.3077]
const DEFAULT_ZOOM = 12

interface MontgomeryMapProps {
  children?: React.ReactNode
  className?: string
  zoom?: number
}

export function MontgomeryMapInner({
  children,
  className = "h-full w-full",
  zoom = DEFAULT_ZOOM,
}: MontgomeryMapProps) {
  useEffect(() => {
    // Fix default marker icons for Next.js / Webpack
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  return (
    <MapContainer
      center={MONTGOMERY_CENTER}
      zoom={zoom}
      zoomControl={false}
      className={className}
      style={{ minHeight: "400px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      {children}
    </MapContainer>
  )
}

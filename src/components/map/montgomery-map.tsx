"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamic import to avoid SSR issues with Leaflet
const MontgomeryMapInner = dynamic(
  () =>
    import("@/components/map/montgomery-map-inner").then(
      (mod) => mod.MontgomeryMapInner
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-full w-full rounded-lg min-h-[400px]" />
    ),
  }
)

interface MontgomeryMapProps {
  children?: React.ReactNode
  className?: string
  zoom?: number
}

export function MontgomeryMap(props: MontgomeryMapProps) {
  return <MontgomeryMapInner {...props} />
}

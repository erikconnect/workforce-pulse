// Montgomery, AL — Approximate neighborhood/zone boundary polygons
// Used for distressed-zone overlays and workforce health scores
// Coordinates are approximate convex hulls for major areas

import type { LatLngTuple } from "leaflet"

export interface MontgomeryZone {
  id: string
  name: string
  polygon: LatLngTuple[] // ring of [lat, lng]
  description: string
}

export const MONTGOMERY_ZONES: MontgomeryZone[] = [
  {
    id: "west-montgomery",
    name: "West Montgomery",
    description: "Historic residential area with ongoing revitalization efforts.",
    polygon: [
      [32.395, -86.345],
      [32.395, -86.315],
      [32.370, -86.315],
      [32.370, -86.345],
    ],
  },
  {
    id: "downtown",
    name: "Downtown Montgomery",
    description: "City center — government, commerce, and Civil Rights landmarks.",
    polygon: [
      [32.385, -86.315],
      [32.385, -86.295],
      [32.370, -86.295],
      [32.370, -86.315],
    ],
  },
  {
    id: "midtown",
    name: "Midtown",
    description: "Mixed commercial/residential corridor with growing services sector.",
    polygon: [
      [32.370, -86.315],
      [32.370, -86.290],
      [32.355, -86.290],
      [32.355, -86.315],
    ],
  },
  {
    id: "north-montgomery",
    name: "North Montgomery",
    description: "Industrial and residential area with workforce development opportunities.",
    polygon: [
      [32.410, -86.330],
      [32.410, -86.295],
      [32.395, -86.295],
      [32.395, -86.330],
    ],
  },
  {
    id: "east-montgomery",
    name: "East Montgomery",
    description: "Suburban growth corridor with retail and healthcare expansion.",
    polygon: [
      [32.395, -86.280],
      [32.395, -86.250],
      [32.370, -86.250],
      [32.370, -86.280],
    ],
  },
  {
    id: "south-montgomery",
    name: "South Montgomery",
    description: "Includes Alabama State University and key education institutions.",
    polygon: [
      [32.370, -86.310],
      [32.370, -86.285],
      [32.350, -86.285],
      [32.350, -86.310],
    ],
  },
  {
    id: "maxwell-area",
    name: "Maxwell / Gunter Area",
    description: "Military corridor surrounding Maxwell Air Force Base and Gunter Annex.",
    polygon: [
      [32.390, -86.375],
      [32.390, -86.345],
      [32.370, -86.345],
      [32.370, -86.375],
    ],
  },
  {
    id: "pike-road-corridor",
    name: "Pike Road Corridor",
    description: "Fast-growing southeastern suburb with new construction and school development.",
    polygon: [
      [32.350, -86.260],
      [32.350, -86.230],
      [32.330, -86.230],
      [32.330, -86.260],
    ],
  },
]

"use client"

import { Marker, Popup } from "react-leaflet"
import { useQuery } from "@tanstack/react-query"
import L from "leaflet"
import { findDepartmentLocation } from "@/data/department-locations"

interface CityJob {
  title: string
  link: string
  salary: string
  department: string
  filingDeadline: string
  sectorId: string | null
}

const URGENCY_COLORS: Record<string, string> = {
  "public-safety": "#ef4444",
  healthcare: "#f59e0b",
  default: "#22c55e",
}

function makeJobIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    className: "bg-transparent",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

export function JobsLayer() {
  const { data: jobs } = useQuery<CityJob[]>({
    queryKey: ["cityJobs"],
    queryFn: () => fetch("/api/city-jobs").then((r) => r.json()),
    staleTime: 3600_000,
  })

  if (!jobs?.length) return null

  return (
    <>
      {jobs.map((job, i) => {
        const loc = findDepartmentLocation(job.department)
        // Slight random offset so pins don't overlap exactly
        const jitter = (i * 0.0003) % 0.003
        const color =
          URGENCY_COLORS[job.sectorId ?? ""] ?? URGENCY_COLORS.default
        return (
          <Marker
            key={i}
            position={[loc.lat + jitter, loc.lng - jitter]}
            icon={makeJobIcon(color)}
          >
            <Popup>
              <div className="text-xs space-y-1 max-w-[200px]">
                <p className="font-semibold">{job.title}</p>
                <p className="text-muted-foreground">{job.department}</p>
                {job.salary && <p>Salary: {job.salary}</p>}
                {job.filingDeadline && (
                  <p>Deadline: {job.filingDeadline}</p>
                )}
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Apply →
                </a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

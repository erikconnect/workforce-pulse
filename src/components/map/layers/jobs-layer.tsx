"use client"

import { Marker, Popup } from "react-leaflet"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import L from "leaflet"
import { resolveDepartmentLocation } from "@/data/department-locations"
import { MONTGOMERY_LANDMARKS } from "@/data/montgomery-landmarks"

interface CityJob {
  title: string
  link: string
  salary: string
  department: string
  jobType: string
  filingDeadline: string
  employmentType: string
  sectorId: string | null
}

interface CityJobsResponse {
  count: number
  lastFetched: string
  bySector: Record<string, number>
  jobs: CityJob[]
}

const SECTOR_PALETTE: Record<string, { dot: string; bg: string; text: string }> = {
  "public-safety": { dot: "#ef4444", bg: "#fee2e2", text: "#991b1b" },
  healthcare:      { dot: "#10b981", bg: "#d1fae5", text: "#065f46" },
  technology:      { dot: "#3b82f6", bg: "#dbeafe", text: "#1e40af" },
  construction:    { dot: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  education:       { dot: "#8b5cf6", bg: "#ede9fe", text: "#4c1d95" },
  logistics:       { dot: "#f97316", bg: "#ffedd5", text: "#7c2d12" },
  finance:         { dot: "#06b6d4", bg: "#cffafe", text: "#164e63" },
  retail:          { dot: "#ec4899", bg: "#fce7f3", text: "#831843" },
  default:         { dot: "#8b5cf6", bg: "#ede9fe", text: "#4c1d95" },
}

function makeJobIcon(color: string) {
  return L.divIcon({
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};
      border:2.5px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    className: "bg-transparent",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function formatSectorLabel(sectorId: string) {
  return sectorId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

const FALLBACK_ANCHORS = MONTGOMERY_LANDMARKS.slice(0, 10).map((landmark) => ({
  lat: landmark.lat,
  lng: landmark.lng,
  label: landmark.name,
}))

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function jitterPoint(lat: number, lng: number, seed: number, occurrence: number) {
  const angle = ((seed % 360) * Math.PI) / 180
  const ring = Math.floor(occurrence / 8) + 1
  const radius = 0.00045 * ring + ((seed % 7) * 0.00003)
  const spreadX = radius * Math.cos(angle)
  const spreadY = radius * Math.sin(angle)
  return {
    lat: lat + spreadY,
    lng: lng + spreadX,
  }
}

export function JobsLayer() {
  const { data } = useQuery<CityJobsResponse>({
    queryKey: ["cityJobs"],
    queryFn: () => fetch("/api/city-jobs").then((r) => r.json()),
    staleTime: 3600_000,
  })

  const jobs = data?.jobs ?? []

  const plottedJobs = useMemo(() => {
    if (jobs.length === 0) return []
    
    const seenByBase = new Map<string, number>()

    return jobs.map((job) => {
      const resolved = resolveDepartmentLocation(job.department || "")
      const seed = hashString(`${job.title}|${job.department}|${job.link}`)
      const fallbackAnchor = FALLBACK_ANCHORS[seed % FALLBACK_ANCHORS.length]
      const baseLat = resolved.matched ? resolved.lat : fallbackAnchor.lat
      const baseLng = resolved.matched ? resolved.lng : fallbackAnchor.lng
      const baseKey = `${baseLat.toFixed(4)},${baseLng.toFixed(4)}`
      const occurrence = seenByBase.get(baseKey) ?? 0
      seenByBase.set(baseKey, occurrence + 1)

      const plotted = jitterPoint(baseLat, baseLng, seed, occurrence)
      return {
        ...job,
        plotted,
        locationLabel: resolved.matched ? resolved.address : fallbackAnchor.label,
        locationQuality: resolved.matched ? "department" : "city-estimate",
      }
    })
  }, [jobs])

  if (plottedJobs.length === 0) return null

  return (
    <>
      {plottedJobs.map((job, i) => {
        const sector = SECTOR_PALETTE[job.sectorId ?? ""] ?? SECTOR_PALETTE.default

        return (
          <Marker
            key={i}
            position={[job.plotted.lat, job.plotted.lng]}
            icon={makeJobIcon(sector.dot)}
          >
            <Popup maxWidth={260}>
              <div style={{ fontFamily: "inherit", width: "240px", padding: "2px 0" }}>
                {/* Sector badge */}
                {job.sectorId && (
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    backgroundColor: sector.bg,
                    color: sector.text,
                    marginBottom: "6px",
                  }}>
                    {formatSectorLabel(job.sectorId)}
                  </span>
                )}

                {/* Title */}
                <p style={{ fontWeight: 700, fontSize: "13px", lineHeight: "1.35", margin: "0 0 2px" }}>
                  {job.title}
                </p>

                {/* Department */}
                <p style={{ color: "#6b7280", fontSize: "11px", margin: "0 0 10px" }}>
                  {job.department}
                </p>

                <p style={{ color: "#4b5563", fontSize: "10px", margin: "0 0 10px" }}>
                  {job.locationQuality === "department" ? "Location" : "Estimated area"}: {job.locationLabel}
                </p>

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
                  {job.salary && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontSize: "10px", color: "#6b7280", minWidth: "56px", paddingTop: "1px" }}>Salary</span>
                      <span style={{ fontWeight: 600, color: "#059669", fontSize: "11px" }}>{job.salary}</span>
                    </div>
                  )}
                  {job.employmentType && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontSize: "10px", color: "#6b7280", minWidth: "56px", paddingTop: "1px" }}>Type</span>
                      <span style={{ fontSize: "11px", color: "#111827" }}>{job.employmentType}</span>
                    </div>
                  )}
                  {job.jobType && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontSize: "10px", color: "#6b7280", minWidth: "56px", paddingTop: "1px" }}>Schedule</span>
                      <span style={{ fontSize: "11px", color: "#111827" }}>{job.jobType}</span>
                    </div>
                  )}
                  {job.filingDeadline && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontSize: "10px", color: "#6b7280", minWidth: "56px", paddingTop: "1px" }}>Deadline</span>
                      <span style={{ fontSize: "11px", color: "#111827" }}>{job.filingDeadline}</span>
                    </div>
                  )}
                </div>

                {/* Apply button */}
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    backgroundColor: "#d19a47",
                    color: "white",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "11px",
                    textDecoration: "none",
                  }}
                >
                  View &amp; Apply →
                </a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

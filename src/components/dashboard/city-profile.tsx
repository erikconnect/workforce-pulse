"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { MapPin, Shield, HardHat, Users, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataSource } from "@/components/dashboard/data-source"
import { fetchWorkforceData } from "@/services/api/workforce-data"

export function CityProfile() {
  const { data } = useQuery({
    queryKey: ["workforceData"],
    queryFn: fetchWorkforceData,
    staleTime: 3600_000,
  })

  return (
    <Card className="overflow-hidden relative">
      {/* Skyline silhouette background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
        <svg viewBox="0 0 800 120" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          <path d="M0,120 L0,80 L40,80 L40,60 L60,60 L60,80 L100,80 L100,40 L110,35 L120,40 L120,80 L160,80 L160,55 L170,50 L180,55 L180,80 L220,80 L220,30 L230,20 L240,30 L240,80 L300,80 L300,65 L320,65 L320,80 L380,80 L380,45 L400,35 L420,45 L420,80 L480,80 L480,70 L500,70 L500,80 L560,80 L560,50 L570,40 L580,50 L580,80 L640,80 L640,60 L660,60 L660,80 L720,80 L720,55 L740,55 L740,80 L800,80 L800,120 Z" fill="currentColor"/>
        </svg>
      </div>

      <CardContent className="p-5 relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* City identity */}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              <h3 className="font-display font-bold text-lg">Montgomery, Alabama</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Birthplace of the Civil Rights Movement · Home of Maxwell Air Force Base · Capital City
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="secondary" className="text-[10px]">Civil Rights Heritage</Badge>
              <Badge variant="outline" className="text-[10px]">Military Hub</Badge>
              <Badge variant="outline" className="text-[10px]">State Capital</Badge>
            </div>
          </div>

          {/* Live stats */}
          <div className="flex gap-4 sm:gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-pulse-critical">
                <Shield className="h-3.5 w-3.5" />
                <span className="text-lg font-bold">{data?.arcgis911CallCount?.toLocaleString() ?? "—"}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">911 Calls</p>
              <DataSource source="arcgis" />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-pulse-watch">
                <HardHat className="h-3.5 w-3.5" />
                <span className="text-lg font-bold">{data?.arcgisPermitCount?.toLocaleString() ?? "—"}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Permits</p>
              <DataSource source="arcgis" />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary">
                <Users className="h-3.5 w-3.5" />
                <span className="text-lg font-bold">{data?.cityJobsTotal?.toLocaleString() ?? "—"}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Open Jobs</p>
              <DataSource source="jobaps" />
            </div>
          </div>

          {/* Map link */}
          <Link
            href="/map"
            className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline shrink-0"
          >
            Explore Map <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Briefcase, Clock } from "lucide-react"
import { fetchSectorById } from "@/services"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, statusToColor, formatNumber, formatDelta } from "@/lib/utils"
import { ImpactGauge } from "@/components/sectors/impact-gauge"
import { HiringTrendChart } from "@/components/sectors/hiring-trend-chart"

const BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  watch: "bg-amber-100 text-amber-800 border-amber-300",
  stable: "bg-green-100 text-green-800 border-green-300",
}

const STATUS_LABEL: Record<string, string> = {
  critical: "Critical",
  watch: "Watch",
  stable: "Stable",
}

const MISSION_STATUS_CLASS: Record<string, string> = {
  active: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  paused: "bg-gray-100 text-gray-700 border-gray-300",
}

export default function SectorDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: sector, isLoading, isError } = useQuery({
    queryKey: ["sector", id],
    queryFn: () => fetchSectorById(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !sector) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sectors"><ArrowLeft className="h-4 w-4 mr-1" />Sectors</Link>
        </Button>
        <p className="text-sm text-destructive">Sector not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/sectors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Sectors
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-6">
        <ImpactGauge score={sector.pulseScore} status={sector.status} size={180} label="Impact Score" />
        <div className="flex-1 min-w-0 pt-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight">{sector.name}</h2>
            <Badge className={cn("text-xs border font-medium", BADGE_CLASS[sector.status])}>
              {STATUS_LABEL[sector.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{sector.description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{formatNumber(sector.employeeCount)} employees</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{sector.openRolesCount} open roles</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {sector.kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xl font-bold">{kpi.value}</span>
                {kpi.delta !== 0 && (
                  <span className={cn("text-xs font-medium", statusToColor(kpi.status))}>
                    {formatDelta(kpi.delta)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">
            Roles
            {sector.criticalRoles.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted rounded px-1">
                {sector.criticalRoles.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="skills">
            Skills
            {sector.skills.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted rounded px-1">
                {sector.skills.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="missions">
            Missions
            {sector.missions.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted rounded px-1">
                {sector.missions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4">
          {sector.hiringTrend.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Hiring vs. Attrition (12 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HiringTrendChart data={sector.hiringTrend} />
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">No hiring trend data available.</p>
          )}
        </TabsContent>

        {/* Roles */}
        <TabsContent value="roles" className="mt-4">
          {sector.criticalRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No critical roles data available.</p>
          ) : (
            <div className="space-y-3">
              {sector.criticalRoles.map((role) => (
                <Card key={role.id}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{role.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {role.openCount} open
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Avg {role.avgTimeToFill}d to fill
                          </span>
                        </div>
                      </div>
                      <Badge className={cn("text-xs border shrink-0", BADGE_CLASS[role.urgency])}>
                        {STATUS_LABEL[role.urgency]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills" className="mt-4">
          {sector.skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills data available.</p>
          ) : (
            <div className="space-y-3">
              {sector.skills.map((skill) => (
                <Card key={skill.id}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{skill.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{skill.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("text-xs font-medium", statusToColor(skill.demandLevel))}>
                          +{skill.growthRate}%
                        </span>
                        <Badge className={cn("text-xs border", BADGE_CLASS[skill.demandLevel])}>
                          {STATUS_LABEL[skill.demandLevel]}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Missions */}
        <TabsContent value="missions" className="mt-4">
          {sector.missions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No missions found for this sector.</p>
          ) : (
            <div className="space-y-3">
              {sector.missions.map((mission) => (
                <Card key={mission.id}>
                  <CardContent className="pt-4 pb-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{mission.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {mission.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn("text-xs border", MISSION_STATUS_CLASS[mission.status])}>
                          {mission.status}
                        </Badge>
                        <Badge className={cn("text-xs border", BADGE_CLASS[mission.priority])}>
                          {STATUS_LABEL[mission.priority]}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{mission.progress}%</span>
                      </div>
                      <Progress value={mission.progress} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

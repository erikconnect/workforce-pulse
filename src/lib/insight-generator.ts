import type { Sector } from "@/services/types"

export interface Insight {
  id: string
  icon: "alert" | "trend" | "gap" | "win"
  title: string
  body: string
  cta?: { label: string; href: string }
}

export function generateInsights(sectors: Sector[]): Insight[] {
  const insights: Insight[] = []

  // 1. Critical sector surge
  const criticals = sectors.filter((s) => s.status === "critical")
  if (criticals.length > 0) {
    const top = criticals[0]
    const postingsKpi = top.kpis.find((k) => k.label.includes("Postings"))
    const delta = top.kpis.find((k) => k.label.includes("WoW"))
    insights.push({
      id: "critical-surge",
      icon: "alert",
      title: `${top.name} hiring pressure is rising`,
      body: `${top.name} posted ${postingsKpi?.value ?? "N/A"} roles this week${
        delta ? `, up ${delta.value} week-over-week` : ""
      }. With ${top.openRolesCount} open positions and a pulse score of ${top.pulseScore}/100, this sector needs immediate attention.`,
      cta: { label: `View ${top.name}`, href: `/sectors/${top.id}` },
    })
  }

  // 2. Skills gap insight
  const unmappedSectors = sectors
    .filter((s) => {
      const unmapped = s.kpis.find((k) => k.label.includes("Unmapped"))
      return unmapped && Number(unmapped.value) >= 8
    })
    .sort((a, b) => {
      const aVal = Number(a.kpis.find((k) => k.label.includes("Unmapped"))?.value ?? 0)
      const bVal = Number(b.kpis.find((k) => k.label.includes("Unmapped"))?.value ?? 0)
      return bVal - aVal
    })

  if (unmappedSectors.length > 0) {
    const names = unmappedSectors.slice(0, 2).map((s) => s.name).join(" and ")
    const totalGaps = unmappedSectors.reduce(
      (sum, s) => sum + Number(s.kpis.find((k) => k.label.includes("Unmapped"))?.value ?? 0),
      0
    )
    insights.push({
      id: "skills-gap",
      icon: "gap",
      title: `${totalGaps} unmapped skills across ${unmappedSectors.length} sectors`,
      body: `${names} ${unmappedSectors.length > 1 ? "have" : "has"} the highest number of skills employers demand but training providers don't explicitly cover. Mapping these could unlock workforce readiness.`,
      cta: { label: "Explore skills", href: "/skills" },
    })
  }

  // 3. Stability win
  const stableSectors = sectors.filter((s) => s.status === "stable")
  if (stableSectors.length >= 2) {
    insights.push({
      id: "stability-win",
      icon: "win",
      title: `${stableSectors.length} sectors are stable`,
      body: `${stableSectors.map((s) => s.name).join(", ")} are showing balanced hiring with minimal churn. These could serve as models for improving underperforming sectors.`,
    })
  }

  // 4. Fastest growing sector
  const growing = [...sectors]
    .filter((s) => {
      const wow = s.kpis.find((k) => k.label.includes("WoW"))
      return wow && wow.delta > 5
    })
    .sort((a, b) => {
      const aD = a.kpis.find((k) => k.label.includes("WoW"))?.delta ?? 0
      const bD = b.kpis.find((k) => k.label.includes("WoW"))?.delta ?? 0
      return bD - aD
    })

  if (growing.length > 0) {
    const top = growing[0]
    const delta = top.kpis.find((k) => k.label.includes("WoW"))
    insights.push({
      id: "growth-trend",
      icon: "trend",
      title: `${top.name} is the fastest-growing sector`,
      body: `Posting volume surged ${delta?.value ?? "significantly"} this week. With ${top.openRolesCount} open roles across the sector, workforce development programs should consider ramping capacity now.`,
      cta: { label: `View ${top.name}`, href: `/sectors/${top.id}` },
    })
  }

  return insights.slice(0, 3) // Show max 3 insights
}

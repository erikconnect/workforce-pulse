/**
 * Job posting processing helpers:
 *  - classifySector: map job title + description → sectorId
 *  - extractSkills: pull known skill keywords from job text
 *  - normalizePosting: map raw Bright Data record → JobPosting
 *  - deriveInsights: aggregate JobPosting[] → JobInsights
 */

import type { JobPosting, JobInsights } from "../services/types";

// ---------------------------------------------------------------------------
// Sector classifier
// ---------------------------------------------------------------------------

const SECTOR_PATTERNS: Record<string, RegExp> = {
  "public-safety":
    /\b(police|officer|firefighter|fire\s*fighter|fire\s*department|ems|paramedic|dispatcher|911|emergency\s*services?|corrections|deputy|sheriff|law\s*enforcement|first\s*responder)\b/i,
  healthcare:
    /\b(nurse|nursing|physician|doctor|medical|clinical|hospital|dental|pharmacy|pharmacist|therapist|radiology|lab\s*tech|cna|lpn|rn|health\s*care)\b/i,
  construction:
    /\b(construction|contractor|carpenter|electrician|plumber|welder|inspector|permit|hvac|laborer|site\s*manager|project\s*manager)\b/i,
  education:
    /\b(teacher|educator|principal|counselor|school|classroom|curriculum|instructor|tutor|academic)\b/i,
  technology:
    /\b(software|developer|engineer|programmer|it\s*support|network|cyber|data\s*analyst|devops|cloud|frontend|backend|fullstack|sysadmin)\b/i,
  logistics:
    /\b(driver|delivery|warehouse|logistics|supply\s*chain|dispatcher|fleet|shipping|forklift|cdl)\b/i,
  finance:
    /\b(accountant|accounting|auditor|finance|financial|banker|teller|loan|insurance|analyst|cpa|bookkeeper)\b/i,
  retail:
    /\b(retail|cashier|sales\s*associate|store\s*manager|merchandiser|customer\s*service|barista|server|hospitality)\b/i,
};

export function classifySector(title: string, description: string): string | null {
  const text = `${title} ${description}`;
  for (const [sectorId, pattern] of Object.entries(SECTOR_PATTERNS)) {
    if (pattern.test(text)) return sectorId;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Skill extractor
// ---------------------------------------------------------------------------

const SKILL_DICTIONARY: string[] = [
  // Public Safety
  "cpr", "first aid", "hazmat", "incident command", "de-escalation", "community policing",
  "emergency dispatch", "use of force", "firearms", "crisis intervention", "ems operations",
  "law enforcement", "corrections", "911", "paramedic", "firefighter",
  // Healthcare
  "patient care", "triage", "vital signs", "medication administration", "ehr", "emr",
  "hipaa", "iv therapy", "wound care", "bls", "acls", "nursing", "clinical",
  // Construction
  "osha", "blueprint reading", "electrical wiring", "plumbing", "welding", "project management",
  "site safety", "cad", "scheduling", "cost estimation", "inspection", "permit",
  "hvac", "maintenance", "building maintenance",
  // Education
  "classroom management", "curriculum development", "special education", "student assessment",
  "differentiated instruction", "lesson planning", "counseling", "library",
  // Technology
  "python", "javascript", "sql", "aws", "azure", "docker", "kubernetes", "react",
  "node.js", "data analysis", "machine learning", "cybersecurity", "networking",
  "troubleshooting", "linux", "information technology", "it support",
  // Logistics
  "cdl", "route planning", "inventory management", "forklift", "logistics software",
  "supply chain", "dispatch", "fleet", "warehouse",
  // Finance / Admin
  "accounting", "budget", "audit", "revenue", "clerical", "administration",
  // Cross-sector
  "microsoft office", "communication", "leadership", "teamwork", "problem solving",
  "bilingual", "spanish", "data entry", "reporting", "time management",
  "customer service", "training", "compliance", "supervision",
];

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return SKILL_DICTIONARY.filter((skill) => lower.includes(skill.toLowerCase()));
}

// ---------------------------------------------------------------------------
// Raw Bright Data Indeed record → normalized JobPosting
// ---------------------------------------------------------------------------

// Bright Data Indeed scraper field names (may vary by version — adjust if needed)
// Reference: https://brightdata.com/products/web-scraper/indeed
export interface RawIndeedRecord {
  id?: string;
  job_id?: string;
  title?: string;
  company_name?: string;
  company?: string;
  location?: string;
  date_posted?: string;
  description?: string;
  job_description?: string;
  url?: string;
  job_url?: string;
  salary?: string;
  job_type?: string;
}

export function normalizeIndeedRecord(raw: RawIndeedRecord): JobPosting {
  const title = raw.title ?? "";
  const description = raw.description ?? raw.job_description ?? "";
  const sectorId = classifySector(title, description);
  const extractedSkills = extractSkills(description);

  return {
    id: raw.id ?? raw.job_id ?? crypto.randomUUID(),
    title,
    org: raw.company_name ?? raw.company ?? "Unknown",
    location: raw.location ?? "Montgomery, AL",
    postedDate: raw.date_posted ?? new Date().toISOString(),
    description,
    source: "indeed",
    url: raw.url ?? raw.job_url ?? "",
    sectorId,
    extractedSkills,
    salary: raw.salary,
    jobType: raw.job_type,
  };
}

// Bright Data LinkedIn Jobs scraper field names
export interface RawLinkedInRecord {
  job_id?: string;
  title?: string;
  company_name?: string;
  location?: string;
  date?: string;
  date_posted?: string;
  description?: string;
  url?: string;
  employment_type?: string;
}

// Bright Data Glassdoor scraper field names
export interface RawGlassdoorRecord {
  job_id?: string;
  id?: string;
  title?: string;
  company_name?: string;
  company?: string;
  location?: string;
  date?: string;
  date_posted?: string;
  description?: string;
  url?: string;
  salary?: string;
  job_type?: string;
}

// JobAps (City of Montgomery RSS) record → JobPosting
export interface RawJobApsRecord {
  title: string;
  link: string;
  pubDate: string;
  salary?: string;
  department?: string;
  jobType?: string;
  sectorId?: string | null;
}

export function normalizeJobApsRecord(raw: RawJobApsRecord): JobPosting {
  const title = raw.title ?? "";
  const descParts = [raw.department ?? "", raw.jobType ?? "", title].filter(Boolean);
  const description = descParts.join(" ").trim() || title;
  const sectorId = raw.sectorId ?? classifySector(title, description);
  const extractedSkills = extractSkills(description);

  return {
    id: `jobaps-${raw.link.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 80)}`,
    title,
    org: "City of Montgomery",
    location: "Montgomery, AL",
    postedDate: raw.pubDate ?? new Date().toISOString(),
    description,
    source: "jobaps",
    url: raw.link ?? "",
    sectorId,
    extractedSkills,
    salary: raw.salary,
    jobType: raw.jobType,
  };
}

// USAJOBS API record → JobPosting
export interface RawUsaJobsRecord {
  MatchedObjectId?: string;
  MatchedObjectDescriptor?: {
    PositionTitle?: string;
    OrganizationName?: string;
    PositionLocationDisplay?: string;
    PositionStartDate?: string;
    UserArea?: { Details?: { JobSummary?: string } };
    ApplyURI?: string[];
    PositionOfferedType?: string;
    PositionRemuneration?: Array<{ MinimumRange?: string; MaximumRange?: string }>;
  };
}

export function normalizeUsaJobsRecord(raw: RawUsaJobsRecord): JobPosting {
  const desc = raw.MatchedObjectDescriptor;
  const title = desc?.PositionTitle ?? "";
  const description = desc?.UserArea?.Details?.JobSummary ?? "";
  const sectorId = classifySector(title, description);
  const extractedSkills = extractSkills(description);
  const salary =
    desc?.PositionRemuneration?.[0]?.MinimumRange ||
    desc?.PositionRemuneration?.[0]?.MaximumRange;

  return {
    id: `usajobs-${raw.MatchedObjectId ?? crypto.randomUUID()}`,
    title,
    org: desc?.OrganizationName ?? "Federal Government",
    location: desc?.PositionLocationDisplay ?? "Montgomery, AL",
    postedDate: desc?.PositionStartDate ?? new Date().toISOString(),
    description,
    source: "usajobs",
    url: desc?.ApplyURI?.[0] ?? `https://www.usajobs.gov/job/${raw.MatchedObjectId}`,
    sectorId,
    extractedSkills,
    salary,
    jobType: desc?.PositionOfferedType,
  };
}

export function normalizeLinkedInRecord(raw: RawLinkedInRecord): JobPosting {
  const title = raw.title ?? "";
  const description = raw.description ?? "";
  const sectorId = classifySector(title, description);
  const extractedSkills = extractSkills(description);

  return {
    id: raw.job_id ?? crypto.randomUUID(),
    title,
    org: raw.company_name ?? "Unknown",
    location: raw.location ?? "Montgomery, AL",
    postedDate: raw.date_posted ?? raw.date ?? new Date().toISOString(),
    description,
    source: "linkedin",
    url: raw.url ?? "",
    sectorId,
    extractedSkills,
    jobType: raw.employment_type,
  };
}

export function normalizeGlassdoorRecord(raw: RawGlassdoorRecord): JobPosting {
  const title = raw.title ?? "";
  const description = raw.description ?? "";
  const sectorId = classifySector(title, description);
  const extractedSkills = extractSkills(description);

  return {
    id: raw.job_id ?? raw.id ?? crypto.randomUUID(),
    title,
    org: raw.company_name ?? raw.company ?? "Unknown",
    location: raw.location ?? "Montgomery, AL",
    postedDate: raw.date_posted ?? raw.date ?? new Date().toISOString(),
    description,
    source: "glassdoor",
    url: raw.url ?? "",
    sectorId,
    extractedSkills,
    salary: raw.salary,
    jobType: raw.job_type,
  };
}

// ---------------------------------------------------------------------------
// Derive JobInsights from a set of postings
// ---------------------------------------------------------------------------

export function deriveInsights(postings: JobPosting[]): JobInsights {
  const totalPostings = postings.length;
  const lastUpdated = new Date().toISOString();

  // --- Top roles ---
  const roleMap = new Map<string, { count: number; sectorId: string | null }>();
  for (const p of postings) {
    const key = p.title.toLowerCase().trim();
    const existing = roleMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      roleMap.set(key, { count: 1, sectorId: p.sectorId });
    }
  }
  const topRoles = Array.from(roleMap.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 20)
    .map(([title, { count, sectorId }]) => ({
      title: title.replace(/\b\w/g, (c) => c.toUpperCase()),
      count,
      sectorId,
    }));

  // --- Top skills ---
  const skillMap = new Map<string, number>();
  for (const p of postings) {
    for (const skill of p.extractedSkills) {
      skillMap.set(skill, (skillMap.get(skill) ?? 0) + 1);
    }
  }
  const topSkills = Array.from(skillMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([name, count]) => ({
      name,
      count,
      growthSignal: "steady" as const, // static for now; needs historical data to compute
    }));

  // --- Sector breakdown ---
  const sectorMap = new Map<string, number>();
  for (const p of postings) {
    if (p.sectorId) {
      sectorMap.set(p.sectorId, (sectorMap.get(p.sectorId) ?? 0) + 1);
    }
  }
  const sectorBreakdown = Array.from(sectorMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([sectorId, count]) => ({ sectorId, count, percentChange: 0 }));

  // --- Critical roles count (Public Safety) ---
  const criticalRolesCount = postings.filter(
    (p) => p.sectorId === "public-safety"
  ).length;

  // --- Postings by day (last 30 days) ---
  const dayMap = new Map<string, number>();
  for (const p of postings) {
    const day = p.postedDate.slice(0, 10); // "YYYY-MM-DD"
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const timelineDates = Array.from(dayMap.keys())
    .sort((a, b) => a.localeCompare(b))
    .slice(-30);

  const postingsByDay = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date, count }));

  const sectorDayMap = new Map<string, Map<string, number>>();
  const skillDayMap = new Map<string, Map<string, number>>();
  const totalSkillMentionsDayMap = new Map<string, number>();
  const topSkillNames = new Set(topSkills.slice(0, 6).map((skill) => skill.name));

  for (const posting of postings) {
    const day = posting.postedDate.slice(0, 10);

    if (posting.sectorId) {
      const sectorSeries = sectorDayMap.get(posting.sectorId) ?? new Map<string, number>();
      sectorSeries.set(day, (sectorSeries.get(day) ?? 0) + 1);
      sectorDayMap.set(posting.sectorId, sectorSeries);
    }

    totalSkillMentionsDayMap.set(
      day,
      (totalSkillMentionsDayMap.get(day) ?? 0) + posting.extractedSkills.length
    );

    for (const skill of posting.extractedSkills) {
      if (!topSkillNames.has(skill)) continue;
      const skillSeries = skillDayMap.get(skill) ?? new Map<string, number>();
      skillSeries.set(day, (skillSeries.get(day) ?? 0) + 1);
      skillDayMap.set(skill, skillSeries);
    }
  }

  const sectorTimelines = Array.from(sectorDayMap.entries())
    .map(([sectorId, series]) => ({
      sectorId,
      series: timelineDates.map((date) => ({
        date,
        count: series.get(date) ?? 0,
      })),
    }))
    .sort((a, b) => {
      const aTotal = a.series.reduce((sum, point) => sum + point.count, 0);
      const bTotal = b.series.reduce((sum, point) => sum + point.count, 0);
      return bTotal - aTotal;
    });

  const skillTimelines = topSkills
    .slice(0, 6)
    .map((skill) => ({
      name: skill.name,
      series: timelineDates.map((date) => ({
        date,
        count: skillDayMap.get(skill.name)?.get(date) ?? 0,
      })),
    }))
    .filter((skill) => skill.series.some((point) => point.count > 0));

  const totalSkillMentionsByDay = timelineDates.map((date) => ({
    date,
    count: totalSkillMentionsDayMap.get(date) ?? 0,
  }));

  return {
    totalPostings,
    lastUpdated,
    topRoles,
    topSkills,
    sectorBreakdown,
    criticalRolesCount,
    postingsByDay,
    sectorTimelines,
    skillTimelines,
    totalSkillMentionsByDay,
  };
}

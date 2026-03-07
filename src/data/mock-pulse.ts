// src/data/mock-pulse.ts
// Mock analytics data: sector snapshots, rising skills, missions, and playbooks.
// Powers the Daily Pulse dashboard, Sector Detail pages, and Missions view
// during frontend development before the real analytics API is ready.

// ─── SECTOR SNAPSHOTS ─────────────────────────────────────────────────────────

export interface SectorSnapshot {
  id: string;
  name: string;
  impactScore: number; // 0–100
  trend: "rising" | "stable" | "cooling";
  openRoles: number;
  criticalRoles: number;
  topSkills: string[];
  weeklyPostingsDelta: number; // % change vs previous week
}

export const mockSectors: SectorSnapshot[] = [
  {
    id: "public-safety",
    name: "Public Safety",
    impactScore: 87,
    trend: "rising",
    openRoles: 31,
    criticalRoles: 5,
    topSkills: ["Crisis Intervention", "De-escalation", "CPR", "Incident Command", "Community Policing"],
    weeklyPostingsDelta: 18,
  },
  {
    id: "engineering",
    name: "Engineering",
    impactScore: 62,
    trend: "rising",
    openRoles: 14,
    criticalRoles: 0,
    topSkills: ["AutoCAD", "Project Management", "PE License", "Civil 3D", "Structural Analysis"],
    weeklyPostingsDelta: 11,
  },
  {
    id: "technology",
    name: "Technology",
    impactScore: 54,
    trend: "stable",
    openRoles: 18,
    criticalRoles: 0,
    topSkills: ["Cybersecurity", "ArcGIS", "Network Troubleshooting", "Python", "Cloud Infrastructure"],
    weeklyPostingsDelta: 4,
  },
  {
    id: "healthcare",
    name: "Healthcare",
    impactScore: 71,
    trend: "rising",
    openRoles: 22,
    criticalRoles: 2,
    topSkills: ["Patient Care", "EMT Certification", "Electronic Health Records", "Triage", "CPR"],
    weeklyPostingsDelta: 9,
  },
];

// ─── RISING SKILLS ────────────────────────────────────────────────────────────

export interface RisingSkill {
  skill: string;
  growthPct: number;
  sector: string;
  trainingMapped: boolean; // false = training gap
}

export const mockRisingSkills: RisingSkill[] = [
  { skill: "Crisis Intervention",       growthPct: 42, sector: "public-safety", trainingMapped: true  },
  { skill: "De-escalation",             growthPct: 38, sector: "public-safety", trainingMapped: true  },
  { skill: "Incident Command (NIMS)",   growthPct: 31, sector: "public-safety", trainingMapped: false },
  { skill: "Cybersecurity (CompTIA)",   growthPct: 27, sector: "technology",    trainingMapped: true  },
  { skill: "ArcGIS / Spatial Analysis", growthPct: 24, sector: "technology",    trainingMapped: false },
  { skill: "CDL Class B",               growthPct: 22, sector: "public-safety", trainingMapped: false },
  { skill: "BIM / Revit",               growthPct: 19, sector: "engineering",   trainingMapped: true  },
  { skill: "Data Center Operations",    growthPct: 17, sector: "technology",    trainingMapped: false },
  { skill: "PE License",                growthPct: 15, sector: "engineering",   trainingMapped: false },
  { skill: "Radio Communications",      growthPct: 14, sector: "public-safety", trainingMapped: true  },
];

// ─── TRAINING GAPS ────────────────────────────────────────────────────────────

export interface TrainingGap {
  skill: string;
  sector: string;
  demandRank: number; // 1 = most in-demand
  suggestedProvider: string;
}

export const mockTrainingGaps: TrainingGap[] = [
  {
    skill: "Incident Command (NIMS)",
    sector: "public-safety",
    demandRank: 1,
    suggestedProvider: "FEMA Emergency Management Institute (free online)",
  },
  {
    skill: "CDL Class B",
    sector: "public-safety",
    demandRank: 2,
    suggestedProvider: "Trenholm State Community College — CDL Program",
  },
  {
    skill: "ArcGIS / Spatial Analysis",
    sector: "technology",
    demandRank: 3,
    suggestedProvider: "Esri Training (free for government employees)",
  },
  {
    skill: "Data Center Operations",
    sector: "technology",
    demandRank: 4,
    suggestedProvider: "CompTIA Server+ (online, self-paced)",
  },
  {
    skill: "PE License",
    sector: "engineering",
    demandRank: 5,
    suggestedProvider: "NCEES — FE/PE Exam Prep (Alabama Board of Licensure)",
  },
];

// ─── MISSIONS ─────────────────────────────────────────────────────────────────

export interface MissionTask {
  id: string;
  label: string;
  done: boolean;
}

export interface Mission {
  id: string;
  title: string;
  sector: string;
  tasks: MissionTask[];
  progress: number; // 0–1
}

export const mockMissions: Mission[] = [
  {
    id: "mission-001",
    title: "Boost Firefighter Recruitment Q2 2026",
    sector: "public-safety",
    tasks: [
      { id: "t1", label: "Post openings on JobAps and Indeed",        done: true  },
      { id: "t2", label: "Partner with AIDT for CDL training pipeline", done: true  },
      { id: "t3", label: "Schedule open house at Fire Station 1",      done: false },
      { id: "t4", label: "Publish recruitment playbook",               done: false },
    ],
    progress: 0.5,
  },
  {
    id: "mission-002",
    title: "Map Top 5 Skill Gaps to Training Providers",
    sector: "public-safety",
    tasks: [
      { id: "t1", label: "Identify top 5 unmapped skills",                  done: true  },
      { id: "t2", label: "Research FEMA ICS training options",               done: true  },
      { id: "t3", label: "Contact Trenholm State re: CDL partnership",       done: false },
      { id: "t4", label: "Publish training gap report to Playbooks",         done: false },
      { id: "t5", label: "Share with Education Partners channel",            done: false },
    ],
    progress: 0.4,
  },
  {
    id: "mission-003",
    title: "Police Officer Pipeline — 2026 Academy Class",
    sector: "public-safety",
    tasks: [
      { id: "t1", label: "Confirm open headcount with HR",                   done: true  },
      { id: "t2", label: "Launch recruitment campaign across platforms",     done: false },
      { id: "t3", label: "Schedule APOST pre-screening session",             done: false },
    ],
    progress: 0.33,
  },
];

// ─── PLAYBOOKS ────────────────────────────────────────────────────────────────

export interface Playbook {
  id: string;
  title: string;
  sector: string;
  owner: string;
  status: "draft" | "active" | "done";
  insights: string[];
  actions: string[];
  likes: number;
  saved: boolean;
}

export const mockPlaybooks: Playbook[] = [
  {
    id: "pb-001",
    title: "Public Safety Hiring Sprint — Q2 2026",
    sector: "public-safety",
    owner: "City HR Office",
    status: "active",
    insights: [
      "Firefighter I postings are up 18% week-over-week — fastest growing role in Montgomery.",
      "CDL Class B is the top unmapped skill blocking fire apparatus operator recruitment.",
      "31 open public safety roles currently unfilled — highest in 3 years.",
    ],
    actions: [
      "Partner with Trenholm State for CDL pipeline",
      "Run targeted social media recruitment for Firefighter I",
      "Fast-track APOST academy enrollment for police candidates",
      "Publish weekly hiring status update to department leads",
      "Set up Workforce Pulse alert for Public Safety Impact Score > 85",
    ],
    likes: 7,
    saved: true,
  },
  {
    id: "pb-002",
    title: "Tech Talent Strategy — Data Center Boom",
    sector: "technology",
    owner: "Montgomery Economic Development",
    status: "draft",
    insights: [
      "Meta and AWS data center expansions are driving a 17% spike in Data Center Technician postings.",
      "Local training programs do not yet cover data center operations at scale.",
    ],
    actions: [
      "Engage Trenholm State and AIDT to develop data center technician curriculum",
      "Create internship pipeline with Meta and AWS facilities teams",
      "Map CompTIA Server+ to local workforce training grants",
    ],
    likes: 3,
    saved: false,
  },
];

// ─── DAILY PULSE SUMMARY ──────────────────────────────────────────────────────
// Shape matches GET /pulse/daily response — ready for the Home dashboard tile

export const mockDailyPulse = {
  date: "2026-03-06",
  alertLevel: "high" as const,
  alertMessage:
    "Public Safety roles are critically understaffed. 31 open positions — 18% increase this week.",
  criticalRoleCount: 5,
  fastestRisingSkill: "Crisis Intervention (+42%)",
  topTrainingGap: "NIMS Incident Command — no local provider mapped",
  sectors: mockSectors,
};

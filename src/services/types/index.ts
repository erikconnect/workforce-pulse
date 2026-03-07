// All TypeScript domain interfaces for Workforce Pulse
// This file must be written first — every stub, service, hook, and component depends on it.

export type PulseStatus = "critical" | "watch" | "stable";

export interface AlertBanner {
  id: string;
  severity: PulseStatus;
  message: string;
  cta?: { label: string; href: string };
  dismissible: boolean;
}

export interface PulseSummary {
  date: string; // ISO date string
  criticalRolesCount: number;
  fastestRisingSkills: string[];
  trainingNeedsCount: number;
  overallStatus: PulseStatus;
  checkInStreak: number; // gamification streak in days
  checkInCompleted: boolean;
}

export interface SectorKpi {
  label: string;
  value: string | number;
  delta: number; // percentage point change, positive = up
  status: PulseStatus;
}

export interface Sector {
  id: string;
  name: string;
  pulseScore: number; // 0–100 for PulseRing
  status: PulseStatus;
  kpis: SectorKpi[];
  sparklineData: number[]; // 7 data points for weekly sparkline
  employeeCount: number;
  openRolesCount: number;
  description: string;
}

export interface SectorDetail extends Sector {
  hiringTrend: { month: string; hires: number; attrition: number }[];
  criticalRoles: Role[];
  skills: Skill[];
  missions: Mission[];
  playbooks: Playbook[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  demandLevel: PulseStatus;
  growthRate: number; // percentage
  sparklineData: number[];
  relatedRoles: string[]; // role IDs
  trainingResources: { title: string; url: string; provider: string }[];
}

export interface Role {
  id: string;
  title: string;
  sectorId: string;
  openCount: number;
  urgency: PulseStatus;
  requiredSkills: string[]; // skill IDs
  avgTimeToFill: number; // days
}

export interface MissionStep {
  id: string;
  order: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "paused";
  priority: PulseStatus;
  progress: number; // 0–100
  steps: MissionStep[];
  sectorId: string;
  rewardPoints: number;
  participantCount: number;
  communityImpact: string;
  tags: string[];
  impactMetrics: {
    label: string;
    before: number;
    after: number;
    unit: string;
  }[];
  assignee?: string;
  dueDate: string;
}

export interface CreateMissionPayload {
  title: string;
  description: string;
  priority: PulseStatus;
  sectorId: string;
  dueDate: string;
  steps: { title: string; description: string; dueDate: string }[];
}

export interface MissionMemberBadge {
  id: string;
  label: string;
  description: string;
}

export interface MissionMemberProfile {
  id: string;
  name: string;
  role: string;
  city: string;
  level: number;
  points: number;
  nextLevelPoints: number;
  streak: number;
  missionPoints: number;
  skillPoints: number;
  sectorPoints: number;
  playbookPoints: number;
  completedMissionCount: number;
  activeMissionCount: number;
  contributedSteps: number;
  helpedWorkers: number;
  playbooksCreated: number;
  playbooksLiked: number;
  playbooksSaved: number;
  skillActionsCompleted: number;
  sectorActionsCompleted: number;
  badges: MissionMemberBadge[];
}

export interface Playbook {
  id: string;
  title: string;
  summary: string;
  authorName: string;
  authorAvatar: string;
  sectorId: string;
  tags: string[];
  likes: number;
  saves: number;
  createdAt: string;
  rewardPoints: number;
  estimatedHours: number;
  difficulty: "starter" | "operator" | "advanced";
  impactSummary: string;
  linkedSkills: string[];
  steps: { order: number; instruction: string }[];
  hasLiked: boolean;
  hasSaved: boolean;
}

export interface CreatePlaybookPayload {
  title: string;
  summary: string;
  sectorId: string;
  tags: string[];
  steps: { order: number; instruction: string }[];
}

// Raw job posting as returned by Bright Data scraper
export interface JobPosting {
  id: string;
  title: string;
  org: string;
  location: string;
  postedDate: string;        // ISO date string
  description: string;
  source: string;            // "indeed" | "linkedin" | etc.
  url: string;
  sectorId: string | null;   // inferred by classifier
  extractedSkills: string[]; // extracted by skill dictionary
  salary?: string;
  jobType?: string;          // "full-time" | "part-time" | "contract"
}

// Benefits catalog and rewards
export type BenefitCategory = "application" | "skills" | "contribution";

export interface BenefitEligibility {
  minPoints?: number;
  minLevel?: number;
  requiredBadges?: string[];
  domains?: ("missions" | "skills" | "sectors" | "playbooks")[];
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  category: BenefitCategory;
  costPoints: number;
  eligibility: BenefitEligibility;
  type: "redeemable" | "unlockable";
  provider?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface RewardTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[]; // benefit IDs
}

export interface RewardRedemption {
  id: string;
  benefitId: string;
  userId: string;
  pointsSpent: number;
  redeemedAt: string; // ISO date
  status: "pending" | "fulfilled" | "expired";
}

// Aggregated insight derived from a batch of JobPostings
export interface JobInsights {
  totalPostings: number;
  lastUpdated: string;       // ISO date string
  topRoles: { title: string; count: number; sectorId: string | null }[];
  topSkills: { name: string; count: number; growthSignal: "rising" | "steady" | "declining" }[];
  sectorBreakdown: { sectorId: string; count: number; percentChange: number }[];
  criticalRolesCount: number;
  postingsByDay: { date: string; count: number }[];
  sectorTimelines: { sectorId: string; series: { date: string; count: number }[] }[];
  skillTimelines: { name: string; series: { date: string; count: number }[] }[];
  totalSkillMentionsByDay: { date: string; count: number }[];
}

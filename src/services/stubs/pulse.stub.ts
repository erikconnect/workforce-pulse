import type { AlertBanner, PulseSummary } from "../types";

export interface RecentPosting {
  id: string;
  title: string;
  org: string;
  urgency: "critical" | "watch" | "stable";
  timeAgo: string;
}

export const stubAlerts: AlertBanner[] = [
  {
    id: "alert-1",
    severity: "critical",
    message: "Public Safety facing critical staffing shortage — 47 open roles unfilled for 30+ days.",
    cta: { label: "View sector", href: "/sectors/public-safety" },
    dismissible: false,
  },
  {
    id: "alert-2",
    severity: "watch",
    message: "Healthcare sector showing hiring lag — posting velocity down 18% WoW.",
    cta: { label: "View sector", href: "/sectors/healthcare" },
    dismissible: true,
  },
  {
    id: "alert-3",
    severity: "stable",
    message: "Technology sector workforce stabilizing after recent restructuring.",
    dismissible: true,
  },
];

export const stubPulseSummary: PulseSummary = {
  date: "2026-03-05",
  criticalRolesCount: 47,
  fastestRisingSkills: [
    "Emergency Response",
    "Cloud Infrastructure",
    "Cybersecurity",
    "Data Analysis",
    "Patient Triage",
    "Crisis Management",
  ],
  trainingNeedsCount: 312,
  overallStatus: "watch",
  checkInStreak: 7,
  checkInCompleted: false,
};

export const stubRecentPostings: RecentPosting[] = [
  { id: "rp-1", title: "Police Officer", org: "Montgomery PD", urgency: "critical", timeAgo: "1h ago" },
  { id: "rp-2", title: "Firefighter/EMT", org: "Montgomery Fire", urgency: "critical", timeAgo: "2h ago" },
  { id: "rp-3", title: "Registered Nurse", org: "Baptist Health", urgency: "watch", timeAgo: "3h ago" },
  { id: "rp-4", title: "Software Engineer", org: "MGMIT Solutions", urgency: "stable", timeAgo: "4h ago" },
  { id: "rp-5", title: "CDL Truck Driver", org: "River Region Freight", urgency: "critical", timeAgo: "5h ago" },
  { id: "rp-6", title: "Paramedic", org: "Montgomery EMS", urgency: "critical", timeAgo: "6h ago" },
  { id: "rp-7", title: "Construction Foreman", org: "Southeast Builders", urgency: "watch", timeAgo: "8h ago" },
  { id: "rp-8", title: "School Counselor", org: "MPS District", urgency: "stable", timeAgo: "10h ago" },
  { id: "rp-9", title: "Cybersecurity Analyst", org: "Maxwell AFB", urgency: "watch", timeAgo: "12h ago" },
  { id: "rp-10", title: "Warehouse Associate", org: "Amazon MGM", urgency: "watch", timeAgo: "1d ago" },
];

import type { AlertBanner, PulseSummary } from "../types";
import { stubAlerts, stubPulseSummary, stubRecentPostings, type RecentPosting } from "../stubs/pulse.stub";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function fetchAlerts(): Promise<AlertBanner[]> {
  if (USE_STUBS) return stubAlerts;
  const res = await fetch(`${API}/pulse/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function fetchPulseSummary(): Promise<PulseSummary> {
  if (USE_STUBS) return stubPulseSummary;
  const res = await fetch(`${API}/pulse/summary`);
  if (!res.ok) throw new Error("Failed to fetch pulse summary");
  return res.json();
}

export async function submitDailyCheckIn(): Promise<{ streak: number }> {
  if (USE_STUBS) return { streak: stubPulseSummary.checkInStreak + 1 };
  const res = await fetch(`${API}/pulse/check-in`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to submit check-in");
  return res.json();
}

export async function fetchRecentPostings(): Promise<RecentPosting[]> {
  if (USE_STUBS) return stubRecentPostings;
  const res = await fetch(`${API}/pulse/recent-postings`);
  if (!res.ok) throw new Error("Failed to fetch recent postings");
  return res.json();
}

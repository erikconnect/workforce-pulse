import type { AlertBanner, PulseSummary } from "../types";
import type { RecentPosting } from "../stubs/pulse.stub";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
function assertApiConfigured() {
  if (!API) {
    throw new Error("NEXT_PUBLIC_API_URL not configured");
  }
}

export async function fetchAlerts(): Promise<AlertBanner[]> {
  assertApiConfigured();
  const res = await fetch(`${API}/pulse/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function fetchPulseSummary(): Promise<PulseSummary> {
  assertApiConfigured();
  const res = await fetch(`${API}/pulse/summary`);
  if (!res.ok) throw new Error("Failed to fetch pulse summary");
  return res.json();
}

export async function submitDailyCheckIn(): Promise<{ streak: number }> {
  assertApiConfigured();
  const res = await fetch(`${API}/pulse/check-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "local-user" }),
  });
  if (!res.ok) throw new Error("Failed to submit check-in");
  return res.json();
}

export async function fetchRecentPostings(): Promise<RecentPosting[]> {
  assertApiConfigured();
  const res = await fetch(`${API}/pulse/recent-postings`);
  if (!res.ok) throw new Error("Failed to fetch recent postings");
  return res.json();
}

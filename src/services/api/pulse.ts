import type { AlertBanner, PulseSummary } from "../types";
import { stubAlerts, stubPulseSummary, stubRecentPostings, type RecentPosting } from "../stubs/pulse.stub";
import { getExternalApiBase } from "./api-base";

const API = getExternalApiBase();

let localCheckInState = {
  streak: stubPulseSummary.checkInStreak,
  completed: stubPulseSummary.checkInCompleted,
};

export async function fetchAlerts(): Promise<AlertBanner[]> {
  if (!API) return structuredClone(stubAlerts);
  try {
    const res = await fetch(`${API}/pulse/alerts`);
    if (!res.ok) throw new Error("Failed to fetch alerts");
    return res.json();
  } catch {
    return structuredClone(stubAlerts);
  }
}

export async function fetchPulseSummary(): Promise<PulseSummary> {
  if (!API) {
    return {
      ...structuredClone(stubPulseSummary),
      checkInStreak: localCheckInState.streak,
      checkInCompleted: localCheckInState.completed,
      date: new Date().toISOString().slice(0, 10),
    };
  }

  try {
    const res = await fetch(`${API}/pulse/summary`);
    if (!res.ok) throw new Error("Failed to fetch pulse summary");
    return res.json();
  } catch {
    return {
      ...structuredClone(stubPulseSummary),
      checkInStreak: localCheckInState.streak,
      checkInCompleted: localCheckInState.completed,
      date: new Date().toISOString().slice(0, 10),
    };
  }
}

export async function submitDailyCheckIn(): Promise<{ streak: number; pointsAwarded?: number }> {
  if (!API) {
    if (!localCheckInState.completed) {
      localCheckInState = {
        streak: localCheckInState.streak + 1,
        completed: true,
      };
    }
    return { streak: localCheckInState.streak, pointsAwarded: 10 };
  }

  try {
    const res = await fetch(`${API}/pulse/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "local-user" }),
    });
    if (!res.ok) throw new Error("Failed to submit check-in");
    return res.json();
  } catch {
    if (!localCheckInState.completed) {
      localCheckInState = {
        streak: localCheckInState.streak + 1,
        completed: true,
      };
    }
    return { streak: localCheckInState.streak, pointsAwarded: 10 };
  }
}

export async function fetchRecentPostings(): Promise<RecentPosting[]> {
  if (!API) return structuredClone(stubRecentPostings);
  try {
    const res = await fetch(`${API}/pulse/recent-postings`);
    if (!res.ok) throw new Error("Failed to fetch recent postings");
    return res.json();
  } catch {
    return structuredClone(stubRecentPostings);
  }
}

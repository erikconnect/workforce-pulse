import type { AlertBanner, PulseSummary } from "../types";
import { stubAlerts, stubPulseSummary, stubRecentPostings, type RecentPosting } from "../stubs/pulse.stub";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";
const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const CHECK_IN_STORAGE_KEY = "wfp-daily-checkin";

type CheckInState = {
  streak: number;
  lastCheckInDate: string | null;
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function readCheckInState(): CheckInState {
  if (typeof window === "undefined") {
    return { streak: stubPulseSummary.checkInStreak, lastCheckInDate: null };
  }

  const raw = window.localStorage.getItem(CHECK_IN_STORAGE_KEY);
  if (!raw) {
    return { streak: stubPulseSummary.checkInStreak, lastCheckInDate: null };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CheckInState>;
    return {
      streak: typeof parsed.streak === "number" ? parsed.streak : stubPulseSummary.checkInStreak,
      lastCheckInDate: typeof parsed.lastCheckInDate === "string" ? parsed.lastCheckInDate : null,
    };
  } catch {
    return { streak: stubPulseSummary.checkInStreak, lastCheckInDate: null };
  }
}

function writeCheckInState(state: CheckInState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHECK_IN_STORAGE_KEY, JSON.stringify(state));
}

function resolveStubPulseSummary(): PulseSummary {
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  const state = readCheckInState();
  const missedDay =
    state.lastCheckInDate != null &&
    state.lastCheckInDate !== today &&
    state.lastCheckInDate !== yesterday;

  const streak = missedDay ? 0 : state.streak;

  if (missedDay) {
    writeCheckInState({ streak: 0, lastCheckInDate: state.lastCheckInDate });
  }

  return {
    ...stubPulseSummary,
    date: today,
    checkInStreak: streak,
    checkInCompleted: state.lastCheckInDate === today,
  };
}

export async function fetchAlerts(): Promise<AlertBanner[]> {
  if (USE_STUBS) return stubAlerts;
  const res = await fetch(`${API}/pulse/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function fetchPulseSummary(): Promise<PulseSummary> {
  if (USE_STUBS) return resolveStubPulseSummary();
  const res = await fetch(`${API}/pulse/summary`);
  if (!res.ok) throw new Error("Failed to fetch pulse summary");
  return res.json();
}

export async function submitDailyCheckIn(): Promise<{ streak: number }> {
  if (USE_STUBS) {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    const state = readCheckInState();

    if (state.lastCheckInDate === today) {
      throw new Error("Today's check-in has already been completed.");
    }

    const nextStreak =
      state.lastCheckInDate == null
        ? state.streak + 1
        : state.lastCheckInDate === yesterday
          ? state.streak + 1
          : 1;

    writeCheckInState({
      streak: nextStreak,
      lastCheckInDate: today,
    });

    return { streak: nextStreak };
  }
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

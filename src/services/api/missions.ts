import type { CreateMissionPayload, Mission, MissionMemberProfile } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiEnvelope<T> = { success?: boolean; data?: T };

function assertApiConfigured() {
  if (!API) {
    throw new Error("NEXT_PUBLIC_API_URL not configured");
  }
}

function unwrapData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in (payload as ApiEnvelope<T>)) {
    return ((payload as ApiEnvelope<T>).data ?? payload) as T;
  }
  return payload as T;
}

export async function fetchMissions(): Promise<Mission[]> {
  assertApiConfigured();
  const res = await fetch(`${API}/missions`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch missions: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<Mission[]> | Mission[];
  return unwrapData(data);
}

export async function fetchMissionById(id: string): Promise<Mission | undefined> {
  assertApiConfigured();
  const res = await fetch(`${API}/missions/${id}`, { cache: "no-store" });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`Failed to fetch mission ${id}: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<Mission> | Mission;
  return unwrapData(data);
}

export async function fetchMissionMemberProfile(): Promise<MissionMemberProfile> {
  assertApiConfigured();
  const res = await fetch(`${API}/missions/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch mission member profile: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<MissionMemberProfile> | MissionMemberProfile;
  return unwrapData(data);
}

export async function updateMissionStep(
  missionId: string,
  stepId: string,
  completed: boolean
): Promise<Mission> {
  assertApiConfigured();
  const res = await fetch(`${API}/missions/${missionId}/steps/${stepId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error(`Failed to update mission step: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<Mission> | Mission;
  return unwrapData(data);
}

export async function createMission(payload: CreateMissionPayload): Promise<Mission> {
  assertApiConfigured();
  const res = await fetch(`${API}/missions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create mission: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<Mission> | Mission;
  return unwrapData(data);
}

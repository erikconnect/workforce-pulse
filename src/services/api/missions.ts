import type { CreateMissionPayload, Mission, MissionMemberProfile } from "../types";
import { stubMissions, stubMissionMemberProfile } from "../stubs/missions.stub";
import { getExternalApiBase } from "./api-base";

const API = getExternalApiBase();

type ApiEnvelope<T> = { success?: boolean; data?: T };

function cloneMissions(): Mission[] {
  return structuredClone(stubMissions);
}

function unwrapData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in (payload as ApiEnvelope<T>)) {
    return ((payload as ApiEnvelope<T>).data ?? payload) as T;
  }
  return payload as T;
}

export async function fetchMissions(): Promise<Mission[]> {
  if (!API) return cloneMissions();
  try {
    const res = await fetch(`${API}/missions`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch missions: ${res.status}`);
    const data = (await res.json()) as ApiEnvelope<Mission[]> | Mission[];
    return unwrapData(data);
  } catch {
    return cloneMissions();
  }
}

export async function fetchMissionById(id: string): Promise<Mission | undefined> {
  try {
    if (API) {
      const res = await fetch(`${API}/missions/${id}`, { cache: "no-store" });
      if (res.status === 404) return undefined;
      if (!res.ok) throw new Error(`Failed to fetch mission ${id}: ${res.status}`);
      const data = (await res.json()) as ApiEnvelope<Mission> | Mission;
      return unwrapData(data);
    }
  } catch {
    // Fall through to stubs.
  }
  return cloneMissions().find((mission) => mission.id === id);
}

export async function fetchMissionMemberProfile(): Promise<MissionMemberProfile> {
  if (!API) return structuredClone(stubMissionMemberProfile);
  try {
    const res = await fetch(`${API}/missions/profile`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch mission member profile: ${res.status}`);
    const data = (await res.json()) as ApiEnvelope<MissionMemberProfile> | MissionMemberProfile;
    return unwrapData(data);
  } catch {
    return structuredClone(stubMissionMemberProfile);
  }
}

export async function updateMissionStep(
  missionId: string,
  stepId: string,
  completed: boolean
): Promise<Mission> {
  if (!API) {
    const mission = cloneMissions().find((m) => m.id === missionId);
    if (!mission) throw new Error(`Mission not found: ${missionId}`);
    mission.steps = mission.steps.map((step) =>
      step.id === stepId ? { ...step, completed } : step
    );
    const completedSteps = mission.steps.filter((step) => step.completed).length;
    mission.progress = Math.round((completedSteps / Math.max(mission.steps.length, 1)) * 100);
    return mission;
  }

  try {
    const res = await fetch(`${API}/missions/${missionId}/steps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error(`Failed to update mission step: ${res.status}`);
    const data = (await res.json()) as ApiEnvelope<Mission> | Mission;
    return unwrapData(data);
  } catch {
    const mission = cloneMissions().find((m) => m.id === missionId);
    if (!mission) throw new Error(`Mission not found: ${missionId}`);
    mission.steps = mission.steps.map((step) =>
      step.id === stepId ? { ...step, completed } : step
    );
    const completedSteps = mission.steps.filter((step) => step.completed).length;
    mission.progress = Math.round((completedSteps / Math.max(mission.steps.length, 1)) * 100);
    return mission;
  }
}

export async function createMission(payload: CreateMissionPayload): Promise<Mission> {
  if (!API) {
    return {
      id: `mission-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      status: "active",
      priority: payload.priority,
      progress: 0,
      sectorId: payload.sectorId,
      rewardPoints: Math.max(80, payload.steps.length * 25),
      participantCount: 1,
      communityImpact: "Community-authored mission ready to mobilize local action.",
      tags: ["Community", "Action"],
      assignee: "You",
      dueDate: payload.dueDate,
      steps: payload.steps.map((step, index) => ({
        id: `step-${Date.now()}-${index + 1}`,
        order: index + 1,
        title: step.title,
        description: step.description,
        completed: false,
        dueDate: step.dueDate,
      })),
      impactMetrics: [],
    };
  }

  try {
    const res = await fetch(`${API}/missions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create mission: ${res.status}`);
    const data = (await res.json()) as ApiEnvelope<Mission> | Mission;
    return unwrapData(data);
  } catch {
    return {
      id: `mission-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      status: "active",
      priority: payload.priority,
      progress: 0,
      sectorId: payload.sectorId,
      rewardPoints: Math.max(80, payload.steps.length * 25),
      participantCount: 1,
      communityImpact: "Community-authored mission ready to mobilize local action.",
      tags: ["Community", "Action"],
      assignee: "You",
      dueDate: payload.dueDate,
      steps: payload.steps.map((step, index) => ({
        id: `step-${Date.now()}-${index + 1}`,
        order: index + 1,
        title: step.title,
        description: step.description,
        completed: false,
        dueDate: step.dueDate,
      })),
      impactMetrics: [],
    };
  }
}

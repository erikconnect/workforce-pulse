import type { CreateMissionPayload, Mission, MissionMemberProfile } from "../types";
import { stubMissions } from "../stubs/missions.stub";
import { adjustCommunityStreak, adjustDomainPoints, fetchCommunityProfile, syncMissionStats } from "./community-profile";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

// Mutable in-memory copy for stub state during a session
const mutableMissions = stubMissions.map((m) => ({
  ...m,
  steps: m.steps.map((s) => ({ ...s })),
}));
syncMissionStats(mutableMissions);

export async function fetchMissions(): Promise<Mission[]> {
  if (USE_STUBS) return mutableMissions;
  const res = await fetch(`${API}/missions`);
  if (!res.ok) throw new Error("Failed to fetch missions");
  return res.json();
}

export async function fetchMissionById(id: string): Promise<Mission | undefined> {
  if (USE_STUBS) return mutableMissions.find((m) => m.id === id);
  const res = await fetch(`${API}/missions/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch mission ${id}`);
  return res.json();
}

export async function fetchMissionMemberProfile(): Promise<MissionMemberProfile> {
  if (USE_STUBS) return fetchCommunityProfile();
  const res = await fetch(`${API}/missions/profile`);
  if (!res.ok) throw new Error("Failed to fetch mission member profile");
  return res.json();
}

export async function updateMissionStep(
  missionId: string,
  stepId: string,
  completed: boolean
): Promise<Mission> {
  if (USE_STUBS) {
    const mission = mutableMissions.find((m) => m.id === missionId);
    if (!mission) throw new Error(`Mission ${missionId} not found`);
    const step = mission.steps.find((s) => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found`);
    const stepWasCompleted = step.completed;
    const missionWasCompleted = mission.status === "completed";
    const stepPoints = Math.max(12, Math.round(mission.rewardPoints / Math.max(3, mission.steps.length + 1)));
    const completionBonus = Math.max(30, mission.rewardPoints - stepPoints * mission.steps.length);

    step.completed = completed;
    // Recalculate progress
    const completedCount = mission.steps.filter((s) => s.completed).length;
    mission.progress = Math.round((completedCount / mission.steps.length) * 100);
    mission.status = mission.progress === 100 ? "completed" : mission.status === "paused" ? "paused" : "active";

    if (stepWasCompleted !== completed) {
      adjustDomainPoints("missions", completed ? stepPoints : -stepPoints);
    }
    if (!missionWasCompleted && mission.status === "completed") {
      adjustDomainPoints("missions", completionBonus);
      adjustCommunityStreak(1);
    }
    if (missionWasCompleted && mission.status !== "completed") {
      adjustDomainPoints("missions", -completionBonus);
      adjustCommunityStreak(-1);
    }
    syncMissionStats(mutableMissions);
    return { ...mission, steps: mission.steps.map((s) => ({ ...s })) };
  }
  const res = await fetch(`${API}/missions/${missionId}/steps/${stepId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error(`Failed to update step ${stepId}`);
  return res.json();
}

export async function createMission(payload: CreateMissionPayload): Promise<Mission> {
  if (USE_STUBS) {
    const priorityReward: Record<CreateMissionPayload["priority"], number> = {
      critical: 180,
      watch: 130,
      stable: 90,
    };
    const newMission: Mission = {
      id: `mission-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      status: "active",
      priority: payload.priority,
      progress: 0,
      sectorId: payload.sectorId,
      rewardPoints: priorityReward[payload.priority] + payload.steps.length * 10,
      participantCount: 8 + payload.steps.length * 2,
      communityImpact: "New community mission created to coordinate workforce action and visible follow-through.",
      tags: ["Community-led", "New initiative"],
      assignee: "You",
      dueDate: payload.dueDate,
      steps: payload.steps.map((s, i) => ({
        id: `ms-${Date.now()}-${i}`,
        order: i + 1,
        title: s.title,
        description: s.description,
        completed: false,
        dueDate: s.dueDate,
      })),
      impactMetrics: [],
    };
    mutableMissions.unshift({
      ...newMission,
      steps: newMission.steps.map((s) => ({ ...s })),
    });
    adjustDomainPoints("missions", 25);
    syncMissionStats(mutableMissions);
    return newMission;
  }
  const res = await fetch(`${API}/missions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create mission");
  return res.json();
}

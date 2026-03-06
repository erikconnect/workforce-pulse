import type { Mission, MissionMemberBadge, MissionMemberProfile } from "../types";
import { stubMissionMemberProfile } from "../stubs/missions.stub";

type EngagementDomain = "missions" | "skills" | "sectors" | "playbooks";
type PlaybookAction = "like" | "save" | "create";
type SkillAction = "fit" | "pathway";
type SectorAction = "compare";

const mutableCommunityProfile: MissionMemberProfile = {
  ...stubMissionMemberProfile,
  badges: stubMissionMemberProfile.badges.map((badge) => ({ ...badge })),
};

const engagementLedger = new Set<string>();

function levelFromPoints(points: number) {
  return Math.max(1, Math.floor(points / 250) + 1);
}

function nextLevelFromPoints(points: number) {
  return levelFromPoints(points) * 250;
}

function uniqueBadges(badges: MissionMemberBadge[]) {
  return badges.filter((badge, index, all) => all.findIndex((entry) => entry.id === badge.id) === index);
}

function recomputeTotals() {
  mutableCommunityProfile.points =
    mutableCommunityProfile.missionPoints +
    mutableCommunityProfile.skillPoints +
    mutableCommunityProfile.sectorPoints +
    mutableCommunityProfile.playbookPoints;
  mutableCommunityProfile.level = levelFromPoints(mutableCommunityProfile.points);
  mutableCommunityProfile.nextLevelPoints = nextLevelFromPoints(mutableCommunityProfile.points);
}

function recomputeBadges() {
  const unlockedBadges: MissionMemberBadge[] = [...stubMissionMemberProfile.badges];

  if (mutableCommunityProfile.points >= 1000) {
    unlockedBadges.push({
      id: "impact-captain",
      label: "Impact Captain",
      description: "Crossed 1,000 contribution points across missions, playbooks, skills, and sectors.",
    });
  }
  if (mutableCommunityProfile.completedMissionCount >= 3) {
    unlockedBadges.push({
      id: "mission-closer",
      label: "Mission Closer",
      description: "Completed three workforce missions with measurable community outcomes.",
    });
  }
  if (mutableCommunityProfile.contributedSteps >= 15) {
    unlockedBadges.push({
      id: "step-finisher",
      label: "Step Finisher",
      description: "Delivered fifteen mission milestones across the board.",
    });
  }
  if (mutableCommunityProfile.playbooksCreated >= 2 || mutableCommunityProfile.playbooksSaved >= 5) {
    unlockedBadges.push({
      id: "playbook-curator",
      label: "Playbook Curator",
      description: "Built or saved a repeatable library of workforce interventions.",
    });
  }
  if (mutableCommunityProfile.skillActionsCompleted >= 6) {
    unlockedBadges.push({
      id: "skill-scout",
      label: "Skill Scout",
      description: "Mapped training pathways and role fit across the most in-demand skills.",
    });
  }
  if (mutableCommunityProfile.sectorActionsCompleted >= 4) {
    unlockedBadges.push({
      id: "sector-strategist",
      label: "Sector Strategist",
      description: "Compared sector signals and identified cross-sector workforce pressure points.",
    });
  }

  mutableCommunityProfile.badges = uniqueBadges(unlockedBadges);
}

function cloneProfile(): MissionMemberProfile {
  recomputeTotals();
  recomputeBadges();
  return {
    ...mutableCommunityProfile,
    badges: mutableCommunityProfile.badges.map((badge) => ({ ...badge })),
  };
}

export function fetchCommunityProfile(): MissionMemberProfile {
  return cloneProfile();
}

export function syncMissionStats(missions: Mission[]) {
  mutableCommunityProfile.completedMissionCount = missions.filter((mission) => mission.status === "completed").length;
  mutableCommunityProfile.activeMissionCount = missions.filter((mission) => mission.status === "active").length;
  mutableCommunityProfile.contributedSteps = missions.reduce(
    (sum, mission) => sum + mission.steps.filter((step) => step.completed).length,
    0
  );
  mutableCommunityProfile.helpedWorkers = missions
    .filter((mission) => mission.status === "completed")
    .reduce((sum, mission) => sum + mission.participantCount * 4, 0);
  cloneProfile();
}

export function deductPointsForRedemption(amount: number): MissionMemberProfile | null {
  const total = mutableCommunityProfile.points;
  if (amount > total) return null;
  const perDomain = Math.floor(amount / 4);
  mutableCommunityProfile.missionPoints = Math.max(0, mutableCommunityProfile.missionPoints - perDomain);
  mutableCommunityProfile.skillPoints = Math.max(0, mutableCommunityProfile.skillPoints - perDomain);
  mutableCommunityProfile.sectorPoints = Math.max(0, mutableCommunityProfile.sectorPoints - perDomain);
  mutableCommunityProfile.playbookPoints = Math.max(0, mutableCommunityProfile.playbookPoints - (amount - perDomain * 3));
  return cloneProfile();
}

export function adjustDomainPoints(domain: EngagementDomain, delta: number) {
  const key = domain === "missions"
    ? "missionPoints"
    : domain === "skills"
      ? "skillPoints"
      : domain === "sectors"
        ? "sectorPoints"
        : "playbookPoints";

  mutableCommunityProfile[key] = Math.max(0, mutableCommunityProfile[key] + delta);
  return cloneProfile();
}

export function adjustCommunityStreak(delta: number) {
  mutableCommunityProfile.streak = Math.max(0, mutableCommunityProfile.streak + delta);
  return cloneProfile();
}

export function recordSkillAction(skillId: string, action: SkillAction) {
  const token = `skills:${action}:${skillId}`;
  if (engagementLedger.has(token)) return cloneProfile();
  engagementLedger.add(token);

  mutableCommunityProfile.skillPoints += action === "pathway" ? 14 : 10;
  mutableCommunityProfile.skillActionsCompleted += 1;
  return cloneProfile();
}

export function recordSectorAction(sectorId: string, action: SectorAction) {
  const token = `sectors:${action}:${sectorId}`;
  if (engagementLedger.has(token)) return cloneProfile();
  engagementLedger.add(token);

  mutableCommunityProfile.sectorPoints += 12;
  mutableCommunityProfile.sectorActionsCompleted += 1;
  return cloneProfile();
}

export function recordPlaybookAction(playbookId: string, action: PlaybookAction, active: boolean) {
  const token = `playbooks:${action}:${playbookId}`;
  const pointsByAction: Record<PlaybookAction, number> = {
    like: 6,
    save: 12,
    create: 24,
  };

  if (active && !engagementLedger.has(token)) {
    engagementLedger.add(token);
    mutableCommunityProfile.playbookPoints += pointsByAction[action];
    if (action === "like") mutableCommunityProfile.playbooksLiked += 1;
    if (action === "save") mutableCommunityProfile.playbooksSaved += 1;
    if (action === "create") mutableCommunityProfile.playbooksCreated += 1;
  }

  if (!active && engagementLedger.has(token)) {
    engagementLedger.delete(token);
    mutableCommunityProfile.playbookPoints = Math.max(0, mutableCommunityProfile.playbookPoints - pointsByAction[action]);
    if (action === "like") mutableCommunityProfile.playbooksLiked = Math.max(0, mutableCommunityProfile.playbooksLiked - 1);
    if (action === "save") mutableCommunityProfile.playbooksSaved = Math.max(0, mutableCommunityProfile.playbooksSaved - 1);
  }

  return cloneProfile();
}

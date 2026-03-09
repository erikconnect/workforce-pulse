import Mission from '../models/Mission.js';
import Playbook from '../models/Playbook.js';
import CommunityProfile from '../models/CommunityProfile.js';

export async function getOrCreateCommunityProfile(userId = 'local-user') {
  const existing = await CommunityProfile.findOne({ userId });
  if (existing) return existing;

  return CommunityProfile.create({ userId });
}

function buildBadges(profile) {
  const badges = [];
  if (profile.points >= 1000) {
    badges.push({
      id: 'impact-captain',
      label: 'Impact Captain',
      description: 'Crossed 1,000 contribution points across missions, playbooks, skills, and sectors.',
    });
  }
  if (profile.completedMissionCount >= 3) {
    badges.push({
      id: 'mission-closer',
      label: 'Mission Closer',
      description: 'Completed three workforce missions with measurable community outcomes.',
    });
  }
  if (profile.contributedSteps >= 15) {
    badges.push({
      id: 'step-finisher',
      label: 'Step Finisher',
      description: 'Delivered fifteen mission milestones across the board.',
    });
  }
  if (profile.playbooksCreated >= 2 || profile.playbooksSaved >= 5) {
    badges.push({
      id: 'playbook-curator',
      label: 'Playbook Curator',
      description: 'Built or saved a repeatable library of workforce interventions.',
    });
  }
  if (profile.skillActionsCompleted >= 6) {
    badges.push({
      id: 'skill-scout',
      label: 'Skill Scout',
      description: 'Mapped training pathways and role fit across the most in-demand skills.',
    });
  }
  if (profile.sectorActionsCompleted >= 4) {
    badges.push({
      id: 'sector-strategist',
      label: 'Sector Strategist',
      description: 'Compared sector signals and identified cross-sector workforce pressure points.',
    });
  }
  return badges;
}

export async function buildMissionMemberProfile(userId = 'local-user') {
  const [missions, playbooks, community] = await Promise.all([
    Mission.find({}, { status: 1, steps: 1, participantCount: 1 }),
    Playbook.find({}, { likes: 1, saves: 1 }),
    getOrCreateCommunityProfile(userId),
  ]);

  const completedMissionCount = missions.filter((mission) => mission.status === 'completed').length;
  const activeMissionCount = missions.filter((mission) => mission.status === 'active').length;
  const contributedSteps = missions.reduce(
    (sum, mission) => sum + (mission.steps?.filter((step) => step.completed).length || 0),
    0
  );
  const helpedWorkers = missions
    .filter((mission) => mission.status === 'completed')
    .reduce((sum, mission) => sum + ((mission.participantCount || 0) * 4), 0);

  const missionPoints = completedMissionCount * 120 + contributedSteps * 8;

  const playbooksCreated = playbooks.length;
  const playbooksLiked = playbooks.reduce((sum, playbook) => sum + (playbook.likes || 0), 0);
  const playbooksSaved = playbooks.reduce((sum, playbook) => sum + (playbook.saves || 0), 0);
  const playbookPoints = (playbooksCreated * 24) + (playbooksLiked * 6) + (playbooksSaved * 12);

  const skillPoints = community.skillPoints || 0;
  const sectorPoints = community.sectorPoints || 0;
  const manualPlaybookPoints = community.playbookPoints || 0;
  const checkInPoints = community.checkInPoints || 0;
  const redemptionPoints = community.redemptionPoints || 0;

  const totalBeforeRedemption = missionPoints + skillPoints + sectorPoints + playbookPoints + manualPlaybookPoints + checkInPoints;
  const points = Math.max(0, totalBeforeRedemption - redemptionPoints);
  const level = Math.max(1, Math.floor(points / 250) + 1);
  const nextLevelPoints = level * 250;

  const profile = {
    id: 'member-city-admin',
    name: 'City Admin',
    role: 'Community Workforce Lead',
    city: 'Montgomery, AL',
    level,
    points,
    nextLevelPoints,
    streak: community.streak || 0,
    missionPoints,
    skillPoints,
    sectorPoints,
    checkInPoints,
    playbookPoints: playbookPoints + manualPlaybookPoints,
    completedMissionCount,
    activeMissionCount,
    contributedSteps,
    helpedWorkers,
    playbooksCreated,
    playbooksLiked,
    playbooksSaved,
    skillActionsCompleted: community.skillActionsCompleted || 0,
    sectorActionsCompleted: community.sectorActionsCompleted || 0,
    badges: [],
  };

  profile.badges = buildBadges(profile);
  return profile;
}

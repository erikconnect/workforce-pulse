import { buildMissionMemberProfile, getOrCreateCommunityProfile } from '../utils/communityProfile.js';

const SKILL_POINTS_BY_ACTION = {
  fit: 10,
  pathway: 14,
};

const SECTOR_POINTS_BY_ACTION = {
  compare: 12,
};

const PLAYBOOK_ACTIONS = new Set(['like', 'save', 'create']);

function addLedgerToken(profile, token) {
  const ledger = new Set(profile.engagementLedger || []);
  if (ledger.has(token)) return false;
  ledger.add(token);
  profile.engagementLedger = Array.from(ledger);
  return true;
}

export const recordSkillAction = async (req, res, next) => {
  try {
    const userId = req.body?.userId || 'local-user';
    const skillId = req.body?.skillId;
    const action = req.body?.action;

    if (!skillId || !action || !(action in SKILL_POINTS_BY_ACTION)) {
      return res.status(400).json({
        success: false,
        error: { message: 'skillId and valid action (fit|pathway) are required' },
      });
    }

    const profile = await getOrCreateCommunityProfile(userId);
    const token = `skills:${action}:${skillId}`;
    const inserted = addLedgerToken(profile, token);

    if (inserted) {
      profile.skillPoints = (profile.skillPoints || 0) + SKILL_POINTS_BY_ACTION[action];
      profile.skillActionsCompleted = (profile.skillActionsCompleted || 0) + 1;
      await profile.save();
    }

    const memberProfile = await buildMissionMemberProfile(userId);
    return res.json({ success: true, data: memberProfile });
  } catch (error) {
    next(error);
  }
};

export const recordSectorAction = async (req, res, next) => {
  try {
    const userId = req.body?.userId || 'local-user';
    const sectorId = req.body?.sectorId;
    const action = req.body?.action;

    if (!sectorId || !action || !(action in SECTOR_POINTS_BY_ACTION)) {
      return res.status(400).json({
        success: false,
        error: { message: 'sectorId and valid action (compare) are required' },
      });
    }

    const profile = await getOrCreateCommunityProfile(userId);
    const token = `sectors:${action}:${sectorId}`;
    const inserted = addLedgerToken(profile, token);

    if (inserted) {
      profile.sectorPoints = (profile.sectorPoints || 0) + SECTOR_POINTS_BY_ACTION[action];
      profile.sectorActionsCompleted = (profile.sectorActionsCompleted || 0) + 1;
      await profile.save();
    }

    const memberProfile = await buildMissionMemberProfile(userId);
    return res.json({ success: true, data: memberProfile });
  } catch (error) {
    next(error);
  }
};

export const recordPlaybookAction = async (req, res, next) => {
  try {
    const userId = req.body?.userId || 'local-user';
    const playbookId = req.body?.playbookId;
    const action = req.body?.action;
    const active = req.body?.active !== false;

    if (!playbookId || !PLAYBOOK_ACTIONS.has(action)) {
      return res.status(400).json({
        success: false,
        error: { message: 'playbookId and valid action (like|save|create) are required' },
      });
    }

    const profile = await getOrCreateCommunityProfile(userId);
    const token = `playbooks:${action}:${playbookId}`;
    const ledger = new Set(profile.engagementLedger || []);

    if (active) {
      ledger.add(token);
    } else {
      ledger.delete(token);
    }

    profile.engagementLedger = Array.from(ledger);
    await profile.save();

    const memberProfile = await buildMissionMemberProfile(userId);
    return res.json({ success: true, data: memberProfile });
  } catch (error) {
    next(error);
  }
};

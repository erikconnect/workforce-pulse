import BenefitRedemption from '../models/BenefitRedemption.js';
import { BENEFITS_CATALOG } from '../config/benefitsCatalog.js';
import { buildMissionMemberProfile, getOrCreateCommunityProfile } from '../utils/communityProfile.js';

function checkEligibility(benefit, profile) {
  const e = benefit.eligibility || {};
  if (e.minPoints != null && profile.points < e.minPoints) return { eligible: false, reason: `Need ${e.minPoints - profile.points} more points` };
  if (e.minLevel != null && profile.level < e.minLevel) return { eligible: false, reason: 'Eligibility requirements not met' };
  if (Array.isArray(e.requiredBadges) && e.requiredBadges.length > 0) {
    const hasAll = e.requiredBadges.every((id) => profile.badges.some((badge) => badge.id === id));
    if (!hasAll) return { eligible: false, reason: 'Eligibility requirements not met' };
  }
  if (benefit.costPoints > profile.points) return { eligible: false, reason: `Need ${benefit.costPoints - profile.points} more points` };
  return { eligible: true };
}

export const getBenefitsCatalog = async (req, res, next) => {
  try {
    res.json({ success: true, data: BENEFITS_CATALOG });
  } catch (error) {
    next(error);
  }
};

export const getRedemptions = async (req, res, next) => {
  try {
    const userId = req.query?.userId || 'member-city-admin';
    const rows = await BenefitRedemption.find({ userId }).sort({ redeemedAt: -1 });
    const data = rows.map((row) => ({
      id: row.id,
      benefitId: row.benefitId,
      userId: row.userId,
      pointsSpent: row.pointsSpent,
      redeemedAt: row.redeemedAt,
      status: row.status,
    }));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const redeemBenefit = async (req, res, next) => {
  try {
    const userId = req.body?.userId || 'member-city-admin';
    const communityUserId = req.body?.communityUserId || 'local-user';
    const benefitId = req.body?.benefitId;

    const benefit = BENEFITS_CATALOG.find((b) => b.id === benefitId);
    if (!benefit) {
      return res.status(404).json({ success: false, error: { message: 'Benefit not found' } });
    }

    const profile = await buildMissionMemberProfile(communityUserId);
    const eligibility = checkEligibility(benefit, profile);
    if (!eligibility.eligible) {
      return res.status(400).json({ success: false, error: { message: eligibility.reason } });
    }

    const alreadyRedeemed = await BenefitRedemption.findOne({ userId, benefitId, status: 'fulfilled' });
    if (alreadyRedeemed) {
      return res.status(400).json({ success: false, error: { message: 'Benefit already redeemed' } });
    }

    const redemption = await BenefitRedemption.create({
      id: `red-${Date.now()}`,
      benefitId,
      userId,
      pointsSpent: benefit.costPoints,
      redeemedAt: new Date(),
      status: 'fulfilled',
    });

    if (benefit.costPoints > 0) {
      const community = await getOrCreateCommunityProfile(communityUserId);
      community.redemptionPoints = (community.redemptionPoints || 0) + benefit.costPoints;
      await community.save();
    }

    const payload = {
      id: redemption.id,
      benefitId: redemption.benefitId,
      userId: redemption.userId,
      pointsSpent: redemption.pointsSpent,
      redeemedAt: redemption.redeemedAt,
      status: redemption.status,
    };

    res.json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
};

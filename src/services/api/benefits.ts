import type { Benefit, MissionMemberProfile, RewardRedemption } from "../types";
import { deductPointsForRedemption } from "./community-profile";

const STUB_CATALOG: Benefit[] = [
  {
    id: "app-priority",
    title: "Priority candidacy",
    description: "Get your application highlighted for partner employer roles in Montgomery.",
    category: "application",
    costPoints: 150,
    eligibility: { minPoints: 100, minLevel: 2 },
    type: "redeemable",
  },
  {
    id: "app-fast-lane",
    title: "Fast-lane triage",
    description: "Priority screening for selected city and partner positions.",
    category: "application",
    costPoints: 250,
    eligibility: { minPoints: 200, minLevel: 3 },
    type: "redeemable",
  },
  {
    id: "skills-course",
    title: "Free training course voucher",
    description: "Access one sponsored course from our training partners.",
    category: "skills",
    costPoints: 100,
    eligibility: { minPoints: 50 },
    type: "redeemable",
  },
  {
    id: "skills-cert",
    title: "Certification voucher",
    description: "Subsidized certification exam for in-demand skills.",
    category: "skills",
    costPoints: 300,
    eligibility: { minPoints: 200, minLevel: 4 },
    type: "redeemable",
  },
  {
    id: "contrib-badge",
    title: "City Contributor badge",
    description: "Exclusive badge for active workforce contributors.",
    category: "contribution",
    costPoints: 0,
    eligibility: { minPoints: 500 },
    type: "unlockable",
  },
  {
    id: "contrib-playbook",
    title: "Premium playbook access",
    description: "Unlock advanced playbooks and mentorship resources.",
    category: "contribution",
    costPoints: 200,
    eligibility: { minPoints: 150, requiredBadges: ["playbook-curator"] },
    type: "redeemable",
  },
];

const redemptionsStore: RewardRedemption[] = [];

function checkEligibility(benefit: Benefit, profile: MissionMemberProfile): boolean {
  const e = benefit.eligibility;
  if (e.minPoints != null && profile.points < e.minPoints) return false;
  if (e.minLevel != null && profile.level < e.minLevel) return false;
  if (e.requiredBadges?.length) {
    const hasAll = e.requiredBadges.every((bid) => profile.badges.some((b) => b.id === bid));
    if (!hasAll) return false;
  }
  return true;
}

export function fetchBenefitsCatalog(): Benefit[] {
  return [...STUB_CATALOG];
}

export function fetchRedemptions(): RewardRedemption[] {
  return [...redemptionsStore];
}

export function checkBenefitEligibility(
  benefitId: string,
  profile: MissionMemberProfile
): { eligible: boolean; reason?: string } {
  const benefit = STUB_CATALOG.find((b) => b.id === benefitId);
  if (!benefit) return { eligible: false, reason: "Benefit not found" };
  if (profile.points < benefit.costPoints)
    return { eligible: false, reason: `Need ${benefit.costPoints - profile.points} more points` };
  if (!checkEligibility(benefit, profile))
    return { eligible: false, reason: "Eligibility requirements not met" };
  return { eligible: true };
}

export function redeemBenefit(
  benefitId: string,
  profile: MissionMemberProfile
): { success: boolean; redemption?: RewardRedemption; error?: string } {
  const benefit = STUB_CATALOG.find((b) => b.id === benefitId);
  if (!benefit) return { success: false, error: "Benefit not found" };
  const check = checkBenefitEligibility(benefitId, profile);
  if (!check.eligible) return { success: false, error: check.reason };

  if (benefit.costPoints > 0) {
    const updated = deductPointsForRedemption(benefit.costPoints);
    if (!updated) return { success: false, error: "Insufficient points" };
  }

  const redemption: RewardRedemption = {
    id: `red-${Date.now()}`,
    benefitId,
    userId: profile.id,
    pointsSpent: benefit.costPoints,
    redeemedAt: new Date().toISOString(),
    status: "fulfilled",
  };
  redemptionsStore.push(redemption);
  return { success: true, redemption };
}

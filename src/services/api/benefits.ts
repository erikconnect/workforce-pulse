import type { Benefit, MissionMemberProfile, RewardRedemption } from '../types';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type ApiEnvelope<T> = { success?: boolean; data?: T; error?: { message?: string } };

function assertApiConfigured() {
  if (!API) {
    throw new Error('NEXT_PUBLIC_API_URL not configured');
  }
}

function unwrapData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    return ((payload as ApiEnvelope<T>).data ?? payload) as T;
  }
  return payload as T;
}

function checkEligibility(benefit: Benefit, profile: MissionMemberProfile): { eligible: boolean; reason?: string } {
  const e = benefit.eligibility;
  if (e.minPoints != null && profile.points < e.minPoints) return { eligible: false, reason: `Need ${e.minPoints - profile.points} more points` };
  if (e.minLevel != null && profile.level < e.minLevel) return { eligible: false, reason: 'Eligibility requirements not met' };
  if (e.requiredBadges?.length) {
    const hasAll = e.requiredBadges.every((bid) => profile.badges.some((b) => b.id === bid));
    if (!hasAll) return { eligible: false, reason: 'Eligibility requirements not met' };
  }
  if (profile.points < benefit.costPoints) return { eligible: false, reason: `Need ${benefit.costPoints - profile.points} more points` };
  return { eligible: true };
}

export async function fetchBenefitsCatalog(): Promise<Benefit[]> {
  assertApiConfigured();
  const res = await fetch(`${API}/benefits/catalog`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch benefits catalog: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<Benefit[]> | Benefit[];
  return unwrapData(data);
}

export async function fetchRedemptions(): Promise<RewardRedemption[]> {
  assertApiConfigured();
  const res = await fetch(`${API}/benefits/redemptions?userId=member-city-admin`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch redemptions: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<RewardRedemption[]> | RewardRedemption[];
  return unwrapData(data);
}

export function checkBenefitEligibility(
  benefitId: string,
  profile: MissionMemberProfile,
  catalog: Benefit[]
): { eligible: boolean; reason?: string } {
  const benefit = catalog.find((b) => b.id === benefitId);
  if (!benefit) return { eligible: false, reason: 'Benefit not found' };
  return checkEligibility(benefit, profile);
}

export async function redeemBenefit(
  benefitId: string,
  profile: MissionMemberProfile,
  catalog: Benefit[]
): Promise<{ success: boolean; redemption?: RewardRedemption; error?: string }> {
  const check = checkBenefitEligibility(benefitId, profile, catalog);
  if (!check.eligible) return { success: false, error: check.reason };

  assertApiConfigured();
  const res = await fetch(`${API}/benefits/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ benefitId, userId: 'member-city-admin', communityUserId: 'local-user' }),
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as ApiEnvelope<unknown>;
    return { success: false, error: payload.error?.message ?? `Redeem failed (${res.status})` };
  }

  const payload = (await res.json()) as ApiEnvelope<RewardRedemption> | RewardRedemption;
  return { success: true, redemption: unwrapData(payload) };
}

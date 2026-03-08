import type { MissionMemberProfile } from '../types';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type EngagementDomain = 'missions' | 'skills' | 'sectors' | 'playbooks';
type PlaybookAction = 'like' | 'save' | 'create';
type SkillAction = 'fit' | 'pathway';
type SectorAction = 'compare';

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

export async function fetchCommunityProfile(): Promise<MissionMemberProfile> {
  assertApiConfigured();
  const res = await fetch(`${API}/missions/profile`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch community profile');
  const data = (await res.json()) as ApiEnvelope<MissionMemberProfile> | MissionMemberProfile;
  return unwrapData(data);
}

export async function syncMissionStats(): Promise<MissionMemberProfile> {
  return fetchCommunityProfile();
}

export async function deductPointsForRedemption(_amount: number): Promise<MissionMemberProfile | null> {
  return fetchCommunityProfile();
}

export async function adjustDomainPoints(_domain: EngagementDomain, _delta: number): Promise<MissionMemberProfile> {
  return fetchCommunityProfile();
}

export async function adjustCommunityStreak(_delta: number): Promise<MissionMemberProfile> {
  return fetchCommunityProfile();
}

export async function recordSkillAction(skillId: string, action: SkillAction): Promise<MissionMemberProfile> {
  assertApiConfigured();
  const res = await fetch(`${API}/community/actions/skill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skillId, action, userId: 'local-user' }),
  });
  if (!res.ok) throw new Error(`Failed to record skill action: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<MissionMemberProfile> | MissionMemberProfile;
  return unwrapData(data);
}

export async function recordSectorAction(sectorId: string, action: SectorAction): Promise<MissionMemberProfile> {
  assertApiConfigured();
  const res = await fetch(`${API}/community/actions/sector`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectorId, action, userId: 'local-user' }),
  });
  if (!res.ok) throw new Error(`Failed to record sector action: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<MissionMemberProfile> | MissionMemberProfile;
  return unwrapData(data);
}

export async function recordPlaybookAction(playbookId: string, action: PlaybookAction, active: boolean): Promise<MissionMemberProfile> {
  assertApiConfigured();
  const res = await fetch(`${API}/community/actions/playbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playbookId, action, active, userId: 'local-user' }),
  });
  if (!res.ok) throw new Error(`Failed to record playbook action: ${res.status}`);
  const data = (await res.json()) as ApiEnvelope<MissionMemberProfile> | MissionMemberProfile;
  return unwrapData(data);
}

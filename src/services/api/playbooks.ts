import type { Playbook, CreatePlaybookPayload } from "../types";
import { recordPlaybookAction } from "./community-profile";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiEnvelope<T> = { success?: boolean; data?: T };
type PlaybooksListPayload = { playbooks?: unknown[] };
type ToggleLikePayload = { hasLiked: boolean; likes: number };
type ToggleSavePayload = { hasSaved: boolean; saves: number };

function normalizePlaybook(raw: any): Playbook {
  const createdAt = raw?.createdAt ?? new Date().toISOString();
  const steps = Array.isArray(raw?.steps)
    ? raw.steps.map((s: any, i: number) => ({
        order: typeof s?.order === "number" ? s.order : i + 1,
        instruction: String(s?.instruction ?? ""),
      }))
    : [];

  return {
    id: String(raw?.id ?? `playbook-${Date.now()}`),
    title: String(raw?.title ?? "Untitled Playbook"),
    summary: String(raw?.summary ?? ""),
    authorName: String(raw?.authorName ?? "Community"),
    authorAvatar: String(raw?.authorAvatar ?? ""),
    sectorId: String(raw?.sectorId ?? "other"),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(String) : [],
    likes: typeof raw?.likes === "number" ? raw.likes : 0,
    saves: typeof raw?.saves === "number" ? raw.saves : 0,
    createdAt,
    rewardPoints: typeof raw?.rewardPoints === "number" ? raw.rewardPoints : 20,
    estimatedHours: typeof raw?.estimatedHours === "number" ? raw.estimatedHours : Math.max(2, steps.length * 2),
    difficulty: raw?.difficulty === "starter" || raw?.difficulty === "operator" || raw?.difficulty === "advanced"
      ? raw.difficulty
      : "starter",
    impactSummary: String(raw?.impactSummary ?? "Community playbook ready for execution."),
    linkedSkills: Array.isArray(raw?.linkedSkills) ? raw.linkedSkills.map(String) : [],
    steps,
    hasLiked: Boolean(raw?.hasLiked),
    hasSaved: Boolean(raw?.hasSaved),
  };
}

function unwrapData<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in (payload as ApiEnvelope<T>)) {
    return ((payload as ApiEnvelope<T>).data ?? payload) as T;
  }
  return payload as T;
}

export async function fetchPlaybooks(): Promise<Playbook[]> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL not configured");
  const res = await fetch(`${API}/playbooks`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch playbooks");
  const payload = (await res.json()) as ApiEnvelope<PlaybooksListPayload | unknown[]> | PlaybooksListPayload | unknown[];
  const unwrapped = unwrapData(payload);
  const rawList = Array.isArray(unwrapped)
    ? unwrapped
    : ((unwrapped as PlaybooksListPayload)?.playbooks ?? []);
  return rawList.map(normalizePlaybook);
}

export async function createPlaybook(payload: CreatePlaybookPayload): Promise<Playbook> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL not configured");
  const body = {
    ...payload,
    id: `playbook-${Date.now()}`,
    authorName: "You",
    authorAvatar: "",
    rewardPoints: 18 + payload.steps.length * 2,
    estimatedHours: Math.max(4, payload.steps.length * 2),
    difficulty: payload.steps.length >= 5 ? "advanced" : payload.steps.length >= 3 ? "operator" : "starter",
    impactSummary: "Community-authored playbook ready to operationalize workforce improvements.",
    linkedSkills: payload.tags.slice(0, 4),
    hasLiked: false,
    hasSaved: false,
  };
  const res = await fetch(`${API}/playbooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create playbook");
  const data = (await res.json()) as ApiEnvelope<unknown> | unknown;
  const playbook = normalizePlaybook(unwrapData(data));
  try {
    await recordPlaybookAction(playbook.id, "create", true);
  } catch (err) {
    console.warn("Failed to sync playbook create action", err);
  }
  return playbook;
}

export async function likePlaybook(id: string): Promise<ToggleLikePayload> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL not configured");
  const res = await fetch(`${API}/playbooks/${id}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "local-user" }),
  });
  if (!res.ok) throw new Error(`Failed to like playbook ${id}`);
  const data = (await res.json()) as ApiEnvelope<ToggleLikePayload> | ToggleLikePayload;
  const result = unwrapData(data);
  try {
    await recordPlaybookAction(id, "like", result.hasLiked);
  } catch (err) {
    console.warn("Failed to sync playbook like action", err);
  }
  return result;
}

export async function savePlaybook(id: string): Promise<ToggleSavePayload> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL not configured");
  const res = await fetch(`${API}/playbooks/${id}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "local-user" }),
  });
  if (!res.ok) throw new Error(`Failed to save playbook ${id}`);
  const data = (await res.json()) as ApiEnvelope<ToggleSavePayload> | ToggleSavePayload;
  const result = unwrapData(data);
  try {
    await recordPlaybookAction(id, "save", result.hasSaved);
  } catch (err) {
    console.warn("Failed to sync playbook save action", err);
  }
  return result;
}

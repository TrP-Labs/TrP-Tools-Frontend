import { apiFetch, apiJson } from "./http";

interface GroupDetailApi {
  id: string;
  robloxId?: number | string;
  robloxName?: string;
  robloxIcon?: string | null;
  robloxDescription?: string | null;
  robloxMembers?: number | null;
}

export interface GroupSummary {
  id: string;
  robloxId: string;
  name: string;
  iconUrl: string | null;
  members: number | null;
  description?: string | null;
}

export interface GroupRankRecord {
  id: string;
  robloxId: string;
  cached_name: string;
  cached_rank: number;
  color: string;
  visible: boolean;
  permission_level: number;
  max_activity: number | null;
  min_activity: number | null;
  groupId: string;
}

function normalizeGroupDetailApi(input: unknown): GroupDetailApi | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  if (typeof obj.id === "string") {
    return {
      id: obj.id,
      robloxId:
        typeof obj.robloxId === "string" || typeof obj.robloxId === "number"
          ? obj.robloxId
          : undefined,
      robloxName: typeof obj.robloxName === "string" ? obj.robloxName : undefined,
      robloxIcon: typeof obj.robloxIcon === "string" ? obj.robloxIcon : null,
      robloxDescription: typeof obj.robloxDescription === "string" ? obj.robloxDescription : null,
      robloxMembers: typeof obj.robloxMembers === "number" ? obj.robloxMembers : null,
    };
  }
  return null;
}

function normalizeGroupSummary(detail: GroupDetailApi): GroupSummary {
  const robloxId = detail.robloxId !== undefined ? String(detail.robloxId) : detail.id;
  return {
    id: detail.id,
    robloxId,
    name: detail.robloxName ?? `Group ${robloxId}`,
    iconUrl: detail.robloxIcon ?? null,
    members: detail.robloxMembers ?? null,
    description: detail.robloxDescription ?? null,
  };
}

export async function fetchGroupDetail(groupId: string): Promise<GroupSummary | null> {
  try {
    const data = await apiJson<GroupDetailApi>(`/groups/${encodeURIComponent(groupId)}`);
    const normalized = normalizeGroupDetailApi(data);
    return normalized ? normalizeGroupSummary(normalized) : null;
  } catch (error) {
    console.warn(`Failed to fetch group detail for ${groupId}:`, error);
    return null;
  }
}

export async function fetchGroups(): Promise<GroupSummary[]> {
  const response = await apiJson<unknown>(`/groups/`);
  if (!Array.isArray(response)) {
    return [];
  }

  const results = await Promise.all(
    response.map(async (entry) => {
      if (typeof entry === "string" || typeof entry === "number") {
        return fetchGroupDetail(String(entry));
      }
      const normalized = normalizeGroupDetailApi(entry);
      if (normalized) {
        return normalizeGroupSummary(normalized);
      }
      return null;
    })
  );

  return results.filter((group): group is GroupSummary => Boolean(group));
}

export async function fetchCreatableGroups(): Promise<GroupSummary[]> {
  const response = await apiJson<unknown>(`/groups/creatable`);
  if (!Array.isArray(response)) {
    return [];
  }

  const results = await Promise.all(
    response.map(async (entry) => {
      if (typeof entry === "string" || typeof entry === "number") {
        const detail = await fetchGroupDetail(String(entry));
        if (detail) return detail;
        return {
          id: String(entry),
          robloxId: String(entry),
          name: `Group ${entry}`,
          iconUrl: null,
          members: null,
        };
      }
      const normalized = normalizeGroupDetailApi(entry);
      if (normalized) {
        return normalizeGroupSummary(normalized);
      }
      return null;
    })
  );

  return results.filter((group): group is GroupSummary => Boolean(group));
}

export async function createGroup(robloxId: string): Promise<{ id: string } | null> {
  try {
    return await apiJson<{ id: string }>(`/groups/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ robloxId }),
    });
  } catch (error) {
    console.error(`Failed to create group ${robloxId}:`, error);
    return null;
  }
}

function normalizeRankRecord(entry: unknown): GroupRankRecord | null {
  if (!entry || typeof entry !== "object") return null;
  const obj = entry as Record<string, unknown>;
  if (typeof obj.id !== "string" || typeof obj.robloxId === "undefined") return null;

  const groupId =
    typeof obj.groupId === "string"
      ? obj.groupId
      : typeof obj.group_id === "string"
        ? obj.group_id
        : "";

  return {
    id: obj.id,
    robloxId: String(obj.robloxId),
    cached_name: typeof obj.cached_name === "string" ? obj.cached_name : `Rank ${obj.robloxId}`,
    cached_rank: typeof obj.cached_rank === "number" ? obj.cached_rank : 0,
    color: typeof obj.color === "string" ? obj.color : "#ffffff",
    visible: Boolean(obj.visible),
    permission_level: typeof obj.permission_level === "number" ? obj.permission_level : 0,
    max_activity: typeof obj.max_activity === "number" ? obj.max_activity : null,
    min_activity: typeof obj.min_activity === "number" ? obj.min_activity : null,
    groupId,
  };
}

export interface CreatableGroupRank {
  robloxId: string;
  name: string;
  order: number;
}

function normalizeCreatableRank(entry: unknown): CreatableGroupRank | null {
  if (!entry || typeof entry !== "object") return null;
  const obj = entry as Record<string, unknown>;

  const robloxId =
    typeof obj.robloxId === "string"
      ? obj.robloxId
      : typeof obj.robloxId === "number"
        ? String(obj.robloxId)
        : null;

  const name = typeof obj.name === "string" ? obj.name : null;
  const order =
    typeof obj.order === "number"
      ? obj.order
      : typeof obj.order === "string"
        ? Number(obj.order)
        : null;

  if (!robloxId || !name || typeof order !== "number" || Number.isNaN(order)) {
    return null;
  }

  return {
    robloxId,
    name,
    order,
  };
}

export async function fetchGroupRankRecords(groupId: string): Promise<GroupRankRecord[]> {
  const response = await apiJson<unknown>(`/ranks/group/${encodeURIComponent(groupId)}`);
  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map(normalizeRankRecord)
    .filter((record): record is GroupRankRecord => Boolean(record));
}

export async function fetchRankRecord(rankId: string): Promise<GroupRankRecord | null> {
  try {
    const response = await apiJson<unknown>(`/ranks/${encodeURIComponent(rankId)}`);
    return normalizeRankRecord(response);
  } catch (error) {
    console.warn(`Failed to fetch rank record ${rankId}:`, error);
    return null;
  }
}

export async function fetchCreatableGroupRanks(groupId: string): Promise<CreatableGroupRank[]> {
  const response = await apiJson<unknown>(`/ranks/group/${encodeURIComponent(groupId)}/creatable`);
  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map(normalizeCreatableRank)
    .filter((value): value is CreatableGroupRank => Boolean(value));
}

export async function createGroupRankRecord(groupId: string, robloxId: string): Promise<GroupRankRecord | null> {
  try {
    const result = await apiJson<{ id: string }>(`/ranks/group/${encodeURIComponent(groupId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ robloxId }),
    });
    if (!result?.id) return null;
    return await fetchRankRecord(result.id);
  } catch (error) {
    console.error(`Failed to create rank record ${robloxId} for group ${groupId}:`, error);
    return null;
  }
}

type RankUpdatePayload = Partial<Pick<GroupRankRecord, "color" | "visible" | "permission_level" | "max_activity" | "min_activity">> & {
  refresh?: boolean;
};

export async function updateGroupRankRecord(rankId: string, updates: RankUpdatePayload): Promise<boolean> {
  try {
    const response = await apiFetch(`/ranks/${encodeURIComponent(rankId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return response.ok;
  } catch (error) {
    console.error(`Failed to update rank record ${rankId}:`, error);
    return false;
  }
}

export async function deleteGroupRankRecord(rankId: string): Promise<boolean> {
  try {
    const response = await apiFetch(`/ranks/${encodeURIComponent(rankId)}`, {
      method: "DELETE",
    });
    if (response.status === 404) {
      return false;
    }
    return response.ok || response.status === 204;
  } catch (error) {
    console.error(`Failed to delete rank record ${rankId}:`, error);
    return false;
  }
}

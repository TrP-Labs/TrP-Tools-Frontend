import { apiFetch, apiJson } from "./http";

export interface ActiveRoomSummary {
  roomId: string;
}

export interface RoomDetails extends ActiveRoomSummary {
  groupId: string;
  createdAt: string;
  creatorId: string;
  expiresAt: string;
  users: string[];
  vehicles: number;
}

type RoomIdResponse = {
  RoomID?: unknown;
};

type RoomDetailResponse = {
  groupID?: unknown;
  createdAt?: unknown;
  creatorID?: unknown;
  expires?: unknown;
  users?: unknown;
  vehicles?: unknown;
};

function normalizeRoomId(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const id = record.RoomID ?? record.roomId ?? record.roomID;
  return typeof id === "string" && id.trim() ? id : null;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }

  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  return null;
}

function normalizeRoomDetails(roomId: string, payload: RoomDetailResponse): RoomDetails | null {
  const group = payload.groupID;
  if (typeof group !== "string" || !group) return null;

  const creator = payload.creatorID;
  if (typeof creator !== "string" || !creator) return null;

  const createdAt = normalizeDate(payload.createdAt);
  const expiresAt = normalizeDate(payload.expires);

  if (!createdAt || !expiresAt) {
    return null;
  }

  const users = Array.isArray(payload.users)
    ? payload.users.filter((user): user is string => typeof user === "string" && user.trim().length > 0)
    : [];

  const vehicles = typeof payload.vehicles === "number" ? payload.vehicles : 0;

  return {
    roomId,
    groupId: group,
    creatorId: creator,
    createdAt,
    expiresAt,
    users,
    vehicles,
  };
}

export async function fetchGroupRoomId(groupId: string): Promise<string | null> {
  if (!groupId) return null;

  try {
    const response = await apiFetch(`/rooms/?GroupID=${encodeURIComponent(groupId)}`);
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(message);
    }

    const payload = (await response.json()) as RoomIdResponse;
    return normalizeRoomId(payload);
  } catch (error) {
    console.warn(`Failed to fetch active room for group ${groupId}:`, error);
    return null;
  }
}

export async function fetchRoomDetails(roomId: string): Promise<RoomDetails | null> {
  if (!roomId) return null;

  try {
    const response = await apiFetch(`/rooms/${encodeURIComponent(roomId)}`);
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(message);
    }

    const payload = (await response.json()) as RoomDetailResponse;
    return normalizeRoomDetails(roomId, payload);
  } catch (error) {
    console.warn(`Failed to fetch room details for ${roomId}:`, error);
    return null;
  }
}

export async function fetchGroupRoom(groupId: string): Promise<RoomDetails | null> {
  const roomId = await fetchGroupRoomId(groupId);
  if (!roomId) return null;
  return fetchRoomDetails(roomId);
}

export async function openRoomForEvent(eventId: string): Promise<string | null> {
  if (!eventId) return null;

  try {
    const payload = await apiJson<RoomIdResponse>(`/rooms/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ EventID: eventId }),
    });
    return normalizeRoomId(payload);
  } catch (error) {
    console.warn(`Failed to open room for event ${eventId}:`, error);
    return null;
  }
}

export async function closeRoom(roomId: string): Promise<boolean> {
  if (!roomId) return false;

  try {
    const response = await apiFetch(`/rooms/${encodeURIComponent(roomId)}`, {
      method: "DELETE",
    });
    if (response.status === 404) {
      return false;
    }
    return response.ok;
  } catch (error) {
    console.warn(`Failed to close room ${roomId}:`, error);
    return false;
  }
}

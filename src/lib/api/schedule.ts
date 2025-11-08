import { apiFetch, apiJson } from "./http";

export interface ShiftEvent {
  id: string;
  groupId: string;
  name: string;
  startTime: string | null;
  rrule: string | null;
  createdAt: string | null;
}

export interface CreateShiftEventPayload {
  name: string;
  startTime: string;
  rrule: string;
}

export type UpdateShiftEventPayload = Partial<CreateShiftEventPayload>;

type ShiftEventApi = {
  eventId?: unknown;
  id?: unknown;
  groupID?: unknown;
  groupId?: unknown;
  name?: unknown;
  startTime?: unknown;
  rrule?: unknown;
  createdAt?: unknown;
};

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

function normalizeShiftEvent(data: ShiftEventApi, fallbackId?: string): ShiftEvent | null {
  const rawId = data.eventId ?? data.id ?? fallbackId;
  if (typeof rawId !== "string" || !rawId) {
    return null;
  }

  const group = data.groupID ?? data.groupId;
  if (typeof group !== "string" || !group) {
    return null;
  }

  const name = typeof data.name === "string" && data.name.trim() ? data.name : `Shift ${rawId}`;
  const startTime = normalizeDate(data.startTime);
  const createdAt = normalizeDate(data.createdAt);
  const rrule = typeof data.rrule === "string" && data.rrule.trim() ? data.rrule : null;

  return {
    id: rawId,
    groupId: group,
    name,
    startTime,
    rrule,
    createdAt,
  };
}

export async function fetchGroupShiftEvents(groupId: string): Promise<ShiftEvent[]> {
  console.log(`trying to get shifts for ${groupId}`)
  if (!groupId) return [];
  try {
    const response = await apiFetch(`/schedule/?groupID=${encodeURIComponent(groupId)}`);
    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(message);
    }

    const data = (await response.json()) as unknown;
    return normalizeEventCollection(data, groupId) ?? [];
  } catch (error) {
    console.warn(`Failed to fetch shift events for group ${groupId}:`, error);
    return [];
  }
}

export async function fetchShiftEvent(eventId: string): Promise<ShiftEvent | null> {
  if (!eventId) return null;

  try {
    const response = await apiFetch(`/schedule/${encodeURIComponent(eventId)}/`);
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(message);
    }

    const data = (await response.json()) as ShiftEventApi;
    return normalizeShiftEvent(data, eventId);
  } catch (error) {
    console.warn(`Failed to fetch shift event ${eventId}:`, error);
    return null;
  }
}

export async function createShiftEvent(groupId: string, payload: CreateShiftEventPayload): Promise<ShiftEvent | null> {
  try {
    const response = await apiJson<{ id?: string }>(`/schedule/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupID: groupId,
        name: payload.name,
        startTime: payload.startTime,
        rrule: payload.rrule,
      }),
    });

    if (!response?.id) {
      return null;
    }

    return await fetchShiftEvent(response.id);
  } catch (error) {
    console.warn(`Failed to create shift event for group ${groupId}:`, error);
    return null;
  }
}

export async function updateShiftEvent(eventId: string, updates: UpdateShiftEventPayload): Promise<boolean> {
  if (!eventId) return false;

  try {
    const response = await apiFetch(`/schedule/${encodeURIComponent(eventId)}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (response.status === 404) {
      return false;
    }

    return response.ok;
  } catch (error) {
    console.warn(`Failed to update shift event ${eventId}:`, error);
    return false;
  }
}

export async function deleteShiftEvent(eventId: string): Promise<boolean> {
  if (!eventId) return false;

  try {
    const response = await apiFetch(`/schedule/${encodeURIComponent(eventId)}/`, {
      method: "DELETE",
    });

    if (response.status === 404) {
      return false;
    }

    return response.ok || response.status === 204;
  } catch (error) {
    console.warn(`Failed to delete shift event ${eventId}:`, error);
    return false;
  }
}

function normalizeEventCollection(input: unknown, groupId: string): ShiftEvent[] | null {
  const normalizeList = (list: unknown[]): ShiftEvent[] =>
    list
      .map((item) => (item ?? null) as ShiftEventApi)
      .map((item) => normalizeShiftEvent(item))
      .filter((event): event is ShiftEvent => Boolean(event))
      .filter((event) => event.groupId === groupId);

  if (Array.isArray(input)) {
    return normalizeList(input);
  }

  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    if (Array.isArray(record.events)) {
      return normalizeList(record.events);
    }
    if (Array.isArray(record.data)) {
      return normalizeList(record.data);
    }
  }

  return null;
}

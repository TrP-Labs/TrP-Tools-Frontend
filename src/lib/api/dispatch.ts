import { apiFetch, apiJson, buildApiUrl } from "./http";

export interface DispatchVehicle {
  id: string;
  ownerId: string;
  name: string;
  depot: string;
  route: string | null;
  assigned: boolean;
  towing: boolean;
}

export interface DispatchVehicleSeed {
  Id: string | number;
  OwnerId: string | number;
  Name: string;
  Depot: string;
}

export interface DispatchVehicleUpdate {
  route?: string | null;
  assigned?: boolean;
  towing?: boolean;
}

export type DispatchEvent =
  | { type: "add"; vehicle: DispatchVehicle }
  | { type: "update"; vehicleId: string; patch: DispatchVehicleUpdate }
  | { type: "delete"; vehicleId: string }
  | { type: "heartbeat" };

interface RawVehicleRecord extends Partial<DispatchVehicleSeed> {
  Id?: unknown;
  OwnerId?: unknown;
  Name?: unknown;
  Depot?: unknown;
  route?: unknown;
  assigned?: unknown;
  towing?: unknown;
}

interface RawUpdateRecord extends Partial<DispatchVehicleUpdate> {
  id?: unknown;
  route?: unknown;
  assigned?: unknown;
  towing?: unknown;
}

interface StreamEnvelope<T = unknown> {
  event?: unknown;
  data?: T;
}

function coerceId(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function coerceString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function coerceBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  }
  if (typeof value === "number") {
    if (Number.isNaN(value)) return false;
    return value !== 0;
  }
  return false;
}

export function normalizeDispatchVehicle(input: unknown): DispatchVehicle | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const record = input as RawVehicleRecord;
  const id = coerceId(record.Id);
  const ownerId = coerceId(record.OwnerId);
  const name = coerceString(record.Name);
  const depot = coerceString(record.Depot);

  if (!id || !ownerId || !name || !depot) {
    return null;
  }

  return {
    id,
    ownerId,
    name,
    depot,
    route: coerceString(record.route),
    assigned: coerceBoolean(record.assigned),
    towing: coerceBoolean(record.towing),
  };
}

export async function fetchDispatchVehicles(roomId: string): Promise<DispatchVehicle[]> {
  if (!roomId) return [];

  try {
    const response = await apiFetch(`/dispatch/${encodeURIComponent(roomId)}/`);

    if (response.status === 204) {
      return [];
    }

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(message);
    }

    const text = await response.text();
    if (!text.trim()) {
      return [];
    }

    const payload = JSON.parse(text);
    if (!Array.isArray(payload)) {
      return [];
    }
    return payload
      .map((entry) => normalizeDispatchVehicle(entry))
      .filter((vehicle): vehicle is DispatchVehicle => Boolean(vehicle));
  } catch (error) {
    console.warn(`Failed to fetch dispatch vehicles for room ${roomId}:`, error);
    return [];
  }
}

export async function updateDispatchVehicle(
  roomId: string,
  vehicleId: string,
  changes: DispatchVehicleUpdate
): Promise<void> {
  if (!roomId || !vehicleId) return;

  const body: Record<string, unknown> = {};
  if ("route" in changes) {
    body.route = changes.route ?? null;
  }
  if ("assigned" in changes) {
    body.assigned = Boolean(changes.assigned);
  }
  if ("towing" in changes) {
    body.towing = Boolean(changes.towing);
  }

  if (Object.keys(body).length === 0) {
    return;
  }

  const response = await apiFetch(`/dispatch/${encodeURIComponent(roomId)}/vehicle/${encodeURIComponent(vehicleId)}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    const error = new Error(`Failed to update vehicle ${vehicleId}: ${message}`);
    console.error(error.message);
    throw error;
  }
}

export async function deleteDispatchVehicle(roomId: string, vehicleId: string): Promise<void> {
  if (!roomId || !vehicleId) return;

  const response = await apiFetch(`/dispatch/${encodeURIComponent(roomId)}/vehicle/${encodeURIComponent(vehicleId)}/`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 404) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Failed to delete vehicle ${vehicleId}: ${message}`);
  }
}

export async function importDispatchVehicles(roomId: string, vehicles: DispatchVehicleSeed[]): Promise<void> {
  if (!roomId || vehicles.length === 0) return;

  const payload = vehicles.map((vehicle) => ({
    Id: vehicle.Id,
    OwnerId: vehicle.OwnerId,
    Name: vehicle.Name,
    Depot: vehicle.Depot,
  }));

  const response = await apiFetch(`/dispatch/${encodeURIComponent(roomId)}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Failed to import vehicles: ${message}`);
  }
}

export function parseDispatchStreamEvent(data: string): DispatchEvent | null {
  if (!data) return null;

  try {
    const payload = JSON.parse(data) as StreamEnvelope;
    const eventType = typeof payload.event === "string" ? payload.event.trim().toUpperCase() : "";

    switch (eventType) {
      case "ADD": {
        const normalized = normalizeDispatchVehicle(payload.data);
        return normalized ? { type: "add", vehicle: normalized } : null;
      }
      case "UPDATE": {
        const updatePayload = payload.data as RawUpdateRecord;
        const id = coerceId(updatePayload.id ?? (updatePayload as RawVehicleRecord)?.Id);
        if (!id) return null;
        const patch: DispatchVehicleUpdate = {};
        if ("route" in updatePayload) {
          patch.route = coerceString(updatePayload.route);
        }
        if ("assigned" in updatePayload) {
          patch.assigned = coerceBoolean(updatePayload.assigned);
        }
        if ("towing" in updatePayload) {
          patch.towing = coerceBoolean(updatePayload.towing);
        }
        return { type: "update", vehicleId: id, patch };
      }
      case "DELETE": {
        const vehicleId = coerceString(payload.data);
        return vehicleId ? { type: "delete", vehicleId } : null;
      }
      case "HEARTBEAT": {
        return { type: "heartbeat" };
      }
      default:
        return null;
    }
  } catch (error) {
    console.warn("Failed to parse dispatch stream event:", error);
    return null;
  }
}

export function buildDispatchStreamUrl(roomId: string): string {
  if (!roomId) {
    throw new Error("roomId is required to build dispatch stream URL");
  }
  return buildApiUrl(`/dispatch/${encodeURIComponent(roomId)}/connect`);
}

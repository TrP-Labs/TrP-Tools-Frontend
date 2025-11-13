import { apiFetch, apiJson } from "./http";

export interface RouteRecord {
  id: string;
  name: string;
  description: string;
  color: string;
  groupId: string;
}

export interface CreateRoutePayload {
  name: string;
  description: string;
  color: string;
  groupId: string;
}

export type UpdateRoutePayload = Partial<Pick<RouteRecord, "name" | "description" | "color">>;

function normalizeRoute(entry: unknown): RouteRecord | null {
  if (!entry || typeof entry !== "object") return null;
  const obj = entry as Record<string, unknown>;

  const id =
    typeof obj.id === "string"
      ? obj.id
      : typeof obj.ID === "string"
        ? obj.ID
        : null;

  if (!id) return null;

  const name =
    typeof obj.Name === "string"
      ? obj.Name
      : typeof obj.name === "string"
        ? obj.name
        : "";

  const description =
    typeof obj.Description === "string"
      ? obj.Description
      : typeof obj.description === "string"
        ? obj.description
        : "";

  const color =
    typeof obj.Color === "string"
      ? obj.Color
      : typeof obj.color === "string"
        ? obj.color
        : "#000000";

  const groupId =
    typeof obj.GroupId === "string"
      ? obj.GroupId
      : typeof obj.groupId === "string"
        ? obj.groupId
        : "";

  return {
    id,
    name,
    description,
    color,
    groupId,
  };
}

export async function fetchRoutes(groupId: string): Promise<RouteRecord[]> {
  if (!groupId) {
    return [];
  }

  const searchParams = new URLSearchParams({ GroupId: groupId });
  try {
    const response = await apiJson<unknown>(`/routes/?${searchParams.toString()}`);
    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .map(normalizeRoute)
      .filter((route): route is RouteRecord => Boolean(route));
  } catch (error) {
    console.error(`Failed to fetch routes for group ${groupId}:`, error);
    return [];
  }
}

export async function createRoute(payload: CreateRoutePayload): Promise<boolean> {
  try {
    const response = await apiFetch(`/routes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Name: payload.name,
        Description: payload.description,
        Color: payload.color,
        GroupId: payload.groupId,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Failed to create route for group ${payload.groupId}:`, error);
    return false;
  }
}

export async function updateRoute(routeId: string, updates: UpdateRoutePayload): Promise<boolean> {
  const body: Record<string, string> = {};
  if (typeof updates.name === "string") body.Name = updates.name;
  if (typeof updates.description === "string") body.Description = updates.description;
  if (typeof updates.color === "string") body.Color = updates.color;

  if (!Object.keys(body).length) {
    return true;
  }

  try {
    const response = await apiFetch(`/routes/${encodeURIComponent(routeId)}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch (error) {
    console.error(`Failed to update route ${routeId}:`, error);
    return false;
  }
}

export async function deleteRoute(routeId: string): Promise<boolean> {
  try {
    const response = await apiFetch(`/routes/${encodeURIComponent(routeId)}/`, {
      method: "DELETE",
    });
    if (response.status === 404) {
      return false;
    }
    return response.ok || response.status === 204;
  } catch (error) {
    console.error(`Failed to delete route ${routeId}:`, error);
    return false;
  }
}

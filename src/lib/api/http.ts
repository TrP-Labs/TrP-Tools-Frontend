import { config } from "../config";

const apiBaseUrl = config.apiBaseUrl;

const isServer = typeof window === "undefined";

async function buildServerCookieHeader(): Promise<string | undefined> {
  if (!isServer) return undefined;

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const pairs = cookieStore
    .getAll()
    .filter(({ name }) => !name.startsWith("__next"))
    .map(({ name, value }) => `${name}=${value}`);

  return pairs.length > 0 ? pairs.join("; ") : undefined;
}

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const url = buildApiUrl(input);
  const headers = new Headers(init.headers ?? undefined);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (isServer) {
    const cookieHeader = await buildServerCookieHeader();
    if (cookieHeader && !headers.has("Cookie")) {
      headers.set("Cookie", cookieHeader);
    }
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: init.cache ?? "no-store",
  });
}

export async function apiJson<T>(input: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(input, init);

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`API request failed (${response.status}): ${message}`);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

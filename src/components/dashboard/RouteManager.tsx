"use client";

import React from "react";
import PageBox from "./PageBox";
import RouteBadge from "./RouteBadge";
import type { RouteRecord, UpdateRoutePayload } from "@/lib/api/routes";

interface RouteManagerProps {
  routes: RouteRecord[];
  onCreate: (draft: { name: string; description: string; color: string }) => void;
  onUpdate: (routeId: string, updates: UpdateRoutePayload) => void;
  onDelete: (routeId: string) => void;
  onRefresh?: () => void;
  isCreating?: boolean;
  busyRouteId?: string | null;
  statusMessage?: string | null;
  error?: string | null;
  isRefreshing?: boolean;
}

const DEFAULT_NEW_ROUTE = {
  name: "",
  description: "",
  color: "#000000",
};

const RouteManager: React.FC<RouteManagerProps> = ({
  routes,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
  isCreating = false,
  busyRouteId = null,
  statusMessage,
  error,
  isRefreshing = false,
}) => {
  const [newRoute, setNewRoute] = React.useState(DEFAULT_NEW_ROUTE);

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newRoute.name.trim()) return;
    onCreate(newRoute);
    setNewRoute(DEFAULT_NEW_ROUTE);
  };

  return (
    <div className="space-y-8">
      <PageBox className="bg-background/60 border border-border">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <RouteBadge label={newRoute.name || "??"} color={newRoute.color} size="lg" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary mb-1">Create Route</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Names longer than 3 characters are clipped. Should match exact name in TrP
            </p>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Route Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={newRoute.name}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="ex: 1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Color
                </label>
                <input
                  type="color"
                  value={newRoute.color}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, color: e.target.value }))}
                  className="h-12 w-full cursor-pointer rounded border border-border bg-background"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={newRoute.description}
                  onChange={(e) => setNewRoute((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="Add context that helps people understand this route."
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={!newRoute.name.trim() || isCreating}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-semibold disabled:opacity-60"
                >
                  {isCreating ? "Creating..." : "Create Route"}
                </button>
                {statusMessage && (
                  <span className="text-sm text-green-500">{statusMessage}</span>
                )}
                {error && (
                  <span className="text-sm text-red-500">{error}</span>
                )}
              </div>
            </form>
          </div>
        </div>
      </PageBox>

      <PageBox className="bg-background/60 border border-border">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary">Route Editor</h2>
            <p className="text-sm text-muted-foreground">
              Update route names, descriptions, and badge colors. Use the badges to match dispatch colors exactly.
            </p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="self-start rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-background disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing…" : "Refresh List"}
            </button>
          )}
        </div>
        {isRefreshing && !onRefresh && (
          <div className="text-sm text-muted-foreground mb-4">Refreshing routes…</div>
        )}
        <div className="space-y-4">
          {routes.length === 0 && (
            <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
              No routes yet. Create the first route to get started.
            </div>
          )}
          {routes.map((route) => (
            <EditableRouteCard
              key={route.id}
              route={route}
              onUpdate={onUpdate}
              onDelete={onDelete}
              busy={busyRouteId === route.id}
            />
          ))}
        </div>
      </PageBox>
    </div>
  );
};

interface EditableRouteCardProps {
  route: RouteRecord;
  onUpdate: (routeId: string, updates: UpdateRoutePayload) => void;
  onDelete: (routeId: string) => void;
  busy: boolean;
}

const EditableRouteCard: React.FC<EditableRouteCardProps> = ({ route, onUpdate, onDelete, busy }) => {
  const [name, setName] = React.useState(route.name);
  const [description, setDescription] = React.useState(route.description);
  const [color, setColor] = React.useState(route.color || "#000000");

  React.useEffect(() => {
    setName(route.name);
  }, [route.name]);

  React.useEffect(() => {
    setDescription(route.description);
  }, [route.description]);

  React.useEffect(() => {
    setColor(route.color || "#000000");
  }, [route.color]);

  const hasChanges =
    name.trim() !== route.name.trim() ||
    description !== route.description ||
    color !== route.color;

  const handleSave = () => {
    if (!hasChanges) return;
    onUpdate(route.id, { name: name.trim(), description, color });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card/40 p-4 md:flex-row md:items-center">
      <div className="flex items-center justify-center md:w-40">
        <RouteBadge label={name || route.name} color={color} size="lg" />
      </div>
      <div className="flex-1 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Route Name
          </label>
          <input
            type="text"
            value={name}
            maxLength={10}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-xs text-muted-foreground">1-2 characters stays circular. Longer names become rectangles.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Badge Color
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-12 w-full cursor-pointer rounded border border-border bg-background"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>
      </div>
      <div className="flex flex-row gap-3 md:flex-col md:justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || busy}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(route.id)}
          disabled={busy}
          className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-60"
        >
          {busy ? "Working..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default RouteManager;

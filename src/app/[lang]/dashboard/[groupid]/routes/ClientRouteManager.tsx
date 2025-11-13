"use client";

import React from "react";
import RouteManager from "@/components/dashboard/RouteManager";
import type { RouteRecord, UpdateRoutePayload } from "@/lib/api/routes";
import { createRoute, deleteRoute, fetchRoutes, updateRoute } from "@/lib/api/routes";

interface ClientRouteManagerProps {
  groupId: string;
  initialRoutes: RouteRecord[];
}

const ClientRouteManager: React.FC<ClientRouteManagerProps> = ({ groupId, initialRoutes }) => {
  const [routes, setRoutes] = React.useState<RouteRecord[]>(initialRoutes);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [busyRouteId, setBusyRouteId] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    setRoutes(initialRoutes);
  }, [initialRoutes]);

  React.useEffect(() => {
    if (!statusMessage) return;
    const timeout = setTimeout(() => setStatusMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const refreshRoutes = React.useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) setIsRefreshing(true);
      setError(null);
      try {
        const next = await fetchRoutes(groupId);
        setRoutes(next);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch routes.";
        setError(message);
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [groupId]
  );

  const handleCreate = async (draft: { name: string; description: string; color: string }) => {
    setIsCreating(true);
    setError(null);
    const success = await createRoute({
      ...draft,
      groupId,
    });
    if (!success) {
      setError("Unable to create route. Check the details and try again.");
    } else {
      setStatusMessage("Route created.");
    }
    await refreshRoutes({ silent: true });
    setIsCreating(false);
  };

  const handleUpdate = async (routeId: string, updates: UpdateRoutePayload) => {
    setBusyRouteId(routeId);
    setError(null);
    const success = await updateRoute(routeId, updates);
    if (!success) {
      setError("Unable to save route changes.");
    } else {
      setStatusMessage("Route updated.");
    }
    await refreshRoutes({ silent: true });
    setBusyRouteId(null);
  };

  const handleDelete = async (routeId: string) => {
    setBusyRouteId(routeId);
    setError(null);
    const success = await deleteRoute(routeId);
    if (!success) {
      setError("Unable to delete route.");
    } else {
      setStatusMessage("Route deleted.");
    }
    await refreshRoutes({ silent: true });
    setBusyRouteId(null);
  };

  return (
    <RouteManager
      routes={routes}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onRefresh={() => refreshRoutes()}
      isCreating={isCreating}
      busyRouteId={busyRouteId}
      statusMessage={statusMessage}
      error={error}
      isRefreshing={isRefreshing}
    />
  );
};

export default ClientRouteManager;

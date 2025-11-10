"use client";

import * as React from "react";
import {
  buildDispatchStreamUrl,
  DispatchEvent,
  DispatchVehicle,
  DispatchVehicleUpdate,
  fetchDispatchVehicles,
  parseDispatchStreamEvent,
} from "@/lib/api/dispatch";

type VehiclesRecord = Record<string, DispatchVehicle>;

interface VehiclesState {
  entries: VehiclesRecord;
  lastHeartbeat: number | null;
}

type VehiclesAction =
  | { type: "reset" }
  | { type: "replace"; vehicles: DispatchVehicle[] }
  | { type: "upsert"; vehicle: DispatchVehicle }
  | { type: "patch"; vehicleId: string; patch: DispatchVehicleUpdate }
  | { type: "remove"; vehicleId: string }
  | { type: "heartbeat" };

export type DispatchConnectionStatus = "offline" | "loading" | "connecting" | "connected" | "error";

export interface UseDispatchVehiclesResult {
  vehicles: DispatchVehicle[];
  loading: boolean;
  error: string | null;
  status: DispatchConnectionStatus;
  lastHeartbeat: number | null;
  refresh: () => Promise<void>;
  applyLocalPatch: (vehicleId: string, patch: DispatchVehicleUpdate) => void;
  removeLocalVehicle: (vehicleId: string) => void;
  upsertLocalVehicle: (vehicle: DispatchVehicle) => void;
}

const initialState: VehiclesState = {
  entries: {},
  lastHeartbeat: null,
};

function vehiclesReducer(state: VehiclesState, action: VehiclesAction): VehiclesState {
  switch (action.type) {
    case "reset":
      return initialState;
    case "replace": {
      const entries = action.vehicles.reduce<VehiclesRecord>((acc, vehicle) => {
        acc[vehicle.id] = vehicle;
        return acc;
      }, {});
      return { ...state, entries };
    }
    case "upsert": {
      if (state.entries[action.vehicle.id] === action.vehicle) {
        return state;
      }
      return {
        ...state,
        entries: {
          ...state.entries,
          [action.vehicle.id]: action.vehicle,
        },
      };
    }
    case "patch": {
      const current = state.entries[action.vehicleId];
      if (!current) return state;
      const next: DispatchVehicle = {
        ...current,
        ...(action.patch.route !== undefined ? { route: action.patch.route ?? null } : {}),
        ...(action.patch.assigned !== undefined ? { assigned: Boolean(action.patch.assigned) } : {}),
        ...(action.patch.towing !== undefined ? { towing: Boolean(action.patch.towing) } : {}),
      };
      if (next === current) {
        return state;
      }
      return {
        ...state,
        entries: {
          ...state.entries,
          [action.vehicleId]: next,
        },
      };
    }
    case "remove": {
      if (!state.entries[action.vehicleId]) {
        return state;
      }
      const entries = { ...state.entries };
      delete entries[action.vehicleId];
      return { ...state, entries };
    }
    case "heartbeat":
      return { ...state, lastHeartbeat: Date.now() };
    default:
      return state;
  }
}

function handleEvent(dispatch: React.Dispatch<VehiclesAction>, event: DispatchEvent | null) {
  if (!event) return;
  switch (event.type) {
    case "add":
      dispatch({ type: "upsert", vehicle: event.vehicle });
      break;
    case "update":
      dispatch({ type: "patch", vehicleId: event.vehicleId, patch: event.patch });
      break;
    case "delete":
      dispatch({ type: "remove", vehicleId: event.vehicleId });
      break;
    case "heartbeat":
      dispatch({ type: "heartbeat" });
      break;
    default:
      break;
  }
}

export function useDispatchVehicles(roomId: string | null): UseDispatchVehiclesResult {
  const [state, dispatch] = React.useReducer(vehiclesReducer, initialState);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<DispatchConnectionStatus>(roomId ? "loading" : "offline");

  const refresh = React.useCallback(async () => {
    if (!roomId) {
      return;
    }
    setLoading(true);
    try {
      const vehicles = await fetchDispatchVehicles(roomId);
      dispatch({ type: "replace", vehicles });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load vehicles";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  React.useEffect(() => {
    dispatch({ type: "reset" });
    if (!roomId) {
      setStatus("offline");
      setError(null);
      setLoading(false);
      return;
    }
    setStatus("loading");
    void refresh();
  }, [roomId, refresh]);

  React.useEffect(() => {
    if (!roomId || typeof window === "undefined") {
      return;
    }

    let cancelled = false;
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    function setup() {
      if (cancelled) return;
      setStatus((prev) => (prev === "loading" ? "loading" : "connecting"));

      try {
        source = new EventSource(buildDispatchStreamUrl(roomId), { withCredentials: true });
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to open dispatch stream");
        scheduleRetry();
        return;
      }

      source.onopen = () => {
        attempt = 0;
        setStatus("connected");
      };

      source.onmessage = (event) => {
        handleEvent(dispatch, parseDispatchStreamEvent(event.data));
      };

      source.onerror = () => {
        if (cancelled) {
          return;
        }
        setStatus("error");
        setError("Lost connection to dispatch stream.");
        source?.close();
        scheduleRetry();
      };
    }

    function scheduleRetry() {
      if (cancelled) return;
      const backoff = Math.min(30000, 1000 * 2 ** attempt);
      attempt += 1;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      retryTimer = setTimeout(() => {
        setup();
      }, backoff);
    }

    setup();

    return () => {
      cancelled = true;
      if (source) {
        source.close();
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [roomId]);

  const applyLocalPatch = React.useCallback(
    (vehicleId: string, patch: DispatchVehicleUpdate) => {
      dispatch({ type: "patch", vehicleId, patch });
    },
    [dispatch]
  );

  const removeLocalVehicle = React.useCallback(
    (vehicleId: string) => {
      dispatch({ type: "remove", vehicleId });
    },
    [dispatch]
  );

  const upsertLocalVehicle = React.useCallback(
    (vehicle: DispatchVehicle) => {
      dispatch({ type: "upsert", vehicle });
    },
    [dispatch]
  );

  const vehicles = React.useMemo(() => {
    return Object.values(state.entries).sort((a, b) => {
      const byName = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      if (byName !== 0) return byName;
      return a.id.localeCompare(b.id, undefined, { sensitivity: "base" });
    });
  }, [state.entries]);

  return {
    vehicles,
    loading,
    error,
    status,
    lastHeartbeat: state.lastHeartbeat,
    refresh,
    applyLocalPatch,
    removeLocalVehicle,
    upsertLocalVehicle,
  };
}

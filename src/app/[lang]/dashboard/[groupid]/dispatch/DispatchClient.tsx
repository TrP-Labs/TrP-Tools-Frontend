"use client";

import * as React from "react";
import PageBox from "@/components//dashboard//PageBox";
import { useDispatchVehicles, type DispatchConnectionStatus } from "@/hooks/useDispatchVehicles";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import {
  categorizeVehicleByName,
  groupVehiclesByCategory,
  orderedCategories,
  VEHICLE_CATEGORY_LABELS,
  type VehicleCategory,
} from "@/lib/dispatch/categories";
import {
  deleteDispatchVehicle,
  DispatchVehicle,
  DispatchVehicleSeed,
  importDispatchVehicles,
  updateDispatchVehicle,
} from "@/lib/api/dispatch";
interface DispatchClientProps {
  groupId: string;
  groupName: string | null;
  initialRoomId: string | null;
}

type BannerState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

const CATEGORY_SEQUENCE = orderedCategories();

const HOTKEYS = [
  { combo: "⌘/Ctrl + K or /", description: "Focus vehicle search" },
  { combo: "Arrow ↑ / ↓", description: "Move through vehicles" },
  { combo: "Alt + Arrow ←/→", description: "Cycle between sections" },
  { combo: "Alt + 1-4", description: "Jump directly to Service/Staff/Trolley/Other" },
  { combo: "Shift + R", description: "Focus the selected vehicle's route" },
  { combo: "Shift + A", description: "Toggle assigned on focused row" },
  { combo: "Shift + T", description: "Toggle towing on focused row" },
  { combo: "Shift + Delete", description: "Remove focused vehicle" },
  { combo: "Enter", description: "Save the current route input" },
  { combo: "Esc", description: "Clear selection / revert draft" },
];

const mapHotkeys = (...combos: string[]) =>
  combos
    .map((combo) => HOTKEYS.find((hotkey) => hotkey.combo === combo))
    .filter((entry): entry is (typeof HOTKEYS)[number] => Boolean(entry));

const CONTROL_SECTIONS = [
  {
    title: "Search & Focus",
    description: "Target vehicles quickly and lock onto their route inputs.",
    items: mapHotkeys("⌘/Ctrl + K or /", "Shift + R", "Enter", "Esc"),
  },
  {
    title: "Navigation",
    description: "Move through the live list without leaving the keyboard.",
    items: mapHotkeys("Arrow ↑ / ↓", "Alt + Arrow ←/→", "Alt + 1-4"),
  },
  {
    title: "Assignments",
    description: "Flip staffing and towing flags on the focused vehicle.",
    items: mapHotkeys("Shift + A", "Shift + T"),
  },
  {
    title: "Management",
    description: "Perform vehicle-level maintenance actions.",
    items: mapHotkeys("Shift + Delete"),
  },
];

const STATUS_STYLES: Record<DispatchConnectionStatus, { label: string; className: string }> = {
  offline: { label: "Offline", className: "bg-zinc-500/20 text-zinc-200 border border-zinc-600/40" },
  loading: { label: "Loading", className: "bg-blue-500/20 text-blue-200 border border-blue-600/40" },
  connecting: { label: "Connecting", className: "bg-amber-500/20 text-amber-200 border border-amber-600/40" },
  connected: { label: "Live", className: "bg-emerald-500/20 text-emerald-200 border border-emerald-600/40" },
  error: { label: "Retrying", className: "bg-red-500/20 text-red-200 border border-red-600/40" },
};

const INPUT_BASE =
  "rounded-md border border-[var(--background-muted)] bg-[var(--background-secondary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

const LABEL_BASE = "text-xs uppercase tracking-wide text-[var(--text-muted)]";

const CATEGORY_DESCRIPTIONS: Record<VehicleCategory, string> = {
  service: "Support and utility equipment that often coordinate recoveries.",
  staff: "Staff mobility and escort units.",
  trolleybus: "Revenue vehicles requiring quick routing.",
  other: "Everything else that still needs tracking.",
};

function sanitizeRoomId(value: string): string {
  return value.trim();
}

function parseVehicleSeeds(payload: string): DispatchVehicleSeed[] {
  const data = JSON.parse(payload);
  if (!Array.isArray(data)) {
    throw new Error("The provided JSON must be an array of vehicles.");
  }

  const seeds: DispatchVehicleSeed[] = [];

  data.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Vehicle #${index + 1} is not an object.`);
    }
    const record = entry as Record<string, unknown>;
    const id = record.Id ?? record.id;
    const ownerId = record.OwnerId ?? record.ownerId;
    const name =
      typeof record.Name === "string"
        ? record.Name
        : typeof record.name === "string"
          ? record.name
          : null;
    const depot =
      typeof record.Depot === "string"
        ? record.Depot
        : typeof record.depot === "string"
          ? record.depot
          : null;

    if ((!id && id !== 0) || (!ownerId && ownerId !== 0) || !name || !depot) {
      throw new Error(`Vehicle #${index + 1} is missing Id, OwnerId, Name, or Depot.`);
    }

    seeds.push({
      Id: id as string | number,
      OwnerId: ownerId as string | number,
      Name: name,
      Depot: depot,
    });
  });

  if (seeds.length === 0) {
    throw new Error("No vehicles found in the provided JSON.");
  }

  return seeds;
}

const DispatchClient: React.FC<DispatchClientProps> = ({ groupId, groupName, initialRoomId }) => {
  const [banner, setBanner] = React.useState<BannerState>(null);
  const [importing, setImporting] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [controlsOpen, setControlsOpen] = React.useState(false);
  const [focusedVehicleId, setFocusedVehicleId] = React.useState<string | null>(null);
  const [pendingVehicles, setPendingVehicles] = React.useState<Record<string, boolean>>({});
  const [draftRoutes, setDraftRoutes] = React.useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = React.useState<VehicleCategory | null>(null);

  const activeRouteRef = React.useRef<string | null>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const routeInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const vehicleRowRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const connectedRoomId = React.useMemo(() => {
    const trimmed = sanitizeRoomId(initialRoomId ?? "");
    return trimmed || null;
  }, [initialRoomId]);
  const {
    vehicles,
    status,
    error,
    refresh,
    applyLocalPatch,
    removeLocalVehicle,
  } = useDispatchVehicles(connectedRoomId);

  const ownerIds = React.useMemo(() => vehicles.map((vehicle) => vehicle.ownerId), [vehicles]);
  const { profiles: ownerProfiles } = useUserProfiles(ownerIds);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredVehicles = React.useMemo(() => {
    if (!normalizedSearch) {
      return vehicles;
    }
    return vehicles.filter((vehicle) => {
      const owner = ownerProfiles[vehicle.ownerId];
      const haystack = [
        vehicle.id,
        vehicle.name,
        vehicle.depot,
        vehicle.route ?? "",
        owner?.displayName ?? "",
        owner?.username ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [vehicles, normalizedSearch, ownerProfiles]);

  const grouped = React.useMemo(
    () => groupVehiclesByCategory(filteredVehicles),
    [filteredVehicles]
  );

  const vehicleOrder = React.useMemo(() => filteredVehicles.map((vehicle) => vehicle.id), [filteredVehicles]);

  const vehicleMeta = React.useMemo(() => {
    const meta: Record<string, { index: number; category: VehicleCategory }> = {};
    filteredVehicles.forEach((vehicle, index) => {
      meta[vehicle.id] = { index, category: categorizeVehicleByName(vehicle.name) };
    });
    return meta;
  }, [filteredVehicles]);

  const totalVisible = filteredVehicles.length;

  React.useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 4500);
    return () => clearTimeout(timer);
  }, [banner]);

  React.useEffect(() => {
    setDraftRoutes((prev) => {
      const next = { ...prev };
      const seen = new Set<string>();
      vehicles.forEach((vehicle) => {
        seen.add(vehicle.id);
        if (activeRouteRef.current === vehicle.id) {
          return;
        }
        const incoming = vehicle.route ?? "";
        if (next[vehicle.id] !== incoming) {
          next[vehicle.id] = incoming;
        }
      });
      Object.keys(next).forEach((id) => {
        if (!seen.has(id)) {
          delete next[id];
        }
      });
      return next;
    });
  }, [vehicles]);

  React.useEffect(() => {
    const idSet = new Set(filteredVehicles.map((vehicle) => vehicle.id));
    Object.keys(routeInputRefs.current).forEach((id) => {
      if (!idSet.has(id)) {
        delete routeInputRefs.current[id];
      }
    });
    Object.keys(vehicleRowRefs.current).forEach((id) => {
      if (!idSet.has(id)) {
        delete vehicleRowRefs.current[id];
      }
    });
  }, [filteredVehicles]);

  React.useEffect(() => {
    if (vehicleOrder.length === 0) {
      if (focusedVehicleId !== null) {
        setFocusedVehicleId(null);
      }
      return;
    }
    if (!focusedVehicleId || !vehicleMeta[focusedVehicleId]) {
      setFocusedVehicleId(vehicleOrder[0]);
    }
  }, [vehicleOrder, focusedVehicleId, vehicleMeta]);

  React.useEffect(() => {
    if (!focusedVehicleId) {
      if (vehicleOrder.length === 0 && activeCategory !== null) {
        setActiveCategory(null);
      }
      return;
    }
    const meta = vehicleMeta[focusedVehicleId];
    if (meta && meta.category !== activeCategory) {
      setActiveCategory(meta.category);
    }
  }, [focusedVehicleId, vehicleMeta, activeCategory, vehicleOrder.length]);

  const setPendingFor = React.useCallback((vehicleId: string, value: boolean) => {
    setPendingVehicles((prev) => {
      if (value) {
        if (prev[vehicleId]) return prev;
        return { ...prev, [vehicleId]: true };
      }
      if (!prev[vehicleId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[vehicleId];
      return next;
    });
  }, []);
  
  const focusVehicle = React.useCallback(
    (vehicleId: string | null, options: { scroll?: boolean } = {}) => {
      setFocusedVehicleId(vehicleId);
      if (vehicleId && options.scroll !== false) {
        vehicleRowRefs.current[vehicleId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    []
  );

  const focusRouteInput = React.useCallback(
    (vehicleId: string) => {
      focusVehicle(vehicleId);
      const target = routeInputRefs.current[vehicleId];
      if (target) {
        target.focus();
        target.select();
        activeRouteRef.current = vehicleId;
      }
    },
    [focusVehicle]
  );

  const moveVehicleSelection = React.useCallback(
    (direction: 1 | -1) => {
      if (vehicleOrder.length === 0) return;
      const currentIndex = focusedVehicleId ? vehicleMeta[focusedVehicleId]?.index ?? -1 : -1;
      const nextIndex =
        currentIndex === -1
          ? direction === 1
            ? 0
            : vehicleOrder.length - 1
          : (currentIndex + direction + vehicleOrder.length) % vehicleOrder.length;
      const nextId = vehicleOrder[nextIndex];
      focusVehicle(nextId);
    },
    [vehicleOrder, focusedVehicleId, vehicleMeta, focusVehicle]
  );

  const selectCategoryByIndex = React.useCallback(
    (index: number) => {
      const category = CATEGORY_SEQUENCE[index];
      if (!category) return;
      setActiveCategory(category);
      const bucket = grouped[category];
      if (bucket && bucket.length > 0) {
        focusVehicle(bucket[0].id);
      }
    },
    [grouped, focusVehicle]
  );

  const cycleCategory = React.useCallback(
    (direction: 1 | -1) => {
      const currentIndex = activeCategory ? CATEGORY_SEQUENCE.indexOf(activeCategory) : -1;
      if (currentIndex === -1) {
        selectCategoryByIndex(direction === 1 ? 0 : CATEGORY_SEQUENCE.length - 1);
        return;
      }
      const nextIndex = (currentIndex + direction + CATEGORY_SEQUENCE.length) % CATEGORY_SEQUENCE.length;
      selectCategoryByIndex(nextIndex);
    },
    [activeCategory, selectCategoryByIndex]
  );

  const findVehicle = React.useCallback(
    (vehicleId: string) => vehicles.find((vehicle) => vehicle.id === vehicleId) ?? null,
    [vehicles]
  );

  const handleRouteCommit = React.useCallback(
    async (vehicleId: string, nextValue?: string) => {
      if (!connectedRoomId) return;
      const vehicle = findVehicle(vehicleId);
      if (!vehicle) return;
      const rawValue = nextValue ?? draftRoutes[vehicleId] ?? "";
      const trimmed = rawValue.trim();
      const routeValue = trimmed.length === 0 ? null : trimmed;
      if (routeValue === (vehicle.route ?? null)) {
        return;
      }
      setPendingFor(vehicleId, true);
      try {
        await updateDispatchVehicle(connectedRoomId, vehicleId, { route: routeValue });
        applyLocalPatch(vehicleId, { route: routeValue });
        setBanner({ type: "success", message: `Route updated for vehicle ${vehicleId}.` });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update route.";
        setBanner({ type: "error", message });
        setDraftRoutes((prev) => ({ ...prev, [vehicleId]: vehicle.route ?? "" }));
      } finally {
        setPendingFor(vehicleId, false);
      }
    },
    [connectedRoomId, findVehicle, draftRoutes, applyLocalPatch, setPendingFor]
  );

  const toggleAssigned = React.useCallback(
    async (vehicleId: string, value?: boolean) => {
      if (!connectedRoomId) return;
      const vehicle = findVehicle(vehicleId);
      if (!vehicle) return;
      const nextValue = typeof value === "boolean" ? value : !vehicle.assigned;
      if (nextValue === vehicle.assigned) return;
      setPendingFor(vehicleId, true);
      try {
        await updateDispatchVehicle(connectedRoomId, vehicleId, { assigned: nextValue });
        applyLocalPatch(vehicleId, { assigned: nextValue });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update assignment.";
        setBanner({ type: "error", message });
      } finally {
        setPendingFor(vehicleId, false);
      }
    },
    [connectedRoomId, findVehicle, applyLocalPatch, setPendingFor]
  );

  const toggleTowing = React.useCallback(
    async (vehicleId: string, value?: boolean) => {
      if (!connectedRoomId) return;
      const vehicle = findVehicle(vehicleId);
      if (!vehicle) return;
      const nextValue = typeof value === "boolean" ? value : !vehicle.towing;
      if (nextValue === vehicle.towing) return;
      setPendingFor(vehicleId, true);
      try {
        await updateDispatchVehicle(connectedRoomId, vehicleId, { towing: nextValue });
        applyLocalPatch(vehicleId, { towing: nextValue });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update towing.";
        setBanner({ type: "error", message });
      } finally {
        setPendingFor(vehicleId, false);
      }
    },
    [connectedRoomId, findVehicle, applyLocalPatch, setPendingFor]
  );

  const handleDelete = React.useCallback(
    async (vehicleId: string) => {
      if (!connectedRoomId) return;
      setPendingFor(vehicleId, true);
      try {
        await deleteDispatchVehicle(connectedRoomId, vehicleId);
        removeLocalVehicle(vehicleId);
        setBanner({ type: "success", message: `Vehicle ${vehicleId} removed from room.` });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete vehicle.";
        setBanner({ type: "error", message });
      } finally {
        setPendingFor(vehicleId, false);
      }
    },
    [connectedRoomId, removeLocalVehicle, setPendingFor]
  );

  const handleImport = async () => {
    if (!connectedRoomId) {
      setBanner({ type: "error", message: "Connect to a room before importing vehicles." });
      return;
    }
    const value = window.prompt(
      "Paste the JSON payload from the ExportVehicleList command. It should be an array of vehicles."
    );
    if (!value) {
      return;
    }
    let seeds: DispatchVehicleSeed[];
    try {
      seeds = parseVehicleSeeds(value);
    } catch (err) {
      const message = err instanceof Error ? err.message : "The provided JSON is invalid.";
      setBanner({ type: "error", message });
      return;
    }

    setImporting(true);
    try {
      await importDispatchVehicles(connectedRoomId, seeds);
      setBanner({
        type: "success",
        message: `Imported ${seeds.length} vehicles. Live updates will appear as they sync.`,
      });
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to import vehicles.";
      setBanner({ type: "error", message });
    } finally {
      setImporting(false);
    }
  };

  const handleHotkeys = React.useCallback(
    (event: KeyboardEvent) => {
      if (controlsOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          setControlsOpen(false);
        }
        return;
      }

      const modifier = event.metaKey || event.ctrlKey;
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isEditable = target?.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
      const altOnly = event.altKey && !modifier && !event.shiftKey;

      const focusSearch = () => {
        if (searchRef.current) {
          searchRef.current.focus();
          searchRef.current.select();
        }
      };

      if ((modifier && event.key.toLowerCase() === "k") || (!modifier && event.key === "/")) {
        event.preventDefault();
        focusSearch();
        return;
      }

      if (!isEditable && !modifier && !event.altKey) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          moveVehicleSelection(1);
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          moveVehicleSelection(-1);
          return;
        }
      }

      if (!isEditable && altOnly && event.key === "ArrowRight") {
        event.preventDefault();
        cycleCategory(1);
        return;
      }

      if (!isEditable && altOnly && event.key === "ArrowLeft") {
        event.preventDefault();
        cycleCategory(-1);
        return;
      }

      if (!isEditable && altOnly) {
        const digitMatch = event.code.match(/^Digit([1-9])$/);
        if (digitMatch) {
          const index = Number(digitMatch[1]) - 1;
          if (index >= 0 && index < CATEGORY_SEQUENCE.length) {
            event.preventDefault();
            selectCategoryByIndex(index);
            return;
          }
        }
      }

      if (
        !isEditable &&
        event.shiftKey &&
        !modifier &&
        event.key.toLowerCase() === "r" &&
        focusedVehicleId
      ) {
        event.preventDefault();
        focusRouteInput(focusedVehicleId);
        return;
      }

      if (!focusedVehicleId) {
        return;
      }

      if (event.shiftKey && !modifier && event.key.toLowerCase() === "a" && !isEditable) {
        event.preventDefault();
        void toggleAssigned(focusedVehicleId);
      } else if (event.shiftKey && !modifier && event.key.toLowerCase() === "t" && !isEditable) {
        event.preventDefault();
        void toggleTowing(focusedVehicleId);
      } else if (
        event.shiftKey &&
        !modifier &&
        (event.key === "Delete" || event.key === "Backspace") &&
        !isEditable
      ) {
        event.preventDefault();
        void handleDelete(focusedVehicleId);
      } else if (!modifier && event.key === "Escape" && !isEditable) {
        event.preventDefault();
        focusVehicle(null);
      }
    },
    [
      focusedVehicleId,
      moveVehicleSelection,
      cycleCategory,
      selectCategoryByIndex,
      focusRouteInput,
      toggleAssigned,
      toggleTowing,
      handleDelete,
      focusVehicle,
      controlsOpen,
      setControlsOpen,
    ]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleHotkeys);
    return () => window.removeEventListener("keydown", handleHotkeys);
  }, [handleHotkeys]);

  const statusBadge = STATUS_STYLES[status];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10">
      {banner && (
        <div
          className={`mb-4 rounded-md border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-100"
              : banner.type === "error"
                ? "border-red-600/40 bg-red-500/10 text-red-100"
                : "border-blue-600/40 bg-blue-500/10 text-blue-100"
          }`}
        >
          {banner.message}
        </div>
      )}

      <PageBox className="bg-[var(--background-secondary)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-[var(--text-muted)]">
              {groupName ?? "Dispatch"}
            </p>
            <h1 className="text-2xl font-semibold">Dispatch board</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Active vehicles synced from room {connectedRoomId ?? "—"}. {totalVisible}{" "}
              items match your filters.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            {error && <span className="text-xs text-red-300">Stream error: {error}</span>}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="vehicle-search" className={LABEL_BASE}>
                Search
              </label>
              <input
                id="vehicle-search"
                ref={searchRef}
                type="text"
                placeholder="Filter by ID, owner, depot, route..."
                className={`${INPUT_BASE} w-full`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleImport}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
                disabled={!connectedRoomId || importing}
              >
                {importing ? "Importing…" : "Import vehicles"}
              </button>
              <button
                type="button"
                onClick={() => setControlsOpen(true)}
                className="rounded-md border border-[var(--background-muted)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--text-muted)]/60"
              >
                Controls
              </button>
            </div>
          </div>
        </div>
      </PageBox>

      <div className="mt-6 space-y-6">
        {CATEGORY_SEQUENCE.map((category) => {
          const isActiveCategory = activeCategory === category;
          return (
            <PageBox
              key={category}
              className={`bg-[var(--background-secondary)] ${
                isActiveCategory ? "ring-2 ring-blue-500/40 border border-blue-500/60" : ""
              }`}
            >
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{VEHICLE_CATEGORY_LABELS[category]}</h2>
                  <p className="text-sm text-[var(--text-muted)]">{CATEGORY_DESCRIPTIONS[category]}</p>
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                  {grouped[category].length} of {vehicles.length}
                </span>
              </div>

              {grouped[category].length === 0 ? (
                <p className="rounded-md border border-dashed border-[var(--background-muted)] p-4 text-sm text-[var(--text-muted)]">
                  {normalizedSearch ? "No vehicles match this filter." : "Nothing has been placed in this bucket yet."}
                </p>
              ) : (
                <div className="space-y-2">
                  {grouped[category].map((vehicle) => {
                    const owner = ownerProfiles[vehicle.ownerId];
                    const pending = !!pendingVehicles[vehicle.id];
                    const routeValue = draftRoutes[vehicle.id] ?? vehicle.route ?? "";
                    const focused = focusedVehicleId === vehicle.id;

                    return (
                      <div
                        key={vehicle.id}
                        ref={(node) => {
                          if (node) {
                            vehicleRowRefs.current[vehicle.id] = node;
                          } else {
                            delete vehicleRowRefs.current[vehicle.id];
                          }
                        }}
                        className={`rounded-lg border border-[var(--background-muted)] p-3 text-sm transition ${
                          focused ? "ring-2 ring-blue-500" : "hover:border-[var(--text-muted)]/40"
                        } ${pending ? "opacity-70" : ""}`}
                        tabIndex={0}
                        onClick={() => focusVehicle(vehicle.id)}
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text)]">
                            <span className="font-mono text-base font-semibold">{vehicle.id}</span>
                            <span className="font-semibold">{vehicle.name}</span>
                          </div>
                          <span className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                            {vehicle.depot}
                          </span>
                        </div>

                        <div className="mt-2 grid gap-2 text-xs md:grid-cols-[minmax(0,1fr)_110px_110px]">
                          <div className="flex flex-col gap-1">
                            <label className={LABEL_BASE}>Route</label>
                            <input
                              ref={(node) => {
                                if (node) {
                                  routeInputRefs.current[vehicle.id] = node;
                                } else {
                                  delete routeInputRefs.current[vehicle.id];
                                }
                              }}
                              type="text"
                              value={routeValue}
                              className={`${INPUT_BASE} mt-1 w-full py-1.5 text-sm`}
                              onFocus={() => {
                                activeRouteRef.current = vehicle.id;
                                focusVehicle(vehicle.id, { scroll: false });
                              }}
                              onBlur={() => {
                                if (activeRouteRef.current === vehicle.id) {
                                  activeRouteRef.current = null;
                                }
                                void handleRouteCommit(vehicle.id);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                  event.preventDefault();
                                  void handleRouteCommit(vehicle.id);
                                } else if (event.key === "Escape") {
                                  event.preventDefault();
                                  setDraftRoutes((prev) => ({
                                    ...prev,
                                    [vehicle.id]: vehicle.route ?? "",
                                  }));
                                }
                              }}
                              onChange={(event) =>
                                setDraftRoutes((prev) => ({ ...prev, [vehicle.id]: event.target.value }))
                              }
                              disabled={pending}
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className={LABEL_BASE}>Assigned</label>
                            <label className="mt-1 flex items-center gap-2 text-xs text-[var(--text)]">
                              <input
                                type="checkbox"
                                checked={vehicle.assigned}
                                onChange={(event) => toggleAssigned(vehicle.id, event.target.checked)}
                                onFocus={() => focusVehicle(vehicle.id, { scroll: false })}
                                disabled={pending}
                                className="h-3.5 w-3.5"
                              />
                              <span>{vehicle.assigned ? "Ready" : "Unassigned"}</span>
                            </label>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className={LABEL_BASE}>Towing</label>
                            <label className="mt-1 flex items-center gap-2 text-xs text-[var(--text)]">
                              <input
                                type="checkbox"
                                checked={vehicle.towing}
                                onChange={(event) => toggleTowing(vehicle.id, event.target.checked)}
                                onFocus={() => focusVehicle(vehicle.id, { scroll: false })}
                                disabled={pending}
                                className="h-3.5 w-3.5"
                              />
                              <span>{vehicle.towing ? "Active" : "Idle"}</span>
                            </label>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm text-[var(--text)]">
                              {owner?.displayName ?? `User ${vehicle.ownerId}`}
                            </span>
                            <span>{owner ? `@${owner.username}` : `Owner #${vehicle.ownerId}`}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="rounded px-2 py-1 text-xs text-blue-300 hover:text-blue-200"
                              onClick={() => {
                                navigator.clipboard?.writeText(vehicle.id).catch(() => undefined);
                                setBanner({ type: "info", message: `Copied ${vehicle.id} to clipboard.` });
                              }}
                            >
                              Copy ID
                            </button>
                            <button
                              type="button"
                              className="rounded px-2 py-1 text-xs text-red-400 hover:text-red-300"
                              onClick={() => void handleDelete(vehicle.id)}
                              disabled={pending}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </PageBox>
          );
        })}
      </div>

      {controlsOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-8"
          onClick={() => setControlsOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-[var(--background-muted)] bg-[var(--background-secondary)] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">Keyboard controls</h2>
                <p className="text-sm text-[var(--text-muted)]">Reference for selection, routing, and triage actions.</p>
              </div>
              <button
                type="button"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
                onClick={() => setControlsOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-sm text-[var(--text-muted)]">
                Everything you can do from the keyboard: focus, navigate, assign, and clean up without leaving the board.
              </p>
              <div className="space-y-3 text-sm">
                {CONTROL_SECTIONS.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-lg border border-[var(--background-muted)] bg-[var(--background)] p-4"
                  >
                    <h3 className="text-base font-semibold text-[var(--text)]">{section.title}</h3>
                    {section.description && (
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{section.description}</p>
                    )}
                    <div className="mt-3 space-y-2">
                      {section.items.map((item) => (
                        <div
                          key={item.combo}
                          className="flex flex-col gap-1 rounded border border-[var(--background-muted)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="font-mono text-base text-[var(--text)]">{item.combo}</span>
                          <span className="text-sm text-[var(--text-muted)]">{item.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchClient;

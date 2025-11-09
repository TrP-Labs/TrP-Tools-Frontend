"use client";

import React from "react";
import Link from "next/link";
import PageBox from "@/components//dashboard//PageBox";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserIdentityList from "@/components/users/UserIdentityList";
import UserIdentityRow from "@/components/users/UserIdentityRow";
import { ShiftEvent } from "@/lib/api/schedule";
import {
  closeRoom,
  fetchGroupRoom,
  fetchRoomDetails,
  openRoomForEvent,
  RoomDetails,
} from "@/lib/api/rooms";
import { Locale } from "@/../i18n-config";
import { RRule } from "rrule";
import { useUserProfiles } from "@/hooks/useUserProfiles";

type AlertState = {
  type: "success" | "error";
  message: string;
};

export interface ShiftDashboardStrings {
  title: string;
  description: string;
  noEventsTitle: string;
  noEventsBody: string;
  schedulerCta: string;
  schedulerButton: string;
  eventReadyTitle: string;
  eventScheduledLabel: string;
  eventRelativeLabel: string;
  eventStartButton: string;
  activeRoomTitle: string;
  roomDetails: {
    creator: string;
    createdAt: string;
    expiresAt: string;
    users: string;
    emptyUsers: string;
    vehicles: string;
  };
  stopRoomButton: string;
  refreshButton: string;
  messages: {
    startInProgress: string;
    stopInProgress: string;
    refreshInProgress: string;
    startSuccess: string;
    startError: string;
    stopSuccess: string;
    stopError: string;
    refreshSuccess: string;
    refreshError: string;
  };
}

const FALLBACK_STRINGS: ShiftDashboardStrings = {
  title: "Shift Dashboard",
  description: "Monitor your live rooms and quickly launch the next scheduled shift.",
  noEventsTitle: "No scheduled shift right now",
  noEventsBody: "Create or adjust your events in the shift scheduler so hosts know what to run.",
  schedulerCta: "Need to add more shifts?",
  schedulerButton: "Open shift scheduler",
  eventReadyTitle: "A scheduled shift is ready to start",
  eventScheduledLabel: "Scheduled for",
  eventRelativeLabel: "Relative time",
  eventStartButton: "Start this shift",
  activeRoomTitle: "Active room",
  roomDetails: {
    creator: "Host",
    createdAt: "Opened",
    expiresAt: "Expires",
    users: "Users in room",
    emptyUsers: "Nobody has joined yet.",
    vehicles: "Vehicles",
  },
  stopRoomButton: "Stop room",
  refreshButton: "Refresh status",
  messages: {
    startInProgress: "Starting room...",
    stopInProgress: "Stopping room...",
    refreshInProgress: "Refreshing...",
    startSuccess: "Room started successfully.",
    startError: "Unable to start the room.",
    stopSuccess: "Room closed successfully.",
    stopError: "Unable to stop the room.",
    refreshSuccess: "Room status refreshed.",
    refreshError: "Failed to refresh room state.",
  },
};

interface ClientShiftDashboardProps {
  groupId: string;
  events: ShiftEvent[];
  initialRoom: RoomDetails | null;
  locale: Locale;
  initialNow: string;
  strings?: ShiftDashboardStrings;
}

type RoomActionState = "idle" | "starting" | "stopping" | "refreshing";

interface WindowEventMatch {
  event: ShiftEvent;
  occurrence: Date;
}

const WINDOW_PAST_MS = 2 * 60 * 60 * 1000;
const WINDOW_FUTURE_MS = 30 * 60 * 1000;

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function findOccurrenceWithinWindow(event: ShiftEvent, start: Date, end: Date): Date | null {
  const base = parseDate(event.startTime);
  if (!event.rrule) {
    if (base && base >= start && base <= end) {
      return base;
    }
    return null;
  }

  try {
    const options = RRule.parseString(event.rrule);
    if (!options.dtstart && base) {
      options.dtstart = base;
    }
    const rule = new RRule(options);
    const matches = rule.between(start, end, true);
    if (matches.length > 0) {
      return matches[0];
    }
    return null;
  } catch (error) {
    console.warn("Failed to evaluate rrule for event", event.id, error);
    if (base && base >= start && base <= end) {
      return base;
    }
    return null;
  }
}

function pickWindowEvent(events: ShiftEvent[], reference: Date): WindowEventMatch | null {
  const windowStart = new Date(reference.getTime() - WINDOW_PAST_MS);
  const windowEnd = new Date(reference.getTime() + WINDOW_FUTURE_MS);

  const matches = events
    .map((event) => {
      const occurrence = findOccurrenceWithinWindow(event, windowStart, windowEnd);
      return occurrence ? ({ event, occurrence } as WindowEventMatch) : null;
    })
    .filter((value): value is WindowEventMatch => Boolean(value))
    .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime());

  return matches[0] ?? null;
}

function formatDate(value: string | Date | null, locale: string) {
  const date = value instanceof Date ? value : parseDate(typeof value === "string" ? value : null);
  if (!date) return "—";
  return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

function formatRelative(date: Date, locale: string, reference: Date): string {
  const diffMs = date.getTime() - reference.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  return formatter.format(diffHours, "hour");
}

const ClientShiftDashboard: React.FC<ClientShiftDashboardProps> = ({
  groupId,
  events,
  initialRoom,
  locale,
  initialNow,
  strings: providedStrings,
}) => {
  const strings = React.useMemo(() => providedStrings ?? FALLBACK_STRINGS, [providedStrings]);
  const [room, setRoom] = React.useState<RoomDetails | null>(initialRoom);
  const [action, setAction] = React.useState<RoomActionState>("idle");
  const [alert, setAlert] = React.useState<AlertState | null>(null);
  const [referenceTime, setReferenceTime] = React.useState(() => {
    const parsed = new Date(initialNow);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  });

  React.useEffect(() => {
    setReferenceTime(new Date());
  }, []);

  const windowEvent = React.useMemo(() => pickWindowEvent(events, referenceTime), [events, referenceTime]);
  const schedulerHref = `/${locale}/dashboard/${groupId}/shifts`;
  const hostIds = React.useMemo(() => (room ? [room.creatorId] : []), [room]);
  const { profiles: hostProfiles, loading: hostLoading } = useUserProfiles(hostIds);
  const hostProfile = room && hostProfiles[room.creatorId] ? hostProfiles[room.creatorId] : null;

  const setAlertMessage = React.useCallback((type: AlertState["type"], message: string) => {
    setAlert({ type, message });
  }, []);

  const handleRefresh = React.useCallback(async () => {
    setAction("refreshing");
    setAlert({ type: "success", message: strings.messages.refreshInProgress });
    try {
      const updated = await fetchGroupRoom(groupId);
      setRoom(updated);
      setAlertMessage("success", strings.messages.refreshSuccess);
    } catch (error) {
      console.warn("Failed to refresh room state", error);
      setAlertMessage("error", strings.messages.refreshError);
    } finally {
      setAction("idle");
    }
  }, [groupId, setAlertMessage, strings.messages.refreshError, strings.messages.refreshInProgress, strings.messages.refreshSuccess]);

  const handleStart = React.useCallback(async () => {
    if (!windowEvent) return;
    setAction("starting");
    setAlert({ type: "success", message: strings.messages.startInProgress });
    try {
      const roomId = await openRoomForEvent(windowEvent.event.id);
      if (!roomId) {
        throw new Error("Missing room id");
      }
      const details = await fetchRoomDetails(roomId);
      if (!details) {
        throw new Error("Missing room details");
      }
      setRoom(details);
      setAlertMessage("success", strings.messages.startSuccess);
    } catch (error) {
      console.error("Failed to start room", error);
      setAlertMessage("error", strings.messages.startError);
    } finally {
      setAction("idle");
    }
  }, [strings.messages.startError, strings.messages.startInProgress, strings.messages.startSuccess, windowEvent, setAlertMessage]);

  const handleStop = React.useCallback(async () => {
    if (!room) return;
    setAction("stopping");
    setAlert({ type: "success", message: strings.messages.stopInProgress });
    try {
      const ok = await closeRoom(room.roomId);
      if (!ok) {
        throw new Error("Failed to close room");
      }
      setRoom(null);
      setAlertMessage("success", strings.messages.stopSuccess);
    } catch (error) {
      console.error("Failed to stop room", error);
      setAlertMessage("error", strings.messages.stopError);
    } finally {
      setAction("idle");
    }
  }, [room, strings.messages.stopError, strings.messages.stopInProgress, strings.messages.stopSuccess, setAlertMessage]);

  const renderAlert = () => {
    if (!alert) return null;
    const color = alert.type === "success" ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200";
    return (
      <div className={`rounded-lg px-4 py-3 text-sm font-medium ${color} mb-4`}>
        {alert.message}
      </div>
    );
  };

  const renderActiveRoom = () => {
    if (!room) return null;
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailItem label={strings.roomDetails.vehicles} value={room.vehicles.toString()} />
          <DetailItem label={strings.roomDetails.createdAt} value={formatDate(room.createdAt, locale)} />
          <DetailItem label={strings.roomDetails.expiresAt} value={formatDate(room.expiresAt, locale)} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{strings.roomDetails.creator}</h3>
          <UserIdentityRow
            profile={hostProfile}
            loading={Boolean(room) && hostLoading && !hostProfile}
            showUsername
            size="md"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{strings.roomDetails.users}</h3>
          <UserIdentityList
            userIds={room.users}
            dense
            emptyMessage={strings.roomDetails.emptyUsers}
            showUsername={false}
          />
        </div>
        <button
          onClick={handleStop}
          disabled={action === "stopping"}
          className="w-full sm:w-auto px-6 py-3 rounded-lg text-white bg-red-600 hover:bg-red-500 disabled:opacity-60 text-lg font-semibold flex items-center justify-center gap-2"
        >
          {action === "stopping" && <LoadingSpinner size="sm" />}
          {strings.stopRoomButton}
        </button>
      </div>
    );
  };

  const renderEventReady = () => {
    if (!windowEvent) return null;
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">{windowEvent.event.name}</h3>
          <p className="text-sm text-[var(--text-muted)]">{strings.eventReadyTitle}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailItem label={strings.eventScheduledLabel} value={formatDate(windowEvent.occurrence, locale)} />
          <DetailItem label={strings.eventRelativeLabel} value={formatRelative(windowEvent.occurrence, locale, referenceTime)} />
        </div>
        <button
          onClick={handleStart}
          disabled={action === "starting"}
          className="w-full sm:w-auto px-8 py-4 rounded-xl text-white bg-green-600 hover:bg-green-500 disabled:opacity-60 text-lg font-semibold flex items-center justify-center gap-2"
        >
          {action === "starting" && <LoadingSpinner size="sm" />}
          {strings.eventStartButton}
        </button>
      </div>
    );
  };

  const renderNoEvents = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-1">{strings.noEventsTitle}</h3>
        <p className="text-sm text-[var(--text-muted)]">{strings.noEventsBody}</p>
      </div>
      <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
        <p className="font-medium mb-2">{strings.schedulerCta}</p>
        <Link
          href={schedulerHref}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500"
        >
          {strings.schedulerButton}
        </Link>
      </div>
      <button
        onClick={handleRefresh}
        disabled={action === "refreshing"}
        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-muted)] disabled:opacity-60"
      >
        {action === "refreshing" && <LoadingSpinner size="sm" className="mr-2" />}
        {strings.refreshButton}
      </button>
    </div>
  );

  return (
    <div className="w-full flex justify-center px-4 py-8">
      <PageBox className="w-full max-w-3xl bg-[var(--background-secondary)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{strings.title}</h1>
          <p className="text-[var(--text-muted)]">{strings.description}</p>
        </div>
        {renderAlert()}
        {room ? renderActiveRoom() : windowEvent ? renderEventReady() : renderNoEvents()}
      </PageBox>
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className="rounded-lg bg-[var(--background-muted)] p-4">
    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default ClientShiftDashboard;

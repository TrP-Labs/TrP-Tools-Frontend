"use client";

import React from "react";
import PageBox from "@/components//dashboard/PageBox";
import LargeDropdown from "@/components/settings/LargeDropdown";
import {
  createShiftEvent,
  deleteShiftEvent,
  fetchGroupShiftEvents,
  fetchShiftEvent,
  ShiftEvent,
  updateShiftEvent,
} from "@/lib/api/schedule";
import type { Locale } from "@/../i18n-config";
import { RRule, Weekday, Options } from "rrule";

type RecurrencePattern = "none" | "daily" | "weekly" | "biweekly" | "monthly";
type WeekdayCode = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

interface ShiftFormState {
  name: string;
  startTime: string;
  pattern: RecurrencePattern;
}

interface ShiftSchedulerStrings {
  title: string;
  description: string;
  form: {
    nameLabel: string;
    namePlaceholder: string;
    startLabel: string;
    recurrenceLabel: string;
    weeklyLabel: string;
    summaryLabel: string;
    summaryNone: string;
  };
  recurrenceOptions: Record<RecurrencePattern, string>;
  weekdays: Record<WeekdayCode, { short: string; long: string }>;
  summary: {
    daily: string;
    weekly: string;
    biweekly: string;
    monthly: string;
  };
  list: {
    title: string;
    empty: string;
    starts: string;
    recurrence: string;
    missingStart: string;
  };
  buttons: {
    create: string;
    update: string;
    cancel: string;
    edit: string;
    delete: string;
  };
  messages: {
    nameRequired: string;
    startRequired: string;
    weeklyDaysRequired: string;
    invalidDate: string;
    saveError: string;
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    deleteConfirm: string;
    deleteConfirmNamed: string;
    deleteError: string;
  };
  status: {
    working: string;
  };
}

const WEEKDAY_CODES: WeekdayCode[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const WEEKDAY_ORDER: Record<WeekdayCode, number> = {
  MO: 0,
  TU: 1,
  WE: 2,
  TH: 3,
  FR: 4,
  SA: 5,
  SU: 6,
};

const CODE_TO_RRULE: Record<WeekdayCode, Weekday> = {
  MO: RRule.MO,
  TU: RRule.TU,
  WE: RRule.WE,
  TH: RRule.TH,
  FR: RRule.FR,
  SA: RRule.SA,
  SU: RRule.SU,
};

const RRULE_INDEX_TO_CODE: WeekdayCode[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const JS_DAY_TO_CODE: WeekdayCode[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const FALLBACK_STRINGS: ShiftSchedulerStrings = {
  title: "Shift Scheduling",
  description:
    "Plan recurring shifts without writing RRULE strings. Pick a recurrence pattern that fits how your team works.",
  form: {
    nameLabel: "Shift name",
    namePlaceholder: "Example: Patrol Alpha",
    startLabel: "Start time",
    recurrenceLabel: "Recurrence",
    weeklyLabel: "Repeat on",
    summaryLabel: "Summary",
    summaryNone: "Does not repeat",
  },
  recurrenceOptions: {
    none: "Does not repeat",
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Every other week",
    monthly: "Monthly",
  },
  weekdays: {
    MO: { short: "Mon", long: "Monday" },
    TU: { short: "Tue", long: "Tuesday" },
    WE: { short: "Wed", long: "Wednesday" },
    TH: { short: "Thu", long: "Thursday" },
    FR: { short: "Fri", long: "Friday" },
    SA: { short: "Sat", long: "Saturday" },
    SU: { short: "Sun", long: "Sunday" },
  },
  summary: {
    daily: "Repeats every day",
    weekly: "Repeats weekly on {days}",
    biweekly: "Repeats every other week on {days}",
    monthly: "Repeats monthly on day {day}",
  },
  list: {
    title: "Scheduled Shifts",
    empty: "No shifts scheduled yet. Create one using the form above.",
    starts: "Starts: {value}",
    recurrence: "{value}",
    missingStart: "Start time not set",
  },
  buttons: {
    create: "Create Shift",
    update: "Update Shift",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
  },
  messages: {
    nameRequired: "Please provide a shift name.",
    startRequired: "Please choose a start time.",
    weeklyDaysRequired: "Select at least one weekday.",
    invalidDate: "Please provide a valid start date and time.",
    saveError: "Failed to save shift.",
    createSuccess: "Shift scheduled successfully.",
    updateSuccess: "Shift updated successfully.",
    deleteSuccess: "Shift deleted successfully.",
    deleteConfirm: "Delete this shift?",
    deleteConfirmNamed: "Delete shift \"{name}\"?",
    deleteError: "Unable to delete shift.",
  },
  status: {
    working: "Working...",
  },
};

function createEmptyForm(): ShiftFormState {
  return {
    name: "",
    startTime: "",
    pattern: "none",
  };
}

function dateToWeekdayCode(date: Date): WeekdayCode {
  return JS_DAY_TO_CODE[date.getDay()];
}

function extractWeekdayCodes(input: Options["byweekday"]): WeekdayCode[] {
  if (!input) return [];
  const values = Array.isArray(input) ? input : [input];
  const codes = values
    .map((value) => {
      if (typeof value === "number") {
        const index = ((value % 7) + 7) % 7;
        return RRULE_INDEX_TO_CODE[index];
      }
      if (typeof value === "object" && value !== null) {
        const weekdayIndex = "weekday" in value ? value.weekday : undefined;
        if (typeof weekdayIndex === "number") {
          return RRULE_INDEX_TO_CODE[((weekdayIndex % 7) + 7) % 7];
        }
      }
      return null;
    })
    .filter((value): value is WeekdayCode => Boolean(value));

  const unique = Array.from(new Set(codes));
  unique.sort((a, b) => WEEKDAY_ORDER[a] - WEEKDAY_ORDER[b]);
  return unique;
}

function detectPattern(rule: RRule): RecurrencePattern {
  const { options } = rule;
  if (options.count === 1) {
    return "none";
  }

  switch (options.freq) {
    case RRule.DAILY:
      return "daily";
    case RRule.WEEKLY:
      return options.interval === 2 ? "biweekly" : "weekly";
    case RRule.MONTHLY:
      return "monthly";
    default:
      return "weekly";
  }
}

function buildRRuleString(form: ShiftFormState, startDate: Date): string {
  switch (form.pattern) {
    case "none": {
      const rule = new RRule({
        freq: RRule.DAILY,
        interval: 1,
        count: 1,
        dtstart: startDate,
      });
      return rule.toString();
    }
    case "daily": {
      const rule = new RRule({
        freq: RRule.DAILY,
        interval: 1,
        dtstart: startDate,
      });
      return rule.toString();
    }
    case "weekly":
    case "biweekly": {
      const interval = form.pattern === "biweekly" ? 2 : 1;
      const rule = new RRule({
        freq: RRule.WEEKLY,
        interval,
        byweekday: [CODE_TO_RRULE[dateToWeekdayCode(startDate)]],
        dtstart: startDate,
      });
      return rule.toString();
    }
    case "monthly": {
      const day = startDate.getDate();
      const fallbackDays: number[] = [day];
      if (day > 30) {
        fallbackDays.push(30, 29, 28);
      } else if (day === 30) {
        fallbackDays.push(29, 28);
      } else if (day === 29) {
        fallbackDays.push(28);
      }
      const rule = new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: fallbackDays,
        dtstart: startDate,
      });
      return rule.toString();
    }
    default:
      return new RRule({
        freq: RRule.DAILY,
        interval: 1,
        count: 1,
        dtstart: startDate,
      }).toString();
  }
}

function formFromEvent(event: ShiftEvent): ShiftFormState {
  const form = createEmptyForm();
  form.name = event.name;
  form.startTime = toInputDateValue(event.startTime);

  if (!event.rrule) {
    form.pattern = "none";
    return form;
  }

  try {
    const rule = RRule.fromString(event.rrule);
    const pattern = detectPattern(rule);
    form.pattern = pattern;
    const startDate = event.startTime ? new Date(event.startTime) : undefined;

  } catch {
    form.pattern = "none";
  }

  return form;
}

function toInputDateValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDisplayDate(value: string | null, locale: string, fallback: string): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isRecurrencePattern(value: string): value is RecurrencePattern {
  return value === "none" || value === "daily" || value === "weekly" || value === "biweekly" || value === "monthly";
}

function describeRecurrence(
  event: ShiftEvent,
  strings: ShiftSchedulerStrings,
  locale: string,
  listFormatter: Intl.ListFormat
): string {
  if (!event.rrule) return strings.form.summaryNone;

  try {
    const rule = RRule.fromString(event.rrule);
    const pattern = detectPattern(rule);
    if (pattern === "none") {
      return strings.form.summaryNone;
    }

    const startDate = event.startTime ? new Date(event.startTime) : rule.options.dtstart ?? undefined;

    if (pattern === "daily") {
      return strings.summary.daily;
    }

    if (pattern === "weekly" || pattern === "biweekly") {
      const weekdays = extractWeekdayCodes(rule.options.byweekday);
      const referenceDays =
        weekdays.length > 0
          ? weekdays
          : startDate && !Number.isNaN(startDate.getTime())
            ? [dateToWeekdayCode(startDate)]
            : WEEKDAY_CODES;

      const labels = referenceDays.map((code) => strings.weekdays[code]?.long ?? code);
      const formatted = listFormatter.format(labels);
      const template = pattern === "weekly" ? strings.summary.weekly : strings.summary.biweekly;
      return template.replace("{days}", formatted);
    }

    if (pattern === "monthly") {
      const monthday = Array.isArray(rule.options.bymonthday)
        ? rule.options.bymonthday[0]
        : rule.options.bymonthday;
      const day =
        typeof monthday === "number" && monthday >= 1 && monthday <= 31
          ? monthday
          : startDate && !Number.isNaN(startDate.getTime())
            ? startDate.getDate()
            : 1;
      return strings.summary.monthly.replace("{day}", String(day));
    }

    return strings.form.summaryNone;
  } catch {
    return strings.form.summaryNone;
  }
}

function summarizeForm(
  form: ShiftFormState,
  strings: ShiftSchedulerStrings,
  locale: string,
  listFormatter: Intl.ListFormat
): string {
  const startDate = form.startTime ? new Date(form.startTime) : null;
  const hasValidStart = startDate && !Number.isNaN(startDate.getTime());
  const startCode = hasValidStart ? dateToWeekdayCode(startDate as Date) : null;
  const startLabel = startCode ? strings.weekdays[startCode]?.long ?? startCode : null;

  switch (form.pattern) {
    case "none":
      return strings.form.summaryNone;
    case "daily":
      return strings.summary.daily;
    case "weekly":
    case "biweekly": {
      const labels = startLabel ? [startLabel] : [];
      const formatted = labels.length > 0 ? listFormatter.format(labels) : "";
      const template = form.pattern === "weekly" ? strings.summary.weekly : strings.summary.biweekly;
      return formatted ? template.replace("{days}", formatted) : strings.form.summaryNone;
    }
    case "monthly":
      if (hasValidStart) {
        return strings.summary.monthly.replace("{day}", String((startDate as Date).getDate()));
      }
      return strings.form.summaryNone;
    default:
      return strings.form.summaryNone;
  }
}

interface ClientShiftSchedulerProps {
  groupId: string;
  initialEvents: ShiftEvent[];
  locale: Locale;
  strings?: ShiftSchedulerStrings;
}

const ClientShiftScheduler: React.FC<ClientShiftSchedulerProps> = ({ groupId, initialEvents, locale, strings }) => {
  const resolvedStrings = React.useMemo<ShiftSchedulerStrings>(() => strings ?? FALLBACK_STRINGS, [strings]);
  const [events, setEvents] = React.useState<ShiftEvent[]>(sortEvents(initialEvents));
  const [form, setForm] = React.useState<ShiftFormState>(() => createEmptyForm());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const listFormatter = React.useMemo(
    () => new Intl.ListFormat(locale, { style: "long", type: "conjunction" }),
    [locale]
  );

  const resetForm = React.useCallback(() => {
    setForm(createEmptyForm());
    setEditingId(null);
  }, []);

  const handleEdit = React.useCallback((event: ShiftEvent) => {
    setEditingId(event.id);
    setForm(formFromEvent(event));
    setSuccess(null);
    setError(null);
  }, []);

  const handleDelete = React.useCallback(
    async (eventId: string) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const deleted = await deleteShiftEvent(eventId);
        if (!deleted) {
          throw new Error(resolvedStrings.messages.deleteError);
        }
        setEvents((current) => current.filter((item) => item.id !== eventId));
        if (editingId === eventId) {
          resetForm();
        }
        setSuccess(resolvedStrings.messages.deleteSuccess);
      } catch (e: any) {
        setError(e?.message || resolvedStrings.messages.deleteError);
      } finally {
        setLoading(false);
      }
    },
    [editingId, events, resetForm, resolvedStrings.messages]
  );

  const refetchEvents = React.useCallback(async () => {
    try {
      const refreshed = await fetchGroupShiftEvents(groupId);
      setEvents(sortEvents(refreshed));
    } catch (e) {
      console.warn("Failed to refresh shift events:", e);
    }
  }, [groupId]);

  const handleNameChange = React.useCallback((value: string) => {
    setForm((prev) => ({ ...prev, name: value }));
  }, []);

  const handleStartTimeChange = React.useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      startTime: value,
    }));
  }, []);

  const handlePatternChange = React.useCallback((pattern: RecurrencePattern) => {
    setForm((prev) => ({
      ...prev,
      pattern,
    }));
  }, []);

  const onPatternSelect = React.useCallback(
    (value: string) => {
      if (isRecurrencePattern(value)) {
        handlePatternChange(value);
      }
    },
    [handlePatternChange]
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setSuccess(null);

      const trimmedName = form.name.trim();
      if (!trimmedName) {
        setError(resolvedStrings.messages.nameRequired);
        return;
      }

      if (!form.startTime) {
        setError(resolvedStrings.messages.startRequired);
        return;
      }
      const parsedDate = new Date(form.startTime);
      if (Number.isNaN(parsedDate.getTime())) {
        setError(resolvedStrings.messages.invalidDate);
        return;
      }

      const payload = {
        name: trimmedName,
        startTime: parsedDate.toISOString(),
        rrule: buildRRuleString(form, parsedDate),
      };

      setLoading(true);

      try {
        if (editingId) {
          const updated = await updateShiftEvent(editingId, payload);
          if (!updated) {
            throw new Error(resolvedStrings.messages.saveError);
          }
          const latest = await fetchShiftEvent(editingId);
          if (latest) {
            setEvents((current) =>
              sortEvents(current.map((item) => (item.id === editingId ? latest : item)))
            );
          } else {
            await refetchEvents();
          }
          setSuccess(resolvedStrings.messages.updateSuccess);
          setEditingId(null);
        } else {
          const created = await createShiftEvent(groupId, payload);
          if (!created) {
            throw new Error(resolvedStrings.messages.saveError);
          }
          setEvents((current) => sortEvents([created, ...current]));
          setSuccess(resolvedStrings.messages.createSuccess);
        }
      } catch (e: any) {
        setError(e?.message || resolvedStrings.messages.saveError);
      } finally {
        setLoading(false);
      }
    },
    [editingId, form, groupId, refetchEvents, resolvedStrings.messages]
  );

  const handleCancelEdit = React.useCallback(() => {
    resetForm();
    setError(null);
    setSuccess(null);
  }, [resetForm]);

  const recurrenceSummary = React.useMemo(
    () => summarizeForm(form, resolvedStrings, locale, listFormatter),
    [form, resolvedStrings, locale, listFormatter]
  );

  const recurrenceSelection = React.useMemo(() => {
    return {
      none: { id: "none", display: resolvedStrings.recurrenceOptions.none },
      daily: { id: "daily", display: resolvedStrings.recurrenceOptions.daily },
      weekly: { id: "weekly", display: resolvedStrings.recurrenceOptions.weekly },
      biweekly: { id: "biweekly", display: resolvedStrings.recurrenceOptions.biweekly },
      monthly: { id: "monthly", display: resolvedStrings.recurrenceOptions.monthly },
    };
  }, [resolvedStrings.recurrenceOptions]);

  return (
    <div className="w-full max-w-5xl px-4 pb-12 mt-10">
      <PageBox className="bg-[var(--background-secondary)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">{resolvedStrings.title}</h1>
          <p className="text-gray-400">{resolvedStrings.description}</p>
        </div>

        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && <div className="mb-4 text-green-400">{success}</div>}

        <form
          onSubmit={handleSubmit}
          className="border border-border rounded-lg p-6 mb-8 space-y-5"
        >
          <h2 className="text-xl font-semibold text-[var(--text)]">
            {editingId ? resolvedStrings.buttons.update : resolvedStrings.buttons.create}
          </h2>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--text)]">{resolvedStrings.form.nameLabel}</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--foreground)] text-[var(--text)] rounded-sm border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={resolvedStrings.form.namePlaceholder}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--text)]">{resolvedStrings.form.startLabel}</span>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 bg-[var(--foreground)] text-[var(--text)] rounded-sm border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-[var(--text)]">{resolvedStrings.form.recurrenceLabel}</span>
            <LargeDropdown
              currentSelection={form.pattern}
              selection={recurrenceSelection}
              effect={onPatternSelect}
            />
          </div>

          <div className="text-sm text-gray-400">
            <strong className="text-[var(--text)]">{resolvedStrings.form.summaryLabel}:</strong>{" "}
            {recurrenceSummary}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-sm transition"
            >
              {editingId ? resolvedStrings.buttons.update : resolvedStrings.buttons.create}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="border border-border px-4 py-2 rounded-sm hover:bg-[var(--background-muted)] transition text-[var(--text)]"
                disabled={loading}
              >
                {resolvedStrings.buttons.cancel}
              </button>
            )}
          </div>
        </form>

        <section>
          <h2 className="text-xl font-semibold text-[var(--text)] mb-4">{resolvedStrings.list.title}</h2>
          {events.length === 0 ? (
            <div className="text-gray-400 border border-dashed border-border rounded-lg p-6 text-center">
              {resolvedStrings.list.empty}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const isEditing = editingId === event.id;
                const starts = formatDisplayDate(event.startTime, locale, resolvedStrings.list.missingStart);
                const scheduleSummary = describeRecurrence(event, resolvedStrings, locale, listFormatter);
                return (
                  <div
                    key={event.id}
                    className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition ${
                      isEditing ? "border-blue-500 bg-blue-500/10 shadow-lg" : "border-border"
                    }`}
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text)]">{event.name}</h3>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>{resolvedStrings.list.starts.replace("{value}", starts)}</p>
                        <p>{resolvedStrings.list.recurrence.replace("{value}", scheduleSummary)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 rounded-sm border border-border hover:bg-[var(--background-muted)] transition text-[var(--text)]"
                        onClick={() => handleEdit(event)}
                        disabled={loading && !isEditing}
                      >
                        {resolvedStrings.buttons.edit}
                      </button>
                      <button
                        className="px-4 py-2 rounded-sm bg-red-500 hover:bg-red-600 transition text-white disabled:opacity-50"
                        onClick={() => handleDelete(event.id)}
                        disabled={loading}
                      >
                        {resolvedStrings.buttons.delete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </PageBox>

      {loading && <div className="text-gray-400 text-center mt-4">{resolvedStrings.status.working}</div>}
    </div>
  );
};

function sortEvents(events: ShiftEvent[]): ShiftEvent[] {
  return [...events].sort((a, b) => {
    const aTime = a.startTime ? Date.parse(a.startTime) : Number.MAX_SAFE_INTEGER;
    const bTime = b.startTime ? Date.parse(b.startTime) : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

export default ClientShiftScheduler;

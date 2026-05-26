import {
  combineDateAndTime,
  splitDatetimeLocal,
  type MobileDateTimeRangeValue,
} from "@/components/ui/mobile-date-field";
import type { SeriesSessionDraft } from "@/components/interest/ActivityFormFields";
import type { ActivityOccurrence, GroupActivity } from "@/data/interestTypes";
import { parseRecurringFormState } from "@/lib/interestOccurrences";

const toDatetimeLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const emptySchedule = (): MobileDateTimeRangeValue => ({
  date: "",
  startTime: "",
  endTime: "",
});

export const isoToSchedule = (
  startIso?: string,
  endIso?: string,
): MobileDateTimeRangeValue => {
  const start = splitDatetimeLocal(
    startIso ? toDatetimeLocal(startIso) : "",
  );
  const end = splitDatetimeLocal(endIso ? toDatetimeLocal(endIso) : "");
  return {
    date: start.date,
    startTime: start.time,
    endTime: end.time,
  };
};

export const occurrencesToSeriesSessions = (
  occs: ActivityOccurrence[],
): SeriesSessionDraft[] =>
  [...occs]
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
    .map((o, i) => ({
      key: o.id || `s-${i}`,
      ...isoToSchedule(o.startAt, o.endAt),
    }));

export const activityToFormValues = (
  activity: GroupActivity,
  occurrences: ActivityOccurrence[] = [],
) => {
  const recurring = parseRecurringFormState(activity);
  return {
    kind: activity.activityKind,
    title: activity.title,
    description: activity.description,
    location: activity.location ?? "",
    capacity: String(activity.capacity ?? ""),
    coverUrl: activity.coverUrl,
    oneOffSchedule: isoToSchedule(activity.startAt, activity.endAt),
    seriesSessions:
      activity.activityKind === "series"
        ? occurrencesToSeriesSessions(occurrences)
        : [],
    ...recurring,
  };
};

export const scheduleToIso = (schedule: MobileDateTimeRangeValue) => ({
  startAt: new Date(
    combineDateAndTime(schedule.date, schedule.startTime),
  ).toISOString(),
  endAt: new Date(
    combineDateAndTime(schedule.date, schedule.endTime),
  ).toISOString(),
});

import type { ActivityOccurrence, GroupActivity } from "@/data/interestTypes";
import {
  applySessionEndAt,
  formatOccurrenceLabel,
  getActivityPhase,
  nextMonthlyOccurrence,
  nextWeeklyOccurrence,
  WEEKDAY_OPTIONS,
} from "@/lib/interestOccurrences";
import { getSeriesEnrollmentMode } from "@/lib/seriesEnrollment";

/** 报名场次选择器：展示最近 N 场未结束场次 */
export const ENROLLMENT_PICKER_SESSION_LIMIT = 10;

export type PickerOccurrenceState =
  | "selectable"
  | "enrolled"
  | "full"
  | "past"
  | "cancelled";

export type PickerOccurrenceRow = {
  occurrence: ActivityOccurrence;
  state: PickerOccurrenceState;
  disabledReason?: string;
  seriesIndex?: number;
};

const sortByStart = (occs: ActivityOccurrence[]) =>
  [...occs].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );

const upcomingNotEnded = (occs: ActivityOccurrence[]) => {
  const now = Date.now();
  return sortByStart(
    occs.filter(
      (o) =>
        o.status !== "cancelled" && new Date(o.endAt).getTime() > now,
    ),
  );
};

/** 取最近 N 场未结束场次，其余计入 beyondCount */
export const sliceOccurrencesForEnrollmentPicker = (
  occurrences: ActivityOccurrence[],
  limit = ENROLLMENT_PICKER_SESSION_LIMIT,
) => {
  const upcoming = upcomingNotEnded(occurrences);
  return {
    visible: upcoming.slice(0, limit),
    beyondCount: Math.max(0, upcoming.length - limit),
  };
};

const matchStoredOccurrence = (
  stored: ActivityOccurrence[],
  startAt: string,
) =>
  stored.find(
    (o) =>
      Math.abs(new Date(o.startAt).getTime() - new Date(startAt).getTime()) <
      60_000,
  );

const genOccurrenceId = (activityId: string, startAt: string) =>
  `occ-gen-${activityId}-${new Date(startAt).getTime()}`;

/** 周期活动：生成未来场次（供截取最近 N 场） */
export const expandRecurringSlotsForPicker = (
  activity: GroupActivity,
  stored: ActivityOccurrence[],
): ActivityOccurrence[] => {
  if (!activity.startAt || !activity.rrule) return sortByStart(stored);

  const startTemplate = new Date(activity.startAt);
  const hour = startTemplate.getHours();
  const minute = startTemplate.getMinutes();
  const endTemplate = activity.endAt ?? activity.startAt;
  const maxSlots = ENROLLMENT_PICKER_SESSION_LIMIT + 12;

  const slotStarts: string[] = [];
  const from = new Date();

  if (activity.rrule.includes("MONTHLY")) {
    const m = activity.rrule.match(/BYMONTHDAY=(\d+)/);
    const monthDay = m ? Number(m[1]) : startTemplate.getDate();
    let cursor = nextMonthlyOccurrence(monthDay, hour, minute, from);
    while (slotStarts.length < maxSlots) {
      slotStarts.push(cursor.toISOString());
      const nextFrom = new Date(cursor);
      nextFrom.setDate(nextFrom.getDate() + 1);
      cursor = nextMonthlyOccurrence(monthDay, hour, minute, nextFrom);
    }
  } else {
    const dayMatch = activity.rrule.match(/BYDAY=([A-Z,]+)/);
    const weekdays: number[] = dayMatch
      ? dayMatch[1]
          .split(",")
          .map(
            (code) =>
              WEEKDAY_OPTIONS.find((w) => w.rrule === code)?.value,
          )
          .filter((v): v is number => v != null)
      : [startTemplate.getDay()];

    let weekCursor = new Date(from);
    for (let w = 0; w < 40 && slotStarts.length < maxSlots; w++) {
      for (const wd of weekdays) {
        const d = nextWeeklyOccurrence(wd, hour, minute, weekCursor);
        if (d.getTime() >= from.getTime() - 60_000) {
          const iso = d.toISOString();
          if (!slotStarts.includes(iso)) slotStarts.push(iso);
        }
        if (slotStarts.length >= maxSlots) break;
      }
      weekCursor = new Date(weekCursor.getTime() + 7 * 86400000);
    }
  }

  slotStarts.sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  const generated = slotStarts.map((startAt) => {
    const existing = matchStoredOccurrence(stored, startAt);
    if (existing) return existing;
    return {
      id: genOccurrenceId(activity.id, startAt),
      activityId: activity.id,
      startAt,
      endAt: applySessionEndAt(startAt, endTemplate),
      capacity: activity.capacity,
      enrollCount: 0,
      status: "scheduled" as const,
    };
  });

  const seen = new Set(generated.map((o) => o.id));
  const extras = stored.filter((o) => !seen.has(o.id));
  return sortByStart([...generated, ...extras]);
};

const allOccurrencesForPicker = (
  activity: GroupActivity,
  stored: ActivityOccurrence[],
) => {
  const base = stored.filter((o) => o.status !== "cancelled");
  if (activity.activityKind === "recurring") {
    return expandRecurringSlotsForPicker(activity, base);
  }
  return sortByStart(base);
};

export const listOccurrencesForEnrollmentPicker = (
  activity: GroupActivity,
  stored: ActivityOccurrence[],
): ActivityOccurrence[] =>
  sliceOccurrencesForEnrollmentPicker(
    allOccurrencesForPicker(activity, stored),
  ).visible;

export const getEnrollmentPickerBeyondCount = (
  activity: GroupActivity,
  stored: ActivityOccurrence[],
) =>
  sliceOccurrencesForEnrollmentPicker(
    allOccurrencesForPicker(activity, stored),
  ).beyondCount;

const sameStart = (a: string, b: string) =>
  Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 60_000;

/** 场次是否落在「最近 N 场」报名窗口内 */
export const isOccurrenceInEnrollmentPickerWindow = (
  activity: GroupActivity,
  stored: ActivityOccurrence[],
  occurrence: ActivityOccurrence,
): boolean => {
  const { visible } = sliceOccurrencesForEnrollmentPicker(
    allOccurrencesForPicker(activity, stored),
  );
  return visible.some(
    (o) => o.id === occurrence.id || sameStart(o.startAt, occurrence.startAt),
  );
};

export const buildPickerRows = (
  activity: GroupActivity,
  occurrences: ActivityOccurrence[],
  enrolledOccurrenceIds: Set<string>,
): PickerOccurrenceRow[] => {
  const now = Date.now();
  const sorted = sortByStart(occurrences);

  return sorted
    .map((occurrence, index) => {
      const seriesIndex =
        activity.activityKind === "series" ? index : undefined;
      if (occurrence.status === "cancelled") {
        return {
          occurrence,
          state: "cancelled" as const,
          disabledReason: "已取消",
          seriesIndex,
        };
      }
      const end = new Date(occurrence.endAt).getTime();
      if (end <= now) {
        return {
          occurrence,
          state: "past" as const,
          disabledReason: "已结束",
          seriesIndex,
        };
      }
      if (enrolledOccurrenceIds.has(occurrence.id)) {
        return {
          occurrence,
          state: "enrolled" as const,
          disabledReason: "已报名",
          seriesIndex,
        };
      }
      if (
        occurrence.capacity != null &&
        occurrence.enrollCount >= occurrence.capacity
      ) {
        return {
          occurrence,
          state: "full" as const,
          disabledReason: "名额已满",
          seriesIndex,
        };
      }
      return { occurrence, state: "selectable" as const, seriesIndex };
    })
    .filter((row) => row.state !== "past" && row.state !== "cancelled");
};

export const usesMultiOccurrenceEnrollment = (activity: GroupActivity) => {
  if (activity.activityKind === "recurring") return true;
  if (
    activity.activityKind === "series" &&
    getSeriesEnrollmentMode(activity) === "per_occurrence"
  ) {
    return true;
  }
  return false;
};

export const formatPickerOccurrenceLabel = (
  row: PickerOccurrenceRow,
  activity: GroupActivity,
) =>
  formatOccurrenceLabel(
    row.occurrence,
    activity.activityKind === "series" ? row.seriesIndex : undefined,
  );

const WEEKDAY_ZH = ["日", "一", "二", "三", "四", "五", "六"] as const;

/** 场次选择器：日期行（如 5/29 周三） */
export const formatPickerSlotDateLine = (startAt: string) => {
  const d = new Date(startAt);
  return `${d.getMonth() + 1}/${d.getDate()} 周${WEEKDAY_ZH[d.getDay()]}`;
};

/** 场次选择器：时段行（如 18:30–20:00） */
export const formatPickerSlotTimeLine = (
  startAt: string,
  endAt?: string,
) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const s = new Date(startAt);
  const start = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
  if (!endAt) return start;
  const e = new Date(endAt);
  const end = `${pad(e.getHours())}:${pad(e.getMinutes())}`;
  return `${start}–${end}`;
};

export const formatPickerMonthGroup = (startAt: string) => {
  const d = new Date(startAt);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
};

/** 是否仍有可新报名的场次（不含已报满的已报场次） */
export const hasSelectablePickerRows = (rows: PickerOccurrenceRow[]) =>
  rows.some((r) => r.state === "selectable");

export const getActivityDisplayPhaseForEnrollments = (
  activity: GroupActivity,
  occurrences: ActivityOccurrence[],
  enrolledOccurrenceIds: Set<string>,
) => {
  if (enrolledOccurrenceIds.size > 0) {
    const enrolledOccs = occurrences.filter((o) =>
      enrolledOccurrenceIds.has(o.id),
    );
    const nextEnrolled = enrolledOccs.find(
      (o) => getActivityPhase(o.startAt, o.endAt) !== "已结束",
    );
    if (nextEnrolled) {
      return getActivityPhase(nextEnrolled.startAt, nextEnrolled.endAt);
    }
  }
  const next = occurrences.find((o) => o.status === "scheduled");
  return getActivityPhase(
    next?.startAt ?? activity.startAt,
    next?.endAt ?? activity.endAt,
  );
};

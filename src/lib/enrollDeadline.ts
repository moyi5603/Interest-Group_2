import type { SeriesSessionDraft } from "@/components/interest/ActivityFormFields";
import {
  combineDateAndTime,
  formatMobileTime,
  formatShortDate,
  splitDatetimeLocal,
  type MobileDateTimeRangeValue,
} from "@/components/ui/mobile-date-field";
import type {
  ActivityKind,
  EnrollDeadlineMode,
  GroupActivity,
} from "@/data/interestTypes";
import {
  buildRecurringStartAt,
  parseRecurringTime,
} from "@/lib/interestOccurrences";

export type EnrollDeadlineFormMode = "none" | EnrollDeadlineMode;

export type EnrollDeadlineFixedValue = {
  date: string;
  time: string;
};

export type EnrollDeadlineFormValue = {
  mode: EnrollDeadlineFormMode;
  fixed: EnrollDeadlineFixedValue;
  hoursBefore: string;
};

export const ENROLL_DEADLINE_HOUR_PRESETS = [2, 8, 12, 24] as const;

export const emptyEnrollDeadlineForm = (): EnrollDeadlineFormValue => ({
  mode: "none",
  fixed: { date: "", time: "" },
  hoursBefore: "24",
});

const toDatetimeLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const isoToEnrollDeadlineFixed = (
  iso?: string,
): EnrollDeadlineFixedValue => {
  const parts = splitDatetimeLocal(iso ? toDatetimeLocal(iso) : "");
  return { date: parts.date, time: parts.time };
};

export const enrollDeadlineFormFromActivity = (
  activity: GroupActivity,
): EnrollDeadlineFormValue => {
  if (
    activity.enrollDeadlineMode === "hours_before_start" &&
    activity.enrollDeadlineHoursBefore != null
  ) {
    return {
      mode: "hours_before_start",
      fixed: emptyEnrollDeadlineForm().fixed,
      hoursBefore: String(activity.enrollDeadlineHoursBefore),
    };
  }
  if (activity.enrollDeadline) {
    return {
      mode: "fixed",
      fixed: isoToEnrollDeadlineFixed(activity.enrollDeadline),
      hoursBefore: "24",
    };
  }
  return emptyEnrollDeadlineForm();
};

export type EnrollDeadlineScheduleContext = {
  activityKind: ActivityKind;
  oneOffSchedule: MobileDateTimeRangeValue;
  seriesSessions: SeriesSessionDraft[];
  recurrence: "weekly" | "monthly";
  weeklyDay: number | null;
  monthDay: number | null;
  recurringTime: string;
};

export const getEnrollDeadlineReferenceStartAt = (
  ctx: EnrollDeadlineScheduleContext,
): string | undefined => {
  if (ctx.activityKind === "one_off") {
    const iso = combineDateAndTime(
      ctx.oneOffSchedule.date,
      ctx.oneOffSchedule.startTime,
    );
    return iso ? new Date(iso).toISOString() : undefined;
  }
  if (ctx.activityKind === "series") {
    const starts = ctx.seriesSessions
      .map((s) => combineDateAndTime(s.date, s.startTime))
      .filter(Boolean)
      .map((iso) => new Date(iso).getTime())
      .filter((t) => !Number.isNaN(t));
    if (starts.length === 0) return undefined;
    return new Date(Math.min(...starts)).toISOString();
  }
  if (ctx.activityKind === "recurring") {
    if (!ctx.recurringTime) return undefined;
    if (ctx.recurrence === "weekly" && ctx.weeklyDay == null) return undefined;
    if (ctx.recurrence === "monthly" && ctx.monthDay == null) return undefined;
    const { hour, minute } = parseRecurringTime(ctx.recurringTime);
    return buildRecurringStartAt(ctx.recurrence, {
      weekday: ctx.weeklyDay ?? 0,
      monthDay: ctx.monthDay ?? 1,
      hour,
      minute,
    });
  }
  return undefined;
};

export const validateEnrollDeadlineForm = (
  form: EnrollDeadlineFormValue,
  referenceStartAt?: string,
): string | undefined => {
  if (form.mode === "none") return undefined;
  if (!referenceStartAt) {
    return "请先填写活动时间，再设置报名截止";
  }
  const refMs = new Date(referenceStartAt).getTime();
  if (form.mode === "fixed") {
    if (!form.fixed.date || !form.fixed.time) {
      return "请选择报名截止时间";
    }
    const deadlineMs = new Date(
      combineDateAndTime(form.fixed.date, form.fixed.time),
    ).getTime();
    if (Number.isNaN(deadlineMs)) return "报名截止时间无效";
    if (deadlineMs >= refMs) return "报名截止须早于活动开始时间";
    return undefined;
  }
  const hours = Number(form.hoursBefore);
  if (!form.hoursBefore.trim() || Number.isNaN(hours) || hours <= 0) {
    return "请填写有效的截止小时数";
  }
  if (!Number.isInteger(hours)) return "截止小时数须为整数";
  if (hours > 24 * 30) return "截止小时数过长";
  return undefined;
};

export const buildEnrollDeadlinePatch = (
  form: EnrollDeadlineFormValue,
  ctx: EnrollDeadlineScheduleContext,
): {
  patch: Pick<
    GroupActivity,
    "enrollDeadline" | "enrollDeadlineMode" | "enrollDeadlineHoursBefore"
  >;
  error?: string;
} => {
  const referenceStartAt = getEnrollDeadlineReferenceStartAt(ctx);
  const error = validateEnrollDeadlineForm(form, referenceStartAt);
  if (error) return { patch: {}, error };
  return {
    patch: resolveEnrollDeadlineFields(form, referenceStartAt),
  };
};

export const resolveEnrollDeadlineFields = (
  form: EnrollDeadlineFormValue,
  referenceStartAt?: string,
): Pick<
  GroupActivity,
  "enrollDeadline" | "enrollDeadlineMode" | "enrollDeadlineHoursBefore"
> => {
  if (form.mode === "none") {
    return {
      enrollDeadline: undefined,
      enrollDeadlineMode: undefined,
      enrollDeadlineHoursBefore: undefined,
    };
  }
  const refMs = new Date(referenceStartAt!).getTime();
  if (form.mode === "fixed") {
    return {
      enrollDeadline: new Date(
        combineDateAndTime(form.fixed.date, form.fixed.time),
      ).toISOString(),
      enrollDeadlineMode: "fixed",
      enrollDeadlineHoursBefore: undefined,
    };
  }
  const hours = Number(form.hoursBefore);
  return {
    enrollDeadline: new Date(refMs - hours * 3600000).toISOString(),
    enrollDeadlineMode: "hours_before_start",
    enrollDeadlineHoursBefore: hours,
  };
};

export const ENROLL_CLOSING_SOON_MS = 4 * 3600000;

/** 距报名截止不足 withinMs 且尚未截止 */
export const isEnrollClosingSoon = (
  activity: GroupActivity,
  now = Date.now(),
  withinMs = ENROLL_CLOSING_SOON_MS,
): boolean => {
  if (activity.status === "cancelled") return false;
  if (!activity.enrollDeadline) return false;
  const deadlineMs = new Date(activity.enrollDeadline).getTime();
  if (Number.isNaN(deadlineMs)) return false;
  if (now >= deadlineMs) return false;
  return deadlineMs - now <= withinMs;
};

export const formatEnrollDeadlineDateTime = (
  activity: GroupActivity,
): string | undefined => {
  if (!activity.enrollDeadline) return undefined;
  const fixed = isoToEnrollDeadlineFixed(activity.enrollDeadline);
  if (!fixed.date) return undefined;
  const datePart = formatShortDate(fixed.date);
  const timePart = formatMobileTime(fixed.time);
  if (!datePart) return undefined;
  if (!timePart || timePart === "--:--") return datePart;
  return `${datePart} ${timePart}`;
};

export const formatEnrollDeadlineLabel = (activity: GroupActivity): string => {
  const dateTime = formatEnrollDeadlineDateTime(activity);
  if (!dateTime) return "不限制";
  if (
    activity.enrollDeadlineMode === "hours_before_start" &&
    activity.enrollDeadlineHoursBefore != null
  ) {
    return `${dateTime}（开始前 ${activity.enrollDeadlineHoursBefore} 小时）`;
  }
  return dateTime;
};

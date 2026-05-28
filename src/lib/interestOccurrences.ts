import type { ActivityOccurrence, GroupActivity } from "@/data/interestTypes";

export const WEEKDAY_OPTIONS = [
  { value: 1, label: "一", rrule: "MO" },
  { value: 2, label: "二", rrule: "TU" },
  { value: 3, label: "三", rrule: "WE" },
  { value: 4, label: "四", rrule: "TH" },
  { value: 5, label: "五", rrule: "FR" },
  { value: 6, label: "六", rrule: "SA" },
  { value: 0, label: "日", rrule: "SU" },
] as const;

const addDays = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const setMonthlyDay = (d: Date, dayOfMonth: number) => {
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dayOfMonth, lastDay));
};

export const parseRecurringTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return { hour: h || 0, minute: m || 0 };
};

/** 下一次 weekly 场次（weekday: JS getDay，0=周日） */
export const nextWeeklyOccurrence = (
  weekday: number,
  hour: number,
  minute: number,
  from = new Date(),
): Date => {
  const d = new Date(from);
  d.setSeconds(0, 0);
  d.setMilliseconds(0);
  d.setHours(hour, minute, 0, 0);
  let daysUntil = (weekday - d.getDay() + 7) % 7;
  if (daysUntil === 0 && d.getTime() <= from.getTime()) daysUntil = 7;
  d.setDate(d.getDate() + daysUntil);
  return d;
};

/** 下一次 monthly 场次 */
export const nextMonthlyOccurrence = (
  dayOfMonth: number,
  hour: number,
  minute: number,
  from = new Date(),
): Date => {
  const d = new Date(from);
  d.setSeconds(0, 0);
  d.setMilliseconds(0);
  d.setHours(hour, minute, 0, 0);
  setMonthlyDay(d, dayOfMonth);
  if (d.getTime() <= from.getTime()) {
    d.setMonth(d.getMonth() + 1);
    setMonthlyDay(d, dayOfMonth);
  }
  return d;
};

export const buildWeeklyRrule = (weekdayRrule: string) =>
  `FREQ=WEEKLY;BYDAY=${weekdayRrule}`;

export const buildMonthlyRrule = (dayOfMonth: number) =>
  `FREQ=MONTHLY;BYMONTHDAY=${dayOfMonth}`;

export const buildRecurringStartAt = (
  recurrence: "weekly" | "monthly",
  options: {
    weekday: number;
    monthDay: number;
    hour: number;
    minute: number;
  },
): string => {
  if (recurrence === "monthly") {
    return nextMonthlyOccurrence(
      options.monthDay,
      options.hour,
      options.minute,
    ).toISOString();
  }
  return nextWeeklyOccurrence(
    options.weekday,
    options.hour,
    options.minute,
  ).toISOString();
};

/** 将 activity.endAt 的时分应用到某场 startAt 的日期上 */
export const applySessionEndAt = (startAt: string, endTemplateIso: string) => {
  const end = new Date(endTemplateIso);
  const d = new Date(startAt);
  d.setHours(end.getHours(), end.getMinutes(), 0, 0);
  return d.toISOString();
};

export const isEndAfterStart = (startAt: string, endAt: string) =>
  new Date(endAt).getTime() > new Date(startAt).getTime();

export const isSameDayEndAfterStart = (startTime: string, endTime: string) => {
  const { hour: sh, minute: sm } = parseRecurringTime(startTime);
  const { hour: eh, minute: em } = parseRecurringTime(endTime);
  return eh * 60 + em > sh * 60 + sm;
};

/** 周期活动：在同一天将结束时刻应用到首场开始日期 */
export const buildRecurringEndAt = (startAtIso: string, endTime: string) => {
  const { hour, minute } = parseRecurringTime(endTime);
  const d = new Date(startAtIso);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const isSameCalendarDay = (startAt: string, endAt: string) => {
  const s = new Date(startAt);
  const e = new Date(endAt);
  return (
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate()
  );
};

export const formatActivityTimeOfDay = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** 同一天：日期 + 开始时刻 – 结束时刻；跨天则两端均含日期 */
export const formatTimeRange = (startAt: string, endAt?: string) => {
  if (!endAt || endAt === startAt) return formatActivityTime(startAt);
  if (isSameCalendarDay(startAt, endAt)) {
    return `${formatActivityTime(startAt)} – ${formatActivityTimeOfDay(endAt)}`;
  }
  return `${formatActivityTime(startAt)} – ${formatActivityTime(endAt)}`;
};

export const expandRecurringOccurrences = (
  activity: GroupActivity,
  count = 4,
): ActivityOccurrence[] => {
  if (!activity.startAt) return [];
  const isMonthly = activity.rrule?.includes("MONTHLY");
  const monthDayMatch = activity.rrule?.match(/BYMONTHDAY=(\d+)/);
  const monthDay = monthDayMatch ? Number(monthDayMatch[1]) : undefined;
  const endTemplate = activity.endAt;

  let cursor = new Date(activity.startAt);
  return Array.from({ length: count }, (_, i) => {
    const startAt = cursor.toISOString();
    const endAt = endTemplate
      ? applySessionEndAt(startAt, endTemplate)
      : startAt;
    if (i < count - 1) {
      if (isMonthly && monthDay) {
        const next = new Date(cursor);
        next.setMonth(next.getMonth() + 1);
        setMonthlyDay(next, monthDay);
        next.setHours(cursor.getHours(), cursor.getMinutes(), 0, 0);
        cursor = next;
      } else {
        cursor = new Date(addDays(startAt, 7));
      }
    }
    return {
      id: `occ-gen-${activity.id}-${i}`,
      activityId: activity.id,
      startAt,
      endAt,
      capacity: activity.capacity,
      enrollCount: 0,
      status: "scheduled" as const,
    };
  });
};

export type SeriesSessionSlot = { startAt: string; endAt: string };

/** 根据创建页填写的系列场次时间生成 Occurrence 列表（按开始时间升序） */
export const buildSeriesOccurrences = (
  activityId: string,
  sessions: SeriesSessionSlot[],
  capacity?: number,
): ActivityOccurrence[] =>
  [...sessions]
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
    .map((session, i) => ({
      id: `occ-${activityId}-s${i}`,
      activityId,
      startAt: session.startAt,
      endAt: session.endAt,
      capacity,
      enrollCount: 0,
      status: "scheduled" as const,
    }));

/** 单次活动报名是否被截止/结束等阻断（不含名额已满） */
export const oneOffEnrollmentBlockedReason = (
  activity: GroupActivity,
): string | undefined => {
  if (activity.activityKind !== "one_off") return undefined;
  const phase = getActivityPhase(activity.startAt, activity.endAt);
  if (phase === "已结束") return "活动已结束";
  const now = Date.now();
  if (
    activity.enrollDeadline &&
    now > new Date(activity.enrollDeadline).getTime()
  ) {
    return "已过报名截止时间";
  }
  return undefined;
};

export const getActivityPhase = (
  startAt?: string,
  endAt?: string,
): "未开始" | "进行中" | "已结束" => {
  const now = Date.now();
  const start = startAt ? new Date(startAt).getTime() : now;
  const end = endAt ? new Date(endAt).getTime() : start + 3600000;
  if (now < start) return "未开始";
  if (now > end) return "已结束";
  return "进行中";
};

export const formatActivityTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const formatOccurrenceLabel = (
  occ: { startAt: string; endAt?: string },
  index?: number,
) => {
  const range = formatTimeRange(occ.startAt, occ.endAt);
  return index != null ? `第${index + 1}场 · ${range}` : range;
};

/** 「我报名的场次」卡片副标题：不论活动类型，均展示该场次日期 + 时间 */
export const getEnrolledOccurrenceScheduleLabel = (
  occurrence: Pick<ActivityOccurrence, "startAt" | "endAt">,
): string => formatTimeRange(occurrence.startAt, occurrence.endAt);

export type ActivityScheduleLabelOptions = {
  /** 我发布的系列活动卡片：展示「系列 · 共 n 场」 */
  seriesSessionTotal?: boolean;
};

/** 活动卡片时间文案（含已结束的周期/系列） */
export const getActivityScheduleLabel = (
  activity: GroupActivity,
  occurrence?: ActivityOccurrence,
  allOccurrences?: ActivityOccurrence[],
  options?: ActivityScheduleLabelOptions,
): string | undefined => {
  if (activity.activityKind === "recurring") {
    return (
      formatRecurringSchedule(
        activity.rrule,
        activity.startAt ?? occurrence?.startAt,
        activity.endAt ?? occurrence?.endAt,
      ) ?? undefined
    );
  }
  if (activity.activityKind === "series") {
    const occs = allOccurrences ?? [];
    if (options?.seriesSessionTotal) {
      const n = occs.length;
      return n > 0 ? `系列 · 共 ${n} 场` : "系列活动";
    }
    if (occurrence) {
      const idx = occs.findIndex((o) => o.id === occurrence.id);
      if (idx >= 0) {
        return `系列 · 第 ${idx + 1} 场 · ${formatActivityTime(occurrence.startAt)}`;
      }
      return formatTimeRange(occurrence.startAt, occurrence.endAt);
    }
  }
  const start = occurrence?.startAt ?? activity.startAt;
  const end = occurrence?.endAt ?? activity.endAt;
  return start ? formatTimeRange(start, end) : undefined;
};

export const formatRecurringSchedule = (
  rrule?: string,
  startAt?: string,
  endAt?: string,
): string | undefined => {
  if (!rrule || !startAt) return undefined;
  const d = new Date(startAt);
  const startTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const time =
    endAt && endAt !== startAt
      ? `${startTime} – ${formatActivityTime(endAt).split(" ").pop()}`
      : startTime;
  if (rrule.includes("MONTHLY")) {
    const m = rrule.match(/BYMONTHDAY=(\d+)/);
    const day = m ? m[1] : d.getDate();
    return `每月 ${day} 日 ${time}`;
  }
  const dayMatch = rrule.match(/BYDAY=([A-Z,]+)/);
  if (dayMatch) {
    const labels = dayMatch[1]
      .split(",")
      .map((code) => WEEKDAY_OPTIONS.find((w) => w.rrule === code)?.label)
      .filter(Boolean);
    if (labels.length) return `每周${labels.join("、")} ${time}`;
  }
  return undefined;
};

const padTime = (h: number, m: number) =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

export type RecurringFormState = {
  recurrence: "weekly" | "monthly";
  weeklyDay: number;
  monthDay: number;
  recurringTime: string;
  recurringEndTime: string;
};

/** 从已发布周期活动还原创建/编辑表单状态 */
export const parseRecurringFormState = (
  activity: Pick<GroupActivity, "rrule" | "startAt" | "endAt">,
): RecurringFormState => {
  const start = activity.startAt ? new Date(activity.startAt) : new Date();
  const end = activity.endAt ? new Date(activity.endAt) : start;
  const recurringTime = padTime(start.getHours(), start.getMinutes());
  const recurringEndTime = padTime(end.getHours(), end.getMinutes());
  const isMonthly = activity.rrule?.includes("MONTHLY");

  if (isMonthly) {
    const m = activity.rrule?.match(/BYMONTHDAY=(\d+)/);
    return {
      recurrence: "monthly",
      weeklyDay: start.getDay(),
      monthDay: m ? Number(m[1]) : start.getDate(),
      recurringTime,
      recurringEndTime,
    };
  }

  const dayMatch = activity.rrule?.match(/BYDAY=([A-Z]+)/);
  const weekday =
    dayMatch &&
    WEEKDAY_OPTIONS.find((w) => w.rrule === dayMatch[1])?.value;
  return {
    recurrence: "weekly",
    weeklyDay: weekday ?? start.getDay(),
    monthDay: start.getDate(),
    recurringTime,
    recurringEndTime,
  };
};

import type {
  ActivityOccurrence,
  GroupActivity,
  SeriesEnrollmentMode,
} from "@/data/interestTypes";
import { sliceOccurrencesForEnrollmentPicker } from "@/lib/occurrenceEnrollmentPicker";
import { getActivityPhase } from "@/lib/interestOccurrences";

export const SERIES_ENROLLMENT_MODE_OPTIONS: {
  value: SeriesEnrollmentMode;
  label: string;
  description: string;
}[] = [
  {
    value: "once_before_first",
    label: "整场报名",
    description:
      "仅首场开始前可报名，报一次参加全部场次（如篮球赛初赛→决赛）",
  },
  {
    value: "per_occurrence",
    label: "按场次报名",
    description: "每场可单独报名，允许临时参加某一场（如系列分享会）",
  },
];

export const SERIES_ENROLLMENT_MODE_LABEL: Record<SeriesEnrollmentMode, string> =
  {
    once_before_first: "整场报名",
    per_occurrence: "按场次报名",
  };

export const getSeriesEnrollmentMode = (
  activity: GroupActivity,
): SeriesEnrollmentMode =>
  activity.seriesEnrollmentMode ?? "per_occurrence";

export const sortOccurrencesByStart = (occs: ActivityOccurrence[]) =>
  [...occs].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );

/** 系列首场（按开始时间） */
export const getFirstSeriesOccurrence = (occs: ActivityOccurrence[]) =>
  sortOccurrencesByStart(occs)[0];

/** 首场是否尚未开始 */
export const isBeforeFirstSeriesSession = (
  activity: GroupActivity,
  occs: ActivityOccurrence[],
): boolean => {
  const first = getFirstSeriesOccurrence(
    occs.filter((o) => o.status !== "cancelled"),
  );
  if (!first) return false;
  return getActivityPhase(first.startAt, first.endAt) === "未开始";
};

/** 整场报名模式是否仍开放 */
export const isSeriesWholeEnrollmentOpen = (
  activity: GroupActivity,
  occs: ActivityOccurrence[],
): boolean => {
  if (getSeriesEnrollmentMode(activity) !== "once_before_first") return true;
  if (!isBeforeFirstSeriesSession(activity, occs)) return false;
  const now = Date.now();
  if (
    activity.enrollDeadline &&
    now > new Date(activity.enrollDeadline).getTime()
  ) {
    return false;
  }
  return true;
};

/** 当前可报名的系列场次 */
export const getEnrollableSeriesOccurrences = (
  activity: GroupActivity,
  occs: ActivityOccurrence[],
): ActivityOccurrence[] => {
  const scheduled = sortOccurrencesByStart(
    occs.filter((o) => o.status === "scheduled"),
  );
  const now = Date.now();
  const upcoming = scheduled.filter(
    (o) => now < new Date(o.endAt).getTime(),
  );

  if (getSeriesEnrollmentMode(activity) === "once_before_first") {
    if (!isSeriesWholeEnrollmentOpen(activity, occs)) return [];
    const first = getFirstSeriesOccurrence(scheduled.length ? scheduled : occs);
    return first ? [first] : [];
  }

  return sliceOccurrencesForEnrollmentPicker(upcoming).visible;
};

export const seriesEnrollmentBlockedReason = (
  activity: GroupActivity,
  occs: ActivityOccurrence[],
): string | undefined => {
  if (activity.status === "cancelled") return "活动已终止";
  if (activity.activityKind !== "series") return undefined;
  if (getSeriesEnrollmentMode(activity) !== "once_before_first") return undefined;
  if (isSeriesWholeEnrollmentOpen(activity, occs)) return undefined;
  if (!isBeforeFirstSeriesSession(activity, occs)) {
    return "首场已开始，本系列活动不再接受新报名";
  }
  if (activity.enrollDeadline) {
    return "已过报名截止时间";
  }
  return "暂不可报名";
};

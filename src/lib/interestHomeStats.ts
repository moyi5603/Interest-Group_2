import {
  enrollments,
  getActivityById,
  getJoinedGroups,
  getMyCreatedGroups,
  getMyEnrolledOccurrences,
  getMyOrganizedActivities,
  getOccurrencesByActivity,
} from "@/data/interestGroups";
import {
  getAllPublishedActivities,
  getRecentActivities,
} from "./interestRecommend";
import { getActivityPhase } from "./interestOccurrences";

export type HomeStatsPeriod = "week" | "days30" | "days90";

export const HOME_STATS_PERIOD_OPTIONS: {
  key: HomeStatsPeriod;
  label: string;
}[] = [
  { key: "week", label: "本周" },
  { key: "days30", label: "近30天" },
  { key: "days90", label: "近90天" },
];

export type InterestHomeStatItem = {
  key: string;
  label: string;
  value: number;
  to: string;
};

export type InterestHomeTodoItem = {
  key: string;
  label: string;
  to: string;
};

export type InterestHomeStats = {
  items: InterestHomeStatItem[];
  todos?: InterestHomeTodoItem[];
  columns?: 3 | 4;
};

const ADMIN_GROUPS_PATH = "/agents/interest-groups/admin/groups";
const ADMIN_ACTIVITIES_PATH = "/agents/interest-groups/admin/activities";

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const startOfWeek = (d: Date) => {
  const day = startOfDay(d);
  const weekday = day.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  day.setDate(day.getDate() + mondayOffset);
  return day;
};

const getPeriodRange = (
  period: HomeStatsPeriod,
): { start: Date; end: Date } => {
  const now = new Date();
  if (period === "week") {
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }
  const start = startOfDay(now);
  start.setDate(start.getDate() - (period === "days30" ? 30 : 90));
  const end = new Date(startOfDay(now));
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const isInStatsPeriod = (iso: string | undefined, period: HomeStatsPeriod) => {
  if (!iso) return false;
  const { start, end } = getPeriodRange(period);
  const time = new Date(iso).getTime();
  return time >= start.getTime() && time < end.getTime();
};

const activityTouchesPeriod = (
  activityId: string,
  activityStartAt: string | undefined,
  period: HomeStatsPeriod,
) => {
  if (isInStatsPeriod(activityStartAt, period)) return true;
  return getOccurrencesByActivity(activityId).some((occ) =>
    isInStatsPeriod(occ.startAt, period),
  );
};

const countOccurrencesInPeriod = (
  activityIds: Iterable<string>,
  period: HomeStatsPeriod,
) => {
  let count = 0;
  for (const activityId of activityIds) {
    for (const occ of getOccurrencesByActivity(activityId)) {
      if (occ.status === "cancelled") continue;
      if (isInStatsPeriod(occ.startAt, period)) count += 1;
    }
  }
  return count;
};

const countPeriodEnrollments = (
  groupIds: Set<string>,
  period: HomeStatsPeriod,
) =>
  enrollments.filter((entry) => {
    if (entry.status !== "enrolled") return false;
    const activity = getActivityById(entry.activityId);
    if (!activity || !groupIds.has(activity.groupId)) return false;
    return isInStatsPeriod(entry.enrolledAt, period);
  }).length;

const periodActivityLabel = (period: HomeStatsPeriod) => {
  if (period === "week") return "本周活动";
  if (period === "days30") return "近30天活动";
  return "近90天活动";
};

const periodSessionLabel = (period: HomeStatsPeriod) => {
  if (period === "week") return "本周场次";
  if (period === "days30") return "近30天场次";
  return "近90天场次";
};

const periodEnrollmentLabel = (period: HomeStatsPeriod) => {
  if (period === "week") return "本周报名";
  if (period === "days30") return "近30天报名";
  return "近90天报名";
};

const recentListPath = (period: HomeStatsPeriod) => {
  if (period === "week") return "/agents/interest-groups/list/recent?range=week";
  if (period === "days30") return "/agents/interest-groups/list/recent?range=month";
  return "/agents/interest-groups/list/recent";
};

export const getInterestHomeStats = (
  viewerId: string,
  period: HomeStatsPeriod = "week",
): InterestHomeStats => {
  const joinedGroupCount = getJoinedGroups(viewerId).length;

  const periodActivities = getRecentActivities(viewerId).filter((item) =>
    isInStatsPeriod(item.sortStartAt, period),
  );

  const notStartedActivityCount = getMyEnrolledOccurrences(viewerId, {
    excludeOrganized: true,
  }).filter(({ occurrence, activity }) => {
    const start = occurrence?.startAt ?? activity.startAt;
    if (!start) return false;
    const end = occurrence?.endAt ?? activity.endAt;
    return getActivityPhase(start, end) === "未开始";
  }).length;

  const items: InterestHomeStatItem[] = [
    {
      key: "groups",
      label: "已加入小组",
      value: joinedGroupCount,
      to: "/agents/interest-groups/list/my-groups",
    },
    {
      key: "not-started",
      label: "未开始活动",
      value: notStartedActivityCount,
      to: "/agents/interest-groups/my-activities?role=participated&phase=未开始",
    },
    {
      key: "period-activities",
      label: periodActivityLabel(period),
      value: periodActivities.length,
      to: recentListPath(period),
    },
  ];

  return { items, columns: 3 };
};

/** 管理员首页：我创建/管理范围内的运营指标 */
export const getManagerHomeStats = (
  viewerId: string,
  period: HomeStatsPeriod = "week",
): InterestHomeStats => {
  const createdGroups = getMyCreatedGroups(viewerId);
  const groupIds = new Set(createdGroups.map((g) => g.id));

  const publishedOrganizedCount = getMyOrganizedActivities(viewerId).filter(
    ({ activity }) =>
      activity.status === "published" &&
      activityTouchesPeriod(activity.id, activity.startAt, period),
  ).length;

  const myPublishedActivities = getAllPublishedActivities().filter((item) =>
    groupIds.has(item.group.id),
  );

  const managedActivityIds = myPublishedActivities.map(
    (item) => item.activity.id,
  );
  const sessionCount = countOccurrencesInPeriod(managedActivityIds, period);
  const periodEnrollments = countPeriodEnrollments(groupIds, period);

  const pendingReportCount = createdGroups.filter(
    (g) => g.reportStatus === "pending_report",
  ).length;

  const now = Date.now();
  let zeroEnrollmentCount = 0;
  for (const { activity } of myPublishedActivities) {
    const hasUpcomingEmpty = getOccurrencesByActivity(activity.id).some(
      (occ) =>
        occ.status === "scheduled" &&
        new Date(occ.startAt).getTime() >= now &&
        occ.enrollCount === 0,
    );
    if (hasUpcomingEmpty) zeroEnrollmentCount += 1;
  }

  const todos: InterestHomeTodoItem[] = [];
  if (pendingReportCount > 0) {
    todos.push({
      key: "pending-report",
      label: `${pendingReportCount} 个小组待报备`,
      to: ADMIN_GROUPS_PATH,
    });
  }
  if (zeroEnrollmentCount > 0) {
    todos.push({
      key: "zero-enrollment",
      label: `${zeroEnrollmentCount} 场活动零报名`,
      to: ADMIN_ACTIVITIES_PATH,
    });
  }

  return {
    columns: 3,
    items: [
      {
        key: "published-activities",
        label: "发布活动",
        value: publishedOrganizedCount,
        to: ADMIN_ACTIVITIES_PATH,
      },
      {
        key: "period-sessions",
        label: periodSessionLabel(period),
        value: sessionCount,
        to: ADMIN_ACTIVITIES_PATH,
      },
      {
        key: "members",
        label: periodEnrollmentLabel(period),
        value: periodEnrollments,
        to: ADMIN_GROUPS_PATH,
      },
    ],
    todos: todos.length > 0 ? todos : undefined,
  };
};

export const getHomeStats = (
  viewerId: string,
  isManager: boolean,
  period: HomeStatsPeriod = "week",
): InterestHomeStats =>
  isManager
    ? getManagerHomeStats(viewerId, period)
    : getInterestHomeStats(viewerId, period);

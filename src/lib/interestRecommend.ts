import { getEmployee } from "@/data/colleagueData";
import { getTagsByIds } from "@/data/interestTags";
import type { GroupActivity, InterestGroupFull } from "@/data/interestTypes";
import {
  activities,
  enrollments,
  getJoinedGroups,
  getGroupById,
  getOccurrencesByActivity,
  interestGroups,
  isGroupOwner,
  isMember,
  occurrences,
} from "@/data/interestGroups";
import type { ActivityOccurrence } from "@/data/interestTypes";
import { getProfileTagIds } from "@/data/interestProfileStore";
import {
  formatActivityTime,
  formatRecurringSchedule,
  formatTimeRange,
} from "./interestOccurrences";
import { canViewGroup, getVisibleGroups } from "./interestVisibility";

export type ScoredGroup = {
  group: InterestGroupFull;
  score: number;
  reasons: string[];
};

const countUpcomingActivitiesForGroup = (groupId: string) => {
  const now = Date.now();
  return occurrences.filter((occ) => {
    if (occ.status !== "scheduled") return false;
    const activity = activities.find((a) => a.id === occ.activityId);
    if (
      !activity ||
      activity.groupId !== groupId ||
      activity.status !== "published"
    ) {
      return false;
    }
    return new Date(occ.startAt).getTime() >= now;
  }).length;
};

const appendSocialReasons = (
  group: InterestGroupFull,
  reasons: string[],
) => {
  if (group.memberCount >= 15) {
    reasons.push(`${group.memberCount} 位同事已加入`);
  }
  const upcoming = countUpcomingActivitiesForGroup(group.id);
  if (upcoming > 0) {
    reasons.push(`近期有 ${upcoming} 场活动可报名`);
  }
};

/** AI 推荐候选：未加入、非本人创建、仍在线的小组 */
export const canRecommendGroupTo = (
  group: InterestGroupFull,
  viewerId: string,
): boolean =>
  group.status === "active" &&
  !isMember(group.id, viewerId) &&
  !isGroupOwner(group.id, viewerId);

const sliceWithOffset = <T,>(items: T[], limit: number, offset: number) => {
  if (items.length <= limit) return items.slice(0, limit);
  const maxStart = items.length - limit;
  const start = offset % (maxStart + 1);
  return items.slice(start, start + limit);
};

const finalizeScored = (
  rows: { group: InterestGroupFull; score: number; reasons: string[] }[],
): ScoredGroup[] =>
  rows.map(({ group, score, reasons }) => {
    const enriched = [...reasons];
    appendSocialReasons(group, enriched);
    return {
      group,
      score,
      reasons: enriched,
    };
  });

export const getRecommendSummary = (viewerId: string, count: number) => {
  const tagIds = getProfileTagIds();

  if (!tagIds.length) {
    if (count === 0) return "暂无匹配小组，可前往小组广场浏览";
    return `先为你推荐 ${count} 个热门小组`;
  }

  if (count === 0) {
    return "已根据你的兴趣筛选，暂无更多匹配小组";
  }
  return `根据你的兴趣，为你挑选了 ${count} 个还没加入的小组`;
};

export const recommendGroups = (
  viewerId: string,
  limit = 5,
  offset = 0,
): ScoredGroup[] => {
  const tagIds = getProfileTagIds();
  const visible = getVisibleGroups(interestGroups, viewerId).filter((g) =>
    canRecommendGroupTo(g, viewerId),
  );
  const hasProfileTags = tagIds.length > 0;

  const scored = visible
    .map((group) => {
      const matched = group.tagIds.filter((id) => tagIds.includes(id));
      let score = matched.length * 10;
      const reasons: string[] = [];

      if (matched.length) {
        const names = getTagsByIds(matched).map((t) => t.name);
        reasons.push(`匹配你的兴趣：${names.join("、")}`);
      }
      if (group.type === "official") score += 3;
      const emp = getEmployee(viewerId);
      if (
        group.visibility === "dept_only" &&
        group.deptIds?.length &&
        emp &&
        group.deptIds.includes(emp.deptId)
      ) {
        score += 5;
        reasons.push("同部门同事也在参与");
      }

      return { group, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  if (!hasProfileTags) {
    const fallback = visible
      .filter((g) => g.type === "official")
      .sort((a, b) => b.memberCount - a.memberCount)
      .map((group) => ({
        group,
        score: 0,
        reasons: ["热门小组"],
      }));
    return sliceWithOffset(finalizeScored(fallback), limit, offset);
  }

  return sliceWithOffset(finalizeScored(scored), limit, offset);
};

/** @deprecated 对话等旧接口；近期活动请用 RecentActivityItem */
export type OccurrenceWithActivity = {
  occurrence: ActivityOccurrence;
  activity: GroupActivity;
  group: InterestGroupFull;
};

/** 近期活动等列表卡片标题：小组名：活动名 */
export const formatGroupActivityTitle = (
  groupName: string,
  activityTitle: string,
) => `${groupName}：${activityTitle}`;

/** 近期活动列表：以活动为维度，周期/系列不重复卡片 */
export type RecentActivityItem = {
  activity: GroupActivity;
  group: InterestGroupFull;
  sortStartAt: string;
  timeLabel: string;
  /** 仅单次活动用于详情默认场次 */
  nextOccurrence?: ActivityOccurrence;
  /** 下一场未结束场次，用于状态角标（卡片不展示其日期文案） */
  statusOccurrence?: ActivityOccurrence;
};

export const matchActivityItemBySearchQuery = (
  item: RecentActivityItem,
  query: string,
): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const { activity, group } = item;
  if (activity.title.toLowerCase().includes(q)) return true;
  if (activity.description.toLowerCase().includes(q)) return true;
  if (activity.location?.toLowerCase().includes(q)) return true;
  if (group.name.toLowerCase().includes(q)) return true;
  return false;
};

const sessionNotExpired = (startAt: string, endAt?: string) => {
  const endMs = endAt
    ? new Date(endAt).getTime()
    : new Date(startAt).getTime() + 3600000;
  return endMs >= Date.now();
};

const upcomingOccurrencesForActivity = (activityId: string) =>
  occurrences
    .filter(
      (o) =>
        o.activityId === activityId &&
        o.status === "scheduled" &&
        sessionNotExpired(o.startAt, o.endAt),
    )
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

const buildActivityTimeLabel = (
  activity: GroupActivity,
  upcoming: ActivityOccurrence[],
) => {
  const next = upcoming[0];
  if (activity.activityKind === "recurring") {
    return (
      formatRecurringSchedule(
        activity.rrule,
        activity.startAt ?? next?.startAt,
        activity.endAt ?? next?.endAt,
      ) ?? "周期活动"
    );
  }
  if (activity.activityKind === "series") {
    const n = upcoming.length;
    if (next) {
      return `系列 · ${n} 场 · 下一场 ${formatActivityTime(next.startAt)}`;
    }
    return `系列 · ${n} 场`;
  }
  const start = activity.startAt ?? next?.startAt;
  const end = activity.endAt ?? next?.endAt;
  return start ? formatTimeRange(start, end) : "";
};

const buildRecentActivityItem = (
  activity: GroupActivity,
  group: InterestGroupFull,
): RecentActivityItem | null => {
  const upcoming = upcomingOccurrencesForActivity(activity.id);
  let sortStartAt: string | undefined;
  let nextOccurrence: ActivityOccurrence | undefined;

  let statusOccurrence: ActivityOccurrence | undefined;

  if (upcoming.length > 0) {
    statusOccurrence = upcoming[0];
    sortStartAt = upcoming[0].startAt;
    if (activity.activityKind === "one_off") {
      nextOccurrence = upcoming[0];
    }
  } else if (
    activity.activityKind === "one_off" &&
    activity.startAt &&
    sessionNotExpired(activity.startAt, activity.endAt)
  ) {
    sortStartAt = activity.startAt;
  } else {
    return null;
  }

  const timeLabel = buildActivityTimeLabel(activity, upcoming);
  if (!timeLabel) return null;

  return {
    activity,
    group,
    sortStartAt,
    timeLabel,
    nextOccurrence,
    statusOccurrence,
  };
};

/** 管理员：全部已发布活动（含已结束），按最近时间倒序 */
const buildAdminActivityItem = (
  activity: GroupActivity,
  group: InterestGroupFull,
): RecentActivityItem | null => {
  const upcoming = upcomingOccurrencesForActivity(activity.id);
  const allOccs = getOccurrencesByActivity(activity.id);
  let sortStartAt = activity.startAt ?? allOccs[0]?.startAt;
  if (upcoming.length > 0) {
    sortStartAt = upcoming[0].startAt;
  } else if (allOccs.length > 0) {
    sortStartAt = [...allOccs].sort(
      (a, b) =>
        new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
    )[0].startAt;
  }
  if (!sortStartAt) return null;

  const timeLabel =
    buildActivityTimeLabel(activity, upcoming) ||
    formatTimeRange(sortStartAt, activity.endAt ?? sortStartAt);

  return {
    activity,
    group,
    sortStartAt,
    timeLabel,
    nextOccurrence: upcoming[0],
    statusOccurrence: upcoming[0] ?? allOccs[0],
  };
};

/** 列表卡片：优先即将开始维度，否则展示已发布活动（小组详情等） */
export const buildFeaturedActivityListItem = (
  activity: GroupActivity,
  group: InterestGroupFull,
): RecentActivityItem | null => {
  if (activity.status !== "published") return null;
  return (
    buildRecentActivityItem(activity, group) ??
    buildAdminActivityItem(activity, group)
  );
};

export const getAllPublishedActivities = (): RecentActivityItem[] => {
  const items: RecentActivityItem[] = [];
  for (const activity of activities) {
    if (activity.status !== "published") continue;
    const group = getGroupById(activity.groupId);
    if (!group) continue;
    const item = buildAdminActivityItem(activity, group);
    if (item) items.push(item);
  }
  return items.sort(
    (a, b) =>
      new Date(b.sortStartAt).getTime() - new Date(a.sortStartAt).getTime(),
  );
};

export const getRecentActivities = (viewerId: string): RecentActivityItem[] => {
  const joinedIds = new Set(getJoinedGroups(viewerId).map((g) => g.id));
  const items: RecentActivityItem[] = [];

  for (const activity of activities) {
    if (activity.status !== "published") continue;
    const group = interestGroups.find((g) => g.id === activity.groupId);
    if (!group || !canViewGroup(group, viewerId)) continue;
    if (!joinedIds.has(group.id) && group.visibility !== "public") continue;

    const item = buildRecentActivityItem(activity, group);
    if (item) items.push(item);
  }

  return items.sort(
    (a, b) =>
      new Date(a.sortStartAt).getTime() - new Date(b.sortStartAt).getTime(),
  );
};

/** 管理员活动管理：与活动广场相同维度（即将开始的活动，按开始时间升序） */
export const getRecentActivitiesForAdmin = (): RecentActivityItem[] => {
  const items: RecentActivityItem[] = [];

  for (const activity of activities) {
    if (activity.status !== "published") continue;
    const group = getGroupById(activity.groupId);
    if (!group || group.status !== "active") continue;

    const item = buildRecentActivityItem(activity, group);
    if (item) items.push(item);
  }

  return items.sort(
    (a, b) =>
      new Date(a.sortStartAt).getTime() - new Date(b.sortStartAt).getTime(),
  );
};

export const getUpcomingOccurrences = (
  viewerId: string,
  limit = 10,
): OccurrenceWithActivity[] =>
  getRecentActivities(viewerId)
    .slice(0, limit)
    .map((item) => ({
      activity: item.activity,
      group: item.group,
      occurrence:
        item.nextOccurrence ??
        ({
          id: `occ-preview-${item.activity.id}`,
          activityId: item.activity.id,
          startAt: item.sortStartAt,
          endAt: item.activity.endAt ?? item.sortStartAt,
          capacity: item.activity.capacity,
          enrollCount: 0,
          status: "scheduled",
        } satisfies ActivityOccurrence),
    }));

export type RecentActivityDateFilter = "all" | "today" | "week" | "month";

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const startOfWeek = (d: Date) => {
  const day = startOfDay(d);
  const weekday = day.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  day.setDate(day.getDate() + mondayOffset);
  return day;
};

export const filterRecentActivitiesByDate = (
  rows: RecentActivityItem[],
  filter: RecentActivityDateFilter,
): RecentActivityItem[] => {
  if (filter === "all") return rows;
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  return rows.filter(({ sortStartAt }) => {
    const start = new Date(sortStartAt);
    if (filter === "today") {
      return start >= todayStart && start < tomorrowStart;
    }
    if (filter === "week") {
      const weekStart = startOfWeek(now);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return start >= weekStart && start < weekEnd;
    }
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return start >= monthStart && start < monthEnd;
  });
};

/** @deprecated 使用 getRecentActivities */
export const filterOccurrencesByDate = filterRecentActivitiesByDate;

/** @deprecated 使用 getRecentActivities */
export const getVisibleOccurrences = getRecentActivities;

export const getMyEnrollments = (viewerId: string) =>
  enrollments.filter(
    (e) => e.employeeId === viewerId && e.status === "enrolled",
  );

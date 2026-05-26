import { getEmployee } from "@/data/colleagueData";
import { getTagsByIds } from "@/data/interestTags";
import type { GroupActivity, InterestGroupFull } from "@/data/interestTypes";
import {
  activities,
  enrollments,
  getJoinedGroups,
  interestGroups,
  isMember,
  occurrences,
} from "@/data/interestGroups";
import { getProfileTagIds } from "@/data/interestProfileStore";
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
    if (count === 0) return "完善兴趣标签后可获得更精准推荐";
    return `你还没填够兴趣标签，先按热门官方组推荐 ${count} 个；完善后会更准`;
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
  const visible = getVisibleGroups(interestGroups, viewerId);
  const hasProfileTags = tagIds.length > 0;

  const scored = visible
    .filter((g) => !isMember(g.id, viewerId))
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
      .filter((g) => g.type === "official" && !isMember(g.id, viewerId))
      .sort((a, b) => b.memberCount - a.memberCount)
      .map((group) => ({
        group,
        score: 0,
        reasons: ["热门官方小组"],
      }));
    return sliceWithOffset(finalizeScored(fallback), limit, offset);
  }

  return sliceWithOffset(finalizeScored(scored), limit, offset);
};

export type OccurrenceWithActivity = {
  occurrence: (typeof occurrences)[0];
  activity: GroupActivity;
  group: InterestGroupFull;
};

const buildOccurrenceRows = (): OccurrenceWithActivity[] => {
  const rows: OccurrenceWithActivity[] = [];
  for (const occ of occurrences) {
    if (occ.status !== "scheduled") continue;
    const activity = activities.find((a) => a.id === occ.activityId);
    if (!activity || activity.status !== "published") continue;
    const group = interestGroups.find((g) => g.id === activity.groupId);
    if (!group) continue;
    rows.push({ occurrence: occ, activity, group });
  }
  return rows.sort(
    (a, b) =>
      new Date(a.occurrence.startAt).getTime() -
      new Date(b.occurrence.startAt).getTime(),
  );
};

export const getUpcomingOccurrences = (
  viewerId: string,
  limit = 10,
): OccurrenceWithActivity[] => {
  const joinedIds = new Set(getJoinedGroups(viewerId).map((g) => g.id));
  return buildOccurrenceRows()
    .filter((row) => {
      if (!canViewGroup(row.group, viewerId)) return false;
      if (joinedIds.has(row.group.id)) return true;
      return row.group.visibility === "public";
    })
    .slice(0, limit);
};

export const getMyEnrollments = (viewerId: string) =>
  enrollments.filter(
    (e) => e.employeeId === viewerId && e.status === "enrolled",
  );

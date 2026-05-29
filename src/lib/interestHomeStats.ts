import {
  getJoinedGroups,
  getMyEnrolledOccurrences,
} from "@/data/interestGroups";
import {
  filterRecentActivitiesByDate,
  getRecentActivities,
} from "./interestRecommend";
import { getActivityPhase } from "./interestOccurrences";

export type InterestHomeStatItem = {
  key: string;
  label: string;
  value: number;
  to: string;
};

export type InterestHomeStats = {
  items: InterestHomeStatItem[];
  hint?: string;
};

export const getInterestHomeStats = (
  viewerId: string,
): InterestHomeStats => {
  const joinedGroupCount = getJoinedGroups(viewerId).length;
  const weekActivityCount = filterRecentActivitiesByDate(
    getRecentActivities(viewerId),
    "week",
  ).length;

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
      key: "week",
      label: "本周活动",
      value: weekActivityCount,
      to: "/agents/interest-groups/list/recent?range=week",
    },
  ];

  let hint: string | undefined;
  if (weekActivityCount > 0) {
    hint = `本周有 ${weekActivityCount} 场活动可报名参加`;
  } else if (notStartedActivityCount > 0) {
    hint = `你有 ${notStartedActivityCount} 场未开始活动`;
  }

  return { items, hint };
};

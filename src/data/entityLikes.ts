import {
  activities,
  CURRENT_EMPLOYEE_ID,
  getActivityById,
  getGroupById,
  interestGroups,
} from "./interestGroups";

export let activityLikes: Array<{ activityId: string; employeeId: string }> = [
  { activityId: "act-e-pt-1", employeeId: CURRENT_EMPLOYEE_ID },
];

export let groupLikes: Array<{ groupId: string; employeeId: string }> = [
  { groupId: "ig6", employeeId: CURRENT_EMPLOYEE_ID },
];

export const isActivityLikedBy = (
  activityId: string,
  employeeId: string,
): boolean =>
  activityLikes.some(
    (l) => l.activityId === activityId && l.employeeId === employeeId,
  );

export const isGroupLikedBy = (
  groupId: string,
  employeeId: string,
): boolean =>
  groupLikes.some(
    (l) => l.groupId === groupId && l.employeeId === employeeId,
  );

export const toggleActivityLike = (
  activityId: string,
  employeeId: string,
): boolean | undefined => {
  const activity = getActivityById(activityId);
  if (!activity) return undefined;

  const existing = activityLikes.find(
    (l) => l.activityId === activityId && l.employeeId === employeeId,
  );

  if (existing) {
    activityLikes = activityLikes.filter((l) => l !== existing);
    const idx = activities.findIndex((a) => a.id === activityId);
    if (idx >= 0) {
      activities[idx] = {
        ...activities[idx],
        likeCount: Math.max(0, (activities[idx].likeCount ?? 0) - 1),
      };
    }
    return false;
  }

  activityLikes = [...activityLikes, { activityId, employeeId }];
  const idx = activities.findIndex((a) => a.id === activityId);
  if (idx >= 0) {
    activities[idx] = {
      ...activities[idx],
      likeCount: (activities[idx].likeCount ?? 0) + 1,
    };
  }
  return true;
};

export const toggleGroupLike = (
  groupId: string,
  employeeId: string,
): boolean | undefined => {
  const group = getGroupById(groupId);
  if (!group) return undefined;

  const existing = groupLikes.find(
    (l) => l.groupId === groupId && l.employeeId === employeeId,
  );

  if (existing) {
    groupLikes = groupLikes.filter((l) => l !== existing);
    const idx = interestGroups.findIndex((g) => g.id === groupId);
    if (idx >= 0) {
      interestGroups[idx] = {
        ...interestGroups[idx],
        likeCount: Math.max(0, (interestGroups[idx].likeCount ?? 0) - 1),
      };
    }
    return false;
  }

  groupLikes = [...groupLikes, { groupId, employeeId }];
  const idx = interestGroups.findIndex((g) => g.id === groupId);
  if (idx >= 0) {
    interestGroups[idx] = {
      ...interestGroups[idx],
      likeCount: (interestGroups[idx].likeCount ?? 0) + 1,
    };
  }
  return true;
};

import {
  getActivitiesByGroup,
  getActivityById,
  getOccurrenceById,
  getOccurrencesByActivity,
} from "./interestGroups";
import type { GroupHighlight } from "./interestTypes";
import { canManageInterestGroups } from "@/lib/appRoleStore";
import act1 from "@/assets/interest/activities/act-1.jpg";
import act2 from "@/assets/interest/activities/act-2.jpg";
import act3 from "@/assets/interest/activities/act-3.jpg";
import act4 from "@/assets/interest/activities/act-4.jpg";
import act6 from "@/assets/interest/activities/act-6.jpg";

const daysAgo = (d: number) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export let groupHighlights: GroupHighlight[] = [
  {
    id: "gh-ig6-1",
    groupId: "ig6",
    activityId: "act-e-pt-1",
    occurrenceId: "occ-e-pt-1-1",
    imageUrls: [
      act6,
      act1,
      act2,
      act3,
      act4,
      act6,
      act1,
      act2,
      act3,
      act4,
      act1,
      act6,
    ],
    caption: "减脂营结营合影",
    uploadedBy: "u2",
    uploadedAt: daysAgo(3),
  },
  {
    id: "gh-ig6-2",
    groupId: "ig6",
    activityId: "act-e-pt-1",
    occurrenceId: "occ-e-pt-1-1",
    imageUrls: [act6, act1],
    caption: "热身环节",
    uploadedBy: "u2",
    uploadedAt: daysAgo(5),
  },
];

export const listGroupHighlights = (groupId: string): GroupHighlight[] =>
  groupHighlights
    .filter((h) => h.groupId === groupId)
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );

export type HighlightOccurrenceOption = {
  activityId: string;
  activityTitle: string;
  occurrenceId: string;
  occurrenceLabel: string;
};

/** 小组内可关联精彩瞬间的场次（已结束或已完成） */
export const listHighlightOccurrenceOptions = (
  groupId: string,
  formatLabel: (
    activity: ReturnType<typeof getActivityById>,
    occurrence: ReturnType<typeof getOccurrenceById>,
    index?: number,
  ) => string,
): HighlightOccurrenceOption[] => {
  const options: HighlightOccurrenceOption[] = [];
  const now = Date.now();

  for (const activity of getActivitiesByGroup(groupId)) {
    const occs = getOccurrencesByActivity(activity.id);
    if (occs.length > 0) {
      occs.forEach((occ, index) => {
        const ended =
          occ.status === "completed" ||
          new Date(occ.endAt).getTime() < now;
        if (!ended) return;
        options.push({
          activityId: activity.id,
          activityTitle: activity.title,
          occurrenceId: occ.id,
          occurrenceLabel: formatLabel(activity, occ, index),
        });
      });
    } else if (
      activity.startAt &&
      activity.endAt &&
      new Date(activity.endAt).getTime() < now
    ) {
      options.push({
        activityId: activity.id,
        activityTitle: activity.title,
        occurrenceId: `virtual-${activity.id}`,
        occurrenceLabel: formatLabel(activity, undefined, undefined),
      });
    }
  }

  return options.sort(
    (a, b) => b.occurrenceLabel.localeCompare(a.occurrenceLabel, "zh-CN"),
  );
};

export const addGroupHighlight = (
  groupId: string,
  actorId: string,
  input: {
    activityId: string;
    occurrenceId: string;
    imageUrls: string[];
    caption?: string;
  },
): GroupHighlight | null => {
  if (!canManageInterestGroups()) return null;
  if (input.imageUrls.length === 0) return null;

  const activity = getActivityById(input.activityId);
  if (!activity || activity.groupId !== groupId) return null;

  const highlight: GroupHighlight = {
    id: `gh-${Date.now()}`,
    groupId,
    activityId: input.activityId,
    occurrenceId: input.occurrenceId,
    imageUrls: [...input.imageUrls],
    caption: input.caption?.trim() || undefined,
    uploadedBy: actorId,
    uploadedAt: new Date().toISOString(),
  };
  groupHighlights = [highlight, ...groupHighlights];
  return highlight;
};

export const deleteGroupHighlight = (highlightId: string): boolean => {
  if (!canManageInterestGroups()) return false;
  const before = groupHighlights.length;
  groupHighlights = groupHighlights.filter((h) => h.id !== highlightId);
  return groupHighlights.length < before;
};

export const getGroupHighlightById = (
  highlightId: string,
): GroupHighlight | undefined =>
  groupHighlights.find((h) => h.id === highlightId);

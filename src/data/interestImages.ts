/** 兴趣小组模块本地封面图（bundled assets） */

import defaultActivity from "@/assets/interest/default-activity.jpg";
import defaultGroup from "@/assets/interest/default-group.jpg";
import act1 from "@/assets/interest/activities/act-1.jpg";
import act2 from "@/assets/interest/activities/act-2.jpg";
import act3 from "@/assets/interest/activities/act-3.jpg";
import act4 from "@/assets/interest/activities/act-4.jpg";
import act5 from "@/assets/interest/activities/act-5.jpg";
import act6 from "@/assets/interest/activities/act-6.jpg";
import ig1 from "@/assets/interest/groups/ig1.jpg";
import ig2 from "@/assets/interest/groups/ig2.jpg";
import ig3 from "@/assets/interest/groups/ig3.jpg";
import ig4 from "@/assets/interest/groups/ig4.jpg";
import ig5 from "@/assets/interest/groups/ig5.jpg";
import ig6 from "@/assets/interest/groups/ig6.jpg";
import ig7 from "@/assets/interest/groups/ig7.jpg";
import ig8 from "@/assets/interest/groups/ig8.jpg";
import ig9 from "@/assets/interest/groups/ig9.jpg";
import ig10 from "@/assets/interest/groups/ig10.jpg";
import ig11 from "@/assets/interest/groups/ig11.jpg";
import ig12 from "@/assets/interest/groups/ig12.jpg";
import ig13 from "@/assets/interest/groups/ig13.jpg";
import ig14 from "@/assets/interest/groups/ig14.jpg";
import ig15 from "@/assets/interest/groups/ig15.jpg";
import ig16 from "@/assets/interest/groups/ig16.jpg";

export const GROUP_COVERS: Record<string, string> = {
  ig1,
  ig2,
  ig3,
  ig4,
  ig5,
  ig6,
  ig7,
  ig8,
  ig9,
  ig10,
  ig11,
  ig12,
  ig13,
  ig14,
  ig15,
  ig16,
};

export const ACTIVITY_COVERS: Record<string, string> = {
  "act-1": act1,
  "act-2": act2,
  "act-3": act3,
  "act-4": act4,
  "act-5": act5,
  "act-6": act6,
};

export const DEFAULT_GROUP_COVER = defaultGroup;
export const DEFAULT_ACTIVITY_COVER = defaultActivity;

export const getGroupCover = (groupId: string) => GROUP_COVERS[groupId];

export const getActivityCover = (activityId: string) =>
  ACTIVITY_COVERS[activityId];

export const resolveGroupCover = (group: {
  id: string;
  coverUrl?: string;
}) => group.coverUrl ?? GROUP_COVERS[group.id] ?? DEFAULT_GROUP_COVER;

export const resolveActivityCover = (activity: {
  id: string;
  coverUrl?: string;
}) =>
  activity.coverUrl ?? ACTIVITY_COVERS[activity.id] ?? DEFAULT_ACTIVITY_COVER;

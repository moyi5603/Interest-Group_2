import { getEmployee } from "@/data/colleagueData";
import {
  pushGrowthEngineNotification,
  pushGrowthEngineNotifications,
} from "@/data/growthEngineNotifications";

const employeeName = (employeeId: string) =>
  getEmployee(employeeId)?.name ?? "某成员";

export const notifyGroupMemberJoined = (input: {
  ownerId: string;
  groupId: string;
  groupName: string;
  memberId: string;
}) => {
  if (input.ownerId === input.memberId) return;
  pushGrowthEngineNotification({
    employeeId: input.ownerId,
    type: "member_joined_group",
    preview: `${employeeName(input.memberId)}加入了「${input.groupName}」，可前往小组详情查看`,
    link: `/agents/interest-groups/${input.groupId}`,
  });
};

export const notifyGroupDisbanded = (input: {
  memberIds: string[];
  groupId: string;
  groupName: string;
}) => {
  pushGrowthEngineNotifications(
    input.memberIds.map((employeeId) => ({
      employeeId,
      type: "group_disbanded" as const,
      preview: `「${input.groupName}」已解散，感谢你的参与`,
      link: `/agents/interest-groups/list/my-groups`,
    })),
  );
};

export const notifyActivityTerminated = (input: {
  memberIds: string[];
  activityId: string;
  activityTitle: string;
}) => {
  if (input.memberIds.length === 0) return;
  pushGrowthEngineNotifications(
    input.memberIds.map((employeeId) => ({
      employeeId,
      type: "activity_terminated" as const,
      preview: `「${input.activityTitle}」活动已终止，报名已作废`,
      link: `/agents/interest-groups/activities/${input.activityId}`,
    })),
  );
};

export const notifyActivityStartingSoon = (input: {
  memberIds: string[];
  activityId: string;
  activityTitle: string;
}) => {
  if (input.memberIds.length === 0) return;
  pushGrowthEngineNotifications(
    input.memberIds.map((employeeId) => ({
      employeeId,
      type: "activity_starting_soon" as const,
      preview: `「${input.activityTitle}」将在 1 小时后开始，记得准时参加`,
      link: `/agents/interest-groups/activities/${input.activityId}`,
    })),
  );
};

export const notifyActivityEndedFeedback = (input: {
  memberIds: string[];
  activityId: string;
  activityTitle: string;
}) => {
  if (input.memberIds.length === 0) return;
  pushGrowthEngineNotifications(
    input.memberIds.map((employeeId) => ({
      employeeId,
      type: "activity_ended_feedback" as const,
      preview: `「${input.activityTitle}」已结束，欢迎留言分享你的感受与收获`,
      link: `/agents/interest-groups/activities/${input.activityId}`,
    })),
  );
};

export const notifyActivityEnrolled = (input: {
  organizerId: string;
  activityId: string;
  activityTitle: string;
  memberId: string;
  enrollCount: number;
}) => {
  if (input.organizerId === input.memberId) return;
  pushGrowthEngineNotification({
    employeeId: input.organizerId,
    type: "activity_enrolled",
    preview: `${employeeName(input.memberId)}报名了「${input.activityTitle}」，当前共 ${input.enrollCount} 人报名`,
    link: `/agents/interest-groups/activities/${input.activityId}`,
  });
};

export const notifyActivityPublished = (input: {
  memberIds: string[];
  activityId: string;
  activityTitle: string;
  groupName: string;
}) => {
  if (input.memberIds.length === 0) return;
  pushGrowthEngineNotifications(
    input.memberIds.map((employeeId) => ({
      employeeId,
      type: "activity_published" as const,
      preview: `「${input.groupName}」发布了新活动「${input.activityTitle}」，快来看看`,
      link: `/agents/interest-groups/activities/${input.activityId}`,
    })),
  );
};

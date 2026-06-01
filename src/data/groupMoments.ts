import type { ActivityComment, ActivityCommentSort } from "./interestTypes";
import type { GroupMoment } from "./interestTypes";
import { CURRENT_EMPLOYEE_ID } from "./interestGroups";
import act1 from "@/assets/interest/activities/act-1.jpg";
import act3 from "@/assets/interest/activities/act-3.jpg";
import act5 from "@/assets/interest/activities/act-5.jpg";

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

const daysAgo = (d: number) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export let groupMoments: GroupMoment[] = [
  {
    id: "gm-ig6-1",
    groupId: "ig6",
    authorId: "u2",
    content: "今晚团课结束，大家状态都很好，继续加油 💪",
    imageUrls: [act5, act1],
    createdAt: hoursAgo(6),
    likeCount: 18,
  },
  {
    id: "gm-ig6-r1",
    groupId: "ig6",
    parentId: "gm-ig6-1",
    authorId: "u1",
    content: "下次还一起练！",
    imageUrls: [],
    createdAt: hoursAgo(4),
    likeCount: 3,
  },
  {
    id: "gm-ig6-2",
    groupId: "ig6",
    authorId: "u1",
    content: "第一次跟完 5K 夜跑，感谢带队的伙伴！",
    imageUrls: [act1],
    createdAt: daysAgo(1),
    likeCount: 24,
  },
  {
    id: "gm-ig1-1",
    groupId: "ig1",
    authorId: "u3",
    content: "本周埃塞俄比亚耶加雪菲，欢迎来品鉴～",
    imageUrls: [act3],
    createdAt: daysAgo(2),
    likeCount: 11,
  },
];

export let momentLikes: Array<{ momentId: string; employeeId: string }> = [
  { momentId: "gm-ig6-1", employeeId: CURRENT_EMPLOYEE_ID },
];

const isTopLevelMoment = (moment: GroupMoment) => !moment.parentId;

const findMoment = (momentId: string) =>
  groupMoments.find((m) => m.id === momentId);

export const groupMomentAsActivityComment = (
  moment: GroupMoment,
): ActivityComment => ({
  id: moment.id,
  activityId: moment.groupId,
  authorId: moment.authorId,
  content: moment.content,
  imageUrls: moment.imageUrls,
  createdAt: moment.createdAt,
  likeCount: moment.likeCount,
  parentId: moment.parentId,
});

export const sortGroupMoments = (
  moments: GroupMoment[],
  sort: ActivityCommentSort,
): GroupMoment[] => {
  const list = moments.filter(isTopLevelMoment);
  if (sort === "hottest") {
    return list.sort((a, b) => {
      const diff = (b.likeCount ?? 0) - (a.likeCount ?? 0);
      if (diff !== 0) return diff;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }
  return list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const listGroupMoments = (groupId: string): GroupMoment[] =>
  groupMoments.filter((m) => m.groupId === groupId);

export const countGroupMoments = (groupId: string): number =>
  listGroupMoments(groupId).filter(isTopLevelMoment).length;

export const isMomentLikedBy = (
  momentId: string,
  employeeId: string,
): boolean =>
  momentLikes.some(
    (l) => l.momentId === momentId && l.employeeId === employeeId,
  );

export const toggleMomentLike = (
  momentId: string,
  employeeId: string,
): boolean | undefined => {
  const moment = findMoment(momentId);
  if (!moment) return undefined;

  const existing = momentLikes.find(
    (l) => l.momentId === momentId && l.employeeId === employeeId,
  );

  if (existing) {
    momentLikes = momentLikes.filter((l) => l !== existing);
    groupMoments = groupMoments.map((m) =>
      m.id === momentId
        ? { ...m, likeCount: Math.max(0, (m.likeCount ?? 0) - 1) }
        : m,
    );
    return false;
  }

  momentLikes = [...momentLikes, { momentId, employeeId }];
  groupMoments = groupMoments.map((m) =>
    m.id === momentId
      ? { ...m, likeCount: (m.likeCount ?? 0) + 1 }
      : m,
  );
  return true;
};

export type AddGroupMomentInput = {
  content: string;
  imageUrls: string[];
};

export const addGroupMoment = (
  groupId: string,
  authorId: string,
  input: AddGroupMomentInput,
): GroupMoment | undefined => {
  const content = input.content.trim();
  const imageUrls = input.imageUrls.slice(0, 9);
  if (!content && imageUrls.length === 0) return undefined;

  const moment: GroupMoment = {
    id: `gm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    groupId,
    authorId,
    content,
    imageUrls,
    createdAt: new Date().toISOString(),
    likeCount: 0,
  };

  groupMoments = [...groupMoments, moment];
  return moment;
};

export const addMomentReply = (
  groupId: string,
  parentId: string,
  authorId: string,
  content: string,
): GroupMoment | undefined => {
  const parent = findMoment(parentId);
  if (!parent || !isTopLevelMoment(parent) || parent.groupId !== groupId) {
    return undefined;
  }

  const trimmed = content.trim();
  if (!trimmed) return undefined;

  const reply: GroupMoment = {
    id: `gm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    groupId,
    parentId,
    authorId,
    content: trimmed,
    imageUrls: [],
    createdAt: new Date().toISOString(),
    likeCount: 0,
  };

  groupMoments = [...groupMoments, reply];
  return reply;
};

export const deleteGroupMoment = (
  momentId: string,
  authorId: string,
): boolean => {
  const target = findMoment(momentId);
  if (!target || target.authorId !== authorId) return false;

  const replyIds = isTopLevelMoment(target)
    ? groupMoments
        .filter((m) => m.parentId === momentId)
        .map((m) => m.id)
    : [];

  const removeIds = new Set([momentId, ...replyIds]);
  momentLikes = momentLikes.filter((l) => !removeIds.has(l.momentId));
  groupMoments = groupMoments.filter((m) => !removeIds.has(m.id));
  return true;
};

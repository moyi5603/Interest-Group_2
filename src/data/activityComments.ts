import type { ActivityComment, ActivityCommentSort } from "./interestTypes";
import {
  bumpActivityCommentCount,
  CURRENT_EMPLOYEE_ID,
  getActivityById,
  setActivityCommentCount,
} from "./interestGroups";
import act1 from "@/assets/interest/activities/act-1.jpg";
import act3 from "@/assets/interest/activities/act-3.jpg";
import act6 from "@/assets/interest/activities/act-6.jpg";

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

const daysAgo = (d: number) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export let activityComments: ActivityComment[] = [
  {
    id: "cmt-a1-1",
    activityId: "act-1",
    authorId: "u4",
    content: "新手配速大概多少？第一次参加有点紧张。",
    imageUrls: [],
    createdAt: daysAgo(2),
    likeCount: 3,
  },
  {
    id: "cmt-a1-2",
    activityId: "act-1",
    authorId: "u2",
    content: "欢迎新人！我们一般 6–7 分配速，中间会等大家，放心来。",
    imageUrls: [],
    createdAt: hoursAgo(20),
    likeCount: 12,
  },
  {
    id: "cmt-a1-3",
    activityId: "act-1",
    authorId: "u5",
    content: "上次夜跑氛围超好，附上合影～",
    imageUrls: [act1, act3],
    createdAt: hoursAgo(5),
    likeCount: 28,
  },
  {
    id: "cmt-a1-r1",
    activityId: "act-1",
    parentId: "cmt-a1-1",
    authorId: "u2",
    content: "放心，我们会等大家集合再开跑，跟不上可以走跑结合。",
    imageUrls: [],
    createdAt: hoursAgo(18),
    likeCount: 4,
  },
  {
    id: "cmt-a1-r2",
    activityId: "act-1",
    parentId: "cmt-a1-1",
    authorId: "u4",
    content: "好的，谢谢！",
    imageUrls: [],
    createdAt: hoursAgo(16),
    likeCount: 1,
  },
  {
    id: "cmt-a7-1",
    activityId: "act-7",
    authorId: "u3",
    content: "春季系列第一场路线有海拔爬升吗？需要登山杖吗？",
    imageUrls: [],
    createdAt: daysAgo(3),
    likeCount: 5,
  },
  {
    id: "cmt-a7-2",
    activityId: "act-7",
    authorId: "u2",
    content: "前两场休闲爬升不大；第三场长线建议带足水和补给，这是去年拍的风景。",
    imageUrls: [act6, act3, act1],
    createdAt: daysAgo(1),
    likeCount: 15,
  },
  {
    id: "cmt-a7-r1",
    activityId: "act-7",
    parentId: "cmt-a7-1",
    authorId: "u5",
    content: "第三场我参加过，中途有补给点，登山杖可带可不带。",
    imageUrls: [],
    createdAt: hoursAgo(8),
    likeCount: 2,
  },
];

export let commentLikes: Array<{ commentId: string; employeeId: string }> = [
  { commentId: "cmt-a1-3", employeeId: CURRENT_EMPLOYEE_ID },
];

const isTopLevelComment = (comment: ActivityComment) => !comment.parentId;

const findComment = (commentId: string) =>
  activityComments.find((c) => c.id === commentId);

/** 初始化时同步有 mock 评论的活动计数（仅顶层评论） */
const syncInitialCommentCounts = () => {
  const counts = new Map<string, number>();
  for (const c of activityComments) {
    if (!isTopLevelComment(c)) continue;
    counts.set(c.activityId, (counts.get(c.activityId) ?? 0) + 1);
  }
  for (const [activityId, count] of counts) {
    setActivityCommentCount(activityId, count);
  }
};

syncInitialCommentCounts();

export const sortActivityComments = (
  comments: ActivityComment[],
  sort: ActivityCommentSort,
): ActivityComment[] => {
  const list = comments.filter(isTopLevelComment);
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

export const getActivityComments = (
  activityId: string,
  sort: ActivityCommentSort = "latest",
): ActivityComment[] =>
  sortActivityComments(
    activityComments.filter((c) => c.activityId === activityId),
    sort,
  );

export const listActivityComments = (activityId: string): ActivityComment[] =>
  activityComments.filter((c) => c.activityId === activityId);

export const listCommentReplies = (parentId: string): ActivityComment[] =>
  activityComments
    .filter((c) => c.parentId === parentId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

export const isCommentLikedBy = (
  commentId: string,
  employeeId: string,
): boolean =>
  commentLikes.some(
    (l) => l.commentId === commentId && l.employeeId === employeeId,
  );

export const toggleCommentLike = (
  commentId: string,
  employeeId: string,
): boolean | undefined => {
  const comment = findComment(commentId);
  if (!comment) return undefined;

  const existing = commentLikes.find(
    (l) => l.commentId === commentId && l.employeeId === employeeId,
  );

  if (existing) {
    commentLikes = commentLikes.filter((l) => l !== existing);
    activityComments = activityComments.map((c) =>
      c.id === commentId
        ? { ...c, likeCount: Math.max(0, (c.likeCount ?? 0) - 1) }
        : c,
    );
    return false;
  }

  commentLikes = [...commentLikes, { commentId, employeeId }];
  activityComments = activityComments.map((c) =>
    c.id === commentId
      ? { ...c, likeCount: (c.likeCount ?? 0) + 1 }
      : c,
  );
  return true;
};

export type AddActivityCommentInput = {
  content: string;
  imageUrls: string[];
};

export const addActivityComment = (
  activityId: string,
  authorId: string,
  input: AddActivityCommentInput,
): ActivityComment | undefined => {
  const activity = getActivityById(activityId);
  if (!activity) return undefined;

  const content = input.content.trim();
  const imageUrls = input.imageUrls.slice(0, 9);
  if (!content && imageUrls.length === 0) return undefined;

  const comment: ActivityComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    activityId,
    authorId,
    content,
    imageUrls,
    createdAt: new Date().toISOString(),
    likeCount: 0,
  };

  activityComments = [...activityComments, comment];
  bumpActivityCommentCount(activityId, 1);
  return comment;
};

export const addCommentReply = (
  activityId: string,
  parentId: string,
  authorId: string,
  content: string,
): ActivityComment | undefined => {
  const activity = getActivityById(activityId);
  if (!activity) return undefined;

  const parent = findComment(parentId);
  if (!parent || !isTopLevelComment(parent) || parent.activityId !== activityId) {
    return undefined;
  }

  const trimmed = content.trim();
  if (!trimmed) return undefined;

  const reply: ActivityComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    activityId,
    parentId,
    authorId,
    content: trimmed,
    imageUrls: [],
    createdAt: new Date().toISOString(),
    likeCount: 0,
  };

  activityComments = [...activityComments, reply];
  return reply;
};

export const deleteActivityComment = (
  commentId: string,
  authorId: string,
): boolean => {
  const target = findComment(commentId);
  if (!target || target.authorId !== authorId) return false;

  const replyIds = isTopLevelComment(target)
    ? activityComments
        .filter((c) => c.parentId === commentId)
        .map((c) => c.id)
    : [];

  const removeIds = new Set([commentId, ...replyIds]);
  commentLikes = commentLikes.filter((l) => !removeIds.has(l.commentId));
  activityComments = activityComments.filter((c) => !removeIds.has(c.id));

  if (isTopLevelComment(target)) {
    bumpActivityCommentCount(target.activityId, -1);
  }
  return true;
};

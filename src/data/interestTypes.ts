export type TagSource = "manual" | "ai_suggested" | "inferred";
export type GroupType = "official" | "spontaneous";
export type GroupVisibility = "public" | "dept_only" | "invite_only";
export type ReportStatus = "pending_report" | "reported" | "flagged";
export type ActivityKind = "one_off" | "recurring" | "series";
export type OccurrenceStatus = "scheduled" | "cancelled" | "completed";

export type InterestTag = {
  id: string;
  name: string;
  category: "运动" | "文艺" | "生活" | "科技";
};

export type ProfileTag = {
  tagId: string;
  source: TagSource;
  confidence?: number;
};

export type InterestGroupFull = {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  type: GroupType;
  visibility: GroupVisibility;
  deptIds?: string[];
  tagIds: string[];
  status: "active" | "archived";
  reportStatus?: ReportStatus;
  reportDueAt?: string;
  memberCount: number;
  ownerId: string;
  likeCount?: number;
  commentCount?: number;
  favoriteCount?: number;
};

export type GroupActivity = {
  id: string;
  groupId: string;
  /** 活动发起人（组织者）员工 ID */
  organizerId: string;
  title: string;
  description: string;
  coverUrl?: string;
  activityKind: ActivityKind;
  location?: string;
  capacity?: number;
  enrollDeadline?: string;
  startAt?: string;
  endAt?: string;
  rrule?: string;
  status: "draft" | "published" | "cancelled";
  likeCount?: number;
  commentCount?: number;
  favoriteCount?: number;
};

export type ActivityOccurrence = {
  id: string;
  activityId: string;
  startAt: string;
  endAt: string;
  capacity?: number;
  enrollCount: number;
  status: OccurrenceStatus;
};

export type ActivityEnrollment = {
  id: string;
  activityId: string;
  occurrenceId?: string;
  employeeId: string;
  enrolledAt: string;
  status: "enrolled" | "cancelled";
};

export type GroupMembership = {
  groupId: string;
  employeeId: string;
  role: "owner" | "admin" | "member";
};

/** 兴趣小组首页「查看更多」列表分区 */
export type InterestListSection = "recent" | "my-groups" | "recommend";

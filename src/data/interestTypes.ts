export type GroupCategory = "运动" | "文艺" | "生活" | "科技";

export type TagSource = "manual" | "ai_suggested" | "inferred";
export type GroupType = "official" | "spontaneous";
export type GroupVisibility = "public" | "dept_only" | "invite_only";
export type ReportStatus = "pending_report" | "reported" | "flagged";
export type ActivityKind = "one_off" | "recurring" | "series";

/** 系列活动报名方式：整场一次报名 vs 每场单独报名 */
export type SeriesEnrollmentMode = "once_before_first" | "per_occurrence";

/** 报名截止：固定时间 vs 开始前 N 小时 */
export type EnrollDeadlineMode = "fixed" | "hours_before_start";
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
  /** 小组头像（方图，列表/卡片展示） */
  avatarUrl?: string;
  type: GroupType;
  /** 小组分类（发现页筛选与列表展示） */
  category: GroupCategory;
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
  /** 仅 series：整场报名（首场前截止）或按场次报名 */
  seriesEnrollmentMode?: SeriesEnrollmentMode;
  location?: string;
  capacity?: number;
  enrollDeadline?: string;
  /** 报名截止配置方式；未设置表示不限制 */
  enrollDeadlineMode?: EnrollDeadlineMode;
  /** mode 为 hours_before_start 时的小时数 */
  enrollDeadlineHoursBefore?: number;
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

export type ActivityComment = {
  id: string;
  activityId: string;
  authorId: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  likeCount?: number;
  /** 回复所归属的顶层评论 ID */
  parentId?: string;
};

export type ActivityCommentSort = "latest" | "hottest";

export type GroupMembership = {
  groupId: string;
  employeeId: string;
  role: "owner" | "admin" | "member";
};

/** 兴趣小组首页「查看更多」列表分区 */
export type InterestListSection = "recent" | "my-groups" | "recommend";

/** 小组详情页主 Tab */
export type GroupDetailPanel = "activities" | "moments" | "highlights";

/** 小组圈动态（成员图文，结构与活动评论一致） */
export type GroupMoment = {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  likeCount?: number;
  /** 回复所归属的顶层动态 ID */
  parentId?: string;
};

/** 精彩瞬间（管理员按场次上传，每场次仅一条） */
export type GroupHighlight = {
  id: string;
  groupId: string;
  activityId: string;
  occurrenceId: string;
  imageUrls: string[];
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt?: string;
};

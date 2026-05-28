import type { InterestGroupFull } from "@/data/interestTypes";
import {
  CURRENT_EMPLOYEE_ID,
  enrollActivity,
  getActivityById,
  getJoinedGroups,
  interestGroups,
  isActivityOrganizer,
  isEnrolled,
  isMember,
  joinGroup,
  occurrences,
  terminateActivity,
  updateActivity,
} from "@/data/interestGroups";
import { getTagsByIds } from "@/data/interestTags";
import {
  filterRecentActivitiesByDate,
  getMyEnrollments,
  getRecentActivities,
  recommendGroups,
  type RecentActivityItem,
  type ScoredGroup,
} from "./interestRecommend";
import {
  formatActivityTime,
  formatRecurringSchedule,
} from "./interestOccurrences";
import { getVisibleGroups } from "./interestVisibility";

export type AgentIntent =
  | "recommend_group"
  | "recommend_activity"
  | "list_activity"
  | "group_detail"
  | "activity_detail"
  | "activity_schedule"
  | "my_groups"
  | "create_hint"
  | "create_activity_hint"
  | "join_guide"
  | "join_group_action"
  | "enroll_action"
  | "cancel_enrollment"
  | "terminate_activity"
  | "modify_activity"
  | "interest_tags"
  | "unknown";

export type ActivityTimeFilter = "all" | "week" | "next_week";

export type ParsedIntent = {
  intent: AgentIntent;
  topic?: string;
  groupName?: string;
  activityQuery?: string;
  timeFilter: ActivityTimeFilter;
  /** 随便/随机推荐小组 */
  randomPick?: boolean;
  /** 报名列表序号（0=第一个） */
  enrollIndex?: number;
};

export type CancelEnrollmentPayload = {
  activityId: string;
  activityTitle: string;
  startLabel: string;
  location: string;
};

export type CreateGuideStep = { step: number; title: string; action: string };

export type GroupDetailPayload = {
  group: InterestGroupFull;
  recentActivities: RecentActivityItem[];
  /** 近期活动总数（用于「查看更多」） */
  recentActivityTotal: number;
  joined: boolean;
};

/** 对话卡片最多展示条数，超出显示「查看更多」 */
export const AGENT_CARD_PREVIEW_LIMIT = 3;

export type AgentCardOverflow = {
  total: number;
  to: string;
  label: string;
};

export type TerminateConfirmPayload = {
  activityId: string;
  activityTitle: string;
};

export type AgentReply = {
  intent: AgentIntent;
  text: string;
  groups?: InterestGroupFull[];
  scoredGroups?: ScoredGroup[];
  recentActivities?: RecentActivityItem[];
  groupDetail?: GroupDetailPayload;
  createGuide?: { steps: CreateGuideStep[]; note: string };
  cancelConfirm?: CancelEnrollmentPayload;
  terminateConfirm?: TerminateConfirmPayload;
  navigateTo?: string;
  navigateLabel?: string;
  /** 主列表卡片超出预览条数时的跳转 */
  cardOverflow?: AgentCardOverflow;
  suggestions: string[];
};

export const viewMoreForIntent = (
  intent: AgentIntent,
  groupId?: string,
): Pick<AgentCardOverflow, "to" | "label"> => {
  switch (intent) {
    case "list_activity":
    case "activity_detail":
    case "recommend_activity":
    case "activity_schedule":
    case "enroll_action":
      return {
        to: "/agents/interest-groups/list/recent",
        label: "查看更多活动",
      };
    case "my_groups":
      return {
        to: "/agents/interest-groups/list/my-groups",
        label: "查看更多小组",
      };
    case "group_detail":
      return groupId
        ? {
            to: `/agents/interest-groups/${groupId}`,
            label: "查看小组全部活动",
          }
        : {
            to: "/agents/interest-groups/discover",
            label: "查看更多小组",
          };
    default:
      return {
        to: "/agents/interest-groups/discover",
        label: "查看更多小组",
      };
  }
};

const cardOverflowMeta = (
  total: number,
  intent: AgentIntent,
  groupId?: string,
): AgentCardOverflow | undefined => {
  if (total <= AGENT_CARD_PREVIEW_LIMIT) return undefined;
  return { total, ...viewMoreForIntent(intent, groupId) };
};

export const HOME_SUGGESTED_QUESTIONS = [
  "如何加入兴趣小组？",
  "这周有什么活动？",
  "推荐适合我的小组",
  "怎么发起一个活动？",
] as const;

const INTENT_SUGGESTIONS: Record<AgentIntent, string[]> = {
  recommend_group: [
    "查看更多小组",
    "下周有什么活动",
    "随便推荐几个小组",
  ],
  recommend_activity: [
    "帮我报名第一个",
    "有没有篮球活动",
    "推荐跑步小组",
  ],
  list_activity: [
    "帮我报名第一个",
    "摄影社是干什么的",
    "推荐我参加的活动",
  ],
  group_detail: ["加入这个小组", "这个小组有什么活动", "查看其他小组"],
  activity_detail: ["报名这个活动", "这周还有什么活动", "活动在周几举行"],
  activity_schedule: ["报名这个活动", "活动在几点", "推荐我参加的活动"],
  my_groups: ["最近有什么活动", "推荐新小组", "管理我的兴趣"],
  create_hint: ["立即创建小组", "怎么发起活动", "查看已有小组"],
  create_activity_hint: ["我的小组", "怎么创建小组", "这周有什么活动"],
  join_guide: ["推荐适合我的小组", "这周有什么活动", "我的小组"],
  join_group_action: ["这个小组有什么活动", "推荐我参加的活动", "我的小组"],
  enroll_action: ["我的活动有哪些", "这周有什么活动", "取消报名"],
  cancel_enrollment: ["我的活动有哪些", "这周有什么活动", "推荐跑步小组"],
  terminate_activity: ["我的活动有哪些", "怎么发起活动", "推荐小组"],
  modify_activity: ["查看活动详情", "我的活动有哪些", "这周有什么活动"],
  interest_tags: ["推荐适合我的小组", "这周有什么活动", "我的小组"],
  unknown: [
    "我想找跑步相关的小组",
    "这周有什么活动",
    "帮我报名一个活动",
    "摄影社是干什么的",
  ],
};

const UNKNOWN_CLARIFY_BODY =
  "抱歉，我还不太理解你的具体需求。可以告诉我：\n\n• 想找哪类小组或活动？（如跑步、篮球）\n• 是想加入/报名，还是查询活动信息？\n• 也可以说具体的小组或活动名称";

const buildUnknownReply = (hint?: string): AgentReply => ({
  intent: "unknown",
  text: hint ? `${hint}\n\n${UNKNOWN_CLARIFY_BODY}` : UNKNOWN_CLARIFY_BODY,
  suggestions: INTENT_SUGGESTIONS.unknown,
});

const TOPIC_ALIASES: Record<string, string[]> = {
  跑步: ["跑步", "晨跑"],
  摄影: ["摄影", "外拍"],
  读书: ["读书", "阅读"],
  徒步: ["徒步", "登山"],
  羽毛球: ["羽毛球"],
  篮球: ["篮球"],
  咖啡: ["咖啡"],
  音乐: ["音乐"],
  电竞: ["电竞", "游戏"],
};

const extractTopic = (q: string): string | undefined => {
  for (const [topic, aliases] of Object.entries(TOPIC_ALIASES)) {
    if (aliases.some((a) => q.includes(a))) return topic;
  }
  const m = q.match(
    /(?:推荐|有没有|找)(.{1,6}?)(?:小组|社群|俱乐部|队)/,
  );
  if (m?.[1] && m[1].length <= 6) return m[1].replace(/的$/, "");
  return undefined;
};

const parseTimeFilter = (q: string): ActivityTimeFilter => {
  if (/下周/.test(q)) return "next_week";
  if (/这周|本周|最近/.test(q)) return "week";
  return "all";
};

export const findGroupByQuery = (
  text: string,
  viewerId: string = CURRENT_EMPLOYEE_ID,
): InterestGroupFull | undefined => {
  const visible = getVisibleGroups(interestGroups, viewerId);
  const stripped = text
    .replace(
      /(是干什么的|怎么样|如何|介绍|详情|是什么|有什么活动|活动)/g,
      "",
    )
    .trim();

  const direct = visible.find(
    (g) => text.includes(g.name) || stripped.includes(g.name),
  );
  if (direct) return direct;

  const short = stripped.replace(/(社|俱乐部|队|小组)$/g, "").trim();
  if (short.length < 2) return undefined;

  return visible.find(
    (g) =>
      g.name.includes(short) ||
      short.includes(g.name.replace(/(社|俱乐部|队|小组)$/, "")),
  );
};

const startOfWeek = (d: Date) => {
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const weekday = day.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  day.setDate(day.getDate() + mondayOffset);
  return day;
};

const filterActivitiesByWeekOffset = (
  rows: RecentActivityItem[],
  weekOffset: 0 | 1,
): RecentActivityItem[] => {
  const weekStart = startOfWeek(new Date());
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return rows.filter(({ sortStartAt }) => {
    const start = new Date(sortStartAt);
    return start >= weekStart && start < weekEnd;
  });
};

const activityListHeader = (filter: ActivityTimeFilter): string => {
  if (filter === "week") return "本周活动（按时间排序）";
  if (filter === "next_week") return "下周活动（按时间排序）";
  return "近期可参与的活动";
};

const filterScoredByTopic = (
  rows: ScoredGroup[],
  topic?: string,
): ScoredGroup[] => {
  if (!topic) return rows;
  const aliases = TOPIC_ALIASES[topic] ?? [topic];
  const filtered = rows.filter(({ group }) => {
    if (aliases.some((a) => group.name.includes(a))) return true;
    const tagNames = getTagsByIds(group.tagIds).map((t) => t.name);
    return aliases.some((a) => tagNames.some((n) => n.includes(a)));
  });
  return filtered.length > 0 ? filtered : rows;
};

const findActivityByQuery = (
  query: string,
  viewerId: string,
): RecentActivityItem | undefined => {
  const recent = getRecentActivities(viewerId);
  const q = query
    .replace(
      /(在哪|时间|地点|详情|干什么|干嘛|是什么|取消|报名|帮我|删除|终止|改)/g,
      "",
    )
    .trim();
  if (!q) return recent[0];
  return recent.find(
    (item) =>
      item.activity.title.includes(q) ||
      item.group.name.includes(q) ||
      q.includes(item.activity.title.slice(0, 4)),
  );
};

const filterActivitiesByTopic = (
  rows: RecentActivityItem[],
  topic?: string,
): RecentActivityItem[] => {
  if (!topic) return rows;
  const aliases = TOPIC_ALIASES[topic] ?? [topic];
  const filtered = rows.filter(
    (item) =>
      aliases.some(
        (a) =>
          item.activity.title.includes(a) ||
          item.group.name.includes(a) ||
          getTagsByIds(item.group.tagIds).some((t) => t.name.includes(a)),
      ),
  );
  return filtered.length > 0 ? filtered : rows;
};

const resolveEnrollTarget = (
  query: string,
  viewerId: string,
  enrollIndex?: number,
): RecentActivityItem | undefined => {
  const recent = getRecentActivities(viewerId);
  if (enrollIndex !== undefined && recent[enrollIndex]) {
    return recent[enrollIndex];
  }
  if (/第一|首个|第一个/.test(query)) {
    return recent[0];
  }
  const named = findActivityByQuery(query, viewerId);
  if (named) return named;
  return recent.find((item) => !isEnrolled(item.activity.id, viewerId));
};

const findCancelableByQuery = (
  query: string,
  viewerId: string,
): CancelEnrollmentPayload | undefined => {
  const named = findActivityByQuery(query, viewerId);
  if (named && isEnrolled(named.activity.id, viewerId)) {
    const occ = named.statusOccurrence ?? named.nextOccurrence;
    return {
      activityId: named.activity.id,
      activityTitle: named.activity.title,
      startLabel: occ?.startAt
        ? formatActivityTime(occ.startAt)
        : named.timeLabel,
      location: named.activity.location ?? "待定",
    };
  }
  return getNextCancelableEnrollment(viewerId);
};

const formatActivityScheduleInfo = (item: RecentActivityItem): string => {
  const { activity } = item;
  if (activity.activityKind === "recurring" && activity.rrule) {
    const schedule =
      formatRecurringSchedule(
        activity.rrule,
        activity.startAt,
        activity.endAt,
      ) ?? item.timeLabel;
    return `「${activity.title}」为周期活动：${schedule}`;
  }
  return `「${activity.title}」：${item.timeLabel}`;
};

type ModifyParse = {
  activityId: string;
  activityTitle: string;
  field: "location" | "startAt";
  value: string;
};

const parseModifyActivity = (
  query: string,
  viewerId: string,
): ModifyParse | undefined => {
  const item = findActivityByQuery(query, viewerId);
  if (!item) return undefined;

  const locMatch = query.match(
    /(?:地点|位置)(?:改|换成|改为|调整到)([^，。]+)|改(?:到|为)([^，。]+?)(?:集合|门口|举行)/,
  );
  if (locMatch) {
    const value = (locMatch[1] ?? locMatch[2] ?? "").trim();
    if (value.length >= 2) {
      return {
        activityId: item.activity.id,
        activityTitle: item.activity.title,
        field: "location",
        value,
      };
    }
  }

  const timeMatch = query.match(
    /(?:时间|开始)(?:改|换成|改为|调整到).*?(\d{1,2})[:：点时](\d{0,2})?/,
  );
  if (timeMatch && item.activity.startAt) {
    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2] || 0);
    const start = new Date(item.activity.startAt);
    start.setHours(hour, minute, 0, 0);
    return {
      activityId: item.activity.id,
      activityTitle: item.activity.title,
      field: "startAt",
      value: start.toISOString(),
    };
  }

  return undefined;
};

export const getNextCancelableEnrollment = (
  viewerId: string = CURRENT_EMPLOYEE_ID,
): CancelEnrollmentPayload | undefined => {
  const mine = getMyEnrollments(viewerId);
  const now = Date.now();

  for (const enrollment of mine) {
    const activity = getActivityById(enrollment.activityId);
    if (!activity) continue;

    const occ = enrollment.occurrenceId
      ? occurrences.find((o) => o.id === enrollment.occurrenceId)
      : occurrences
          .filter((o) => o.activityId === activity.id && o.status === "scheduled")
          .sort(
            (a, b) =>
              new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
          )[0];

    const startAt = occ?.startAt ?? activity.startAt;
    if (!startAt || new Date(startAt).getTime() < now) continue;

    return {
      activityId: activity.id,
      activityTitle: activity.title,
      startLabel: formatActivityTime(startAt),
      location: activity.location ?? "待定",
    };
  }

  const fallback = mine[0];
  if (!fallback) return undefined;
  const activity = getActivityById(fallback.activityId);
  if (!activity) return undefined;
  const occ = fallback.occurrenceId
    ? occurrences.find((o) => o.id === fallback.occurrenceId)
    : undefined;
  return {
    activityId: activity.id,
    activityTitle: activity.title,
    startLabel: occ?.startAt
      ? formatActivityTime(occ.startAt)
      : activity.startAt
        ? formatActivityTime(activity.startAt)
        : "待定",
    location: activity.location ?? "待定",
  };
};

export const parseIntent = (input: string): ParsedIntent => {
  const q = input.trim();
  const lower = q.toLowerCase();
  const timeFilter = parseTimeFilter(q);
  const topic = extractTopic(q);
  const groupMatch = findGroupByQuery(q);
  const activityTopic =
    topic ??
    (/(篮球|羽毛球|跑步|摄影|读书|徒步|咖啡|音乐|电竞)/.exec(q)?.[1] as
      | string
      | undefined);

  if (
    /终止|下架|删除|取消发布/.test(q) &&
    /活动/.test(q) &&
    !/报名/.test(q)
  ) {
    return { intent: "terminate_activity", timeFilter, activityQuery: q };
  }

  if (
    /改|换成|改为|调整/.test(q) &&
    /活动/.test(q) &&
    (/地点|位置|时间|几点|开始/.test(q))
  ) {
    return { intent: "modify_activity", timeFilter, activityQuery: q };
  }

  if (
    /取消报名|不想参加|退出报名|不去了|去不了|没法参加|不能参加/.test(q) &&
    (/活动/.test(q) || getMyEnrollments(CURRENT_EMPLOYEE_ID).length > 0)
  ) {
    return { intent: "cancel_enrollment", timeFilter, activityQuery: q };
  }

  if (
    /帮我报名|帮我加入|替我报名|我要报名/.test(q) ||
    (/报名/.test(q) && /第一|首个|这个/.test(q))
  ) {
    const enrollIndex = /第一|首个|第一个/.test(q) ? 0 : undefined;
    return {
      intent: "enroll_action",
      timeFilter,
      activityQuery: q,
      enrollIndex,
    };
  }

  if (
    groupMatch &&
    /加入/.test(q) &&
    !/如何|怎么|加入兴趣/.test(q)
  ) {
    return {
      intent: "join_group_action",
      groupName: groupMatch.name,
      timeFilter,
    };
  }

  if (/我加入了|我的小组|我参加了哪些/.test(q)) {
    return { intent: "my_groups", timeFilter };
  }

  if (/帮我创建|帮我发起/.test(q)) {
    return {
      intent: /活动/.test(q) ? "create_activity_hint" : "create_hint",
      timeFilter,
    };
  }

  if (/怎么发起|怎么创建|创建小组|发起.*活动|创建.*活动/.test(q)) {
    return {
      intent: /活动/.test(q) && !/小组/.test(q)
        ? "create_activity_hint"
        : "create_hint",
      timeFilter,
    };
  }

  if (/换.*兴趣|改.*标签|兴趣标签|管理.*兴趣/.test(q)) {
    return { intent: "interest_tags", timeFilter };
  }

  if (/如何加入|怎么加入|加入兴趣|参与方式/.test(q)) {
    return { intent: "join_guide", timeFilter };
  }

  if (/推荐.*活动|推荐我参加|适合我的活动/.test(q)) {
    return {
      intent: "recommend_activity",
      timeFilter,
      topic: activityTopic,
    };
  }

  if (
    /有什么活动|这周.*活动|下周.*活动|活动推荐|可报名|最近.*活动/.test(q) ||
    (/活动/.test(q) && /下周|这周|本周|最近/.test(q)) ||
    (activityTopic && /活动/.test(q))
  ) {
    return {
      intent: "list_activity",
      timeFilter,
      topic: activityTopic,
    };
  }

  if (
    /周几|星期几|哪天|哪些天/.test(q) &&
    (/活动|举行|举办/.test(q) || findActivityByQuery(q, CURRENT_EMPLOYEE_ID))
  ) {
    return {
      intent: "activity_schedule",
      timeFilter,
      activityQuery: q,
    };
  }

  if (
    /活动在哪|活动时间|活动地址|集合|报名.*哪/.test(q) ||
    (/活动/.test(q) &&
      /(在哪|时间|地点|干什么|干嘛|是什么|介绍|详情)/.test(q))
  ) {
    return {
      intent: "activity_detail",
      timeFilter,
      activityQuery: q,
    };
  }

  if (
    groupMatch &&
    /(社|俱乐部|队|小组)/.test(q) &&
    /(干什么|怎么样|介绍|是什么|详情|干嘛)/.test(q)
  ) {
    return {
      intent: "group_detail",
      groupName: groupMatch.name,
      timeFilter,
    };
  }

  if (
    groupMatch &&
    !/推荐|有没有|随便/.test(q) &&
    !/活动/.test(q)
  ) {
    return {
      intent: "group_detail",
      groupName: groupMatch.name,
      timeFilter,
    };
  }

  if (/随便|随机/.test(q) && /小组|组/.test(q)) {
    return { intent: "recommend_group", timeFilter, randomPick: true };
  }

  if (
    /推荐|有没有|想加入|找.*组/.test(q) ||
    (topic && !/活动/.test(q))
  ) {
    return { intent: "recommend_group", topic, timeFilter };
  }

  if (/跑步|摄影|读书|徒步|羽毛球|篮球|咖啡|音乐|电竞/.test(lower)) {
    return {
      intent: /活动/.test(q) ? "list_activity" : "recommend_group",
      topic,
      timeFilter,
    };
  }

  return { intent: "unknown", timeFilter, topic };
};

export const buildReply = (
  parsed: ParsedIntent | AgentIntent,
  viewerId: string = CURRENT_EMPLOYEE_ID,
): AgentReply => {
  const intent =
    typeof parsed === "string" ? parsed : parsed.intent;
  const topic = typeof parsed === "string" ? undefined : parsed.topic;
  const timeFilter =
    typeof parsed === "string" ? ("all" as const) : parsed.timeFilter;
  const groupName =
    typeof parsed === "string" ? undefined : parsed.groupName;
  const activityQuery =
    typeof parsed === "string" ? undefined : parsed.activityQuery;
  const randomPick =
    typeof parsed === "string" ? undefined : parsed.randomPick;
  const enrollIndex =
    typeof parsed === "string" ? undefined : parsed.enrollIndex;

  switch (intent) {
    case "recommend_group": {
      const offset = randomPick
        ? Math.floor(Math.random() * 4)
        : 0;
      const pool = filterScoredByTopic(
        recommendGroups(viewerId, 12, offset),
        topic,
      );
      const scored =
        pool.length > 0
          ? pool
          : filterScoredByTopic(recommendGroups(viewerId, 12), undefined);
      const header = randomPick
        ? "为你随机挑选了这些小组："
        : topic
          ? `为你推荐以下${topic}相关小组：`
          : "根据你的兴趣，为你推荐以下小组：";
      return {
        intent,
        text:
          scored.length > 0
            ? header
            : topic
              ? `没有找到与「${topic}」强相关的小组，先看看这些热门推荐：`
              : "暂无更多推荐，可以先完善兴趣标签或浏览发现页。",
        scoredGroups: scored.length > 0 ? scored : undefined,
        cardOverflow: cardOverflowMeta(scored.length, intent),
        suggestions: INTENT_SUGGESTIONS.recommend_group,
      };
    }
    case "recommend_activity":
    case "list_activity": {
      let recent = getRecentActivities(viewerId);
      if (timeFilter === "week") {
        recent = filterRecentActivitiesByDate(recent, "week");
      } else if (timeFilter === "next_week") {
        recent = filterActivitiesByWeekOffset(recent, 1);
      }
      recent = filterActivitiesByTopic(recent, topic);
      const fallback = filterActivitiesByTopic(
        getRecentActivities(viewerId),
        topic,
      );
      const list = recent.length > 0 ? recent : fallback;
      const header =
        intent === "recommend_activity"
          ? topic
            ? `为你推荐以下${topic}相关活动：`
            : "根据你的兴趣，为你推荐以下活动："
          : list.length > 0
            ? activityListHeader(timeFilter)
            : timeFilter === "week" || timeFilter === "next_week"
              ? "这个时间段暂无活动，看看其他近期活动吧。"
              : topic
                ? `暂无「${topic}」相关活动，看看其他近期活动：`
                : "近期暂无可参与的活动。";
      return {
        intent,
        text: header,
        recentActivities: list,
        cardOverflow: cardOverflowMeta(list.length, intent),
        suggestions:
          intent === "recommend_activity"
            ? INTENT_SUGGESTIONS.recommend_activity
            : INTENT_SUGGESTIONS.list_activity,
      };
    }
    case "group_detail": {
      const group = groupName
        ? findGroupByQuery(groupName, viewerId)
        : undefined;
      if (!group) {
        return buildUnknownReply(
          groupName
            ? `没有找到叫「${groupName}」的小组。你想了解哪类兴趣小组，或换一个小组名称？`
            : "请告诉我你想了解的小组名称，例如「摄影社是干什么的」。",
        );
      }
      const joined = getJoinedGroups(viewerId).some((g) => g.id === group.id);
      const groupActivities = getRecentActivities(viewerId).filter(
        (item) => item.group.id === group.id,
      );
      const recentActivities = groupActivities.slice(
        0,
        AGENT_CARD_PREVIEW_LIMIT,
      );
      const tags = getTagsByIds(group.tagIds)
        .map((t) => `#${t.name}`)
        .join(" ");
      return {
        intent,
        text: `${group.name}\n\n${group.description ?? "暂无简介"}\n\n标签：${tags || "暂无"}\n成员：${group.memberCount} 人`,
        groupDetail: {
          group,
          recentActivities,
          recentActivityTotal: groupActivities.length,
          joined,
        },
        suggestions: INTENT_SUGGESTIONS.group_detail,
      };
    }
    case "activity_detail": {
      const item = findActivityByQuery(activityQuery ?? "", viewerId);
      if (!item) {
        return buildUnknownReply(
          "没有找到你说的活动。请补充活动名称，或说明你想查时间、地点还是报名？",
        );
      }
      const desc = item.activity.description?.trim();
      return {
        intent,
        text: [
          `「${item.activity.title}」`,
          desc ? `\n${desc}` : "",
          `\n时间：${item.timeLabel}`,
          `地点：${item.activity.location ?? "待定"}`,
          `主办：${item.group.name}`,
        ].join(""),
        recentActivities: [item],
        suggestions: INTENT_SUGGESTIONS.activity_detail,
      };
    }
    case "activity_schedule": {
      const item = findActivityByQuery(activityQuery ?? "", viewerId);
      if (!item) {
        return {
          intent: "unknown",
          text: "请告诉我活动名称，例如「读书分享在周几举行」。",
          suggestions: INTENT_SUGGESTIONS.activity_schedule,
        };
      }
      return {
        intent,
        text: formatActivityScheduleInfo(item),
        recentActivities: [item],
        suggestions: INTENT_SUGGESTIONS.activity_schedule,
      };
    }
    case "my_groups": {
      const groups = getJoinedGroups(viewerId);
      const scored = recommendGroups(viewerId, 12);
      return {
        intent,
        text:
          groups.length > 0
            ? `你已加入 ${groups.length} 个兴趣小组：`
            : scored.length > 0
              ? "你还没有加入任何小组，可以先看看这些推荐："
              : "你还没有加入任何小组，可以前往「加入小组」浏览。",
        groups: groups.length > 0 ? groups : undefined,
        scoredGroups: groups.length === 0 ? scored : undefined,
        cardOverflow: cardOverflowMeta(
          groups.length > 0 ? groups.length : scored.length,
          intent,
        ),
        suggestions: INTENT_SUGGESTIONS.my_groups,
      };
    }
    case "create_hint":
      return {
        intent,
        text:
          "创建小组或发起活动，可以按下面步骤操作（发起活动需先加入小组，由组长发布）：",
        createGuide: {
          steps: [
            { step: 1, title: "进入创建页面", action: "点击「创建小组」按钮" },
            { step: 2, title: "填写小组信息", action: "名称、简介、标签" },
            { step: 3, title: "上传封面图", action: "可选，不上传将使用默认封面" },
            { step: 4, title: "提交创建", action: "立即上线，可被搜索" },
          ],
          note: "创建后 7 日内需完成工会/HR 报备",
        },
        suggestions: INTENT_SUGGESTIONS.create_hint,
      };
    case "join_guide": {
      const scored = recommendGroups(viewerId, 12);
      const steps =
        "加入兴趣小组很简单：\n\n1. 在首页浏览「AI 推荐」或「加入小组」\n2. 打开小组详情，点击「加入小组」\n3. 完善兴趣标签可获得更精准推荐\n\n发起活动需先加入小组，由组长在小组内发布。";
      return {
        intent,
        text:
          scored.length > 0
            ? `${steps}\n\n为你推荐这些小组，点击卡片即可加入：`
            : steps,
        scoredGroups: scored.length > 0 ? scored : undefined,
        cardOverflow: cardOverflowMeta(scored.length, intent),
        suggestions: INTENT_SUGGESTIONS.join_guide,
      };
    }
    case "join_group_action": {
      const group = groupName
        ? findGroupByQuery(groupName, viewerId)
        : undefined;
      if (!group) {
        return buildUnknownReply(
          "没有找到对应小组。请说出完整小组名称，例如「加入摄影社」。",
        );
      }
      if (isMember(group.id, viewerId)) {
        return {
          intent,
          text: `你已在「${group.name}」中，无需重复加入。`,
          navigateTo: `/agents/interest-groups/${group.id}`,
          navigateLabel: "查看小组",
          suggestions: INTENT_SUGGESTIONS.join_group_action,
        };
      }
      if (!joinGroup(group.id, viewerId)) {
        return {
          intent,
          text: `「${group.name}」暂时无法加入（可能已满或需邀请）。`,
          suggestions: INTENT_SUGGESTIONS.recommend_group,
        };
      }
      return {
        intent,
        text: `✅ 已帮你加入「${group.name}」！\n\n可在小组内查看活动并报名参与。`,
        navigateTo: `/agents/interest-groups/${group.id}`,
        navigateLabel: "查看小组",
        suggestions: INTENT_SUGGESTIONS.join_group_action,
      };
    }
    case "enroll_action": {
      const item = resolveEnrollTarget(
        activityQuery ?? "",
        viewerId,
        enrollIndex,
      );
      if (!item) {
        return buildUnknownReply(
          "没有找到可报名的活动。你想报名哪一场？可以说活动名称，或「帮我报名第一个」。",
        );
      }
      if (isEnrolled(item.activity.id, viewerId)) {
        return {
          intent,
          text: `你已报名「${item.activity.title}」（${item.timeLabel}）。`,
          navigateTo: `/agents/interest-groups/activities/${item.activity.id}`,
          navigateLabel: "查看活动",
          suggestions: INTENT_SUGGESTIONS.enroll_action,
        };
      }
      if (!enrollActivity(item.activity.id, viewerId)) {
        return {
          intent,
          text: `「${item.activity.title}」报名失败，可能已满或已截止。`,
          recentActivities: [item],
          suggestions: INTENT_SUGGESTIONS.list_activity,
        };
      }
      return {
        intent,
        text: `✅ 已帮你报名「${item.activity.title}」！\n\n活动时间：${item.timeLabel}\n地点：${item.activity.location ?? "待定"}`,
        navigateTo: `/agents/interest-groups/activities/${item.activity.id}`,
        navigateLabel: "查看活动",
        suggestions: INTENT_SUGGESTIONS.enroll_action,
      };
    }
    case "cancel_enrollment": {
      const payload = findCancelableByQuery(activityQuery ?? "", viewerId);
      if (!payload) {
        return buildUnknownReply(
          "你当前没有可取消的报名记录。若要取消某场活动，请说出活动名称。",
        );
      }
      return {
        intent,
        text: "请确认是否取消报名：",
        cancelConfirm: payload,
        suggestions: INTENT_SUGGESTIONS.cancel_enrollment,
      };
    }
    case "terminate_activity": {
      const item = findActivityByQuery(activityQuery ?? "", viewerId);
      if (!item) {
        return {
          intent: "unknown",
          text: "没有找到对应活动，请说明活动名称后再试。",
          suggestions: INTENT_SUGGESTIONS.terminate_activity,
        };
      }
      if (!isActivityOrganizer(item.activity.id, viewerId)) {
        return {
          intent,
          text: "仅活动创建人可终止活动。如需取消自己的报名，可以说「取消报名」。",
          suggestions: INTENT_SUGGESTIONS.cancel_enrollment,
        };
      }
      if (item.activity.status === "cancelled") {
        return {
          intent,
          text: `「${item.activity.title}」已终止，无需重复操作。`,
          suggestions: INTENT_SUGGESTIONS.terminate_activity,
        };
      }
      return {
        intent,
        text: "请确认是否终止该活动（未举办场次将取消，报名作废）：",
        terminateConfirm: {
          activityId: item.activity.id,
          activityTitle: item.activity.title,
        },
        suggestions: INTENT_SUGGESTIONS.terminate_activity,
      };
    }
    case "modify_activity": {
      const parsedModify = parseModifyActivity(activityQuery ?? "", viewerId);
      if (!parsedModify) {
        const item = findActivityByQuery(activityQuery ?? "", viewerId);
        if (!item) {
          return {
            intent: "unknown",
            text: "没有找到对应活动。请说明要修改的活动名称，例如「把晨跑活动地点改为公司门口」。",
            suggestions: INTENT_SUGGESTIONS.modify_activity,
          };
        }
        if (!isActivityOrganizer(item.activity.id, viewerId)) {
          return {
            intent,
            text: "仅活动创建人可修改活动信息，你可以联系组织者。",
            suggestions: INTENT_SUGGESTIONS.activity_detail,
          };
        }
        return {
          intent,
          text: `请前往活动编辑页修改「${item.activity.title}」的时间或地点。`,
          navigateTo: `/agents/interest-groups/activities/${item.activity.id}?edit=1`,
          navigateLabel: "去编辑活动",
          suggestions: INTENT_SUGGESTIONS.modify_activity,
        };
      }
      if (!isActivityOrganizer(parsedModify.activityId, viewerId)) {
        return {
          intent,
          text: "仅活动创建人可修改活动信息。",
          suggestions: INTENT_SUGGESTIONS.modify_activity,
        };
      }
      const patch =
        parsedModify.field === "location"
          ? { location: parsedModify.value }
          : { startAt: parsedModify.value };
      const updated = updateActivity(parsedModify.activityId, patch);
      if (!updated) {
        return {
          intent,
          text: `「${parsedModify.activityTitle}」修改失败，请稍后在活动详情中手动编辑。`,
          navigateTo: `/agents/interest-groups/activities/${parsedModify.activityId}?edit=1`,
          navigateLabel: "去编辑活动",
          suggestions: INTENT_SUGGESTIONS.modify_activity,
        };
      }
      const fieldLabel =
        parsedModify.field === "location" ? "地点" : "开始时间";
      return {
        intent,
        text: `✅ 已帮你更新「${parsedModify.activityTitle}」的${fieldLabel}。\n\n${fieldLabel}：${parsedModify.field === "location" ? parsedModify.value : formatActivityTime(parsedModify.value)}`,
        navigateTo: `/agents/interest-groups/activities/${parsedModify.activityId}`,
        navigateLabel: "查看修改结果",
        suggestions: INTENT_SUGGESTIONS.modify_activity,
      };
    }
    case "create_activity_hint":
      return {
        intent,
        text: "发起活动需先加入小组，由组长或小组创建者在小组内发布：",
        createGuide: {
          steps: [
            { step: 1, title: "加入或创建小组", action: "进入目标兴趣小组" },
            { step: 2, title: "进入小组详情", action: "点击「发布活动」" },
            { step: 3, title: "填写活动信息", action: "时间、地点、名额等" },
            { step: 4, title: "发布上线", action: "成员即可浏览报名" },
          ],
          note: "若你尚未加入任何小组，可先创建或加入一个小组",
        },
        navigateTo: "/agents/interest-groups",
        navigateLabel: "去兴趣小组首页",
        suggestions: INTENT_SUGGESTIONS.create_activity_hint,
      };
    case "interest_tags":
      return {
        intent,
        text: "你可以在「我的兴趣」中更新兴趣标签，AI 会据此推荐更合适的小组与活动。",
        navigateTo: "/profile/interests",
        navigateLabel: "去设置兴趣标签",
        suggestions: INTENT_SUGGESTIONS.interest_tags,
      };
    case "unknown":
    default:
      return buildUnknownReply();
  }
};

/** @deprecated 使用 ParsedIntent */
export const buildReplyFromIntent = (
  intent: AgentIntent,
  viewerId?: string,
) => buildReply(intent, viewerId);

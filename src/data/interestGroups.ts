import type {
  ActivityEnrollment,
  ActivityOccurrence,
  GroupActivity,
  GroupMembership,
  InterestGroupFull,
} from "./interestTypes";
import { ACTIVITY_COVERS, DEFAULT_GROUP_COVER, GROUP_COVERS } from "./interestImages";
import {
  buildSeriesOccurrences,
  expandRecurringOccurrences,
  getActivityPhase,
  nextWeeklyOccurrence,
  oneOffEnrollmentBlockedReason,
} from "@/lib/interestOccurrences";
import { isOccurrenceInEnrollmentPickerWindow } from "@/lib/occurrenceEnrollmentPicker";
import {
  getEnrollableSeriesOccurrences,
  getFirstSeriesOccurrence,
  getSeriesEnrollmentMode,
  isSeriesWholeEnrollmentOpen,
  sortOccurrencesByStart,
} from "@/lib/seriesEnrollment";

export const CURRENT_EMPLOYEE_ID = "u1";

/** 小组成员人数统一上限 */
export const GROUP_MEMBER_LIMIT = 100;

export const isGroupFull = (group: Pick<InterestGroupFull, "memberCount">) =>
  group.memberCount >= GROUP_MEMBER_LIMIT;

const addDays = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const atLocal = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
) => new Date(year, month - 1, day, hour, minute).toISOString();

const addHours = (iso: string, hours: number) => {
  const d = new Date(iso);
  d.setTime(d.getTime() + hours * 3600000);
  return d.toISOString();
};

const now = new Date();

/** 生成未来若干场「每周固定星期几、固定时刻」的场次时间 */
const upcomingWeeklySlots = (
  weekdays: number[],
  hour: number,
  minute: number,
  count: number,
): string[] => {
  const slots: string[] = [];
  let cursor = new Date(now);
  while (slots.length < count) {
    for (const wd of weekdays) {
      const d = nextWeeklyOccurrence(wd, hour, minute, cursor);
      const iso = d.toISOString();
      if (d.getTime() > now.getTime() && !slots.includes(iso)) {
        slots.push(iso);
        if (slots.length >= count) break;
      }
    }
    cursor = new Date(cursor.getTime() + 86400000);
  }
  return slots.sort();
};

const fitnessWeeklySlots = upcomingWeeklySlots([1, 4], 19, 0, 4);

const badmintonSeriesSlots = {
  preliminary: atLocal(2026, 7, 1, 19, 0),
  playoff: atLocal(2026, 7, 20, 19, 0),
  final: atLocal(2026, 8, 1, 14, 0),
} as const;

const badmintonSeriesEnds = {
  preliminary: atLocal(2026, 7, 1, 22, 0),
  playoff: atLocal(2026, 7, 20, 22, 0),
  final: atLocal(2026, 8, 1, 17, 0),
} as const;

/** 他人发布 · 系列整场报名（mock，五场） */
const hikingWholeSeriesSessions = [
  { startAt: addDays(now, 7), durationHours: 2 },
  { startAt: addDays(now, 14), durationHours: 2 },
  { startAt: addDays(now, 21), durationHours: 7 },
  { startAt: addDays(now, 28), durationHours: 6 },
  { startAt: addDays(now, 35), durationHours: 2.5 },
] as const;

/** 已结束活动 mock：我组织的（单次 / 每周 / 系列） */
const endedOrgOneOff = {
  start: atLocal(2026, 4, 19, 9, 0),
  end: atLocal(2026, 4, 19, 12, 0),
} as const;

const endedOrgWeeklySessions = [
  atLocal(2026, 4, 5, 14, 0),
  atLocal(2026, 4, 12, 14, 0),
  atLocal(2026, 4, 26, 14, 0),
  atLocal(2026, 5, 10, 14, 0),
  atLocal(2026, 5, 17, 14, 0),
] as const;

const endedOrgSeriesSessions = [
  {
    start: atLocal(2026, 3, 8, 19, 0),
    end: atLocal(2026, 3, 8, 21, 0),
  },
  {
    start: atLocal(2026, 4, 12, 19, 0),
    end: atLocal(2026, 4, 12, 21, 0),
  },
  {
    start: atLocal(2026, 5, 17, 19, 0),
    end: atLocal(2026, 5, 17, 21, 0),
  },
] as const;

/** 已结束活动 mock：我参与的（单次 / 每周 / 系列） */
const endedPtOneOff = {
  start: atLocal(2026, 5, 8, 18, 0),
  end: atLocal(2026, 5, 8, 19, 30),
} as const;

const endedPtWeeklySessions = [
  atLocal(2026, 4, 2, 19, 0),
  atLocal(2026, 4, 9, 19, 0),
  atLocal(2026, 4, 23, 19, 0),
  atLocal(2026, 5, 7, 19, 0),
  atLocal(2026, 5, 21, 19, 0),
] as const;

const endedPtSeriesSessions = [
  {
    start: atLocal(2026, 3, 15, 19, 0),
    end: atLocal(2026, 3, 15, 21, 0),
  },
  {
    start: atLocal(2026, 4, 19, 19, 0),
    end: atLocal(2026, 4, 19, 21, 0),
  },
  {
    start: atLocal(2026, 5, 24, 19, 0),
    end: atLocal(2026, 5, 24, 21, 0),
  },
] as const;

const pickDisplayOccurrence = (
  occs: ActivityOccurrence[],
): ActivityOccurrence | undefined => {
  const scheduled = occs.find((o) => o.status === "scheduled");
  if (scheduled) return scheduled;
  const completed = occs
    .filter((o) => o.status === "completed")
    .sort(
      (a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime(),
    );
  if (completed[0]) return completed[0];
  return [...occs].sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
  )[0];
};

export let interestGroups: InterestGroupFull[] = [
  {
    id: "ig1",
    name: "咖啡品鉴",
    description: "每周品鉴不同产区咖啡豆，欢迎新手与老饕。",
    coverUrl: GROUP_COVERS.ig1,
    type: "official",
    visibility: "public",
    tagIds: ["tag-boardgame"],
    status: "active",
    memberCount: 32,
    ownerId: "u3",
    likeCount: 128,
    commentCount: 24,
    favoriteCount: 56,
  },
  {
    id: "ig2",
    name: "电竞社",
    description: "内部联赛、组队开黑与战术分享。",
    coverUrl: GROUP_COVERS.ig2,
    type: "official",
    visibility: "public",
    tagIds: ["tag-gaming"],
    status: "active",
    memberCount: 48,
    ownerId: "u2",
    likeCount: 210,
    commentCount: 89,
    favoriteCount: 102,
  },
  {
    id: "ig3",
    name: "读书会",
    description: "每月共读一本，周末线下茶话会。",
    coverUrl: GROUP_COVERS.ig3,
    type: "official",
    visibility: "public",
    tagIds: ["tag-music"],
    status: "active",
    memberCount: 26,
    ownerId: "u3",
    likeCount: 76,
    commentCount: 18,
    favoriteCount: 40,
  },
  {
    id: "ig4",
    name: "音乐社",
    description: "乐队排练、露天演出与公司年会节目排练。",
    coverUrl: GROUP_COVERS.ig4,
    type: "spontaneous",
    visibility: "public",
    tagIds: ["tag-music"],
    status: "active",
    reportStatus: "pending_report",
    reportDueAt: addDays(now, 5).slice(0, 10),
    memberCount: 19,
    ownerId: "u5",
    likeCount: 54,
    commentCount: 11,
    favoriteCount: 22,
  },
  {
    id: "ig5",
    name: "摄影社",
    description: "外拍、后期交流与年度摄影展。",
    coverUrl: GROUP_COVERS.ig5,
    type: "spontaneous",
    visibility: "dept_only",
    deptIds: ["rd-fe", "rd-ai"],
    tagIds: ["tag-photo"],
    status: "active",
    reportStatus: "reported",
    memberCount: 22,
    ownerId: "u1",
    likeCount: 92,
    commentCount: 15,
    favoriteCount: 38,
  },
  {
    id: "ig6",
    name: "健身房",
    description: "撸铁打卡、团课预约与减脂餐分享。",
    coverUrl: GROUP_COVERS.ig6,
    type: "official",
    visibility: "public",
    tagIds: ["tag-fitness", "tag-running"],
    status: "active",
    memberCount: 37,
    ownerId: "u2",
    likeCount: 165,
    commentCount: 42,
    favoriteCount: 71,
  },
  {
    id: "ig7",
    name: "羽毛球俱乐部",
    description: "每周固定局，新手可约搭子，提供球拍借用。",
    coverUrl: GROUP_COVERS.ig7,
    type: "official",
    visibility: "public",
    tagIds: ["tag-badminton"],
    status: "active",
    memberCount: 56,
    ownerId: "u2",
    likeCount: 98,
    commentCount: 31,
    favoriteCount: 45,
  },
  {
    id: "ig8",
    name: "周末徒步社",
    description: "京郊轻徒步，周末一日线，有车拼座。",
    coverUrl: GROUP_COVERS.ig8,
    type: "spontaneous",
    visibility: "public",
    tagIds: ["tag-hiking"],
    status: "active",
    reportStatus: "pending_report",
    reportDueAt: addDays(now, 6).slice(0, 10),
    memberCount: 41,
    ownerId: "u4",
    likeCount: 72,
    commentCount: 19,
    favoriteCount: 33,
  },
  {
    id: "ig9",
    name: "桌游夜话",
    description: "狼人杀、阿瓦隆、德式桌游，周五晚固定开局。",
    coverUrl: GROUP_COVERS.ig9,
    type: "official",
    visibility: "public",
    tagIds: ["tag-boardgame"],
    status: "active",
    memberCount: 35,
    ownerId: "u5",
    likeCount: 61,
    commentCount: 28,
    favoriteCount: 29,
  },
  {
    id: "ig10",
    name: "前端技术圈",
    description: "React/Vite 实践分享，代码 Review 与内部分享。",
    coverUrl: GROUP_COVERS.ig10,
    type: "official",
    visibility: "public",
    tagIds: ["tag-tech"],
    status: "active",
    memberCount: 62,
    ownerId: "u1",
    likeCount: 142,
    commentCount: 56,
    favoriteCount: 88,
  },
  {
    id: "ig11",
    name: "烘焙下午茶",
    description: "司康、曲奇与咖啡搭配，周末动手体验。",
    coverUrl: GROUP_COVERS.ig11,
    type: "spontaneous",
    visibility: "public",
    tagIds: ["tag-boardgame"],
    status: "active",
    memberCount: 24,
    ownerId: "u3",
    likeCount: 48,
    commentCount: 12,
    favoriteCount: 21,
  },
  {
    id: "ig12",
    name: "晨跑打卡组",
    description: "工作日 7:00 园区慢跑，打卡领积分。",
    coverUrl: GROUP_COVERS.ig12,
    type: "official",
    visibility: "public",
    tagIds: ["tag-running"],
    status: "active",
    memberCount: 44,
    ownerId: "u2",
    likeCount: 89,
    commentCount: 22,
    favoriteCount: 40,
  },
  {
    id: "ig13",
    name: "公益志愿社",
    description: "社区服务、献血宣传、环保行动等企业志愿活动。",
    coverUrl: GROUP_COVERS.ig13,
    type: "official",
    visibility: "public",
    tagIds: ["tag-volunteer"],
    status: "active",
    memberCount: 28,
    ownerId: "u6",
    likeCount: 55,
    commentCount: 9,
    favoriteCount: 18,
  },
  {
    id: "ig14",
    name: "观影俱乐部",
    description: "每月一部佳片，线下观影后交流讨论。",
    coverUrl: GROUP_COVERS.ig14,
    type: "spontaneous",
    visibility: "public",
    tagIds: ["tag-music"],
    status: "active",
    memberCount: 31,
    ownerId: "u5",
    likeCount: 44,
    commentCount: 14,
    favoriteCount: 26,
  },
  {
    id: "ig15",
    name: "电竞青训营",
    description: "王者荣耀/英雄联盟内战，娱乐赛与教学局。",
    coverUrl: GROUP_COVERS.ig15,
    type: "official",
    visibility: "public",
    tagIds: ["tag-gaming"],
    status: "active",
    memberCount: 67,
    ownerId: "u2",
    likeCount: 198,
    commentCount: 95,
    favoriteCount: 112,
  },
  {
    id: "ig16",
    name: "摄影外拍团",
    description: "城市街拍、人像外拍，周末约拍互勉。",
    coverUrl: GROUP_COVERS.ig16,
    type: "spontaneous",
    visibility: "public",
    tagIds: ["tag-photo"],
    status: "active",
    memberCount: 29,
    ownerId: "u4",
    likeCount: 67,
    commentCount: 16,
    favoriteCount: 34,
  },
];

export let groupMemberships: GroupMembership[] = [
  { groupId: "ig1", employeeId: "u1", role: "member" },
  { groupId: "ig5", employeeId: "u1", role: "owner" },
  { groupId: "ig6", employeeId: "u1", role: "member" },
];

export let activities: GroupActivity[] = [
  {
    id: "act-1",
    groupId: "ig6",
    organizerId: "u2",
    title: "周三夜跑 5K",
    description: "集合后统一热身，配速 6-7 分/km，新手友好。",
    coverUrl: ACTIVITY_COVERS["act-1"],
    activityKind: "recurring",
    location: "公司南门跑道",
    capacity: 30,
    startAt: addDays(now, 2),
    endAt: addHours(addDays(now, 2), 1.5),
    rrule: "FREQ=WEEKLY;BYDAY=WE",
    status: "published",
    likeCount: 45,
    commentCount: 8,
    favoriteCount: 12,
  },
  {
    id: "act-2",
    groupId: "ig1",
    organizerId: "u3",
    title: "手冲咖啡体验课",
    description: "学习基础手冲流程，现场提供器具与豆子。",
    coverUrl: ACTIVITY_COVERS["act-2"],
    activityKind: "one_off",
    location: "3F 茶水间",
    capacity: 20,
    startAt: addDays(now, 10),
    endAt: addHours(addDays(now, 10), 2),
    enrollDeadline: addDays(now, 8),
    status: "published",
    likeCount: 33,
    commentCount: 5,
    favoriteCount: 9,
  },
  {
    id: "act-4",
    groupId: "ig3",
    organizerId: "u3",
    title: "春季共读系列",
    description: "三月共读书目《思考，快与慢》，分三场线下讨论。",
    coverUrl: ACTIVITY_COVERS["act-4"],
    activityKind: "series",
    seriesEnrollmentMode: "per_occurrence",
    location: "图书馆讨论室",
    capacity: 15,
    startAt: addDays(now, 7),
    endAt: addHours(addDays(now, 7), 2),
    status: "published",
    likeCount: 28,
    commentCount: 6,
    favoriteCount: 14,
  },
  {
    id: "act-5",
    groupId: "ig6",
    organizerId: "u2",
    title: "每周健身",
    description:
      "固定每周一、周四晚间团练，含热身、力量与拉伸指导。适合想养成运动习惯的同事，现场有教练带练，器械齐全，练完可一起拼车回公司。",
    coverUrl: ACTIVITY_COVERS["act-5"],
    activityKind: "recurring",
    location: "公司附近健身房",
    capacity: 5,
    startAt: fitnessWeeklySlots[0],
    endAt: addHours(fitnessWeeklySlots[0], 2),
    rrule: "FREQ=WEEKLY;BYDAY=MO,TH",
    status: "published",
    likeCount: 52,
    commentCount: 11,
    favoriteCount: 18,
  },
  {
    id: "act-6",
    groupId: "ig7",
    organizerId: "u1",
    title: "羽毛球友谊赛",
    description:
      "公司羽毛球俱乐部年度友谊赛，面向全体同事开放。单打、双打均可报名，新手有老队员带练，现场可借用球拍。\n\n" +
      "赛程：\n" +
      "· 初赛 — 7月1日（周三）19:00\n" +
      "· 晋级赛 — 7月20日（周一）19:00\n" +
      "· 决赛 — 8月1日（周六）14:00\n\n" +
      "初赛采用分组循环，晋级赛与决赛现场抽签对阵。友谊第一、比赛第二，欢迎来切磋球技、结识球友。",
    coverUrl: ACTIVITY_COVERS["act-6"],
    activityKind: "series",
    seriesEnrollmentMode: "once_before_first",
    location: "公司附近某某羽毛球馆",
    capacity: 50,
    enrollDeadline: badmintonSeriesSlots.preliminary,
    startAt: badmintonSeriesSlots.preliminary,
    endAt: badmintonSeriesEnds.preliminary,
    status: "published",
    likeCount: 76,
    commentCount: 19,
    favoriteCount: 42,
  },
  {
    id: "act-e-org-1",
    groupId: "ig5",
    organizerId: "u1",
    title: "奥森春日人像外拍",
    description: "户外人像实战，含构图与用光讲解，已圆满结束。",
    coverUrl: ACTIVITY_COVERS["act-2"],
    activityKind: "one_off",
    location: "奥林匹克森林公园南园",
    capacity: 12,
    startAt: endedOrgOneOff.start,
    endAt: endedOrgOneOff.end,
    enrollDeadline: atLocal(2026, 4, 17, 18, 0),
    status: "published",
    likeCount: 18,
    commentCount: 4,
    favoriteCount: 7,
  },
  {
    id: "act-e-org-2",
    groupId: "ig5",
    organizerId: "u1",
    title: "周六扫街固定局",
    description: "每周六下午固定外拍扫街，本季场次已全部完成。",
    coverUrl: ACTIVITY_COVERS["act-5"],
    activityKind: "recurring",
    location: "798 艺术区北门集合",
    capacity: 15,
    startAt: endedOrgWeeklySessions[4],
    endAt: addHours(endedOrgWeeklySessions[4], 3),
    rrule: "FREQ=WEEKLY;BYDAY=SA",
    status: "published",
    likeCount: 24,
    commentCount: 6,
    favoriteCount: 11,
  },
  {
    id: "act-e-org-3",
    groupId: "ig5",
    organizerId: "u1",
    title: "三月主题展映系列",
    description: "摄影社春季三场主题展映与点评，系列已全部结束。",
    coverUrl: ACTIVITY_COVERS["act-4"],
    activityKind: "series",
    location: "摄影社活动室",
    capacity: 20,
    startAt: endedOrgSeriesSessions[0].start,
    endAt: endedOrgSeriesSessions[0].end,
    status: "published",
    likeCount: 31,
    commentCount: 8,
    favoriteCount: 14,
  },
  {
    id: "act-e-pt-1",
    groupId: "ig6",
    organizerId: "u2",
    title: "减脂营结营体测",
    description: "季度减脂营结营体测与经验分享。",
    coverUrl: ACTIVITY_COVERS["act-6"],
    activityKind: "one_off",
    location: "公司附近健身房",
    capacity: 30,
    startAt: endedPtOneOff.start,
    endAt: endedPtOneOff.end,
    enrollDeadline: atLocal(2026, 5, 6, 12, 0),
    status: "published",
    likeCount: 22,
    commentCount: 3,
    favoriteCount: 6,
  },
  {
    id: "act-e-pt-2",
    groupId: "ig6",
    organizerId: "u2",
    title: "周三力量团课",
    description: "每周三晚间力量训练团课，春季班已结课。",
    coverUrl: ACTIVITY_COVERS["act-5"],
    activityKind: "recurring",
    location: "公司附近健身房",
    capacity: 20,
    startAt: endedPtWeeklySessions[4],
    endAt: addHours(endedPtWeeklySessions[4], 1.5),
    rrule: "FREQ=WEEKLY;BYDAY=WE",
    status: "published",
    likeCount: 38,
    commentCount: 7,
    favoriteCount: 12,
  },
  {
    id: "act-e-pt-3",
    groupId: "ig7",
    organizerId: "u2",
    title: "春季双打积分赛",
    description: "羽毛球俱乐部春季双打积分赛，三场淘汰赛已全部打完。",
    coverUrl: ACTIVITY_COVERS["act-6"],
    activityKind: "series",
    location: "公司附近某某羽毛球馆",
    capacity: 32,
    startAt: endedPtSeriesSessions[0].start,
    endAt: endedPtSeriesSessions[0].end,
    status: "published",
    likeCount: 45,
    commentCount: 12,
    favoriteCount: 19,
  },
  {
    id: "act-7",
    groupId: "ig8",
    organizerId: "u4",
    title: "京郊徒步挑战赛",
    description:
      "周末徒步社春季系列赛，共五场递进：\n" +
      "· 第1场 行前说明与装备检查\n" +
      "· 第2场 适应徒步（公司周边）\n" +
      "· 第3场 京郊一日徒步（东线）\n" +
      "· 第4场 京郊一日徒步（西线）\n" +
      "· 第5场 结营分享与颁奖\n\n" +
      "本活动为整场报名，报名一次参加全部场次；首场开始前可报名。",
    coverUrl: ACTIVITY_COVERS["act-5"],
    activityKind: "series",
    seriesEnrollmentMode: "once_before_first",
    location: "昌平十三陵特区停车场集合",
    capacity: 40,
    enrollDeadline: addDays(now, 5),
    startAt: hikingWholeSeriesSessions[0].startAt,
    endAt: addHours(
      hikingWholeSeriesSessions[0].startAt,
      hikingWholeSeriesSessions[0].durationHours,
    ),
    status: "published",
    likeCount: 41,
    commentCount: 9,
    favoriteCount: 16,
  },
  {
    id: "act-t1",
    groupId: "ig4",
    organizerId: "u3",
    title: "五月读书分享（已终止）",
    description: "创建人因参与人数不足已终止后续场次。",
    coverUrl: ACTIVITY_COVERS["act-4"],
    activityKind: "series",
    seriesEnrollmentMode: "per_occurrence",
    location: "图书馆讨论室",
    capacity: 15,
    startAt: addDays(now, 14),
    endAt: addHours(addDays(now, 14), 2),
    status: "cancelled",
    likeCount: 5,
    commentCount: 1,
    favoriteCount: 2,
  },
];

export let occurrences: ActivityOccurrence[] = [
  {
    id: "occ-2-1",
    activityId: "act-2",
    startAt: addDays(now, 10),
    endAt: addHours(addDays(now, 10), 2),
    capacity: 20,
    enrollCount: 0,
    status: "scheduled",
  },
  {
    id: "occ-e-org-1-1",
    activityId: "act-e-org-1",
    startAt: endedOrgOneOff.start,
    endAt: endedOrgOneOff.end,
    capacity: 12,
    enrollCount: 0,
    status: "completed",
  },
  {
    id: "occ-e-pt-1-1",
    activityId: "act-e-pt-1",
    startAt: endedPtOneOff.start,
    endAt: endedPtOneOff.end,
    capacity: 30,
    enrollCount: 0,
    status: "completed",
  },
  {
    id: "occ-r1",
    activityId: "act-1",
    startAt: addDays(now, 2),
    endAt: addHours(addDays(now, 2), 1.5),
    capacity: 30,
    enrollCount: 12,
    status: "scheduled",
  },
  {
    id: "occ-r2",
    activityId: "act-1",
    startAt: addDays(now, 9),
    endAt: addHours(addDays(now, 9), 1.5),
    capacity: 30,
    enrollCount: 5,
    status: "scheduled",
  },
  {
    id: "occ-r3",
    activityId: "act-1",
    startAt: addDays(now, 16),
    endAt: addHours(addDays(now, 16), 1.5),
    capacity: 30,
    enrollCount: 0,
    status: "scheduled",
  },
  {
    id: "occ-r4",
    activityId: "act-1",
    startAt: addDays(now, 23),
    endAt: addHours(addDays(now, 23), 1.5),
    capacity: 30,
    enrollCount: 0,
    status: "scheduled",
  },
  {
    id: "occ-s1",
    activityId: "act-4",
    startAt: addDays(now, 7),
    endAt: addHours(addDays(now, 7), 2),
    capacity: 15,
    enrollCount: 8,
    status: "scheduled",
  },
  {
    id: "occ-s2",
    activityId: "act-4",
    startAt: addDays(now, 21),
    endAt: addHours(addDays(now, 21), 2),
    capacity: 15,
    enrollCount: 3,
    status: "scheduled",
  },
  {
    id: "occ-s3",
    activityId: "act-4",
    startAt: addDays(now, 35),
    endAt: addHours(addDays(now, 35), 2),
    capacity: 15,
    enrollCount: 0,
    status: "scheduled",
  },
  ...fitnessWeeklySlots.map((startAt, i) => ({
    id: `occ-f${i + 1}`,
    activityId: "act-5",
    startAt,
    endAt: addHours(startAt, 2),
    capacity: 5,
    enrollCount: i === 0 ? 3 : i === 1 ? 1 : 0,
    status: "scheduled" as const,
  })),
  {
    id: "occ-b1",
    activityId: "act-6",
    startAt: badmintonSeriesSlots.preliminary,
    endAt: badmintonSeriesEnds.preliminary,
    capacity: 50,
    enrollCount: 31,
    status: "scheduled",
  },
  {
    id: "occ-b2",
    activityId: "act-6",
    startAt: badmintonSeriesSlots.playoff,
    endAt: badmintonSeriesEnds.playoff,
    capacity: 50,
    enrollCount: 0,
    status: "scheduled",
  },
  {
    id: "occ-b3",
    activityId: "act-6",
    startAt: badmintonSeriesSlots.final,
    endAt: badmintonSeriesEnds.final,
    capacity: 50,
    enrollCount: 0,
    status: "scheduled",
  },
  ...endedOrgWeeklySessions.map((startAt, i) => ({
    id: `occ-e-org-2-${i + 1}`,
    activityId: "act-e-org-2",
    startAt,
    endAt: addHours(startAt, 3),
    capacity: 15,
    enrollCount: 8 + i,
    status: "completed" as const,
  })),
  ...endedOrgSeriesSessions.map((session, i) => ({
    id: `occ-e-org-3-${i + 1}`,
    activityId: "act-e-org-3",
    startAt: session.start,
    endAt: session.end,
    capacity: 20,
    enrollCount: 12 + i * 2,
    status: "completed" as const,
  })),
  ...endedPtWeeklySessions.map((startAt, i) => ({
    id: `occ-e-pt-2-${i + 1}`,
    activityId: "act-e-pt-2",
    startAt,
    endAt: addHours(startAt, 1.5),
    capacity: 20,
    enrollCount: 14 + i,
    status: "completed" as const,
  })),
  ...endedPtSeriesSessions.map((session, i) => ({
    id: `occ-e-pt-3-${i + 1}`,
    activityId: "act-e-pt-3",
    startAt: session.start,
    endAt: session.end,
    capacity: 32,
    enrollCount: 20 + i * 3,
    status: "completed" as const,
  })),
  ...hikingWholeSeriesSessions.map((session, i) => ({
    id: `occ-h${i + 1}`,
    activityId: "act-7",
    startAt: session.startAt,
    endAt: addHours(session.startAt, session.durationHours),
    capacity: 40,
    enrollCount: i === 0 ? 18 : 0,
    status: "scheduled" as const,
  })),
  {
    id: "occ-t1-1",
    activityId: "act-t1",
    startAt: addDays(now, 14),
    endAt: addHours(addDays(now, 14), 2),
    capacity: 15,
    enrollCount: 0,
    status: "cancelled",
  },
  {
    id: "occ-t1-2",
    activityId: "act-t1",
    startAt: addDays(now, 28),
    endAt: addHours(addDays(now, 28), 2),
    capacity: 15,
    enrollCount: 0,
    status: "cancelled",
  },
];

export let enrollments: ActivityEnrollment[] = [
  {
    id: "enr-1",
    activityId: "act-1",
    occurrenceId: "occ-r1",
    employeeId: "u1",
    enrolledAt: addDays(now, -1),
    status: "enrolled",
  },
  {
    id: "enr-2",
    activityId: "act-2",
    occurrenceId: "occ-2-1",
    employeeId: "u1",
    enrolledAt: addDays(now, -3),
    status: "enrolled",
  },
  {
    id: "enr-1-u2",
    activityId: "act-1",
    occurrenceId: "occ-r1",
    employeeId: "u2",
    enrolledAt: addDays(now, -2),
    status: "enrolled",
  },
  {
    id: "enr-4-u2",
    activityId: "act-4",
    occurrenceId: "occ-s2",
    employeeId: "u2",
    enrolledAt: addDays(now, -4),
    status: "enrolled",
  },
  {
    id: "enr-6-u2",
    activityId: "act-6",
    employeeId: "u2",
    enrolledAt: addDays(now, -5),
    status: "enrolled",
  },
  {
    id: "enr-6-u3",
    activityId: "act-6",
    employeeId: "u3",
    enrolledAt: addDays(now, -4),
    status: "enrolled",
  },
  {
    id: "enr-3",
    activityId: "act-5",
    occurrenceId: "occ-f1",
    employeeId: "u1",
    enrolledAt: addDays(now, -10),
    status: "enrolled",
  },
  {
    id: "enr-4",
    activityId: "act-4",
    occurrenceId: "occ-s1",
    employeeId: "u1",
    enrolledAt: addDays(now, -5),
    status: "enrolled",
  },
  {
    id: "enr-e-pt-1",
    activityId: "act-e-pt-1",
    occurrenceId: "occ-e-pt-1-1",
    employeeId: "u1",
    enrolledAt: atLocal(2026, 5, 1, 10, 0),
    status: "enrolled",
  },
  {
    id: "enr-e-org-1",
    activityId: "act-e-org-1",
    occurrenceId: "occ-e-org-1-1",
    employeeId: "u1",
    enrolledAt: atLocal(2026, 4, 15, 10, 0),
    status: "enrolled",
  },
  {
    id: "enr-e-pt-2",
    activityId: "act-e-pt-2",
    occurrenceId: "occ-e-pt-2-5",
    employeeId: "u1",
    enrolledAt: atLocal(2026, 5, 14, 9, 0),
    status: "enrolled",
  },
  {
    id: "enr-e-pt-3",
    activityId: "act-e-pt-3",
    occurrenceId: "occ-e-pt-3-2",
    employeeId: "u1",
    enrolledAt: atLocal(2026, 4, 10, 11, 0),
    status: "enrolled",
  },
  {
    id: "enr-org-6",
    activityId: "act-6",
    employeeId: "u1",
    enrolledAt: addDays(now, -2),
    status: "enrolled",
  },
  {
    id: "enr-org-2",
    activityId: "act-e-org-2",
    occurrenceId: "occ-e-org-2-5",
    employeeId: "u1",
    enrolledAt: atLocal(2026, 5, 10, 10, 0),
    status: "enrolled",
  },
  {
    id: "enr-org-3",
    activityId: "act-e-org-3",
    occurrenceId: "occ-e-org-3-3",
    employeeId: "u1",
    enrolledAt: atLocal(2026, 5, 1, 10, 0),
    status: "enrolled",
  },
  {
    id: "enr-h-1",
    activityId: "act-7",
    employeeId: "u2",
    enrolledAt: addDays(now, -4),
    status: "enrolled",
  },
  {
    id: "enr-h-2",
    activityId: "act-7",
    employeeId: "u3",
    enrolledAt: addDays(now, -3),
    status: "enrolled",
  },
  {
    id: "enr-h-3",
    activityId: "act-7",
    employeeId: "u5",
    enrolledAt: addDays(now, -2),
    status: "enrolled",
  },
  {
    id: "enr-t1-1",
    activityId: "act-t1",
    occurrenceId: "occ-t1-1",
    employeeId: "u1",
    enrolledAt: addDays(now, -12),
    status: "cancelled",
  },
  {
    id: "enr-t1-2",
    activityId: "act-t1",
    occurrenceId: "occ-t1-2",
    employeeId: "u1",
    enrolledAt: addDays(now, -10),
    status: "cancelled",
  },
];

/** 根据报名记录同步各场次 enrollCount（mock 初始化与数据一致性） */
const syncOccurrenceEnrollCounts = () => {
  const perOcc = new Map<string, number>();
  const wholeSeriesByActivity = new Map<string, number>();

  for (const e of enrollments) {
    if (e.status !== "enrolled") continue;
    const activity = activities.find((a) => a.id === e.activityId);
    if (!activity) continue;

    if (e.occurrenceId) {
      perOcc.set(e.occurrenceId, (perOcc.get(e.occurrenceId) ?? 0) + 1);
      continue;
    }

    if (
      activity.activityKind === "series" &&
      getSeriesEnrollmentMode(activity) === "once_before_first"
    ) {
      wholeSeriesByActivity.set(
        activity.id,
        (wholeSeriesByActivity.get(activity.id) ?? 0) + 1,
      );
    }
  }

  const allOccs = occurrences;
  occurrences = allOccs.map((o) => {
    let enrollCount = perOcc.get(o.id) ?? 0;
    const activity = activities.find((a) => a.id === o.activityId);
    if (!activity) return o;

    const wholeTotal = wholeSeriesByActivity.get(activity.id);
    if (
      wholeTotal != null &&
      getSeriesEnrollmentMode(activity) === "once_before_first"
    ) {
      const scheduled = sortOccurrencesByStart(
        allOccs.filter(
          (x) => x.activityId === activity.id && x.status === "scheduled",
        ),
      );
      const anchor =
        getFirstSeriesOccurrence(scheduled) ??
        getFirstSeriesOccurrence(
          allOccs.filter((x) => x.activityId === activity.id),
        );
      if (anchor?.id === o.id) {
        enrollCount = wholeTotal;
      }
    }

    return { ...o, enrollCount };
  });
};

syncOccurrenceEnrollCounts();

export type EnrolledActivityItem = {
  enrollment: ActivityEnrollment;
  activity: GroupActivity;
  group: InterestGroupFull;
  occurrence?: ActivityOccurrence;
};

/** 「我参与的场次」列表项：每条对应一个具体场次 */
export type EnrolledOccurrenceItem = {
  enrollment: ActivityEnrollment;
  activity: GroupActivity;
  group: InterestGroupFull;
  occurrence: ActivityOccurrence;
  /** 系列活动场次序号（0-based） */
  occurrenceIndex?: number;
  /** 活动被创建人终止，或该场次已取消 */
  terminated: boolean;
};

export type OrganizedActivityItem = {
  activity: GroupActivity;
  group: InterestGroupFull;
  occurrence?: ActivityOccurrence;
};

export const getGroupById = (id: string) => interestGroups.find((g) => g.id === id);

export const getActivitiesByGroup = (groupId: string) =>
  activities.filter((a) => a.groupId === groupId && a.status === "published");

export const getActivityById = (id: string) => activities.find((a) => a.id === id);

export const getOccurrencesByActivity = (activityId: string) =>
  occurrences.filter((o) => o.activityId === activityId);

export const getOccurrenceById = (id: string) => occurrences.find((o) => o.id === id);

export const isMember = (groupId: string, employeeId: string) =>
  groupMemberships.some(
    (m) => m.groupId === groupId && m.employeeId === employeeId,
  );

/** MVP：仅小组创建人（ownerId / membership.role=owner）可发布活动 */
export const isGroupOwner = (groupId: string, employeeId: string): boolean => {
  const group = interestGroups.find((g) => g.id === groupId);
  if (group?.ownerId === employeeId) return true;
  return groupMemberships.some(
    (m) =>
      m.groupId === groupId && m.employeeId === employeeId && m.role === "owner",
  );
};

export const getJoinedGroups = (employeeId: string) => {
  const ids = groupMemberships
    .filter((m) => m.employeeId === employeeId)
    .map((m) => m.groupId);
  return interestGroups.filter(
    (g) => ids.includes(g.id) && g.status === "active",
  );
};

/** 我创建（担任 owner）的小组 */
export const getMyCreatedGroups = (employeeId: string) =>
  getJoinedGroups(employeeId).filter((g) => isGroupOwner(g.id, employeeId));

/** 我加入但非创建人的小组 */
export const getMyJoinedGroups = (employeeId: string) =>
  getJoinedGroups(employeeId).filter((g) => !isGroupOwner(g.id, employeeId));

export const joinGroup = (groupId: string, employeeId: string): boolean => {
  if (isMember(groupId, employeeId)) return true;
  const group = interestGroups.find((g) => g.id === groupId);
  if (!group || isGroupFull(group)) return false;
  groupMemberships = [
    ...groupMemberships,
    { groupId, employeeId, role: "member" },
  ];
  interestGroups = interestGroups.map((g) =>
    g.id === groupId ? { ...g, memberCount: g.memberCount + 1 } : g,
  );
  return true;
};

export const createSpontaneousGroup = (
  input: Pick<
    InterestGroupFull,
    "name" | "description" | "visibility" | "tagIds" | "deptIds" | "coverUrl"
  >,
  ownerId: string,
): InterestGroupFull => {
  const id = `ig-${Date.now()}`;
  const due = new Date();
  due.setDate(due.getDate() + 7);
  const group: InterestGroupFull = {
    id,
    name: input.name,
    description: input.description,
    coverUrl: input.coverUrl ?? DEFAULT_GROUP_COVER,
    type: "spontaneous",
    visibility: input.visibility,
    deptIds: input.deptIds,
    tagIds: input.tagIds,
    status: "active",
    reportStatus: "pending_report",
    reportDueAt: due.toISOString().slice(0, 10),
    memberCount: 1,
    ownerId,
    likeCount: 0,
    commentCount: 0,
    favoriteCount: 0,
  };
  interestGroups = [...interestGroups, group];
  groupMemberships = [
    ...groupMemberships,
    { groupId: id, employeeId: ownerId, role: "owner" },
  ];
  return group;
};

export const markGroupReported = (groupId: string) => {
  interestGroups = interestGroups.map((g) =>
    g.id === groupId ? { ...g, reportStatus: "reported" as const } : g,
  );
};

export const countPublishedActivitiesInGroup = (groupId: string) =>
  activities.filter(
    (a) => a.groupId === groupId && a.status === "published",
  ).length;

/**
 * 终止已发布活动（单次 / 周期 / 系列）：下架、取消未举办场次、作废报名。
 * 解散小组时联动调用；与创建人「终止活动」效果一致。
 */
export const terminatePublishedActivity = (activityId: string): boolean => {
  const activity = getActivityById(activityId);
  if (!activity || activity.status !== "published") return false;

  const active = enrollments.filter(
    (e) => e.activityId === activityId && e.status === "enrolled",
  );
  const cancelledIds = new Set(active.map((e) => e.id));
  enrollments = enrollments.map((e) =>
    cancelledIds.has(e.id) ? { ...e, status: "cancelled" as const } : e,
  );

  occurrences = occurrences.map((o) => {
    if (o.activityId !== activityId) return o;
    if (o.status === "scheduled") {
      return { ...o, status: "cancelled" as const, enrollCount: 0 };
    }
    return o;
  });

  activities = activities.map((a) =>
    a.id === activityId ? { ...a, status: "cancelled" as const } : a,
  );
  return true;
};

export const updateGroup = (
  groupId: string,
  ownerId: string,
  patch: Pick<
    InterestGroupFull,
    "name" | "description" | "tagIds" | "coverUrl"
  >,
): InterestGroupFull | undefined => {
  const group = getGroupById(groupId);
  if (!group || !isGroupOwner(groupId, ownerId)) return undefined;
  if (group.status !== "active") return undefined;

  const updated: InterestGroupFull = { ...group, ...patch };
  interestGroups = interestGroups.map((g) =>
    g.id === groupId ? updated : g,
  );
  return updated;
};

export type DisbandGroupResult = {
  group: InterestGroupFull;
  /** 因解散而终止的活动数量 */
  terminatedActivityCount: number;
};

/** 创建人解散小组：下架小组并联动终止组内所有进行中的活动 */
export const disbandGroup = (
  groupId: string,
  ownerId: string,
): DisbandGroupResult | undefined => {
  const group = getGroupById(groupId);
  if (!group || !isGroupOwner(groupId, ownerId)) return undefined;
  if (group.status !== "active") return undefined;

  const toTerminate = activities.filter(
    (a) => a.groupId === groupId && a.status === "published",
  );
  let terminatedActivityCount = 0;
  for (const activity of toTerminate) {
    if (terminatePublishedActivity(activity.id)) {
      terminatedActivityCount += 1;
    }
  }

  const updated: InterestGroupFull = { ...group, status: "archived" };
  interestGroups = interestGroups.map((g) =>
    g.id === groupId ? updated : g,
  );
  return { group: updated, terminatedActivityCount };
};

export const countActivityEnrollments = (activityId: string) =>
  enrollments.filter(
    (e) => e.activityId === activityId && e.status === "enrolled",
  ).length;

export const ensureOccurrenceRecord = (occ: ActivityOccurrence) => {
  const existing = getOccurrenceById(occ.id);
  if (existing) return existing;
  occurrences = [...occurrences, occ];
  return occ;
};

export const getEnrollmentsForActivity = (
  activityId: string,
  employeeId: string,
) =>
  enrollments.filter(
    (e) =>
      e.activityId === activityId &&
      e.employeeId === employeeId &&
      e.status === "enrolled",
  );

export const isEnrolledInOccurrence = (
  activityId: string,
  employeeId: string,
  occurrenceId: string,
) =>
  enrollments.some(
    (e) =>
      e.activityId === activityId &&
      e.employeeId === employeeId &&
      e.occurrenceId === occurrenceId &&
      e.status === "enrolled",
  );

/** 报名不要求先加入小组（见设计文档 §7.10） */
export const enrollActivity = (
  activityId: string,
  employeeId: string,
  occurrenceId?: string,
  occurrenceSnapshot?: ActivityOccurrence,
) => {
  const activity = getActivityById(activityId);
  if (!activity || activity.status !== "published") return undefined;

  const occs = getOccurrencesByActivity(activityId);

  if (activity.activityKind === "series") {
    const mode = getSeriesEnrollmentMode(activity);
    if (mode === "once_before_first") {
      if (!isSeriesWholeEnrollmentOpen(activity, occs)) return undefined;
      const enrolledCount = countActivityEnrollments(activityId);
      if (
        activity.capacity != null &&
        enrolledCount >= activity.capacity
      ) {
        return undefined;
      }
      occurrenceId = undefined;
    } else if (occurrenceId) {
      if (isEnrolledInOccurrence(activityId, employeeId, occurrenceId)) {
        return enrollments.find(
          (e) =>
            e.activityId === activityId &&
            e.employeeId === employeeId &&
            e.occurrenceId === occurrenceId &&
            e.status === "enrolled",
        );
      }
      const enrollable = getEnrollableSeriesOccurrences(activity, occs);
      if (!enrollable.some((o) => o.id === occurrenceId)) return undefined;
      const occ = getOccurrenceById(occurrenceId);
      if (
        occ &&
        occ.capacity != null &&
        occ.enrollCount >= occ.capacity
      ) {
        return undefined;
      }
    } else {
      return undefined;
    }
  } else if (occurrenceId) {
    const occForWindow =
      getOccurrenceById(occurrenceId) ?? occurrenceSnapshot;
    if (
      occForWindow &&
      (activity.activityKind === "recurring" ||
        (activity.activityKind === "series" &&
          getSeriesEnrollmentMode(activity) === "per_occurrence")) &&
      !isOccurrenceInEnrollmentPickerWindow(
        activity,
        occs,
        occForWindow,
      )
    ) {
      return undefined;
    }
    if (isEnrolledInOccurrence(activityId, employeeId, occurrenceId)) {
      return enrollments.find(
        (e) =>
          e.activityId === activityId &&
          e.employeeId === employeeId &&
          e.occurrenceId === occurrenceId &&
          e.status === "enrolled",
      );
    }
    if (occurrenceSnapshot) {
      ensureOccurrenceRecord(occurrenceSnapshot);
    }
    const occ = getOccurrenceById(occurrenceId);
    if (
      occ &&
      occ.capacity != null &&
      occ.enrollCount >= occ.capacity
    ) {
      return undefined;
    }
  } else {
    if (activity.activityKind === "one_off") {
      const blocked = oneOffEnrollmentBlockedReason(activity);
      if (blocked) return undefined;
      const enrolledCount = countActivityEnrollments(activityId);
      if (
        activity.capacity != null &&
        enrolledCount >= activity.capacity
      ) {
        return undefined;
      }
    }
    const existing = enrollments.find(
      (e) =>
        e.activityId === activityId &&
        e.employeeId === employeeId &&
        e.status === "enrolled" &&
        !e.occurrenceId,
    );
    if (existing) return existing;
  }

  const enrollment: ActivityEnrollment = {
    id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    activityId,
    occurrenceId,
    employeeId,
    enrolledAt: new Date().toISOString(),
    status: "enrolled",
  };
  enrollments = [...enrollments, enrollment];

  if (occurrenceId) {
    occurrences = occurrences.map((o) =>
      o.id === occurrenceId ? { ...o, enrollCount: o.enrollCount + 1 } : o,
    );
  } else if (
    activity.activityKind === "series" &&
    getSeriesEnrollmentMode(activity) === "once_before_first"
  ) {
    const first = getFirstSeriesOccurrence(
      occs.filter((o) => o.status === "scheduled"),
    );
    if (first) {
      occurrences = occurrences.map((o) =>
        o.id === first.id ? { ...o, enrollCount: o.enrollCount + 1 } : o,
      );
    }
  }
  return enrollment;
};

export const enrollOccurrences = (
  activityId: string,
  employeeId: string,
  items: { occurrenceId: string; snapshot?: ActivityOccurrence }[],
) => {
  const created: ActivityEnrollment[] = [];
  for (const { occurrenceId, snapshot } of items) {
    const row = enrollActivity(
      activityId,
      employeeId,
      occurrenceId,
      snapshot,
    );
    if (row) created.push(row);
  }
  return created;
};

export const isEnrolled = (activityId: string, employeeId: string) =>
  enrollments.some(
    (e) =>
      e.activityId === activityId &&
      e.employeeId === employeeId &&
      e.status === "enrolled",
  );

export const getEnrollment = (activityId: string, employeeId: string) =>
  getEnrollmentsForActivity(activityId, employeeId)[0];

export const cancelEnrollment = (
  activityId: string,
  employeeId: string,
  occurrenceId?: string,
): boolean => {
  const targets = getEnrollmentsForActivity(activityId, employeeId).filter(
    (e) => !occurrenceId || e.occurrenceId === occurrenceId,
  );
  if (targets.length === 0) return false;

  const ids = new Set(targets.map((e) => e.id));
  enrollments = enrollments.map((e) =>
    ids.has(e.id) ? { ...e, status: "cancelled" as const } : e,
  );

  for (const enrollment of targets) {
    if (enrollment.occurrenceId) {
      occurrences = occurrences.map((o) =>
        o.id === enrollment.occurrenceId
          ? { ...o, enrollCount: Math.max(0, o.enrollCount - 1) }
          : o,
      );
    }
  }
  return true;
};

export const cancelAllEnrollments = (
  activityId: string,
  employeeId: string,
) => cancelEnrollment(activityId, employeeId);

/** 普通成员退出小组（组长请使用解散） */
export const leaveGroup = (groupId: string, employeeId: string): boolean => {
  if (!isMember(groupId, employeeId) || isGroupOwner(groupId, employeeId)) {
    return false;
  }
  const group = getGroupById(groupId);
  if (!group || group.status !== "active") return false;

  groupMemberships = groupMemberships.filter(
    (m) => !(m.groupId === groupId && m.employeeId === employeeId),
  );
  interestGroups = interestGroups.map((g) =>
    g.id === groupId
      ? { ...g, memberCount: Math.max(0, g.memberCount - 1) }
      : g,
  );

  for (const activity of activities.filter((a) => a.groupId === groupId)) {
    cancelAllEnrollments(activity.id, employeeId);
  }
  return true;
};

/** 周期 / 系列活动是否仍可被创建人终止 */
export const canTerminateActivity = (activityId: string): boolean => {
  const activity = getActivityById(activityId);
  if (!activity || activity.status !== "published") return false;
  return (
    activity.activityKind === "recurring" ||
    activity.activityKind === "series"
  );
};

/**
 * 创建人终止周期 / 系列活动：活动下架、未举办场次取消、全员报名作废。
 */
export const terminateActivity = (
  activityId: string,
  organizerId: string,
): GroupActivity | undefined => {
  const activity = getActivityById(activityId);
  if (!activity || activity.organizerId !== organizerId) return undefined;
  if (
    activity.activityKind !== "recurring" &&
    activity.activityKind !== "series"
  ) {
    return undefined;
  }
  if (activity.status !== "published") return undefined;
  if (!canTerminateActivity(activityId)) return undefined;

  if (!terminatePublishedActivity(activityId)) return undefined;
  return getActivityById(activityId);
};

export const isActivityOrganizer = (
  activityId: string,
  employeeId: string,
): boolean => {
  const activity = getActivityById(activityId);
  return activity?.organizerId === employeeId;
};

export const getMyEnrolledActivities = (
  employeeId: string,
  options?: { excludeOrganized?: boolean },
): EnrolledActivityItem[] => {
  return enrollments
    .filter((e) => e.employeeId === employeeId && e.status === "enrolled")
    .map((enrollment) => {
      const activity = getActivityById(enrollment.activityId);
      if (!activity) return null;
      if (
        options?.excludeOrganized &&
        activity.organizerId === employeeId
      ) {
        return null;
      }
      const group = getGroupById(activity.groupId);
      if (!group) return null;
      const occurrence = enrollment.occurrenceId
        ? getOccurrenceById(enrollment.occurrenceId)
        : undefined;
      return { enrollment, activity, group, occurrence };
    })
    .filter((item): item is EnrolledActivityItem => item !== null)
    .sort(
      (a, b) =>
        new Date(b.enrollment.enrolledAt).getTime() -
        new Date(a.enrollment.enrolledAt).getTime(),
    );
};

const isOrganizerTerminatedParticipation = (
  enrollment: ActivityEnrollment,
  activity: GroupActivity,
) =>
  activity.status === "cancelled" &&
  (enrollment.status === "cancelled" || enrollment.status === "enrolled");

/**
 * 按场次维度展开报名记录（「我参与的场次」）。
 * - 按场次报名：一条 enrollment → 一条
 * - 系列整场报名：一条 enrollment → 各场次各一条
 * - 单次活动无 occurrenceId：用活动时间合成一条
 * - 活动被终止：展示已取消场次（仅创建人终止，不含用户自行取消报名）
 */
export const getMyEnrolledOccurrences = (
  employeeId: string,
  options?: { excludeOrganized?: boolean },
): EnrolledOccurrenceItem[] => {
  const rows: EnrolledOccurrenceItem[] = [];

  for (const enrollment of enrollments.filter(
    (e) => e.employeeId === employeeId,
  )) {
    const activity = getActivityById(enrollment.activityId);
    if (!activity) continue;
    if (
      options?.excludeOrganized &&
      activity.organizerId === employeeId
    ) {
      continue;
    }

    const organizerTerminated = isOrganizerTerminatedParticipation(
      enrollment,
      activity,
    );
    if (enrollment.status !== "enrolled" && !organizerTerminated) continue;

    const group = getGroupById(activity.groupId);
    if (!group) continue;

    const allOccs = getOccurrencesByActivity(activity.id).sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );
    const activeOccs = allOccs.filter((o) => o.status !== "cancelled");
    const occs = organizerTerminated ? allOccs : activeOccs;

    const push = (
      occurrence: ActivityOccurrence,
      occurrenceIndex?: number,
    ) => {
      const terminated =
        activity.status === "cancelled" || occurrence.status === "cancelled";
      rows.push({
        enrollment,
        activity,
        group,
        occurrence,
        occurrenceIndex,
        terminated,
      });
    };

    if (enrollment.occurrenceId) {
      const occurrence = getOccurrenceById(enrollment.occurrenceId);
      if (occurrence) {
        const idx = allOccs.findIndex((o) => o.id === occurrence.id);
        push(occurrence, idx >= 0 ? idx : undefined);
      }
      continue;
    }

    if (
      activity.activityKind === "series" &&
      getSeriesEnrollmentMode(activity) === "once_before_first"
    ) {
      const list = organizerTerminated
        ? allOccs
        : activeOccs;
      list.forEach((occ, i) => {
        const idx = allOccs.findIndex((o) => o.id === occ.id);
        push(occ, idx >= 0 ? idx : i);
      });
      continue;
    }

    if (
      activity.activityKind === "one_off" &&
      activity.startAt &&
      activity.endAt
    ) {
      const phase = getActivityPhase(activity.startAt, activity.endAt);
      push({
        id: `virtual-${enrollment.id}`,
        activityId: activity.id,
        startAt: activity.startAt,
        endAt: activity.endAt,
        enrollCount: 0,
        status: organizerTerminated
          ? "cancelled"
          : phase === "已结束"
            ? "completed"
            : "scheduled",
      });
    }
  }

  return rows.sort(
    (a, b) =>
      new Date(b.occurrence.startAt).getTime() -
      new Date(a.occurrence.startAt).getTime(),
  );
};

export const getMyOrganizedActivities = (
  employeeId: string,
): OrganizedActivityItem[] => {
  return activities
    .filter(
      (a) =>
        a.organizerId === employeeId &&
        (a.status === "published" || a.status === "cancelled"),
    )
    .map((activity) => {
      const group = getGroupById(activity.groupId);
      if (!group) return null;
      const occs = getOccurrencesByActivity(activity.id);
      const occurrence = pickDisplayOccurrence(occs);
      return { activity, group, occurrence };
    })
    .filter((item): item is OrganizedActivityItem => item !== null)
    .sort((a, b) => {
      const startA =
        a.occurrence?.startAt ?? a.activity.startAt ?? "";
      const startB =
        b.occurrence?.startAt ?? b.activity.startAt ?? "";
      return new Date(startB).getTime() - new Date(startA).getTime();
    });
};

export const addActivity = (activity: GroupActivity) => {
  activities = [...activities, activity];
};

/** 发布活动后，创建人默认计入报名（不占额逻辑与正式环境一致由服务端处理） */
export const enrollOrganizerAsParticipant = (activity: GroupActivity) => {
  if (isEnrolled(activity.id, activity.organizerId)) return;

  const occs = getOccurrencesByActivity(activity.id).filter(
    (o) => o.status === "scheduled",
  );

  if (activity.activityKind === "one_off") {
    enrollActivity(activity.id, activity.organizerId);
    return;
  }

  if (
    activity.activityKind === "series" &&
    getSeriesEnrollmentMode(activity) === "once_before_first"
  ) {
    enrollActivity(activity.id, activity.organizerId);
    return;
  }

  const first = sortOccurrencesByStart(occs)[0];
  if (first) {
    enrollActivity(activity.id, activity.organizerId, first.id);
  }
};

export const updateActivity = (
  activityId: string,
  patch: Partial<
    Pick<
      GroupActivity,
      | "title"
      | "description"
      | "coverUrl"
      | "location"
      | "capacity"
      | "startAt"
      | "endAt"
      | "enrollDeadline"
      | "rrule"
      | "seriesEnrollmentMode"
    >
  >,
): GroupActivity | undefined => {
  const existing = getActivityById(activityId);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch };
  activities = activities.map((a) => (a.id === activityId ? updated : a));
  return updated;
};

export const replaceOccurrencesForActivity = (
  activityId: string,
  items: ActivityOccurrence[],
) => {
  occurrences = [
    ...occurrences.filter((o) => o.activityId !== activityId),
    ...items,
  ];
};

export const updateSeriesOccurrences = (
  activityId: string,
  sessions: { startAt: string; endAt: string }[],
  capacity?: number,
) => {
  const existing = getOccurrencesByActivity(activityId).sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
  const built = buildSeriesOccurrences(activityId, sessions, capacity).map(
    (o, i) => ({
      ...o,
      id: existing[i]?.id ?? o.id,
      enrollCount: existing[i]?.enrollCount ?? 0,
      status: existing[i]?.status ?? o.status,
    }),
  );
  replaceOccurrencesForActivity(activityId, built);
};

export const updateRecurringOccurrences = (
  activity: GroupActivity,
  count = 4,
) => {
  const existing = getOccurrencesByActivity(activity.id).sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
  const built = expandRecurringOccurrences(activity, count).map((o, i) => ({
    ...o,
    id: existing[i]?.id ?? o.id,
    enrollCount: existing[i]?.enrollCount ?? 0,
    status: existing[i]?.status ?? o.status,
  }));
  replaceOccurrencesForActivity(activity.id, built);
};

export const addOccurrences = (items: ActivityOccurrence[]) => {
  occurrences = [...occurrences, ...items];
};

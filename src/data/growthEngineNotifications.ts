export type GrowthEngineNotificationType =
  | "member_joined_group"
  | "group_disbanded"
  | "activity_terminated"
  | "activity_starting_soon"
  | "activity_ended_feedback"
  | "activity_enrolled"
  | "activity_published";

export type GrowthEngineNotification = {
  id: string;
  employeeId: string;
  type: GrowthEngineNotificationType;
  preview: string;
  createdAt: string;
  read: boolean;
  link?: string;
};

const STORAGE_KEY = "exp-growth-engine-notifications";
const SENT_MARKS_KEY = "exp-growth-engine-sent-marks";
const MOCK_EMPLOYEE_ID = "u1";

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

/** 沟通引擎默认 mock：兴趣小组等通知场景（当前用户 u1） */
const createMockGrowthEngineNotifications = (): GrowthEngineNotification[] => [
  {
    id: "gen-mock-published",
    employeeId: MOCK_EMPLOYEE_ID,
    type: "activity_published",
    preview: "「健身房」发布了新活动「周三夜跑 5K」，快来看看",
    createdAt: minutesAgo(12),
    read: false,
    link: "/agents/interest-groups/activities/act-1",
  },
  {
    id: "gen-mock-enrolled",
    employeeId: MOCK_EMPLOYEE_ID,
    type: "activity_enrolled",
    preview: "李伟报名了「羽毛球友谊赛」，当前共 8 人报名",
    createdAt: minutesAgo(28),
    read: false,
    link: "/agents/interest-groups/activities/act-6",
  },
  {
    id: "gen-mock-starting-soon",
    employeeId: MOCK_EMPLOYEE_ID,
    type: "activity_starting_soon",
    preview: "「羽毛球友谊赛」将在 1 小时后开始，记得准时参加",
    createdAt: minutesAgo(45),
    read: false,
    link: "/agents/interest-groups/activities/act-6",
  },
  {
    id: "gen-mock-member-joined",
    employeeId: MOCK_EMPLOYEE_ID,
    type: "member_joined_group",
    preview: "王芳加入了「摄影社」，可前往小组详情查看",
    createdAt: hoursAgo(2),
    read: false,
    link: "/agents/interest-groups/ig5",
  },
  {
    id: "gen-mock-terminated",
    employeeId: MOCK_EMPLOYEE_ID,
    type: "activity_terminated",
    preview: "「三月主题展映系列」活动已终止，报名已作废",
    createdAt: hoursAgo(6),
    read: true,
    link: "/agents/interest-groups/activities/act-e-org-3",
  },
  {
    id: "gen-mock-ended-feedback",
    employeeId: MOCK_EMPLOYEE_ID,
    type: "activity_ended_feedback",
    preview: "「奥森春日人像外拍」已结束，欢迎留言分享你的感受与收获",
    createdAt: daysAgo(1),
    read: true,
    link: "/agents/interest-groups/activities/act-e-org-1",
  },
  {
    id: "gen-mock-group-disbanded",
    employeeId: MOCK_EMPLOYEE_ID,
    type: "group_disbanded",
    preview: "「咖啡品鉴」已解散，感谢你的参与",
    createdAt: daysAgo(3),
    read: true,
  },
];

function loadNotifications(): GrowthEngineNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createMockGrowthEngineNotifications();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as GrowthEngineNotification[];
  } catch {
    return createMockGrowthEngineNotifications();
  }
}

let notifications: GrowthEngineNotification[] = loadNotifications();

function persistNotifications() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function loadSentMarks(): Set<string> {
  try {
    const raw = localStorage.getItem(SENT_MARKS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistSentMarks(marks: Set<string>) {
  localStorage.setItem(SENT_MARKS_KEY, JSON.stringify([...marks]));
}

export const pushGrowthEngineNotification = (
  input: Omit<GrowthEngineNotification, "id" | "createdAt" | "read">,
) => {
  const row: GrowthEngineNotification = {
    ...input,
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications = [row, ...notifications];
  persistNotifications();
  return row;
};

export const pushGrowthEngineNotifications = (
  items: Omit<GrowthEngineNotification, "id" | "createdAt" | "read">[],
) => items.map((item) => pushGrowthEngineNotification(item));

export const getGrowthEngineNotifications = (employeeId: string) =>
  notifications
    .filter((n) => n.employeeId === employeeId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

/** 消息列表「沟通引擎」会话的预览：优先最新未读，否则最新一条 */
export const getGrowthEngineListPreview = (employeeId: string) => {
  const list = getGrowthEngineNotifications(employeeId);
  if (list.length === 0) return undefined;
  return list.find((n) => !n.read) ?? list[0];
};

export const getGrowthEngineUnreadCount = (employeeId: string) =>
  getGrowthEngineNotifications(employeeId).filter((n) => !n.read).length;

export const markGrowthEngineNotificationsRead = (employeeId: string) => {
  notifications = notifications.map((n) =>
    n.employeeId === employeeId ? { ...n, read: true } : n,
  );
  persistNotifications();
};

export const hasGrowthEngineSentMark = (mark: string) =>
  loadSentMarks().has(mark);

export const markGrowthEngineSent = (mark: string) => {
  const marks = loadSentMarks();
  marks.add(mark);
  persistSentMarks(marks);
};

export const formatGrowthEngineTime = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, now)) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return "昨天";

  const weekDay = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - (weekDay - 1));
  monday.setHours(0, 0, 0, 0);
  if (date >= monday) {
    return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
      date.getDay()
    ];
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
};

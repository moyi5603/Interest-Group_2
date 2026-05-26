import {
  Cake,
  PartyPopper,
  CloudSun,
  Activity,
  Timer,
  Moon,
  CalendarRange,
  CalendarCheck2,
  Thermometer,
  Snowflake,
  ThermometerSnowflake,
  CloudRain,
  CloudSnow,
  Wind,
  CloudFog,
  Cloudy,
  type LucideIcon,
} from "lucide-react";

export type CareType = "birthday" | "festival" | "weather" | "workload";

export type CareModule = {
  key: CareType;
  name: string;
  short: string;
  desc: string;
  icon: LucideIcon;
  colorVar: string; // CSS HSL var name without var()
  triggers: string[]; // 预制触发条件 / 节日 / 模板等
  templates: string[]; // 预制内容模板
};

export const careModules: Record<CareType, CareModule> = {
  birthday: {
    key: "birthday",
    name: "生日关怀",
    short: "生日",
    desc: "为员工生日发送祝福、积分与蛋糕电影福利",
    icon: Cake,
    colorVar: "--cat-7",
    triggers: ["生日当天 09:00", "生日前 1 天 18:00"],
    templates: ["✨ AI 动态生成"],
  },
  festival: {
    key: "festival",
    name: "节日关怀",
    short: "节日",
    desc: "重要节日为员工送祝福、积分与节日礼包",
    icon: PartyPopper,
    colorVar: "--cat-4",
    triggers: ["春节", "端午节", "中秋节", "国庆节", "元旦", "妇女节", "劳动节"],
    templates: ["✨ AI 动态生成"],
  },
  weather: {
    key: "weather",
    name: "天气关怀",
    short: "天气",
    desc: "极端天气自动推送提醒,守护员工健康通勤",
    icon: CloudSun,
    colorVar: "--cat-9",
    triggers: ["高温 ≥ 35℃", "暴雨 / 雷暴", "暴雪 / 寒潮 ≤ -5℃", "空气质量 AQI ≥ 200"],
    templates: ["✨ AI 动态生成"],
  },
  workload: {
    key: "workload",
    name: "工作强度关怀",
    short: "强度",
    desc: "实时识别加班/高强度并送上慰问与打车福利",
    icon: Activity,
    colorVar: "--cat-2",
    triggers: [
      "连续加班 ≥ 3 天",
      "单日工时 ≥ 12h",
      "周工时 ≥ 60h",
      "凌晨 0 点后仍在线",
    ],
    templates: ["✨ AI 动态生成"],
  },
};

export const careModuleList: CareModule[] = [
  careModules.birthday,
  careModules.festival,
  careModules.weather,
  careModules.workload,
];

/** 数据统计时间范围 */
export type StatsTimeRangePreset = "7d" | "30d" | "month" | "year" | "custom";

export type StatsTimeRange = {
  preset: StatsTimeRangePreset;
  start?: string; // YYYY-MM-DD
  end?: string;
};

export const defaultStatsTimeRange = (): StatsTimeRange => ({ preset: "7d" });

export const formatLocalIsoDate = (d = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const summarizeStatsTimeRange = (
  range: StatsTimeRange,
): { text: string; sub: string } => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  switch (range.preset) {
    case "7d":
      return { text: "近 7 日", sub: "最近 7 天数据" };
    case "30d":
      return { text: "近 30 日", sub: "最近 30 天数据" };
    case "month":
      return { text: `${year} 年 ${month} 月`, sub: "当月 1 日至今" };
    case "year":
      return { text: `${year} 本年度`, sub: `${year}/01/01 — 今天` };
    case "custom":
      if (range.start && range.end) {
        return {
          text: `${range.start} 至 ${range.end}`,
          sub: "自定义统计区间",
        };
      }
      return { text: "请设置起止日期", sub: "自定义统计区间" };
    default:
      return { text: "近 7 日", sub: "最近 7 天数据" };
  }
};

/** 演示用：相对全年全量数据的折算系数 */
export const statsTimeRangeScale = (range: StatsTimeRange): number => {
  switch (range.preset) {
    case "7d":
      return 7 / 365;
    case "30d":
      return 30 / 365;
    case "month": {
      const day = new Date().getDate();
      return Math.min(day / 365, 1);
    }
    case "year":
      return 1;
    case "custom": {
      if (!range.start || !range.end) return 7 / 365;
      const start = new Date(`${range.start}T00:00:00`);
      const end = new Date(`${range.end}T00:00:00`);
      const days =
        Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
      return Math.min(days / 365, 1);
    }
    default:
      return 7 / 365;
  }
};

/** 表单完整状态, 用于新建/编辑后回显 */
export type CareRuleFormData = {
  audience: {
    all: boolean;
    deptIds: string[];
    empIds: string[];
    tags: string[];
  };
  trigger?: string;
  festival?: string;
  customContent?: string;
  workloadTrigger?: WorkloadTriggerState;
  weatherTrigger?: WeatherTriggerState;
  /** 天气关怀：按极端天气类型配置触达文案 */
  weatherContents?: WeatherContentMap;
};

export type CareRule = {
  id: string;
  type: CareType;
  name: string;
  audience: string; // 关怀对象
  triggerTime: string;
  template: string;
  points: number;
  enabled: boolean;
  reached: number; // 已触达人次
  /** 可选: 保存表单草稿, 编辑时完整还原 */
  formData?: CareRuleFormData;
};

export const sampleRules: CareRule[] = [
  {
    id: "r1",
    type: "birthday",
    name: "全员生日祝福",
    audience: "全公司员工",
    triggerTime: "生日当天 09:00",
    template: "🎂 生日快乐!愿新的一岁充满惊喜与成长,公司为你准备了专属礼遇",
    points: 50,
    enabled: true,
    reached: 312,
  },
  {
    id: "r2",
    type: "festival",
    name: "中秋节关怀",
    audience: "全公司员工",
    triggerTime: "节日前 1 天 18:00",
    template: "🧧 节日快乐,阖家团圆,愿你温暖如常",
    points: 100,
    enabled: true,
    reached: 1286,
  },
  {
    id: "r3",
    type: "weather",
    name: "高温预警关怀",
    audience: "全公司员工",
    triggerTime: "高温 ≥ 37℃",
    template: "已配置 1/1 类场景文案",
    points: 0,
    enabled: true,
    reached: 24,
    formData: {
      audience: { all: false, deptIds: [], empIds: [], tags: [] },
      weatherTrigger: {
        enabled: {
          extremeHeat: true,
          extremeCold: false,
          coldWave: false,
          rainstorm: false,
          snowstorm: false,
          typhoon: false,
          sandstorm: false,
          haze: false,
        },
        thresholds: { extremeHeat: 37 },
        minTemps: {},
        levels: {},
      },
      weatherContents: {
        extremeHeat: {
          selected: "🥵 高温来袭!请注意防暑降温,多补水,减少户外暴晒",
        },
      },
    },
  },
  {
    id: "r4",
    type: "workload",
    name: "深夜加班慰问",
    audience: "全公司员工",
    triggerTime: "实时触发 (0:00 后在线)",
    template: "🌙 辛苦了!夜深了请注意休息,公司为你准备了加班礼包",
    points: 30,
    enabled: true,
    reached: 47,
  },
];

/* ============== 工作强度触发条件配置 ============== */

export type WorkloadTriggerKey =
  | "dailyHours"
  | "clockOut"
  | "weeklyHours"
  | "overtimeDays";

export type WorkloadTriggerCategory = {
  key: WorkloadTriggerKey;
  name: string;
  short: string;
  desc: string;
  icon: LucideIcon;
  unit: string; // 显示单位,例如「小时」「天」
  inputType: "number" | "time";
  presets: (number | string)[];
  defaultValue: number | string;
  defaultEnabled: boolean;
  min?: number;
  max?: number;
  formatValue: (v: number | string) => string; // 例如 "≥ 12 小时"
  shortLabel: (v: number | string) => string; // 摘要里短标签 "单日 ≥ 12h"
};

export const workloadTriggerCategories: WorkloadTriggerCategory[] = [
  {
    key: "dailyHours",
    name: "单日工时",
    short: "单日",
    desc: "员工单日累计工作时长达到阈值即触达",
    icon: Timer,
    unit: "小时",
    inputType: "number",
    presets: [10, 12, 14, 16],
    defaultValue: 12,
    defaultEnabled: true,
    min: 6,
    max: 24,
    formatValue: (v) => `≥ ${v} 小时`,
    shortLabel: (v) => `单日 ≥ ${v}h`,
  },
  {
    key: "clockOut",
    name: "下班打卡时间",
    short: "下班",
    desc: "晚于该时刻下班自动触达(支持次日)",
    icon: Moon,
    unit: "时刻",
    inputType: "time",
    presets: ["21:00", "22:00", "23:00", "次日 00:00", "次日 02:00"],
    defaultValue: "23:00",
    defaultEnabled: false,
    formatValue: (v) => `≥ ${v}`,
    shortLabel: (v) => `下班 ≥ ${v}`,
  },
  {
    key: "weeklyHours",
    name: "周工时",
    short: "周",
    desc: "本周累计工作时长达到阈值即触达",
    icon: CalendarRange,
    unit: "小时",
    inputType: "number",
    presets: [50, 60, 70, 80],
    defaultValue: 60,
    defaultEnabled: false,
    min: 30,
    max: 100,
    formatValue: (v) => `≥ ${v} 小时 / 周`,
    shortLabel: (v) => `周 ≥ ${v}h`,
  },
  {
    key: "overtimeDays",
    name: "连续加班天数",
    short: "连班",
    desc: "连续加班达到天数阈值即触达",
    icon: CalendarCheck2,
    unit: "天",
    inputType: "number",
    presets: [3, 5, 7],
    defaultValue: 3,
    defaultEnabled: false,
    min: 1,
    max: 14,
    formatValue: (v) => `连续 ≥ ${v} 天`,
    shortLabel: (v) => `连班 ≥ ${v}天`,
  },
];

export type WorkloadTriggerState = {
  key: WorkloadTriggerKey;
  value: number | string;
  /** 按周 / 连班：是否同步通知上级，默认不勾选 */
  notifySupervisor?: boolean;
};

export const workloadTriggerSupportsNotifySupervisor = (
  key: WorkloadTriggerKey,
) => key === "weeklyHours" || key === "overtimeDays";

const defaultCat =
  workloadTriggerCategories.find((c) => c.defaultEnabled) ??
  workloadTriggerCategories[0];

export const defaultWorkloadTrigger: WorkloadTriggerState = {
  key: defaultCat.key,
  value: defaultCat.defaultValue,
};

export const summarizeWorkload = (
  state: WorkloadTriggerState,
): { text: string; sub: string } => {
  const cat = workloadTriggerCategories.find((c) => c.key === state.key);
  if (!cat) {
    return { text: "未设置触发条件", sub: "请选择一种触发条件" };
  }
  const notify =
    state.notifySupervisor && workloadTriggerSupportsNotifySupervisor(state.key);
  return {
    text: `${cat.name} ${cat.formatValue(state.value)}`,
    sub: notify
      ? "触发条件 · 满足即触达 · 同步通知上级"
      : "触发条件 · 满足即触达",
  };
};


/* ============== 天气触发条件配置 ============== */

export type WeatherTriggerKey =
  | "extremeHeat"
  | "extremeCold"
  | "coldWave"
  | "rainstorm"
  | "snowstorm"
  | "typhoon"
  | "sandstorm"
  | "haze";

export type WarningLevel = "blue" | "yellow" | "orange" | "red";

export const warningLevelMeta: Record<
  WarningLevel,
  { name: string; color: string; bg: string; ring: string }
> = {
  blue: { name: "蓝色", color: "#3B82F6", bg: "#DBEAFE", ring: "#93C5FD" },
  yellow: { name: "黄色", color: "#CA8A04", bg: "#FEF9C3", ring: "#FDE047" },
  orange: { name: "橙色", color: "#EA580C", bg: "#FFEDD5", ring: "#FDBA74" },
  red: { name: "红色", color: "#DC2626", bg: "#FEE2E2", ring: "#FCA5A5" },
};

export const allWarningLevels: WarningLevel[] = ["blue", "yellow", "orange", "red"];

export type WeatherTriggerCategory =
  | {
      key: WeatherTriggerKey;
      kind: "threshold";
      name: string;
      short: string;
      desc: string;
      tip: string;
      icon: LucideIcon;
      colorVar: string;
      unit: string;
      compare: "gte" | "lte"; // ≥ or ≤
      presets: number[];
      defaultValue: number;
      min: number;
      max: number;
      step?: number;
      formatValue: (v: number) => string;
      shortLabel: (v: number) => string;
    }
  | {
      key: "coldWave";
      kind: "coldWave";
      name: string;
      short: string;
      desc: string;
      tip: string;
      icon: LucideIcon;
      colorVar: string;
      drop: {
        label: string;
        presets: number[];
        defaultValue: number;
        min: number;
        max: number;
      };
      minTemp: {
        label: string;
        presets: number[];
        defaultValue: number;
        min: number;
        max: number;
      };
      formatValue: (drop: number, minTemp: number) => string;
      shortLabel: (drop: number, minTemp: number) => string;
    }
  | {
      key: WeatherTriggerKey;
      kind: "warning";
      name: string;
      short: string;
      desc: string;
      tip: string;
      icon: LucideIcon;
      colorVar: string;
      defaultLevels: WarningLevel[];
      formatValue: (levels: WarningLevel[]) => string;
      shortLabel: (levels: WarningLevel[]) => string;
    };

const fmtLevels = (levels: WarningLevel[]) =>
  levels.length === 0
    ? "未启用"
    : levels.map((l) => warningLevelMeta[l].name).join(" / ") + "预警";

export const weatherTriggerCategories: WeatherTriggerCategory[] = [
  {
    key: "extremeHeat",
    kind: "threshold",
    name: "极端高温",
    short: "高温",
    desc: "气温达到阈值时自动推送防暑提醒",
    tip: "建议设置 ≥ 37℃,人体易出现中暑风险",
    icon: Thermometer,
    colorVar: "--cat-1",
    unit: "℃",
    compare: "gte",
    presets: [35, 37, 38, 40],
    defaultValue: 37,
    min: 30,
    max: 50,
    formatValue: (v) => `≥ ${v} ℃`,
    shortLabel: (v) => `高温 ≥ ${v}℃`,
  },
  {
    key: "extremeCold",
    kind: "threshold",
    name: "极端低温",
    short: "低温",
    desc: "气温低于阈值时自动推送保暖提醒",
    tip: "建议设置 ≤ 0℃,户外作业需注意防冻",
    icon: ThermometerSnowflake,
    colorVar: "--cat-9",
    unit: "℃",
    compare: "lte",
    presets: [5, 0, -5, -10],
    defaultValue: 0,
    min: -30,
    max: 15,
    formatValue: (v) => `≤ ${v} ℃`,
    shortLabel: (v) => `低温 ≤ ${v}℃`,
  },
  {
    key: "coldWave",
    kind: "coldWave",
    name: "寒潮降温",
    short: "寒潮",
    desc: "24h 降温幅度与最低气温同时满足时触发",
    tip: "国标寒潮常参考 24h 降温 ≥ 8℃、最低温 ≤ 4℃；两项同时满足才触发,可按城市气候调整",
    icon: Snowflake,
    colorVar: "--cat-3",
    drop: {
      label: "24 小时降温幅度",
      presets: [6, 8, 10, 12],
      defaultValue: 8,
      min: 4,
      max: 20,
    },
    minTemp: {
      label: "最低气温",
      presets: [0, 2, 4, 6],
      defaultValue: 4,
      min: -10,
      max: 10,
    },
    formatValue: (drop, minTemp) => `24h降温≥${drop}℃且最低温≤${minTemp}℃`,
    shortLabel: (drop, minTemp) => `24h降温≥${drop}℃且最低温≤${minTemp}℃`,
  },
  {
    key: "rainstorm",
    kind: "warning",
    name: "暴雨预警",
    short: "暴雨",
    desc: "气象部门发布暴雨预警时自动触发",
    tip: "默认黄/橙/红预警触发,蓝色预警不报警",
    icon: CloudRain,
    colorVar: "--cat-7",
    defaultLevels: ["yellow", "orange", "red"],
    formatValue: fmtLevels,
    shortLabel: (l) => `暴雨 · ${l.length} 级预警`,
  },
  {
    key: "snowstorm",
    kind: "warning",
    name: "暴雪预警",
    short: "暴雪",
    desc: "气象部门发布暴雪预警时自动触发",
    tip: "默认黄/橙/红预警触发,蓝色预警不报警",
    icon: CloudSnow,
    colorVar: "--cat-2",
    defaultLevels: ["yellow", "orange", "red"],
    formatValue: fmtLevels,
    shortLabel: (l) => `暴雪 · ${l.length} 级预警`,
  },
  {
    key: "typhoon",
    kind: "warning",
    name: "台风预警",
    short: "台风",
    desc: "气象部门发布台风预警时自动触发",
    tip: "台风影响范围广,建议蓝/黄/橙/红全部启用",
    icon: Wind,
    colorVar: "--cat-4",
    defaultLevels: ["blue", "yellow", "orange", "red"],
    formatValue: fmtLevels,
    shortLabel: (l) => `台风 · ${l.length} 级预警`,
  },
  {
    key: "sandstorm",
    kind: "warning",
    name: "沙尘暴",
    short: "沙尘",
    desc: "气象部门发布沙尘暴预警时自动触发",
    tip: "默认黄/橙/红预警触发",
    icon: CloudFog,
    colorVar: "--cat-1",
    defaultLevels: ["yellow", "orange", "red"],
    formatValue: fmtLevels,
    shortLabel: (l) => `沙尘 · ${l.length} 级预警`,
  },
  {
    key: "haze",
    kind: "threshold",
    name: "霾 / 重污染",
    short: "霾",
    desc: "空气质量指数 AQI 达到阈值时触发",
    tip: "AQI ≥ 200 即重度污染,建议减少户外活动",
    icon: Cloudy,
    colorVar: "--cat-2",
    unit: "AQI",
    compare: "gte",
    presets: [150, 200, 250, 300],
    defaultValue: 200,
    min: 100,
    max: 500,
    step: 10,
    formatValue: (v) => `AQI ≥ ${v}`,
    shortLabel: (v) => `霾 AQI ≥ ${v}`,
  },
];

export type WeatherTriggerState = {
  enabled: Partial<Record<WeatherTriggerKey, boolean>>;
  /** 单阈值类天气；寒潮时存 24h 降温幅度 */
  thresholds: Partial<Record<WeatherTriggerKey, number>>;
  /** 寒潮最低气温 ≤ 该值 */
  minTemps?: Partial<Record<WeatherTriggerKey, number>>;
  levels: Partial<Record<WeatherTriggerKey, WarningLevel[]>>;
};

export const getColdWaveDrop = (state: WeatherTriggerState) => {
  const cat = weatherTriggerCategories.find((c) => c.key === "coldWave");
  if (!cat || cat.kind !== "coldWave") return 8;
  return state.thresholds.coldWave ?? cat.drop.defaultValue;
};

export const getColdWaveMinTemp = (state: WeatherTriggerState) => {
  const cat = weatherTriggerCategories.find((c) => c.key === "coldWave");
  if (!cat || cat.kind !== "coldWave") return 4;
  return state.minTemps?.coldWave ?? cat.minTemp.defaultValue;
};

export const defaultWeatherTrigger: WeatherTriggerState = {
  enabled: weatherTriggerCategories.reduce(
    (acc, c) => {
      acc[c.key] =
        "defaultEnabled" in c
          ? Boolean((c as { defaultEnabled?: boolean }).defaultEnabled)
          : true;
      return acc;
    },
    {} as Record<WeatherTriggerKey, boolean>,
  ),
  thresholds: weatherTriggerCategories.reduce(
    (acc, c) => {
      if (c.kind === "threshold") acc[c.key] = c.defaultValue;
      if (c.kind === "coldWave") acc[c.key] = c.drop.defaultValue;
      return acc;
    },
    {} as Record<WeatherTriggerKey, number>,
  ),
  minTemps: { coldWave: 4 },
  levels: weatherTriggerCategories.reduce(
    (acc, c) => {
      if (c.kind === "warning") acc[c.key] = [...c.defaultLevels];
      return acc;
    },
    {} as Record<WeatherTriggerKey, WarningLevel[]>,
  ),
};

export const summarizeWeather = (
  state: WeatherTriggerState,
): { text: string; sub: string } => {
  const parts: string[] = [];
  for (const cat of weatherTriggerCategories) {
    if (!state.enabled[cat.key]) continue;
    if (cat.kind === "threshold") {
      const v = state.thresholds[cat.key] ?? cat.defaultValue;
      parts.push(cat.shortLabel(v));
    } else if (cat.kind === "coldWave") {
      parts.push(
        cat.shortLabel(getColdWaveDrop(state), getColdWaveMinTemp(state)),
      );
    } else {
      const l = state.levels[cat.key] ?? cat.defaultLevels;
      if (l.length > 0) parts.push(cat.shortLabel(l));
    }
  }
  if (parts.length === 0) {
    return { text: "未启用任何触发条件", sub: "请至少开启一种天气条件" };
  }
  const enabledCount = parts.length;
  return {
    text: parts.slice(0, 2).join(" · ") + (parts.length > 2 ? ` 等 ${enabledCount} 项` : ""),
    sub: `共启用 ${enabledCount} 项天气触发 · 满足即触达`,
  };
};

/* ============== 天气关怀 · 分场景触达文案 ============== */

export const AI_CARE_CONTENT_MARKER = "✨ AI 动态生成";

export type WeatherContentEntry = { selected: string; custom?: string };
export type WeatherContentMap = Partial<Record<WeatherTriggerKey, WeatherContentEntry>>;

type LegacyWeatherContentEntry = {
  template?: string;
  custom?: string;
  content?: string;
  selected?: string;
};

export const isAiCareTemplate = (text: string) => text.includes("AI 动态生成");

/** 兼容旧数据 template/custom */
export const normalizeWeatherContentEntry = (
  entry?: LegacyWeatherContentEntry | null,
): WeatherContentEntry | undefined => {
  if (!entry) return undefined;
  if (entry.selected?.trim()) {
    return {
      selected: entry.selected.trim(),
      custom: entry.custom?.trim() || undefined,
    };
  }
  if (entry.content?.trim()) {
    return { selected: entry.content.trim() };
  }
  const legacyCustom = entry.custom?.trim();
  const legacyTemplate = entry.template?.trim();
  if (legacyCustom) {
    return {
      selected: legacyTemplate && !isAiCareTemplate(legacyTemplate) ? legacyTemplate : legacyCustom,
      custom: legacyTemplate && !isAiCareTemplate(legacyTemplate) ? legacyCustom : undefined,
    };
  }
  const text = legacyTemplate?.trim();
  if (!text || isAiCareTemplate(text)) return undefined;
  return { selected: text };
};

/** 最终触达文案：自定义优先，否则为 AI 选中项 */
export const resolveWeatherContent = (entry?: WeatherContentEntry) =>
  entry?.custom?.trim() || entry?.selected?.trim() || "";

/** 各关怀类型 AI 文案池 */
export const aiCareContentVariants: Record<CareType, readonly string[]> = {
  birthday: [
    "🎂 生日快乐!愿新的一岁充满惊喜与成长,公司为你准备了专属礼遇",
    "🎉 祝你生日快乐!劳逸结合,万事顺意",
    "✨ 生日快乐!感谢你的付出,愿你被温柔以待",
  ],
  festival: [
    "🧧 节日快乐,阖家团圆,愿你温暖如常",
    "🎁 节日将至,公司为你送上节日礼包与祝福",
    "✨ 节日快乐!愿美好与你常相伴",
  ],
  weather: [
    "☔ 出行请关注天气变化,注意安全",
    "🌤 今日天气多变,请合理安排行程",
    "🌡 请关注气温变化,做好防护",
  ],
  workload: [
    "🌙 辛苦了!夜深了请注意休息,公司为你准备了加班礼包",
    "💪 看到你最近很拼,记得照顾好自己,加班礼包已备好",
    "🫶 辛苦了!公司感谢你的付出,请领取加班礼包",
  ],
};

/** 各极端天气场景 AI 文案池 */
export const aiWeatherContentVariants: Record<WeatherTriggerKey, readonly string[]> = {
  extremeHeat: [
    "🥵 高温来袭!请注意防暑降温,多补水,减少户外暴晒",
    "☀ 今日高温,建议错峰出行,办公室备好饮用水",
    "🌡 气温较高,户外作业请做好防暑措施",
  ],
  extremeCold: [
    "❄ 低温预警,注意保暖防冻,户外作业请加强防护",
    "🧊 气温较低,出门请添衣,注意防寒",
    "🧣 寒冷天气,请做好保暖,关注身体",
  ],
  coldWave: [
    "🧣 寒潮来袭,气温骤降,请注意添衣保暖",
    "❄ 寒潮影响,合理安排出行,注意防寒",
    "🌬 气温大幅下降,请加强防寒措施",
  ],
  rainstorm: [
    "☔ 暴雨天气,出门请带好雨具,注意交通安全",
    "🌧 降雨较大,建议错峰出行,远离积水路段",
    "💧 强降雨来袭,注意出行安全",
  ],
  snowstorm: [
    "🌨 暴雪预警,路面湿滑,出行请注意安全",
    "⛄ 降雪天气,减速慢行,注意防滑",
    "❄ 大雪天气,注意防寒与出行安全",
  ],
  typhoon: [
    "🌀 台风影响,尽量减少外出,关好门窗",
    "💨 台风天气,非必要不外出,注意人身安全",
    "🏠 关好门窗,减少户外活动",
  ],
  sandstorm: [
    "🌫 沙尘天气,建议佩戴口罩,减少户外活动",
    "😷 能见度较低,出行请注意防护",
    "💨 沙尘来袭,户外请做好防护",
  ],
  haze: [
    "😷 空气质量较差,建议减少户外活动",
    "🌁 霾 / 重污染,敏感人群请减少外出",
    "😷 重污染天,外出请佩戴防护口罩",
  ],
};

export const pickAiContentBatch = (
  pool: readonly string[],
  size = 3,
): string[] => {
  if (pool.length === 0) return Array.from({ length: size }, () => "");
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const out: string[] = [];
  const used = new Set<string>();
  for (const item of shuffled) {
    if (out.length >= size) break;
    if (!used.has(item)) {
      out.push(item);
      used.add(item);
    }
  }
  let i = 0;
  while (out.length < size) {
    out.push(pool[i % pool.length]);
    i += 1;
  }
  return out.slice(0, size);
};

export const pickFreshAiBatch = (
  pool: readonly string[],
  current: readonly string[],
  size = 3,
): string[] => {
  for (let n = 0; n < 15; n += 1) {
    const next = pickAiContentBatch(pool, size);
    if (next.join("\x00") !== current.join("\x00")) return next;
  }
  return pickAiContentBatch(pool, size);
};

export type WeatherContentRowStatus = "disabled" | "pending" | "ready";

/** 列表摘要：截断过长关怀文案 */
export const truncateCarePreviewText = (text: string, max = 26) => {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
};

export const getWeatherContentRowStatus = (
  key: WeatherTriggerKey,
  trigger: WeatherTriggerState,
  contents: WeatherContentMap,
): WeatherContentRowStatus => {
  if (!trigger.enabled[key]) return "disabled";
  if (!resolveWeatherContent(contents[key])) return "pending";
  return "ready";
};

export const getWeatherThresholdLabel = (
  key: WeatherTriggerKey,
  state: WeatherTriggerState,
): string => {
  const cat = weatherTriggerCategories.find((c) => c.key === key)!;
  if (!state.enabled[key]) return "未启用";
  if (cat.kind === "threshold") {
    const v = state.thresholds[key] ?? cat.defaultValue;
    return cat.formatValue(v);
  }
  if (cat.kind === "coldWave") {
    return cat.formatValue(getColdWaveDrop(state), getColdWaveMinTemp(state));
  }
  const levels = state.levels[key] ?? cat.defaultLevels;
  return cat.formatValue(levels);
};

export const countWeatherContentReady = (
  trigger: WeatherTriggerState,
  contents: WeatherContentMap,
) =>
  weatherTriggerCategories.filter(
    (c) => trigger.enabled[c.key] && resolveWeatherContent(contents[c.key]),
  ).length;

export const summarizeWeatherContent = (
  trigger: WeatherTriggerState,
  contents: WeatherContentMap,
): { text: string; sub?: string } => {
  const enabled = weatherTriggerCategories.filter((c) => trigger.enabled[c.key]);
  if (enabled.length === 0) {
    return { text: "未配置触达文案", sub: "请先在触发条件中启用至少 1 项" };
  }
  const ready = enabled.filter((c) => contents[c.key]);
  if (ready.length === 0) {
    return {
      text: `已启用 ${enabled.length} 项，均未配置文案`,
      sub: "保存前请为已启用场景配置触达文案",
    };
  }
  if (ready.length === 1) {
    return { text: resolveWeatherContent(contents[ready[0].key]) };
  }
  const pending = enabled.length - ready.length;
  return {
    text: `已配置 ${ready.length}/${enabled.length} 类场景文案`,
    sub:
      pending > 0
        ? `${ready.map((c) => c.short).join(" · ")} 等 · 另有 ${pending} 类待配置`
        : ready.map((c) => c.short).join(" · "),
  };
};

/** 模拟查收 / 列表展示用：取第一条已配置文案 */
export const firstWeatherPreviewContent = (
  trigger: WeatherTriggerState,
  contents: WeatherContentMap,
) => {
  const cat = weatherTriggerCategories.find(
    (c) => trigger.enabled[c.key] && contents[c.key],
  );
  return cat ? resolveWeatherContent(contents[cat.key]) : "";
};

/** 模拟查收用：取第一条已启用的天气场景 */
export const firstEnabledWeatherKey = (
  trigger: WeatherTriggerState,
): WeatherTriggerKey =>
  weatherTriggerCategories.find((c) => trigger.enabled[c.key])?.key ??
  "extremeHeat";

/** 与模拟查收主文案一致：优先取已启用且已配置文案的场景 */
export const firstWeatherPreviewScenario = (
  trigger: WeatherTriggerState,
  contents: WeatherContentMap,
): WeatherTriggerKey => {
  const cat = weatherTriggerCategories.find(
    (c) => trigger.enabled[c.key] && contents[c.key],
  );
  return cat?.key ?? firstEnabledWeatherKey(trigger);
};

/** 天气关怀 · 场景贴士（按钮文案 + 点击后全文） */
export const weatherScenarioTips: Record<
  WeatherTriggerKey,
  { label: string; body: string }
> = {
  extremeHeat: {
    label: "防暑贴士",
    body: "防暑贴士：炎炎夏日，记得多喝水、适当休息，外出时注意防晒避暑，照顾好自己。",
  },
  extremeCold: {
    label: "保暖贴士",
    body: "保暖贴士：天冷了，记得添衣保暖，尤其是头和手脚，愿温暖伴你每一天。",
  },
  coldWave: {
    label: "防寒贴士",
    body: "防寒贴士：气温骤降，注意防寒保暖，减少外出，照顾好自己和家人。",
  },
  rainstorm: {
    label: "防雨贴士",
    body: "防雨贴士：雨天路滑，出行记得带伞，驾车请慢行，注意安全。",
  },
  snowstorm: {
    label: "防雪贴士",
    body: "防雪贴士：雪天路难行，减少不必要的外出，驾车务必注意防滑，平安第一。",
  },
  typhoon: {
    label: "防风贴士",
    body: "防风贴士：台风来临时，请关好门窗、收好阳台物品，减少外出，确保安全。",
  },
  sandstorm: {
    label: "防沙贴士",
    body: "防沙贴士：沙尘天气，外出请戴好口罩，回家后及时清洁，保持好心情。",
  },
  haze: {
    label: "防霾贴士",
    body: "防霾贴士：雾霾天气，请减少户外活动，外出佩戴口罩，保护好呼吸系统。",
  },
};

/** 天气关怀 · 通勤指南（按钮文案固定，全文随场景变化） */
export const weatherCommuteGuides: Record<
  WeatherTriggerKey,
  { label: string; body: string }
> = {
  extremeHeat: {
    label: "通勤指南",
    body: "通勤指南：避开中午烈日时段，公交地铁注意防潮降温，自驾提前检查空调，外出带杯水及时补水。",
  },
  extremeCold: {
    label: "通勤指南",
    body: "通勤指南：做好头部保暖，步行防摔倒，骑行戴手套，驾车提前热车，公共交通较稳妥。",
  },
  coldWave: {
    label: "通勤指南",
    body: "通勤指南：比平时提早出门，路面可能结冰，步行防滑倒，建议公共交通更安全。",
  },
  rainstorm: {
    label: "通勤指南",
    body: "通勤指南：带好雨伞，提前出门避高峰，避开积水路段，驾车开雾灯减速行，深水绕行。",
  },
  snowstorm: {
    label: "通勤指南",
    body: "通勤指南：尽量减少出行，建议公共交通，必须驾车装防滑链，步行防摔伤。",
  },
  typhoon: {
    label: "通勤指南",
    body: "通勤指南：避免骑单车，避开广告牌下行走，公共交通更安全，非必要不出门。",
  },
  sandstorm: {
    label: "通勤指南",
    body: "通勤指南：戴好口罩帽子，到单位及时洗脸漱口，驾车关闭车窗使用内循环。",
  },
  haze: {
    label: "通勤指南",
    body: "通勤指南：戴好口罩，公共交通更佳，驾车关闭车窗，早练改为室内，敏感人群减少外出。",
  },
};

export type PreviewPerkAction = "jump" | "tip";

export type WeatherPreviewPerk = {
  label: string;
  body: string;
  icon: LucideIcon;
  colorVar: string;
  action: PreviewPerkAction;
};

export const getWeatherPreviewPerks = (
  key: WeatherTriggerKey,
): WeatherPreviewPerk[] => {
  const cat = weatherTriggerCategories.find((c) => c.key === key)!;
  const tip = weatherScenarioTips[key];
  return [
    {
      label: tip.label,
      body: tip.body,
      icon: cat.icon,
      colorVar: cat.colorVar,
      action: "tip",
    },
    {
      label: weatherCommuteGuides[key].label,
      body: weatherCommuteGuides[key].body,
      icon: Wind,
      colorVar: "--cat-3",
      action: "tip",
    },
  ];
};

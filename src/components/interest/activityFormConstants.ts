import type { ActivityKind } from "@/data/interestTypes";

export const ACTIVITY_KIND_OPTIONS: {
  key: ActivityKind;
  label: string;
  hint: string;
}[] = [
  { key: "one_off", label: "单次", hint: "一场定胜负，指定开始时间" },
  { key: "recurring", label: "周期", hint: "每周或每月固定重复" },
  {
    key: "series",
    label: "系列",
    hint: "分多场次举办，按时间顺序排列",
  },
];

export const ACTIVITY_KIND_LABEL: Record<ActivityKind, string> = {
  one_off: "单次",
  recurring: "周期",
  series: "系列",
};

export const SERIES_TITLE_PLACEHOLDER = "如：羽毛球友谊赛";
export const SERIES_DESC_PLACEHOLDER =
  "介绍活动背景、参与方式与规则。\n\n建议写明赛程，例如：\n· 初赛 — 7月1日 19:00\n· 晋级赛 — 7月20日 19:00\n· 决赛 — 8月1日 14:00";
export const SERIES_LOCATION_PLACEHOLDER = "如：公司附近某某羽毛球馆";

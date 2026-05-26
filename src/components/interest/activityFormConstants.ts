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

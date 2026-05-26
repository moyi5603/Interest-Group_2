import { useSyncExternalStore } from "react";
import {
  sampleRules,
  type CareRule,
  type CareType,
} from "@/data/humanityCare";

let rules: CareRule[] = [...sampleRules];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const subscribeCareRules = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getCareRulesSnapshot = () => rules;

export const getCareRule = (id: string) => rules.find((r) => r.id === id);

export const getCareRulesByType = (type: CareType) =>
  rules.filter((r) => r.type === type);

export const upsertCareRule = (rule: CareRule) => {
  const idx = rules.findIndex((r) => r.id === rule.id);
  rules =
    idx >= 0
      ? [...rules.slice(0, idx), rule, ...rules.slice(idx + 1)]
      : [...rules, rule];
  emit();
};

export const deleteCareRule = (id: string) => {
  rules = rules.filter((r) => r.id !== id);
  emit();
};

export const setCareRuleEnabled = (id: string, enabled: boolean) => {
  const idx = rules.findIndex((r) => r.id === id);
  if (idx < 0) return;
  rules = [...rules.slice(0, idx), { ...rules[idx], enabled }, ...rules.slice(idx + 1)];
  emit();
};

/** 订阅关怀方案列表, 新建/编辑/删除后自动刷新 */
export const useCareRules = (type?: CareType) => {
  const all = useSyncExternalStore(
    subscribeCareRules,
    getCareRulesSnapshot,
    getCareRulesSnapshot,
  );
  return type ? all.filter((r) => r.type === type) : all;
};

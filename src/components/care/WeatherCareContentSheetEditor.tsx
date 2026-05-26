import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  weatherTriggerCategories,
  aiWeatherContentVariants,
  getWeatherThresholdLabel,
  normalizeWeatherContentEntry,
  resolveWeatherContent,
  type WeatherContentMap,
  type WeatherTriggerKey,
  type WeatherTriggerState,
} from "@/data/humanityCare";
import { CareContentAiPanel } from "@/components/care/CareContentAiPanel";
import {
  WeatherScenarioTabGrid,
  type WeatherTabStatus,
} from "@/components/care/WeatherScenarioTabGrid";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  trigger: WeatherTriggerState;
  contents: WeatherContentMap;
  onChange: (contents: WeatherContentMap) => void;
  triggerNode: React.ReactNode;
};

export const WeatherCareContentSheetEditor = ({
  trigger,
  contents,
  onChange,
  triggerNode,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<WeatherTriggerKey>(
    weatherTriggerCategories[0].key,
  );
  const [draftContents, setDraftContents] = useState<WeatherContentMap>(contents);
  const [contentDraft, setContentDraft] = useState("");
  const [aiDraft, setAiDraft] = useState("");

  const enabledCount = weatherTriggerCategories.filter(
    (c) => trigger.enabled[c.key],
  ).length;

  const activeCat = weatherTriggerCategories.find((c) => c.key === activeKey)!;
  const isEnabled = trigger.enabled[activeKey] ?? false;

  const mergeActiveInto = (base: WeatherContentMap): WeatherContentMap => {
    if (!isEnabled) return base;
    const final = contentDraft.trim();
    const next = { ...base };
    if (!final) {
      delete next[activeKey];
      return next;
    }
    const selected = aiDraft.trim() || final;
    next[activeKey] = {
      selected,
      custom: final !== selected ? final : undefined,
    };
    return next;
  };

  useEffect(() => {
    if (!open) return;
    setDraftContents({ ...contents });
    const first =
      weatherTriggerCategories.find((c) => trigger.enabled[c.key])?.key ??
      weatherTriggerCategories[0].key;
    setActiveKey(first);
    const entry = normalizeWeatherContentEntry(contents[first]);
    const text = resolveWeatherContent(entry);
    setContentDraft(text);
    setAiDraft(entry?.selected ?? text);
  }, [open, contents, trigger]);

  const switchTab = (key: WeatherTriggerKey) => {
    if (key === activeKey) return;
    const merged = mergeActiveInto(draftContents);
    setDraftContents(merged);
    setActiveKey(key);
    const entry = normalizeWeatherContentEntry(merged[key]);
    const text = resolveWeatherContent(entry);
    setContentDraft(text);
    setAiDraft(entry?.selected ?? text);
  };

  const handleAiSelect = (text: string) => {
    setAiDraft(text);
    setContentDraft(text);
  };

  const confirm = () => {
    const merged = mergeActiveInto(draftContents);
    onChange(merged);
    setOpen(false);
  };

  const tabContentStatus = (key: WeatherTriggerKey): WeatherTabStatus => {
    if (!trigger.enabled[key]) return "disabled";
    const saved = resolveWeatherContent(draftContents[key]);
    const live = key === activeKey && contentDraft.trim();
    if (saved || live) return "ready";
    return "pending";
  };

  const readyCount = weatherTriggerCategories.filter(
    (c) => tabContentStatus(c.key) === "ready",
  ).length;
  const pendingCount = weatherTriggerCategories.filter(
    (c) => tabContentStatus(c.key) === "pending",
  ).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{triggerNode}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl p-0">
        <div className="flex max-h-[88vh] flex-col">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-left text-base">关怀内容</SheetTitle>
            <p className="text-left text-[11px] text-muted-foreground">
              按天气场景分别配置 · 已启用 {enabledCount} 项
              {enabledCount > 0 && (
                <span className="text-foreground/80">
                  {" "}
                  · 已配 {readyCount}
                  {pendingCount > 0 ? ` / 待配 ${pendingCount}` : ""}
                </span>
              )}
            </p>
          </SheetHeader>

          <div className="mt-3 px-4">
            <WeatherScenarioTabGrid
              activeKey={activeKey}
              onSelect={switchTab}
              getStatus={tabContentStatus}
              pendingBadge="待配"
              legend={{
                ready: "已配置",
                pending: "待配置文案",
                disabled: "未启用",
              }}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            {!isEnabled ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 px-3 py-8 text-center">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-medium text-foreground">
                  {activeCat.name} 未启用
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  请先在「触发条件」中开启该场景，再配置触达文案
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  触发条件：{getWeatherThresholdLabel(activeKey, trigger)}
                </p>
                <CareContentAiPanel
                  key={activeKey}
                  pool={aiWeatherContentVariants[activeKey]}
                  onSelect={handleAiSelect}
                />
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    触达文案
                  </label>
                  <Textarea
                    value={contentDraft}
                    onChange={(e) => setContentDraft(e.target.value)}
                    placeholder="选择上方 AI 方案后将自动填入，可自行修改"
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={confirm}
              disabled={false}
              className="w-full rounded-full gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-base active:scale-95 disabled:opacity-40"
            >
              确定
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WeatherCareContentSheetEditor;

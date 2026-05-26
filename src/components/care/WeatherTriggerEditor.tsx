import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import {
  WeatherScenarioTabGrid,
  type WeatherTabStatus,
} from "@/components/care/WeatherScenarioTabGrid";
import {
  weatherTriggerCategories,
  warningLevelMeta,
  allWarningLevels,
  type WeatherTriggerState,
  type WeatherTriggerKey,
  type WarningLevel,
} from "@/data/humanityCare";

type Props = {
  value: WeatherTriggerState;
  onChange: (next: WeatherTriggerState) => void;
  trigger: React.ReactNode;
};

export const WeatherTriggerEditor = ({ value, onChange, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<WeatherTriggerKey>(
    weatherTriggerCategories[0].key,
  );
  const [draft, setDraft] = useState<WeatherTriggerState>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const activeCat = weatherTriggerCategories.find((c) => c.key === activeKey)!;
  const isEnabled = draft.enabled[activeKey] ?? true;

  const setEnabled = (k: WeatherTriggerKey, v: boolean) => {
    setDraft((d) => ({ ...d, enabled: { ...d.enabled, [k]: v } }));
  };
  const setThreshold = (k: WeatherTriggerKey, v: number) => {
    setDraft((d) => ({ ...d, thresholds: { ...d.thresholds, [k]: v } }));
  };
  const setMinTemp = (k: WeatherTriggerKey, v: number) => {
    setDraft((d) => ({
      ...d,
      minTemps: { ...d.minTemps, [k]: v },
    }));
  };
  const toggleLevel = (k: WeatherTriggerKey, lvl: WarningLevel) => {
    setDraft((d) => {
      const cat = weatherTriggerCategories.find((c) => c.key === k);
      const cur =
        d.levels[k] ?? (cat && cat.kind === "warning" ? [...cat.defaultLevels] : []);
      const next = cur.includes(lvl) ? cur.filter((x) => x !== lvl) : [...cur, lvl];
      return { ...d, levels: { ...d.levels, [k]: next } };
    });
  };

  const confirm = () => {
    onChange(draft);
    setOpen(false);
  };

  const enabledCount = weatherTriggerCategories.filter(
    (c) => draft.enabled[c.key],
  ).length;

  const tabTriggerStatus = (key: WeatherTriggerKey): WeatherTabStatus =>
    draft.enabled[key] ? "ready" : "disabled";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl p-0">
        <div className="flex max-h-[88vh] flex-col">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-left text-base">天气触发条件</SheetTitle>
            <p className="text-left text-[11px] text-muted-foreground">
              共 {weatherTriggerCategories.length} 类 · 已启用 {enabledCount} 项 ·
              满足任一条件即触达
            </p>
          </SheetHeader>

          <div className="mt-3 px-4">
            <WeatherScenarioTabGrid
              activeKey={activeKey}
              onSelect={setActiveKey}
              getStatus={tabTriggerStatus}
              showPending={false}
              legend={{
                ready: "已启用",
                pending: "",
                disabled: "未启用",
              }}
            />
          </div>

          {/* Active panel */}
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            <div className="rounded-2xl border border-primary/40 bg-card p-4 shadow-soft">
              {/* Header: name + enable switch */}
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    {activeCat.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {activeCat.kind === "coldWave"
                      ? activeCat.formatValue(
                          draft.thresholds.coldWave ?? activeCat.drop.defaultValue,
                          draft.minTemps?.coldWave ?? activeCat.minTemp.defaultValue,
                        )
                      : activeCat.desc}
                  </div>
                </div>
                <Switch
                  checked={!!isEnabled}
                  onCheckedChange={(v) => setEnabled(activeKey, v)}
                />
              </div>

              {/* Tip */}
              <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-accent/50 px-2.5 py-2 text-[11px] text-accent-foreground">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="leading-relaxed">{activeCat.tip}</span>
              </div>

              {/* Body */}
              <div
                className={`mt-4 ${!isEnabled ? "pointer-events-none opacity-40" : ""}`}
              >
                {activeCat.kind === "threshold" ? (
                  <ThresholdBody
                    cat={activeCat}
                    value={draft.thresholds[activeKey] ?? activeCat.defaultValue}
                    onChange={(v) => setThreshold(activeKey, v)}
                  />
                ) : activeCat.kind === "coldWave" ? (
                  <ColdWaveBody
                    cat={activeCat}
                    drop={draft.thresholds.coldWave ?? activeCat.drop.defaultValue}
                    minTemp={
                      draft.minTemps?.coldWave ?? activeCat.minTemp.defaultValue
                    }
                    onDropChange={(v) => setThreshold("coldWave", v)}
                    onMinTempChange={(v) => setMinTemp("coldWave", v)}
                  />
                ) : (
                  <WarningLevelBody
                    selected={
                      draft.levels[activeKey] ?? [...activeCat.defaultLevels]
                    }
                    onToggle={(l) => toggleLevel(activeKey, l)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={confirm}
              className="w-full rounded-full gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-base active:scale-95"
            >
              确定
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const ColdWaveBody = ({
  cat,
  drop,
  minTemp,
  onDropChange,
  onMinTempChange,
}: {
  cat: Extract<
    (typeof import("@/data/humanityCare"))["weatherTriggerCategories"][number],
    { kind: "coldWave" }
  >;
  drop: number;
  minTemp: number;
  onDropChange: (v: number) => void;
  onMinTempChange: (v: number) => void;
}) => (
  <div className="space-y-4">
    <ThresholdParamBlock
      title="① 24 小时降温幅度"
      param={cat.drop}
      value={drop}
      onChange={onDropChange}
      compareSymbol="≥"
    />
    <ThresholdParamBlock
      title="② 最低气温"
      param={cat.minTemp}
      value={minTemp}
      onChange={onMinTempChange}
      compareSymbol="≤"
    />
    <div className="rounded-xl bg-secondary/50 px-3 py-2.5 text-center">
      <p className="text-[10px] text-muted-foreground">触发条件预览</p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {cat.formatValue(drop, minTemp)}
      </p>
    </div>
  </div>
);

const ThresholdParamBlock = ({
  title,
  param,
  value,
  onChange,
  compareSymbol,
}: {
  title: string;
  param: { presets: number[]; min: number; max: number };
  value: number;
  onChange: (v: number) => void;
  compareSymbol: "≥" | "≤";
}) => (
  <div>
    <p className="mb-2 text-xs font-medium text-foreground">{title}</p>
    <div className="flex flex-wrap gap-1.5">
      {param.presets.map((p) => {
        const selected = value === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex-1 min-w-[52px] rounded-lg border px-2 py-2 text-xs font-medium transition-base ${
              selected
                ? "border-transparent bg-primary text-primary-foreground shadow-glow"
                : "border-border bg-background text-foreground active:scale-95"
            }`}
          >
            {compareSymbol} {p}°
          </button>
        );
      })}
    </div>
    <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-2">
      <span className="text-xs text-muted-foreground">自定义</span>
      <input
        type="number"
        min={param.min}
        max={param.max}
        step={1}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isNaN(n)) return;
          onChange(Math.min(param.max, Math.max(param.min, n)));
        }}
        className="flex-1 bg-transparent text-right text-sm font-medium text-foreground focus:outline-none"
      />
      <span className="text-xs text-muted-foreground">℃</span>
    </div>
    <p className="mt-1 text-right text-[10px] text-muted-foreground">
      范围 {param.min} ~ {param.max} ℃
    </p>
  </div>
);

const ThresholdBody = ({
  cat,
  value,
  onChange,
}: {
  cat: Extract<
    (typeof import("@/data/humanityCare"))["weatherTriggerCategories"][number],
    { kind: "threshold" }
  >;
  value: number;
  onChange: (v: number) => void;
}) => {
  return (
    <>
      <div className="text-center text-2xl font-bold text-foreground">
        {cat.formatValue(value)}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {cat.presets.map((p) => {
          const selected = value === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`flex-1 min-w-[60px] rounded-lg border px-2 py-2 text-xs font-medium transition-base ${
                selected
                  ? "border-transparent bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-background text-foreground active:scale-95"
              }`}
            >
              {p}
              <span
                className={`ml-0.5 text-[10px] ${
                  selected ? "opacity-80" : "text-muted-foreground"
                }`}
              >
                {cat.unit}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-2">
        <span className="text-xs text-muted-foreground">自定义</span>
        <input
          type="number"
          min={cat.min}
          max={cat.max}
          step={cat.step ?? 1}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) return;
            const clamped = Math.min(cat.max, Math.max(cat.min, n));
            onChange(clamped);
          }}
          className="flex-1 bg-transparent text-right text-sm font-medium text-foreground focus:outline-none"
        />
        <span className="text-xs text-muted-foreground">{cat.unit}</span>
      </div>
      <p className="mt-1 text-right text-[10px] text-muted-foreground">
        范围 {cat.min} ~ {cat.max} {cat.unit}
      </p>
    </>
  );
};

const WarningLevelBody = ({
  selected,
  onToggle,
}: {
  selected: WarningLevel[];
  onToggle: (l: WarningLevel) => void;
}) => {
  return (
    <>
      <div className="mb-2 text-[11px] text-muted-foreground">
        勾选需要触发的预警等级
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {allWarningLevels.map((lvl) => {
          const meta = warningLevelMeta[lvl];
          const on = selected.includes(lvl);
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => onToggle(lvl)}
              className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-2 text-left text-xs font-medium transition-base active:scale-95"
              style={{
                borderColor: on ? meta.color : "hsl(var(--border))",
                backgroundColor: on ? meta.bg : undefined,
                color: on ? meta.color : "hsl(var(--foreground))",
              }}
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: meta.color,
                  backgroundColor: on ? meta.color : "transparent",
                }}
              >
                {on && (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none">
                    <path
                      d="M2 6.5L5 9.5L10 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span>{meta.name}预警</span>
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="mt-2 text-[11px] text-destructive">
          至少选择一个预警等级,否则不会触发
        </p>
      )}
    </>
  );
};

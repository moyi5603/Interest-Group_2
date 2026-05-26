import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  weatherTriggerCategories,
  type WeatherTriggerKey,
} from "@/data/humanityCare";

export type WeatherTabStatus = "disabled" | "pending" | "ready";

type LegendLabels = {
  ready: string;
  pending: string;
  disabled: string;
};

type Props = {
  activeKey: WeatherTriggerKey;
  onSelect: (key: WeatherTriggerKey) => void;
  getStatus: (key: WeatherTriggerKey) => WeatherTabStatus;
  pendingBadge?: string;
  legend?: LegendLabels;
  /** 是否展示「待完善/待配」角标与图例，触发条件弹层关闭 */
  showPending?: boolean;
};

const defaultLegend: LegendLabels = {
  ready: "已配置",
  pending: "待配置",
  disabled: "未启用",
};

export const WeatherScenarioTabGrid = ({
  activeKey,
  onSelect,
  getStatus,
  pendingBadge = "待配",
  legend = defaultLegend,
  showPending = true,
}: Props) => {
  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-secondary/60 p-1.5">
        {weatherTriggerCategories.map((cat) => {
          const Icon = cat.icon;
          const active = cat.key === activeKey;
          const status = getStatus(cat.key);
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelect(cat.key)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-2 text-[11px] font-medium transition-base",
                status === "disabled" &&
                  "border-transparent opacity-45 text-muted-foreground",
                status === "pending" &&
                  !active &&
                  "border-amber-300/80 bg-amber-50 text-amber-900",
                status === "pending" &&
                  active &&
                  "border-amber-400 bg-card text-amber-900 shadow-soft ring-1 ring-amber-300/50",
                status === "ready" &&
                  !active &&
                  "border-emerald-400/70 bg-emerald-50 text-emerald-900",
                status === "ready" &&
                  active &&
                  "border-emerald-500 bg-card text-emerald-900 shadow-soft ring-1 ring-emerald-400/40",
                status === "disabled" && active && "bg-card opacity-60 shadow-soft",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2.4} />
              <span className="max-w-full truncate">{cat.short}</span>
              {status === "ready" && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              )}
              {showPending && status === "pending" && (
                <span className="absolute -right-0.5 -top-0.5 rounded-full bg-amber-500 px-1 py-px text-[8px] font-bold leading-none text-white shadow-sm">
                  {pendingBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-2 w-2" strokeWidth={3} />
          </span>
          {legend.ready}
        </span>
        {showPending && (
          <span className="inline-flex items-center gap-1">
            <span className="rounded-full bg-amber-500 px-1 text-[8px] font-bold text-white">
              {pendingBadge}
            </span>
            {legend.pending}
          </span>
        )}
        <span className="inline-flex items-center gap-1 opacity-50">
          <span className="h-3.5 w-3.5 rounded border border-transparent" />
          {legend.disabled}
        </span>
      </div>
    </div>
  );
};

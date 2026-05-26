import type { WorkloadTriggerCategory } from "@/data/humanityCare";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  cat: WorkloadTriggerCategory;
  value: number | string;
  onChange: (v: number | string) => void;
  /** 按周 / 连班：右上角「发送给上级」 */
  notifySupervisor?: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  };
};

/** 工作强度触发 · 单日 / 下班 / 周 / 连班 数值面板 */
export const WorkloadTriggerValuePanel = ({
  cat,
  value,
  onChange,
  notifySupervisor,
}: Props) => {
  const isPreset = cat.presets.includes(value);

  return (
    <div className="relative rounded-2xl border border-primary/40 bg-card p-4 shadow-soft">
      {notifySupervisor && (
        <label className="absolute right-3 top-3 z-10 flex cursor-pointer items-center gap-1.5">
          <Checkbox
            checked={notifySupervisor.checked}
            onCheckedChange={(checked) =>
              notifySupervisor.onChange(checked === true)
            }
          />
          <span className="text-[11px] font-medium text-foreground whitespace-nowrap">
            发送给上级
          </span>
        </label>
      )}
      <div
        className={`text-center text-[11px] text-muted-foreground ${
          notifySupervisor ? "pr-20" : ""
        }`}
      >
        {cat.desc}
      </div>
      <div className="mt-2 text-center text-2xl font-bold text-foreground">
        {cat.formatValue(value)}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {cat.presets.map((p) => {
          const selected = value === p;
          return (
            <button
              key={String(p)}
              type="button"
              onClick={() => onChange(p)}
              className={`flex-1 min-w-[60px] rounded-lg border px-2 py-2 text-xs font-medium transition-base ${
                selected
                  ? "border-transparent bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-background text-foreground active:scale-95"
              }`}
            >
              {p}
              {cat.unit !== "时刻" && (
                <span
                  className={`ml-0.5 text-[10px] ${
                    selected ? "opacity-80" : "text-muted-foreground"
                  }`}
                >
                  {cat.unit === "小时" ? "h" : cat.unit}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-2">
        <span className="text-xs text-muted-foreground">自定义</span>
        {cat.inputType === "number" ? (
          <input
            type="number"
            min={cat.min}
            max={cat.max}
            value={typeof value === "number" ? value : ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isNaN(n)) return;
              const clamped = Math.min(
                cat.max ?? n,
                Math.max(cat.min ?? n, n),
              );
              onChange(clamped);
            }}
            placeholder={String(cat.defaultValue)}
            className="flex-1 bg-transparent text-right text-sm font-medium text-foreground focus:outline-none"
          />
        ) : (
          <input
            type="text"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="如 23:00 或 次日 00:30"
            className="flex-1 bg-transparent text-right text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        )}
        <span className="text-xs text-muted-foreground">{cat.unit}</span>
      </div>
      {!isPreset && cat.inputType === "number" && (
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          范围 {cat.min}-{cat.max} {cat.unit}
        </p>
      )}
    </div>
  );
};

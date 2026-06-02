import {
  MobileDateTimeField,
  type MobileDateTimeValue,
} from "@/components/ui/mobile-date-field";
import {
  ENROLL_DEADLINE_HOUR_PRESETS,
  type EnrollDeadlineFormMode,
  type EnrollDeadlineFormValue,
} from "@/lib/enrollDeadline";
import { cn } from "@/lib/utils";

type Props = {
  value: EnrollDeadlineFormValue;
  onChange: (value: EnrollDeadlineFormValue) => void;
  referenceStartAt?: string;
  readOnly?: boolean;
  readOnlyLabel?: string;
};

const MODE_OPTIONS: { value: EnrollDeadlineFormMode; label: string }[] = [
  { value: "none", label: "不限制" },
  { value: "fixed", label: "指定时间" },
  { value: "hours_before_start", label: "开始前" },
];

const EnrollDeadlineField = ({
  value,
  onChange,
  referenceStartAt,
  readOnly,
  readOnlyLabel,
}: Props) => {
  if (readOnly) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm">
        <span className="shrink-0 text-muted-foreground">报名截止</span>
        <span className="min-w-0 text-foreground">{readOnlyLabel || "不限制"}</span>
      </div>
    );
  }

  const patch = (partial: Partial<EnrollDeadlineFormValue>) =>
    onChange({ ...value, ...partial });

  const patchFixed = (fixed: MobileDateTimeValue) =>
    onChange({ ...value, fixed });

  const refDate = referenceStartAt
    ? referenceStartAt.slice(0, 10)
    : undefined;

  return (
    <section className="space-y-2.5 rounded-xl border border-border/60 bg-card p-3">
      <div>
        <span className="text-sm font-medium text-foreground">报名截止</span>
        <p className="mt-0.5 text-sm text-muted-foreground">选填，不设置则按活动开始时间截止</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => patch({ mode: opt.value })}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              value.mode === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value.mode === "fixed" && (
        <MobileDateTimeField
          label="截止时间"
          value={value.fixed}
          onChange={patchFixed}
          maxDate={refDate}
        />
      )}

      {value.mode === "hours_before_start" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {ENROLL_DEADLINE_HOUR_PRESETS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => patch({ hoursBefore: String(h) })}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  value.hoursBefore === String(h)
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {h} 小时
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-muted-foreground">自定义</span>
            <input
              type="number"
              min={1}
              max={720}
              value={value.hoursBefore}
              onChange={(e) => patch({ hoursBefore: e.target.value })}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="小时数"
            />
            <span className="shrink-0 text-muted-foreground">小时</span>
          </label>
          <p className="text-sm text-muted-foreground">
            以活动开始时间为基准，开始前停止接受报名
          </p>
        </div>
      )}
    </section>
  );
};

export default EnrollDeadlineField;

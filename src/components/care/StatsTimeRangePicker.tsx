import React, { useState } from "react";
import { CalendarRange, CheckCircle2, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileDateField } from "@/components/ui/mobile-date-field";
import {
  formatLocalIsoDate,
  type StatsTimeRange,
  type StatsTimeRangePreset,
} from "@/data/humanityCare";
import { cn } from "@/lib/utils";

const quickPresets: {
  preset: StatsTimeRangePreset;
  label: string;
  desc: string;
}[] = [
  { preset: "7d", label: "近 7 日", desc: "包含今天在内的最近 7 天" },
  { preset: "30d", label: "近 30 日", desc: "最近 30 天数据" },
  { preset: "month", label: "本月", desc: "当月 1 日至今" },
  { preset: "year", label: "本年度", desc: "当年 1/1 至今" },
];

const activePreset = (value: StatsTimeRange, draft: StatsTimeRange) =>
  draft.preset === "custom" ? draft : value;

type Props = {
  value: StatsTimeRange;
  onChange: (v: StatsTimeRange) => void;
  trigger: React.ReactNode;
};

export const StatsTimeRangePicker = ({ value, onChange, trigger }: Props) => {
  const year = new Date().getFullYear();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const pickPreset = (preset: StatsTimeRangePreset) => {
    if (preset === "custom") {
      const today = formatLocalIsoDate();
      const monthStart = `${year}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
      setDraft({ preset: "custom", start: monthStart, end: today });
    } else {
      onChange({ preset });
      setOpen(false);
    }
  };

  const confirmCustom = () => {
    if (!draft.start || !draft.end) return;
    if (draft.start > draft.end) return;
    onChange({ preset: "custom", start: draft.start, end: draft.end });
    setOpen(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(value);
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-left text-base">统计时间范围</SheetTitle>
        </SheetHeader>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {quickPresets.map((opt) => {
            const selected = activePreset(value, draft).preset === opt.preset;
            return (
              <button
                key={opt.preset}
                type="button"
                onClick={() => pickPreset(opt.preset)}
                className={cn(
                  "rounded-full px-1 py-2 text-center text-xs font-medium transition-base active:scale-95",
                  selected
                    ? "bg-accent text-accent-foreground shadow-soft"
                    : "bg-secondary text-foreground",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {activePreset(value, draft).preset === "custom"
            ? "指定起止日期"
            : quickPresets.find(
                (o) => o.preset === activePreset(value, draft).preset,
              )?.desc}
        </p>

        <button
          type="button"
          onClick={() => pickPreset("custom")}
          className={cn(
            "mt-3 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-base",
            draft.preset === "custom"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary/60 text-foreground active:bg-secondary",
          )}
        >
          <span className="flex min-w-0 flex-col">
            <span>自定义</span>
            <span className="text-[11px] opacity-80">指定起止日期</span>
          </span>
          {draft.preset === "custom" && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          )}
        </button>
        {draft.preset === "custom" && (
          <div className="mt-4 space-y-2">
            <MobileDateField
              label="开始日期"
              value={draft.start ?? ""}
              max={draft.end}
              onChange={(start) =>
                setDraft((d) => ({ ...d, preset: "custom", start }))
              }
            />
            <MobileDateField
              label="结束日期"
              value={draft.end ?? ""}
              min={draft.start}
              onChange={(end) =>
                setDraft((d) => ({ ...d, preset: "custom", end }))
              }
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                confirmCustom();
              }}
              disabled={
                !draft.start || !draft.end || draft.start > draft.end
              }
              className="relative z-10 w-full rounded-full gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-base active:scale-95 disabled:opacity-40"
            >
              确定
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

/** 数据统计 Tab 顶部筛选条（须 forwardRef 供 SheetTrigger asChild 使用） */
export const StatsTimeRangeBar = React.forwardRef<
  HTMLButtonElement,
  {
    summary: { text: string; sub: string };
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ summary, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    {...props}
    className={cn(
      "flex w-full items-center justify-between rounded-2xl bg-card px-3.5 py-2.5 shadow-soft transition-base active:scale-[0.99]",
      className,
    )}
  >
    <div className="flex min-w-0 items-center gap-2.5 text-left">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary"
        aria-hidden
      >
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground">统计时间</div>
        <div className="truncate text-sm font-semibold text-foreground">
          {summary.text}
        </div>
        <div className="truncate text-[10px] text-muted-foreground">
          {summary.sub}
        </div>
      </div>
    </div>
    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
  </button>
));
StatsTimeRangeBar.displayName = "StatsTimeRangeBar";

export default StatsTimeRangePicker;

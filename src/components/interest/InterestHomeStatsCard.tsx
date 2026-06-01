import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HOME_STATS_PERIOD_OPTIONS,
  type HomeStatsPeriod,
  type InterestHomeStats,
} from "@/lib/interestHomeStats";
import { cn } from "@/lib/utils";

type Props = {
  stats: InterestHomeStats;
  period: HomeStatsPeriod;
  onPeriodChange: (period: HomeStatsPeriod) => void;
  title?: string;
  className?: string;
};

const InterestHomeStatsCard = ({
  stats,
  period,
  onPeriodChange,
  title = "数据概览",
  className,
}: Props) => {
  const navigate = useNavigate();
  const columns = stats.columns ?? stats.items.length;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current =
    HOME_STATS_PERIOD_OPTIONS.find((option) => option.key === period) ??
    HOME_STATS_PERIOD_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const selectPeriod = (next: HomeStatsPeriod) => {
    setOpen(false);
    if (next !== period) onPeriodChange(next);
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <div ref={rootRef} className="relative shrink-0">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label="统计周期"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 py-1.5 pl-3 pr-2 text-sm font-medium text-foreground transition-base active:scale-[0.98]"
          >
            <span>{current.label}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
              strokeWidth={2}
            />
          </button>

          {open && (
            <ul
              role="listbox"
              aria-label="统计周期"
              className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[112px] overflow-hidden rounded-xl border border-border/60 bg-background py-1 shadow-lg"
            >
              {HOME_STATS_PERIOD_OPTIONS.map((option) => {
                const active = option.key === period;
                return (
                  <li key={option.key} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => selectPeriod(option.key)}
                      className={cn(
                        "flex w-full whitespace-nowrap px-3 py-2.5 text-left text-sm",
                        active
                          ? "bg-primary/5 font-medium text-foreground"
                          : "text-foreground active:bg-secondary/60",
                      )}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-1.5 rounded-2xl bg-secondary/30 p-2",
          columns === 4 ? "grid-cols-4" : "grid-cols-3",
        )}
      >
        {stats.items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.to)}
            className="flex flex-col items-center rounded-xl px-1 py-3 transition-base active:scale-[0.97]"
          >
            <span className="text-2xl font-bold tabular-nums text-primary">
              {item.value}
            </span>
            <span className="mt-1 text-center text-xs leading-snug text-muted-foreground">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {stats.todos && stats.todos.length > 0 && (
        <div className="flex items-center gap-1 rounded-xl border border-amber-200/80 bg-amber-50/80 px-2.5 py-2 dark:border-amber-900/50 dark:bg-amber-950/30">
          <span className="shrink-0 text-xs text-amber-700 dark:text-amber-200">
            待处理
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-0.5">
            {stats.todos.map((todo, index) => (
              <span key={todo.key} className="inline-flex items-center">
                {index > 0 && (
                  <span className="mx-1 text-xs text-amber-600/60">·</span>
                )}
                <button
                  type="button"
                  onClick={() => navigate(todo.to)}
                  className="text-xs font-medium text-amber-800 underline-offset-2 active:underline dark:text-amber-100"
                >
                  {todo.label}
                </button>
              </span>
            ))}
          </div>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-amber-600/70" />
        </div>
      )}
    </div>
  );
};

export default InterestHomeStatsCard;

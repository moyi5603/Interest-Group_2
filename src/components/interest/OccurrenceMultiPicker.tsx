import { useMemo } from "react";
import type { GroupActivity } from "@/data/interestTypes";
import { Check } from "lucide-react";
import {
  ENROLLMENT_PICKER_SESSION_LIMIT,
  formatPickerMonthGroup,
  formatPickerSlotDateLine,
  formatPickerSlotTimeLine,
  type PickerOccurrenceRow,
} from "@/lib/occurrenceEnrollmentPicker";
import { cn } from "@/lib/utils";

type Props = {
  activity: GroupActivity;
  rows: PickerOccurrenceRow[];
  selectedIds: Set<string>;
  onToggle: (occurrenceId: string, checked: boolean) => void;
  /** 未纳入列表的后续场次数 */
  beyondCount?: number;
};

const OccurrenceMultiPicker = ({
  activity,
  rows,
  selectedIds,
  onToggle,
  beyondCount = 0,
}: Props) => {
  const selectable = rows.filter((r) => r.state === "selectable");
  const enrolled = rows.filter((r) => r.state === "enrolled");
  const full = rows.filter((r) => r.state === "full");

  const groupedSelectable = useMemo(() => {
    const map = new Map<string, PickerOccurrenceRow[]>();
    for (const row of selectable) {
      const key = formatPickerMonthGroup(row.occurrence.startAt);
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [selectable]);

  const selectedCount = selectedIds.size;

  const selectAll = () => {
    for (const row of selectable) {
      if (!selectedIds.has(row.occurrence.id)) {
        onToggle(row.occurrence.id, true);
      }
    }
  };

  const clearAll = () => {
    for (const id of selectedIds) {
      onToggle(id, false);
    }
  };

  const renderSlotButton = (row: PickerOccurrenceRow) => {
    const id = row.occurrence.id;
    const selected = selectedIds.has(id);
    const isFull = row.state === "full";
    const disabled = row.state !== "selectable";

    return (
      <button
        key={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) onToggle(id, !selected);
        }}
        className={cn(
          "relative flex min-h-[3.25rem] flex-col items-start justify-center rounded-md border px-1.5 py-1.5 text-left transition-all active:scale-[0.98]",
          disabled && "cursor-not-allowed opacity-50",
          selected
            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
            : disabled
              ? "border-border/60 bg-muted/40"
              : "border-border bg-card",
        )}
      >
        {activity.activityKind === "series" && row.seriesIndex != null && (
          <span className="mb-0.5 text-sm font-medium leading-none text-primary">
            第{row.seriesIndex + 1}场
          </span>
        )}
        <span className="text-sm font-semibold leading-tight text-foreground">
          {formatPickerSlotDateLine(row.occurrence.startAt)}
        </span>
        <span className="mt-0.5 text-sm leading-tight text-muted-foreground">
          {formatPickerSlotTimeLine(
            row.occurrence.startAt,
            row.occurrence.endAt,
          )}
        </span>
        {isFull && (
          <span className="absolute right-1 top-1 rounded bg-muted px-1 py-px text-xs text-muted-foreground">
            满
          </span>
        )}
        {selected && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        )}
      </button>
    );
  };

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        暂无可报名的场次
      </p>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="shrink-0 text-sm text-muted-foreground">
        展示最近 {ENROLLMENT_PICKER_SESSION_LIMIT} 场，可多选
      </p>

      {enrolled.length > 0 && (
        <div className="mt-3 shrink-0">
          <p className="mb-1.5 text-sm font-medium text-muted-foreground">
            已报名
          </p>
          <div className="flex flex-wrap gap-1.5">
            {enrolled.map((row) => (
              <span
                key={row.occurrence.id}
                className="rounded-full bg-secondary px-2.5 py-1 text-sm text-foreground"
              >
                {activity.activityKind === "series" &&
                row.seriesIndex != null
                  ? `第${row.seriesIndex + 1}场 `
                  : ""}
                {formatPickerSlotDateLine(row.occurrence.startAt)}
              </span>
            ))}
          </div>
        </div>
      )}

      {selectable.length > 0 && (
        <div className="mt-3 flex shrink-0 items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            {selectedCount > 0
              ? `已选 ${selectedCount} 场`
              : `可选 ${selectable.length} 场`}
          </span>
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={selectAll}
              className="font-medium text-primary active:opacity-70"
            >
              全选
            </button>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-muted-foreground active:opacity-70"
              >
                清空
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1">
        {groupedSelectable.map(([month, monthRows]) => (
          <section key={month} className="mb-4 last:mb-0">
            <p className="sticky top-0 z-[1] mb-2 bg-background py-0.5 text-sm font-medium text-muted-foreground">
              {month}
            </p>
            <div className="grid grid-cols-4 gap-1">
              {monthRows.map(renderSlotButton)}
            </div>
          </section>
        ))}

        {full.length > 0 && (
          <section className="mb-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              名额已满
            </p>
            <div className="grid grid-cols-4 gap-1">{full.map(renderSlotButton)}</div>
          </section>
        )}

        {selectable.length === 0 && enrolled.length === 0 && full.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            最近 {ENROLLMENT_PICKER_SESSION_LIMIT} 场内暂无可选
          </p>
        )}
      </div>

      {beyondCount > 0 && (
        <p className="mt-2 shrink-0 text-center text-sm text-muted-foreground">
          更晚场次暂不显示
        </p>
      )}
    </div>
  );
};

export default OccurrenceMultiPicker;

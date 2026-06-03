import { useMemo } from "react";
import type { GroupActivity } from "@/data/interestTypes";
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
  /** 取消报名：仅展示已报场次，取消勾选即取消 */
  cancelMode?: boolean;
};

const OccurrenceMultiPicker = ({
  activity,
  rows,
  selectedIds,
  onToggle,
  beyondCount = 0,
  cancelMode = false,
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

  const groupedCancelRows = useMemo(() => {
    const map = new Map<string, PickerOccurrenceRow[]>();
    for (const row of rows) {
      const key = formatPickerMonthGroup(row.occurrence.startAt);
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [rows]);

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
    const selected = cancelMode
      ? selectedIds.has(id)
      : selectedIds.has(id) || row.state === "enrolled";
    const isFull = row.state === "full";
    const disabled =
      !cancelMode && row.state !== "selectable" && row.state !== "enrolled";
    const cap = row.occurrence.capacity;
    const remain =
      cap != null ? Math.max(0, cap - row.occurrence.enrollCount) : null;
    const statusText = cancelMode
      ? selected
        ? "已报名"
        : "将取消"
      : selected
        ? "已报名"
        : isFull
          ? "已满员"
          : remain != null
            ? `余 ${remain} 位`
            : null;

    return (
      <button
        key={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) onToggle(id, !selectedIds.has(id));
        }}
        className={cn(
          "relative flex aspect-square min-h-0 flex-col items-center justify-center rounded-[13px] px-1 py-1.5 text-center transition-all active:scale-[0.98]",
          disabled && "cursor-not-allowed opacity-45",
          selected
            ? "border-[1.5px] border-primary bg-primary/10"
            : "border-[1.5px] border-transparent bg-secondary",
        )}
      >
        {activity.activityKind === "series" && row.seriesIndex != null && (
          <span className="mb-0.5 text-[9px] font-medium leading-none text-primary">
            第{row.seriesIndex + 1}场
          </span>
        )}
        <span className="text-xs font-extrabold leading-tight text-foreground">
          {formatPickerSlotDateLine(row.occurrence.startAt)}
        </span>
        <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
          {formatPickerSlotTimeLine(
            row.occurrence.startAt,
            row.occurrence.endAt,
          )}
        </span>
        {statusText && (
          <span
            className={cn(
              "mt-0.5 text-[10px] font-bold leading-tight",
              cancelMode && !selected
                ? "text-muted-foreground"
                : selected
                  ? "text-primary"
                  : isFull
                    ? "text-muted-foreground"
                    : "text-emerald-600",
            )}
          >
            {statusText}
          </span>
        )}
      </button>
    );
  };

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {cancelMode ? "暂无已报名场次" : "暂无可报名的场次"}
      </p>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!cancelMode && (
        <p className="shrink-0 text-xs text-muted-foreground">
          展示最近 {ENROLLMENT_PICKER_SESSION_LIMIT} 场，可多选
        </p>
      )}

      {!cancelMode && enrolled.length > 0 && (
        <div className="mt-2 shrink-0">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            已报名
          </p>
          <div className="flex flex-wrap gap-1">
            {enrolled.map((row) => (
              <span
                key={row.occurrence.id}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground"
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

      {!cancelMode && selectable.length > 0 && (
        <div className="mt-2 flex shrink-0 items-center justify-between gap-2">
          <span className="text-xs font-medium text-foreground">
            {selectedCount > 0
              ? `已选 ${selectedCount} 场`
              : `可选 ${selectable.length} 场`}
          </span>
          <div className="flex gap-2 text-xs">
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

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1",
          cancelMode ? "mt-0" : "mt-2",
        )}
      >
        {(cancelMode ? groupedCancelRows : groupedSelectable).map(
          ([month, monthRows]) => (
          <section key={month} className="mb-3 last:mb-0">
            <p className="sticky top-0 z-[1] mb-1 bg-background py-0.5 text-xs font-medium text-muted-foreground">
              {month}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {monthRows.map(renderSlotButton)}
            </div>
          </section>
        ))}

        {!cancelMode && full.length > 0 && (
          <section className="mb-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              名额已满
            </p>
            <div className="grid grid-cols-4 gap-1.5">{full.map(renderSlotButton)}</div>
          </section>
        )}

        {!cancelMode &&
          selectable.length === 0 &&
          enrolled.length === 0 &&
          full.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            最近 {ENROLLMENT_PICKER_SESSION_LIMIT} 场内暂无可选
          </p>
        )}
      </div>

      {!cancelMode && beyondCount > 0 && (
        <p className="mt-2 shrink-0 text-center text-sm text-muted-foreground">
          更晚场次暂不显示
        </p>
      )}
    </div>
  );
};

export default OccurrenceMultiPicker;

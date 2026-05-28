import { resolveActivityCover } from "@/data/interestImages";
import ActivityCover from "@/components/interest/ActivityCover";
import { MapPin, Pencil } from "lucide-react";
import type { GroupActivity } from "@/data/interestTypes";
import type { ActivityOccurrence } from "@/data/interestTypes";
import {
  formatTimeRange,
  getActivityPhase,
} from "@/lib/interestOccurrences";
import { cn } from "@/lib/utils";

type Props = {
  activity: GroupActivity;
  occurrence?: ActivityOccurrence;
  onOpen: () => void;
  showEnroll?: boolean;
  enrolled?: boolean;
  onEnroll?: () => void;
  compact?: boolean;
  /** 紧凑卡片稍大字号（首页等） */
  comfortable?: boolean;
  /** 组织者可编辑时，在卡片上显示编辑图标 */
  editable?: boolean;
  /** 卡片顶部辅助信息（如「我发起」） */
  meta?: string;
  /** 覆盖标题，默认 activity.title */
  title?: string;
  /** 覆盖时间行展示（周期/系列活动用活动级文案，不展示各场次日期） */
  scheduleLabel?: string;
};

const ActivityCard = ({
  activity,
  occurrence,
  onOpen,
  showEnroll,
  enrolled,
  onEnroll,
  compact = false,
  comfortable = true,
  editable = false,
  meta,
  title,
  scheduleLabel,
}: Props) => {
  const displayTitle = title ?? activity.title;
  const start = occurrence?.startAt ?? activity.startAt;
  const end = occurrence?.endAt ?? activity.endAt;
  const terminated = activity.status === "cancelled";
  const phase = terminated ? "已终止" : getActivityPhase(start, end);

  const phaseClass = cn(
    "shrink-0 rounded font-medium",
    compact && comfortable
      ? "px-2 py-0.5 text-xs"
      : "px-1.5 py-0.5 text-[10px]",
    phase === "进行中" && "bg-emerald-500/15 text-emerald-700",
    phase === "未开始" && "bg-blue-500/15 text-blue-700",
    phase === "已结束" && "bg-muted text-muted-foreground",
    phase === "已终止" && "bg-destructive/10 text-destructive",
  );

  const cover = resolveActivityCover(activity);

  if (compact) {
    const metaText = comfortable ? "text-xs" : "text-[10px]";
    const titleText = comfortable ? "text-sm" : "text-xs";

    return (
      <article className="overflow-hidden rounded-xl border border-border/60 bg-card transition-base">
        {meta && (
          <p
            className={cn(
              "border-b border-border/40 px-3 py-2 text-muted-foreground",
              metaText,
            )}
          >
            {meta}
          </p>
        )}
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "flex w-full items-center gap-2.5 text-left active:scale-[0.99]",
            comfortable ? "p-2.5" : "p-2",
          )}
        >
          <ActivityCover
            coverUrl={cover}
            className={cn(
              "shrink-0 rounded-lg",
              comfortable ? "h-16 w-16" : "h-14 w-14",
              (phase === "已结束" || terminated) && "opacity-50",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3
                className={cn(
                  "line-clamp-1 flex-1 font-semibold text-foreground",
                  titleText,
                )}
              >
                {displayTitle}
              </h3>
              <span className={phaseClass}>{phase}</span>
            </div>
            {(scheduleLabel || start) && (
              <p
                className={cn(
                  "mt-0.5 line-clamp-1 text-muted-foreground",
                  metaText,
                )}
              >
                {scheduleLabel ??
                  (start ? formatTimeRange(start, end) : null)}
              </p>
            )}
            {activity.location && (
              <div
                className={cn(
                  "mt-0.5 flex min-w-0 items-center gap-1 text-muted-foreground",
                  metaText,
                )}
              >
                <MapPin
                  className={cn(
                    "shrink-0",
                    comfortable ? "h-3.5 w-3.5" : "h-3 w-3",
                  )}
                />
                <span className="min-w-0 flex-1 truncate">
                  {activity.location}
                </span>
              </div>
            )}
          </div>
          {editable && phase !== "已结束" && !terminated && (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <Pencil className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
        {showEnroll && (
          <div className="border-t border-border/60 px-2 py-1.5">
            <button
              type="button"
              disabled={enrolled || phase === "已结束" || terminated}
              onClick={(e) => {
                e.stopPropagation();
                onEnroll?.();
              }}
              className={cn(
                "w-full rounded-full font-medium",
                comfortable ? "py-2 text-xs" : "py-1.5 text-[11px]",
                enrolled || phase === "已结束" || terminated
                  ? "bg-secondary text-muted-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {enrolled ? "已报名" : "报名"}
            </button>
          </div>
        )}
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl bg-card shadow-soft transition-base active:scale-[0.99]">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <ActivityCover coverUrl={cover} className="relative h-24">
          {(phase === "已结束" || terminated) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
              {terminated ? "已终止" : "已结束"}
            </div>
          )}
        </ActivityCover>
        <div className="space-y-1 p-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "line-clamp-2 flex-1 font-semibold text-foreground",
                comfortable ? "text-base" : "text-sm",
              )}
            >
              {displayTitle}
            </h3>
            <span className={phaseClass}>{phase}</span>
          </div>
          {start && (
            <p
              className={cn(
                "text-muted-foreground",
                comfortable ? "text-xs" : "text-[11px]",
              )}
            >
              {formatTimeRange(start, end)}
            </p>
          )}
          {activity.location && (
            <div
              className={cn(
                "flex min-w-0 items-center gap-1 text-muted-foreground",
                comfortable ? "text-xs" : "text-[11px]",
              )}
            >
              <MapPin
                className={cn(
                  "shrink-0",
                  comfortable ? "h-3.5 w-3.5" : "h-3 w-3",
                )}
              />
              <span className="min-w-0 flex-1 truncate">
                {activity.location}
              </span>
            </div>
          )}
        </div>
      </button>
      {showEnroll && (
        <div className="border-t border-border px-2.5 py-1.5">
          <button
            type="button"
            disabled={enrolled || phase === "已结束" || terminated}
            onClick={(e) => {
              e.stopPropagation();
              onEnroll?.();
            }}
            className={cn(
              "w-full rounded-full py-1.5 text-xs font-medium",
              enrolled || phase === "已结束" || terminated
                ? "bg-secondary text-muted-foreground"
                : "bg-primary text-primary-foreground active:scale-[0.98]",
            )}
          >
            {enrolled ? "已报名" : terminated ? "已终止" : "立即报名"}
          </button>
        </div>
      )}
    </article>
  );
};

export default ActivityCard;

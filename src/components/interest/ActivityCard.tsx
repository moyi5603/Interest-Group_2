import { resolveActivityCover } from "@/data/interestImages";
import ActivityCover from "@/components/interest/ActivityCover";
import { Heart, MapPin, MessageCircle, Pencil, Star } from "lucide-react";
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
  /** 组织者可编辑时，在卡片上显示编辑图标 */
  editable?: boolean;
  /** 卡片顶部辅助信息，如报名时间、所属小组 */
  meta?: string;
};

const ActivityCard = ({
  activity,
  occurrence,
  onOpen,
  showEnroll,
  enrolled,
  onEnroll,
  compact = false,
  editable = false,
  meta,
}: Props) => {
  const start = occurrence?.startAt ?? activity.startAt;
  const end = occurrence?.endAt ?? activity.endAt;
  const phase = getActivityPhase(start, end);

  const phaseClass = cn(
    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
    phase === "进行中" && "bg-emerald-500/15 text-emerald-700",
    phase === "未开始" && "bg-blue-500/15 text-blue-700",
    phase === "已结束" && "bg-muted text-muted-foreground",
  );

  const cover = resolveActivityCover(activity);

  if (compact) {
    return (
      <article className="overflow-hidden rounded-xl border border-border/60 bg-card transition-base">
        {meta && (
          <p className="border-b border-border/40 px-2.5 py-1.5 text-[10px] text-muted-foreground">
            {meta}
          </p>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center gap-2.5 p-2 text-left active:scale-[0.99]"
        >
          <ActivityCover
            coverUrl={cover}
            className={cn(
              "h-14 w-14 shrink-0 rounded-lg",
              phase === "已结束" && "opacity-50",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="line-clamp-1 flex-1 text-xs font-semibold text-foreground">
                {activity.title}
              </h3>
              <span className={phaseClass}>{phase}</span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
              {start && formatTimeRange(start, end)}
              {activity.location && (
                <>
                  {" · "}
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="inline h-2.5 w-2.5" />
                    {activity.location}
                  </span>
                </>
              )}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <Heart className="h-2.5 w-2.5" />
                {activity.likeCount ?? 0}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <MessageCircle className="h-2.5 w-2.5" />
                {activity.commentCount ?? 0}
              </span>
            </div>
          </div>
          {editable && phase !== "已结束" && (
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
              disabled={enrolled || phase === "已结束"}
              onClick={(e) => {
                e.stopPropagation();
                onEnroll?.();
              }}
              className={cn(
                "w-full rounded-full py-1.5 text-[11px] font-medium",
                enrolled || phase === "已结束"
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
          {phase === "已结束" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
              已结束
            </div>
          )}
        </ActivityCover>
        <div className="space-y-1 p-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-foreground">
              {activity.title}
            </h3>
            <span className={phaseClass}>{phase}</span>
          </div>
          {start && (
            <p className="text-[11px] text-muted-foreground">
              {formatTimeRange(start, end)}
            </p>
          )}
          {activity.location && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{activity.location}</span>
            </p>
          )}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5">
              <Heart className="h-3 w-3" />
              {activity.likeCount ?? 0}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3" />
              {activity.favoriteCount ?? 0}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <MessageCircle className="h-3 w-3" />
              {activity.commentCount ?? 0}
            </span>
          </div>
        </div>
      </button>
      {showEnroll && (
        <div className="border-t border-border px-2.5 py-1.5">
          <button
            type="button"
            disabled={enrolled || phase === "已结束"}
            onClick={(e) => {
              e.stopPropagation();
              onEnroll?.();
            }}
            className={cn(
              "w-full rounded-full py-1.5 text-xs font-medium",
              enrolled || phase === "已结束"
                ? "bg-secondary text-muted-foreground"
                : "bg-primary text-primary-foreground active:scale-[0.98]",
            )}
          >
            {enrolled ? "已报名" : "立即报名"}
          </button>
        </div>
      )}
    </article>
  );
};

export default ActivityCard;

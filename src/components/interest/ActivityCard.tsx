import { resolveActivityCover } from "@/data/interestImages";
import ActivityCover from "@/components/interest/ActivityCover";
import GroupAvatar from "@/components/interest/GroupAvatar";
import EnrolleeAvatarStack from "@/components/interest/EnrolleeAvatarStack";
import LikeCountBadge from "@/components/interest/LikeCountBadge";
import EnrollDeadlineMeta from "@/components/interest/EnrollDeadlineMeta";
import { MapPin, Pencil, CalendarDays } from "lucide-react";
import type { GroupActivity } from "@/data/interestTypes";
import type { ActivityOccurrence } from "@/data/interestTypes";
import type { ActivityEnrolleeInfo } from "@/data/interestGroups";
import {
  formatTimeRange,
  getActivityPhase,
} from "@/lib/interestOccurrences";
import { isEnrollClosingSoon } from "@/lib/enrollDeadline";
import { cn } from "@/lib/utils";

type Props = {
  activity: GroupActivity;
  occurrence?: ActivityOccurrence;
  onOpen: () => void;
  showEnroll?: boolean;
  enrolled?: boolean;
  onEnroll?: () => void;
  compact?: boolean;
  /** 无底色描边（首页等轻量列表） */
  flat?: boolean;
  /** 紧凑卡片稍大字号（首页等） */
  comfortable?: boolean;
  /** 组织者可编辑时，在卡片上显示编辑图标 */
  editable?: boolean;
  /** 卡片顶部辅助信息（如「我发起」） */
  meta?: string;
  /** 覆盖标题；未传 title 时若提供 groupName 则为「小组名：活动名」 */
  title?: string;
  groupName?: string;
  /** 氛围卡片：小组头像 */
  groupAvatarUrl?: string;
  /** 覆盖时间行展示（周期/系列活动用活动级文案，不展示各场次日期） */
  scheduleLabel?: string;
  /** 首页等：封面主导、标题叠在封面上的氛围卡片 */
  featured?: boolean;
  /** 氛围卡片：报名人员头像预览 */
  enrolleePreview?: {
    enrollees: ActivityEnrolleeInfo[];
    total: number;
  };
  /** 展示「报名即将截止」标签（活动状态标签前） */
  showEnrollClosingSoon?: boolean;
};

const ActivityCard = ({
  activity,
  occurrence,
  onOpen,
  showEnroll,
  enrolled,
  onEnroll,
  compact = false,
  flat = false,
  comfortable = true,
  editable = false,
  meta,
  title,
  groupName,
  groupAvatarUrl,
  scheduleLabel,
  featured = false,
  enrolleePreview,
  showEnrollClosingSoon = false,
}: Props) => {
  const displayTitle =
    title ??
    (groupName && !featured ? `${groupName}：${activity.title}` : activity.title);
  const start = occurrence?.startAt ?? activity.startAt;
  const end = occurrence?.endAt ?? activity.endAt;
  const terminated = activity.status === "cancelled";
  const phase = terminated ? "已终止" : getActivityPhase(start, end);
  const enrollClosingSoon =
    showEnrollClosingSoon && isEnrollClosingSoon(activity);

  const closingSoonClass =
    "shrink-0 rounded border border-amber-200/60 bg-amber-500/95 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm";
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

  if (featured) {
    const timeText =
      scheduleLabel ?? (start ? formatTimeRange(start, end) : null);
    const metaParts = [
      timeText,
      activity.location ? activity.location : null,
    ].filter(Boolean);

    return (
      <article className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft transition-base active:scale-[0.99]">
        {meta && (
          <p className="border-b border-border/40 px-2.5 py-1.5 text-xs text-muted-foreground">
            {meta}
          </p>
        )}
        <button type="button" onClick={onOpen} className="w-full text-left">
          <ActivityCover coverUrl={cover} className="relative h-24">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {(phase === "已结束" || terminated) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 text-sm font-medium text-white">
                {terminated ? "已终止" : "已结束"}
              </div>
            )}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
              {groupName && (
                <div className="flex min-w-0 max-w-[70%] items-center gap-1.5">
                  <GroupAvatar
                    avatarUrl={groupAvatarUrl}
                    name={groupName}
                    className="h-5 w-5 text-[10px] ring-1 ring-white/40"
                  />
                  <span className="truncate text-xs font-medium text-white drop-shadow-sm">
                    {groupName}
                  </span>
                </div>
              )}
              <div className="ml-auto flex shrink-0 items-center gap-1">
                {enrollClosingSoon && (
                  <span className={closingSoonClass}>报名即将截止</span>
                )}
                <span
                  className={cn(
                    phaseClass,
                    "border border-white/20 bg-black/30 text-white backdrop-blur-sm",
                    phase === "进行中" && "bg-emerald-500/80 text-white",
                    phase === "未开始" && "bg-primary/80 text-primary-foreground",
                  )}
                >
                  {phase}
                </span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2 pt-6">
              <h3 className="line-clamp-1 text-sm font-semibold text-white drop-shadow-sm">
                {displayTitle}
              </h3>
            </div>
          </ActivityCover>

          <div className="space-y-1.5 px-2.5 py-2">
            {metaParts.length > 0 && (
              <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3 shrink-0 text-primary" />
                <span className="min-w-0 truncate">{metaParts.join(" · ")}</span>
              </p>
            )}
            <EnrollDeadlineMeta activity={activity} className="text-xs" />
            <div className="flex items-center justify-between gap-2">
              {enrolleePreview && enrolleePreview.total > 0 ? (
                <EnrolleeAvatarStack
                  enrollees={enrolleePreview.enrollees}
                  total={enrolleePreview.total}
                />
              ) : (
                <span />
              )}
              <LikeCountBadge count={activity.likeCount} className="text-xs" />
            </div>
          </div>
        </button>
        {showEnroll && (
          <div className="border-t border-border/40 px-2.5 py-1.5">
            <button
              type="button"
              disabled={enrolled || phase === "已结束" || terminated}
              onClick={(e) => {
                e.stopPropagation();
                onEnroll?.();
              }}
              className={cn(
                "w-full rounded-full py-2 text-xs font-medium",
                enrolled || phase === "已结束" || terminated
                  ? "bg-secondary text-muted-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {enrolled ? "已报名" : terminated ? "已终止" : "报名"}
            </button>
          </div>
        )}
      </article>
    );
  }

  if (compact) {
    const metaText = comfortable ? "text-xs" : "text-[10px]";
    const titleText = comfortable ? "text-sm" : "text-xs";

    return (
      <article
        className={cn(
          "overflow-hidden transition-base",
          flat
            ? "rounded-lg"
            : "rounded-xl border border-border/60 bg-card",
        )}
      >
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
            <EnrollDeadlineMeta
              activity={activity}
              className={cn("mt-0.5", metaText)}
              iconClassName={comfortable ? "h-3.5 w-3.5" : "h-3 w-3"}
            />
            <LikeCountBadge
              count={activity.likeCount}
              className={cn("mt-1", metaText)}
            />
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
          <EnrollDeadlineMeta
            activity={activity}
            className={comfortable ? "text-xs" : "text-[11px]"}
            iconClassName={comfortable ? "h-3.5 w-3.5" : "h-3 w-3"}
          />
          <LikeCountBadge
            count={activity.likeCount}
            className={comfortable ? "text-xs" : "text-[11px]"}
          />
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

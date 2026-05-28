import { resolveGroupCover } from "@/data/interestImages";
import ActivityCover from "@/components/interest/ActivityCover";
import GroupAvatar from "@/components/interest/GroupAvatar";
import { ChevronRight, Sparkles, Users } from "lucide-react";
import { getTagsByIds } from "@/data/interestTags";
import type { InterestGroupFull } from "@/data/interestTypes";
import { isMember, CURRENT_EMPLOYEE_ID, isGroupFull } from "@/data/interestGroups";
import { cn } from "@/lib/utils";

type Props = {
  group: InterestGroupFull;
  reasons?: string[];
  onOpen: () => void;
  onJoin?: () => void;
  compact?: boolean;
  /** 紧凑卡片稍大字号（首页等） */
  comfortable?: boolean;
};

const GroupCard = ({
  group,
  reasons,
  onOpen,
  onJoin,
  compact,
  comfortable = true,
}: Props) => {
  const tags = getTagsByIds(group.tagIds).slice(0, compact ? 2 : 4);
  const joined = isMember(group.id, CURRENT_EMPLOYEE_ID);
  const full = isGroupFull(group);
  const memberLabel = `${group.memberCount} 人`;

  const cover = resolveGroupCover(group);

  if (compact) {
    const metaText = comfortable ? "text-xs" : "text-[10px]";
    const titleText = comfortable ? "text-sm" : "text-xs";
    const actionText = comfortable ? "text-xs" : "text-[10px]";
    const iconSm = comfortable ? "h-3 w-3" : "h-2.5 w-2.5";

    return (
      <article className="rounded-xl border border-border/60 bg-card transition-base active:scale-[0.99]">
        <div
          className={cn(
            "flex items-center gap-2",
            comfortable ? "p-2.5" : "p-2",
          )}
        >
          <button
            type="button"
            onClick={onOpen}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          >
            <GroupAvatar
              coverUrl={cover}
              name={group.name}
              className={comfortable ? "h-10 w-10 text-sm" : "h-9 w-9 text-sm"}
            />
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "truncate font-semibold text-foreground",
                  titleText,
                )}
              >
                {group.name}
              </h3>
              <p
                className={cn(
                  "mt-0.5 line-clamp-1 text-muted-foreground",
                  metaText,
                )}
              >
                <Users className={cn("mr-0.5 inline", iconSm)} />
                {memberLabel}
                {tags.length > 0 &&
                  ` · ${tags.map((t) => `#${t.name}`).join(" ")}`}
              </p>
              {reasons?.[0] && (
                <p
                  className={cn(
                    "mt-0.5 flex items-start gap-1 leading-snug text-primary",
                    metaText,
                  )}
                >
                  <Sparkles className={cn("mt-px shrink-0", iconSm)} />
                  <span className="line-clamp-2">{reasons[0]}</span>
                </p>
              )}
            </div>
            <ChevronRight
              className={cn(
                "shrink-0 text-muted-foreground",
                comfortable ? "h-4 w-4" : "h-4 w-4",
              )}
            />
          </button>
          {onJoin &&
            (joined ? (
              <span
                className={cn("shrink-0 text-muted-foreground", actionText)}
              >
                已加入
              </span>
            ) : full ? (
              <span
                className={cn("shrink-0 text-muted-foreground", actionText)}
              >
                已满
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin();
                }}
                className={cn(
                  "shrink-0 rounded-full bg-primary font-medium text-primary-foreground active:scale-95",
                  comfortable
                    ? "px-3 py-1.5 text-xs"
                    : "px-2.5 py-1 text-[10px]",
                )}
              >
                加入
              </button>
            ))}
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl bg-card shadow-soft transition-base active:scale-[0.99]">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <ActivityCover coverUrl={cover} className="h-24" />
        <div className="flex gap-2.5 p-2.5">
          <GroupAvatar
            coverUrl={cover}
            name={group.name}
            className="-mt-8 h-12 w-12 border-2 border-card text-base shadow-soft"
          />
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                "truncate font-semibold text-foreground",
                comfortable ? "text-base" : "text-sm",
              )}
            >
              {group.name}
            </h3>
            <p
              className={cn(
                "mt-0.5 line-clamp-1 text-muted-foreground",
                comfortable ? "text-xs" : "text-[11px]",
              )}
            >
              {group.description}
            </p>
            <div
              className={cn(
                "mt-1 flex flex-wrap items-center gap-1.5 text-muted-foreground",
                comfortable ? "text-xs" : "text-[10px]",
              )}
            >
              <span className="inline-flex items-center gap-0.5">
                <Users className={comfortable ? "h-3.5 w-3.5" : "h-3 w-3"} />
                {memberLabel}
              </span>
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-secondary px-1.5 py-0.5"
                >
                  #{t.name}
                </span>
              ))}
            </div>
            {reasons?.[0] && (
              <p
                className={cn(
                  "mt-1 flex items-start gap-1 leading-snug text-primary",
                  comfortable ? "text-xs" : "text-[10px]",
                )}
              >
                <Sparkles
                  className={cn(
                    "mt-px shrink-0",
                    comfortable ? "h-3 w-3" : "h-2.5 w-2.5",
                  )}
                />
                <span className="line-clamp-2">{reasons[0]}</span>
              </p>
            )}
          </div>
        </div>
      </button>
      {onJoin && !joined && !full && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onJoin();
          }}
          className={cn(
            "mx-2.5 mb-2.5 w-[calc(100%-1.25rem)] rounded-full bg-primary font-medium text-primary-foreground active:scale-[0.98]",
            comfortable ? "py-2 text-sm" : "py-1.5 text-xs",
          )}
        >
          加入小组
        </button>
      )}
      {onJoin && joined && (
        <p
          className={cn(
            "mb-2 text-center font-medium text-muted-foreground",
            comfortable ? "text-xs" : "text-[10px]",
          )}
        >
          已加入
        </p>
      )}
      {onJoin && !joined && full && (
        <p
          className={cn(
            "mb-2 text-center font-medium text-muted-foreground",
            comfortable ? "text-xs" : "text-[10px]",
          )}
        >
          已满员
        </p>
      )}
    </article>
  );
};

export default GroupCard;

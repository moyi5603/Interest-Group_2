import { resolveGroupCover } from "@/data/interestImages";
import ActivityCover from "@/components/interest/ActivityCover";
import GroupAvatar from "@/components/interest/GroupAvatar";
import { ChevronRight, Sparkles, Users } from "lucide-react";
import { getTagsByIds } from "@/data/interestTags";
import type { InterestGroupFull } from "@/data/interestTypes";
import { isMember, CURRENT_EMPLOYEE_ID, isGroupFull } from "@/data/interestGroups";

type Props = {
  group: InterestGroupFull;
  reasons?: string[];
  onOpen: () => void;
  onJoin?: () => void;
  compact?: boolean;
};

const GroupCard = ({
  group,
  reasons,
  onOpen,
  onJoin,
  compact,
}: Props) => {
  const tags = getTagsByIds(group.tagIds).slice(0, compact ? 2 : 4);
  const joined = isMember(group.id, CURRENT_EMPLOYEE_ID);
  const full = isGroupFull(group);
  const memberLabel = `${group.memberCount} 人`;

  const cover = resolveGroupCover(group);

  if (compact) {
    return (
      <article className="rounded-xl border border-border/60 bg-card transition-base active:scale-[0.99]">
        <div className="flex items-center gap-2 p-2">
          <button
            type="button"
            onClick={onOpen}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <GroupAvatar
              coverUrl={cover}
              name={group.name}
              className="h-9 w-9 text-sm"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xs font-semibold text-foreground">
                {group.name}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                <Users className="mr-0.5 inline h-2.5 w-2.5" />
                {memberLabel}
                {tags.length > 0 &&
                  ` · ${tags.map((t) => `#${t.name}`).join(" ")}`}
              </p>
              {reasons?.[0] && (
                <p className="mt-0.5 flex items-start gap-1 text-[10px] leading-snug text-primary">
                  <Sparkles className="mt-px h-2.5 w-2.5 shrink-0" />
                  <span className="line-clamp-2">{reasons[0]}</span>
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
          {onJoin &&
            (joined ? (
              <span className="shrink-0 text-[10px] text-muted-foreground">
                已加入
              </span>
            ) : full ? (
              <span className="shrink-0 text-[10px] text-muted-foreground">
                已满
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin();
                }}
                className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground active:scale-95"
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
            <h3 className="truncate text-sm font-semibold text-foreground">
              {group.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
              {group.description}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <Users className="h-3 w-3" />
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
              <p className="mt-1 flex items-start gap-1 text-[10px] leading-snug text-primary">
                <Sparkles className="mt-px h-2.5 w-2.5 shrink-0" />
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
          className="mx-2.5 mb-2.5 w-[calc(100%-1.25rem)] rounded-full bg-primary py-1.5 text-xs font-medium text-primary-foreground active:scale-[0.98]"
        >
          加入小组
        </button>
      )}
      {onJoin && joined && (
        <p className="mb-2 text-center text-[10px] font-medium text-muted-foreground">
          已加入
        </p>
      )}
      {onJoin && !joined && full && (
        <p className="mb-2 text-center text-[10px] font-medium text-muted-foreground">
          已满员
        </p>
      )}
    </article>
  );
};

export default GroupCard;

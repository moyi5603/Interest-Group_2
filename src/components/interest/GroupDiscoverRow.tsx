import { resolveGroupCover } from "@/data/interestImages";
import GroupAvatar from "@/components/interest/GroupAvatar";
import { Users } from "lucide-react";
import { getTagsByIds } from "@/data/interestTags";
import type { InterestGroupFull } from "@/data/interestTypes";
import { isMember, CURRENT_EMPLOYEE_ID, isGroupFull } from "@/data/interestGroups";
import { cn } from "@/lib/utils";

type Props = {
  group: InterestGroupFull;
  onOpen: () => void;
  onJoin?: () => void;
  joined?: boolean;
};

const GroupDiscoverRow = ({ group, onOpen, onJoin, joined }: Props) => {
  const tags = getTagsByIds(group.tagIds);
  const categoryLabel = tags[0]?.category;
  const isJoined = joined ?? isMember(group.id, CURRENT_EMPLOYEE_ID);
  const full = isGroupFull(group);
  const cover = resolveGroupCover(group);

  return (
    <div className="flex items-center gap-3 border-b border-border/50 py-3 last:border-b-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <GroupAvatar
          coverUrl={cover}
          name={group.name}
          rounded="full"
          className="h-12 w-12 text-base"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="truncate text-[15px] font-semibold text-foreground">
            {group.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {group.memberCount}
            </span>
            {categoryLabel && (
              <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                {categoryLabel}
              </span>
            )}
            {tags.slice(0, 2).map((t) => (
              <span
                key={t.id}
                className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {t.name}
              </span>
            ))}
          </div>
          {group.description && (
            <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">
              {group.description}
            </p>
          )}
        </div>
      </button>
      {isJoined ? (
        <span className="shrink-0 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground">
          已加入
        </span>
      ) : full ? (
        <span className="shrink-0 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground">
          已满
        </span>
      ) : (
        <button
          type="button"
          onClick={onJoin}
          className={cn(
            "shrink-0 rounded-full border border-foreground/20 px-4 py-1.5 text-sm font-medium text-foreground",
            "active:scale-95",
          )}
        >
          加入
        </button>
      )}
    </div>
  );
};

export default GroupDiscoverRow;

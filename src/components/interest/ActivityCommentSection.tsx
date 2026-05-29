import { useEffect, useMemo, useRef, useState } from "react";
import ActivityCommentItem from "@/components/interest/ActivityCommentItem";
import { interestTypography as t } from "@/components/interest/interestTypography";
import {
  isCommentLikedBy,
  sortActivityComments,
} from "@/data/activityComments";
import { CURRENT_EMPLOYEE_ID } from "@/data/interestGroups";
import type {
  ActivityComment,
  ActivityCommentSort,
} from "@/data/interestTypes";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: ActivityCommentSort; label: string }[] = [
  { value: "latest", label: "最新" },
  { value: "hottest", label: "最热" },
];

type Props = {
  comments: ActivityComment[];
  commentCount: number;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => void;
  scrollToLatest?: boolean;
  className?: string;
};

const ActivityCommentSection = ({
  comments,
  commentCount,
  onDelete,
  onLike,
  onReply,
  scrollToLatest,
  className,
}: Props) => {
  const [sort, setSort] = useState<ActivityCommentSort>("latest");
  const topRef = useRef<HTMLDivElement>(null);

  const repliesByParent = useMemo(() => {
    const map = new Map<string, ActivityComment[]>();
    for (const comment of comments) {
      if (!comment.parentId) continue;
      const list = map.get(comment.parentId) ?? [];
      list.push(comment);
      map.set(comment.parentId, list);
    }
    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    return map;
  }, [comments]);

  const sortedComments = useMemo(
    () => sortActivityComments(comments, sort),
    [comments, sort],
  );

  const isLiked = (commentId: string) =>
    isCommentLikedBy(commentId, CURRENT_EMPLOYEE_ID);

  useEffect(() => {
    if (scrollToLatest) {
      setSort("latest");
    }
  }, [scrollToLatest]);

  useEffect(() => {
    if (scrollToLatest && sort === "latest") {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollToLatest, sortedComments.length, sort]);

  return (
    <section
      className={cn(
        "space-y-3 rounded-2xl bg-card p-4 shadow-soft",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">
          评论 ({commentCount})
        </h2>
        <div
          className="flex shrink-0 rounded-full bg-secondary p-0.5"
          role="tablist"
          aria-label="评论排序"
        >
          {SORT_OPTIONS.map((option) => {
            const active = sort === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSort(option.value)}
                className={cn(
                  t.tabPill,
                  "rounded-full px-3 py-1 transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {sortedComments.length === 0 ? (
        <p className={t.emptyCompact}>暂无评论，来说第一句吧</p>
      ) : (
        <>
          <div ref={topRef} aria-hidden />
          <ul className="space-y-4">
          {sortedComments.map((comment, index) => (
            <li
              key={comment.id}
              className={cn(
                index < sortedComments.length - 1 &&
                  "border-b border-border/60 pb-4",
              )}
            >
              <ActivityCommentItem
                comment={comment}
                replies={repliesByParent.get(comment.id) ?? []}
                liked={isLiked(comment.id)}
                isReplyLiked={isLiked}
                canDelete={comment.authorId === CURRENT_EMPLOYEE_ID}
                onDelete={onDelete}
                onLike={onLike}
                onReply={onReply}
              />
            </li>
          ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default ActivityCommentSection;

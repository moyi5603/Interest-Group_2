import { useState } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import GroupAvatar from "@/components/interest/GroupAvatar";
import CommentImageGrid from "@/components/interest/CommentImageGrid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getEmployee } from "@/data/colleagueData";
import { CURRENT_EMPLOYEE_ID } from "@/data/interestGroups";
import type { ActivityComment } from "@/data/interestTypes";
import { formatCommentTime } from "@/lib/formatCommentTime";
import { cn } from "@/lib/utils";

const MAX_REPLY_LENGTH = 500;

type ReplyProps = {
  reply: ActivityComment;
  liked: boolean;
  canDelete: boolean;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
};

const ActivityCommentReplyItem = ({
  reply,
  liked,
  canDelete,
  onLike,
  onDelete,
}: ReplyProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const author = getEmployee(reply.authorId);
  if (!author) return null;

  const likeCount = reply.likeCount ?? 0;

  return (
    <>
      <div className="flex gap-2">
        <GroupAvatar
          coverUrl={author.avatarUrl}
          name={author.name}
          rounded="full"
          className="h-7 w-7 text-xs"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-foreground">
              {author.name}
              <span className="ml-1.5 font-normal text-muted-foreground">
                {author.deptName}
              </span>
            </p>
            {canDelete && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  aria-label="回复操作"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-10 mt-0.5 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteOpen(true);
                      }}
                      className="block whitespace-nowrap px-3 py-1.5 text-xs text-destructive active:bg-secondary"
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {reply.content}
          </p>

          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatCommentTime(reply.createdAt)}</span>
            <button
              type="button"
              onClick={() => onLike(reply.id)}
              className={cn(
                "inline-flex items-center gap-1 active:opacity-70",
                liked ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Heart
                className={cn("h-3.5 w-3.5", liked && "fill-current")}
              />
              {likeCount > 0 ? likeCount : "赞"}
            </button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除回复</AlertDialogTitle>
            <AlertDialogDescription>
              删除后无法恢复，确定要删除这条回复吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(reply.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

type Props = {
  comment: ActivityComment;
  replies: ActivityComment[];
  liked: boolean;
  isReplyLiked: (commentId: string) => boolean;
  canDelete: boolean;
  canReply?: boolean;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => void;
  className?: string;
};

const ActivityCommentItem = ({
  comment,
  replies,
  liked,
  isReplyLiked,
  canDelete,
  canReply = true,
  onDelete,
  onLike,
  onReply,
  className,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const author = getEmployee(comment.authorId);
  if (!author) return null;

  const likeCount = comment.likeCount ?? 0;

  const submitReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onReply(comment.id, trimmed);
    setReplyText("");
    setReplyOpen(false);
  };

  return (
    <>
      <article className={cn("flex gap-2.5", className)}>
        <GroupAvatar
          coverUrl={author.avatarUrl}
          name={author.name}
          rounded="full"
          className="h-9 w-9 text-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {author.name}
              </p>
              <p className="text-xs text-muted-foreground">{author.deptName}</p>
            </div>
            {canDelete && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  aria-label="评论操作"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-10 mt-0.5 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteOpen(true);
                      }}
                      className="block whitespace-nowrap px-3 py-1.5 text-xs text-destructive active:bg-secondary"
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {comment.content ? (
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {comment.content}
            </p>
          ) : null}

          <CommentImageGrid imageUrls={comment.imageUrls} />

          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatCommentTime(comment.createdAt)}</span>
            <button
              type="button"
              onClick={() => onLike(comment.id)}
              className={cn(
                "inline-flex items-center gap-1 active:opacity-70",
                liked ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Heart
                className={cn("h-3.5 w-3.5", liked && "fill-current")}
              />
              {likeCount > 0 ? likeCount : "赞"}
            </button>
            {canReply && (
              <button
                type="button"
                onClick={() => setReplyOpen((v) => !v)}
                className="active:text-foreground"
              >
                回复
                {replies.length > 0 ? ` ${replies.length}` : ""}
              </button>
            )}
          </div>

          {canReply && replyOpen && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={replyText}
                maxLength={MAX_REPLY_LENGTH}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`回复 ${author.name}…`}
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm outline-none ring-primary placeholder:text-muted-foreground focus:ring-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitReply();
                  }
                }}
              />
              <button
                type="button"
                disabled={!replyText.trim()}
                onClick={submitReply}
                className="shrink-0 rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground"
              >
                发送
              </button>
            </div>
          )}

          {replies.length > 0 && (
            <ul className="mt-3 space-y-3 rounded-xl bg-secondary/40 px-3 py-2.5">
              {replies.map((reply) => (
                <li key={reply.id}>
                  <ActivityCommentReplyItem
                    reply={reply}
                    liked={isReplyLiked(reply.id)}
                    canDelete={reply.authorId === CURRENT_EMPLOYEE_ID}
                    onLike={onLike}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除评论</AlertDialogTitle>
            <AlertDialogDescription>
              删除后无法恢复，确定要删除这条评论吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(comment.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ActivityCommentItem;

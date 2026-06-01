import { useCallback, useEffect, useMemo, useState } from "react";
import ActivityCommentComposerSheet from "@/components/interest/ActivityCommentComposerSheet";
import ActivityCommentSection from "@/components/interest/ActivityCommentSection";
import { CURRENT_EMPLOYEE_ID } from "@/data/interestGroups";
import {
  addGroupMoment,
  addMomentReply,
  countGroupMoments,
  deleteGroupMoment,
  groupMomentAsActivityComment,
  isMomentLikedBy,
  listGroupMoments,
  toggleMomentLike,
} from "@/data/groupMoments";
import { toast } from "@/components/ui/sonner";

type Props = {
  groupId: string;
  canPost: boolean;
  tick: number;
  onChanged: () => void;
  onRegisterComposer?: (open: (focusImages?: boolean) => void) => void;
};

const GroupMomentsPanel = ({
  groupId,
  canPost,
  tick,
  onChanged,
  onRegisterComposer,
}: Props) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [focusImages, setFocusImages] = useState(false);
  const [scrollToLatest, setScrollToLatest] = useState(false);

  const comments = useMemo(
    () => listGroupMoments(groupId).map(groupMomentAsActivityComment),
    [groupId, tick],
  );

  const commentCount = useMemo(
    () => countGroupMoments(groupId),
    [groupId, tick],
  );

  const openComposer = useCallback(
    (images = false) => {
      if (!canPost) return;
      setFocusImages(images);
      setSheetOpen(true);
    },
    [canPost],
  );

  useEffect(() => {
    onRegisterComposer?.(openComposer);
  }, [onRegisterComposer, openComposer]);

  const refresh = (scrollLatest = false) => {
    onChanged();
    setScrollToLatest(scrollLatest);
    if (scrollLatest) {
      window.setTimeout(() => setScrollToLatest(false), 800);
    }
  };

  const handleSubmit = (input: { content: string; imageUrls: string[] }) => {
    const result = addGroupMoment(groupId, CURRENT_EMPLOYEE_ID, input);
    if (!result) {
      toast.error("发布失败，请填写内容或添加图片");
      return false;
    }
    refresh(true);
    toast.success("评论已发布");
    return true;
  };

  const handleDelete = (commentId: string) => {
    if (!deleteGroupMoment(commentId, CURRENT_EMPLOYEE_ID)) {
      toast.error("删除失败");
      return;
    }
    refresh(false);
    toast.success("已删除");
  };

  const handleLike = (commentId: string) => {
    toggleMomentLike(commentId, CURRENT_EMPLOYEE_ID);
    refresh(false);
  };

  const handleReply = (parentId: string, content: string) => {
    const result = addMomentReply(
      groupId,
      parentId,
      CURRENT_EMPLOYEE_ID,
      content,
    );
    if (!result) {
      toast.error("回复失败");
      return;
    }
    refresh(false);
    toast.success("回复已发布");
  };

  return (
    <>
      <ActivityCommentSection
        comments={comments}
        commentCount={commentCount}
        onDelete={handleDelete}
        onLike={handleLike}
        onReply={handleReply}
        isLikedBy={(id) => isMomentLikedBy(id, CURRENT_EMPLOYEE_ID)}
        canReply={canPost}
        scrollToLatest={scrollToLatest}
        className="shadow-none"
      />

      {canPost && (
        <ActivityCommentComposerSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          initialFocusImages={focusImages}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default GroupMomentsPanel;

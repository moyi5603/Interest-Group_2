import { useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  CURRENT_EMPLOYEE_ID,
  getActivityById,
  getGroupById,
  getOccurrenceById,
} from "@/data/interestGroups";
import {
  deleteGroupHighlight,
  getGroupHighlightById,
} from "@/data/groupHighlights";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { canOrganizeGroup } from "@/lib/interestGroupAccess";
import { canViewGroup } from "@/lib/interestVisibility";
import {
  formatOccurrenceLabel,
  formatTimeRange,
} from "@/lib/interestOccurrences";
import { formatCommentTime } from "@/lib/formatCommentTime";
import { toast } from "@/components/ui/sonner";

const formatHighlightOccurrenceLabel = (
  activity: ReturnType<typeof getActivityById>,
  occurrence: ReturnType<typeof getOccurrenceById>,
  index?: number,
) => {
  if (!activity) return "";
  if (occurrence) {
    return `${activity.title} · ${formatOccurrenceLabel(occurrence, index)}`;
  }
  return `${activity.title} · ${formatTimeRange(activity.startAt, activity.endAt)}`;
};

const GroupHighlightDetail = () => {
  const { groupId = "", highlightId = "" } = useParams<{
    groupId: string;
    highlightId: string;
  }>();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const group = getGroupById(groupId);
  const highlight = getGroupHighlightById(highlightId);
  const visible =
    group &&
    highlight &&
    highlight.groupId === group.id &&
    canViewGroup(group, CURRENT_EMPLOYEE_ID);

  const canDelete = useMemo(
    () =>
      group && highlight
        ? canOrganizeGroup(group.id, CURRENT_EMPLOYEE_ID) &&
          group.status === "active"
        : false,
    [group, highlight],
  );

  if (!visible || !group || !highlight) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center">
        <p className="text-sm text-muted-foreground">无法查看该精彩瞬间</p>
      </div>
    );
  }

  const activity = getActivityById(highlight.activityId);
  const occurrence = getOccurrenceById(highlight.occurrenceId);
  const uploader = getEmployee(highlight.uploadedBy);

  const handleDelete = () => {
    if (!deleteGroupHighlight(highlight.id)) {
      toast.error("删除失败");
      return;
    }
    setDeleteOpen(false);
    toast.success("已删除");
    navigate(`/agents/interest-groups/${group.id}?panel=highlights`, {
      replace: true,
    });
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
        <button
          type="button"
          onClick={goBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold">
          精彩瞬间
        </h1>
        {canDelete && (
          <button
            type="button"
            aria-label="删除精彩瞬间"
            onClick={() => setDeleteOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-hide">
        <section className="rounded-2xl bg-card p-4 shadow-soft">
          <p className="text-sm font-medium text-foreground">
            {activity
              ? formatHighlightOccurrenceLabel(activity, occurrence)
              : "活动场次"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {uploader?.name ?? "管理员"} ·{" "}
            {formatCommentTime(highlight.uploadedAt)}
          </p>
          {highlight.caption && (
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {highlight.caption}
            </p>
          )}
          <CommentImageGrid
            imageUrls={highlight.imageUrls}
            alignWithComment
            className="mt-3"
          />
          <p className="mt-3 pl-[2.875rem] text-xs text-muted-foreground">
            共 {highlight.imageUrls.length} 张
          </p>
        </section>
      </main>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>删除精彩瞬间</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              删除后无法恢复，确定要删除这组照片吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 w-full">取消</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupHighlightDetail;

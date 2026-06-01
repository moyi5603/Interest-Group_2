import { useState } from "react";
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
import {
  canTerminateActivity,
  countActivityEnrollments,
  terminateActivity,
} from "@/data/interestGroups";
import type { GroupActivity } from "@/data/interestTypes";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

type Props = {
  activity: GroupActivity;
  /** 当前操作者（创建人或平台管理员） */
  actorId: string;
  onEdit: () => void;
  onTerminated: (activity: GroupActivity) => void;
  /** 未结束时可编辑 */
  canEdit?: boolean;
  /** 与评论输入同一行时使用紧凑按钮 */
  compact?: boolean;
};

const ActivityOrganizerFooter = ({
  activity,
  actorId,
  onEdit,
  onTerminated,
  canEdit = true,
  compact = false,
}: Props) => {
  const [terminateOpen, setTerminateOpen] = useState(false);

  const showTerminate =
    activity.status === "published" &&
    canTerminateActivity(activity.id, activity.organizerId);

  const enrollCount = countActivityEnrollments(activity.id);

  const handleTerminate = () => {
    const updated = terminateActivity(activity.id, actorId);
    if (!updated) {
      toast.error("终止失败，请稍后重试");
      return;
    }
    setTerminateOpen(false);
    onTerminated(updated);
    toast.success("活动已终止，未举办场次已取消");
  };

  const btnClass = compact
    ? "shrink-0 rounded-full px-3 py-2 text-xs font-medium active:scale-[0.99] whitespace-nowrap"
    : cn(
        "rounded-full py-3 text-sm font-medium active:scale-[0.99]",
        "flex-1",
      );

  return (
    <>
      <div className={cn("flex gap-1.5", compact ? "shrink-0" : "gap-2")}>
        {canEdit && (
          <button
            type="button"
            onClick={onEdit}
            className={cn(
              btnClass,
              "border border-primary text-primary",
              !compact && !showTerminate && "w-full",
            )}
          >
            编辑
          </button>
        )}
        {showTerminate && (
          <button
            type="button"
            onClick={() => setTerminateOpen(true)}
            className={cn(
              btnClass,
              "border border-destructive/50 text-destructive",
              !compact && !canEdit && "w-full",
            )}
          >
            终止
          </button>
        )}
      </div>

      <AlertDialog open={terminateOpen} onOpenChange={setTerminateOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>终止活动</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>确认终止「{activity.title}」？此操作不可撤销。</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>活动将从小组列表下架，不再接受新报名</li>
                  <li>所有未举办的场次将标记为已取消</li>
                  <li>
                    当前共 {enrollCount} 人报名，报名记录将全部作废
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleTerminate}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认终止
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 w-full">返回</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ActivityOrganizerFooter;

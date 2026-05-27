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
import { disbandGroup } from "@/data/interestGroups";
import type { InterestGroupFull } from "@/data/interestTypes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  group: InterestGroupFull;
  ownerId: string;
  onEdit: () => void;
  onDisbanded: () => void;
};

const GroupOrganizerFooter = ({
  group,
  ownerId,
  onEdit,
  onDisbanded,
}: Props) => {
  const [disbandOpen, setDisbandOpen] = useState(false);

  const handleDisband = () => {
    const result = disbandGroup(group.id, ownerId);
    if (!result) {
      toast.error("解散失败，请稍后重试");
      return;
    }
    setDisbandOpen(false);
    onDisbanded();
    const { terminatedActivityCount } = result;
    toast.success(
      terminatedActivityCount > 0
        ? `小组已解散，已终止 ${terminatedActivityCount} 个相关活动`
        : "小组已解散",
    );
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 rounded-full border border-primary py-3 text-sm font-medium text-primary active:scale-[0.99]"
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => setDisbandOpen(true)}
          className={cn(
            "flex-1 rounded-full border border-destructive/50 py-3 text-sm font-medium text-destructive active:scale-[0.99]",
          )}
        >
          解散小组
        </button>
      </div>

      <AlertDialog open={disbandOpen} onOpenChange={setDisbandOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>解散小组</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              确认解散「{group.name}」？解散后相关活动也将终止。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleDisband}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认解散
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 w-full">返回</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GroupOrganizerFooter;

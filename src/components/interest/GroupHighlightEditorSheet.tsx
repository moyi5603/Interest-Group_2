import { useEffect, useMemo, useState } from "react";
import CommentImagePicker from "@/components/interest/CommentImagePicker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CURRENT_EMPLOYEE_ID } from "@/data/interestGroups";
import {
  addGroupHighlight,
  type HighlightOccurrenceOption,
  updateGroupHighlight,
} from "@/data/groupHighlights";
import type { GroupHighlight } from "@/data/interestTypes";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  groupId: string;
  highlight?: GroupHighlight;
  uploadOptions: HighlightOccurrenceOption[];
  occurrenceLabel?: string;
  onSaved: () => void;
};

const GroupHighlightEditorSheet = ({
  open,
  onOpenChange,
  mode,
  groupId,
  highlight,
  uploadOptions,
  occurrenceLabel,
  onSaved,
}: Props) => {
  const [occurrenceId, setOccurrenceId] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const selectedOption = useMemo(
    () => uploadOptions.find((o) => o.occurrenceId === occurrenceId),
    [uploadOptions, occurrenceId],
  );

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && highlight) {
      setOccurrenceId(highlight.occurrenceId);
      setCaption(highlight.caption ?? "");
      setImageUrls(highlight.imageUrls);
      return;
    }
    setOccurrenceId("");
    setCaption("");
    setImageUrls([]);
  }, [open, mode, highlight]);

  const handleSave = () => {
    if (mode === "create") {
      if (!selectedOption) {
        toast.error("请选择活动场次");
        return;
      }
      if (imageUrls.length === 0) {
        toast.error("请至少上传一张图片");
        return;
      }
      const created = addGroupHighlight(groupId, CURRENT_EMPLOYEE_ID, {
        activityId: selectedOption.activityId,
        occurrenceId: selectedOption.occurrenceId,
        imageUrls,
        caption,
      });
      if (!created) {
        toast.error("该场次已上传精彩瞬间，请编辑已有内容");
        return;
      }
      toast.success("精彩瞬间已发布");
    } else {
      if (!highlight) return;
      if (imageUrls.length === 0) {
        toast.error("请至少保留一张图片");
        return;
      }
      const updated = updateGroupHighlight(highlight.id, {
        imageUrls,
        caption,
      });
      if (!updated) {
        toast.error("保存失败，请稍后重试");
        return;
      }
      toast.success("精彩瞬间已更新");
    }

    onSaved();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[92dvh] flex-col gap-0 rounded-t-2xl px-0 pb-0 pt-3 [&>button]:hidden"
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border" />
        <SheetHeader className="shrink-0 flex-row items-center justify-between space-y-0 px-4 text-left">
          <SheetTitle className="text-base">
            {mode === "create" ? "上传精彩瞬间" : "编辑精彩瞬间"}
          </SheetTitle>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground active:scale-[0.98]"
          >
            保存
          </button>
        </SheetHeader>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            活动场次
          </p>
          {mode === "edit" ? (
            <p className="rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground">
              {occurrenceLabel ?? "已选场次"}
            </p>
          ) : uploadOptions.length === 0 ? (
            <p className="rounded-xl bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
              暂无可上传的已结束场次
            </p>
          ) : (
            <div className="space-y-1.5">
              {uploadOptions.map((option) => (
                <button
                  key={option.occurrenceId}
                  type="button"
                  onClick={() => setOccurrenceId(option.occurrenceId)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left text-sm active:scale-[0.99]",
                    occurrenceId === option.occurrenceId
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground",
                  )}
                >
                  {option.occurrenceLabel}
                </button>
              ))}
            </div>
          )}

          <label className="mt-4 block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              说明（选填）
            </span>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="例如：结营合影"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              活动照片
            </p>
            <CommentImagePicker value={imageUrls} onChange={setImageUrls} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GroupHighlightEditorSheet;

import { useMemo, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CommentImageGrid, {
  COMMENT_IMAGE_GRID_MAX,
} from "@/components/interest/CommentImageGrid";
import CommentImagePicker from "@/components/interest/CommentImagePicker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getEmployee } from "@/data/colleagueData";
import { CURRENT_EMPLOYEE_ID, getActivityById, getOccurrenceById } from "@/data/interestGroups";
import {
  addGroupHighlight,
  deleteGroupHighlight,
  listGroupHighlights,
  listHighlightOccurrenceOptions,
} from "@/data/groupHighlights";
import type { GroupHighlight } from "@/data/interestTypes";
import {
  formatOccurrenceLabel,
  formatTimeRange,
} from "@/lib/interestOccurrences";
import { formatCommentTime } from "@/lib/formatCommentTime";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

type Props = {
  groupId: string;
  canUpload: boolean;
  tick: number;
  onChanged: () => void;
};

const formatHighlightOccurrenceLabel = (
  activity: ReturnType<typeof getActivityById>,
  occurrence: Parameters<typeof formatOccurrenceLabel>[0] | undefined,
  index?: number,
) => {
  if (!activity) return "";
  if (occurrence) {
    return `${activity.title} · ${formatOccurrenceLabel(occurrence, index)}`;
  }
  return `${activity.title} · ${formatTimeRange(activity.startAt, activity.endAt)}`;
};

const HighlightCard = ({
  groupId,
  highlight,
  canDelete,
  onDelete,
}: {
  groupId: string;
  highlight: GroupHighlight;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const activity = getActivityById(highlight.activityId);
  const occurrence = getOccurrenceById(highlight.occurrenceId);
  const uploader = getEmployee(highlight.uploadedBy);

  return (
    <article className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {activity
              ? formatHighlightOccurrenceLabel(activity, occurrence)
              : "活动场次"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {uploader?.name ?? "管理员"} ·{" "}
            {formatCommentTime(highlight.uploadedAt)}
          </p>
        </div>
        {canDelete && (
          <button
            type="button"
            aria-label="删除精彩瞬间"
            onClick={() => onDelete(highlight.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      {highlight.caption && (
        <p className="mt-2 text-sm text-foreground">{highlight.caption}</p>
      )}
      <CommentImageGrid
        imageUrls={highlight.imageUrls}
        maxDisplay={COMMENT_IMAGE_GRID_MAX}
        alignWithComment
        onViewMore={() =>
          navigate(
            `/agents/interest-groups/${groupId}/highlights/${highlight.id}`,
          )
        }
        className="mt-2"
      />
    </article>
  );
};

const GroupHighlightsPanel = ({
  groupId,
  canUpload,
  tick,
  onChanged,
}: Props) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [occurrenceId, setOccurrenceId] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const highlights = useMemo(
    () => listGroupHighlights(groupId),
    [groupId, tick],
  );

  const occurrenceOptions = useMemo(
    () =>
      listHighlightOccurrenceOptions(groupId, formatHighlightOccurrenceLabel),
    [groupId, tick],
  );

  const selectedOption = occurrenceOptions.find(
    (o) => o.occurrenceId === occurrenceId,
  );

  const resetUploadForm = () => {
    setOccurrenceId("");
    setCaption("");
    setImageUrls([]);
  };

  const handleUpload = () => {
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
      toast.error("上传失败，请稍后重试");
      return;
    }
    onChanged();
    setUploadOpen(false);
    resetUploadForm();
    toast.success("精彩瞬间已上传");
  };

  const handleDelete = (id: string) => {
    if (!deleteGroupHighlight(id)) {
      toast.error("删除失败");
      return;
    }
    onChanged();
    toast.success("已删除");
  };

  return (
    <div className="space-y-3">
      {canUpload && (
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/30 bg-primary/5 py-2.5 text-sm font-medium text-primary active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          上传精彩瞬间
        </button>
      )}

      {highlights.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border/50 bg-secondary/20 px-4 py-10 text-center">
          <ImagePlus className="h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium text-foreground">
            暂无精彩瞬间
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {canUpload
              ? "活动结束后，可上传该场次的精彩照片"
              : "管理员会在活动结束后上传精彩照片"}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {highlights.map((highlight) => (
            <li key={highlight.id}>
              <HighlightCard
                groupId={groupId}
                highlight={highlight}
                canDelete={canUpload}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) resetUploadForm();
        }}
      >
        <SheetContent
          side="bottom"
          className="flex max-h-[92dvh] flex-col gap-0 rounded-t-2xl px-0 pb-0 pt-3 [&>button]:hidden"
        >
          <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border" />
          <SheetHeader className="shrink-0 flex-row items-center justify-between space-y-0 px-4 text-left">
            <SheetTitle className="text-base">上传精彩瞬间</SheetTitle>
            <button
              type="button"
              onClick={handleUpload}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground active:scale-[0.98]"
            >
              保存
            </button>
          </SheetHeader>

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              选择场次
            </p>
            {occurrenceOptions.length === 0 ? (
              <p className="rounded-xl bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
                暂无可关联的已结束场次
              </p>
            ) : (
              <div className="space-y-1.5">
                {occurrenceOptions.map((option) => (
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
    </div>
  );
};

export default GroupHighlightsPanel;

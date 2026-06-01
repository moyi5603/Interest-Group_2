import { useMemo, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CommentImageGrid, {
  COMMENT_IMAGE_GRID_MAX,
} from "@/components/interest/CommentImageGrid";
import GroupHighlightEditorSheet from "@/components/interest/GroupHighlightEditorSheet";
import { getEmployee } from "@/data/colleagueData";
import { getActivityById, getOccurrenceById } from "@/data/interestGroups";
import {
  deleteGroupHighlight,
  formatHighlightOccurrenceLabel,
  listGroupHighlights,
  listHighlightOccurrenceOptions,
  listHighlightUploadOptions,
} from "@/data/groupHighlights";
import type { GroupHighlight } from "@/data/interestTypes";
import { formatCommentTime } from "@/lib/formatCommentTime";
import { toast } from "@/components/ui/sonner";

type Props = {
  groupId: string;
  canUpload: boolean;
  tick: number;
  onChanged: () => void;
};

const getHighlightOccurrenceLabel = (highlight: GroupHighlight) => {
  const activity = getActivityById(highlight.activityId);
  const occurrence = getOccurrenceById(highlight.occurrenceId);
  return formatHighlightOccurrenceLabel(activity, occurrence);
};

const HighlightCard = ({
  groupId,
  highlight,
  canManage,
  onEdit,
  onDelete,
}: {
  groupId: string;
  highlight: GroupHighlight;
  canManage: boolean;
  onEdit: (highlight: GroupHighlight) => void;
  onDelete: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const uploader = getEmployee(highlight.uploadedBy);
  const occurrenceLabel = getHighlightOccurrenceLabel(highlight);
  const timeLabel = formatCommentTime(highlight.updatedAt ?? highlight.uploadedAt);

  return (
    <article className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{occurrenceLabel}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {uploader?.name ?? "管理员"} · {timeLabel}
            {highlight.updatedAt ? " · 已编辑" : ""}
          </p>
        </div>
        {canManage && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label="编辑精彩瞬间"
              onClick={() => onEdit(highlight)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="删除精彩瞬间"
              onClick={() => onDelete(highlight.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
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
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingHighlight, setEditingHighlight] = useState<
    GroupHighlight | undefined
  >();

  const highlights = useMemo(
    () => listGroupHighlights(groupId),
    [groupId, tick],
  );

  const occurrenceOptions = useMemo(
    () => listHighlightOccurrenceOptions(groupId),
    [groupId, tick],
  );

  const uploadOptions = useMemo(
    () => listHighlightUploadOptions(groupId),
    [groupId, tick],
  );

  const openCreate = () => {
    setEditorMode("create");
    setEditingHighlight(undefined);
    setEditorOpen(true);
  };

  const openEdit = (highlight: GroupHighlight) => {
    setEditorMode("edit");
    setEditingHighlight(highlight);
    setEditorOpen(true);
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
      {canUpload && uploadOptions.length > 0 && (
        <button
          type="button"
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/30 bg-primary/5 py-2.5 text-sm font-medium text-primary active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          上传精彩瞬间
        </button>
      )}

      {canUpload && uploadOptions.length === 0 && occurrenceOptions.length > 0 && (
        <p className="rounded-xl bg-secondary/40 px-3 py-2 text-center text-xs text-muted-foreground">
          已结束场次均已上传精彩瞬间，可点击编辑按钮修改
        </p>
      )}

      {highlights.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border/50 bg-secondary/20 px-4 py-10 text-center">
          <ImagePlus className="h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium text-foreground">
            暂无精彩瞬间
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {canUpload
              ? "活动结束后，每个场次可上传一次精彩瞬间"
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
                canManage={canUpload}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <GroupHighlightEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        mode={editorMode}
        groupId={groupId}
        highlight={editingHighlight}
        uploadOptions={uploadOptions}
        occurrenceLabel={
          editingHighlight
            ? getHighlightOccurrenceLabel(editingHighlight)
            : undefined
        }
        onSaved={onChanged}
      />
    </div>
  );
};

export default GroupHighlightsPanel;

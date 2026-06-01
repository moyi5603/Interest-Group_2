import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const COMMENT_IMAGE_GRID_MAX = 9;

type Props = {
  imageUrls: string[];
  onImageClick?: (index: number) => void;
  className?: string;
  /** 列表最多展示张数；超出时最后一张显示「查看更多」 */
  maxDisplay?: number;
  onViewMore?: () => void;
  /** 左侧留出与小组圈评论头像相同的间距，使缩略图尺寸一致 */
  alignWithComment?: boolean;
};

const CommentImageGrid = ({
  imageUrls,
  onImageClick,
  className,
  maxDisplay,
  onViewMore,
  alignWithComment = false,
}: Props) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  if (imageUrls.length === 0) return null;

  const limit = maxDisplay ?? imageUrls.length;
  const hasOverflow = maxDisplay != null && imageUrls.length > maxDisplay;
  const displayUrls = hasOverflow
    ? imageUrls.slice(0, maxDisplay)
    : imageUrls;
  const hiddenCount = hasOverflow ? imageUrls.length - maxDisplay : 0;

  const openPreview = (index: number) => {
    if (onImageClick) {
      onImageClick(index);
      return;
    }
    setPreviewIndex(index);
  };

  const grid = (
    <div
      className={cn(
        "grid grid-cols-3 gap-1",
        !alignWithComment && "mt-2",
        alignWithComment ? undefined : className,
      )}
    >
      {displayUrls.map((url, displayIndex) => {
        const isOverflowCell =
          hasOverflow && displayIndex === displayUrls.length - 1;

        return (
          <button
            key={`${url}-${displayIndex}`}
            type="button"
            onClick={() => {
              if (isOverflowCell && onViewMore) {
                onViewMore();
                return;
              }
              openPreview(displayIndex);
            }}
            className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            {isOverflowCell && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-medium text-white">
                查看更多
                {hiddenCount > 0 ? ` +${hiddenCount}` : ""}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {alignWithComment ? (
        <div className={cn("flex gap-2.5", className)}>
          <div className="h-9 w-9 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">{grid}</div>
        </div>
      ) : (
        grid
      )}

      {!onImageClick && (
        <Dialog
          open={previewIndex != null}
          onOpenChange={(open) => {
            if (!open) setPreviewIndex(null);
          }}
        >
          <DialogContent className="max-w-[min(100vw-2rem,28rem)] border-0 bg-transparent p-0 shadow-none [&>button]:text-white">
            {previewIndex != null && imageUrls[previewIndex] ? (
              <img
                src={imageUrls[previewIndex]}
                alt=""
                className="max-h-[80dvh] w-full rounded-xl object-contain"
              />
            ) : null}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CommentImageGrid;

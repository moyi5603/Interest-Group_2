import { useEffect, useRef, useState } from "react";
import CommentImagePicker from "@/components/interest/CommentImagePicker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const MAX_CONTENT_LENGTH = 500;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { content: string; imageUrls: string[] }) => boolean;
  initialFocusImages?: boolean;
};

const ActivityCommentComposerSheet = ({
  open,
  onOpenChange,
  onSubmit,
  initialFocusImages = false,
}: Props) => {
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerWrapRef = useRef<HTMLDivElement>(null);

  const canSubmit =
    (content.trim().length > 0 || imageUrls.length > 0) && !submitting;

  useEffect(() => {
    if (!open) {
      setContent("");
      setImageUrls([]);
      setSubmitting(false);
      return;
    }
    const timer = window.setTimeout(() => {
      if (initialFocusImages) {
        pickerWrapRef.current?.querySelector("button")?.scrollIntoView({
          block: "nearest",
        });
      } else {
        textareaRef.current?.focus();
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [open, initialFocusImages]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const ok = onSubmit({
      content: content.trim(),
      imageUrls,
    });
    setSubmitting(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[92dvh] flex-col gap-0 rounded-t-2xl px-0 pb-0 pt-3 [&>button]:hidden"
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border" />
        <SheetHeader className="shrink-0 flex-row items-center justify-between space-y-0 px-4 text-left">
          <SheetTitle className="text-base">写评论</SheetTitle>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium active:scale-[0.98]",
              canSubmit
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            )}
          >
            发布
          </button>
        </SheetHeader>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <textarea
            ref={textareaRef}
            value={content}
            maxLength={MAX_CONTENT_LENGTH}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的想法…"
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed outline-none ring-primary placeholder:text-muted-foreground focus:ring-2"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {content.length}/{MAX_CONTENT_LENGTH}
          </p>

          <div ref={pickerWrapRef} className="mt-3">
            <p className="mb-2 text-xs text-muted-foreground">
              图片（最多 9 张）
            </p>
            <CommentImagePicker value={imageUrls} onChange={setImageUrls} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ActivityCommentComposerSheet;

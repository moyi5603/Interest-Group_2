import { Camera, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onOpenComposer: (focusImages?: boolean) => void;
  className?: string;
};

/** 内联评论入口（与底部操作按钮同一行） */
const ActivityCommentComposerInline = ({
  onOpenComposer,
  className,
}: Props) => {
  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => onOpenComposer(false)}
        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-left active:scale-[0.99]"
      >
        <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm text-muted-foreground">
          说点什么…
        </span>
      </button>
      <button
        type="button"
        aria-label="添加图片"
        onClick={() => onOpenComposer(true)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground active:scale-95"
      >
        <Camera className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ActivityCommentComposerInline;

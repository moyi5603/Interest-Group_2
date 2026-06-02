import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  liked: boolean;
  count: number;
  canLike: boolean;
  onToggle: () => void;
  className?: string;
};

const EntityLikeButton = ({
  liked,
  count,
  canLike,
  onToggle,
  className,
}: Props) => (
  <button
    type="button"
    disabled={!canLike}
    onClick={canLike ? onToggle : undefined}
    aria-label={canLike ? (liked ? "取消点赞" : "点赞") : `点赞 ${count}`}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
      canLike && "active:scale-[0.98]",
      canLike && liked
        ? "bg-primary/10 text-primary"
        : canLike
          ? "bg-secondary text-muted-foreground active:text-foreground"
          : "cursor-default bg-secondary/60 text-muted-foreground",
      className,
    )}
  >
    <Heart className={cn("h-4 w-4", liked && canLike && "fill-current")} />
    <span>{count > 0 ? count : "赞"}</span>
  </button>
);

export default EntityLikeButton;

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  count?: number;
  className?: string;
  iconClassName?: string;
};

const LikeCountBadge = ({ count = 0, className, iconClassName }: Props) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center gap-0.5 text-muted-foreground",
      className,
    )}
  >
    <Heart className={cn("h-3 w-3", iconClassName)} />
    <span>{count > 0 ? count : 0}</span>
  </span>
);

export default LikeCountBadge;

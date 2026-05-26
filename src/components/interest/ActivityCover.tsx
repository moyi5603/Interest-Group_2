import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  coverUrl?: string;
  className?: string;
  children?: ReactNode;
};

const ActivityCover = ({ coverUrl, className, children }: Props) => (
  <div
    className={cn(
      "relative overflow-hidden bg-gradient-to-br from-primary/25 to-primary-glow/15",
      className,
    )}
  >
    {coverUrl ? (
      <img
        src={coverUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    ) : null}
    {children}
  </div>
);

export default ActivityCover;

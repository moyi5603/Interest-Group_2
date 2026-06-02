import { Clock } from "lucide-react";
import type { GroupActivity } from "@/data/interestTypes";
import { formatEnrollDeadlineDateTime } from "@/lib/enrollDeadline";
import { cn } from "@/lib/utils";

type Props = {
  activity: GroupActivity;
  className?: string;
  iconClassName?: string;
  prefix?: string;
};

const EnrollDeadlineMeta = ({
  activity,
  className,
  iconClassName,
  prefix = "报名截止",
}: Props) => {
  const text = formatEnrollDeadlineDateTime(activity);
  if (!text) return null;

  return (
    <p
      className={cn(
        "flex min-w-0 items-center gap-1 text-muted-foreground",
        className,
      )}
    >
      <Clock className={cn("shrink-0", iconClassName ?? "h-3 w-3")} />
      <span className="min-w-0 truncate">
        {prefix} {text}
      </span>
    </p>
  );
};

export default EnrollDeadlineMeta;

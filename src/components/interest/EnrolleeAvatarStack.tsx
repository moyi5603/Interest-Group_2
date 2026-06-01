import type { ActivityEnrolleeInfo } from "@/data/interestGroups";
import { cn } from "@/lib/utils";

type Props = {
  enrollees: ActivityEnrolleeInfo[];
  total: number;
  /** 最多展示头像数（超出显示 +N） */
  maxVisible?: number;
  size?: "sm" | "md";
  className?: string;
};

const EnrolleeFace = ({
  person,
  size,
}: {
  person: ActivityEnrolleeInfo;
  size: "sm" | "md";
}) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-card",
      size === "sm" ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-xs",
    )}
    style={{
      background: person.avatarUrl
        ? undefined
        : `linear-gradient(135deg, hsl(${person.avatarColor}), hsl(${person.avatarColor} / 0.72))`,
    }}
    title={person.name}
  >
    {person.avatarUrl ? (
      <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" />
    ) : (
      person.name[0]
    )}
  </div>
);

const EnrolleeAvatarStack = ({
  enrollees,
  total,
  maxVisible = 4,
  size = "sm",
  className,
}: Props) => {
  if (total <= 0) return null;

  const visible = enrollees.slice(0, maxVisible);
  const overflow = total - visible.length;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center pl-0.5">
        {visible.map((person, index) => (
          <div
            key={person.employeeId}
            className={cn("relative", index > 0 && "-ml-2")}
            style={{ zIndex: visible.length - index }}
          >
            <EnrolleeFace person={person} size={size} />
          </div>
        ))}
        {overflow > 0 && (
          <div
            className={cn(
              "relative -ml-2 flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-card",
              size === "sm"
                ? "h-6 w-6 text-[10px]"
                : "h-7 w-7 text-xs",
            )}
            style={{ zIndex: 0 }}
          >
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{total} 人已报名</span>
    </div>
  );
};

export default EnrolleeAvatarStack;

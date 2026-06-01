import { CalendarDays, ChevronRight } from "lucide-react";

type Props = {
  isManager?: boolean;
  onAction?: () => void;
  /** 覆盖默认说明文案 */
  description?: string;
  /** 覆盖默认按钮文案 */
  actionLabel?: string;
};

const RecentActivitiesEmptyState = ({
  isManager = false,
  onAction,
  description,
  actionLabel,
}: Props) => {
  const defaultDescription = isManager
    ? "当前没有可预览的待开始或进行中活动，可在小组详情中发布新活动"
    : "近期暂无可报名活动，去小组广场发现感兴趣的小组吧";
  const defaultActionLabel = isManager ? "前往小组管理" : "浏览小组广场";

  return (
  <div className="flex flex-col items-center rounded-xl border border-dashed border-border/50 bg-gradient-to-b from-secondary/25 to-secondary/10 px-4 py-7 text-center">
    <div className="relative flex h-14 w-14 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-primary/8" />
      <span className="absolute inset-2 rounded-full bg-primary/5" />
      <CalendarDays
        className="relative h-6 w-6 text-muted-foreground/75"
        strokeWidth={1.75}
      />
    </div>
    <p className="mt-3 text-sm font-medium text-foreground">
      暂无即将开始的活动
    </p>
    <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
      {description ?? defaultDescription}
    </p>
    {onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-0.5 rounded-full bg-secondary/80 px-3.5 py-1.5 text-xs font-medium text-foreground transition-base active:scale-95"
      >
        {actionLabel ?? defaultActionLabel}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    )}
  </div>
  );
};

export default RecentActivitiesEmptyState;

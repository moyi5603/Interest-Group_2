import { ChevronRight, Users } from "lucide-react";

type Props = {
  onAction?: () => void;
  /** 覆盖默认说明文案 */
  description?: string;
  /** 覆盖默认按钮文案 */
  actionLabel?: string;
};

const RecommendedGroupsEmptyState = ({
  onAction,
  description = "暂时没有可加入的新小组，可在「我的小组」查看已加入内容",
  actionLabel = "查看我的小组",
}: Props) => (
  <div className="flex flex-col items-center rounded-xl border border-dashed border-border/50 bg-gradient-to-b from-secondary/25 to-secondary/10 px-4 py-7 text-center">
    <div className="relative flex h-14 w-14 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-primary/8" />
      <span className="absolute inset-2 rounded-full bg-primary/5" />
      <Users
        className="relative h-6 w-6 text-muted-foreground/75"
        strokeWidth={1.75}
      />
    </div>
    <p className="mt-3 text-sm font-medium text-foreground">暂无推荐小组</p>
    <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
      {description}
    </p>
    {onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-0.5 rounded-full bg-secondary/80 px-3.5 py-1.5 text-xs font-medium text-foreground transition-base active:scale-95"
      >
        {actionLabel}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    )}
  </div>
);

export default RecommendedGroupsEmptyState;

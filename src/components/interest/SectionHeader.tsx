import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Action = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  /** 更浅的灰色文案（预览入口等） */
  subtle?: boolean;
};

type Props = {
  title: ReactNode;
  subtitle?: string;
  action?: Action;
  secondaryAction?: Action;
  /** 首页等场景用稍大字号 */
  size?: "default" | "comfortable";
};

const HeaderAction = ({
  action,
  size,
}: {
  action: Action;
  size: "default" | "comfortable";
}) => (
  <button
    type="button"
    onClick={action.onClick}
    className={cn(
      size === "comfortable"
        ? "inline-flex items-center gap-1 text-xs font-medium transition-base active:scale-95"
        : "inline-flex items-center gap-0.5 text-[11px] font-medium transition-base active:scale-95",
      action.subtle
        ? "text-muted-foreground/55 active:text-muted-foreground/75"
        : "text-muted-foreground active:text-foreground",
    )}
  >
    {action.icon}
    {action.label}
    {action.trailingIcon}
  </button>
);

const SectionHeader = ({
  title,
  subtitle,
  action,
  secondaryAction,
  size = "comfortable",
}: Props) => (
  <div className={subtitle ? "mb-2" : "mb-1.5"}>
    <div className="flex items-center justify-between gap-2">
      <h2
        className={
          size === "comfortable"
            ? "text-sm font-semibold text-foreground"
            : "text-xs font-semibold text-foreground"
        }
      >
        {title}
      </h2>
      {(secondaryAction || action) && (
        <div className="flex shrink-0 items-center gap-2.5">
          {secondaryAction && (
            <HeaderAction action={secondaryAction} size={size} />
          )}
          {action && <HeaderAction action={action} size={size} />}
        </div>
      )}
    </div>
    {subtitle && (
      <p
        className={
          size === "comfortable"
            ? "mt-1 text-xs leading-relaxed text-muted-foreground"
            : "mt-1 text-[11px] leading-relaxed text-muted-foreground"
        }
      >
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeader;

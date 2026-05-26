import type { ReactNode } from "react";

type Action = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
};

type Props = {
  title: ReactNode;
  subtitle?: string;
  action?: Action;
  secondaryAction?: Action;
};

const actionButtonClass = (primary?: boolean) =>
  primary
    ? "flex items-center gap-1 text-[11px] font-medium text-primary"
    : "flex items-center gap-1 text-[11px] font-medium text-muted-foreground";

const SectionHeader = ({ title, subtitle, action, secondaryAction }: Props) => (
  <div className={subtitle ? "mb-2" : "mb-1.5"}>
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-xs font-semibold text-foreground">{title}</h2>
      {(secondaryAction || action) && (
        <div className="flex shrink-0 items-center gap-2">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className={actionButtonClass()}
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={actionButtonClass(true)}
            >
              {action.icon}
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
    {subtitle && (
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeader;

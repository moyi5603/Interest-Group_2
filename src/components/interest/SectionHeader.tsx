import type { ReactNode } from "react";

type Action = { label: string; onClick: () => void };

type Props = {
  title: ReactNode;
  action?: Action;
  secondaryAction?: Action;
};

const SectionHeader = ({ title, action, secondaryAction }: Props) => (
  <div className="mb-1.5 flex items-center justify-between gap-2">
    <h2 className="text-xs font-semibold text-foreground">{title}</h2>
    {(secondaryAction || action) && (
      <div className="flex shrink-0 items-center gap-2">
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="text-[11px] font-medium text-muted-foreground"
          >
            {secondaryAction.label}
          </button>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="text-[11px] font-medium text-primary"
          >
            {action.label}
          </button>
        )}
      </div>
    )}
  </div>
);

export default SectionHeader;

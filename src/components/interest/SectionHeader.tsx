import type { ReactNode } from "react";

type Action = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
};

type Props = {
  title: ReactNode;
  subtitle?: string;
  action?: Action;
  secondaryAction?: Action;
};

const HeaderAction = ({ action }: { action: Action }) => (
  <button
    type="button"
    onClick={action.onClick}
    className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground transition-base active:scale-95 active:text-foreground"
  >
    {action.icon}
    {action.label}
    {action.trailingIcon}
  </button>
);

const SectionHeader = ({ title, subtitle, action, secondaryAction }: Props) => (
  <div className={subtitle ? "mb-2" : "mb-1.5"}>
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-xs font-semibold text-foreground">{title}</h2>
      {(secondaryAction || action) && (
        <div className="flex shrink-0 items-center gap-2.5">
          {secondaryAction && <HeaderAction action={secondaryAction} />}
          {action && <HeaderAction action={action} />}
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

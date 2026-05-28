import { cn } from "@/lib/utils";

type Props = {
  label: string;
  selected?: boolean;
  onRemove?: () => void;
  className?: string;
};

const InterestTagPill = ({
  label,
  selected,
  onRemove,
  className,
}: Props) => (
  <span
    className={cn(
      "inline-flex items-center gap-0.5 rounded-md border px-2.5 py-1.5 text-sm",
      selected
        ? "border-primary/25 bg-primary/8 text-foreground"
        : "border-border bg-secondary/50 text-foreground",
      className,
    )}
  >
    {label}
    {onRemove && (
      <button
        type="button"
        aria-label={`移除${label}`}
        onClick={onRemove}
        className="-mr-0.5 ml-0.5 rounded p-0.5 text-muted-foreground active:text-destructive"
      >
        ×
      </button>
    )}
  </span>
);

export default InterestTagPill;

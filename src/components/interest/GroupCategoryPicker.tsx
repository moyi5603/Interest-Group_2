import type { GroupCategory } from "@/data/interestTypes";
import { GROUP_CATEGORIES } from "@/components/interest/groupFormConstants";
import { cn } from "@/lib/utils";

type Props = {
  value?: GroupCategory;
  onChange: (category: GroupCategory) => void;
};

const GroupCategoryPicker = ({ value, onChange }: Props) => (
  <div className="flex flex-wrap gap-2">
    {GROUP_CATEGORIES.map((cat) => {
      const active = value === cat;
      return (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm transition-colors active:scale-95",
            active
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground",
          )}
        >
          {cat}
        </button>
      );
    })}
  </div>
);

export default GroupCategoryPicker;

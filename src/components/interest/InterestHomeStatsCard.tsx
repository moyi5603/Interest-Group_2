import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { InterestHomeStats } from "@/lib/interestHomeStats";
import { cn } from "@/lib/utils";

type Props = {
  stats: InterestHomeStats;
  className?: string;
};

const InterestHomeStatsCard = ({ stats, className }: Props) => {
  const navigate = useNavigate();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 px-0.5">
        <BarChart3 className="h-3.5 w-3.5 text-primary" />
        <span className="text-sm font-semibold text-foreground">数据概览</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {stats.items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.to)}
            className="flex flex-col items-center rounded-xl border border-border/50 bg-secondary/30 px-1 py-2.5 transition-base active:scale-[0.97]"
          >
            <span className="text-lg font-bold tabular-nums text-primary">
              {item.value}
            </span>
            <span className="mt-0.5 text-center text-[10px] leading-tight text-muted-foreground">
              {item.label}
            </span>
          </button>
        ))}
      </div>
      {stats.hint && (
        <p className="px-0.5 text-center text-xs text-muted-foreground">
          {stats.hint}
        </p>
      )}
    </div>
  );
};

export default InterestHomeStatsCard;

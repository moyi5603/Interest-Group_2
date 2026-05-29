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
    <div className={cn(className)}>
      <div className="grid grid-cols-3 gap-1.5">
        {stats.items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.to)}
            className="flex flex-col items-center rounded-xl px-1 py-2.5 transition-base active:scale-[0.97]"
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
    </div>
  );
};

export default InterestHomeStatsCard;

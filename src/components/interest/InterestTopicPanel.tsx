import { RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const topicGroups = [
  ["推荐跑步小组", "下周活动", "我的小组"],
  ["摄影小组", "可报名活动", "创建小组"],
  ["推荐小组", "可报名活动", "完善标签"],
];

type Props = {
  onSelect: (text: string) => void;
  compact?: boolean;
  /** 紧凑模式稍大字号（首页底部等） */
  comfortable?: boolean;
  /** 固定话题列表；不传则轮换默认三组 */
  topics?: string[];
  hideRefresh?: boolean;
  className?: string;
};

const InterestTopicPanel = ({
  onSelect,
  compact,
  comfortable = true,
  topics: topicsProp,
  hideRefresh,
  className,
}: Props) => {
  const [idx, setIdx] = useState(0);
  const topics = topicsProp ?? topicGroups[idx % topicGroups.length];

  return (
    <div
      className={cn(
        compact
          ? "space-y-1.5"
          : "space-y-2 rounded-2xl bg-card p-3 shadow-soft",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex items-center gap-1 font-medium text-primary",
            comfortable ? "text-xs" : "text-[10px]",
          )}
        >
          <Sparkles className={comfortable ? "h-3.5 w-3.5" : "h-3 w-3"} />
          试试这样问
        </span>
        {!hideRefresh && !topicsProp && (
          <button
            type="button"
            onClick={() => setIdx((i) => i + 1)}
            className={cn(
              "flex items-center gap-0.5 text-muted-foreground",
              comfortable ? "text-xs" : "text-[10px]",
            )}
          >
            <RefreshCw className={comfortable ? "h-3 w-3" : "h-2.5 w-2.5"} />
            换一批
          </button>
        )}
      </div>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onSelect(t)}
            className={cn(
              "shrink-0 rounded-full border border-border/70 bg-secondary/50 text-foreground active:scale-95",
              comfortable
                ? "px-3 py-1.5 text-xs"
                : "px-2.5 py-1 text-[10px]",
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InterestTopicPanel;

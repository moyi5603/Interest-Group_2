import { useEffect, useRef, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { pickAiContentBatch, pickFreshAiBatch } from "@/data/humanityCare";
import { cn } from "@/lib/utils";

const FLASH_MS = 450;

type Props = {
  /** 文案池，用于每批抽取 */
  pool: readonly string[];
  onSelect: (value: string) => void;
  batchSize?: number;
};

/** AI 一次生成 3 条，仅点击时短暂高亮并填入自定义内容；换一批不自动填入 */
export const CareContentAiPanel = ({
  pool,
  onSelect,
  batchSize = 3,
}: Props) => {
  const [batch, setBatch] = useState<string[]>(() => pickAiContentBatch(pool, batchSize));
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();

  const flash = (index: number) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlashIndex(index);
    flashTimer.current = setTimeout(() => setFlashIndex(null), FLASH_MS);
  };

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const handlePick = (text: string, index: number) => {
    flash(index);
    onSelect(text);
  };

  const handleRefresh = () => {
    setBatch(pickFreshAiBatch(pool, batch, batchSize));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI 生成 · 点击填入下方
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1 rounded-full border border-primary/30 bg-background px-2.5 py-1 text-[11px] font-medium text-primary transition-base active:scale-95"
        >
          <RefreshCw className="h-3 w-3" />
          换一批
        </button>
      </div>
      <ul className="space-y-1.5">
        {batch.map((text, index) => {
          const flashing = flashIndex === index;
          return (
            <li key={`${index}-${text.slice(0, 12)}`}>
              <button
                type="button"
                onClick={() => handlePick(text, index)}
                className={cn(
                  "flex w-full items-start rounded-xl border px-3 py-3 text-left text-sm transition-base duration-200",
                  flashing
                    ? "border-primary/50 bg-accent text-accent-foreground scale-[0.99]"
                    : "border-border bg-card text-foreground active:bg-secondary",
                )}
              >
                <span className="min-w-0 flex-1 leading-relaxed">
                  <span className="mb-1 block text-[10px] font-medium text-muted-foreground">
                    方案 {index + 1}
                  </span>
                  {text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

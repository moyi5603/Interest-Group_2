import { useState } from "react";
import { ensureCustomTag, interestTagList } from "@/data/interestTags";
import { toast } from "@/components/ui/sonner";

type Props = {
  selectedIds: string[];
  onToggle: (tagId: string) => void;
  onAdd?: (tagId: string) => void;
  /** 为 true 时点击已选标签会取消（用于创建小组多选） */
  allowDeselect?: boolean;
  /** 为 true 时不按分类展示，全部平铺 */
  flat?: boolean;
};

const InterestTagPicker = ({
  selectedIds,
  onToggle,
  onAdd,
  allowDeselect = false,
  flat = false,
}: Props) => {
  const [customInput, setCustomInput] = useState("");

  const addCustom = () => {
    const tag = ensureCustomTag(customInput);
    if (!tag) {
      toast.error("请输入 1–6 个字的标签");
      return;
    }
    setCustomInput("");
    if (selectedIds.includes(tag.id)) {
      if (allowDeselect) onToggle(tag.id);
      return;
    }
    if (onAdd) onAdd(tag.id);
    else onToggle(tag.id);
  };

  const byCategory = interestTagList.reduce(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    },
    {} as Record<string, typeof interestTagList>,
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          maxLength={6}
          placeholder="输入自定义标签"
          className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addCustom}
          className="shrink-0 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-foreground active:scale-95"
        >
          添加
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        可从下方选择，或直接输入自定义内容（最多 6 字）
      </p>

      {flat ? (
        <div className="flex flex-wrap gap-2">
          {interestTagList.map((t) => {
            const active = selectedIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (active && !allowDeselect) return;
                  onToggle(t.id);
                }}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      ) : (
        Object.entries(byCategory).map(([cat, tags]) => (
          <div key={cat}>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              {cat}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const active = selectedIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (active && !allowDeselect) return;
                      onToggle(t.id);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default InterestTagPicker;

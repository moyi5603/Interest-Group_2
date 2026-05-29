import { useState } from "react";
import type { InterestTag } from "@/data/interestTypes";
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
  /** 最多可选数量；达上限后不可再选/自定义添加 */
  maxSelected?: number;
  /** 可选标签列表；默认使用全量兴趣标签 */
  tagList?: InterestTag[];
  /** 紧凑布局（创建小组等表单） */
  compact?: boolean;
};

const InterestTagPicker = ({
  selectedIds,
  onToggle,
  onAdd,
  allowDeselect = false,
  flat = false,
  maxSelected,
  tagList = interestTagList,
  compact = false,
}: Props) => {
  const [customInput, setCustomInput] = useState("");
  const atMax =
    maxSelected !== undefined && selectedIds.length >= maxSelected;

  const trySelect = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      if (allowDeselect) onToggle(tagId);
      return;
    }
    if (atMax) {
      toast.error(`最多选择 ${maxSelected} 个标签`);
      return;
    }
    if (onAdd) onAdd(tagId);
    else onToggle(tagId);
  };

  const addCustom = () => {
    if (atMax) {
      toast.error(`最多选择 ${maxSelected} 个标签`);
      return;
    }
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

  const byCategory = tagList.reduce(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    },
    {} as Record<string, typeof tagList>,
  );

  return (
    <div className={compact ? "space-y-1.5" : "space-y-3"}>
      <div className="flex gap-1.5">
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
          placeholder="自定义标签"
          disabled={atMax}
          className={
            compact
              ? "min-w-0 flex-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs disabled:opacity-50"
              : "min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm disabled:opacity-50"
          }
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={atMax}
          className={
            compact
              ? "shrink-0 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground active:scale-95 disabled:opacity-50"
              : "shrink-0 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground active:scale-95 disabled:opacity-50"
          }
        >
          添加
        </button>
      </div>
      {!compact && (
        <p className="text-sm text-muted-foreground">
          {maxSelected !== undefined
            ? `最多 ${maxSelected} 个标签，可从下方选择或自定义（每个最多 6 字）`
            : "可从下方选择，或直接输入自定义内容（最多 6 字）"}
        </p>
      )}

      {flat ? (
        <div className={compact ? "flex flex-wrap gap-1.5" : "flex flex-wrap gap-2"}>
          {tagList.map((t) => {
            const active = selectedIds.includes(t.id);
            const disabled = !active && atMax;
            return (
              <button
                key={t.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (active && !allowDeselect) return;
                  trySelect(t.id);
                }}
                className={
                  compact
                    ? `rounded-full px-2.5 py-1 text-xs ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : disabled
                            ? "cursor-not-allowed border border-border/50 bg-muted/40 text-muted-foreground"
                            : "border border-border bg-card"
                      }`
                    : `rounded-full px-3 py-1.5 text-sm ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : disabled
                            ? "cursor-not-allowed border border-border/50 bg-muted/40 text-muted-foreground"
                            : "border border-border bg-card"
                      }`
                }
              >
                {t.name}
              </button>
            );
          })}
        </div>
      ) : (
        Object.entries(byCategory).map(([cat, tags]) => (
          <div key={cat}>
            <p className="mb-1.5 text-sm font-medium text-muted-foreground">
              {cat}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const active = selectedIds.includes(t.id);
                const disabled = !active && atMax;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (active && !allowDeselect) return;
                      trySelect(t.id);
                    }}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : disabled
                          ? "cursor-not-allowed border border-border/50 bg-muted/40 text-muted-foreground"
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

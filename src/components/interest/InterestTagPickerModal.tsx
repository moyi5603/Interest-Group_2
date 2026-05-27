import { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  INTEREST_TAG_CATALOG,
  type CatalogCategory,
} from "@/data/interestTagCatalog";
import { getTagsByIds } from "@/data/interestTags";
import { normalizeTagLabel } from "@/lib/interestTagResolve";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  existingTagIds: string[];
  maxCount?: number;
  onConfirm: (addedTagIds: string[]) => void;
  onClose: () => void;
};

const InterestTagPickerModal = ({
  open,
  existingTagIds,
  maxCount,
  onConfirm,
  onClose,
}: Props) => {
  const catalog = INTEREST_TAG_CATALOG;
  const [activeCategoryId, setActiveCategoryId] = useState(
    catalog[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const [pendingNames, setPendingNames] = useState<string[]>([]);

  const existingNames = useMemo(
    () => getTagsByIds(existingTagIds).map((t) => t.name),
    [existingTagIds],
  );

  const existingLower = useMemo(
    () => new Set(existingNames.map((n) => n.toLowerCase())),
    [existingNames],
  );

  const pendingLower = useMemo(
    () => new Set(pendingNames.map((n) => n.toLowerCase())),
    [pendingNames],
  );

  const totalCount = existingNames.length + pendingNames.length;
  const atLimit = maxCount !== undefined && totalCount >= maxCount;

  const activeCategory = useMemo(
    () => catalog.find((c) => c.id === activeCategoryId) ?? catalog[0],
    [catalog, activeCategoryId],
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const items: string[] = [];
    for (const cat of catalog) {
      for (const group of cat.groups) {
        for (const name of group.items) {
          if (name.toLowerCase().includes(q) && !items.includes(name)) {
            items.push(name);
          }
        }
      }
    }
    return items;
  }, [query, catalog]);

  const togglePending = (name: string) => {
    const key = name.toLowerCase();
    if (existingLower.has(key)) return;
    if (pendingLower.has(key)) {
      setPendingNames((prev) => prev.filter((n) => n.toLowerCase() !== key));
      return;
    }
    if (atLimit) return;
    setPendingNames((prev) => [...prev, name]);
  };

  const addCustom = (raw: string) => {
    const name = normalizeTagLabel(raw);
    if (!name) return;
    const key = name.toLowerCase();
    if (existingLower.has(key) || pendingLower.has(key)) return;
    if (atLimit) return;
    setPendingNames((prev) => [...prev, name]);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom(query);
    }
  };

  const handleConfirm = () => {
    if (pendingNames.length === 0) {
      onClose();
      return;
    }
    onConfirm(pendingNames);
    setPendingNames([]);
    setQuery("");
  };

  const handleClose = () => {
    setPendingNames([]);
    setQuery("");
    onClose();
  };

  const isSelected = (name: string) => pendingLower.has(name.toLowerCase());
  const isDisabled = (name: string) =>
    existingLower.has(name.toLowerCase()) ||
    (atLimit && !isSelected(name));

  const renderTag = (name: string) => (
    <button
      key={name}
      type="button"
      disabled={isDisabled(name)}
      onClick={() => togglePending(name)}
      className={cn(
        "rounded-md border px-3.5 py-1.5 text-xs transition-colors",
        isSelected(name)
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border bg-secondary/40 text-foreground",
        isDisabled(name) && !isSelected(name) && "cursor-not-allowed opacity-45",
        !isDisabled(name) &&
          !isSelected(name) &&
          "active:border-primary active:text-primary",
      )}
    >
      {name}
    </button>
  );

  if (!open || !activeCategory) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-background shadow-xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="interest-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 id="interest-picker-title" className="text-base font-semibold">
            选择兴趣
          </h3>
          <button
            type="button"
            aria-label="关闭"
            onClick={handleClose}
            className="rounded-full p-1 text-muted-foreground active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <div className="mb-3 flex items-start gap-2">
            <span className="shrink-0 pt-1.5 text-xs text-muted-foreground">
              已选择
            </span>
            <div className="flex min-h-7 min-w-0 flex-1 flex-wrap gap-1.5">
              {pendingNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  {name}
                  <button
                    type="button"
                    aria-label={`移除${name}`}
                    onClick={() => togglePending(name)}
                    className="px-0.5 text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {maxCount !== undefined && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {totalCount}/{maxCount}
                </span>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground active:scale-95"
              >
                确定
              </button>
            </div>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索标签"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        {atLimit && (
          <p className="px-4 pt-2 text-xs text-amber-600">
            已达上限 {maxCount} 项，请删除部分后再添加。
          </p>
        )}

        <div className="flex min-h-0 flex-1 max-h-[50vh]">
          <ul className="w-[108px] shrink-0 overflow-y-auto border-r border-border bg-secondary/30 py-1">
            {catalog.map((cat: CatalogCategory) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setQuery("");
                  }}
                  className={cn(
                    "block w-full border-l-[3px] px-3 py-2.5 text-left text-xs transition-colors",
                    cat.id === activeCategoryId
                      ? "border-l-primary bg-background font-medium text-primary"
                      : "border-l-transparent text-muted-foreground",
                  )}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="min-w-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-hide">
            {searchResults ? (
              searchResults.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  未找到匹配项
                </p>
              ) : (
                <div>
                  <p className="mb-2 text-xs font-semibold text-foreground">
                    搜索结果
                  </p>
                  <div className="flex flex-wrap gap-2">{searchResults.map(renderTag)}</div>
                </div>
              )
            ) : (
              activeCategory.groups.map((group) => (
                <div key={group.title} className="mb-4 last:mb-0">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
                    <span className="h-3.5 w-0.5 rounded-full bg-primary" />
                    {group.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(renderTag)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestTagPickerModal;

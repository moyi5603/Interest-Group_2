import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import InterestTagPill from "@/components/interest/InterestTagPill";
import InterestTagPickerModal from "@/components/interest/InterestTagPickerModal";
import { getTagsByIds } from "@/data/interestTags";
import {
  addManualTag,
  dismissSuggestedTag,
  getProfileTags,
  removeTag,
} from "@/data/interestProfileStore";
import { CURRENT_EMPLOYEE_ID } from "@/data/interestGroups";
import { resolveTagIdsFromNames } from "@/lib/interestTagResolve";
import { getSuggestedTags } from "@/lib/interestTagSuggest";
import { cn } from "@/lib/utils";

const tagChipClass =
  "rounded-md border border-border bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground transition-base active:scale-[0.98]";

const MyInterests = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [version, setVersion] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const refresh = () => setVersion((n) => n + 1);

  const selectedIds = useMemo(
    () => getProfileTags().map((p) => p.tagId),
    [version],
  );
  const selected = useMemo(() => getTagsByIds(selectedIds), [selectedIds]);
  const suggested = useMemo(
    () =>
      getSuggestedTags(CURRENT_EMPLOYEE_ID).filter(
        (t) => !selectedIds.includes(t.id),
      ),
    [selectedIds],
  );

  const handlePickerConfirm = (names: string[]) => {
    const newIds = resolveTagIdsFromNames(names);
    const existing = new Set(selectedIds);
    for (const id of newIds) {
      if (!existing.has(id)) addManualTag(id);
    }
    setPickerOpen(false);
    refresh();
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/40 bg-background/90 px-3 py-2.5 backdrop-blur-lg">
        <button
          type="button"
          aria-label="返回"
          onClick={goBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold">我的兴趣</h1>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <section className="px-3 pb-4 pt-3">
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              添加兴趣
            </button>
          </div>

          {selected.length === 0 ? (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border/80 py-10 active:bg-secondary/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-xs text-muted-foreground">
                点击添加你的兴趣标签
              </span>
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((t) => (
                <InterestTagPill
                  key={t.id}
                  label={t.name}
                  selected
                  onRemove={() => {
                    removeTag(t.id);
                    refresh();
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {suggested.length > 0 && (
          <section className="border-t border-border/50 px-3 py-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI 建议补充
            </p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex overflow-hidden rounded-md border border-dashed border-primary/25"
                >
                  <button
                    type="button"
                    onClick={() => {
                      addManualTag(t.id);
                      refresh();
                    }}
                    className={cn(
                      tagChipClass,
                      "border-0 bg-primary/5 font-medium text-primary",
                    )}
                  >
                    + {t.name}
                  </button>
                  <button
                    type="button"
                    aria-label={`忽略${t.name}`}
                    onClick={() => {
                      dismissSuggestedTag(t.id);
                      refresh();
                    }}
                    className="border-l border-primary/15 px-2 text-xs text-muted-foreground active:bg-secondary/60"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}
      </main>

      <InterestTagPickerModal
        open={pickerOpen}
        existingTagIds={selectedIds}
        onConfirm={handlePickerConfirm}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
};

export default MyInterests;

import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InterestTagPicker from "@/components/interest/InterestTagPicker";
import { getTagsByIds } from "@/data/interestTags";
import {
  addManualTag,
  dismissSuggestedTag,
  getProfileTags,
  removeTag,
} from "@/data/interestProfileStore";
import { CURRENT_EMPLOYEE_ID } from "@/data/interestGroups";
import { getSuggestedTags } from "@/lib/interestTagSuggest";

const MyInterests = () => {
  const navigate = useNavigate();
  const [, bump] = useState(0);
  const profile = getProfileTags();
  const selectedIds = profile.map((p) => p.tagId);
  const selected = getTagsByIds(selectedIds);
  const suggested = getSuggestedTags(CURRENT_EMPLOYEE_ID);

  const refresh = () => bump((n) => n + 1);

  const toggleTag = (tagId: string) => {
    if (selectedIds.includes(tagId)) removeTag(tagId);
    else addManualTag(tagId);
    refresh();
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">我的兴趣</h1>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-3 pb-6 scrollbar-hide">
        <p className="text-xs text-muted-foreground">
          标签仅用于推荐，默认不对其他同事展示。
        </p>

        <section>
          <h2 className="mb-2 text-sm font-semibold">已选标签</h2>
          {selected.length === 0 ? (
            <p className="text-xs text-muted-foreground">还没有选择标签</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                >
                  {t.name} ×
                </button>
              ))}
            </div>
          )}
        </section>

        {suggested.length > 0 && (
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
            <p className="mb-2 flex items-center gap-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI 建议补充
            </p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((t) => (
                <span key={t.id} className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      addManualTag(t.id);
                      refresh();
                    }}
                    className="rounded-full bg-primary px-2.5 py-1 text-[11px] text-primary-foreground"
                  >
                    + {t.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dismissSuggestedTag(t.id);
                      refresh();
                    }}
                    className="rounded-full bg-secondary px-2 py-1 text-[11px] text-muted-foreground"
                  >
                    忽略
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-sm font-semibold">添加标签</h2>
          <InterestTagPicker
            selectedIds={selectedIds}
            onToggle={toggleTag}
            onAdd={(id) => {
              addManualTag(id);
              refresh();
            }}
            allowDeselect
          />
        </section>
      </main>
    </div>
  );
};

export default MyInterests;

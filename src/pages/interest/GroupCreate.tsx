import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import ActivityCoverUpload from "@/components/interest/ActivityCoverUpload";
import InterestTagPicker from "@/components/interest/InterestTagPicker";
import { DEFAULT_GROUP_COVER } from "@/data/interestImages";
import { getTagsByIds } from "@/data/interestTags";
import {
  CURRENT_EMPLOYEE_ID,
  createSpontaneousGroup,
} from "@/data/interestGroups";
import { interestTypography as t } from "@/components/interest/interestTypography";
import { toast } from "@/components/ui/sonner";

const GroupCreate = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | undefined>();

  const toggleTag = (id: string) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const submit = () => {
    if (!name.trim()) {
      toast.error("请填写小组名称");
      return;
    }
    if (tagIds.length === 0) {
      toast.error("请至少选择一个标签");
      return;
    }
    const group = createSpontaneousGroup(
      {
        name: name.trim(),
        description: description.trim() || "欢迎加入我们的兴趣小组！",
        visibility: "public",
        tagIds,
        coverUrl: coverUrl ?? DEFAULT_GROUP_COVER,
      },
      CURRENT_EMPLOYEE_ID,
    );
    toast.success("小组已创建");
    navigate(`/agents/interest-groups/${group.id}`);
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
        <button
          type="button"
          onClick={goBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className={t.pageTitle}>创建小组</h1>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-3 pb-24 scrollbar-hide">
        <ActivityCoverUpload
          value={coverUrl}
          onChange={setCoverUrl}
          label="小组封面"
          hint="建议横图，与小组详情页顶部展示一致；不上传则使用默认封面"
        />

        <label className="block space-y-1">
          <span className={t.formLabel}>小组名称</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            placeholder="例如：周末徒步社"
          />
        </label>

        <label className="block space-y-1">
          <span className={t.formLabel}>简介</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            placeholder="介绍一下小组活动内容"
          />
        </label>

        <div className="space-y-2">
          <span className={t.formLabel}>兴趣标签</span>
          {tagIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getTagsByIds(tagIds).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                >
                  {t.name} ×
                </button>
              ))}
            </div>
          )}
          <InterestTagPicker
            selectedIds={tagIds}
            onToggle={toggleTag}
            onAdd={(id) => {
              setTagIds((prev) =>
                prev.includes(id) ? prev : [...prev, id],
              );
            }}
            allowDeselect
            flat
          />
        </div>
      </main>

      <div className="border-t border-border bg-background p-3">
        <button
          type="button"
          onClick={submit}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
        >
          创建并上线
        </button>
      </div>
    </div>
  );
};

export default GroupCreate;

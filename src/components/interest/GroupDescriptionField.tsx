import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { interestTypography as t } from "@/components/interest/interestTypography";
import { getTagsByIds } from "@/data/interestTags";
import { generateGroupDescriptionAsync } from "@/lib/groupDescriptionAi";
import { toast } from "@/components/ui/sonner";

type Props = {
  value: string;
  onChange: (value: string) => void;
  groupName: string;
  tagIds: string[];
};

const GroupDescriptionField = ({
  value,
  onChange,
  groupName,
  tagIds,
}: Props) => {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!groupName.trim()) {
      toast.error("请先填写小组名称");
      return;
    }
    if (tagIds.length === 0) {
      toast.error("请先选择至少一个标签");
      return;
    }

    setGenerating(true);
    try {
      const tagNames = getTagsByIds(tagIds).map((tag) => tag.name);
      const text = await generateGroupDescriptionAsync(
        groupName.trim(),
        tagNames,
      );
      onChange(text);
      toast.success("简介已生成");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={t.formLabel}>简介</span>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-base active:scale-95 disabled:opacity-60"
        >
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          AI 生成简介
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
        placeholder="介绍一下小组活动内容，或使用 AI 一键生成"
      />
    </div>
  );
};

export default GroupDescriptionField;

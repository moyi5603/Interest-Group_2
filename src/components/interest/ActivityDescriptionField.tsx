import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { interestTypography as t } from "@/components/interest/interestTypography";
import type { ActivityKind } from "@/data/interestTypes";
import { generateActivityDescriptionAsync } from "@/lib/activityDescriptionAi";
import { toast } from "@/components/ui/sonner";

type Props = {
  value: string;
  onChange: (value: string) => void;
  title: string;
  activityKind: ActivityKind;
  location: string;
  groupName?: string;
  groupTagNames?: string[];
};

const ActivityDescriptionField = ({
  value,
  onChange,
  title,
  activityKind,
  location,
  groupName,
  groupTagNames,
}: Props) => {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const text = await generateActivityDescriptionAsync({
        title: title.trim(),
        activityKind,
        location: location.trim() || undefined,
        groupName: groupName?.trim() || undefined,
        tagNames: groupTagNames,
      });
      onChange(text);
      toast.success("活动介绍已生成");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={t.formLabel}>
          <span className={t.requiredMark} aria-hidden>
            *
          </span>
          活动介绍
        </span>
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
          AI 生成介绍
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="介绍一下活动内容，或使用 AI 一键生成"
        rows={4}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
      />
    </div>
  );
};

export default ActivityDescriptionField;

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import InterestTagPill from "@/components/interest/InterestTagPill";
import InterestTagPickerModal from "@/components/interest/InterestTagPickerModal";
import { GROUP_TAG_MAX } from "@/components/interest/groupFormConstants";
import { interestTypography as t } from "@/components/interest/interestTypography";
import { getTagsByIds } from "@/data/interestTags";
import { resolveTagIdsFromNames } from "@/lib/interestTagResolve";
import { toast } from "@/components/ui/sonner";

type Props = {
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  required?: boolean;
  hint?: string;
};

const GroupTagField = ({
  value,
  onChange,
  max = GROUP_TAG_MAX,
  required = false,
  hint,
}: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selected = useMemo(() => getTagsByIds(value), [value]);
  const atMax = value.length >= max;

  const hintText =
    hint ?? (required ? `（最多 ${max} 个）` : `（选填，最多 ${max} 个）`);

  const openPicker = () => {
    if (atMax) {
      toast.error(`最多选择 ${max} 个标签`);
      return;
    }
    setPickerOpen(true);
  };

  const handlePickerConfirm = (names: string[]) => {
    const newIds = resolveTagIdsFromNames(names);
    const existing = new Set(value);
    const merged = [...value];
    for (const id of newIds) {
      if (existing.has(id)) continue;
      if (merged.length >= max) {
        toast.error(`最多选择 ${max} 个标签`);
        break;
      }
      merged.push(id);
    }
    onChange(merged);
    setPickerOpen(false);
  };

  const removeTag = (id: string) => {
    onChange(value.filter((tagId) => tagId !== id));
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className={t.formLabel}>
            {required && (
              <span className={t.requiredMark} aria-hidden>
                *
              </span>
            )}
            标签
            <span className="ml-1 font-normal text-muted-foreground">
              {hintText}
            </span>
          </span>
          <button
            type="button"
            onClick={openPicker}
            disabled={atMax}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-base active:scale-95 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            添加标签
          </button>
        </div>

        <div className="flex min-h-[38px] flex-wrap gap-2">
          {selected.map((tag) => (
            <InterestTagPill
              key={tag.id}
              label={tag.name}
              selected
              onRemove={() => removeTag(tag.id)}
            />
          ))}
        </div>
      </div>

      <InterestTagPickerModal
        open={pickerOpen}
        existingTagIds={value}
        maxCount={max}
        title="选择标签"
        existingHint="该标签已添加"
        onConfirm={handlePickerConfirm}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
};

export default GroupTagField;

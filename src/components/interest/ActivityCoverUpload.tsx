import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import ActivityCover from "@/components/interest/ActivityCover";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

const MAX_SIZE_MB = 5;

type Props = {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
  label?: string;
  hint?: string;
};

const ActivityCoverUpload = ({
  value,
  onChange,
  className,
  label = "活动封面",
  hint = "建议横图，与活动详情页顶部展示一致；不上传则使用默认背景",
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`图片不能超过 ${MAX_SIZE_MB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.onerror = () => toast.error("图片读取失败");
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="relative">
        <ActivityCover
          coverUrl={value}
          className="h-36 w-full rounded-2xl"
        >
          {!value && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImagePlus className="h-8 w-8 opacity-60" />
              <span className="text-xs">上传封面图</span>
            </div>
          )}
        </ActivityCover>
        {!value ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 rounded-2xl"
            aria-label="上传活动封面"
          />
        ) : (
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] text-white active:scale-95"
            >
              更换
            </button>
            <button
              type="button"
              aria-label="移除封面"
              onClick={() => onChange(undefined)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
};

export default ActivityCoverUpload;

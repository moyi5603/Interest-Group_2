import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import ActivityCover from "@/components/interest/ActivityCover";
import { interestTypography as t } from "@/components/interest/interestTypography";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

const MAX_SIZE_MB = 5;

type Props = {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  /** banner 横图封面；square 方图头像 */
  aspect?: "banner" | "square";
};

const ActivityCoverUpload = ({
  value,
  onChange,
  className,
  label = "活动封面",
  hint,
  required = false,
  aspect = "banner",
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

  const isSquare = aspect === "square";

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className={t.formLabel}>
        {required ? (
          <span className={t.requiredMark} aria-hidden>
            *
          </span>
        ) : null}
        {label}
      </span>
      <div className={cn("relative", isSquare && "w-24")}>
        <ActivityCover
          coverUrl={value}
          className={
            isSquare
              ? "aspect-square h-24 w-24 rounded-xl"
              : "h-36 w-full rounded-2xl"
          }
        >
          {!value && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImagePlus className={cn(isSquare ? "h-6 w-6" : "h-8 w-8", "opacity-60")} />
              <span className={cn("text-sm", isSquare && "text-xs")}>
                {isSquare ? "上传头像" : "上传封面图"}
              </span>
            </div>
          )}
        </ActivityCover>
        {!value ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "absolute inset-0",
              isSquare ? "rounded-xl" : "rounded-2xl",
            )}
            aria-label={isSquare ? "上传小组头像" : "上传活动封面"}
          />
        ) : isSquare ? (
          <div className="absolute inset-x-1 bottom-1 flex justify-center gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white active:scale-95"
            >
              更换
            </button>
            <button
              type="button"
              aria-label="移除头像"
              onClick={() => onChange(undefined)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white active:scale-95"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-black/50 px-2.5 py-1 text-xs text-white active:scale-95"
            >
              更换
            </button>
            <button
              type="button"
              aria-label={isSquare ? "移除头像" : "移除封面"}
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
      {hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
};

export default ActivityCoverUpload;

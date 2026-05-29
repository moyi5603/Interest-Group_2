import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export const COMMENT_MAX_IMAGES = 9;
const MAX_SIZE_MB = 5;

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  className?: string;
};

const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("not-image"));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      reject(new Error("too-large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("read-failed"));
    };
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });

const CommentImagePicker = ({ value, onChange, className }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = COMMENT_MAX_IMAGES - value.length;

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const picked = Array.from(files).slice(0, remaining);
    const next = [...value];

    for (const file of picked) {
      if (next.length >= COMMENT_MAX_IMAGES) break;
      try {
        const url = await readImageFile(file);
        next.push(url);
      } catch (err) {
        const code = err instanceof Error ? err.message : "";
        if (code === "not-image") toast.error("请选择图片文件");
        else if (code === "too-large")
          toast.error(`单张图片不能超过 ${MAX_SIZE_MB}MB`);
        else toast.error("图片读取失败");
      }
    }

    if (files.length > remaining && next.length >= COMMENT_MAX_IMAGES) {
      toast.error(`最多上传 ${COMMENT_MAX_IMAGES} 张图片`);
    }

    onChange(next);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {value.map((url, index) => (
        <div
          key={`${url.slice(0, 24)}-${index}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
        >
          <img src={url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label="移除图片"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white active:scale-95"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground active:scale-[0.98]"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[10px]">{value.length}/{COMMENT_MAX_IMAGES}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default CommentImagePicker;

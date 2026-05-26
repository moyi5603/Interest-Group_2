import { useState } from "react";
import { Mic, Plus, ArrowUp, Image as ImageIcon } from "lucide-react";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
};

const ChatInputBar = ({ value, onChange, onSubmit, placeholder }: Props) => {
  const [internal, setInternal] = useState("");
  const controlled = value !== undefined;
  const v = controlled ? value! : internal;
  const setV = (next: string) => {
    if (controlled) onChange?.(next);
    else setInternal(next);
  };

  const submit = () => {
    if (!v.trim()) return;
    onSubmit?.(v.trim());
  };

  return (
    <div className="px-3 pb-2 pt-2">
      <div className="flex items-end gap-2 rounded-3xl gradient-input p-2 shadow-soft">
        <button
          aria-label="添加"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-base active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>

        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder ?? "问我任何工作相关的问题…"}
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {v.trim() ? (
          <button
            aria-label="发送"
            onClick={submit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow transition-bounce active:scale-90"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
          </button>
        ) : (
          <>
            <button
              aria-label="图片"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-base active:scale-95"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <button
              aria-label="语音"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow transition-base active:scale-95"
            >
              <Mic className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInputBar;

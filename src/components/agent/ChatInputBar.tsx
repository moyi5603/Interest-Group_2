import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const canSend = Boolean(v.trim());

  const submit = () => {
    const text = v.trim();
    if (!text) return;
    onSubmit?.(text);
    setV("");
  };

  return (
    <div className="px-3 pb-2 pt-2">
      <div className="flex items-end gap-2 rounded-3xl gradient-input p-2 shadow-soft">
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
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        <button
          type="button"
          aria-label="发送"
          disabled={!canSend}
          onClick={submit}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-bounce active:scale-90",
            canSend
              ? "gradient-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-muted-foreground",
          )}
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ChatInputBar;

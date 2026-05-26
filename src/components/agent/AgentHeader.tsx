import { History, Settings } from "lucide-react";

const AgentHeader = () => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-background/80 px-4 py-3 backdrop-blur-lg">
      <button
        aria-label="历史记录"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-base active:scale-95"
      >
        <History className="h-5 w-5" />
      </button>

      <div className="flex flex-col items-center">
        <h1 className="text-base font-semibold text-foreground">智能体</h1>
        <span className="text-[10px] text-muted-foreground">EXP AI Workspace</span>
      </div>

      <button
        aria-label="设置"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-base active:scale-95"
      >
        <Settings className="h-5 w-5" />
      </button>
    </header>
  );
};

export default AgentHeader;

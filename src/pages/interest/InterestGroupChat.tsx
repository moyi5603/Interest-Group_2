import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { useAppRole } from "@/hooks/useAppRole";
import ChatInputBar from "@/components/agent/ChatInputBar";
import InterestAgentReply from "@/components/interest/InterestAgentReply";
import { interestTypography as t } from "@/components/interest/interestTypography";
import { buildReply, parseIntent } from "@/lib/interestAgent";
import type { AgentReply } from "@/lib/interestAgent";
import {
  CURRENT_EMPLOYEE_ID,
  cancelEnrollment,
  terminateActivity,
} from "@/data/interestGroups";
import { toast } from "@/components/ui/sonner";

type Msg = { role: "user" | "assistant"; text: string; reply?: AgentReply };

const InterestGroupChat = () => {
  const goBack = useNavigateBack();
  const { isManager } = useAppRole();
  const [params] = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "你好！我是兴趣小组 AI 助手，可以为你推荐小组、查询近期活动，或解答参与方式。",
      reply: buildReply({ intent: "join_guide", timeFilter: "all" }),
    },
  ]);
  const [tick, setTick] = useState(0);
  const booted = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const appendExchange = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed === "保留报名") {
      setMessages((m) => [
        ...m,
        { role: "user", text: trimmed },
        {
          role: "assistant",
          text: "好的，已为你保留当前报名。如需查看，可前往「我的活动」。",
        },
      ]);
      return;
    }
    if (trimmed === "保留活动") {
      setMessages((m) => [
        ...m,
        { role: "user", text: trimmed },
        {
          role: "assistant",
          text: "好的，活动将继续保留。如需调整，可前往活动详情编辑。",
        },
      ]);
      return;
    }

    const parsed = parseIntent(trimmed);
    const reply = buildReply(parsed);
    setMessages((m) => [
      ...m,
      { role: "user", text: trimmed },
      { role: "assistant", text: reply.text, reply },
    ]);
  }, []);

  const send = useCallback(
    (text: string) => {
      appendExchange(text);
    },
    [appendExchange],
  );

  const handleTerminateConfirm = (activityId: string) => {
    const updated = terminateActivity(activityId, CURRENT_EMPLOYEE_ID);
    if (!updated) {
      toast.error("终止失败，请稍后再试");
      return;
    }
    toast.success("活动已终止");
    setTick((n) => n + 1);
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: "已终止该活动，未举办场次已取消。",
      },
    ]);
  };

  const handleCancelConfirm = (activityId: string) => {
    if (!cancelEnrollment(activityId, CURRENT_EMPLOYEE_ID)) {
      toast.error("取消失败，请稍后再试");
      return;
    }
    toast.success("已取消报名");
    setTick((n) => n + 1);
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: "已取消报名。如需参加其他活动，可以问我「这周有什么活动」。",
        reply: buildReply({
          intent: "list_activity",
          timeFilter: "week",
        }),
      },
    ]);
  };

  useEffect(() => {
    const q = params.get("q");
    if (q && !booted.current) {
      booted.current = true;
      send(q);
    }
  }, [params, send]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, tick]);

  if (isManager) {
    return <Navigate to="/agents/interest-groups" replace />;
  }

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-gradient-to-b from-primary/[0.07] via-background to-background">
      <header className="sticky top-0 z-30 border-b border-primary/10 bg-background/85 px-3 py-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="返回"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className={t.pageTitle}>兴趣小组助手</h1>
            <p className={t.pageSubtitle}>AI 对话 · 推荐与查询</p>
          </div>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-3 py-2 pb-2 scrollbar-hide"
      >
        {messages.map((m, i) => (
          <div
            key={`${i}-${tick}`}
            className={`flex flex-col gap-2 ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {m.role === "assistant" && (
              <span className="mb-0.5 flex items-center gap-1 px-1 text-sm font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                AI 助手
              </span>
            )}
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "border border-primary/10 bg-card shadow-soft text-foreground"
              }`}
            >
              {m.text}
            </div>
            {m.reply && (
              <InterestAgentReply
                reply={m.reply}
                onSuggest={send}
                onCancelConfirm={handleCancelConfirm}
                onTerminateConfirm={handleTerminateConfirm}
                onJoined={() => setTick((n) => n + 1)}
              />
            )}
          </div>
        ))}
      </main>

      <footer className="shrink-0 border-t border-primary/10 bg-gradient-to-t from-primary/[0.06] to-background/98 shadow-tab backdrop-blur-lg">
        <ChatInputBar placeholder="输入消息…" onSubmit={send} />
      </footer>
    </div>
  );
};

export default InterestGroupChat;

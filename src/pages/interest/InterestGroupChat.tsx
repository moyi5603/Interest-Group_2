import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ActivityCard from "@/components/interest/ActivityCard";
import GroupCard from "@/components/interest/GroupCard";
import ChatInputBar from "@/components/agent/ChatInputBar";
import InterestTopicPanel from "@/components/interest/InterestTopicPanel";
import { buildReply, parseIntent } from "@/lib/interestAgent";
import type { AgentReply } from "@/lib/interestAgent";

type Msg = { role: "user" | "assistant"; text: string; reply?: AgentReply };

const InterestGroupChat = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "你好！我是兴趣小组 AI 助手，可以为你推荐小组、查询近期活动，或解答参与方式。",
    },
  ]);
  const booted = useRef(false);

  const send = (text: string) => {
    const intent = parseIntent(text);
    const reply = buildReply(intent);
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "assistant", text: reply.text, reply },
    ]);
  };

  useEffect(() => {
    const q = params.get("q");
    if (q && !booted.current) {
      booted.current = true;
      send(q);
    }
  }, [params]);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-gradient-to-b from-primary/[0.07] via-background to-background">
      <header className="sticky top-0 z-30 border-b border-primary/10 bg-background/85 px-3 py-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold">兴趣小组助手</h1>
            <p className="text-[10px] text-muted-foreground">AI 对话 · 推荐与查询</p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto px-3 py-2 pb-2 scrollbar-hide">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col gap-2 ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {m.role === "assistant" && (
              <span className="mb-0.5 flex items-center gap-1 px-1 text-[9px] font-medium text-primary">
                <Sparkles className="h-2.5 w-2.5" />
                AI 助手
              </span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "border border-primary/10 bg-card shadow-soft text-foreground"
              }`}
            >
              {m.text}
            </div>
            {m.reply?.scoredGroups && (
              <ul className="w-full space-y-2">
                {m.reply.scoredGroups.map(({ group, reasons }) => (
                  <li key={group.id}>
                    <GroupCard
                      compact
                      group={group}
                      reasons={reasons}
                      onOpen={() =>
                        navigate(`/agents/interest-groups/${group.id}`)
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
            {m.reply?.groups && (
              <ul className="w-full space-y-2">
                {m.reply.groups.map((g) => (
                  <li key={g.id}>
                    <GroupCard
                      compact
                      group={g}
                      onOpen={() =>
                        navigate(`/agents/interest-groups/${group.id}`)
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
            {m.reply?.occurrences && (
              <ul className="w-full space-y-2">
                {m.reply.occurrences.map(({ activity, occurrence }) => (
                  <li key={occurrence.id}>
                    <ActivityCard
                      compact
                      activity={activity}
                      occurrence={occurrence}
                      onOpen={() =>
                        navigate(
                          `/agents/interest-groups/activities/${activity.id}`,
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </main>

      <footer className="shrink-0 border-t border-primary/10 bg-gradient-to-t from-primary/[0.06] to-background/98 shadow-tab backdrop-blur-lg">
        <div className="px-3 py-1.5">
          <InterestTopicPanel
            compact
            onSelect={send}
            className="rounded-xl border border-primary/10 bg-card/80 px-2 py-1.5"
          />
        </div>
        <ChatInputBar placeholder="输入问题…" onSubmit={send} />
      </footer>
    </div>
  );
};

export default InterestGroupChat;

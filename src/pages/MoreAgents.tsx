import { useMemo, useState } from "react";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { agents, categoryMeta, type AgentCategory } from "@/data/agents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import BottomTabBar from "@/components/agent/BottomTabBar";

type TabKey = AgentCategory;

const tabs: { key: TabKey; label: string }[] = [
  { key: "communication", label: categoryMeta.communication.short },
  { key: "development", label: categoryMeta.development.short },
  { key: "honor", label: categoryMeta.honor.short },
  { key: "care", label: categoryMeta.care.short },
];

const MoreAgents = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<TabKey>("communication");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((a) => {
      const matchTab = a.category === active;
      const matchQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.example.toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }, [active, query]);

  return (
    <>
      <h1 className="sr-only">更多 Agent - EXP 智能体市场</h1>
      <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
        {/* 顶部 返回 + 搜索 */}
        <header className="sticky top-0 z-30 bg-background/85 px-3 pb-2 pt-3 backdrop-blur-lg">
          <div className="flex items-center gap-2">
            <button
              aria-label="返回"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-base active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索 Agent 名称、能力或场景"
                className="h-10 rounded-full border-transparent bg-secondary pl-9 pr-4 text-sm shadow-soft placeholder:text-muted-foreground focus-visible:ring-1"
              />
            </div>
          </div>
        </header>

        <Tabs
          value={active}
          onValueChange={(v) => setActive(v as TabKey)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="px-3 pt-1">
            <TabsList className="h-auto w-full justify-start gap-1.5 overflow-x-auto rounded-none border-0 bg-transparent p-0 scrollbar-hide">
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.key}
                  value={t.key}
                  className="shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-none transition-base data-[state=active]:border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent
            value={active}
            forceMount
            className="mt-2 flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide"
          >
            {filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <Sparkles className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">没有找到相关 Agent</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {filtered.map((agent) => {
                  const Icon = agent.icon;
                  const handleClick = () => {
                    if (agent.id === "care-humanity") navigate("/agents/humanity-care");
                  };
                  return (
                    <li
                      key={agent.id}
                      onClick={handleClick}
                      className="group flex cursor-pointer items-start gap-3 rounded-2xl bg-card p-3 shadow-soft transition-base active:scale-[0.99] active:shadow-glow"
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-soft"
                        style={{
                          background: `linear-gradient(135deg, hsl(var(${agent.colorVar}) / 0.22), hsl(var(${agent.colorVar}) / 0.08))`,
                        }}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{ color: `hsl(var(${agent.colorVar}))` }}
                          strokeWidth={2.2}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            {agent.name}
                          </h3>
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                            style={{
                              color: `hsl(var(${agent.colorVar}))`,
                              backgroundColor: `hsl(var(${agent.colorVar}) / 0.12)`,
                            }}
                          >
                            {categoryMeta[agent.category].short}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {agent.description}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1 rounded-lg bg-accent/60 px-2 py-1">
                          <Sparkles className="h-3 w-3 shrink-0 text-accent-foreground" />
                          <p className="truncate text-[11px] text-accent-foreground">
                            "{agent.example}"
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        <BottomTabBar />
      </div>
    </>
  );
};

export default MoreAgents;

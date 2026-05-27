import { useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import GroupCard from "@/components/interest/GroupCard";
import InterestSection from "@/components/interest/InterestSection";
import SectionHeader from "@/components/interest/SectionHeader";
import { Input } from "@/components/ui/input";
import {
  CURRENT_EMPLOYEE_ID,
  joinGroup,
} from "@/data/interestGroups";
import { filterDiscoverGroups } from "@/lib/interestDiscover";
import {
  getRecommendSummary,
  recommendGroups,
} from "@/lib/interestRecommend";
import { toast } from "sonner";

const RECOMMEND_BATCH_SIZE = 10;

const InterestGroupDiscover = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  const [recommendOffset, setRecommendOffset] = useState(0);
  const searching = query.trim().length > 0;

  const recommended = useMemo(
    () =>
      searching
        ? []
        : recommendGroups(
            CURRENT_EMPLOYEE_ID,
            RECOMMEND_BATCH_SIZE,
            recommendOffset,
          ),
    [searching, tick, recommendOffset],
  );

  const searchResults = useMemo(
    () =>
      searching
        ? filterDiscoverGroups(CURRENT_EMPLOYEE_ID, "推荐", query)
        : [],
    [searching, query, tick],
  );

  const recommendSummary = useMemo(
    () => getRecommendSummary(CURRENT_EMPLOYEE_ID, recommended.length),
    [recommended.length],
  );

  const handleJoin = (groupId: string, name: string) => {
    if (!joinGroup(groupId, CURRENT_EMPLOYEE_ID)) {
      toast.error("小组已满");
      return;
    }
    setTick((n) => n + 1);
    toast.success(`已加入「${name}」`);
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-gradient-to-b from-primary/[0.07] via-background to-background">
      <header className="shrink-0 border-b border-primary/10 bg-background/90 px-3 pb-2 pt-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="返回"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="text-base font-semibold">加入小组</h1>
            <p className="text-[10px] text-muted-foreground">
              AI 智能推荐 · 按兴趣匹配
            </p>
          </div>
          <div className="w-9" />
        </div>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索小组名称或标签"
            className="h-10 rounded-xl border border-primary/10 bg-card pl-9 text-sm shadow-none"
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        {searching ? (
          searchResults.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              未找到相关小组
            </p>
          ) : (
            <div className="space-y-1.5 pb-4">
              <p className="px-0.5 text-xs font-medium text-muted-foreground">
                搜索结果 · {searchResults.length} 个
              </p>
              {searchResults.map((g) => (
                <GroupCard
                  key={g.id}
                  compact
                  group={g}
                  onOpen={() => navigate(`/agents/interest-groups/${g.id}`)}
                  onJoin={() => handleJoin(g.id, g.name)}
                />
              ))}
            </div>
          )
        ) : recommended.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            暂无推荐小组
          </p>
        ) : (
          <InterestSection variant="ai" className="mb-4">
            <SectionHeader
              title={
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  AI 为你推荐
                </span>
              }
              subtitle={recommendSummary}
              secondaryAction={{
                label: "换一批",
                icon: <RefreshCw className="h-3 w-3" />,
                onClick: () => setRecommendOffset((n) => n + 1),
              }}
            />
            <ul className="space-y-1.5">
              {recommended.map(({ group, reasons }) => (
                <li key={group.id}>
                  <GroupCard
                    compact
                    group={group}
                    reasons={reasons}
                    onOpen={() => navigate(`/agents/interest-groups/${group.id}`)}
                    onJoin={() => handleJoin(group.id, group.name)}
                  />
                </li>
              ))}
            </ul>
          </InterestSection>
        )}
      </main>
    </div>
  );
};

export default InterestGroupDiscover;

import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GroupDiscoverRow from "@/components/interest/GroupDiscoverRow";
import { Input } from "@/components/ui/input";
import {
  CURRENT_EMPLOYEE_ID,
  joinGroup,
  isMember,
} from "@/data/interestGroups";
import {
  discoverTabs,
  filterDiscoverGroups,
  type DiscoverTab,
} from "@/lib/interestDiscover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const InterestGroupDiscover = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<DiscoverTab>("推荐");
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);

  const groups = useMemo(
    () => filterDiscoverGroups(CURRENT_EMPLOYEE_ID, tab, query),
    [tab, query, tick],
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
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="shrink-0 bg-background px-3 pb-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="返回"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold">兴趣小组</h1>
          <div className="w-9" />
        </div>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="请输入"
            className="h-10 rounded-lg border-transparent bg-secondary pl-9 text-sm shadow-none"
          />
        </div>

        <div className="mt-3 flex gap-4 overflow-x-auto border-b border-border/60 scrollbar-hide">
          {discoverTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "shrink-0 pb-2 text-sm font-medium transition-colors",
                tab === t
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 scrollbar-hide">
        {groups.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {query.trim() ? "未找到相关小组" : "该分类下暂无小组"}
          </p>
        ) : (
          <div className="pb-4">
            {groups.map((g) => (
              <GroupDiscoverRow
                key={g.id}
                group={g}
                joined={isMember(g.id, CURRENT_EMPLOYEE_ID)}
                onOpen={() => navigate(`/agents/interest-groups/${g.id}`)}
                onJoin={() => handleJoin(g.id, g.name)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default InterestGroupDiscover;

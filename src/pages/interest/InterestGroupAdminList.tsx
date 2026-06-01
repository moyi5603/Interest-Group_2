import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ActivityCard from "@/components/interest/ActivityCard";
import GroupCard from "@/components/interest/GroupCard";
import InterestRoleGate from "@/components/interest/InterestRoleGate";
import { Input } from "@/components/ui/input";
import { getAllActiveGroups } from "@/data/interestGroups";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { matchGroupBySearchQuery } from "@/lib/interestDiscover";
import {
  getAllPublishedActivities,
  matchActivityItemBySearchQuery,
} from "@/lib/interestRecommend";
import { interestTypography as t } from "@/components/interest/interestTypography";

type AdminListKind = "groups" | "activities";

const isValidKind = (value: string): value is AdminListKind =>
  value === "groups" || value === "activities";

const pageMeta: Record<
  AdminListKind,
  { title: string; empty: string; searchPlaceholder: string; noResults: string }
> = {
  groups: {
    title: "小组管理",
    empty: "暂无已创建的小组",
    searchPlaceholder: "搜索小组名称或标签",
    noResults: "未找到相关小组",
  },
  activities: {
    title: "活动管理",
    empty: "暂无已发布的活动",
    searchPlaceholder: "搜索活动名称或所属小组",
    noResults: "未找到相关活动",
  },
};

const InterestGroupAdminList = () => {
  const { kind: kindParam } = useParams<{ kind: string }>();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [query, setQuery] = useState("");
  const kind = isValidKind(kindParam ?? "") ? kindParam : "groups";
  const meta = pageMeta[kind];
  const searching = query.trim().length > 0;

  const groups = useMemo(() => {
    if (kind !== "groups") return [];
    const all = getAllActiveGroups();
    if (!searching) return all;
    return all.filter((g) => matchGroupBySearchQuery(g, query));
  }, [kind, query, searching]);

  const activities = useMemo(() => {
    if (kind !== "activities") return [];
    const all = getAllPublishedActivities();
    if (!searching) return all;
    return all.filter((item) => matchActivityItemBySearchQuery(item, query));
  }, [kind, query, searching]);

  const openActivity = (id: string) =>
    navigate(`/agents/interest-groups/activities/${id}`);

  const listEmpty = kind === "groups" ? groups.length === 0 : activities.length === 0;

  return (
    <InterestRoleGate actionLabel="访问管理列表">
      <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
        <header className="sticky top-0 z-30 shrink-0 border-b border-border/40 bg-background/90 backdrop-blur-lg">
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              type="button"
              aria-label="返回"
              onClick={goBack}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className={t.pageTitle}>{meta.title}</h1>
          </div>

          <div className="relative px-3 pb-2">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={meta.searchPlaceholder}
              className="h-10 rounded-xl border border-border bg-card pl-9 text-sm shadow-none"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
          {listEmpty ? (
            <p className={t.empty}>
              {searching ? meta.noResults : meta.empty}
            </p>
          ) : kind === "groups" ? (
            <ul className="space-y-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <GroupCard
                    compact
                    group={g}
                    onOpen={() => navigate(`/agents/interest-groups/${g.id}`)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2">
              {activities.map((item) => (
                <li key={item.activity.id}>
                  <ActivityCard
                    compact
                    activity={item.activity}
                    groupName={item.group.name}
                    occurrence={item.statusOccurrence}
                    scheduleLabel={item.timeLabel}
                    onOpen={() => openActivity(item.activity.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </InterestRoleGate>
  );
};

export default InterestGroupAdminList;

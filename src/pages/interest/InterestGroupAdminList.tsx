import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FeaturedActivityCard from "@/components/interest/FeaturedActivityCard";
import GroupCard from "@/components/interest/GroupCard";
import InterestRoleGate from "@/components/interest/InterestRoleGate";
import { Input } from "@/components/ui/input";
import { getAllActiveGroups } from "@/data/interestGroups";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { useUrlEnumParam } from "@/hooks/useUrlEnumParam";
import { matchGroupBySearchQuery } from "@/lib/interestDiscover";
import {
  groupMatchesTagCatalogFilter,
  tagCatalogFilterKeys,
  tagCatalogFilterOptions,
  type TagCatalogFilterId,
} from "@/lib/interestGroupTagFilter";
import {
  filterRecentActivitiesByDate,
  getRecentActivitiesForAdmin,
  matchActivityItemBySearchQuery,
  type RecentActivityDateFilter,
} from "@/lib/interestRecommend";
import { interestTypography as t } from "@/components/interest/interestTypography";
import { cn } from "@/lib/utils";

type AdminListKind = "groups" | "activities";

const isValidKind = (value: string): value is AdminListKind =>
  value === "groups" || value === "activities";

const dateFilters: { key: RecentActivityDateFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "today", label: "今天" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
];

const dateFilterKeys = dateFilters.map((f) => f.key);

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
    empty: "暂无即将开始的活动",
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
  const [dateFilter, setDateFilter] = useUrlEnumParam<RecentActivityDateFilter>(
    "range",
    "all",
    dateFilterKeys,
  );
  const [tagCatalogFilter, setTagCatalogFilter] =
    useUrlEnumParam<TagCatalogFilterId>(
      "tagCat",
      "all",
      tagCatalogFilterKeys,
    );

  const allGroups = useMemo(
    () => (kind === "groups" ? getAllActiveGroups() : []),
    [kind],
  );

  const groups = useMemo(() => {
    if (kind !== "groups") return [];
    let list = allGroups;
    if (tagCatalogFilter !== "all") {
      list = list.filter((g) =>
        groupMatchesTagCatalogFilter(g, tagCatalogFilter),
      );
    }
    if (searching) {
      list = list.filter((g) => matchGroupBySearchQuery(g, query));
    }
    return list;
  }, [kind, allGroups, tagCatalogFilter, query, searching]);

  const recentAll = useMemo(
    () => (kind === "activities" ? getRecentActivitiesForAdmin() : []),
    [kind],
  );

  const recentFiltered = useMemo(
    () => filterRecentActivitiesByDate(recentAll, dateFilter),
    [recentAll, dateFilter],
  );

  const activities = useMemo(() => {
    if (kind !== "activities") return [];
    if (!searching) return recentFiltered;
    return recentFiltered.filter((item) =>
      matchActivityItemBySearchQuery(item, query),
    );
  }, [kind, recentFiltered, query, searching]);

  const openActivity = (id: string) =>
    navigate(`/agents/interest-groups/activities/${id}`);

  const listEmpty =
    kind === "groups" ? allGroups.length === 0 : recentAll.length === 0;
  const groupFilterEmpty =
    kind === "groups" && !listEmpty && groups.length === 0;
  const activityFilterEmpty =
    kind === "activities" && !listEmpty && activities.length === 0;

  const groupEmptyMessage = searching
    ? meta.noResults
    : tagCatalogFilter !== "all"
      ? "该标签分类下暂无小组"
      : meta.empty;

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

          {kind === "groups" && (
            <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-hide">
              {tagCatalogFilterOptions.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTagCatalogFilter(key)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-base active:scale-95",
                    tagCatalogFilter === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/70 text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {kind === "activities" && (
            <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-hide">
              {dateFilters.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDateFilter(key)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-base active:scale-95",
                    dateFilter === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/70 text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
          {listEmpty ? (
            <p className={t.empty}>{meta.empty}</p>
          ) : groupFilterEmpty ? (
            <p className={t.empty}>{groupEmptyMessage}</p>
          ) : activityFilterEmpty ? (
            <p className={t.empty}>
              {searching ? meta.noResults : "该时段暂无活动"}
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
                  <FeaturedActivityCard
                    item={item}
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

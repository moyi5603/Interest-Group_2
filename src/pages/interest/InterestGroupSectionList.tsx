import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { useUrlEnumParam } from "@/hooks/useUrlEnumParam";
import FeaturedActivityCard from "@/components/interest/FeaturedActivityCard";
import GroupCard from "@/components/interest/GroupCard";
import RecentActivitiesEmptyState from "@/components/interest/RecentActivitiesEmptyState";
import { Input } from "@/components/ui/input";
import {
  CURRENT_EMPLOYEE_ID,
  getMyCreatedGroups,
  getMyJoinedGroups,
  joinGroup,
} from "@/data/interestGroups";
import {
  filterRecentActivitiesByDate,
  getRecentActivities,
  matchActivityItemBySearchQuery,
  recommendGroups,
  type RecentActivityDateFilter,
} from "@/lib/interestRecommend";
import type { InterestListSection } from "@/data/interestTypes";
import { interestTypography as t } from "@/components/interest/interestTypography";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { useAppRole } from "@/hooks/useAppRole";
import { matchGroupBySearchQuery } from "@/lib/interestDiscover";
import {
  groupMatchesTagCatalogFilter,
  tagCatalogFilterKeys,
  tagCatalogFilterOptions,
  type TagCatalogFilterId,
} from "@/lib/interestGroupTagFilter";

const DISCOVER_PATH = "/agents/interest-groups/discover";

const sectionMeta: Record<
  InterestListSection,
  { title: string; empty: string; searchPlaceholder?: string; noResults?: string }
> = {
  recent: {
    title: "活动广场",
    empty: "暂无即将开始的活动",
    searchPlaceholder: "搜索活动名称或所属小组",
    noResults: "未找到相关活动",
  },
  "my-groups": {
    title: "我的小组",
    empty: "",
    searchPlaceholder: "搜索小组名称或标签",
    noResults: "未找到相关小组",
  },
  recommend: { title: "AI 推荐", empty: "暂无推荐小组" },
};

const dateFilters: { key: RecentActivityDateFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "today", label: "今天" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
];

const dateFilterKeys = dateFilters.map((f) => f.key);

type MyGroupsTab = "created" | "joined";

const myGroupsTabs: { key: MyGroupsTab; label: string }[] = [
  { key: "created", label: "我创建的" },
  { key: "joined", label: "我加入的" },
];

const myGroupsTabKeys = myGroupsTabs.map((t) => t.key);

const isValidSection = (s: string): s is InterestListSection =>
  s in sectionMeta;

const managerMyGroupsTabKeys = myGroupsTabKeys;
const employeeMyGroupsTabKeys = ["joined"] as const satisfies readonly MyGroupsTab[];

const InterestGroupSectionList = () => {
  const { section: sectionParam } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const { isManager } = useAppRole();
  const [query, setQuery] = useState("");
  const [groupQuery, setGroupQuery] = useState("");
  const section = isValidSection(sectionParam ?? "")
    ? sectionParam
    : "recent";
  const meta = sectionMeta[section];
  const searching = query.trim().length > 0;
  const groupSearching = groupQuery.trim().length > 0;
  const [dateFilter, setDateFilter] = useUrlEnumParam<RecentActivityDateFilter>(
    "range",
    "all",
    dateFilterKeys,
  );
  const [myGroupsTab, setMyGroupsTab] = useUrlEnumParam<MyGroupsTab>(
    "role",
    isManager ? "created" : "joined",
    isManager ? managerMyGroupsTabKeys : employeeMyGroupsTabKeys,
  );
  const [tagCatalogFilter, setTagCatalogFilter] =
    useUrlEnumParam<TagCatalogFilterId>(
      "tagCat",
      "all",
      tagCatalogFilterKeys,
    );

  const myCreatedGroups = useMemo(
    () =>
      section === "my-groups"
        ? getMyCreatedGroups(CURRENT_EMPLOYEE_ID)
        : [],
    [section],
  );

  const myJoinedGroups = useMemo(
    () =>
      section === "my-groups"
        ? getMyJoinedGroups(CURRENT_EMPLOYEE_ID)
        : [],
    [section],
  );

  const myGroupsAll = isManager
    ? myGroupsTab === "created"
      ? myCreatedGroups
      : myJoinedGroups
    : myJoinedGroups;

  const myGroupsFiltered = useMemo(() => {
    if (section !== "my-groups") return [];
    let list = myGroupsAll;
    if (tagCatalogFilter !== "all") {
      list = list.filter((g) =>
        groupMatchesTagCatalogFilter(g, tagCatalogFilter),
      );
    }
    if (groupSearching) {
      list = list.filter((g) => matchGroupBySearchQuery(g, groupQuery));
    }
    return list;
  }, [section, myGroupsAll, tagCatalogFilter, groupQuery, groupSearching]);

  const openActivity = (id: string) =>
    navigate(`/agents/interest-groups/activities/${id}`);

  const recentAll = useMemo(
    () => (section === "recent" ? getRecentActivities(CURRENT_EMPLOYEE_ID) : []),
    [section],
  );

  const recentFiltered = useMemo(
    () => filterRecentActivitiesByDate(recentAll, dateFilter),
    [recentAll, dateFilter],
  );

  const recentActivities = useMemo(() => {
    if (section !== "recent") return [];
    if (!searching) return recentFiltered;
    return recentFiltered.filter((item) =>
      matchActivityItemBySearchQuery(item, query),
    );
  }, [section, recentFiltered, query, searching]);

  const content = useMemo(() => {
    switch (section) {
      case "recent": {
        return (
          <ul className="space-y-2">
            {recentActivities.map((item) => (
              <li key={item.activity.id}>
                <FeaturedActivityCard
                  item={item}
                  showEnrollClosingSoon={!isManager}
                  onOpen={() => openActivity(item.activity.id)}
                />
              </li>
            ))}
          </ul>
        );
      }
      case "my-groups": {
        return (
          <ul className="space-y-2">
            {myGroupsFiltered.map((g) => (
              <li key={g.id}>
                <GroupCard
                  compact
                  group={g}
                  onOpen={() => navigate(`/agents/interest-groups/${g.id}`)}
                />
              </li>
            ))}
          </ul>
        );
      }
      case "recommend": {
        const scored = recommendGroups(CURRENT_EMPLOYEE_ID, 20);
        return (
          <ul className="space-y-2">
            {scored.map(({ group, reasons }) => (
              <li key={group.id}>
                <GroupCard
                  compact
                  group={group}
                  reasons={reasons}
                  onOpen={() => navigate(`/agents/interest-groups/${group.id}`)}
                  onJoin={() => {
                    if (!joinGroup(group.id, CURRENT_EMPLOYEE_ID)) {
                      toast.error("小组已满");
                      return;
                    }
                    toast.success(`已加入「${group.name}」`);
                  }}
                />
              </li>
            ))}
          </ul>
        );
      }
    }
  }, [section, navigate, recentActivities, myGroupsFiltered]);

  const isEmpty = useMemo(() => {
    switch (section) {
      case "recent":
        return recentAll.length === 0;
      case "my-groups":
        return myGroupsAll.length === 0;
      case "recommend":
        return recommendGroups(CURRENT_EMPLOYEE_ID, 1).length === 0;
    }
  }, [section, recentAll.length, myGroupsAll.length]);

  const emptyMessage = useMemo(() => {
    if (section === "my-groups") {
      return isManager && myGroupsTab === "created"
        ? "还没有创建小组"
        : "还没有加入小组";
    }
    return meta.empty;
  }, [section, isManager, myGroupsTab, meta.empty]);

  const myGroupsFilterEmpty =
    section === "my-groups" &&
    myGroupsAll.length > 0 &&
    myGroupsFiltered.length === 0;

  const myGroupsEmptyMessage = groupSearching
    ? meta.noResults ?? "未找到相关小组"
    : tagCatalogFilter !== "all"
      ? "该标签分类下暂无小组"
      : emptyMessage;

  const recentFilterEmpty =
    section === "recent" &&
    !isEmpty &&
    recentFiltered.length === 0 &&
    !searching;

  const recentSearchEmpty =
    section === "recent" &&
    !isEmpty &&
    searching &&
    recentActivities.length === 0;

  return (
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

        {section === "recent" && !isManager && (
          <div className="relative px-3 pb-2">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={meta.searchPlaceholder}
              className="h-10 rounded-xl border border-border bg-card pl-9 text-sm shadow-none"
            />
          </div>
        )}

        {section === "recent" && (
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

        {section === "my-groups" && isManager && (
          <div className="mx-3 mb-2 flex rounded-lg bg-secondary/80 p-0.5">
            {myGroupsTabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMyGroupsTab(key)}
                className={cn(
                  "flex-1 rounded-md py-2.5 text-sm font-medium transition-colors",
                  myGroupsTab === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {section === "my-groups" && (
          <div className="relative px-3 pb-2">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={groupQuery}
              onChange={(e) => setGroupQuery(e.target.value)}
              placeholder={meta.searchPlaceholder}
              className="h-10 rounded-xl border border-border bg-card pl-9 text-sm shadow-none"
            />
          </div>
        )}

        {section === "my-groups" && (
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
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        {isEmpty && section === "recent" && !isManager ? (
          <RecentActivitiesEmptyState onAction={() => navigate(DISCOVER_PATH)} />
        ) : isEmpty ? (
          <p className={t.empty}>{emptyMessage}</p>
        ) : myGroupsFilterEmpty ? (
          <p className={t.empty}>{myGroupsEmptyMessage}</p>
        ) : recentFilterEmpty ? (
          <p className={t.empty}>该时段暂无活动</p>
        ) : recentSearchEmpty ? (
          <p className={t.empty}>{meta.noResults}</p>
        ) : (
          content
        )}
      </main>
    </div>
  );
};

export default InterestGroupSectionList;

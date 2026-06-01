import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { useUrlEnumParam } from "@/hooks/useUrlEnumParam";
import ActivityCard from "@/components/interest/ActivityCard";
import GroupCard from "@/components/interest/GroupCard";
import {
  CURRENT_EMPLOYEE_ID,
  getMyCreatedGroups,
  getMyJoinedGroups,
  joinGroup,
} from "@/data/interestGroups";
import {
  filterRecentActivitiesByDate,
  getRecentActivities,
  recommendGroups,
  type RecentActivityDateFilter,
} from "@/lib/interestRecommend";
import type { InterestListSection } from "@/data/interestTypes";
import { interestTypography as t } from "@/components/interest/interestTypography";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

const sectionMeta: Record<
  InterestListSection,
  { title: string; empty: string }
> = {
  recent: { title: "活动广场", empty: "暂无即将开始的活动" },
  "my-groups": { title: "我的小组", empty: "" },
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

const InterestGroupSectionList = () => {
  const { section: sectionParam } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const section = isValidSection(sectionParam ?? "")
    ? sectionParam
    : "recent";
  const meta = sectionMeta[section];
  const [dateFilter, setDateFilter] = useUrlEnumParam<RecentActivityDateFilter>(
    "range",
    "all",
    dateFilterKeys,
  );
  const [myGroupsTab, setMyGroupsTab] = useUrlEnumParam<MyGroupsTab>(
    "role",
    "created",
    myGroupsTabKeys,
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

  const myGroupsList =
    myGroupsTab === "created" ? myCreatedGroups : myJoinedGroups;

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

  const content = useMemo(() => {
    switch (section) {
      case "recent": {
        return (
          <ul className="space-y-2">
            {recentFiltered.map((item) => (
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
        );
      }
      case "my-groups": {
        return (
          <ul className="space-y-2">
            {myGroupsList.map((g) => (
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
  }, [section, navigate, recentFiltered, myGroupsList]);

  const isEmpty = useMemo(() => {
    switch (section) {
      case "recent":
        return recentAll.length === 0;
      case "my-groups":
        return myGroupsList.length === 0;
      case "recommend":
        return recommendGroups(CURRENT_EMPLOYEE_ID, 1).length === 0;
    }
  }, [section, recentAll.length, myGroupsList.length]);

  const emptyMessage = useMemo(() => {
    if (section === "my-groups") {
      return myGroupsTab === "created"
        ? "还没有创建小组"
        : "还没有加入小组";
    }
    return meta.empty;
  }, [section, myGroupsTab, meta.empty]);

  const recentFilterEmpty =
    section === "recent" && !isEmpty && recentFiltered.length === 0;

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

        {section === "my-groups" && (
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
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        {isEmpty ? (
          <p className={t.empty}>{emptyMessage}</p>
        ) : recentFilterEmpty ? (
          <p className={t.empty}>该时段暂无活动</p>
        ) : (
          content
        )}
      </main>
    </div>
  );
};

export default InterestGroupSectionList;

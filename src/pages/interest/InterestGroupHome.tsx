import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Plus,
  RefreshCw,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { useUrlEnumParam } from "@/hooks/useUrlEnumParam";
import FeaturedActivityCard from "@/components/interest/FeaturedActivityCard";
import GroupCard from "@/components/interest/GroupCard";
import InterestHomeStatsCard from "@/components/interest/InterestHomeStatsCard";
import InterestSection from "@/components/interest/InterestSection";
import InterestTopicPanel from "@/components/interest/InterestTopicPanel";
import RecentActivitiesEmptyState from "@/components/interest/RecentActivitiesEmptyState";
import RecommendedGroupsEmptyState from "@/components/interest/RecommendedGroupsEmptyState";
import SectionHeader from "@/components/interest/SectionHeader";
import ChatInputBar from "@/components/agent/ChatInputBar";
import type { InterestListSection } from "@/data/interestTypes";
import {
  CURRENT_EMPLOYEE_ID,
  joinGroup,
} from "@/data/interestGroups";
import {
  getRecentActivities,
  getRecentActivitiesForAdmin,
  recommendGroups,
} from "@/lib/interestRecommend";
import {
  getHomeStats,
  type HomeStatsPeriod,
} from "@/lib/interestHomeStats";
import { HOME_SUGGESTED_QUESTIONS } from "@/lib/interestAgent";
import { runGrowthEngineScheduledChecks } from "@/lib/growthEngineScheduler";
import { toast } from "@/components/ui/sonner";
import RoleIdentitySwitcher from "@/components/interest/RoleIdentitySwitcher";
import { useAppRole } from "@/hooks/useAppRole";
import { cn } from "@/lib/utils";

const DISCOVER_PATH = "/agents/interest-groups/discover";

const MY_ACTIVITIES_PATH = "/agents/interest-groups/my-activities";

const MY_GROUPS_PATH = "/agents/interest-groups/list/my-groups";

const RECENT_ACTIVITIES_PATH = "/agents/interest-groups/list/recent";

type HomeShortcut = {
  label: string;
  icon: typeof CalendarDays;
  getTo?: () => string;
  to?: string;
};

const ADMIN_GROUPS_PATH = "/agents/interest-groups/admin/groups";
const ADMIN_ACTIVITIES_PATH = "/agents/interest-groups/admin/activities";

const employeeShortcuts: HomeShortcut[] = [
  { label: "活动广场", icon: CalendarDays, to: RECENT_ACTIVITIES_PATH },
  { label: "小组广场", icon: UserPlus, to: DISCOVER_PATH },
  { label: "我的活动", icon: CalendarCheck, to: MY_ACTIVITIES_PATH },
  { label: "我的小组", icon: Users, to: MY_GROUPS_PATH },
];

const managerShortcuts: HomeShortcut[] = [
  { label: "小组管理", icon: Users, to: ADMIN_GROUPS_PATH },
  { label: "活动管理", icon: CalendarCheck, to: ADMIN_ACTIVITIES_PATH },
  {
    label: "创建小组",
    icon: Plus,
    to: "/agents/interest-groups/new",
  },
];

const viewMore = (navigate: ReturnType<typeof useNavigate>, section: InterestListSection) => ({
  label: "查看更多",
  trailingIcon: <ChevronRight className="h-3.5 w-3.5" />,
  onClick: () => navigate(`/agents/interest-groups/list/${section}`),
});

type HomeFeedTab = "activities" | "groups";

const homeFeedTabs: { key: HomeFeedTab; label: string }[] = [
  { key: "activities", label: "活动广场" },
  { key: "groups", label: "小组广场" },
];

const homeFeedTabKeys = homeFeedTabs.map((t) => t.key);

const InterestGroupHome = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const { role: appRole, setRole: setAppRole, isManager } = useAppRole();
  const [statsPeriod, setStatsPeriod] = useState<HomeStatsPeriod>("week");
  const [recommendOffset, setRecommendOffset] = useState(0);
  const [joinTick, setJoinTick] = useState(0);
  const [previewRecentEmpty, setPreviewRecentEmpty] = useState(false);
  const [previewGroupsEmpty, setPreviewGroupsEmpty] = useState(false);
  const [feedTab, setFeedTab] = useUrlEnumParam<HomeFeedTab>(
    "feed",
    "activities",
    homeFeedTabKeys,
  );
  const visibleShortcuts = useMemo(
    () => (isManager ? managerShortcuts : employeeShortcuts),
    [isManager],
  );
  const suggestedQuestions = useMemo(
    () => HOME_SUGGESTED_QUESTIONS.filter((q) => q !== "怎么发起一个活动？"),
    [],
  );
  const recommended = useMemo(
    () =>
      isManager ? [] : recommendGroups(CURRENT_EMPLOYEE_ID, 5, recommendOffset),
    [isManager, recommendOffset],
  );
  const recentActivities = useMemo(
    () =>
      (isManager
        ? getRecentActivitiesForAdmin()
        : getRecentActivities(CURRENT_EMPLOYEE_ID)
      ).slice(0, 3),
    [isManager],
  );
  const homeStats = useMemo(
    () =>
      isManager ? getHomeStats(CURRENT_EMPLOYEE_ID, true, statsPeriod) : null,
    [isManager, statsPeriod],
  );

  useEffect(() => {
    runGrowthEngineScheduledChecks();
  }, []);

  const showRecentActivitiesEmpty =
    previewRecentEmpty || recentActivities.length === 0;

  const showRecommendedGroupsEmpty =
    previewGroupsEmpty || recommended.length === 0;

  const handleFeedTabChange = (tab: HomeFeedTab) => {
    if (tab === "groups") setPreviewRecentEmpty(false);
    if (tab === "activities") setPreviewGroupsEmpty(false);
    setFeedTab(tab);
  };

  const openRecentEmptyAction = () =>
    navigate(isManager ? ADMIN_GROUPS_PATH : DISCOVER_PATH);

  const openEmployeeHomeEmptyAction = () => handleFeedTabChange("groups");

  const handleRoleChange = (role: typeof appRole) => {
    setPreviewRecentEmpty(false);
    setPreviewGroupsEmpty(false);
    setAppRole(role);
  };

  const goChat = (q?: string) => {
    navigate(
      q
        ? `/agents/interest-groups/chat?q=${encodeURIComponent(q)}`
        : "/agents/interest-groups/chat",
    );
  };

  const openActivity = (id: string) =>
    navigate(`/agents/interest-groups/activities/${id}`);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-gradient-to-b from-primary/[0.07] via-background to-background">
      <header className="sticky top-0 z-30 border-b border-primary/10 bg-background/85 px-3 py-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="返回"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary transition-base active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-foreground">兴趣小组</h1>
            <p className="text-xs text-muted-foreground">
              {isManager ? "小组与活动管理" : "AI 推荐 · 活动发现 · 智能对话"}
            </p>
          </div>
          <RoleIdentitySwitcher value={appRole} onChange={handleRoleChange} />
        </div>
      </header>

      <main className="flex-1 space-y-2.5 overflow-y-auto px-3 py-2 scrollbar-hide">
        <InterestSection variant="plain" className="p-2.5">
          <div
            className={`grid gap-1.5 ${isManager ? "grid-cols-3" : "grid-cols-4"}`}
          >
            {visibleShortcuts.map((s) => {
              const Icon = s.icon;
              const target = s.getTo?.() ?? s.to ?? "/agents/interest-groups";
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => navigate(target)}
                  className="flex flex-col items-center gap-1 rounded-xl p-1.5 transition-base active:scale-95"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/10 ring-1 ring-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-center text-xs font-medium leading-tight text-foreground">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </InterestSection>

        {!isManager && (
          <div className="flex rounded-lg bg-secondary/80 p-0.5">
            {homeFeedTabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFeedTabChange(key)}
                className={cn(
                  "flex-1 rounded-md py-2.5 text-sm font-medium transition-colors active:scale-[0.99]",
                  feedTab === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {isManager && homeStats && (
          <InterestSection variant="plain" className="p-2.5">
            <InterestHomeStatsCard
              stats={homeStats}
              period={statsPeriod}
              onPeriodChange={setStatsPeriod}
            />
          </InterestSection>
        )}

        {(isManager || feedTab === "activities") && (
        <InterestSection variant="hub" className="p-2.5">
          <SectionHeader
            title={
              isManager ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  近期活动
                </span>
              ) : undefined
            }
            action={
              isManager
                ? {
                    label: "查看更多",
                    trailingIcon: <ChevronRight className="h-3.5 w-3.5" />,
                    onClick: () => navigate(ADMIN_ACTIVITIES_PATH),
                  }
                : viewMore(navigate, "recent")
            }
            secondaryAction={
              (isManager || feedTab === "activities") &&
              recentActivities.length > 0
                ? {
                    label: previewRecentEmpty
                      ? "返回活动列表"
                      : "查看无活动样式",
                    onClick: () => setPreviewRecentEmpty((v) => !v),
                    subtle: !previewRecentEmpty,
                  }
                : undefined
            }
          />
          {showRecentActivitiesEmpty ? (
            <RecentActivitiesEmptyState
              isManager={isManager}
              onAction={
                isManager ? openRecentEmptyAction : openEmployeeHomeEmptyAction
              }
            />
          ) : (
            <ul className="space-y-2 pt-0.5">
              {recentActivities.map((item) => (
                <li key={item.activity.id}>
                  <FeaturedActivityCard
                    item={item}
                    onOpen={() => openActivity(item.activity.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </InterestSection>
        )}

        {!isManager && feedTab === "groups" && (
          <InterestSection variant="plain" className="p-2.5">
            <SectionHeader
              secondaryAction={
                recommended.length > 0
                  ? {
                      label: previewGroupsEmpty
                        ? "返回小组列表"
                        : "查看无小组样式",
                      onClick: () => setPreviewGroupsEmpty((v) => !v),
                      subtle: !previewGroupsEmpty,
                    }
                  : undefined
              }
              tertiaryAction={
                recommended.length > 0 && !previewGroupsEmpty
                  ? {
                      label: "换一批",
                      icon: <RefreshCw className="h-3.5 w-3.5" />,
                      onClick: () => setRecommendOffset((n) => n + 1),
                    }
                  : undefined
              }
              action={{
                label: "查看更多",
                trailingIcon: <ChevronRight className="h-3.5 w-3.5" />,
                onClick: () => navigate(DISCOVER_PATH),
              }}
            />
            {showRecommendedGroupsEmpty ? (
              <RecommendedGroupsEmptyState
                onAction={() => navigate(MY_GROUPS_PATH)}
              />
            ) : (
              <ul className="space-y-2">
                {recommended.map(({ group, reasons }) => (
                  <li key={`${group.id}-${joinTick}`}>
                    <GroupCard
                      compact
                      flat
                      group={group}
                      reasons={reasons}
                      onOpen={() => navigate(`/agents/interest-groups/${group.id}`)}
                      onJoin={() => {
                        if (!joinGroup(group.id, CURRENT_EMPLOYEE_ID)) {
                          toast.error("小组已满");
                          return;
                        }
                        setJoinTick((n) => n + 1);
                        toast.success(`已加入「${group.name}」`);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </InterestSection>
        )}
      </main>

      {!isManager && (
      <footer className="shrink-0 border-t border-primary/10 bg-gradient-to-t from-primary/[0.06] to-background/98 shadow-tab backdrop-blur-lg">
        <div className="flex items-center gap-2 px-3 pt-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              兴趣小组助手
            </p>
            <p className="text-xs text-muted-foreground">
              推荐小组、查询活动、解答参与问题
            </p>
          </div>
        </div>
        <div className="px-3 py-2">
          <InterestTopicPanel
            compact
            topics={suggestedQuestions}
            hideRefresh
            onSelect={goChat}
            className="rounded-xl border border-primary/10 bg-card/80 px-2.5 py-2"
          />
        </div>
        <ChatInputBar
          placeholder="问问兴趣小组助手…"
          onSubmit={(text) => goChat(text)}
        />
      </footer>
      )}
    </div>
  );
};

export default InterestGroupHome;

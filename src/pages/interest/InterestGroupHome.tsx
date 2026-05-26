import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  Plus,
  RefreshCw,
  Sparkles,
  Tag,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityCard from "@/components/interest/ActivityCard";
import GroupCard from "@/components/interest/GroupCard";
import InterestAiHero from "@/components/interest/InterestAiHero";
import InterestSection from "@/components/interest/InterestSection";
import InterestTopicPanel from "@/components/interest/InterestTopicPanel";
import SectionHeader from "@/components/interest/SectionHeader";
import ChatInputBar from "@/components/agent/ChatInputBar";
import type { InterestListSection } from "@/data/interestTypes";
import {
  CURRENT_EMPLOYEE_ID,
  getJoinedGroups,
  joinGroup,
} from "@/data/interestGroups";
import { getProfileTagIds } from "@/data/interestProfileStore";
import {
  getRecommendSummary,
  getUpcomingOccurrences,
  recommendGroups,
} from "@/lib/interestRecommend";
import { toast } from "sonner";

const DISCOVER_PATH = "/agents/interest-groups/discover";

const MY_ACTIVITIES_PATH = "/agents/interest-groups/my-activities";

const shortcuts = [
  { label: "近期活动", icon: CalendarDays, to: "#recent-activities" },
  { label: "加入小组", icon: UserPlus, to: DISCOVER_PATH },
  { label: "我的活动", icon: CalendarCheck, to: MY_ACTIVITIES_PATH },
  { label: "我的兴趣", icon: Tag, to: "/profile/interests" },
  { label: "创建小组", icon: Plus, to: "/agents/interest-groups/new" },
  { label: "我的小组", icon: Users, to: "#my-groups" },
] as const;

const viewMore = (navigate: ReturnType<typeof useNavigate>, section: InterestListSection) => ({
  label: "查看更多",
  onClick: () => navigate(`/agents/interest-groups/list/${section}`),
});

const InterestGroupHome = () => {
  const navigate = useNavigate();
  const tagCount = getProfileTagIds().length;
  const [recommendOffset, setRecommendOffset] = useState(0);
  const recommended = useMemo(
    () => recommendGroups(CURRENT_EMPLOYEE_ID, 3, recommendOffset),
    [recommendOffset],
  );
  const recommendSummary = useMemo(
    () => getRecommendSummary(CURRENT_EMPLOYEE_ID, recommended.length),
    [recommended.length],
  );
  const heroHint = useMemo(() => {
    if (tagCount < 2) {
      return "完善兴趣标签后，AI 能更懂你的喜好并推荐合适的小组与活动。";
    }
    return recommendSummary;
  }, [tagCount, recommendSummary]);
  const myGroups = useMemo(() => getJoinedGroups(CURRENT_EMPLOYEE_ID), []);
  const recentActivities = useMemo(
    () => getUpcomingOccurrences(CURRENT_EMPLOYEE_ID, 2),
    [],
  );

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
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary transition-base active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-foreground">兴趣小组</h1>
            <p className="text-[10px] text-muted-foreground">
              AI 推荐 · 活动发现 · 智能对话
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-2.5 overflow-y-auto px-3 py-2 scrollbar-hide">
        <div className="animate-fade-in-up">
          <InterestAiHero tagHint={heroHint} />
        </div>

        {tagCount < 2 && (
          <button
            type="button"
            onClick={() => navigate("/profile/interests")}
            className="flex w-full items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-2.5 py-2 text-left transition-base active:scale-[0.99]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <Tag className="h-3.5 w-3.5 text-primary" />
            </span>
            <span className="flex-1 text-[11px] leading-snug text-primary">
              完善兴趣标签，让 AI 推荐更精准
            </span>
            <span className="text-[10px] text-primary/80">去设置 →</span>
          </button>
        )}

        <InterestSection variant="hub">
          <div className="grid grid-cols-3 gap-1">
            {shortcuts.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    if (s.to.startsWith("#")) {
                      document
                        .getElementById(s.to.slice(1))
                        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    } else navigate(s.to);
                  }}
                  className="flex flex-col items-center gap-0.5 rounded-xl p-1 transition-base active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/10 ring-1 ring-primary/10">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-center text-[8px] font-medium leading-tight text-foreground">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="recent-activities"
            className="mt-2 border-t border-primary/10 pt-2"
          >
            <SectionHeader
              title={
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 text-primary" />
                  近期活动
                </span>
              }
              action={viewMore(navigate, "recent")}
            />
            {recentActivities.length === 0 ? (
              <p className="py-1 text-center text-[10px] text-muted-foreground">
                暂无即将开始的活动
              </p>
            ) : (
              <ul className="space-y-1.5">
                {recentActivities.map(({ activity, occurrence }) => (
                  <li key={occurrence.id}>
                    <ActivityCard
                      compact
                      activity={activity}
                      occurrence={occurrence}
                      onOpen={() => openActivity(activity.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </InterestSection>

        <InterestSection id="my-groups">
          <SectionHeader
            title={
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                我的小组
              </span>
            }
            action={viewMore(navigate, "my-groups")}
          />
          {myGroups.length === 0 ? (
            <p className="pb-1 text-[11px] text-muted-foreground">
              还没有加入小组，可从下方 AI 推荐开始探索
            </p>
          ) : (
            <ul className="space-y-1.5">
              {myGroups.slice(0, 3).map((g) => (
                <li key={g.id}>
                  <GroupCard
                    compact
                    group={g}
                    onOpen={() => navigate(`/agents/interest-groups/${g.id}`)}
                  />
                </li>
              ))}
            </ul>
          )}
        </InterestSection>

        <InterestSection variant="ai">
          <SectionHeader
            title={
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI 推荐
              </span>
            }
            secondaryAction={{
              label: "换一批",
              icon: <RefreshCw className="h-3 w-3" />,
              onClick: () => setRecommendOffset((n) => n + 1),
            }}
            action={{
              label: "查看更多",
              onClick: () => navigate(DISCOVER_PATH),
            }}
          />
          {recommended.length === 0 ? (
            <p className="pb-1 text-[11px] text-muted-foreground">
              暂无推荐，可先完善兴趣标签
            </p>
          ) : (
            <ul className="space-y-1.5">
              {recommended.map(({ group, reasons }) => (
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
          )}
        </InterestSection>
      </main>

      <footer className="shrink-0 border-t border-primary/10 bg-gradient-to-t from-primary/[0.06] to-background/98 shadow-tab backdrop-blur-lg">
        <div className="flex items-center gap-2 px-3 pt-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-foreground">
              兴趣小组助手
            </p>
            <p className="text-[9px] text-muted-foreground">
              推荐小组、查询活动、解答参与问题
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5">
          <InterestTopicPanel
            compact
            onSelect={goChat}
            className="rounded-xl border border-primary/10 bg-card/80 px-2 py-1.5"
          />
        </div>
        <ChatInputBar
          placeholder="问问兴趣小组助手…"
          onSubmit={(text) => goChat(text)}
        />
      </footer>
    </div>
  );
};

export default InterestGroupHome;

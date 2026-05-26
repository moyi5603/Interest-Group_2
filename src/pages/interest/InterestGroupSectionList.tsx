import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ActivityCard from "@/components/interest/ActivityCard";
import GroupCard from "@/components/interest/GroupCard";
import {
  CURRENT_EMPLOYEE_ID,
  getJoinedGroups,
  joinGroup,
} from "@/data/interestGroups";
import {
  getUpcomingOccurrences,
  recommendGroups,
} from "@/lib/interestRecommend";
import type { InterestListSection } from "@/data/interestTypes";
import { toast } from "sonner";

const sectionMeta: Record<
  InterestListSection,
  { title: string; empty: string }
> = {
  recent: { title: "近期活动", empty: "暂无即将开始的活动" },
  "my-groups": { title: "我的小组", empty: "还没有加入小组" },
  recommend: { title: "AI 推荐", empty: "暂无推荐小组" },
};

const isValidSection = (s: string): s is InterestListSection =>
  s in sectionMeta;

const InterestGroupSectionList = () => {
  const { section: sectionParam } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const section = isValidSection(sectionParam ?? "")
    ? sectionParam
    : "recent";
  const meta = sectionMeta[section];

  const openActivity = (id: string) =>
    navigate(`/agents/interest-groups/activities/${id}`);

  const content = useMemo(() => {
    switch (section) {
      case "recent": {
        const items = getUpcomingOccurrences(CURRENT_EMPLOYEE_ID, 50);
        return (
          <ul className="space-y-1.5">
            {items.map(({ activity, occurrence }) => (
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
        );
      }
      case "my-groups": {
        const groups = getJoinedGroups(CURRENT_EMPLOYEE_ID);
        return (
          <ul className="space-y-1.5">
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
        );
      }
      case "recommend": {
        const scored = recommendGroups(CURRENT_EMPLOYEE_ID, 20);
        return (
          <ul className="space-y-1.5">
            {scored.map(({ group, reasons, matchPercent }) => (
              <li key={group.id}>
                <GroupCard
                  compact
                  group={group}
                  reasons={reasons}
                  matchPercent={matchPercent}
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
  }, [section, navigate]);

  const isEmpty = useMemo(() => {
    switch (section) {
      case "recent":
        return getUpcomingOccurrences(CURRENT_EMPLOYEE_ID, 1).length === 0;
      case "my-groups":
        return getJoinedGroups(CURRENT_EMPLOYEE_ID).length === 0;
      case "recommend":
        return recommendGroups(CURRENT_EMPLOYEE_ID, 1).length === 0;
    }
  }, [section]);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/40 bg-background/90 px-3 py-2 backdrop-blur-lg">
        <button
          type="button"
          aria-label="返回"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold">{meta.title}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        {isEmpty ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {meta.empty}
          </p>
        ) : (
          content
        )}
      </main>
    </div>
  );
};

export default InterestGroupSectionList;

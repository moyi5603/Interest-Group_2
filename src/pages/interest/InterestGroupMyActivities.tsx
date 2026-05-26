import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActivityCard from "@/components/interest/ActivityCard";
import {
  CURRENT_EMPLOYEE_ID,
  getMyEnrolledActivities,
  getMyOrganizedActivities,
} from "@/data/interestGroups";
import { getActivityPhase } from "@/lib/interestOccurrences";
import { cn } from "@/lib/utils";

type RoleTab = "organized" | "participated";
type FilterTab = "全部" | "未开始" | "进行中" | "已结束";

const roleTabs: { key: RoleTab; label: string }[] = [
  { key: "organized", label: "我组织的" },
  { key: "participated", label: "我参与的" },
];

const phaseTabs: FilterTab[] = ["全部", "未开始", "进行中", "已结束"];

const InterestGroupMyActivities = () => {
  const navigate = useNavigate();
  const [roleTab, setRoleTab] = useState<RoleTab>("organized");
  const [phaseTab, setPhaseTab] = useState<FilterTab>("全部");
  const [tick, setTick] = useState(0);

  const organizedAll = useMemo(
    () => getMyOrganizedActivities(CURRENT_EMPLOYEE_ID),
    [tick],
  );

  const participatedAll = useMemo(
    () =>
      getMyEnrolledActivities(CURRENT_EMPLOYEE_ID, {
        excludeOrganized: true,
      }),
    [tick],
  );

  const filterByPhase = <
    T extends {
      activity: { startAt?: string; endAt?: string };
      occurrence?: { startAt: string; endAt: string };
    },
  >(
    list: T[],
    tab: FilterTab,
  ): T[] => {
    if (tab === "全部") return list;
    return list.filter(({ activity, occurrence }) => {
      const start = occurrence?.startAt ?? activity.startAt;
      const end = occurrence?.endAt ?? activity.endAt;
      const phase = getActivityPhase(start, end);
      if (tab === "未开始") return phase === "未开始";
      if (tab === "进行中") return phase === "进行中";
      if (tab === "已结束") return phase === "已结束";
      return true;
    });
  };

  const organizedItems = useMemo(
    () => filterByPhase(organizedAll, phaseTab),
    [organizedAll, phaseTab],
  );

  const participatedItems = useMemo(
    () => filterByPhase(participatedAll, phaseTab),
    [participatedAll, phaseTab],
  );

  const openOrganizedActivity = (id: string, editable: boolean) => {
    const path = `/agents/interest-groups/activities/${id}`;
    navigate(editable ? `${path}?edit=1` : path);
  };

  const formatEnrolledAt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} 报名`;
  };

  const emptyMessage =
    roleTab === "organized"
      ? phaseTab === "全部"
        ? "还没有组织任何活动"
        : "该状态下暂无活动"
      : phaseTab === "全部"
        ? "还没有报名任何活动"
        : "该状态下暂无活动";

  const list =
    roleTab === "organized" ? organizedItems : participatedItems;

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="shrink-0 border-b border-border/40 bg-background px-3 pb-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="返回"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold">
            我的活动
          </h1>
          <div className="w-9" />
        </div>

        <div className="mt-3 flex rounded-lg bg-secondary/80 p-0.5">
          {roleTabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setRoleTab(key)}
              className={cn(
                "flex-1 rounded-md py-2 text-xs font-medium transition-colors",
                roleTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-3 overflow-x-auto scrollbar-hide">
          {phaseTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPhaseTab(t)}
              className={cn(
                "shrink-0 pb-2 text-xs font-medium",
                phaseTab === t
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        {list.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : roleTab === "organized" ? (
          <ul className="space-y-2">
            {organizedItems.map(({ activity, occurrence, group }) => {
              const start = occurrence?.startAt ?? activity.startAt;
              const end = occurrence?.endAt ?? activity.endAt;
              const phase = getActivityPhase(start, end);
              const canEdit = phase !== "已结束";

              return (
                <li key={activity.id}>
                  <ActivityCard
                    compact
                    activity={activity}
                    occurrence={occurrence}
                    editable={canEdit}
                    meta={`${group.name} · 我发起`}
                    onOpen={() =>
                      openOrganizedActivity(activity.id, canEdit)
                    }
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-2">
            {participatedItems.map(
              ({ enrollment, activity, occurrence, group }) => (
                <li key={enrollment.id}>
                  <ActivityCard
                    compact
                    activity={activity}
                    occurrence={occurrence}
                    enrolled
                    meta={`${formatEnrolledAt(enrollment.enrolledAt)} · ${group.name}`}
                    onOpen={() =>
                      navigate(
                        `/agents/interest-groups/activities/${activity.id}`,
                      )
                    }
                  />
                </li>
              ),
            )}
          </ul>
        )}
      </main>
    </div>
  );
};

export default InterestGroupMyActivities;

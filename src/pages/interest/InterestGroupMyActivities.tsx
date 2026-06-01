import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { useUrlEnumParam } from "@/hooks/useUrlEnumParam";
import ActivityCard from "@/components/interest/ActivityCard";
import {
  CURRENT_EMPLOYEE_ID,
  getMyEnrolledOccurrences,
  getMyOrganizedActivities,
  getOccurrencesByActivity,
} from "@/data/interestGroups";
import {
  getActivityPhase,
  getActivityScheduleLabel,
  getEnrolledOccurrenceScheduleLabel,
} from "@/lib/interestOccurrences";
import { interestTypography as t } from "@/components/interest/interestTypography";
import { cn } from "@/lib/utils";

type RoleTab = "organized" | "participated";
type FilterTab = "全部" | "未开始" | "进行中" | "已结束" | "已终止";

const roleTabs: { key: RoleTab; label: string }[] = [
  { key: "organized", label: "我发布的" },
  { key: "participated", label: "我报名的场次" },
];

const phaseTabs: FilterTab[] = [
  "全部",
  "未开始",
  "进行中",
  "已结束",
  "已终止",
];

const roleTabValues = ["organized", "participated"] as const satisfies readonly RoleTab[];

const InterestGroupMyActivities = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [roleTab, setRoleTab] = useUrlEnumParam<RoleTab>(
    "role",
    "organized",
    roleTabValues,
  );
  const [phaseTab, setPhaseTab] = useUrlEnumParam<FilterTab>(
    "phase",
    "全部",
    phaseTabs,
  );
  const [tick, setTick] = useState(0);

  const organizedAll = useMemo(
    () => getMyOrganizedActivities(CURRENT_EMPLOYEE_ID),
    [tick],
  );

  const participatedAll = useMemo(
    () =>
      getMyEnrolledOccurrences(CURRENT_EMPLOYEE_ID, {
        excludeOrganized: true,
      }),
    [tick],
  );

  const filterOrganizedByPhase = (
    list: typeof organizedAll,
    tab: FilterTab,
  ) => {
    if (tab === "全部") return list;
    if (tab === "已终止") {
      return list.filter(({ activity }) => activity.status === "cancelled");
    }
    return list.filter(({ activity, occurrence }) => {
      if (activity.status === "cancelled") return false;
      const start = occurrence?.startAt ?? activity.startAt;
      const end = occurrence?.endAt ?? activity.endAt;
      const phase = getActivityPhase(start, end);
      if (tab === "未开始") return phase === "未开始";
      if (tab === "进行中") return phase === "进行中";
      if (tab === "已结束") return phase === "已结束";
      return true;
    });
  };

  const filterParticipatedByPhase = (
    list: typeof participatedAll,
    tab: FilterTab,
  ) => {
    if (tab === "全部") return list;
    if (tab === "已终止") {
      return list.filter((item) => item.terminated);
    }
    return list.filter(({ occurrence, terminated }) => {
      if (terminated) return false;
      const phase = getActivityPhase(
        occurrence.startAt,
        occurrence.endAt,
      );
      if (tab === "未开始") return phase === "未开始";
      if (tab === "进行中") return phase === "进行中";
      if (tab === "已结束") return phase === "已结束";
      return true;
    });
  };

  const organizedItems = useMemo(
    () => filterOrganizedByPhase(organizedAll, phaseTab),
    [organizedAll, phaseTab],
  );

  const participatedItems = useMemo(
    () => filterParticipatedByPhase(participatedAll, phaseTab),
    [participatedAll, phaseTab],
  );

  const openOrganizedActivity = (id: string) => {
    navigate(`/agents/interest-groups/activities/${id}`);
  };

  const emptyMessage =
    roleTab === "organized"
      ? phaseTab === "全部"
        ? "还没有发布任何活动"
        : phaseTab === "已终止"
          ? "暂无已终止的活动"
          : "该状态下暂无活动"
      : phaseTab === "全部"
        ? "还没有报名任何场次"
        : phaseTab === "已终止"
          ? "暂无已终止的场次"
          : "该状态下暂无场次";

  const list =
    roleTab === "organized" ? organizedItems : participatedItems;

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="shrink-0 border-b border-border/40 bg-background px-3 pb-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="返回"
            onClick={goBack}
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
                "flex-1 rounded-md py-2.5 text-sm font-medium transition-colors",
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
                "shrink-0 pb-2 text-sm font-medium",
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
              const allOccs = getOccurrencesByActivity(activity.id);
              const scheduleLabel = getActivityScheduleLabel(
                activity,
                occurrence,
                allOccs,
                {
                  seriesSessionTotal: activity.activityKind === "series",
                },
              );

              return (
                <li key={activity.id}>
                  <ActivityCard
                    compact
                    activity={activity}
                    occurrence={occurrence}
                    groupName={group.name}
                    scheduleLabel={scheduleLabel}
                    meta="我发起"
                    onOpen={() => openOrganizedActivity(activity.id)}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-2">
            {participatedItems.map(
              ({
                activity,
                occurrence,
                group,
                occurrenceIndex,
                terminated,
                enrollment,
              }) => {
                const scheduleLabel =
                  getEnrolledOccurrenceScheduleLabel(occurrence);
                return (
                  <li key={`${enrollment.id}:${occurrence.id}`}>
                    <ActivityCard
                      compact
                      activity={activity}
                      occurrence={occurrence}
                      groupName={group.name}
                      scheduleLabel={scheduleLabel}
                      enrolled={!terminated}
                      onOpen={() => {
                        const params = new URLSearchParams({
                          occurrenceId: occurrence.id,
                        });
                        navigate(
                          `/agents/interest-groups/activities/${activity.id}?${params}`,
                        );
                      }}
                    />
                  </li>
                );
              },
            )}
          </ul>
        )}
      </main>
    </div>
  );
};

export default InterestGroupMyActivities;

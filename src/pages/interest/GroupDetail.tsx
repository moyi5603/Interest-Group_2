import { useMemo, useState } from "react";
import { resolveGroupCover } from "@/data/interestImages";
import ActivityCover from "@/components/interest/ActivityCover";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ActivityCard from "@/components/interest/ActivityCard";
import ReportBanner from "@/components/interest/ReportBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTagsByIds } from "@/data/interestTags";
import type { ActivityKind } from "@/data/interestTypes";
import {
  CURRENT_EMPLOYEE_ID,
  getActivitiesByGroup,
  getGroupById,
  isGroupFull,
  isMember,
  joinGroup,
  markGroupReported,
} from "@/data/interestGroups";
import { canViewGroup } from "@/lib/interestVisibility";
import { toast } from "sonner";

const kindFilters: { key: "all" | ActivityKind; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "one_off", label: "单次" },
  { key: "recurring", label: "周期" },
  { key: "series", label: "系列" },
];

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [kind, setKind] = useState<"all" | ActivityKind>("all");
  const [, bump] = useState(0);

  const group = getGroupById(groupId || "");
  const visible = group && canViewGroup(group, CURRENT_EMPLOYEE_ID);
  const member = group ? isMember(group.id, CURRENT_EMPLOYEE_ID) : false;
  const full = group ? isGroupFull(group) : false;

  const activities = useMemo(() => {
    if (!group) return [];
    const list = getActivitiesByGroup(group.id);
    if (kind === "all") return list;
    return list.filter((a) => a.activityKind === kind);
  }, [group, kind, bump]);

  if (!group || !visible) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center">
        <p className="text-sm text-muted-foreground">无法查看该小组</p>
      </div>
    );
  }

  const tags = getTagsByIds(group.tagIds);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-semibold">{group.name}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-hide">
        <ActivityCover
          coverUrl={resolveGroupCover(group)}
          className="mb-3 h-36 rounded-2xl"
        />

        <ReportBanner
          group={group}
          onReported={() => {
            markGroupReported(group.id);
            bump((n) => n + 1);
            toast.success("已记录报备状态");
          }}
        />

        <section className="rounded-2xl bg-card p-4 shadow-soft">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {group.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t.id}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px]"
              >
                #{t.name}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {group.memberCount} 位成员 ·{" "}
            {group.type === "official" ? "官方精品组" : "员工自发组"}
          </p>
          {!member ? (
            full ? (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                小组已满员
              </p>
            ) : (
            <button
              type="button"
              onClick={() => {
                if (group.visibility === "invite_only") {
                  toast.message("邀请制小组，请联系组长");
                  return;
                }
                if (!joinGroup(group.id, CURRENT_EMPLOYEE_ID)) {
                  toast.error("小组已满");
                  return;
                }
                bump((n) => n + 1);
                toast.success("已加入小组");
              }}
              className="mt-3 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground"
            >
              加入小组
            </button>
            )
          ) : (
            <button
              type="button"
              onClick={() =>
                navigate(`/agents/interest-groups/${group.id}/activities/new`)
              }
              className="mt-3 w-full rounded-full border border-primary py-2.5 text-sm font-medium text-primary"
            >
              发布活动
            </button>
          )}
        </section>

        <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)} className="mt-4">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 scrollbar-hide">
            {kindFilters.map((f) => (
              <TabsTrigger
                key={f.key}
                value={f.key}
                className="shrink-0 rounded-full border border-border px-3 py-1 text-xs data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={kind} className="mt-3 space-y-2.5">
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground">暂无活动</p>
            ) : (
              activities.map((a) => (
                <ActivityCard
                  key={a.id}
                  compact
                  activity={a}
                  onOpen={() =>
                    navigate(`/agents/interest-groups/activities/${a.id}`)
                  }
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetail;

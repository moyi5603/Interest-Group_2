import { useMemo, useRef, useState } from "react";
import { resolveGroupCover } from "@/data/interestImages";
import ActivityCommentComposerInline from "@/components/interest/ActivityCommentComposerInline";
import ActivityCover from "@/components/interest/ActivityCover";
import GroupMembersSheet from "@/components/interest/GroupMembersSheet";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import FeaturedActivityCard from "@/components/interest/FeaturedActivityCard";
import GroupHighlightsPanel from "@/components/interest/GroupHighlightsPanel";
import GroupMomentsPanel from "@/components/interest/GroupMomentsPanel";
import GroupOrganizerFooter from "@/components/interest/GroupOrganizerFooter";
import ReportBanner from "@/components/interest/ReportBanner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTagsByIds } from "@/data/interestTags";
import type { ActivityKind, GroupDetailPanel } from "@/data/interestTypes";
import {
  CURRENT_EMPLOYEE_ID,
  getActivitiesByGroup,
  getGroupById,
  getGroupMembers,
  isGroupFull,
  isMember,
  joinGroup,
  leaveGroup,
  markGroupReported,
} from "@/data/interestGroups";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { useUrlEnumParam } from "@/hooks/useUrlEnumParam";
import { canViewGroup } from "@/lib/interestVisibility";
import { canOrganizeGroup, canPostInterestComments } from "@/lib/interestGroupAccess";
import { buildFeaturedActivityListItem } from "@/lib/interestRecommend";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const kindFilters: { key: "all" | ActivityKind; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "one_off", label: "单次" },
  { key: "recurring", label: "周期" },
  { key: "series", label: "系列" },
];

const kindTabValues = ["all", "one_off", "recurring", "series"] as const;

const detailPanels: { key: GroupDetailPanel; label: string }[] = [
  { key: "activities", label: "活动" },
  { key: "moments", label: "小组圈" },
  { key: "highlights", label: "精彩瞬间" },
];

const detailPanelKeys = detailPanels.map((p) => p.key);

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [panel, setPanel] = useUrlEnumParam<GroupDetailPanel>(
    "panel",
    "activities",
    detailPanelKeys,
  );
  const [kind, setKind] = useUrlEnumParam<"all" | ActivityKind>(
    "kind",
    "all",
    kindTabValues,
  );
  const [version, setVersion] = useState(0);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  const group = getGroupById(groupId || "");
  const visible = group && canViewGroup(group, CURRENT_EMPLOYEE_ID);
  const member = group ? isMember(group.id, CURRENT_EMPLOYEE_ID) : false;
  const canOrganize = group
    ? canOrganizeGroup(group.id, CURRENT_EMPLOYEE_ID) && group.status === "active"
    : false;
  const full = group ? isGroupFull(group) : false;
  const isArchived = group?.status === "archived";

  const activityItems = useMemo(() => {
    if (!group) return [];
    const list = getActivitiesByGroup(group.id);
    const filtered = kind === "all" ? list : list.filter((a) => a.activityKind === kind);
    return filtered
      .map((a) => buildFeaturedActivityListItem(a, group))
      .filter((item): item is NonNullable<typeof item> => item != null);
  }, [group, kind, version]);

  const members = useMemo(() => {
    if (!group) return [];
    return getGroupMembers(group.id);
  }, [group, version]);

  if (!group || !visible) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center">
        <p className="text-sm text-muted-foreground">无法查看该小组</p>
      </div>
    );
  }

  const tags = getTagsByIds(group.tagIds);
  const canPostMoments = member && canPostInterestComments();
  const showMomentsComposer =
    panel === "moments" && canPostMoments && !isArchived;
  const showBottomBar = showMomentsComposer;
  const openMomentComposerRef = useRef<(focusImages?: boolean) => void>(
    () => {},
  );

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
        <button
          type="button"
          onClick={goBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-semibold">{group.name}</h1>
      </header>

      <main
        className={cn(
          "flex-1 overflow-y-auto px-3 scrollbar-hide",
          showBottomBar ? "pb-24" : "pb-6",
        )}
      >
        <ActivityCover
          coverUrl={resolveGroupCover(group)}
          className="mb-3 h-36 rounded-2xl"
        />

        {isArchived && (
          <p className="mb-3 rounded-2xl bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
            小组已解散
          </p>
        )}

        {!isArchived && (
          <ReportBanner
            group={group}
            onReported={() => {
              markGroupReported(group.id);
              setVersion((n) => n + 1);
              toast.success("已记录报备状态");
            }}
          />
        )}

        <section className="rounded-2xl bg-card p-4 shadow-soft">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {group.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t.id}
                className="rounded-full bg-secondary px-2 py-0.5 text-sm"
              >
                #{t.name}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMembersOpen(true)}
            className="mt-2 flex w-full items-center gap-0.5 text-sm text-primary active:opacity-70"
          >
            <span>{group.memberCount} 位成员</span>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
          </button>
          {!isArchived && canOrganize ? (
            <div className="mt-3 flex gap-2">
              <GroupOrganizerFooter
                compact
                group={group}
                ownerId={CURRENT_EMPLOYEE_ID}
                onEdit={() =>
                  navigate(`/agents/interest-groups/${group.id}/edit`)
                }
                onDisbanded={() =>
                  navigate("/agents/interest-groups/admin/groups")
                }
              />
              <button
                type="button"
                onClick={() =>
                  navigate(`/agents/interest-groups/${group.id}/activities/new`)
                }
                className="min-w-0 flex-[1.35] rounded-full border border-primary py-2.5 text-sm font-semibold text-primary active:scale-[0.99]"
              >
                发布活动
              </button>
            </div>
          ) : !isArchived && !member ? (
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
                  setVersion((n) => n + 1);
                  toast.success("已加入小组");
                }}
                className="mt-3 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground"
              >
                加入小组
              </button>
            )
          ) : !isArchived && member ? (
            <button
              type="button"
              onClick={() => setLeaveOpen(true)}
              className="mt-3 w-full rounded-full border border-destructive/40 py-2.5 text-sm font-medium text-destructive active:scale-[0.99]"
            >
              退出小组
            </button>
          ) : null}
        </section>

        {!isArchived && (
          <div className="mt-4">
            <div className="flex rounded-lg bg-secondary/80 p-0.5">
              {detailPanels.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPanel(key)}
                  className={cn(
                    "flex-1 rounded-md py-2.5 text-sm font-medium transition-colors active:scale-[0.99]",
                    panel === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {panel === "activities" && (
              <Tabs
                value={kind}
                onValueChange={(v) => setKind(v as typeof kind)}
                className="mt-3"
              >
                <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 scrollbar-hide">
                  {kindFilters.map((f) => (
                    <TabsTrigger
                      key={f.key}
                      value={f.key}
                      className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    >
                      {f.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={kind} className="mt-3 space-y-2">
                  {activityItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">暂无活动</p>
                  ) : (
                    activityItems.map((item) => (
                      <FeaturedActivityCard
                        key={item.activity.id}
                        item={item}
                        hideGroup
                        onOpen={() =>
                          navigate(
                            `/agents/interest-groups/activities/${item.activity.id}`,
                          )
                        }
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}

            {panel === "moments" && (
              <div className="mt-3">
                <GroupMomentsPanel
                  groupId={group.id}
                  canPost={canPostMoments}
                  tick={version}
                  onChanged={() => setVersion((n) => n + 1)}
                  onRegisterComposer={(open) => {
                    openMomentComposerRef.current = open;
                  }}
                />
              </div>
            )}

            {panel === "highlights" && (
              <div className="mt-3">
                <GroupHighlightsPanel
                  groupId={group.id}
                  canUpload={canOrganize}
                  tick={version}
                  onChanged={() => setVersion((n) => n + 1)}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {showBottomBar && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex max-w-md items-center gap-2 border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur">
          <ActivityCommentComposerInline
            onOpenComposer={(focus) => openMomentComposerRef.current(focus)}
          />
        </footer>
      )}

      <GroupMembersSheet
        open={membersOpen}
        onOpenChange={setMembersOpen}
        groupName={group.name}
        memberCount={group.memberCount}
        members={members}
      />

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>退出小组</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              确认退出「{group.name}」？退出后将取消你在该小组活动中的报名。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={() => {
                if (!leaveGroup(group.id, CURRENT_EMPLOYEE_ID)) {
                  toast.error("退出失败，请稍后重试");
                  return;
                }
                setLeaveOpen(false);
                toast.success("已退出小组");
                goBack();
              }}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认退出
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 w-full">取消</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupDetail;

import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronRight } from "lucide-react";
import FeaturedActivityCard from "@/components/interest/FeaturedActivityCard";
import GroupCard from "@/components/interest/GroupCard";
import {
  CURRENT_EMPLOYEE_ID,
  enrollActivity,
  isEnrolled,
  joinGroup,
} from "@/data/interestGroups";
import {
  AGENT_CARD_PREVIEW_LIMIT,
  viewMoreForIntent,
  type AgentCardOverflow,
  type AgentReply,
} from "@/lib/interestAgent";
import { canManageInterestGroups } from "@/lib/appRoleStore";
import { toast } from "@/components/ui/sonner";

type Props = {
  reply: AgentReply;
  onSuggest: (text: string) => void;
  onCancelConfirm?: (activityId: string) => void;
  onTerminateConfirm?: (activityId: string) => void;
  onJoined?: () => void;
};

const CardViewMoreLink = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-center gap-0.5 rounded-lg border border-primary/20 bg-primary/5 py-2 text-xs font-medium text-primary active:scale-[0.98]"
  >
    {label}
    <ChevronRight className="h-3.5 w-3.5" />
  </button>
);

const InterestAgentReply = ({
  reply,
  onSuggest,
  onCancelConfirm,
  onTerminateConfirm,
  onJoined,
}: Props) => {
  const navigate = useNavigate();
  const canManage = canManageInterestGroups();

  const handleJoin = (groupId: string, groupName: string) => {
    if (!joinGroup(groupId, CURRENT_EMPLOYEE_ID)) {
      toast.error("小组已满或无法加入");
      return;
    }
    toast.success(`已加入「${groupName}」`);
    onJoined?.();
  };

  const handleEnroll = (activityId: string, title: string) => {
    if (isEnrolled(activityId, CURRENT_EMPLOYEE_ID)) {
      toast.message(`你已报名「${title}」`);
      return;
    }
    const result = enrollActivity(activityId, CURRENT_EMPLOYEE_ID);
    if (!result) {
      toast.error("报名失败，可能已满或已截止");
      return;
    }
    toast.success(`已报名「${title}」`);
    onJoined?.();
  };

  const previewScored = reply.scoredGroups?.slice(0, AGENT_CARD_PREVIEW_LIMIT);
  const previewGroups = reply.groups?.slice(0, AGENT_CARD_PREVIEW_LIMIT);
  const previewActivities = reply.recentActivities?.slice(
    0,
    AGENT_CARD_PREVIEW_LIMIT,
  );

  const groupDetailActivityOverflow =
    reply.groupDetail &&
    reply.groupDetail.recentActivityTotal > AGENT_CARD_PREVIEW_LIMIT
      ? {
          total: reply.groupDetail.recentActivityTotal,
          ...viewMoreForIntent("group_detail", reply.groupDetail.group.id),
        }
      : undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      {previewScored && previewScored.length > 0 && (
        <>
          <ul className="w-full space-y-2">
            {previewScored.map(({ group, reasons }) => (
              <li key={group.id}>
                <GroupCard
                  compact
                  group={group}
                  reasons={reasons}
                  onOpen={() =>
                    navigate(`/agents/interest-groups/${group.id}`)
                  }
                  onJoin={() => handleJoin(group.id, group.name)}
                />
              </li>
            ))}
          </ul>
          {reply.cardOverflow && (
            <CardViewMoreLink
              label={reply.cardOverflow.label}
              onClick={() => navigate(reply.cardOverflow!.to)}
            />
          )}
        </>
      )}

      {previewGroups && previewGroups.length > 0 && (
        <>
          <ul className="w-full space-y-2">
            {previewGroups.map((g) => (
              <li key={g.id}>
                <GroupCard
                  compact
                  group={g}
                  onOpen={() => navigate(`/agents/interest-groups/${g.id}`)}
                />
              </li>
            ))}
          </ul>
          {reply.cardOverflow && (
            <CardViewMoreLink
              label={reply.cardOverflow.label}
              onClick={() => navigate(reply.cardOverflow!.to)}
            />
          )}
        </>
      )}

      {reply.groupDetail && (
        <div className="w-full space-y-2 rounded-xl border border-border/60 bg-card p-3">
          {reply.groupDetail.recentActivities.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                近期活动
              </p>
              <ul className="space-y-2">
                {reply.groupDetail.recentActivities.map((item) => (
                  <li key={item.activity.id}>
                    <FeaturedActivityCard
                      item={item}
                      hideGroup
                      onOpen={() =>
                        navigate(
                          `/agents/interest-groups/activities/${item.activity.id}`,
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
              {groupDetailActivityOverflow && (
                <div className="mt-2">
                  <CardViewMoreLink
                    label={groupDetailActivityOverflow.label}
                    onClick={() => navigate(groupDetailActivityOverflow.to)}
                  />
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2">
            {!reply.groupDetail.joined ? (
              <button
                type="button"
                onClick={() =>
                  handleJoin(
                    reply.groupDetail!.group.id,
                    reply.groupDetail!.group.name,
                  )
                }
                className="flex-1 rounded-lg gradient-primary py-2 text-xs font-medium text-primary-foreground shadow-glow active:scale-[0.98]"
              >
                加入小组
              </button>
            ) : (
              <span className="flex flex-1 items-center justify-center rounded-lg bg-primary/10 py-2 text-xs font-medium text-primary">
                已加入
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/agents/interest-groups/${reply.groupDetail!.group.id}`,
                )
              }
              className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground active:scale-[0.98]"
            >
              查看详情
            </button>
          </div>
        </div>
      )}

      {previewActivities && previewActivities.length > 0 && (
        <>
          <ul className="w-full space-y-2">
            {previewActivities.map((item) => (
              <li key={item.activity.id}>
                <FeaturedActivityCard
                  item={item}
                  showEnroll
                  enrolled={isEnrolled(item.activity.id, CURRENT_EMPLOYEE_ID)}
                  onOpen={() =>
                    navigate(
                      `/agents/interest-groups/activities/${item.activity.id}`,
                    )
                  }
                  onEnroll={() =>
                    handleEnroll(item.activity.id, item.activity.title)
                  }
                />
              </li>
            ))}
          </ul>
          {reply.cardOverflow && (
            <CardViewMoreLink
              label={reply.cardOverflow.label}
              onClick={() => navigate(reply.cardOverflow!.to)}
            />
          )}
        </>
      )}

      {reply.createGuide && (
        <div className="w-full space-y-2 rounded-xl border border-border/60 bg-card p-3">
          <ol className="space-y-2">
            {reply.createGuide.steps.map((s) => (
              <li key={s.step} className="flex gap-2 text-xs">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                  {s.step}
                </span>
                <div>
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className="text-muted-foreground">{s.action}</p>
                </div>
              </li>
            ))}
          </ol>
          {reply.createGuide.note ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ {reply.createGuide.note}
            </p>
          ) : null}
          {reply.intent === "create_hint" ? (
            canManage ? (
              <button
                type="button"
                onClick={() => navigate("/agents/interest-groups/new")}
                className="w-full rounded-lg gradient-primary py-2.5 text-sm font-medium text-primary-foreground shadow-glow active:scale-[0.98]"
              >
                立即创建小组
              </button>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                请切换为管理员身份后再创建小组
              </p>
            )
          ) : (
            reply.navigateTo &&
            (canManage ||
              (!reply.navigateTo.includes("/activities/new") &&
                reply.navigateTo !== "/agents/interest-groups/new")) ? (
              <button
                type="button"
                onClick={() => navigate(reply.navigateTo!)}
                className="w-full rounded-lg gradient-primary py-2.5 text-sm font-medium text-primary-foreground shadow-glow active:scale-[0.98]"
              >
                {reply.navigateLabel ?? "前往"}
              </button>
            ) : reply.navigateTo?.includes("/activities/new") ||
              reply.navigateTo === "/agents/interest-groups/new" ? (
              <p className="text-center text-xs text-muted-foreground">
                请切换为管理员身份后再操作
              </p>
            ) : null
          )}
        </div>
      )}

      {reply.terminateConfirm && (
        <div className="w-full rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" />
            确认终止活动
          </div>
          <p className="text-sm text-foreground">
            确定终止「{reply.terminateConfirm.activityTitle}」吗？未举办场次将取消，报名记录作废。
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                onTerminateConfirm?.(reply.terminateConfirm!.activityId)
              }
              className="flex-1 rounded-lg bg-destructive py-2 text-xs font-medium text-destructive-foreground active:scale-[0.98]"
            >
              确认终止
            </button>
            <button
              type="button"
              onClick={() => onSuggest("保留活动")}
              className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground active:scale-[0.98]"
            >
              暂不终止
            </button>
          </div>
        </div>
      )}

      {reply.cancelConfirm && (
        <div className="w-full rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            确认取消报名
          </div>
          <p className="text-sm text-foreground">
            确定取消「{reply.cancelConfirm.activityTitle}」的报名吗？
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            活动时间：{reply.cancelConfirm.startLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            活动地点：{reply.cancelConfirm.location}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                onCancelConfirm?.(reply.cancelConfirm!.activityId)
              }
              className="flex-1 rounded-lg bg-destructive/90 py-2 text-xs font-medium text-destructive-foreground active:scale-[0.98]"
            >
              确认取消
            </button>
            <button
              type="button"
              onClick={() => onSuggest("保留报名")}
              className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground active:scale-[0.98]"
            >
              保留报名
            </button>
          </div>
        </div>
      )}

      {reply.navigateTo && !reply.createGuide && (
        <button
          type="button"
          onClick={() => navigate(reply.navigateTo!)}
          className="w-full rounded-lg border border-primary/30 bg-primary/5 py-2.5 text-sm font-medium text-primary active:scale-[0.98]"
        >
          {reply.navigateLabel ?? "前往查看"}
          <ChevronRight className="ml-0.5 inline h-4 w-4" />
        </button>
      )}

    </div>
  );
};

export default InterestAgentReply;

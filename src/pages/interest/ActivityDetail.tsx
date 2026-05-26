import { useState } from "react";
import ActivityOrganizerEdit from "@/components/interest/ActivityOrganizerEdit";
import ActivityFormFields from "@/components/interest/ActivityFormFields";
import { ArrowLeft, Heart, MessageCircle, Star } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { getEmployee } from "@/data/colleagueData";
import {
  CURRENT_EMPLOYEE_ID,
  cancelEnrollment,
  enrollActivity,
  getActivityById,
  getEnrollment,
  getGroupById,
  getOccurrencesByActivity,
  isActivityOrganizer,
} from "@/data/interestGroups";
import type { GroupActivity } from "@/data/interestTypes";
import { activityToFormValues } from "@/lib/activityFormState";
import {
  formatOccurrenceLabel,
  getActivityPhase,
} from "@/lib/interestOccurrences";
import { toast } from "sonner";

const ActivityDetail = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pickOccId, setPickOccId] = useState<string | undefined>();
  const [tick, setTick] = useState(0);
  const [activityOverride, setActivityOverride] = useState<
    GroupActivity | undefined
  >();

  const activity =
    activityOverride ?? getActivityById(activityId || "");
  const group = activity ? getGroupById(activity.groupId) : undefined;
  const occs = activity ? getOccurrencesByActivity(activity.id) : [];
  const enrollment =
    activity && tick >= 0
      ? getEnrollment(activity.id, CURRENT_EMPLOYEE_ID)
      : undefined;
  const enrolled = !!enrollment;

  if (!activity || !group) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center">
        <p className="text-sm text-muted-foreground">活动不存在</p>
      </div>
    );
  }

  const enrolledOcc = enrollment?.occurrenceId
    ? occs.find((o) => o.id === enrollment.occurrenceId)
    : undefined;
  const nextOcc = occs.find((o) => o.status === "scheduled");
  const enrollableOccs = occs.filter((o) => o.status === "scheduled");
  const displayOcc = enrolledOcc ?? nextOcc;
  const phase = getActivityPhase(
    displayOcc?.startAt ?? activity.startAt,
    displayOcc?.endAt ?? activity.endAt,
  );
  const isOrganizer = isActivityOrganizer(
    activity.id,
    CURRENT_EMPLOYEE_ID,
  );
  const wantsEdit = searchParams.get("edit") === "1";
  const isEditing =
    wantsEdit && isOrganizer && phase !== "已结束";
  const organizer = getEmployee(activity.organizerId);
  const formValues = activityToFormValues(activity, occs);
  const full =
    nextOcc &&
    nextOcc.capacity != null &&
    nextOcc.enrollCount >= nextOcc.capacity &&
    !enrolled;

  const refresh = () => setTick((n) => n + 1);

  const doEnroll = () => {
    const targetId =
      activity.activityKind === "series"
        ? pickOccId ?? nextOcc?.id
        : nextOcc?.id;
    const targetOcc = targetId
      ? occs.find((o) => o.id === targetId)
      : undefined;
    if (
      targetOcc &&
      targetOcc.capacity != null &&
      targetOcc.enrollCount >= targetOcc.capacity
    ) {
      toast.error("该场次名额已满");
      return;
    }
    if (full && !targetOcc) {
      toast.error("名额已满");
      return;
    }
    if (activity.activityKind === "series" && enrollableOccs.length > 1 && !targetId) {
      toast.error("请选择要报名的场次");
      return;
    }
    enrollActivity(activity.id, CURRENT_EMPLOYEE_ID, targetId);
    refresh();
    setEnrollOpen(false);
    setPickOccId(undefined);
    toast.success("报名成功");
  };

  const doCancel = () => {
    if (!cancelEnrollment(activity.id, CURRENT_EMPLOYEE_ID)) {
      toast.error("取消失败");
      return;
    }
    refresh();
    setCancelOpen(false);
    toast.success("已取消报名");
  };

  const canCancel = enrolled && phase !== "已结束";

  const exitEditMode = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    setSearchParams(next, { replace: true });
  };

  const handleSaved = (updated: GroupActivity) => {
    setActivityOverride(updated);
    exitEditMode();
    setTick((n) => n + 1);
  };

  if (isEditing) {
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
          <h1 className="text-base font-semibold">编辑活动</h1>
        </header>
        <ActivityOrganizerEdit
          key={activity.id + tick}
          activity={activity}
          group={group}
          onSaved={handleSaved}
        />
      </div>
    );
  }

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
        <h1 className="truncate text-base font-semibold">{activity.title}</h1>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto px-3 pb-28 scrollbar-hide">
        <ActivityFormFields
          mode="view"
          activity={activity}
          occurrences={occs}
          kind={formValues.kind}
          title={formValues.title}
          description={formValues.description}
          location={formValues.location}
          capacity={formValues.capacity}
          coverUrl={formValues.coverUrl}
          oneOffSchedule={formValues.oneOffSchedule}
          seriesSessions={formValues.seriesSessions}
          recurrence={formValues.recurrence}
          weeklyDay={formValues.weeklyDay}
          monthDay={formValues.monthDay}
          recurringTime={formValues.recurringTime}
          recurringEndTime={formValues.recurringEndTime}
        />

        {(organizer || enrolledOcc) && (
          <section className="space-y-2 rounded-2xl bg-card p-4 shadow-soft text-sm">
            {organizer && (
              <p>
                <span className="text-muted-foreground">组织者：</span>
                {organizer.name} · {organizer.deptName}
              </p>
            )}
            {enrolledOcc && (
              <p>
                <span className="text-muted-foreground">已报场次：</span>
                {formatOccurrenceLabel(
                  enrolledOcc,
                  activity.activityKind === "series"
                    ? occs.findIndex((o) => o.id === enrolledOcc.id)
                    : undefined,
                )}
              </p>
            )}
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-border bg-background/95 px-3 py-3 backdrop-blur">
        <div className="mb-2 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {activity.likeCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {activity.favoriteCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {activity.commentCount ?? 0}
          </span>
        </div>
        {canCancel ? (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="w-full rounded-full border border-destructive/40 py-3 text-sm font-medium text-destructive active:scale-[0.99]"
          >
            取消报名
          </button>
        ) : (
          <button
            type="button"
            disabled={enrolled || phase === "已结束" || full}
            onClick={() => {
              if (activity.activityKind === "one_off") {
                doEnroll();
              } else {
                if (activity.activityKind === "series" && enrollableOccs.length > 0) {
                  setPickOccId(enrollableOccs[0]?.id);
                }
                setEnrollOpen(true);
              }
            }}
            className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground"
          >
            {enrolled
              ? "已报名"
              : full
                ? "名额已满"
                : phase === "已结束"
                  ? "已结束"
                  : "立即报名"}
          </button>
        )}
      </footer>

      <AlertDialog
        open={enrollOpen}
        onOpenChange={(open) => {
          setEnrollOpen(open);
          if (!open) setPickOccId(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认报名</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>确认报名参加「{activity.title}」？</p>
                {activity.activityKind === "series" &&
                  enrollableOccs.length > 1 && (
                    <ul className="max-h-40 space-y-1.5 overflow-y-auto">
                      {enrollableOccs.map((o) => {
                        const idx = occs.findIndex((x) => x.id === o.id);
                        return (
                        <li key={o.id}>
                          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 py-2">
                            <input
                              type="radio"
                              name="occ-pick"
                              checked={pickOccId === o.id}
                              onChange={() => setPickOccId(o.id)}
                              className="accent-primary"
                            />
                            <span className="text-xs text-foreground">
                              {formatOccurrenceLabel(
                                o,
                                activity.activityKind === "series"
                                  ? idx
                                  : undefined,
                              )}
                            </span>
                          </label>
                        </li>
                        );
                      })}
                    </ul>
                  )}
                {activity.activityKind === "series" &&
                  enrollableOccs.length === 1 &&
                  enrollableOccs[0] && (
                    <p>
                      场次：
                      {formatOccurrenceLabel(
                        enrollableOccs[0],
                        activity.activityKind === "series" ? 0 : undefined,
                      )}
                    </p>
                  )}
                {activity.activityKind === "recurring" && nextOcc && (
                  <p>场次：{formatOccurrenceLabel(nextOcc)}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>返回</AlertDialogCancel>
            <AlertDialogAction onClick={doEnroll}>确认报名</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>取消报名</AlertDialogTitle>
            <AlertDialogDescription>
              确认取消「{activity.title}」的报名？
              {enrolledOcc &&
                ` 场次：${formatOccurrenceLabel(
                  enrolledOcc,
                  activity.activityKind === "series"
                    ? occs.findIndex((o) => o.id === enrolledOcc.id)
                    : undefined,
                )}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>保留报名</AlertDialogCancel>
            <AlertDialogAction
              onClick={doCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认取消
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivityDetail;

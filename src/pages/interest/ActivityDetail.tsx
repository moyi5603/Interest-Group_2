import { useMemo, useState } from "react";
import ActivityCommentComposerInline from "@/components/interest/ActivityCommentComposerInline";
import ActivityCommentComposerSheet from "@/components/interest/ActivityCommentComposerSheet";
import ActivityCommentSection from "@/components/interest/ActivityCommentSection";
import ActivityEnrolleesSheet from "@/components/interest/ActivityEnrolleesSheet";
import ActivityOrganizerEdit from "@/components/interest/ActivityOrganizerEdit";
import ActivityFormFields from "@/components/interest/ActivityFormFields";
import OccurrenceMultiPicker from "@/components/interest/OccurrenceMultiPicker";
import ActivityOrganizerFooter from "@/components/interest/ActivityOrganizerFooter";
import { ArrowLeft } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getEmployee } from "@/data/colleagueData";
import {
  addActivityComment,
  addCommentReply,
  deleteActivityComment,
  listActivityComments,
  toggleCommentLike,
} from "@/data/activityComments";
import {
  CURRENT_EMPLOYEE_ID,
  cancelAllEnrollments,
  countActivityEnrollments,
  enrollActivity,
  enrollOccurrences,
  getActivityById,
  getEnrollmentsForActivity,
  getGroupById,
  getOccurrenceEnrollees,
  getOccurrencesByActivity,
} from "@/data/interestGroups";
import type { GroupActivity } from "@/data/interestTypes";
import { activityToFormValues } from "@/lib/activityFormState";
import {
  formatOccurrenceLabel,
  getActivityPhase,
  oneOffEnrollmentBlockedReason,
} from "@/lib/interestOccurrences";
import {
  buildPickerRows,
  getActivityDisplayPhaseForEnrollments,
  getEnrollmentPickerBeyondCount,
  hasSelectablePickerRows,
  listOccurrencesForEnrollmentPicker,
  usesMultiOccurrenceEnrollment,
} from "@/lib/occurrenceEnrollmentPicker";
import {
  getSeriesEnrollmentMode,
  isSeriesWholeEnrollmentOpen,
  seriesEnrollmentBlockedReason,
} from "@/lib/seriesEnrollment";
import { canOrganizeActivity } from "@/lib/interestGroupAccess";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { toast } from "@/components/ui/sonner";

const ActivityDetail = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [enrolleesOpen, setEnrolleesOpen] = useState(false);
  const [enrolleesContext, setEnrolleesContext] = useState<{
    occurrenceId: string;
    sessionLabel: string;
    enrollCount: number;
  } | null>(null);
  const [pickOccIds, setPickOccIds] = useState<Set<string>>(() => new Set());
  const [tick, setTick] = useState(0);
  const [commentTick, setCommentTick] = useState(0);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [composerFocusImages, setComposerFocusImages] = useState(false);
  const [scrollToLatestComment, setScrollToLatestComment] = useState(false);
  const [activityOverride, setActivityOverride] = useState<
    GroupActivity | undefined
  >();

  const activity =
    activityOverride ?? getActivityById(activityId || "");
  const group = activity ? getGroupById(activity.groupId) : undefined;
  const occs = activity ? getOccurrencesByActivity(activity.id) : [];
  const comments = useMemo(
    () =>
      activity && commentTick >= 0
        ? listActivityComments(activity.id)
        : [],
    [activity, commentTick],
  );
  const commentCount =
    (activityId ? getActivityById(activityId)?.commentCount : undefined) ??
    comments.length;
  const myEnrollments = useMemo(
    () =>
      activity && tick >= 0
        ? getEnrollmentsForActivity(activity.id, CURRENT_EMPLOYEE_ID)
        : [],
    [activity, tick],
  );
  const hasEnrollment = myEnrollments.length > 0;

  const enrolledOccurrenceIds = useMemo(
    () =>
      new Set(
        myEnrollments
          .map((e) => e.occurrenceId)
          .filter((id): id is string => !!id),
      ),
    [myEnrollments],
  );

  const seriesWholeMode =
    !!activity &&
    activity.activityKind === "series" &&
    getSeriesEnrollmentMode(activity) === "once_before_first";
  const multiOccMode = activity ? usesMultiOccurrenceEnrollment(activity) : false;

  const pickerOccurrences = useMemo(
    () =>
      activity && multiOccMode
        ? listOccurrencesForEnrollmentPicker(activity, occs)
        : occs,
    [activity, occs, multiOccMode],
  );

  const pickerBeyondCount = useMemo(
    () =>
      activity && multiOccMode
        ? getEnrollmentPickerBeyondCount(activity, occs)
        : 0,
    [activity, occs, multiOccMode],
  );

  const pickerRows = useMemo(
    () =>
      activity && multiOccMode
        ? buildPickerRows(activity, pickerOccurrences, enrolledOccurrenceIds)
        : [],
    [activity, pickerOccurrences, enrolledOccurrenceIds, multiOccMode],
  );

  const occurrenceEnrollees = useMemo(() => {
    if (!activity || !enrolleesContext) return [];
    return getOccurrenceEnrollees(
      activity.id,
      enrolleesContext.occurrenceId,
    );
  }, [activity, enrolleesContext, tick]);

  if (!activity || !group) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center">
        <p className="text-sm text-muted-foreground">活动不存在</p>
      </div>
    );
  }

  const enrolledOccs = myEnrollments
    .map((e) =>
      e.occurrenceId
        ? pickerOccurrences.find((o) => o.id === e.occurrenceId) ??
          occs.find((o) => o.id === e.occurrenceId)
        : undefined,
    )
    .filter((o): o is NonNullable<typeof o> => !!o);

  const nextOcc = occs.find((o) => o.status === "scheduled");
  const displayOcc = enrolledOccs[0] ?? nextOcc;
  const phase = multiOccMode
    ? getActivityDisplayPhaseForEnrollments(
        activity,
        pickerOccurrences,
        enrolledOccurrenceIds,
      )
    : displayOcc
      ? getActivityDisplayPhaseForEnrollments(
          activity,
          [displayOcc],
          enrolledOccurrenceIds,
        )
      : getActivityPhase(activity.startAt, activity.endAt);

  const isOrganizer = canOrganizeActivity(activity.id, CURRENT_EMPLOYEE_ID);

  const focusOccurrenceId = searchParams.get("occurrenceId") ?? undefined;
  const focusOccurrencePhase = (() => {
    if (!focusOccurrenceId) return undefined;
    if (focusOccurrenceId.startsWith("virtual-")) {
      if (activity.activityKind === "one_off" && activity.startAt && activity.endAt) {
        return getActivityPhase(activity.startAt, activity.endAt);
      }
      return undefined;
    }
    const occ =
      occs.find((o) => o.id === focusOccurrenceId) ??
      pickerOccurrences.find((o) => o.id === focusOccurrenceId);
    return occ
      ? getActivityPhase(occ.startAt, occ.endAt)
      : undefined;
  })();

  const allEnrolledOccurrencesEnded =
    hasEnrollment &&
    (enrolledOccs.length > 0
      ? enrolledOccs.every(
          (o) => getActivityPhase(o.startAt, o.endAt) === "已结束",
        )
      : activity.activityKind === "one_off" &&
          activity.startAt &&
          activity.endAt
        ? getActivityPhase(activity.startAt, activity.endAt) === "已结束"
        : seriesWholeMode
          ? (() => {
              const active = occs.filter((o) => o.status !== "cancelled");
              return (
                active.length > 0 &&
                active.every(
                  (o) =>
                    getActivityPhase(o.startAt, o.endAt) === "已结束",
                )
              );
            })()
          : false);

  /** 报名者查看已结束场次（含活动仍有未来场次、仅本场已结束） */
  const participantEndedContext =
    !isOrganizer &&
    hasEnrollment &&
    (focusOccurrencePhase === "已结束" ||
      (!focusOccurrenceId && allEnrolledOccurrencesEnded));

  const participates = hasEnrollment || isOrganizer;
  const isTerminated = activity.status === "cancelled";
  const wantsEdit = searchParams.get("edit") === "1";
  const isEditing =
    wantsEdit && isOrganizer && phase !== "已结束" && !isTerminated;
  const organizer = getEmployee(activity.organizerId);
  const formValues = activityToFormValues(activity, occs);
  const enrollBlockedReason = isTerminated
    ? "活动已终止"
    : activity.activityKind === "series"
      ? seriesEnrollmentBlockedReason(activity, occs)
      : oneOffEnrollmentBlockedReason(activity);
  const atCapacity =
    activity.capacity != null &&
    countActivityEnrollments(activity.id) >= activity.capacity &&
    !hasEnrollment;
  const full = atCapacity;
  const canPickMore =
    multiOccMode && hasSelectablePickerRows(pickerRows) && !enrollBlockedReason;
  const canEnroll =
    !enrollBlockedReason &&
    !full &&
    (seriesWholeMode
      ? !hasEnrollment && isSeriesWholeEnrollmentOpen(activity, occs)
      : multiOccMode
        ? canPickMore
        : !hasEnrollment &&
          getActivityPhase(activity.startAt, activity.endAt) === "未开始");

  const refresh = () => setTick((n) => n + 1);

  const refreshComments = (scrollToLatest = false) => {
    setCommentTick((n) => n + 1);
    setScrollToLatestComment(scrollToLatest);
    if (scrollToLatest) {
      window.setTimeout(() => setScrollToLatestComment(false), 800);
    }
  };

  const openCommentComposer = (focusImages = false) => {
    setComposerFocusImages(focusImages);
    setCommentSheetOpen(true);
  };

  const handleCommentSubmit = (input: {
    content: string;
    imageUrls: string[];
  }) => {
    if (!activity) return false;
    const result = addActivityComment(
      activity.id,
      CURRENT_EMPLOYEE_ID,
      input,
    );
    if (!result) {
      toast.error("发布失败，请稍后重试");
      return false;
    }
    refreshComments(true);
    toast.success("评论已发布");
    return true;
  };

  const handleCommentDelete = (commentId: string) => {
    if (!deleteActivityComment(commentId, CURRENT_EMPLOYEE_ID)) {
      toast.error("删除失败");
      return;
    }
    refreshComments(false);
    toast.success("已删除");
  };

  const handleCommentLike = (commentId: string) => {
    toggleCommentLike(commentId, CURRENT_EMPLOYEE_ID);
    refreshComments(false);
  };

  const handleCommentReply = (parentId: string, content: string) => {
    if (!activity) return;
    const result = addCommentReply(
      activity.id,
      parentId,
      CURRENT_EMPLOYEE_ID,
      content,
    );
    if (!result) {
      toast.error("回复失败，请稍后重试");
      return;
    }
    refreshComments(false);
    toast.success("回复已发布");
  };

  const openEnrollees = (
    occurrenceId: string,
    sessionLabel: string,
    enrollCount: number,
  ) => {
    setEnrolleesContext({ occurrenceId, sessionLabel, enrollCount });
    setEnrolleesOpen(true);
  };

  const openEnrollDialog = () => {
    setPickOccIds(new Set());
    setEnrollOpen(true);
  };

  const togglePick = (occurrenceId: string, checked: boolean) => {
    setPickOccIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(occurrenceId);
      else next.delete(occurrenceId);
      return next;
    });
  };

  const doEnroll = () => {
    if (enrollBlockedReason) {
      toast.error(enrollBlockedReason);
      return;
    }

    if (seriesWholeMode) {
      const result = enrollActivity(activity.id, CURRENT_EMPLOYEE_ID);
      if (!result) {
        toast.error("报名失败，请稍后重试");
        return;
      }
      refresh();
      toast.success("已报名系列活动");
      return;
    }

    if (multiOccMode) {
      if (pickOccIds.size === 0) {
        toast.error("请至少选择一个场次");
        return;
      }
      const items = [...pickOccIds].map((occurrenceId) => {
        const row = pickerRows.find((r) => r.occurrence.id === occurrenceId);
        return {
          occurrenceId,
          snapshot: row?.occurrence,
        };
      });
      const created = enrollOccurrences(
        activity.id,
        CURRENT_EMPLOYEE_ID,
        items,
      );
      if (created.length === 0) {
        toast.error("所选场次无法报名，请重试");
        return;
      }
      refresh();
      setEnrollOpen(false);
      setPickOccIds(new Set());
      toast.success(
        created.length > 1
          ? `已成功报名 ${created.length} 个场次`
          : "报名成功",
      );
      return;
    }

    const result = enrollActivity(activity.id, CURRENT_EMPLOYEE_ID);
    if (!result) {
      toast.error("报名失败，请稍后重试");
      return;
    }
    refresh();
    toast.success("报名成功");
  };

  const doCancel = () => {
    if (!cancelAllEnrollments(activity.id, CURRENT_EMPLOYEE_ID)) {
      toast.error("取消失败");
      return;
    }
    refresh();
    setCancelOpen(false);
    toast.success("已取消报名");
  };

  const exitEditMode = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    setSearchParams(next, { replace: true });
  };

  const handleBack = () => {
    if (isEditing) {
      exitEditMode();
      return;
    }
    goBack();
  };

  const handleTerminated = (updated: GroupActivity) => {
    setActivityOverride(updated);
    exitEditMode();
    refresh();
  };

  const canCancel =
    hasEnrollment &&
    !isOrganizer &&
    (seriesWholeMode
      ? isSeriesWholeEnrollmentOpen(activity, occs)
      : phase !== "已结束");

  const handleSaved = (updated: GroupActivity) => {
    setActivityOverride(updated);
    exitEditMode();
    setTick((n) => n + 1);
  };

  /** 详情页底部操作：已结束/进行中/指定场次已结束时不展示 */
  const footerPhase = focusOccurrencePhase ?? phase;
  const showFooter =
    isTerminated ||
    (!participantEndedContext &&
      footerPhase !== "已结束" &&
      footerPhase !== "进行中");

  const showCommentComposer = !isEditing;
  const showBottomBar = showCommentComposer || showFooter;
  const mainBottomPadding = showBottomBar ? "pb-[4.75rem]" : "pb-6";

  const enrollButtonLabel = () => {
    if (hasEnrollment) {
      if (seriesWholeMode) return "已报名系列活动";
      if (canPickMore) return `继续报名（已报 ${myEnrollments.length} 场）`;
      return `已报名 ${myEnrollments.length} 场`;
    }
    if (isTerminated) return "活动已终止";
    if (enrollBlockedReason) return "报名已截止";
    if (full) return "名额已满";
    if (phase === "已结束") return "已结束";
    return "立即报名";
  };

  if (isEditing) {
    return (
      <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
        <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
          <button
            type="button"
            onClick={handleBack}
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
          onTerminated={handleTerminated}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-semibold">{activity.title}</h1>
      </header>

      <main
        className={`flex-1 space-y-3 overflow-y-auto px-3 scrollbar-hide ${mainBottomPadding}`}
      >
        {isTerminated && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            本活动已由创建人终止，不再接受报名，未举办的场次已取消。
          </div>
        )}

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
          seriesEnrollmentMode={formValues.seriesEnrollmentMode}
          recurrence={formValues.recurrence}
          weeklyDay={formValues.weeklyDay}
          monthDay={formValues.monthDay}
          recurringTime={formValues.recurringTime}
          recurringEndTime={formValues.recurringEndTime}
          onViewOccurrenceEnrollees={isOrganizer ? openEnrollees : undefined}
        />

        {(organizer || participates) && (
          <section className="space-y-2 rounded-2xl bg-card p-4 shadow-soft text-sm">
            {organizer && (
              <p>
                <span className="text-muted-foreground">组织者：</span>
                {organizer.name} · {organizer.deptName}
              </p>
            )}
            {isOrganizer && !myEnrollments.length && (
              <p className="text-sm text-muted-foreground">
                你已作为组织者参与本活动
              </p>
            )}
            {participates && seriesWholeMode && (
              <p>
                <span className="text-muted-foreground">报名范围：</span>
                系列活动全部场次
              </p>
            )}
            {enrolledOccs.length > 0 && (
              <div>
                <p className="text-muted-foreground">
                  已报场次（{enrolledOccs.length}）：
                </p>
                <ul className="mt-1 space-y-0.5 text-foreground">
                  {enrolledOccs.map((occ) => {
                    const idx =
                      activity.activityKind === "series"
                        ? pickerOccurrences.findIndex((o) => o.id === occ.id)
                        : undefined;
                    return (
                      <li key={occ.id} className="text-sm">
                        {formatOccurrenceLabel(occ, idx >= 0 ? idx : undefined)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        )}

        {showCommentComposer && (
          <ActivityCommentSection
            comments={comments}
            commentCount={commentCount}
            onDelete={handleCommentDelete}
            onLike={handleCommentLike}
            onReply={handleCommentReply}
            scrollToLatest={scrollToLatestComment}
          />
        )}

      </main>

      {showBottomBar && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex max-w-md items-center gap-2 border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur">
          {showCommentComposer && (
            <ActivityCommentComposerInline onOpenComposer={openCommentComposer} />
          )}

          {showFooter && (
            <div className="shrink-0">
              {isTerminated ? (
                <span className="whitespace-nowrap px-1 text-xs text-muted-foreground">
                  活动已终止
                </span>
              ) : isOrganizer ? (
                <ActivityOrganizerFooter
                  activity={activity}
                  actorId={CURRENT_EMPLOYEE_ID}
                  canEdit={phase !== "已结束"}
                  compact={showCommentComposer}
                  onEdit={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("edit", "1");
                    setSearchParams(next);
                  }}
                  onTerminated={handleTerminated}
                />
              ) : canCancel ? (
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="shrink-0 whitespace-nowrap rounded-full border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive active:scale-[0.99]"
                >
                  取消报名
                  {myEnrollments.length > 1
                    ? ` ${myEnrollments.length}场`
                    : ""}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canEnroll && !hasEnrollment}
                  onClick={() => {
                    if (multiOccMode) {
                      openEnrollDialog();
                    } else {
                      doEnroll();
                    }
                  }}
                  className="min-w-[6.5rem] max-w-[12rem] shrink-0 truncate rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground active:scale-[0.99]"
                >
                  {enrollButtonLabel()}
                </button>
              )}
            </div>
          )}
        </footer>
      )}

      {showCommentComposer && (
        <ActivityCommentComposerSheet
          open={commentSheetOpen}
          onOpenChange={setCommentSheetOpen}
          initialFocusImages={composerFocusImages}
          onSubmit={handleCommentSubmit}
        />
      )}

      {multiOccMode && (
        <Sheet
          open={enrollOpen}
          onOpenChange={(open) => {
            setEnrollOpen(open);
            if (!open) setPickOccIds(new Set());
          }}
        >
          <SheetContent
            side="bottom"
            className="flex max-h-[92dvh] flex-col gap-0 rounded-t-2xl px-0 pb-0 pt-3 [&>button]:hidden"
          >
            <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border" />
            <SheetHeader className="shrink-0 space-y-1 px-4 text-left">
              <SheetTitle className="text-base">选择场次</SheetTitle>
              <SheetDescription className="line-clamp-2 text-sm">
                {activity.title}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-3 min-h-0 flex-1 overflow-hidden px-4">
              <OccurrenceMultiPicker
                activity={activity}
                rows={pickerRows}
                selectedIds={pickOccIds}
                beyondCount={pickerBeyondCount}
                onToggle={togglePick}
              />
            </div>
            <div className="mt-3 flex shrink-0 gap-2 border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setEnrollOpen(false)}
                className="flex-1 rounded-full border border-border py-3 text-sm font-medium text-foreground active:scale-[0.99]"
              >
                返回
              </button>
              <button
                type="button"
                disabled={pickOccIds.size === 0}
                onClick={doEnroll}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground active:scale-[0.99]"
              >
                {pickOccIds.size > 0
                  ? `确认报名 · ${pickOccIds.size} 场`
                  : "请选择场次"}
              </button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {enrolleesContext && (
        <ActivityEnrolleesSheet
          open={enrolleesOpen}
          onOpenChange={setEnrolleesOpen}
          sessionLabel={enrolleesContext.sessionLabel}
          enrolleeCount={enrolleesContext.enrollCount}
          enrollees={occurrenceEnrollees}
        />
      )}

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>取消报名</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>确认取消「{activity.title}」的报名？</p>
                {enrolledOccs.length > 0 && (
                  <ul className="space-y-0.5 text-sm text-foreground">
                    {enrolledOccs.map((occ) => (
                      <li key={occ.id}>
                        ·{" "}
                        {formatOccurrenceLabel(
                          occ,
                          activity.activityKind === "series"
                            ? pickerOccurrences.findIndex(
                                (o) => o.id === occ.id,
                              )
                            : undefined,
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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

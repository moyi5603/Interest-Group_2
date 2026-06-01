import { useMemo, useState } from "react";
import ActivityFormFields, {
  type SeriesSessionDraft,
} from "@/components/interest/ActivityFormFields";
import { combineDateAndTime, type MobileDateTimeRangeValue } from "@/components/ui/mobile-date-field";
import type {
  GroupActivity,
  InterestGroupFull,
  SeriesEnrollmentMode,
} from "@/data/interestTypes";
import { getTagsByIds } from "@/data/interestTags";
import {
  canTerminateActivity,
  CURRENT_EMPLOYEE_ID,
  getOccurrencesByActivity,
  hasOtherEnrollments,
  terminateActivity,
  updateActivity,
  updateRecurringOccurrences,
  updateSeriesOccurrences,
} from "@/data/interestGroups";
import {
  activityToFormValues,
  emptySchedule,
  scheduleToIso,
} from "@/lib/activityFormState";
import {
  WEEKDAY_OPTIONS,
  buildMonthlyRrule,
  buildRecurringEndAt,
  buildRecurringStartAt,
  buildWeeklyRrule,
  isEndAfterStart,
  isSameDayEndAfterStart,
  parseRecurringTime,
} from "@/lib/interestOccurrences";
import { toast } from "@/components/ui/sonner";

const newSessionKey = () =>
  `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

type Props = {
  activity: GroupActivity;
  group: InterestGroupFull;
  onSaved: (activity: GroupActivity) => void;
  onTerminated?: (activity: GroupActivity) => void;
};

const ActivityOrganizerEdit = ({
  activity,
  group,
  onSaved,
  onTerminated,
}: Props) => {
  const occurrences = useMemo(
    () => getOccurrencesByActivity(activity.id),
    [activity.id],
  );

  const scheduleLocked = hasOtherEnrollments(
    activity.id,
    activity.organizerId,
  );

  const initial = useMemo(
    () => activityToFormValues(activity, occurrences),
    [activity, occurrences],
  );

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [location, setLocation] = useState(initial.location);
  const [capacity, setCapacity] = useState(initial.capacity);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(
    initial.coverUrl,
  );
  const [oneOffSchedule, setOneOffSchedule] = useState(initial.oneOffSchedule);
  const [seriesSessions, setSeriesSessions] = useState<SeriesSessionDraft[]>(
    initial.seriesSessions.length > 0
      ? initial.seriesSessions
      : [{ key: newSessionKey(), ...emptySchedule() }],
  );
  const [recurrence, setRecurrence] = useState(initial.recurrence);
  const [weeklyDay, setWeeklyDay] = useState(initial.weeklyDay);
  const [monthDay, setMonthDay] = useState(initial.monthDay);
  const [recurringTime, setRecurringTime] = useState(initial.recurringTime);
  const [recurringEndTime, setRecurringEndTime] = useState(
    initial.recurringEndTime,
  );
  const [seriesEnrollmentMode, setSeriesEnrollmentMode] =
    useState<SeriesEnrollmentMode>(initial.seriesEnrollmentMode);

  const updateSession = (
    key: string,
    patch: Partial<MobileDateTimeRangeValue>,
  ) => {
    setSeriesSessions((list) =>
      list.map((s) => (s.key === key ? { ...s, ...patch } : s)),
    );
  };

  const addSession = () => {
    setSeriesSessions((list) => [
      ...list,
      { key: newSessionKey(), ...emptySchedule() },
    ]);
  };

  const removeSession = (key: string) => {
    setSeriesSessions((list) =>
      list.length <= 1 ? list : list.filter((s) => s.key !== key),
    );
  };

  const save = () => {
    if (!title.trim()) {
      toast.error("请填写活动名称");
      return;
    }
    if (!description.trim()) {
      toast.error("请填写活动介绍");
      return;
    }
    if (!location.trim()) {
      toast.error("请填写活动地点");
      return;
    }
    const cap = Number(capacity);
    if (!capacity.trim() || Number.isNaN(cap) || cap < 1) {
      toast.error("请填写人数上限");
      return;
    }
    const patch: Parameters<typeof updateActivity>[1] = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      capacity: cap,
      coverUrl,
    };

    if (!scheduleLocked) {
      if (activity.activityKind === "one_off") {
        if (
          !oneOffSchedule.date ||
          !oneOffSchedule.startTime ||
          !oneOffSchedule.endTime
        ) {
          toast.error("请选择日期与时段");
          return;
        }
        const { startAt, endAt } = scheduleToIso(oneOffSchedule);
        if (!isEndAfterStart(startAt, endAt)) {
          toast.error("结束时间须晚于开始时间");
          return;
        }
        patch.startAt = startAt;
        patch.endAt = endAt;
      } else if (activity.activityKind === "series") {
        if (seriesSessions.length < 1) {
          toast.error("请至少保留 1 个场次");
          return;
        }
        const missingSchedule = seriesSessions.some(
          (s) => !s.date || !s.startTime || !s.endTime,
        );
        if (missingSchedule) {
          toast.error("请为每个场次填写日期与时段");
          return;
        }
        const sessions = seriesSessions.map((s) => ({
          startAt: new Date(
            combineDateAndTime(s.date, s.startTime),
          ).toISOString(),
          endAt: new Date(combineDateAndTime(s.date, s.endTime)).toISOString(),
        }));
        if (sessions.some((s) => !isEndAfterStart(s.startAt, s.endAt))) {
          toast.error("每场结束时间须晚于开始时间");
          return;
        }
        const sorted = [...sessions].sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        );
        patch.startAt = sorted[0].startAt;
        patch.endAt = sorted[sorted.length - 1].endAt;
        patch.seriesEnrollmentMode = seriesEnrollmentMode;
        updateSeriesOccurrences(activity.id, sorted, cap);
      } else if (activity.activityKind === "recurring") {
        if (recurrence === "weekly" && weeklyDay == null) {
          toast.error("请选择每周几");
          return;
        }
        if (recurrence === "monthly" && monthDay == null) {
          toast.error("请选择每月几号");
          return;
        }
        if (!recurringTime || !recurringEndTime) {
          toast.error("请选择活动时段");
          return;
        }
        if (!isSameDayEndAfterStart(recurringTime, recurringEndTime)) {
          toast.error("结束时间须晚于开始时间");
          return;
        }
        const { hour, minute } = parseRecurringTime(recurringTime);
        const weekdayOpt =
          recurrence === "weekly"
            ? WEEKDAY_OPTIONS.find((w) => w.value === weeklyDay)
            : undefined;
        if (recurrence === "weekly" && !weekdayOpt) {
          toast.error("请选择每周几");
          return;
        }
        const startAt = buildRecurringStartAt(recurrence, {
          weekday: weeklyDay ?? 0,
          monthDay,
          hour,
          minute,
        });
        patch.startAt = startAt;
        patch.endAt = buildRecurringEndAt(startAt, recurringEndTime);
        patch.rrule =
          recurrence === "monthly"
            ? buildMonthlyRrule(monthDay)
            : buildWeeklyRrule(weekdayOpt!.rrule);
      }
    }

    const updated = updateActivity(activity.id, patch);
    if (!updated) {
      toast.error("保存失败");
      return;
    }

    if (!scheduleLocked && activity.activityKind === "recurring") {
      updateRecurringOccurrences(updated, 4);
    }

    toast.success("活动信息已更新");
    onSaved(updated);
  };

  const handleTerminate = () => {
    const updated = terminateActivity(activity.id, CURRENT_EMPLOYEE_ID);
    if (!updated) {
      toast.error("终止失败，请稍后重试");
      return;
    }
    toast.success("活动已终止，请重新发布新活动");
    onTerminated?.(updated);
  };

  const showTerminate =
    scheduleLocked &&
    activity.status === "published" &&
    canTerminateActivity(activity.id, activity.organizerId);

  return (
    <>
      <main className="flex-1 overflow-y-auto px-3 pb-28 scrollbar-hide">
        {scheduleLocked && (
          <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
            已有其他用户报名，不可修改活动时间、场次或报名方式。如需调整，请先终止本活动，再重新发布。
          </div>
        )}
        <ActivityFormFields
          mode="edit"
          scheduleLocked={scheduleLocked}
          editOccurrences={occurrences}
          kind={activity.activityKind}
          title={title}
          description={description}
          location={location}
          capacity={capacity}
          coverUrl={coverUrl}
          oneOffSchedule={oneOffSchedule}
          seriesSessions={seriesSessions}
          seriesEnrollmentMode={seriesEnrollmentMode}
          recurrence={recurrence}
          weeklyDay={weeklyDay}
          monthDay={monthDay}
          recurringTime={recurringTime}
          recurringEndTime={recurringEndTime}
          onKindChange={() => {}}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onLocationChange={setLocation}
          onCapacityChange={setCapacity}
          onCoverChange={setCoverUrl}
          onOneOffScheduleChange={setOneOffSchedule}
          onSeriesSessionChange={updateSession}
          onAddSeriesSession={addSession}
          onRemoveSeriesSession={removeSession}
          onSeriesEnrollmentModeChange={setSeriesEnrollmentMode}
          onRecurrenceChange={setRecurrence}
          onWeeklyDayChange={setWeeklyDay}
          onMonthDayChange={setMonthDay}
          onRecurringTimeChange={(start, end) => {
            setRecurringTime(start);
            setRecurringEndTime(end);
          }}
          groupName={group.name}
          groupTagNames={getTagsByIds(group.tagIds).map((tag) => tag.name)}
        />

      </main>

      <footer className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-border bg-background/95 px-3 py-3 backdrop-blur">
        <div className={showTerminate ? "flex flex-col gap-2" : undefined}>
          <button
            type="button"
            onClick={save}
            className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
          >
            保存修改
          </button>
          {showTerminate && (
            <button
              type="button"
              onClick={handleTerminate}
              className="w-full rounded-full border border-destructive/50 py-3 text-sm font-medium text-destructive active:scale-[0.99]"
            >
              终止活动
            </button>
          )}
        </div>
      </footer>
    </>
  );
};

export default ActivityOrganizerEdit;

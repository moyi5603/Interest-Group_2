import { useMemo, useState } from "react";
import ActivityFormFields, {
  type SeriesSessionDraft,
} from "@/components/interest/ActivityFormFields";
import { combineDateAndTime, type MobileDateTimeRangeValue } from "@/components/ui/mobile-date-field";
import type { GroupActivity, InterestGroupFull } from "@/data/interestTypes";
import {
  getOccurrencesByActivity,
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
import { toast } from "sonner";

const newSessionKey = () =>
  `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

type Props = {
  activity: GroupActivity;
  group: InterestGroupFull;
  onSaved: (activity: GroupActivity) => void;
};

const ActivityOrganizerEdit = ({ activity, onSaved }: Props) => {
  const initial = useMemo(
    () =>
      activityToFormValues(activity, getOccurrencesByActivity(activity.id)),
    [activity],
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
    initial.seriesSessions.length >= 2
      ? initial.seriesSessions
      : [
          { key: newSessionKey(), ...emptySchedule() },
          { key: newSessionKey(), ...emptySchedule() },
        ],
  );
  const [recurrence, setRecurrence] = useState(initial.recurrence);
  const [weeklyDay, setWeeklyDay] = useState(initial.weeklyDay);
  const [monthDay, setMonthDay] = useState(initial.monthDay);
  const [recurringTime, setRecurringTime] = useState(initial.recurringTime);
  const [recurringEndTime, setRecurringEndTime] = useState(
    initial.recurringEndTime,
  );

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
      list.length <= 2 ? list : list.filter((s) => s.key !== key),
    );
  };

  const save = () => {
    if (!title.trim()) {
      toast.error("请填写活动标题");
      return;
    }
    const cap = Number(capacity) || undefined;
    const patch: Parameters<typeof updateActivity>[1] = {
      title: title.trim(),
      description: description.trim() || "欢迎参加！",
      location: location.trim() || undefined,
      capacity: cap,
      coverUrl,
    };

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
      if (seriesSessions.length < 2) {
        toast.error("系列活动至少需要 2 个场次");
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
      updateSeriesOccurrences(activity.id, sorted, cap);
    } else if (activity.activityKind === "recurring") {
      if (!recurringTime || !recurringEndTime) {
        toast.error("请选择开始与结束时间");
        return;
      }
      if (!isSameDayEndAfterStart(recurringTime, recurringEndTime)) {
        toast.error("结束时间须晚于开始时间");
        return;
      }
      const { hour, minute } = parseRecurringTime(recurringTime);
      const weekdayOpt = WEEKDAY_OPTIONS.find((w) => w.value === weeklyDay)!;
      const startAt = buildRecurringStartAt(recurrence, {
        weekday: weeklyDay,
        monthDay,
        hour,
        minute,
      });
      patch.startAt = startAt;
      patch.endAt = buildRecurringEndAt(startAt, recurringEndTime);
      patch.rrule =
        recurrence === "monthly"
          ? buildMonthlyRrule(monthDay)
          : buildWeeklyRrule(weekdayOpt.rrule);
    }

    const updated = updateActivity(activity.id, patch);
    if (!updated) {
      toast.error("保存失败");
      return;
    }

    if (activity.activityKind === "recurring") {
      updateRecurringOccurrences(updated, 4);
    }

    toast.success("活动信息已更新");
    onSaved(updated);
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto px-3 pb-28 scrollbar-hide">
        <ActivityFormFields
          mode="edit"
          kind={activity.activityKind}
          title={title}
          description={description}
          location={location}
          capacity={capacity}
          coverUrl={coverUrl}
          oneOffSchedule={oneOffSchedule}
          seriesSessions={seriesSessions}
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
          onRecurrenceChange={setRecurrence}
          onWeeklyDayChange={setWeeklyDay}
          onMonthDayChange={setMonthDay}
          onRecurringTimeChange={(start, end) => {
            setRecurringTime(start);
            setRecurringEndTime(end);
          }}
        />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-border bg-background/95 px-3 py-3 backdrop-blur">
        <button
          type="button"
          onClick={save}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
        >
          保存修改
        </button>
      </footer>
    </>
  );
};

export default ActivityOrganizerEdit;

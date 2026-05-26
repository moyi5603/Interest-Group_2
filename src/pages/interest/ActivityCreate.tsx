import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ActivityFormFields, {
  type SeriesSessionDraft,
} from "@/components/interest/ActivityFormFields";
import { combineDateAndTime, type MobileDateTimeRangeValue } from "@/components/ui/mobile-date-field";
import { DEFAULT_ACTIVITY_COVER } from "@/data/interestImages";
import {
  CURRENT_EMPLOYEE_ID,
  addActivity,
  addOccurrences,
  getGroupById,
} from "@/data/interestGroups";
import { emptySchedule } from "@/lib/activityFormState";
import {
  WEEKDAY_OPTIONS,
  buildMonthlyRrule,
  buildRecurringEndAt,
  buildRecurringStartAt,
  buildSeriesOccurrences,
  buildWeeklyRrule,
  expandRecurringOccurrences,
  isEndAfterStart,
  isSameDayEndAfterStart,
  parseRecurringTime,
} from "@/lib/interestOccurrences";
import type { ActivityKind, GroupActivity } from "@/data/interestTypes";
import { toast } from "sonner";

const newSessionKey = () =>
  `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const defaultSeriesSessions = (): SeriesSessionDraft[] => [
  { key: newSessionKey(), ...emptySchedule() },
  { key: newSessionKey(), ...emptySchedule() },
  { key: newSessionKey(), ...emptySchedule() },
];

const ActivityCreate = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const group = getGroupById(groupId || "");

  const [kind, setKind] = useState<ActivityKind>("one_off");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("20");
  const [oneOffSchedule, setOneOffSchedule] =
    useState<MobileDateTimeRangeValue>(emptySchedule());
  const [recurrence, setRecurrence] = useState<"weekly" | "monthly">("weekly");
  const [weeklyDay, setWeeklyDay] = useState(3);
  const [monthDay, setMonthDay] = useState(15);
  const [recurringTime, setRecurringTime] = useState("19:00");
  const [recurringEndTime, setRecurringEndTime] = useState("21:00");
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [seriesSessions, setSeriesSessions] = useState<SeriesSessionDraft[]>(
    [],
  );

  if (!group) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center">
        <p className="text-sm text-muted-foreground">小组不存在</p>
      </div>
    );
  }

  const selectKind = (next: ActivityKind) => {
    setKind(next);
    if (next === "series" && seriesSessions.length === 0) {
      setSeriesSessions(defaultSeriesSessions());
      if (!capacity || capacity === "20") setCapacity("50");
    }
  };

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

  const publish = () => {
    if (!title.trim()) {
      toast.error("请填写活动标题");
      return;
    }
    const id = `act-${Date.now()}`;
    const cap = Number(capacity) || undefined;
    const base: GroupActivity = {
      id,
      groupId: group.id,
      organizerId: CURRENT_EMPLOYEE_ID,
      title: title.trim(),
      description: description.trim() || "欢迎参加！",
      coverUrl: coverUrl ?? DEFAULT_ACTIVITY_COVER,
      activityKind: kind,
      location: location.trim() || undefined,
      capacity: cap,
      status: "published",
      startAt:
        combineDateAndTime(
          oneOffSchedule.date,
          oneOffSchedule.startTime,
        ) || new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      favoriteCount: 0,
    };

    if (kind === "recurring") {
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
      base.startAt = buildRecurringStartAt(recurrence, {
        weekday: weeklyDay,
        monthDay,
        hour,
        minute,
      });
      base.endAt = buildRecurringEndAt(base.startAt, recurringEndTime);
      base.rrule =
        recurrence === "monthly"
          ? buildMonthlyRrule(monthDay)
          : buildWeeklyRrule(weekdayOpt.rrule);
      addActivity(base);
      addOccurrences(expandRecurringOccurrences(base, 4));
    } else if (kind === "series") {
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
      const invalidRange = sessions.some(
        (s) => !isEndAfterStart(s.startAt, s.endAt),
      );
      if (invalidRange) {
        toast.error("每场结束时间须晚于开始时间");
        return;
      }
      const sorted = [...sessions].sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
      base.startAt = sorted[0].startAt;
      base.endAt = sorted[0].endAt;
      addActivity({ ...base, activityKind: "series" });
      addOccurrences(buildSeriesOccurrences(id, sessions, cap));
    } else {
      if (
        !oneOffSchedule.date ||
        !oneOffSchedule.startTime ||
        !oneOffSchedule.endTime
      ) {
        toast.error("请选择日期与时段");
        return;
      }
      const startIso = new Date(
        combineDateAndTime(oneOffSchedule.date, oneOffSchedule.startTime),
      ).toISOString();
      const endIso = new Date(
        combineDateAndTime(oneOffSchedule.date, oneOffSchedule.endTime),
      ).toISOString();
      if (!isEndAfterStart(startIso, endIso)) {
        toast.error("结束时间须晚于开始时间");
        return;
      }
      base.startAt = startIso;
      base.endAt = endIso;
      addActivity(base);
    }

    toast.success("活动已发布");
    navigate(`/agents/interest-groups/${group.id}`);
  };

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
        <h1 className="text-base font-semibold">发布活动</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-3 pb-24 scrollbar-hide">
        <ActivityFormFields
          mode="create"
          kind={kind}
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
          onKindChange={selectKind}
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

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={publish}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
        >
          发布活动
        </button>
      </div>
    </div>
  );
};

export default ActivityCreate;

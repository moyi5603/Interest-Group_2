import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import ActivityFormFields, {
  type SeriesSessionDraft,
} from "@/components/interest/ActivityFormFields";
import { combineDateAndTime, type MobileDateTimeRangeValue } from "@/components/ui/mobile-date-field";
import { getTagsByIds } from "@/data/interestTags";
import {
  CURRENT_EMPLOYEE_ID,
  addActivity,
  addOccurrences,
  enrollOrganizerAsParticipant,
  getActivityById,
  getGroupById,
  isGroupOwner,
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
import type {
  ActivityKind,
  GroupActivity,
  SeriesEnrollmentMode,
} from "@/data/interestTypes";
import InterestRoleGate from "@/components/interest/InterestRoleGate";
import { canManageInterestGroups } from "@/lib/appRoleStore";
import { toast } from "@/components/ui/sonner";

const newSessionKey = () =>
  `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const defaultSeriesSessions = (): SeriesSessionDraft[] => [
  { key: newSessionKey(), ...emptySchedule() },
];

const ActivityCreate = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const group = getGroupById(groupId || "");

  const [kind, setKind] = useState<ActivityKind>("one_off");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("20");
  const [oneOffSchedule, setOneOffSchedule] =
    useState<MobileDateTimeRangeValue>(emptySchedule());
  const [recurrence, setRecurrence] = useState<"weekly" | "monthly">("weekly");
  const [weeklyDay, setWeeklyDay] = useState<number | null>(null);
  const [monthDay, setMonthDay] = useState<number | null>(null);
  const [recurringTime, setRecurringTime] = useState("");
  const [recurringEndTime, setRecurringEndTime] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [seriesSessions, setSeriesSessions] = useState<SeriesSessionDraft[]>(
    [],
  );
  const [seriesEnrollmentMode, setSeriesEnrollmentMode] =
    useState<SeriesEnrollmentMode>("per_occurrence");

  if (!group) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center">
        <p className="text-sm text-muted-foreground">小组不存在</p>
      </div>
    );
  }

  if (!canManageInterestGroups()) {
    return (
      <InterestRoleGate
        actionLabel="发布活动"
        backLabel="返回小组"
        onBack={() => navigate(`/agents/interest-groups/${group.id}`)}
      />
    );
  }

  if (!isGroupOwner(group.id, CURRENT_EMPLOYEE_ID)) {
    return (
      <div className="mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-3 px-6">
        <p className="text-center text-sm text-muted-foreground">
          仅小组创建者可发布活动
        </p>
        <button
          type="button"
          onClick={() => navigate(`/agents/interest-groups/${group.id}`)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          返回小组
        </button>
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
      list.length <= 1 ? list : list.filter((s) => s.key !== key),
    );
  };

  const publish = () => {
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
    if (!coverUrl) {
      toast.error("请上传活动封面");
      return;
    }
    const id = `act-${Date.now()}`;
    const base: GroupActivity = {
      id,
      groupId: group.id,
      organizerId: CURRENT_EMPLOYEE_ID,
      title: title.trim(),
      description: description.trim(),
      coverUrl,
      activityKind: kind,
      location: location.trim(),
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
      base.startAt = buildRecurringStartAt(recurrence, {
        weekday: weeklyDay ?? 0,
        monthDay: monthDay!,
        hour,
        minute,
      });
      base.endAt = buildRecurringEndAt(base.startAt, recurringEndTime);
      base.rrule =
        recurrence === "monthly"
          ? buildMonthlyRrule(monthDay!)
          : buildWeeklyRrule(weekdayOpt!.rrule);
      addActivity(base);
      addOccurrences(expandRecurringOccurrences(base, 4));
    } else if (kind === "series") {
      if (seriesSessions.length < 1) {
        toast.error("请至少添加 1 个场次");
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
      addActivity({
        ...base,
        activityKind: "series",
        seriesEnrollmentMode,
      });
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
      enrollOrganizerAsParticipant(getActivityById(id)!);
    }

    toast.success("活动已发布");
    navigate(`/agents/interest-groups/${group.id}`);
  };

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
          seriesEnrollmentMode={seriesEnrollmentMode}
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

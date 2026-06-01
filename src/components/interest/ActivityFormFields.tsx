import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import ActivityCover from "@/components/interest/ActivityCover";
import ActivityCoverUpload from "@/components/interest/ActivityCoverUpload";
import ActivityDescriptionField from "@/components/interest/ActivityDescriptionField";
import {
  ACTIVITY_KIND_LABEL,
  ACTIVITY_KIND_OPTIONS,
} from "@/components/interest/activityFormConstants";
import { interestTypography as ty } from "@/components/interest/interestTypography";
import {
  MobileDateTimeRangeField,
  MobileMonthDayField,
  MobileTimeRangeField,
  type MobileDateTimeRangeValue,
} from "@/components/ui/mobile-date-field";
import { resolveActivityCover } from "@/data/interestImages";
import type {
  ActivityKind,
  ActivityOccurrence,
  GroupActivity,
  SeriesEnrollmentMode,
} from "@/data/interestTypes";
import {
  WEEKDAY_OPTIONS,
  formatRecurringRuleLabel,
  formatScheduleFromParts,
  formatTimeRange,
} from "@/lib/interestOccurrences";
import {
  SERIES_ENROLLMENT_MODE_LABEL,
  SERIES_ENROLLMENT_MODE_OPTIONS,
} from "@/lib/seriesEnrollment";
import { cn } from "@/lib/utils";

export type SeriesSessionDraft = MobileDateTimeRangeValue & {
  key: string;
};

type BaseProps = {
  kind: ActivityKind;
  title: string;
  description: string;
  location: string;
  capacity: string;
  coverUrl?: string;
  oneOffSchedule: MobileDateTimeRangeValue;
  seriesSessions: SeriesSessionDraft[];
  seriesEnrollmentMode: SeriesEnrollmentMode;
  recurrence: "weekly" | "monthly";
  weeklyDay: number | null;
  monthDay: number | null;
  recurringTime: string;
  recurringEndTime: string;
};

type EditProps = BaseProps & {
  mode: "create" | "edit";
  /** 已有他人报名时，场次/时间规则只读 */
  scheduleLocked?: boolean;
  /** 编辑且场次锁定时，展示系列场次报名数 */
  editOccurrences?: ActivityOccurrence[];
  onKindChange: (kind: ActivityKind) => void;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onCapacityChange: (v: string) => void;
  onCoverChange: (v: string | undefined) => void;
  onOneOffScheduleChange: (v: MobileDateTimeRangeValue) => void;
  onSeriesSessionChange: (
    key: string,
    patch: Partial<MobileDateTimeRangeValue>,
  ) => void;
  onAddSeriesSession: () => void;
  onRemoveSeriesSession: (key: string) => void;
  onSeriesEnrollmentModeChange: (v: SeriesEnrollmentMode) => void;
  onRecurrenceChange: (v: "weekly" | "monthly") => void;
  onWeeklyDayChange: (v: number) => void;
  onMonthDayChange: (v: number) => void;
  onRecurringTimeChange: (start: string, end: string) => void;
  groupName?: string;
  groupTagNames?: string[];
};

type ViewProps = BaseProps & {
  mode: "view";
  activity: GroupActivity;
  occurrences?: ActivityOccurrence[];
  onViewOccurrenceEnrollees?: (
    occurrenceId: string,
    sessionLabel: string,
    enrollCount: number,
  ) => void;
};

type Props = EditProps | ViewProps;

const FormLabel = ({ children }: { children: ReactNode }) => (
  <span className={ty.formLabel}>
    <span className={ty.requiredMark} aria-hidden>
      *
    </span>
    {children}
  </span>
);

const ReadOnlyField = ({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) => (
  <div className="space-y-1">
    <span className="text-sm font-medium text-foreground">{label}</span>
    {multiline ? (
      <p className="whitespace-pre-line rounded-xl border border-border/60 bg-card px-3 py-2 text-sm leading-relaxed text-foreground">
        {value || "—"}
      </p>
    ) : (
      <p className="rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground">
        {value || "—"}
      </p>
    )}
  </div>
);

/** 详情页：标签与内容同一行 */
const ViewInlineRow = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="min-w-0 text-foreground">{value || "—"}</span>
  </div>
);

const EnrollCountAction = ({
  count,
  occurrenceId,
  sessionLabel,
  onView,
}: {
  count: number;
  occurrenceId: string;
  sessionLabel: string;
  onView?: ViewProps["onViewOccurrenceEnrollees"];
}) => {
  const text = `${count} 人报名`;
  if (!onView || count <= 0) {
    return (
      <span
        className={cn(
          "text-sm",
          count > 0 ? "text-muted-foreground" : "text-muted-foreground/70",
        )}
      >
        {text}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onView(occurrenceId, sessionLabel, count)}
      className="text-sm text-primary active:opacity-70"
    >
      {text}
    </button>
  );
};

const OccurrenceSessionRow = ({
  index,
  timeLabel,
  count,
  occurrenceId,
  sessionLabel,
  onView,
}: {
  index?: number;
  timeLabel: string;
  count?: number;
  occurrenceId?: string;
  sessionLabel?: string;
  onView?: ViewProps["onViewOccurrenceEnrollees"];
}) => (
  <div className="rounded-lg border border-border/60 bg-card px-2.5 py-2 text-sm text-foreground">
    {index != null && (
      <>
        <span className="font-medium text-muted-foreground">
          第 {index + 1} 场
        </span>
        <span className="text-muted-foreground"> · </span>
      </>
    )}
    <span>{timeLabel || "—"}</span>
    {occurrenceId != null && count != null && sessionLabel && (
      <>
        <span className="text-muted-foreground"> · </span>
        <EnrollCountAction
          count={count}
          occurrenceId={occurrenceId}
          sessionLabel={sessionLabel}
          onView={onView}
        />
      </>
    )}
  </div>
);

const ActivityFormFields = (props: Props) => {
  const { kind, mode } = props;
  const isView = mode === "view";
  const scheduleLocked =
    mode === "edit" && Boolean(props.scheduleLocked);
  const scheduleReadOnly = isView || scheduleLocked;
  const seriesOccurrences =
    isView && props.mode === "view"
      ? props.occurrences
      : scheduleLocked
        ? props.editOccurrences
        : undefined;
  const viewEnrollees =
    isView && props.mode === "view"
      ? props.onViewOccurrenceEnrollees
      : undefined;
  const coverDisplay =
    mode === "view"
      ? resolveActivityCover(props.activity)
      : props.coverUrl;

  return (
    <div className="space-y-4">
      {isView ? (
        <ViewInlineRow label="活动类型" value={ACTIVITY_KIND_LABEL[kind]} />
      ) : (
        <>
          <FormLabel>活动类型</FormLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {ACTIVITY_KIND_OPTIONS.map((k) => (
              <button
                key={k.key}
                type="button"
                disabled={mode === "edit"}
                onClick={() => props.onKindChange(k.key)}
                className={cn(
                  "rounded-lg border py-2 text-center text-sm font-medium",
                  kind === k.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                  mode === "edit" && kind !== k.key && "opacity-40",
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
        </>
      )}

      {isView ? (
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">活动封面</span>
          <ActivityCover coverUrl={coverDisplay} className="h-36 w-full rounded-2xl" />
        </div>
      ) : (
        <ActivityCoverUpload
          value={props.coverUrl}
          onChange={props.onCoverChange}
          required
        />
      )}

      {isView ? (
        <ViewInlineRow label="活动名称" value={props.title} />
      ) : (
        <label className="block space-y-1">
          <FormLabel>活动名称</FormLabel>
          <input
            value={props.title}
            onChange={(e) => props.onTitleChange(e.target.value)}
            placeholder="填写活动名称"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          />
        </label>
      )}

      {isView ? (
        <ReadOnlyField label="活动介绍" value={props.description} multiline />
      ) : (
        <ActivityDescriptionField
          value={props.description}
          onChange={props.onDescriptionChange}
          title={props.title}
          activityKind={kind}
          location={props.location}
          groupName={props.groupName}
          groupTagNames={props.groupTagNames}
        />
      )}

      {isView ? (
        <ViewInlineRow label="地点" value={props.location} />
      ) : (
        <label className="block space-y-1">
          <FormLabel>地点</FormLabel>
          <input
            value={props.location}
            onChange={(e) => props.onLocationChange(e.target.value)}
            placeholder="填写活动地点"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          />
        </label>
      )}

      {kind === "one_off" &&
        (scheduleReadOnly ? (
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">活动时间</span>
            <OccurrenceSessionRow
              timeLabel={formatScheduleFromParts(
                props.oneOffSchedule.date,
                props.oneOffSchedule.startTime,
                props.oneOffSchedule.endTime,
              )}
              count={seriesOccurrences?.[0]?.enrollCount ?? 0}
              occurrenceId={seriesOccurrences?.[0]?.id}
              sessionLabel="本场活动"
              onView={
                seriesOccurrences?.[0] ? viewEnrollees : undefined
              }
            />
          </div>
        ) : (
          <MobileDateTimeRangeField
            label="活动时间"
            value={props.oneOffSchedule}
            onChange={props.onOneOffScheduleChange}
            required
          />
        ))}

      {kind === "series" && (
        <section className="space-y-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3">
          {scheduleReadOnly ? (
            <ViewInlineRow
              label="报名方式"
              value={SERIES_ENROLLMENT_MODE_LABEL[props.seriesEnrollmentMode]}
            />
          ) : (
            <div className="space-y-2">
              <FormLabel>报名方式</FormLabel>
              <div className="flex gap-2">
                {SERIES_ENROLLMENT_MODE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    title={opt.description}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 transition-colors",
                      props.seriesEnrollmentMode === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border/60 bg-card",
                    )}
                  >
                    <input
                      type="radio"
                      name="series-enrollment-mode"
                      checked={props.seriesEnrollmentMode === opt.value}
                      onChange={() =>
                        props.onSeriesEnrollmentModeChange(opt.value)
                      }
                      className="accent-primary"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            {scheduleReadOnly ? (
              <span className={ty.formLabel}>系列场次</span>
            ) : (
              <FormLabel>系列场次</FormLabel>
            )}
            {!scheduleReadOnly && (
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                为每场填写开始与结束时间。
              </p>
            )}
          </div>
          <ul className="space-y-1.5">
            {props.seriesSessions.map((session, index) => (
              <li key={session.key}>
                {scheduleReadOnly ? (
                  <OccurrenceSessionRow
                    index={index}
                    timeLabel={formatScheduleFromParts(
                      session.date,
                      session.startTime,
                      session.endTime,
                    )}
                    count={seriesOccurrences?.[index]?.enrollCount ?? 0}
                    occurrenceId={seriesOccurrences?.[index]?.id}
                    sessionLabel={`第 ${index + 1} 场`}
                    onView={
                      seriesOccurrences?.[index] ? viewEnrollees : undefined
                    }
                  />
                ) : (
                  <div className="rounded-lg border border-border/60 bg-card px-2 py-1.5">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        第 {index + 1} 场
                      </span>
                      {props.seriesSessions.length > 1 && (
                        <button
                          type="button"
                          aria-label="删除场次"
                          onClick={() => props.onRemoveSeriesSession(session.key)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <MobileDateTimeRangeField
                      label={`第 ${index + 1} 场`}
                      value={{
                        date: session.date,
                        startTime: session.startTime,
                        endTime: session.endTime,
                      }}
                      onChange={(next) =>
                        props.onSeriesSessionChange(session.key, next)
                      }
                      compact
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
          {!scheduleReadOnly && props.seriesSessions.length < 10 && (
            <button
              type="button"
              onClick={props.onAddSeriesSession}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-primary/30 py-2 text-sm font-medium text-primary active:bg-primary/5"
            >
              <Plus className="h-3.5 w-3.5" />
              添加场次
            </button>
          )}
        </section>
      )}

      {kind === "recurring" && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-3">
          {scheduleReadOnly ? (
            <>
              <ViewInlineRow
                label="重复频率"
                value={formatRecurringRuleLabel(
                  props.recurrence,
                  props.weeklyDay,
                  props.monthDay,
                  props.recurringTime,
                  props.recurringEndTime,
                )}
              />
              {seriesOccurrences && seriesOccurrences.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-sm font-medium text-foreground">
                    近期场次
                  </span>
                  <ul className="space-y-1.5">
                    {seriesOccurrences.map((occ, index) => (
                      <li key={occ.id}>
                        <OccurrenceSessionRow
                          index={index}
                          timeLabel={formatTimeRange(occ.startAt, occ.endAt)}
                          count={occ.enrollCount}
                          occurrenceId={occ.id}
                          sessionLabel={`第 ${index + 1} 场`}
                          onView={viewEnrollees}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <FormLabel>重复频率</FormLabel>
                <div className="flex gap-2">
                  {(["weekly", "monthly"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => props.onRecurrenceChange(r)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm",
                        props.recurrence === r
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {r === "weekly" ? "每周" : "每月"}
                    </button>
                  ))}
                </div>
              </div>

              {props.recurrence === "weekly" ? (
                <div className="space-y-1.5">
                  <FormLabel>每周几</FormLabel>
                  <div className="grid grid-cols-7 gap-1">
                    {WEEKDAY_OPTIONS.map((w) => (
                      <button
                        key={w.value}
                        type="button"
                        onClick={() => props.onWeeklyDayChange(w.value)}
                        className={cn(
                          "rounded-lg py-2 text-center text-sm font-medium",
                          props.weeklyDay != null &&
                            props.weeklyDay === w.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <MobileMonthDayField
                  label="每月几号"
                  value={props.monthDay}
                  onChange={props.onMonthDayChange}
                  required
                />
              )}

              <MobileTimeRangeField
                label="活动时段"
                startTime={props.recurringTime}
                endTime={props.recurringEndTime}
                onChange={(start, end) => props.onRecurringTimeChange(start, end)}
                required
              />

              <p className="text-sm text-muted-foreground">
                {props.recurrence === "weekly"
                  ? props.weeklyDay == null
                    ? "请选择每周几与活动时段"
                    : `将按每周${WEEKDAY_OPTIONS.find((w) => w.value === props.weeklyDay)?.label} ${props.recurringTime || "--:--"} – ${props.recurringEndTime || "--:--"} 重复举办`
                  : props.monthDay == null
                    ? "请选择每月几号与活动时段"
                    : `将按每月 ${props.monthDay} 号 ${props.recurringTime || "--:--"} – ${props.recurringEndTime || "--:--"} 重复举办`}
              </p>
            </>
          )}
        </div>
      )}

      {isView ? (
        <ViewInlineRow
          label="人数上限"
          value={props.capacity || undefined}
        />
      ) : (
        <label className="block space-y-1">
          <FormLabel>人数上限</FormLabel>
          <input
            type="number"
            value={props.capacity}
            onChange={(e) => props.onCapacityChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          />
        </label>
      )}
    </div>
  );
};

export default ActivityFormFields;

import { Plus, Trash2 } from "lucide-react";
import ActivityCover from "@/components/interest/ActivityCover";
import ActivityCoverUpload from "@/components/interest/ActivityCoverUpload";
import {
  ACTIVITY_KIND_LABEL,
  ACTIVITY_KIND_OPTIONS,
} from "@/components/interest/activityFormConstants";
import {
  MobileDateTimeRangeField,
  MobileMonthDayField,
  MobileTimeRangeField,
  formatMobileDate,
  formatMobileTime,
  type MobileDateTimeRangeValue,
} from "@/components/ui/mobile-date-field";
import { resolveActivityCover } from "@/data/interestImages";
import type {
  ActivityKind,
  ActivityOccurrence,
  GroupActivity,
  SeriesEnrollmentMode,
} from "@/data/interestTypes";
import { WEEKDAY_OPTIONS } from "@/lib/interestOccurrences";
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
};

type ViewProps = BaseProps & {
  mode: "view";
  activity: GroupActivity;
  occurrences?: ActivityOccurrence[];
};

type Props = EditProps | ViewProps;

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
    <span className="text-xs font-medium text-foreground">{label}</span>
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

const ActivityFormFields = (props: Props) => {
  const { kind, mode } = props;
  const isView = mode === "view";
  const activeKind = ACTIVITY_KIND_OPTIONS.find((k) => k.key === kind);

  const coverDisplay =
    mode === "view"
      ? resolveActivityCover(props.activity)
      : props.coverUrl;

  return (
    <div className="space-y-4">
      <section className="space-y-1.5">
        <span className="text-xs font-medium text-foreground">活动类型</span>
        {isView ? (
          <p className="rounded-xl border border-border/60 bg-card px-3 py-2 text-sm">
            {ACTIVITY_KIND_LABEL[kind]}
            {activeKind && (
              <span className="ml-2 text-muted-foreground">
                · {activeKind.hint}
              </span>
            )}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1.5">
              {ACTIVITY_KIND_OPTIONS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  disabled={mode === "edit"}
                  onClick={() => props.onKindChange(k.key)}
                  className={cn(
                    "rounded-lg border py-2 text-center text-xs font-medium",
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
            {activeKind && (
              <p className="text-[11px] text-muted-foreground">
                {mode === "edit"
                  ? "活动类型发布后不可修改"
                  : activeKind.hint}
              </p>
            )}
          </>
        )}
      </section>

      {isView ? (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-foreground">活动封面</span>
          <ActivityCover coverUrl={coverDisplay} className="h-36 w-full rounded-2xl" />
        </div>
      ) : (
        <ActivityCoverUpload
          value={props.coverUrl}
          onChange={props.onCoverChange}
        />
      )}

      {isView ? (
        <ReadOnlyField label="标题" value={props.title} />
      ) : (
        <label className="block space-y-1">
          <span className="text-xs font-medium">标题</span>
          <input
            value={props.title}
            onChange={(e) => props.onTitleChange(e.target.value)}
            placeholder="填写活动标题"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          />
        </label>
      )}

      {isView ? (
        <ReadOnlyField label="活动介绍" value={props.description} multiline />
      ) : (
        <label className="block space-y-1">
          <span className="text-xs font-medium">活动介绍</span>
          <textarea
            value={props.description}
            onChange={(e) => props.onDescriptionChange(e.target.value)}
            placeholder="介绍一下活动内容"
            rows={4}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          />
        </label>
      )}

      {isView ? (
        <ReadOnlyField label="地点" value={props.location} />
      ) : (
        <label className="block space-y-1">
          <span className="text-xs font-medium">地点</span>
          <input
            value={props.location}
            onChange={(e) => props.onLocationChange(e.target.value)}
            placeholder="填写活动地点"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          />
        </label>
      )}

      {kind === "one_off" &&
        (isView ? (
          <ReadOnlyField
            label="活动时间"
            value={
              props.oneOffSchedule.date
                ? `${formatMobileDate(props.oneOffSchedule.date)} ${formatMobileTime(props.oneOffSchedule.startTime)} – ${formatMobileTime(props.oneOffSchedule.endTime)}`
                : undefined
            }
          />
        ) : (
          <MobileDateTimeRangeField
            label="活动时间"
            value={props.oneOffSchedule}
            onChange={props.onOneOffScheduleChange}
          />
        ))}

      {kind === "series" && (
        <section className="space-y-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3">
          <div className="space-y-2">
            <span className="text-xs font-medium text-foreground">报名方式</span>
            {isView ? (
              <p className="rounded-lg border border-border/60 bg-card px-2.5 py-2 text-xs text-foreground">
                {SERIES_ENROLLMENT_MODE_LABEL[props.seriesEnrollmentMode]}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {SERIES_ENROLLMENT_MODE_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <label
                      className={cn(
                        "flex cursor-pointer gap-2 rounded-lg border px-2.5 py-2 transition-colors",
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
                        className="mt-0.5 accent-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-foreground">
                          {opt.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                          {opt.description}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <span className="text-xs font-medium text-foreground">系列场次</span>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              {isView
                ? "人数上限对各场生效。"
                : "为每场填写开始与结束时间。人数上限对各场生效。"}
            </p>
          </div>
          <ul className="space-y-1.5">
            {props.seriesSessions.map((session, index) => (
              <li
                key={session.key}
                className="rounded-lg border border-border/60 bg-card px-2 py-1.5"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    第 {index + 1} 场
                    {isView &&
                      props.mode === "view" &&
                      props.occurrences?.[index] && (
                        <span className="ml-2 text-foreground">
                          · {props.occurrences[index].enrollCount}
                          {props.occurrences[index].capacity != null
                            ? `/${props.occurrences[index].capacity}`
                            : ""}{" "}
                          人报名
                        </span>
                      )}
                  </span>
                  {!isView && props.seriesSessions.length > 1 && (
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
                {isView ? (
                  <p className="text-xs text-foreground">
                    {session.date
                      ? `${formatMobileDate(session.date)} ${formatMobileTime(session.startTime)} – ${formatMobileTime(session.endTime)}`
                      : "—"}
                  </p>
                ) : (
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
                )}
              </li>
            ))}
          </ul>
          {!isView && props.seriesSessions.length < 8 && (
            <button
              type="button"
              onClick={props.onAddSeriesSession}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-primary/30 py-2 text-xs font-medium text-primary active:bg-primary/5"
            >
              <Plus className="h-3.5 w-3.5" />
              添加场次
            </button>
          )}
        </section>
      )}

      {kind === "recurring" && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-3">
          {isView ? (
            <>
              <ReadOnlyField
                label="重复频率"
                value={props.recurrence === "weekly" ? "每周" : "每月"}
              />
              <ReadOnlyField
                label={props.recurrence === "weekly" ? "每周几" : "每月几号"}
                value={
                  props.recurrence === "weekly"
                    ? props.weeklyDay != null
                      ? `周${WEEKDAY_OPTIONS.find((w) => w.value === props.weeklyDay)?.label ?? ""}`
                      : "—"
                    : props.monthDay != null
                      ? `每月 ${props.monthDay} 号`
                      : "—"
                }
              />
              <ReadOnlyField
                label="活动时段"
                value={`${formatMobileTime(props.recurringTime)} – ${formatMobileTime(props.recurringEndTime)}`}
              />
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <span className="text-xs font-medium">重复频率</span>
                <div className="flex gap-2">
                  {(["weekly", "monthly"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => props.onRecurrenceChange(r)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs",
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
                  <span className="text-xs font-medium">每周几</span>
                  <div className="grid grid-cols-7 gap-1">
                    {WEEKDAY_OPTIONS.map((w) => (
                      <button
                        key={w.value}
                        type="button"
                        onClick={() => props.onWeeklyDayChange(w.value)}
                        className={cn(
                          "rounded-lg py-2 text-center text-xs font-medium",
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
                />
              )}

              <MobileTimeRangeField
                label="活动时段"
                startTime={props.recurringTime}
                endTime={props.recurringEndTime}
                onChange={(start, end) => props.onRecurringTimeChange(start, end)}
              />

              <p className="text-[11px] text-muted-foreground">
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
        <ReadOnlyField
          label={
            kind === "series" ? "人数上限（各场次共用）" : "人数上限"
          }
          value={props.capacity || undefined}
        />
      ) : (
        <label className="block space-y-1">
          <span className="text-xs font-medium">
            人数上限
            {kind === "series" && (
              <span className="ml-1 font-normal text-muted-foreground">
                （各场次共用）
              </span>
            )}
          </span>
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

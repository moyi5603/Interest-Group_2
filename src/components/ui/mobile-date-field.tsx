import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** 15 分钟一档 */
export const TIME_STEP_SECONDS = 900;

const ITEM_H = 44;
const WHEEL_PAD = 2;
const WHEEL_H = ITEM_H * 5;
const MINUTE_OPTIONS = [0, 15, 30, 45];

export const snapMinute = (m: number) => {
  const clamped = Math.max(0, Math.min(59, m));
  return MINUTE_OPTIONS.reduce((prev, curr) =>
    Math.abs(curr - clamped) < Math.abs(prev - clamped) ? curr : prev,
  );
};

/** ISO YYYY-MM-DD → 2025年5月19日 */
export const formatMobileDate = (iso: string | undefined) => {
  if (!iso) return "请选择日期";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "请选择日期";
  return `${y}年${m}月${d}日`;
};

/** 列表行展示：同年省略年份 */
export const formatShortDate = (iso: string | undefined) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  const year = new Date().getFullYear();
  return y === year ? `${m}月${d}日` : `${y}年${m}月${d}日`;
};

/** HH:mm → 19:00 */
export const formatMobileTime = (time: string | undefined) => {
  if (!time) return "--:--";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "--:--";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const combineDateAndTime = (date: string, time: string) =>
  date && time ? `${date}T${time}` : "";

/** 与活动表单等页面字段标题一致 */
export const MOBILE_FIELD_LABEL_CLASS = "text-sm font-medium text-foreground";

const MobileFieldLabel = ({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) => (
  <span className={MOBILE_FIELD_LABEL_CLASS}>
    {required && (
      <span className="mr-0.5 text-destructive" aria-hidden>
        *
      </span>
    )}
    {label}
  </span>
);

export const splitDatetimeLocal = (value: string) => {
  if (!value) return { date: "", time: "" };
  const [date, time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
};

const parseTime = (time?: string) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return {
    h: Math.max(0, Math.min(23, h)),
    m: snapMinute(Math.max(0, Math.min(59, m))),
  };
};

const toTime = (h: number, m: number) =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

/** 滚轮初始位置，未确认前不写入表单 */
const WHEEL_PLACEHOLDER = { h: 9, m: 0 };

const timeToMinutes = (h: number, m: number) => h * 60 + m;

const isEndAfterStart = (
  startH: number,
  startM: number,
  endH: number,
  endM: number,
) => timeToMinutes(endH, endM) > timeToMinutes(startH, startM);

const getEndHourOptions = (startH: number, startM: number) =>
  Array.from({ length: 24 }, (_, i) => i).filter((h) => {
    if (h > startH) return true;
    if (h < startH) return false;
    return MINUTE_OPTIONS.some((m) => m > startM);
  });

const getEndMinuteOptions = (
  startH: number,
  startM: number,
  endH: number,
) => {
  if (endH > startH) return MINUTE_OPTIONS;
  if (endH < startH) return [];
  return MINUTE_OPTIONS.filter((m) => m > startM);
};

const clampEndTime = (
  startH: number,
  startM: number,
  endH: number,
  endM: number,
) => {
  const hours = getEndHourOptions(startH, startM);
  let h = hours.includes(endH) ? endH : (hours[0] ?? startH);
  const minutes = getEndMinuteOptions(startH, startM, h);
  let m = minutes.includes(endM)
    ? endM
    : (minutes[0] ?? snapMinute(startM + 15));
  if (!isEndAfterStart(startH, startM, h, m)) {
    h = hours[0] ?? startH;
    m = getEndMinuteOptions(startH, startM, h)[0] ?? MINUTE_OPTIONS[0];
  }
  return { h, m };
};

const parseIso = (iso?: string) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
};

const toIso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

const clampYmd = (
  y: number,
  m: number,
  d: number,
  min?: string,
  max?: string,
) => {
  const minP = parseIso(min);
  const maxP = parseIso(max);
  let cy = y;
  let cm = m;
  let cd = Math.min(d, daysInMonth(y, m));

  const iso = toIso(cy, cm, cd);
  if (minP && iso < toIso(minP.y, minP.m, minP.d)) {
    cy = minP.y;
    cm = minP.m;
    cd = minP.d;
  }
  if (maxP && iso > toIso(maxP.y, maxP.m, maxP.d)) {
    cy = maxP.y;
    cm = maxP.m;
    cd = maxP.d;
  }
  return { y: cy, m: cm, d: cd };
};

type WheelColumnProps = {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  format: (n: number) => string;
  scrollKey: string;
  suffix?: string;
};

const WheelColumn = ({
  items,
  value,
  onChange,
  format,
  scrollKey,
  suffix,
}: WheelColumnProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>();

  const scrollToValue = useCallback(
    (v: number, behavior: ScrollBehavior = "auto") => {
      const el = ref.current;
      if (!el) return;
      const idx = items.indexOf(v);
      if (idx < 0) return;
      el.scrollTo({ top: idx * ITEM_H, behavior });
    },
    [items],
  );

  useEffect(() => {
    scrollToValue(value);
  }, [scrollKey, value, scrollToValue]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const next = items[clamped];
      if (next !== undefined && next !== value) onChange(next);
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    }, 80);
  };

  return (
    <div
      className="relative flex-1 overflow-hidden touch-pan-y"
      style={{ height: WHEEL_H }}
    >
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scroll-smooth scrollbar-hide"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ height: ITEM_H * WHEEL_PAD }} aria-hidden />
        {items.map((n) => (
          <div
            key={n}
            className={cn(
              "flex items-center justify-center font-medium tabular-nums transition-colors",
              n === value
                ? "text-lg text-foreground"
                : "text-base text-muted-foreground/60",
            )}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
          >
            {format(n)}
            {suffix}
          </div>
        ))}
        <div style={{ height: ITEM_H * WHEEL_PAD }} aria-hidden />
      </div>
    </div>
  );
};

const WheelHighlight = () => (
  <div
    className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-11 -translate-y-1/2 rounded-xl border border-primary/10 bg-primary/5"
    aria-hidden
  />
);

/** 与表单输入框一致的白色卡片容器 */
const PICKER_LIST_CLASS =
  "divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card";

type CompactPickerRowProps = {
  label: string;
  value: string;
  placeholder: string;
  filled: boolean;
  onClick: () => void;
};

/** 左标签 + 右值 + 箭头，与页面表单白底风格一致 */
const CompactPickerRow = ({
  label,
  value,
  placeholder,
  filled,
  onClick,
}: CompactPickerRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-2 bg-card px-3 py-2.5 text-left active:bg-secondary/40"
  >
    <span className="w-14 shrink-0 text-xs text-muted-foreground">{label}</span>
    <span
      className={cn(
        "min-w-0 flex-1 truncate text-sm tabular-nums",
        filled ? "font-medium text-foreground" : "text-muted-foreground",
      )}
    >
      {filled ? value : placeholder}
    </span>
    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
  </button>
);

const ConfirmButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "w-full rounded-full py-3 text-sm font-medium",
      disabled
        ? "cursor-not-allowed bg-primary/40 text-primary-foreground/70"
        : "bg-primary text-primary-foreground",
    )}
  >
    确定
  </button>
);

type DateWheelPanelProps = {
  y: number;
  m: number;
  d: number;
  setY: (v: number) => void;
  setM: (v: number) => void;
  setD: (v: number) => void;
  years: number[];
  months: number[];
  days: number[];
  scrollKey: string;
};

const DateWheelPanel = ({
  y,
  m,
  d,
  setY,
  setM,
  setD,
  years,
  months,
  days,
  scrollKey,
}: DateWheelPanelProps) => (
  <div className="px-2 pb-2">
    <div className="mb-2 grid grid-cols-3 gap-1 text-center text-[11px] text-muted-foreground">
      <span>年</span>
      <span>月</span>
      <span>日</span>
    </div>
    <div className="relative flex touch-pan-y">
      <WheelHighlight />
      <WheelColumn
        items={years}
        value={y}
        onChange={setY}
        format={(n) => String(n)}
        suffix="年"
        scrollKey={`y-${scrollKey}`}
      />
      <WheelColumn
        items={months}
        value={m}
        onChange={setM}
        format={(n) => String(n)}
        suffix="月"
        scrollKey={`m-${scrollKey}`}
      />
      <WheelColumn
        items={days}
        value={d}
        onChange={setD}
        format={(n) => String(n)}
        suffix="日"
        scrollKey={`d-${scrollKey}-${days.length}`}
      />
    </div>
  </div>
);

type TimeWheelPanelProps = {
  h: number;
  min: number;
  setH: (v: number) => void;
  setMin: (v: number) => void;
  scrollKey: string;
  /** 结束时间：隐藏早于开始时间的选项 */
  notBefore?: { h: number; m: number };
};

const TimeWheelPanel = ({
  h,
  min,
  setH,
  setMin,
  scrollKey,
  notBefore,
}: TimeWheelPanelProps) => {
  const allHours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i),
    [],
  );

  const hours = useMemo(
    () =>
      notBefore
        ? getEndHourOptions(notBefore.h, notBefore.m)
        : allHours,
    [allHours, notBefore],
  );

  const minutes = useMemo(
    () =>
      notBefore
        ? getEndMinuteOptions(notBefore.h, notBefore.m, h)
        : MINUTE_OPTIONS,
    [notBefore, h],
  );

  useEffect(() => {
    if (!notBefore) return;
    if (!hours.includes(h)) {
      const nextH = hours[0];
      if (nextH !== undefined) setH(nextH);
    }
  }, [hours, h, notBefore, setH]);

  useEffect(() => {
    if (!notBefore) return;
    if (!minutes.includes(min)) {
      const nextM = minutes[0];
      if (nextM !== undefined) setMin(nextM);
    }
  }, [minutes, min, notBefore, setMin]);

  const handleSetH = (nextH: number) => {
    setH(nextH);
    if (notBefore) {
      const validM = getEndMinuteOptions(notBefore.h, notBefore.m, nextH);
      if (!validM.includes(min)) setMin(validM[0] ?? min);
    }
  };

  return (
    <div className="px-4 pb-2">
      <div className="relative flex items-center touch-pan-y">
        <WheelHighlight />
        <WheelColumn
          items={hours.length > 0 ? hours : allHours}
          value={hours.includes(h) ? h : (hours[0] ?? h)}
          onChange={handleSetH}
          format={(n) => String(n).padStart(2, "0")}
          scrollKey={`h-${scrollKey}`}
          suffix="时"
        />
        <span className="relative z-10 shrink-0 px-1 text-xl font-light text-muted-foreground">
          :
        </span>
        <WheelColumn
          items={minutes.length > 0 ? minutes : MINUTE_OPTIONS}
          value={minutes.includes(min) ? min : (minutes[0] ?? min)}
          onChange={setMin}
          format={(n) => String(n).padStart(2, "0")}
          scrollKey={`m-${scrollKey}`}
          suffix="分"
        />
      </div>
    </div>
  );
};

type DatePickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string;
  min?: string;
  max?: string;
  onConfirm: (iso: string) => void;
};

const DatePickerSheet = ({
  open,
  onOpenChange,
  title,
  value,
  min,
  max,
  onConfirm,
}: DatePickerSheetProps) => {
  const today = new Date();
  const minP = parseIso(min);
  const maxP = parseIso(max);
  const startYear = minP?.y ?? today.getFullYear();
  const endYear = maxP?.y ?? today.getFullYear() + 2;

  const initial = useMemo(() => {
    const now = new Date();
    const p = parseIso(value) ?? {
      y: now.getFullYear(),
      m: now.getMonth() + 1,
      d: now.getDate(),
    };
    return clampYmd(p.y, p.m, p.d, min, max);
  }, [value, min, max]);

  const [y, setY] = useState(initial.y);
  const [m, setM] = useState(initial.m);
  const [d, setD] = useState(initial.d);

  useEffect(() => {
    if (!open) return;
    setY(initial.y);
    setM(initial.m);
    setD(initial.d);
  }, [open, initial.y, initial.m, initial.d]);

  const years = useMemo(
    () =>
      Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i),
    [startYear, endYear],
  );

  const months = useMemo(() => {
    let from = 1;
    let to = 12;
    if (minP && y === minP.y) from = minP.m;
    if (maxP && y === maxP.y) to = maxP.m;
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }, [y, minP, maxP]);

  const days = useMemo(() => {
    const maxD = daysInMonth(y, m);
    let from = 1;
    let to = maxD;
    if (minP && y === minP.y && m === minP.m) from = minP.d;
    if (maxP && y === maxP.y && m === maxP.m) to = maxP.d;
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }, [y, m, minP, maxP]);

  useEffect(() => {
    if (!months.includes(m)) setM(months[0] ?? 1);
  }, [months, m]);

  useEffect(() => {
    if (!days.includes(d)) setD(days[days.length - 1] ?? 1);
  }, [days, d]);

  const scrollKey = `${open}-${y}-${m}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-2 pb-8 pt-2">
        <SheetHeader className="px-2 pb-1 text-left">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>
        <p className="mb-3 text-center text-sm font-medium tabular-nums text-foreground">
          {formatMobileDate(toIso(y, m, d))}
        </p>
        <DateWheelPanel
          y={y}
          m={m}
          d={d}
          setY={setY}
          setM={setM}
          setD={setD}
          years={years}
          months={months}
          days={days}
          scrollKey={scrollKey}
        />
        <div className="px-2 pt-2">
          <ConfirmButton
            onClick={() => {
              onConfirm(toIso(y, m, d));
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

type MonthDayPickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: number;
  onConfirm: (day: number) => void;
};

const MonthDayPickerSheet = ({
  open,
  onOpenChange,
  title,
  value,
  onConfirm,
}: MonthDayPickerSheetProps) => {
  const initial = value >= 1 && value <= 31 ? value : 1;
  const [day, setDay] = useState(initial);

  useEffect(() => {
    if (!open) return;
    setDay(value >= 1 && value <= 31 ? value : 1);
  }, [open, value]);

  const scrollKey = `${open}-${day}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-2 pb-8 pt-2">
        <SheetHeader className="px-2 pb-1 text-left">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>
        <p className="mb-3 text-center text-sm font-medium tabular-nums text-foreground">
          每月 {day} 号
        </p>
        <div className="px-8 pb-2">
          <div className="relative flex touch-pan-y">
            <WheelHighlight />
            <WheelColumn
              items={MONTH_DAYS}
              value={day}
              onChange={setDay}
              format={(n) => String(n)}
              suffix="号"
              scrollKey={scrollKey}
            />
          </div>
        </div>
        <div className="px-2 pt-2">
          <ConfirmButton
            onClick={() => {
              onConfirm(day);
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

type TimePickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string;
  onConfirm: (time: string) => void;
  /** 结束时间须晚于该开始时间 */
  notBefore?: { h: number; m: number };
};

const TimePickerSheet = ({
  open,
  onOpenChange,
  title,
  value,
  onConfirm,
  notBefore,
}: TimePickerSheetProps) => {
  const parsed = parseTime(value);
  const [h, setH] = useState(parsed?.h ?? WHEEL_PLACEHOLDER.h);
  const [min, setMin] = useState(parsed?.m ?? WHEEL_PLACEHOLDER.m);

  useEffect(() => {
    if (!open) return;
    const p = parseTime(value);
    let next = p ?? WHEEL_PLACEHOLDER;
    if (notBefore) {
      next = clampEndTime(notBefore.h, notBefore.m, next.h, next.m);
    }
    setH(next.h);
    setMin(next.m);
  }, [open, value, notBefore?.h, notBefore?.m]);

  const scrollKey = `${open}-${h}-${min}-${notBefore?.h}-${notBefore?.m}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-2 pb-8 pt-2">
        <SheetHeader className="px-2 pb-1 text-left">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>
        <p className="mb-3 text-center text-2xl font-semibold tabular-nums">
          {formatMobileTime(toTime(h, min))}
        </p>
        <TimeWheelPanel
          h={h}
          min={min}
          setH={setH}
          setMin={setMin}
          scrollKey={scrollKey}
          notBefore={notBefore}
        />
        <div className="px-2 pt-2">
          <ConfirmButton
            onClick={() => {
              onConfirm(toTime(h, min));
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

type TimeRangePickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  startTime: string;
  endTime: string;
  onConfirm: (startTime: string, endTime: string) => void;
};

const TimeRangePickerSheet = ({
  open,
  onOpenChange,
  title,
  startTime,
  endTime,
  onConfirm,
}: TimeRangePickerSheetProps) => {
  const [active, setActive] = useState<"start" | "end">("start");
  const [startH, setStartH] = useState(WHEEL_PLACEHOLDER.h);
  const [startM, setStartM] = useState(WHEEL_PLACEHOLDER.m);
  const [endH, setEndH] = useState(WHEEL_PLACEHOLDER.h);
  const [endM, setEndM] = useState(WHEEL_PLACEHOLDER.m);
  /** 用户已查看/确认该侧时间（进入 Tab 即视为确认滚轮当前值） */
  const [startReady, setStartReady] = useState(false);
  const [endReady, setEndReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActive("start");
    const s = parseTime(startTime);
    const e = parseTime(endTime);
    const startPos = s ?? WHEEL_PLACEHOLDER;
    setStartH(startPos.h);
    setStartM(startPos.m);
    const endPos = e
      ? clampEndTime(startPos.h, startPos.m, e.h, e.m)
      : clampEndTime(
          startPos.h,
          startPos.m,
          WHEEL_PLACEHOLDER.h,
          WHEEL_PLACEHOLDER.m,
        );
    setEndH(endPos.h);
    setEndM(endPos.m);
    setStartReady(!!s || !startTime);
    setEndReady(!!e);
  }, [open, startTime, endTime]);

  useEffect(() => {
    if (!startReady) return;
    const clamped = clampEndTime(startH, startM, endH, endM);
    if (clamped.h !== endH || clamped.m !== endM) {
      setEndH(clamped.h);
      setEndM(clamped.m);
    }
    // 仅在开始时间变化时校正结束时间
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startH, startM, startReady]);

  const selectTab = (key: "start" | "end") => {
    setActive(key);
    if (key === "start") {
      setStartReady(true);
      return;
    }
    setEndReady(true);
    const clamped = clampEndTime(startH, startM, endH, endM);
    setEndH(clamped.h);
    setEndM(clamped.m);
  };

  const isStart = active === "start";
  const h = isStart ? startH : endH;
  const minVal = isStart ? startM : endM;
  const scrollKey = `${open}-${active}-${h}-${minVal}-${startReady}-${endReady}`;

  const handleSetH = (nextH: number) => {
    if (isStart) setStartH(nextH);
    else setEndH(nextH);
  };
  const handleSetMin = (nextM: number) => {
    if (isStart) setStartM(nextM);
    else setEndM(nextM);
  };

  const startDisplay = startReady
    ? formatMobileTime(toTime(startH, startM))
    : "--:--";
  const endDisplay = endReady
    ? formatMobileTime(toTime(endH, endM))
    : "--:--";
  const activeDisplay = isStart ? startDisplay : endDisplay;
  const canConfirm =
    startReady &&
    endReady &&
    isEndAfterStart(startH, startM, endH, endM);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-2 pb-8 pt-2">
        <SheetHeader className="px-2 pb-1 text-left">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>

        <div className="mx-2 mb-3 flex rounded-xl bg-secondary/70 p-1">
          {(
            [
              { key: "start" as const, label: `开始 ${startDisplay}` },
              { key: "end" as const, label: `结束 ${endDisplay}` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => selectTab(key)}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-medium",
                active === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <p
          className={cn(
            "mb-3 text-center text-2xl font-semibold tabular-nums",
            activeDisplay === "--:--" && "text-muted-foreground",
          )}
        >
          {activeDisplay}
        </p>

        <TimeWheelPanel
          h={h}
          min={minVal}
          setH={handleSetH}
          setMin={handleSetMin}
          scrollKey={scrollKey}
          notBefore={
            !isStart && startReady ? { h: startH, m: startM } : undefined
          }
        />

        <div className="px-2 pt-2">
          <ConfirmButton
            disabled={!canConfirm}
            onClick={() => {
              onConfirm(toTime(startH, startM), toTime(endH, endM));
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

type MobileDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
};

export const MobileDateField = ({
  label,
  value,
  onChange,
  min,
  max,
  className,
}: MobileDateFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <div className={PICKER_LIST_CLASS}>
        <CompactPickerRow
          label={label}
          value={formatMobileDate(value)}
          placeholder="请选择日期"
          filled={!!value}
          onClick={() => setOpen(true)}
        />
      </div>
      <DatePickerSheet
        open={open}
        title={label}
        value={value}
        min={min}
        max={max}
        onOpenChange={setOpen}
        onConfirm={onChange}
      />
    </div>
  );
};

type MobileMonthDayFieldProps = {
  label: string;
  value: number | null;
  onChange: (day: number) => void;
  className?: string;
  required?: boolean;
};

export const MobileMonthDayField = ({
  label,
  value,
  onChange,
  className,
  required,
}: MobileMonthDayFieldProps) => {
  const [open, setOpen] = useState(false);
  const filled = value != null && value >= 1 && value <= 31;
  const display = filled ? `每月 ${value} 号` : "";

  return (
    <div className={cn("space-y-1.5", className)}>
      <MobileFieldLabel label={label} required={required} />
      <div className={PICKER_LIST_CLASS}>
        <CompactPickerRow
          label="日期"
          value={display}
          placeholder="选择每月几号"
          filled={filled}
          onClick={() => setOpen(true)}
        />
      </div>
      <MonthDayPickerSheet
        open={open}
        title={label}
        value={value ?? 1}
        onOpenChange={setOpen}
        onConfirm={onChange}
      />
    </div>
  );
};

type MobileTimeRangeFieldProps = {
  label: string;
  startTime: string;
  endTime: string;
  onChange: (startTime: string, endTime: string) => void;
  className?: string;
  required?: boolean;
};

export const MobileTimeRangeField = ({
  label,
  startTime,
  endTime,
  onChange,
  className,
  required,
}: MobileTimeRangeFieldProps) => {
  const [open, setOpen] = useState(false);
  const filled = !!startTime && !!endTime;
  const display = filled
    ? `${formatMobileTime(startTime)} – ${formatMobileTime(endTime)}`
    : "";

  return (
    <div className={cn("space-y-1.5", className)}>
      <MobileFieldLabel label={label} required={required} />
      <div className={PICKER_LIST_CLASS}>
        <CompactPickerRow
          label="时段"
          value={display}
          placeholder="选择开始与结束"
          filled={filled}
          onClick={() => setOpen(true)}
        />
      </div>
      <TimeRangePickerSheet
        open={open}
        title={label}
        startTime={startTime}
        endTime={endTime}
        onOpenChange={setOpen}
        onConfirm={onChange}
      />
    </div>
  );
};

export type MobileDateTimeRangeValue = {
  date: string;
  startTime: string;
  endTime: string;
};

type MobileDateTimeRangeFieldProps = {
  label: string;
  value: MobileDateTimeRangeValue;
  onChange: (value: MobileDateTimeRangeValue) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
  compact?: boolean;
  required?: boolean;
};

export const MobileDateTimeRangeField = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  className,
  compact,
  required,
}: MobileDateTimeRangeFieldProps) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);

  const patch = (partial: Partial<MobileDateTimeRangeValue>) =>
    onChange({ ...value, ...partial });

  const timeRangeFilled = !!value.startTime && !!value.endTime;
  const timeRangeDisplay = timeRangeFilled
    ? `${formatMobileTime(value.startTime)} – ${formatMobileTime(value.endTime)}`
    : "";
  const dateDisplay = compact
    ? formatShortDate(value.date)
    : formatMobileDate(value.date);

  return (
    <div className={cn(compact ? undefined : "space-y-1.5", className)}>
      {!compact && (
        <MobileFieldLabel label={label} required={required} />
      )}
      <div className={PICKER_LIST_CLASS}>
        <CompactPickerRow
          label="日期"
          value={dateDisplay}
          placeholder="选择日期"
          filled={!!value.date}
          onClick={() => setDateOpen(true)}
        />
        <CompactPickerRow
          label="时段"
          value={timeRangeDisplay}
          placeholder="选择开始与结束"
          filled={timeRangeFilled}
          onClick={() => setRangeOpen(true)}
        />
      </div>
      <DatePickerSheet
        open={dateOpen}
        title={`${label} · 日期`}
        value={value.date}
        min={minDate}
        max={maxDate}
        onOpenChange={setDateOpen}
        onConfirm={(date) => patch({ date })}
      />
      <TimeRangePickerSheet
        open={rangeOpen}
        title={`${label} · 时段`}
        startTime={value.startTime}
        endTime={value.endTime}
        onOpenChange={setRangeOpen}
        onConfirm={(startTime, endTime) => patch({ startTime, endTime })}
      />
    </div>
  );
};

import { useMemo, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ActivityEnrolleeInfo } from "@/data/interestGroups";
import { groupByNameInitial } from "@/lib/chineseNameSort";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionLabel: string;
  enrolleeCount: number;
  enrollees: ActivityEnrolleeInfo[];
};

const PersonAvatar = ({ person }: { person: ActivityEnrolleeInfo }) => (
  <div
    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
    style={{
      background: `linear-gradient(135deg, hsl(${person.avatarColor}), hsl(${person.avatarColor} / 0.7))`,
    }}
  >
    {person.avatarUrl ? (
      <img
        src={person.avatarUrl}
        alt=""
        className="h-full w-full rounded-full object-cover"
      />
    ) : (
      person.name[0]
    )}
  </div>
);

const EnrolleeRow = ({ person }: { person: ActivityEnrolleeInfo }) => (
  <li className="flex items-center gap-3 px-4 py-3">
    <PersonAvatar person={person} />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-medium text-foreground">
          {person.name}
        </p>
        {person.badge && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {person.badge}
          </span>
        )}
      </div>
      <p className="truncate text-xs text-muted-foreground">
        {person.position} · {person.deptName}
      </p>
    </div>
  </li>
);

const ActivityEnrolleesSheet = ({
  open,
  onOpenChange,
  sessionLabel,
  enrolleeCount,
  enrollees,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sections = useMemo(() => groupByNameInitial(enrollees), [enrollees]);
  const indexLetters = useMemo(
    () => sections.map((section) => section.letter),
    [sections],
  );

  const scrollToLetter = (letter: string) => {
    const container = scrollRef.current;
    const target = container?.querySelector<HTMLElement>(
      `[data-enrollee-section="${letter}"]`,
    );
    if (!container || !target) return;
    const top =
      target.offsetTop - container.offsetTop + container.scrollTop - 8;
    container.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[85dvh] max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-t-2xl px-0 pb-0 pt-3 [&>button]:hidden"
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border" />
        <SheetHeader className="shrink-0 space-y-1 px-4 text-left">
          <SheetTitle className="text-base">报名人员</SheetTitle>
          <SheetDescription className="text-sm">
            {sessionLabel} · 共 {enrolleeCount} 人报名
          </SheetDescription>
        </SheetHeader>

        <div className="relative mt-3 min-h-0 flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto overscroll-contain pb-2 pl-0 pr-7 scrollbar-hide"
          >
            {enrollees.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                暂无报名人员
              </p>
            ) : (
              sections.map((section) => (
                <section
                  key={section.letter}
                  data-enrollee-section={section.letter}
                >
                  <div className="sticky top-0 z-10 bg-background/95 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                    {section.letter}
                  </div>
                  <ul className="divide-y divide-border">
                    {section.items.map((person) => (
                      <EnrolleeRow key={person.employeeId} person={person} />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>

          {indexLetters.length > 1 && (
            <nav
              className="absolute inset-y-2 right-1 z-20 flex w-5 flex-col items-center justify-center gap-px"
              aria-label="按拼音首字母跳转"
            >
              {indexLetters.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => scrollToLetter(letter)}
                  className="flex h-[14px] w-full items-center justify-center text-[10px] font-semibold leading-none text-primary/75 active:text-primary"
                >
                  {letter}
                </button>
              ))}
            </nav>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-safe">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full border border-border bg-secondary py-3 text-sm font-medium text-foreground active:scale-[0.99]"
          >
            关闭
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ActivityEnrolleesSheet;

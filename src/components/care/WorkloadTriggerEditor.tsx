import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  workloadTriggerCategories,
  workloadTriggerSupportsNotifySupervisor,
  type WorkloadTriggerState,
  type WorkloadTriggerKey,
} from "@/data/humanityCare";
import { WorkloadTriggerValuePanel } from "@/components/care/WorkloadTriggerValuePanel";

type Props = {
  value: WorkloadTriggerState;
  onChange: (next: WorkloadTriggerState) => void;
  trigger: React.ReactNode;
};

export const WorkloadTriggerEditor = ({ value, onChange, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<WorkloadTriggerKey>(value.key);
  const [valueMap, setValueMap] = useState<Record<WorkloadTriggerKey, number | string>>(
    () => {
      const init = workloadTriggerCategories.reduce(
        (acc, c) => {
          acc[c.key] = c.defaultValue;
          return acc;
        },
        {} as Record<WorkloadTriggerKey, number | string>,
      );
      init[value.key] = value.value;
      return init;
    },
  );
  const [notifyByKey, setNotifyByKey] = useState<
    Partial<Record<WorkloadTriggerKey, boolean>>
  >(() => {
    if (workloadTriggerSupportsNotifySupervisor(value.key)) {
      return { [value.key]: value.notifySupervisor ?? false };
    }
    return {};
  });

  useEffect(() => {
    if (open) {
      setActiveKey(value.key);
      setValueMap((m) => ({ ...m, [value.key]: value.value }));
      if (workloadTriggerSupportsNotifySupervisor(value.key)) {
        setNotifyByKey((m) => ({
          ...m,
          [value.key]: value.notifySupervisor ?? false,
        }));
      }
    }
  }, [open, value]);

  const activeCat = workloadTriggerCategories.find((c) => c.key === activeKey)!;
  const activeValue = valueMap[activeKey];

  const setActiveValue = (v: number | string) => {
    setValueMap((m) => ({ ...m, [activeKey]: v }));
  };

  const showNotifySupervisor =
    workloadTriggerSupportsNotifySupervisor(activeKey);
  const notifySupervisor = notifyByKey[activeKey] ?? false;

  const confirm = () => {
    const next: WorkloadTriggerState = {
      key: activeKey,
      value: valueMap[activeKey],
    };
    if (workloadTriggerSupportsNotifySupervisor(activeKey)) {
      next.notifySupervisor = notifyByKey[activeKey] ?? false;
    }
    onChange(next);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl p-0">
        <div className="flex max-h-[85vh] flex-col">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-left text-base">
              选择触发条件
            </SheetTitle>
            <p className="text-left text-[11px] text-muted-foreground">
              选择一种类别和数值,满足条件即自动触达
            </p>
          </SheetHeader>

          <div className="mt-3 px-4">
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-secondary/60 p-1 scrollbar-hide">
              {workloadTriggerCategories.map((cat) => {
                const Icon = cat.icon;
                const active = cat.key === activeKey;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveKey(cat.key)}
                    className={`flex flex-1 min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium transition-base ${
                      active
                        ? "bg-card text-primary shadow-soft"
                        : "text-muted-foreground active:scale-95"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.4} />
                    <span className="truncate">{cat.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            <WorkloadTriggerValuePanel
              cat={activeCat}
              value={activeValue}
              onChange={setActiveValue}
              notifySupervisor={
                showNotifySupervisor
                  ? {
                      checked: notifySupervisor,
                      onChange: (checked) =>
                        setNotifyByKey((m) => ({
                          ...m,
                          [activeKey]: checked,
                        })),
                    }
                  : undefined
              }
            />
          </div>

          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={confirm}
              className="w-full rounded-full gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-base active:scale-95"
            >
              确定
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

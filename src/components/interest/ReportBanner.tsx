import type { InterestGroupFull } from "@/data/interestTypes";
import { AlertCircle } from "lucide-react";

type Props = {
  group: InterestGroupFull;
  onReported: () => void;
};

const ReportBanner = ({ group, onReported }: Props) => {
  if (
    group.type !== "spontaneous" ||
    group.reportStatus !== "pending_report" ||
    !group.reportDueAt
  ) {
    return null;
  }

  return (
    <div className="mb-3 flex gap-2 rounded-2xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 dark:border-amber-900/50 dark:bg-amber-950/40">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
          请在 {group.reportDueAt} 前完成工会/HR 报备
        </p>
        <p className="mt-0.5 text-[11px] text-amber-800/80 dark:text-amber-200/70">
          小组已上线，报备仅为流程提醒，不影响当前使用。
        </p>
        <button
          type="button"
          onClick={onReported}
          className="mt-2 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-medium text-white active:scale-95"
        >
          我已报备
        </button>
      </div>
    </div>
  );
};

export default ReportBanner;

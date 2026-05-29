import {
  enrollments,
  getActivityById,
  getOccurrenceById,
} from "@/data/interestGroups";
import {
  hasGrowthEngineSentMark,
  markGrowthEngineSent,
} from "@/data/growthEngineNotifications";
import { getActivityPhase } from "@/lib/interestOccurrences";
import {
  notifyActivityEndedFeedback,
  notifyActivityStartingSoon,
} from "@/lib/growthEngineNotify";

const ONE_HOUR_MS = 60 * 60 * 1000;

const unique = (ids: string[]) => [...new Set(ids)];

const getEnrolledEmployeeIds = (
  activityId: string,
  occurrenceId?: string,
) => {
  const rows = enrollments.filter(
    (e) =>
      e.activityId === activityId &&
      e.status === "enrolled" &&
      (!occurrenceId || e.occurrenceId === occurrenceId),
  );
  return unique(rows.map((e) => e.employeeId));
};

const getOccurrenceWindow = (activityId: string, occurrenceId?: string) => {
  if (occurrenceId) {
    const occ = getOccurrenceById(occurrenceId);
    if (occ) return { start: occ.startAt, end: occ.endAt };
  }
  const activity = getActivityById(activityId);
  if (!activity) return undefined;
  return { start: activity.startAt, end: activity.endAt };
};

export const runGrowthEngineScheduledChecks = () => {
  const now = Date.now();
  const checked = new Set<string>();

  for (const enrollment of enrollments) {
    if (enrollment.status !== "enrolled") continue;
    const activity = getActivityById(enrollment.activityId);
    if (!activity || activity.status !== "published") continue;

    const key = `${enrollment.activityId}:${enrollment.occurrenceId ?? "whole"}`;
    if (checked.has(key)) continue;
    checked.add(key);

    const window = getOccurrenceWindow(
      enrollment.activityId,
      enrollment.occurrenceId,
    );
    if (!window?.start) continue;

    const startMs = new Date(window.start).getTime();
    const endMs = window.end ? new Date(window.end).getTime() : undefined;
    const memberIds = getEnrolledEmployeeIds(
      enrollment.activityId,
      enrollment.occurrenceId,
    );
    if (memberIds.length === 0) continue;

    const soonMark = `soon:${enrollment.activityId}:${enrollment.occurrenceId ?? "whole"}`;
    if (
      now >= startMs - ONE_HOUR_MS &&
      now < startMs &&
      !hasGrowthEngineSentMark(soonMark)
    ) {
      notifyActivityStartingSoon({
        memberIds,
        activityId: activity.id,
        activityTitle: activity.title,
      });
      markGrowthEngineSent(soonMark);
    }

    const endMark = `ended:${enrollment.activityId}:${enrollment.occurrenceId ?? "whole"}`;
    if (endMs && now >= endMs && !hasGrowthEngineSentMark(endMark)) {
      const phase = getActivityPhase(window.start, window.end);
      if (phase === "已结束") {
        notifyActivityEndedFeedback({
          memberIds,
          activityId: activity.id,
          activityTitle: activity.title,
        });
        markGrowthEngineSent(endMark);
      }
    }
  }
};

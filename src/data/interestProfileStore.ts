import {
  getEmployee,
  getEmployeeInterestTagIds,
} from "./colleagueData";
import type { ProfileTag } from "./interestTypes";
import { CURRENT_EMPLOYEE_ID } from "./interestGroups";

const profileKey = (employeeId: string) => `exp-interest-profile-${employeeId}`;

const defaultTags = (employeeId: string): ProfileTag[] => {
  const emp = getEmployee(employeeId);
  if (!emp) return [];
  const tags: ProfileTag[] = [];
  if (emp.interestGroups.some((g) => g.id === "ig5"))
    tags.push({ tagId: "tag-photo", source: "manual" });
  if (emp.skills.some((s) => s.includes("React")))
    tags.push({ tagId: "tag-tech", source: "manual" });
  return tags;
};

const tagsFromIds = (tagIds: string[]): ProfileTag[] =>
  tagIds.map((tagId) => ({ tagId, source: "manual" as const }));

/** 读取员工兴趣标签（localStorage → 员工档案 → 默认） */
export const getProfileTags = (
  employeeId: string = CURRENT_EMPLOYEE_ID,
): ProfileTag[] => {
  try {
    const raw = localStorage.getItem(profileKey(employeeId));
    if (raw) return JSON.parse(raw) as ProfileTag[];
  } catch {
    /* fall through */
  }

  const fromEmployee = getEmployeeInterestTagIds(employeeId);
  if (fromEmployee.length > 0) return tagsFromIds(fromEmployee);

  return defaultTags(employeeId);
};

export const getProfileTagIds = (employeeId?: string) =>
  getProfileTags(employeeId).map((t) => t.tagId);

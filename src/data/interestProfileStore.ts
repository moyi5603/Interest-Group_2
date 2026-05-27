import {
  getEmployee,
  getEmployeeInterestTagIds,
  setEmployeeInterestTagIds,
} from "./colleagueData";
import { ensureCustomTag } from "./interestTags";
import type { ProfileTag } from "./interestTypes";
import { CURRENT_EMPLOYEE_ID } from "./interestGroups";

const profileKey = (employeeId: string) => `exp-interest-profile-${employeeId}`;
const dismissedKey = (employeeId: string) =>
  `exp-interest-dismissed-${employeeId}`;

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

/** 读取员工兴趣标签（localStorage ↔ 员工档案双向一致） */
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

/** 写入员工兴趣标签，并同步至员工管理档案 */
export const setProfileTags = (
  tags: ProfileTag[],
  employeeId: string = CURRENT_EMPLOYEE_ID,
) => {
  localStorage.setItem(profileKey(employeeId), JSON.stringify(tags));
  setEmployeeInterestTagIds(
    employeeId,
    tags.map((t) => t.tagId),
  );
};

export const addManualTag = (
  tagId: string,
  employeeId: string = CURRENT_EMPLOYEE_ID,
) => {
  const tags = getProfileTags(employeeId).filter((t) => t.tagId !== tagId);
  setProfileTags([...tags, { tagId, source: "manual" }], employeeId);
};

export const addCustomProfileTag = (
  name: string,
  employeeId: string = CURRENT_EMPLOYEE_ID,
): boolean => {
  const tag = ensureCustomTag(name);
  if (!tag) return false;
  addManualTag(tag.id, employeeId);
  return true;
};

export const removeTag = (
  tagId: string,
  employeeId: string = CURRENT_EMPLOYEE_ID,
) => {
  setProfileTags(
    getProfileTags(employeeId).filter((t) => t.tagId !== tagId),
    employeeId,
  );
};

export const confirmSuggestedTag = (tagId: string) => addManualTag(tagId);

export const getDismissedTagIds = (
  employeeId: string = CURRENT_EMPLOYEE_ID,
): string[] => {
  try {
    const raw = localStorage.getItem(dismissedKey(employeeId));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

export const dismissSuggestedTag = (
  tagId: string,
  employeeId: string = CURRENT_EMPLOYEE_ID,
) => {
  const dismissed = new Set(getDismissedTagIds(employeeId));
  dismissed.add(tagId);
  localStorage.setItem(
    dismissedKey(employeeId),
    JSON.stringify([...dismissed]),
  );
};

export const getProfileTagIds = (employeeId?: string) =>
  getProfileTags(employeeId).map((t) => t.tagId);

import { getEmployee } from "./colleagueData";
import { ensureCustomTag } from "./interestTags";
import type { ProfileTag } from "./interestTypes";
import { CURRENT_EMPLOYEE_ID } from "./interestGroups";

const PROFILE_KEY = `exp-interest-profile-${CURRENT_EMPLOYEE_ID}`;
const DISMISSED_KEY = `exp-interest-dismissed-${CURRENT_EMPLOYEE_ID}`;

const defaultTags = (): ProfileTag[] => {
  const emp = getEmployee(CURRENT_EMPLOYEE_ID);
  if (!emp) return [];
  const tags: ProfileTag[] = [];
  if (emp.interestGroups.some((g) => g.id === "ig5"))
    tags.push({ tagId: "tag-photo", source: "manual" });
  if (emp.skills.some((s) => s.includes("React")))
    tags.push({ tagId: "tag-tech", source: "manual" });
  return tags;
};

export const getProfileTags = (): ProfileTag[] => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultTags();
    return JSON.parse(raw) as ProfileTag[];
  } catch {
    return defaultTags();
  }
};

export const setProfileTags = (tags: ProfileTag[]) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(tags));
};

export const addManualTag = (tagId: string) => {
  const tags = getProfileTags().filter((t) => t.tagId !== tagId);
  setProfileTags([...tags, { tagId, source: "manual" }]);
};

export const addCustomProfileTag = (name: string): boolean => {
  const tag = ensureCustomTag(name);
  if (!tag) return false;
  addManualTag(tag.id);
  return true;
};

export const removeTag = (tagId: string) => {
  setProfileTags(getProfileTags().filter((t) => t.tagId !== tagId));
};

export const confirmSuggestedTag = (tagId: string) => addManualTag(tagId);

export const getDismissedTagIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

export const dismissSuggestedTag = (tagId: string) => {
  const dismissed = new Set(getDismissedTagIds());
  dismissed.add(tagId);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]));
};

export const getProfileTagIds = () => getProfileTags().map((t) => t.tagId);

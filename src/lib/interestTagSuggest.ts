import { getEmployee } from "@/data/colleagueData";
import {
  getDismissedTagIds,
  getProfileTagIds,
} from "@/data/interestProfileStore";
import { interestTagList } from "@/data/interestTags";
import type { InterestTag } from "@/data/interestTypes";
import { getJoinedGroups, interestGroups } from "@/data/interestGroups";

const skillToTag: Record<string, string> = {
  React: "tag-tech",
  TypeScript: "tag-tech",
  跑步: "tag-running",
  摄影: "tag-photo",
};

export const getSuggestedTags = (employeeId: string): InterestTag[] => {
  const profileIds = new Set(getProfileTagIds());
  const dismissed = new Set(getDismissedTagIds());
  if (profileIds.size >= 2) return [];

  const emp = getEmployee(employeeId);
  if (!emp) return [];

  const candidateIds = new Set<string>();

  getJoinedGroups(employeeId).forEach((g) => {
    g.tagIds.forEach((id) => candidateIds.add(id));
  });
  interestGroups
    .filter((g) => g.name.includes("跑") || g.name.includes("健身"))
    .forEach((g) => g.tagIds.forEach((id) => candidateIds.add(id)));

  emp.skills.forEach((s) => {
    Object.entries(skillToTag).forEach(([key, tagId]) => {
      if (s.includes(key)) candidateIds.add(tagId);
    });
  });

  if (emp.deptId.startsWith("rd")) candidateIds.add("tag-tech");
  candidateIds.add("tag-running");
  candidateIds.add("tag-boardgame");

  return interestTagList.filter(
    (t) =>
      candidateIds.has(t.id) &&
      !profileIds.has(t.id) &&
      !dismissed.has(t.id),
  ).slice(0, 4);
};

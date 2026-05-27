import { getEmployee } from "@/data/colleagueData";
import type { InterestGroupFull } from "@/data/interestTypes";
import { isGroupOwner, isMember } from "@/data/interestGroups";

export const canViewGroup = (
  group: InterestGroupFull,
  viewerId: string,
): boolean => {
  if (group.status === "archived") {
    return isGroupOwner(group.id, viewerId);
  }
  const emp = getEmployee(viewerId);
  if (!emp) return false;

  if (group.visibility === "public") return true;
  if (group.visibility === "dept_only") {
    if (!group.deptIds?.length) return true;
    return group.deptIds.includes(emp.deptId);
  }
  return isMember(group.id, viewerId);
};

export const getVisibleGroups = (
  groups: InterestGroupFull[],
  viewerId: string,
) => groups.filter((g) => canViewGroup(g, viewerId));

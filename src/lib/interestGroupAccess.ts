import { isGroupOwner, isActivityOrganizer } from "@/data/interestGroups";
import { canManageInterestGroups } from "@/lib/appRoleStore";

/** 小组详情页：平台管理员身份下展示与创建者相同的管理能力 */
export const canOrganizeGroup = (_groupId: string, _viewerId: string) =>
  canManageInterestGroups();

/** 编辑、解散等写操作：创建者或平台管理员 */
export const canActAsGroupOrganizer = (groupId: string, actorId: string) =>
  isGroupOwner(groupId, actorId) || canManageInterestGroups();

/** 活动详情页：仅管理员身份下展示组织能力（平台管理员可管理全部活动） */
export const canOrganizeActivity = (activityId: string, viewerId: string) =>
  canManageInterestGroups() &&
  (isActivityOrganizer(activityId, viewerId) || canManageInterestGroups());

/** 编辑、终止等写操作：仅管理员身份下的创建者或平台管理员 */
export const canActAsActivityOrganizer = (
  activityId: string,
  actorId: string,
) =>
  canManageInterestGroups() &&
  (isActivityOrganizer(activityId, actorId) || canManageInterestGroups());

import ActivityCard from "@/components/interest/ActivityCard";
import { getActivityEnrolleePreview } from "@/data/interestGroups";
import type { ActivityOccurrence, GroupActivity, InterestGroupFull } from "@/data/interestTypes";
import { resolveGroupAvatar } from "@/data/interestImages";
import {
  buildFeaturedActivityListItem,
  type RecentActivityItem,
} from "@/lib/interestRecommend";

type Props = {
  item: RecentActivityItem;
  onOpen: () => void;
  /** 小组详情页内不重复展示小组信息 */
  hideGroup?: boolean;
  meta?: string;
  showEnroll?: boolean;
  enrolled?: boolean;
  onEnroll?: () => void;
  /** 员工活动广场：临近截止时展示标签 */
  showEnrollClosingSoon?: boolean;
};

export const toFeaturedActivityItem = (
  activity: GroupActivity,
  group: InterestGroupFull,
  options?: {
    occurrence?: ActivityOccurrence;
    scheduleLabel?: string;
  },
): RecentActivityItem => {
  const built = buildFeaturedActivityListItem(activity, group);
  const occurrence =
    options?.occurrence ?? built?.statusOccurrence ?? built?.nextOccurrence;
  const sortStartAt =
    occurrence?.startAt ?? built?.sortStartAt ?? activity.startAt ?? "";
  const timeLabel =
    options?.scheduleLabel ?? built?.timeLabel ?? "";

  return {
    activity,
    group,
    sortStartAt,
    timeLabel,
    statusOccurrence: occurrence,
    nextOccurrence: occurrence,
  };
};

const FeaturedActivityCard = ({
  item,
  onOpen,
  hideGroup = false,
  meta,
  showEnroll,
  enrolled,
  onEnroll,
  showEnrollClosingSoon,
}: Props) => (
  <ActivityCard
    featured
    activity={item.activity}
    title={item.activity.title}
    groupName={hideGroup ? undefined : item.group.name}
    groupAvatarUrl={hideGroup ? undefined : resolveGroupAvatar(item.group)}
    occurrence={item.statusOccurrence}
    scheduleLabel={item.timeLabel}
    enrolleePreview={getActivityEnrolleePreview(item.activity.id)}
    meta={meta}
    showEnroll={showEnroll}
    enrolled={enrolled}
    onEnroll={onEnroll}
    showEnrollClosingSoon={showEnrollClosingSoon}
    onOpen={onOpen}
  />
);

export default FeaturedActivityCard;

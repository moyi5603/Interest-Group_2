import { getTagsByIds } from "@/data/interestTags";
import type { InterestGroupFull } from "@/data/interestTypes";
import { interestGroups } from "@/data/interestGroups";
import { getVisibleGroups } from "./interestVisibility";
import { recommendGroups } from "./interestRecommend";

export type DiscoverTab = "推荐" | "运动" | "文艺" | "生活" | "科技";

/** 发现页 Tab；其他分类暂隐藏，仅展示推荐 */
export const discoverTabs: DiscoverTab[] = ["推荐"];

export const filterDiscoverGroups = (
  viewerId: string,
  tab: DiscoverTab,
  query: string,
): InterestGroupFull[] => {
  const q = query.trim().toLowerCase();

  /** 按小组名称、标签名称匹配 */
  const matchQuery = (g: InterestGroupFull) => {
    if (!q) return true;
    if (g.name.toLowerCase().includes(q)) return true;
    const tags = getTagsByIds(g.tagIds);
    return tags.some(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  };

  if (tab === "推荐" && !q) {
    return recommendGroups(viewerId, 10).map((s) => s.group);
  }

  let list = getVisibleGroups(interestGroups, viewerId);

  if (tab !== "推荐") {
    list = list.filter((g) => {
      const tags = getTagsByIds(g.tagIds);
      return tags.some((t) => t.category === tab);
    });
  }

  if (q) {
    list = list.filter(matchQuery);
  }

  return list.sort((a, b) => b.memberCount - a.memberCount);
};

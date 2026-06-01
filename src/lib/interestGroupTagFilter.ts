import { INTEREST_TAG_CATALOG } from "@/data/interestTagCatalog";
import { getTagsByIds } from "@/data/interestTags";
import type { InterestGroupFull, InterestTag } from "@/data/interestTypes";

export const OTHER_TAG_CATALOG_ID = "other" as const;

export type TagCatalogFilterId =
  | "all"
  | typeof OTHER_TAG_CATALOG_ID
  | (typeof INTEREST_TAG_CATALOG)[number]["id"];

export const tagCatalogFilterOptions: {
  key: TagCatalogFilterId;
  label: string;
}[] = [
  { key: "all", label: "全部" },
  ...INTEREST_TAG_CATALOG.map((cat) => ({
    key: cat.id as TagCatalogFilterId,
    label: cat.name,
  })),
  { key: OTHER_TAG_CATALOG_ID, label: "其他" },
];

export const tagCatalogFilterKeys = tagCatalogFilterOptions.map((f) => f.key);

const catalogNameToCategoryId = (() => {
  const map = new Map<string, string>();
  for (const cat of INTEREST_TAG_CATALOG) {
    for (const group of cat.groups) {
      for (const name of group.items) {
        map.set(name.trim().toLowerCase(), cat.id);
      }
    }
  }
  return map;
})();

export const isCustomTag = (tag: InterestTag) =>
  tag.id.startsWith("tag-custom-");

/** 标签所属一级分类；自定义或未收录进标签库的标签归为「其他」 */
export const resolveTagCatalogCategoryId = (
  tag: InterestTag,
): Exclude<TagCatalogFilterId, "all"> => {
  if (isCustomTag(tag)) return OTHER_TAG_CATALOG_ID;
  const catId = catalogNameToCategoryId.get(tag.name.trim().toLowerCase());
  return (catId as Exclude<TagCatalogFilterId, "all"> | undefined) ??
    OTHER_TAG_CATALOG_ID;
};

export const groupMatchesTagCatalogFilter = (
  group: InterestGroupFull,
  filter: TagCatalogFilterId,
): boolean => {
  if (filter === "all") return true;

  const tags = getTagsByIds(group.tagIds);
  if (tags.length === 0) return false;

  const categoryIds = new Set(
    tags.map((tag) => resolveTagCatalogCategoryId(tag)),
  );

  return categoryIds.has(filter);
};

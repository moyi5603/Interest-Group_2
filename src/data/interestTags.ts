import type { InterestTag } from "./interestTypes";

const CUSTOM_TAGS_KEY = "exp-interest-custom-tags";

export const interestTagList: InterestTag[] = [
  { id: "tag-gaming", name: "电竞", category: "科技" },
  { id: "tag-music", name: "音乐", category: "文艺" },
  { id: "tag-photo", name: "摄影", category: "文艺" },
  { id: "tag-fitness", name: "健身", category: "运动" },
  { id: "tag-running", name: "跑步", category: "运动" },
  { id: "tag-hiking", name: "徒步", category: "运动" },
  { id: "tag-boardgame", name: "桌游", category: "生活" },
  { id: "tag-badminton", name: "羽毛球", category: "运动" },
  { id: "tag-basketball", name: "篮球", category: "运动" },
  { id: "tag-tech", name: "技术分享", category: "科技" },
  { id: "tag-volunteer", name: "公益志愿", category: "生活" },
];

let customTags: InterestTag[] = loadCustomTags();
const tagById = new Map<string, InterestTag>();

function loadCustomTags(): InterestTag[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TAGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InterestTag[];
  } catch {
    return [];
  }
}

function persistCustomTags() {
  localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(customTags));
}

function rebuildTagMap() {
  tagById.clear();
  for (const t of [...interestTagList, ...customTags]) {
    tagById.set(t.id, t);
  }
}

rebuildTagMap();

export const getAllTags = (): InterestTag[] => [
  ...interestTagList,
  ...customTags,
];

export const getTagById = (id: string) => tagById.get(id);

export const getTagsByIds = (ids: string[]) =>
  ids.map((id) => tagById.get(id)).filter((t): t is InterestTag => !!t);

export const findTagByName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  return getAllTags().find((t) => t.name === trimmed);
};

const MAX_CUSTOM_TAG_LEN = 6;

/** 按名称去重；新建自定义标签并持久化 */
export const ensureCustomTag = (name: string): InterestTag | null => {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > MAX_CUSTOM_TAG_LEN) return null;

  const existing = findTagByName(trimmed);
  if (existing) return existing;

  const tag: InterestTag = {
    id: `tag-custom-${Date.now()}`,
    name: trimmed,
    category: "生活",
  };
  customTags = [...customTags, tag];
  persistCustomTags();
  rebuildTagMap();
  return tag;
};

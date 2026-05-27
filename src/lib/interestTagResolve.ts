import { ensureCustomTag, findTagByName } from "@/data/interestTags";

export const normalizeTagLabel = (raw: string) => raw.trim().replace(/\s+/g, "");

/** 将标签名称解析为 tagId（词典匹配或创建自定义标签） */
export const resolveTagIdFromName = (name: string): string | null => {
  const trimmed = normalizeTagLabel(name);
  if (!trimmed) return null;
  const existing = findTagByName(trimmed);
  if (existing) return existing.id;
  const custom = ensureCustomTag(trimmed);
  return custom?.id ?? null;
};

export const resolveTagIdsFromNames = (names: string[]): string[] => {
  const ids: string[] = [];
  for (const name of names) {
    const id = resolveTagIdFromName(name);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
};

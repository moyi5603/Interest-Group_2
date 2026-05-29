/** 演示数据用汉字拼音表（员工档案 + 模拟成员字库） */
const charPinyin: Record<string, string> = {
  陈: "chen",
  芳: "fang",
  刚: "gang",
  高: "gao",
  郭: "guo",
  海: "hai",
  浩: "hao",
  何: "he",
  胡: "hu",
  黄: "huang",
  慧: "hui",
  杰: "jie",
  进: "jin",
  军: "jun",
  磊: "lei",
  李: "li",
  丽: "li",
  林: "lin",
  刘: "liu",
  马: "ma",
  明: "ming",
  敏: "min",
  娜: "na",
  萍: "ping",
  平: "ping",
  鹏: "peng",
  钱: "qian",
  强: "qiang",
  孙: "sun",
  涛: "tao",
  婷: "ting",
  王: "wang",
  伟: "wei",
  吴: "wu",
  霞: "xia",
  鑫: "xin",
  徐: "xu",
  杨: "yang",
  洋: "yang",
  艳: "yan",
  勇: "yong",
  张: "zhang",
  赵: "zhao",
  郑: "zheng",
  周: "zhou",
  朱: "zhu",
  超: "chao",
  静: "jing",
};

export const getNamePinyinKey = (name: string): string =>
  [...name]
    .map((ch) => {
      if (/[a-zA-Z]/.test(ch)) return ch.toLowerCase();
      if (/[0-9]/.test(ch)) return ch;
      return charPinyin[ch] ?? ch;
    })
    .join("");

export const getNameInitial = (name: string): string => {
  const first = name.trim()[0];
  if (!first) return "#";
  if (/[a-zA-Z]/.test(first)) return first.toUpperCase();
  const py = charPinyin[first];
  if (!py) return "#";
  return py[0]!.toUpperCase();
};

export const compareNamePinyin = (a: string, b: string): number =>
  getNamePinyinKey(a).localeCompare(getNamePinyinKey(b), "en");

export type NameIndexedSection<T> = {
  letter: string;
  items: T[];
};

const sectionLetterOrder = (a: string, b: string) => {
  if (a === "#") return 1;
  if (b === "#") return -1;
  return a.localeCompare(b, "en");
};

export const groupByNameInitial = <T extends { name: string }>(
  items: T[],
): NameIndexedSection<T>[] => {
  const sorted = [...items].sort((a, b) => compareNamePinyin(a.name, b.name));
  const map = new Map<string, T[]>();

  for (const item of sorted) {
    const letter = getNameInitial(item.name);
    const bucket = map.get(letter);
    if (bucket) bucket.push(item);
    else map.set(letter, [item]);
  }

  return [...map.keys()]
    .sort(sectionLetterOrder)
    .map((letter) => ({ letter, items: map.get(letter)! }));
};

export const getNameIndexLetters = <T extends { name: string }>(
  items: T[],
): string[] => groupByNameInitial(items).map((s) => s.letter);

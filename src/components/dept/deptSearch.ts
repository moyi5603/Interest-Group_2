import { deptsFull, type DeptFull } from "@/data/colleagueData";

export type Section = "head" | "duty" | "kpi" | "culture" | "intro" | "members";

const deptAliases: Record<string, string[]> = {
  rd: ["技术", "技术部", "研发", "研发中心", "rd", "工程"],
  "rd-fe": ["前端", "前端组", "web"],
  "rd-be": ["后端", "后端组", "服务端"],
  "rd-ai": ["ai", "算法", "ai 算法组", "ai算法组", "机器学习"],
  "rd-qa": ["测试", "测试组", "qa"],
  "rd-ops": ["运维", "运维组", "sre"],
  product: ["产品中心", "产品"],
  "product-pm": ["产品组", "产品经理"],
  "product-ux": ["设计", "设计组", "ux", "ui"],
  sales: ["销售", "销售中心"],
  "sales-bd": ["bd", "商务", "bd组"],
  "sales-ksa": ["大客户", "大客户组"],
  hr: ["人力", "人力资源", "人力资源部", "hr"],
  finance: ["财务", "财务部"],
  admin: ["行政", "行政部"],
};

export const parseSections = (need: string): Section[] => {
  const q = need.toLowerCase().trim();
  if (!q) return ["head", "duty"];
  const sections = new Set<Section>();
  if (/负责人|主管|领导|老大|tl|leader|head/i.test(q)) sections.add("head");
  if (/职能|职责|工作|做什么|干什么|干嘛|介绍|简介|是什么/.test(q)) {
    sections.add("duty");
    if (/介绍|简介|是什么/.test(q)) sections.add("intro");
  }
  if (/绩效|kpi|指标|目标|考核/i.test(q)) sections.add("kpi");
  if (/文化|信条|理念|使命|价值观|slogan/i.test(q)) sections.add("culture");
  if (/成员|员工|人员|名单|花名册|多少人|有谁/.test(q)) sections.add("members");
  if (sections.size === 0) return ["head", "duty"];
  return Array.from(sections);
};

const splitDeptQuery = (text: string): string[] => {
  const cleaned = text
    .replace(/^(查询|查一下|查|找一下|找|看一下|看看|了解|介绍|搜索)/g, "")
    .replace(/的.*$/g, "")
    .replace(/[，,、\s]+/g, "|")
    .replace(/和|与|以及|跟|或/g, "|");
  return cleaned
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
};

export const findDepts = (deptInput: string): DeptFull[] => {
  const tokens = splitDeptQuery(deptInput);
  if (tokens.length === 0) return [];
  const results: DeptFull[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const lower = token.toLowerCase();
    for (const d of deptsFull) {
      if (
        d.name.toLowerCase().includes(lower) ||
        lower.includes(d.name.toLowerCase()) ||
        d.id === lower
      ) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          results.push(d);
        }
      }
    }
    for (const [id, aliases] of Object.entries(deptAliases)) {
      if (aliases.some((a) => lower.includes(a) || a.includes(lower))) {
        if (!seen.has(id)) {
          const d = deptsFull.find((x) => x.id === id);
          if (d) {
            seen.add(id);
            results.push(d);
          }
        }
      }
    }
  }
  return results;
};

// 从一句自然语言里同时拆出「部门部分」和「想了解什么部分」
export const parseDeptQuery = (raw: string): { deptText: string; needText: string } => {
  const text = raw.trim();
  // 优先用「的」分割：技术部和产品部的负责人 -> [部门][负责人]
  const idx = text.lastIndexOf("的");
  if (idx > 0 && idx < text.length - 1) {
    return { deptText: text.slice(0, idx), needText: text.slice(idx + 1) };
  }
  return { deptText: text, needText: text };
};

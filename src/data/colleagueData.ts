import { Award, Coffee, Gamepad2, BookOpen, Music, Camera, Dumbbell, type LucideIcon } from "lucide-react";
import avatarWangfang from "@/assets/avatar-wangfang.jpg";

export type EmployeeFull = {
  id: string;
  name: string;
  position: string;
  deptId: string;
  deptName: string;
  phone: string;
  email: string;
  joinDate: string; // YYYY-MM-DD
  skills: string[];
  badges: Badge[];
  points: number;
  interestGroups: InterestGroup[];
  /** 员工档案中的兴趣标签 ID（供推荐算法读取） */
  interestTagIds?: string[];
  bio: string;
  projects: string[];
  avatarColor: string; // hsl color var
  avatarUrl?: string; // real photo URL
  isOnDuty?: boolean;
  isManager?: boolean;
  isOnline?: boolean;
};

export type Badge = {
  id: string;
  name: string;
  icon: string; // emoji
  date: string;
  level: "gold" | "silver" | "bronze";
};

export type InterestGroup = {
  id: string;
  name: string;
  icon: LucideIcon;
  members: number;
};

export type DeptFull = {
  id: string;
  name: string;
  parentId?: string;
  description: string;
  headId: string; // employee id of dept head
  count: number;
  childIds: string[];
  email?: string;
  mission?: string; // 部门信条
  responsibilities?: string[]; // 职能详细介绍
  kpis?: string[]; // 部门绩效指标
};

const interestPool: InterestGroup[] = [
  { id: "ig1", name: "咖啡品鉴", icon: Coffee, members: 32 },
  { id: "ig2", name: "电竞社", icon: Gamepad2, members: 48 },
  { id: "ig3", name: "读书会", icon: BookOpen, members: 26 },
  { id: "ig4", name: "音乐社", icon: Music, members: 19 },
  { id: "ig5", name: "摄影社", icon: Camera, members: 22 },
  { id: "ig6", name: "健身房", icon: Dumbbell, members: 37 },
];

const badgePool: Badge[] = [
  { id: "b1", name: "创新之星", icon: "🌟", date: "2025-12", level: "gold" },
  { id: "b2", name: "最佳协作", icon: "🤝", date: "2025-09", level: "silver" },
  { id: "b3", name: "代码达人", icon: "💻", date: "2025-06", level: "gold" },
  { id: "b4", name: "知识分享", icon: "📚", date: "2025-03", level: "bronze" },
  { id: "b5", name: "客户好评", icon: "👍", date: "2024-12", level: "gold" },
  { id: "b6", name: "季度MVP", icon: "🏆", date: "2025-10", level: "gold" },
  { id: "b7", name: "导师徽章", icon: "🎓", date: "2025-01", level: "silver" },
  { id: "b8", name: "全勤之星", icon: "⏰", date: "2025-11", level: "bronze" },
];

const avatarColors = [
  "210 90% 60%", "25 95% 60%", "160 70% 45%", "350 85% 62%",
  "270 70% 62%", "45 95% 55%", "330 80% 65%", "15 85% 65%",
  "195 80% 55%", "245 75% 60%",
];

export const employeesFull: EmployeeFull[] = [
  {
    id: "u1", name: "张敏", position: "高级前端工程师", deptId: "rd-fe", deptName: "前端组",
    phone: "138****1234", email: "zhangmin@exp.com", joinDate: "2019-03-15",
    skills: ["React", "TypeScript", "Node.js", "性能优化"],
    badges: [badgePool[0], badgePool[2], badgePool[5]],
    points: 2860,
    interestGroups: [interestPool[0], interestPool[4]],
    interestTagIds: ["tag-photo", "tag-tech"],
    bio: "8年前端开发经验，专注于大型 SPA 架构与性能优化",
    projects: ["EXP 智能体平台", "员工门户 3.0"],
    avatarColor: avatarColors[0],
    isOnDuty: true,
  },
  {
    id: "u2", name: "李伟", position: "后端架构师", deptId: "rd-be", deptName: "后端组",
    phone: "139****5678", email: "liwei@exp.com", joinDate: "2017-07-01",
    skills: ["Java", "Go", "微服务", "分布式系统"],
    badges: [badgePool[0], badgePool[1], badgePool[6]],
    points: 4200,
    interestGroups: [interestPool[1], interestPool[5]],
    bio: "10年后端经验，主导公司微服务架构转型",
    projects: ["核心交易系统", "数据中台"],
    avatarColor: avatarColors[1],
  },
  {
    id: "u3", name: "王芳", position: "AI 算法专家", deptId: "rd-ai", deptName: "AI 算法组",
    phone: "137****9012", email: "wangfang@exp.com", joinDate: "2020-09-01",
    skills: ["PyTorch", "NLP", "推荐系统", "RAG"],
    badges: [badgePool[0], badgePool[3]],
    points: 3150,
    interestGroups: [interestPool[2], interestPool[0]],
    bio: "清华博士毕业，专注企业级 AI 应用落地",
    projects: ["智能推荐引擎", "EXP 智能体平台"],
    avatarColor: avatarColors[2],
    avatarUrl: avatarWangfang,
    isOnDuty: true,
  },
  {
    id: "u4", name: "赵磊", position: "测试主管", deptId: "rd-qa", deptName: "测试组",
    phone: "136****3456", email: "zhaolei@exp.com", joinDate: "2018-01-10",
    skills: ["自动化测试", "性能测试", "CI/CD"],
    badges: [badgePool[7], badgePool[1]],
    points: 1920,
    interestGroups: [interestPool[5]],
    bio: "质量至上，推动全链路自动化测试体系建设",
    projects: ["质量管理平台", "DevOps 工具链"],
    avatarColor: avatarColors[3],
    isOnDuty: true,
  },
  {
    id: "u5", name: "孙丽", position: "高级产品经理", deptId: "product-pm", deptName: "产品组",
    phone: "135****7890", email: "sunli@exp.com", joinDate: "2020-03-20",
    skills: ["产品规划", "数据分析", "用户研究"],
    badges: [badgePool[4], badgePool[1]],
    points: 2450,
    interestGroups: [interestPool[2], interestPool[3]],
    bio: "从0到1打造多款企业级SaaS产品",
    projects: ["EXP 智能体平台", "员工门户 3.0"],
    avatarColor: avatarColors[4],
  },
  {
    id: "u6", name: "周鹏", position: "UX 设计专家", deptId: "product-ux", deptName: "设计组",
    phone: "134****2345", email: "zhoupeng@exp.com", joinDate: "2021-06-15",
    skills: ["交互设计", "设计系统", "Figma", "用户体验"],
    badges: [badgePool[0], badgePool[3]],
    points: 1780,
    interestGroups: [interestPool[4], interestPool[3]],
    bio: "设计驱动创新，构建一致的企业设计语言",
    projects: ["设计系统 2.0", "EXP 智能体平台"],
    avatarColor: avatarColors[5],
  },
  {
    id: "u7", name: "吴强", position: "BD 总监", deptId: "sales-bd", deptName: "BD 组",
    phone: "133****6789", email: "wuqiang@exp.com", joinDate: "2016-11-01",
    skills: ["商务拓展", "战略合作", "客户关系"],
    badges: [badgePool[4], badgePool[5]],
    points: 5100,
    interestGroups: [interestPool[0], interestPool[5]],
    bio: "深耕企业服务赛道，年签约额过亿",
    projects: ["战略客户计划", "渠道伙伴生态"],
    avatarColor: avatarColors[6],
  },
  {
    id: "u8", name: "郑娜", position: "HRBP 主管", deptId: "hr", deptName: "人力资源部",
    phone: "132****0123", email: "zhengna@exp.com", joinDate: "2019-08-15",
    skills: ["人才发展", "组织诊断", "员工关系"],
    badges: [badgePool[1], badgePool[6]],
    points: 2100,
    interestGroups: [interestPool[2], interestPool[3]],
    bio: "专注组织效能提升与人才梯队建设",
    projects: ["人才盘点项目", "文化建设 2.0"],
    avatarColor: avatarColors[7],
  },
  {
    id: "u9", name: "钱进", position: "财务总监", deptId: "finance", deptName: "财务部",
    phone: "131****4567", email: "qianjin@exp.com", joinDate: "2015-04-01",
    skills: ["财务分析", "预算管理", "税务筹划"],
    badges: [badgePool[7], badgePool[5]],
    points: 3600,
    interestGroups: [interestPool[0]],
    bio: "CPA持证，15年企业财务管理经验",
    projects: ["财务数字化", "成本优化项目"],
    avatarColor: avatarColors[8],
    isOnDuty: true,
  },
  {
    id: "u10", name: "陈静", position: "行政经理", deptId: "admin", deptName: "行政部",
    phone: "130****8901", email: "chenjing@exp.com", joinDate: "2021-01-10",
    skills: ["行政管理", "活动策划", "采购管理"],
    badges: [badgePool[7], badgePool[1]],
    points: 1560,
    interestGroups: [interestPool[3], interestPool[4]],
    bio: "让每一位同事都能安心工作",
    projects: ["智慧办公项目", "年会策划"],
    avatarColor: avatarColors[9],
  },
  {
    id: "u11", name: "黄海", position: "运维工程师", deptId: "rd-ops", deptName: "运维组",
    phone: "158****1122", email: "huanghai@exp.com", joinDate: "2022-05-20",
    skills: ["K8s", "Docker", "监控告警", "SRE"],
    badges: [badgePool[2]],
    points: 980,
    interestGroups: [interestPool[1]],
    bio: "保障系统 99.99% 可用性",
    projects: ["容器化改造", "监控体系升级"],
    avatarColor: avatarColors[0],
  },
  {
    id: "u12", name: "林萍", position: "大客户经理", deptId: "sales-ksa", deptName: "大客户组",
    phone: "159****3344", email: "linping@exp.com", joinDate: "2020-11-01",
    skills: ["大客户运营", "方案咨询", "合同谈判"],
    badges: [badgePool[4], badgePool[5]],
    points: 3800,
    interestGroups: [interestPool[0], interestPool[5]],
    bio: "服务 Top50 企业客户，续约率 95%",
    projects: ["战略客户计划", "行业解决方案"],
    avatarColor: avatarColors[6],
  },
];

export const deptsFull: DeptFull[] = [
  {
    id: "rd", name: "研发中心", description: "负责公司全线产品研发与技术创新", headId: "u2", count: 86,
    childIds: ["rd-fe", "rd-be", "rd-ai", "rd-qa", "rd-ops"],
    email: "rd@exp.com",
    mission: "用技术创造业务价值，让每一行代码都被信赖",
    responsibilities: ["统筹公司技术战略与中长期技术规划", "核心产品的架构设计与研发实施", "技术中台与基础设施建设", "推动技术创新与前沿技术预研"],
    kpis: ["核心系统可用性 ≥ 99.99%", "需求按时交付率 ≥ 95%", "重大故障数 ≤ 2 次/季", "专利与技术影响力产出"],
  },
  {
    id: "rd-fe", name: "前端组", parentId: "rd", description: "Web/移动端前端开发", headId: "u1", count: 12, childIds: [],
    email: "fe@exp.com",
    mission: "像素级体验，毫秒级响应",
    responsibilities: ["Web 与移动端前端架构与开发", "组件库与设计系统落地", "前端性能与体验优化", "前端工程化与质量保障"],
    kpis: ["首屏加载 ≤ 1.5s", "线上 JS 报错率 ≤ 0.1%", "组件复用率 ≥ 70%", "迭代准时率 ≥ 95%"],
  },
  {
    id: "rd-be", name: "后端组", parentId: "rd", description: "服务端架构与核心系统开发", headId: "u2", count: 24, childIds: [],
    email: "be@exp.com",
    mission: "稳定、可扩展、可演进",
    responsibilities: ["核心业务系统的架构与开发", "微服务治理与中间件建设", "数据库与存储方案设计", "高并发与高可用保障"],
    kpis: ["接口 P99 延迟 ≤ 200ms", "服务可用性 ≥ 99.99%", "线上故障 MTTR ≤ 30 分钟", "技术债清理 ≥ 80%"],
  },
  {
    id: "rd-ai", name: "AI 算法组", parentId: "rd", description: "机器学习与智能应用研发", headId: "u3", count: 18, childIds: [],
    email: "ai@exp.com",
    mission: "让 AI 真正解决业务问题",
    responsibilities: ["大模型与生成式 AI 应用研发", "推荐、搜索、风控等核心算法建设", "AI 中台与模型工程化", "前沿算法预研与论文产出"],
    kpis: ["核心模型 AUC 提升 ≥ 5%", "AI 能力覆盖业务场景数", "模型上线周期 ≤ 2 周", "顶会论文/专利产出"],
  },
  {
    id: "rd-qa", name: "测试组", parentId: "rd", description: "质量保障与自动化测试", headId: "u4", count: 14, childIds: [],
    email: "qa@exp.com",
    mission: "质量是设计出来的，不是测出来的",
    responsibilities: ["全链路测试策略制定与执行", "自动化测试与持续集成体系", "性能、安全、兼容性专项测试", "质量度量与缺陷分析"],
    kpis: ["自动化覆盖率 ≥ 80%", "线上严重缺陷数 ≤ 1 次/月", "回归测试时长 ≤ 4 小时", "需求质量门禁通过率 ≥ 98%"],
  },
  {
    id: "rd-ops", name: "运维组", parentId: "rd", description: "基础设施与 SRE", headId: "u11", count: 8, childIds: [],
    email: "ops@exp.com",
    mission: "稳定压倒一切",
    responsibilities: ["基础设施与云资源管理", "K8s 容器化与持续交付", "监控告警与故障响应", "成本优化与容量规划"],
    kpis: ["系统可用性 ≥ 99.99%", "故障平均恢复时间 ≤ 15 分钟", "资源使用率 ≥ 65%", "云成本同比下降 ≥ 10%"],
  },
  {
    id: "product", name: "产品中心", description: "产品规划、设计与用户体验", headId: "u5", count: 22, childIds: ["product-pm", "product-ux"],
    email: "product@exp.com",
    mission: "做用户离不开的产品",
    responsibilities: ["公司产品战略与路线规划", "用户研究与需求洞察", "产品设计与体验把控", "产品数据分析与迭代决策"],
    kpis: ["核心产品 NPS ≥ 50", "月活用户增长 ≥ 15%", "需求 ROI 评估覆盖率 100%", "重点项目按期交付率 ≥ 95%"],
  },
  {
    id: "product-pm", name: "产品组", parentId: "product", description: "产品规划与需求管理", headId: "u5", count: 10, childIds: [],
    email: "pm@exp.com",
    mission: "让每一个需求都创造价值",
    responsibilities: ["产品规划与版本路线管理", "需求分析与 PRD 撰写", "跨团队协作与项目推进", "上线效果评估与复盘"],
    kpis: ["需求按时交付率 ≥ 95%", "上线需求达成预期比例 ≥ 80%", "用户满意度 ≥ 4.5/5", "PRD 一次评审通过率 ≥ 90%"],
  },
  {
    id: "product-ux", name: "设计组", parentId: "product", description: "UI/UX 设计与设计系统", headId: "u6", count: 8, childIds: [],
    email: "ux@exp.com",
    mission: "用设计让复杂变简单",
    responsibilities: ["产品交互与视觉设计", "设计系统建设与维护", "用户研究与可用性测试", "品牌视觉与对外物料"],
    kpis: ["设计稿一次评审通过率 ≥ 85%", "设计系统覆盖率 ≥ 90%", "可用性测试任务完成率 ≥ 90%", "设计奖项与对外影响力"],
  },
  {
    id: "sales", name: "销售中心", description: "市场拓展与客户服务", headId: "u7", count: 54, childIds: ["sales-bd", "sales-ksa"],
    email: "sales@exp.com",
    mission: "客户成功，就是我们的成功",
    responsibilities: ["公司销售战略与目标达成", "新客户拓展与渠道建设", "大客户运营与续约管理", "行业解决方案与商务支持"],
    kpis: ["年度新签合同额", "客户续约率 ≥ 90%", "回款及时率 ≥ 95%", "新客户获取数同比增长 ≥ 20%"],
  },
  {
    id: "sales-bd", name: "BD 组", parentId: "sales", description: "商务拓展与渠道合作", headId: "u7", count: 18, childIds: [],
    email: "bd@exp.com",
    mission: "拓宽边界，连接价值",
    responsibilities: ["新客户与新行业开拓", "战略合作与渠道伙伴管理", "商务谈判与合同签约", "行业活动与品牌曝光"],
    kpis: ["新签合同数与金额", "渠道贡献收入占比 ≥ 30%", "线索转化率 ≥ 15%", "战略合作伙伴数量"],
  },
  {
    id: "sales-ksa", name: "大客户组", parentId: "sales", description: "大客户关系管理与方案", headId: "u12", count: 12, childIds: [],
    email: "ksa@exp.com",
    mission: "成为客户最信任的伙伴",
    responsibilities: ["Top 客户关系经营与续约", "客户成功与价值咨询", "复杂方案的售前与售后", "客户满意度与口碑管理"],
    kpis: ["大客户续约率 ≥ 95%", "客户满意度 ≥ 4.7/5", "增购合同金额", "客户流失率 ≤ 3%"],
  },
  {
    id: "hr", name: "人力资源部", description: "人才招聘、发展与员工关系", headId: "u8", count: 9, childIds: [],
    email: "hr@exp.com",
    mission: "成就人，才能成就组织",
    responsibilities: ["人才招聘与雇主品牌建设", "组织发展与人才梯队", "绩效与激励体系设计", "员工关系与企业文化"],
    kpis: ["关键岗位招聘到岗率 ≥ 90%", "员工主动离职率 ≤ 10%", "员工敬业度 ≥ 80%", "培训覆盖率 ≥ 95%"],
  },
  {
    id: "finance", name: "财务部", description: "财务管理与资金运营", headId: "u9", count: 7, childIds: [],
    email: "finance@exp.com",
    mission: "用数字守护企业健康",
    responsibilities: ["财务核算与报表管理", "预算编制与成本控制", "资金管理与税务筹划", "投融资与风险管控"],
    kpis: ["月结准时率 100%", "预算偏差率 ≤ 5%", "应收账款周转天数 ≤ 60", "审计零重大问题"],
  },
  {
    id: "admin", name: "行政部", description: "行政后勤与办公支持", headId: "u10", count: 6, childIds: [],
    email: "admin@exp.com",
    mission: "让同事专注创造，其他交给我们",
    responsibilities: ["办公环境与后勤保障", "行政采购与供应商管理", "公司活动与会议组织", "证照、合规与对外接待"],
    kpis: ["员工满意度 ≥ 4.5/5", "行政费用控制率 ≤ 预算 100%", "重大活动零事故", "供应商履约合格率 ≥ 95%"],
  },
];

// Auto-derive isManager from deptsFull headId
const managerIds = new Set(deptsFull.map((d) => d.headId));
// Simulate online status for some employees
const onlineIds = new Set(["u1", "u3", "u5", "u7", "u8", "u11"]);
employeesFull.forEach((e) => {
  if (managerIds.has(e.id)) e.isManager = true;
  if (onlineIds.has(e.id)) e.isOnline = true;
});

export const getEmployee = (id: string) => employeesFull.find((e) => e.id === id);

export const getEmployeeInterestTagIds = (employeeId: string): string[] =>
  getEmployee(employeeId)?.interestTagIds ?? [];

export const setEmployeeInterestTagIds = (
  employeeId: string,
  tagIds: string[],
) => {
  const idx = employeesFull.findIndex((e) => e.id === employeeId);
  if (idx < 0) return;
  employeesFull[idx] = { ...employeesFull[idx], interestTagIds: [...tagIds] };
  try {
    const payload = tagIds.map((tagId) => ({ tagId, source: "manual" }));
    localStorage.setItem(
      `exp-interest-profile-${employeeId}`,
      JSON.stringify(payload),
    );
  } catch {
    /* ignore quota / private mode */
  }
};
export const getDept = (id: string) => deptsFull.find((d) => d.id === id);
export const getDeptEmployees = (deptId: string) => employeesFull.filter((e) => e.deptId === deptId);
export const getYearsOfService = (joinDate: string) => {
  const join = new Date(joinDate);
  const now = new Date();
  return Math.floor((now.getTime() - join.getTime()) / (365.25 * 24 * 3600 * 1000));
};

export const searchEmployees = (query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return employeesFull.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.skills.some((s) => s.toLowerCase().includes(q)) ||
      e.deptName.toLowerCase().includes(q) ||
      e.projects.some((p) => p.toLowerCase().includes(q))
  );
};

export const searchDepts = (query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return deptsFull.filter(
    (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
  );
};

// ── Smart search with AI-style intent detection ──

export type SmartSearchResult = {
  intent: "employee" | "department" | "mixed";
  employees: EmployeeFull[];
  departments: DeptFull[];
  summary: string;
  recommendation?: string;
};

const deptKeywords: Record<string, string[]> = {
  rd: ["研发", "技术", "开发", "工程"],
  "rd-fe": ["前端", "react", "vue", "web", "移动端"],
  "rd-be": ["后端", "服务端", "java", "go", "微服务", "架构"],
  "rd-ai": ["ai", "算法", "机器学习", "nlp", "推荐", "rag", "pytorch"],
  "rd-qa": ["测试", "qa", "自动化测试", "质量"],
  "rd-ops": ["运维", "devops", "k8s", "docker", "sre", "监控"],
  product: ["产品", "需求", "规划"],
  "product-pm": ["产品经理", "pm", "产品规划"],
  "product-ux": ["设计", "ux", "ui", "交互", "figma"],
  sales: ["销售", "商务", "客户"],
  "sales-bd": ["bd", "商务拓展", "渠道"],
  "sales-ksa": ["大客户", "ksa", "方案咨询"],
  hr: ["人力", "hr", "hrbp", "招聘", "人才"],
  finance: ["财务", "预算", "税务", "资金"],
  admin: ["行政", "后勤", "采购", "活动"],
};

const needKeywords: Record<string, string[]> = {
  "数据分析": ["数据分析", "数据", "报表", "分析"],
  "性能优化": ["性能", "优化", "速度"],
  "项目管理": ["项目管理", "项目"],
  "设计": ["设计", "ui", "ux", "交互"],
};

export const smartSearch = (query: string): SmartSearchResult => {
  const q = query.toLowerCase().trim();
  if (!q) return { intent: "mixed", employees: [], departments: [], summary: "请输入搜索内容" };

  const emps = searchEmployees(q);
  const depts = searchDepts(q);

  // Check if query looks like a department search
  const isDeptQuery = /部门|组织|团队|中心/.test(q) || q.startsWith("查部门");
  // Check if query looks like a need-based search
  const isNeedQuery = /谁能|谁可以|帮我找|我需要|有没有|推荐/.test(q);
  // Check project query
  const isProjectQuery = /项目|成员/.test(q);

  // Expand search by department keywords
  let expandedEmps = [...emps];
  let expandedDepts = [...depts];

  for (const [deptId, keywords] of Object.entries(deptKeywords)) {
    if (keywords.some((k) => q.includes(k))) {
      const dept = getDept(deptId);
      if (dept && !expandedDepts.find((d) => d.id === deptId)) expandedDepts.push(dept);
      const deptEmps = getDeptEmployees(deptId);
      for (const e of deptEmps) {
        if (!expandedEmps.find((x) => x.id === e.id)) expandedEmps.push(e);
      }
    }
  }

  // For project queries, also include departments of matched employees
  if (isProjectQuery && expandedEmps.length > 0) {
    const deptIds = new Set(expandedEmps.map((e) => e.deptId));
    for (const deptId of deptIds) {
      const dept = getDept(deptId);
      if (dept && !expandedDepts.find((d) => d.id === deptId)) expandedDepts.push(dept);
    }
  }

  // Determine intent
  let intent: SmartSearchResult["intent"] = "mixed";
  if (isDeptQuery && expandedDepts.length > 0 && expandedEmps.length === 0) intent = "department";
  else if (expandedEmps.length > 0 && expandedDepts.length === 0) intent = "employee";
  else if (expandedDepts.length > 0 && expandedEmps.length === 0) intent = "department";

  // Generate summary
  let summary = "";
  let recommendation: string | undefined;

  if (expandedEmps.length === 0 && expandedDepts.length === 0) {
    summary = `抱歉，没有找到与「${query}」相关的同事或部门。你可以试试换个关键词，或者描述你的具体需求。`;
  } else if (intent === "employee") {
    summary = `为你找到 ${expandedEmps.length} 位${isNeedQuery ? "可能符合需求的" : "匹配的"}同事：`;
    if (expandedEmps.length > 0 && isNeedQuery) {
      const top = expandedEmps[0];
      recommendation = `推荐优先联系「${top.name}」（${top.position}），${top.bio}。`;
    }
  } else if (intent === "department") {
    summary = `为你找到 ${expandedDepts.length} 个相关部门：`;
  } else {
    const parts: string[] = [];
    if (expandedEmps.length > 0) parts.push(`${expandedEmps.length} 位同事`);
    if (expandedDepts.length > 0) parts.push(`${expandedDepts.length} 个部门`);
    summary = `为你找到${parts.join("和")}：`;
    if (expandedEmps.length > 0 && isNeedQuery) {
      const top = expandedEmps[0];
      recommendation = `推荐优先联系「${top.name}」（${top.position}），${top.bio}。`;
    }
  }

  return { intent, employees: expandedEmps, departments: expandedDepts, summary, recommendation };
};

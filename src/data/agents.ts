import {
  Users,
  FileCheck,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Trophy,
  Gift,
  HandHeart,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

export type AgentCategory =
  | "communication"
  | "development"
  | "honor"
  | "care";

export type Agent = {
  id: string;
  name: string;
  description: string;
  example: string;
  icon: LucideIcon;
  colorVar: string;
  category: AgentCategory;
};

export const categoryMeta: Record<AgentCategory, { label: string; short: string }> = {
  communication: { label: "沟通与效率引擎", short: "沟通与效率" },
  development: { label: "成长与发展引擎", short: "成长与发展" },
  honor: { label: "荣誉与认可引擎", short: "荣誉与认可" },
  care: { label: "关怀与福利引擎", short: "关怀与福利" },
};

export const agents: Agent[] = [
  {
    id: "find-colleague",
    name: "找同事",
    description: "找人、点赞、感恩卡、祝福、智能分配工单",
    example: "帮我找市场部的张经理",
    icon: Users,
    colorVar: "--cat-1",
    category: "communication",
  },
  {
    id: "procedure",
    name: "办手续",
    description: "请假、领资产、报销一站式办理",
    example: "我想申请下周三的年假",
    icon: FileCheck,
    colorVar: "--cat-2",
    category: "communication",
  },
  {
    id: "policy",
    name: "查政策",
    description: "HR、财务、销售政策即问即答",
    example: "差旅报销标准是什么?",
    icon: BookOpen,
    colorVar: "--cat-3",
    category: "communication",
  },
  {
    id: "develop",
    name: "谋发展",
    description: "课程、考试、晋升、导师、兴趣小组一站式",
    example: "推荐一门管理类课程",
    icon: TrendingUp,
    colorVar: "--cat-5",
    category: "development",
  },
  {
    id: "dev-course",
    name: "课程",
    description: "课程学习、考试与证书管理",
    example: "推荐一门数据分析课程",
    icon: GraduationCap,
    colorVar: "--cat-3",
    category: "development",
  },
  {
    id: "honor-wall",
    name: "荣誉墙",
    description: "表彰、勋章、荣誉故事展示",
    example: "查看本月荣誉榜",
    icon: Trophy,
    colorVar: "--cat-6",
    category: "honor",
  },
  {
    id: "welfare",
    name: "享福利",
    description: "推荐商品、查信息、查应用",
    example: "推荐一些热销福利商品",
    icon: Gift,
    colorVar: "--cat-7",
    category: "care",
  },
  {
    id: "care-humanity",
    name: "人文关怀",
    description: "生日、节日、天气、工作强度全场景关怀触达",
    example: "为研发部下个月过生日的同事创建关怀",
    icon: HandHeart,
    colorVar: "--cat-8",
    category: "care",
  },
  {
    id: "care-special",
    name: "特殊人群",
    description: "孕期、伤病、新员工等定向关怀",
    example: "本月有哪些需要关怀的同事?",
    icon: HeartHandshake,
    colorVar: "--cat-4",
    category: "care",
  },
];

import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Users,
  Building2,
  Briefcase,
  Lightbulb,
  Wrench,
  UserCheck,
  MessageSquare,
  User,
  Hash,
  Phone,
  Calendar,
  Heart,
  Award,
  Sparkles,
  ArrowDown,
  MapPin,
  Trophy,
  FileText,
  Target,
  Mail,
  Network,
  Home,
  Flag,
  type LucideIcon,
} from "lucide-react";
import ChatInputBar from "@/components/agent/ChatInputBar";
import DeptResultCard from "@/components/dept/DeptResultCard";
import { findDepts, parseDeptQuery, parseSections, type Section } from "@/components/dept/deptSearch";
import type { DeptFull } from "@/data/colleagueData";

type ExampleGroup = {
  category: string;
  icon: LucideIcon;
  hint?: string;
  items: string[];
};

type CapabilityConfig = {
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
  prompts: { label: string; placeholder: string }[];
  welcome?: string;
  intro?: string;
  examples?: ExampleGroup[];
};

const capabilityMap: Record<string, CapabilityConfig> = {
  employee: {
    label: "直达员工",
    icon: Users,
    color: "210 90% 60%",
    description: "找同事，直接说就行 👋 任意线索都能匹配",
    welcome: "找同事，直接说就行 👋",
    intro: "也可以直接输入你知道的任何信息，我来帮你匹配",
    prompts: [],
    examples: [
      {
        category: "姓名",
        icon: User,
        hint: "直接说名字或加上部门",
        items: ["找李明", "技术部老张", "叫王芳的财务", "新来的实习生小陈"],
      },
      {
        category: "工号/邮箱",
        icon: Hash,
        hint: "工号或公司邮箱都行",
        items: ["EMP00123", "zhang@corp.com", "工号尾号88的", "邮箱前缀liuyang"],
      },
      {
        category: "手机号",
        icon: Phone,
        hint: "完整号码或记得的几位都行",
        items: ["13812345678", "尾号3456的同事", "138开头北京的", "中间四位有1990"],
      },
      {
        category: "技能/证书",
        icon: Award,
        hint: "按掌握的技能或持有的资质",
        items: ["会Java的", "有PMP证书的", "懂机器学习的", "持注册会计师"],
      },
      {
        category: "岗位",
        icon: Briefcase,
        hint: "按岗位或职级",
        items: ["前端工程师", "产品经理", "资深架构师", "市场总监"],
      },
      {
        category: "项目",
        icon: Lightbulb,
        hint: "按参与过的项目",
        items: ["参与过支付重构的", "做过双11大促的", "负责过出海项目的", "搭过数据中台的"],
      },
      {
        category: "时间范围",
        icon: Calendar,
        hint: "按入职或在岗时间找",
        items: ["上周新来的", "入职满5年的", "本月转正的", "今年校招进来的"],
      },
      {
        category: "籍贯",
        icon: MapPin,
        hint: "找同乡",
        items: ["四川老乡", "广东籍同事", "东北来的", "在上海长大的"],
      },
      {
        category: "兴趣",
        icon: Heart,
        hint: "找同好",
        items: ["羽毛球兴趣组的", "喜欢摄影的", "爱看脱口秀的", "周末爬山搭子"],
      },
      {
        category: "荣誉",
        icon: Trophy,
        hint: "按获奖记录",
        items: ["拿过优秀员工的", "年度TOP10", "创新大赛获奖", "季度之星"],
      },
    ],
  },
  dept: {
    label: "了解部门",
    icon: Building2,
    color: "160 70% 45%",
    description: "想了解哪个部门，直接说就行 🏢 一句话也能匹配",
    welcome: "想了解哪个部门，直接说就行 🏢",
    intro: "也可以直接输入你想了解的部门或问题，我来帮你匹配",
    prompts: [],
    examples: [
      {
        category: "名称",
        icon: Building2,
        hint: "直接说部门名字或简称",
        items: ["技术部", "找一下数据中台", "品牌中心在哪", "财务共享中心"],
      },
      {
        category: "邮箱",
        icon: Mail,
        hint: "找对外联络邮箱",
        items: ["财务部的对外邮箱", "HR部门收件邮箱", "客服公共邮箱", "采购对接邮箱"],
      },
      {
        category: "负责人",
        icon: UserCheck,
        hint: "找到部门一把手或对接人",
        items: ["运营部的老大是谁", "财务部负责人", "技术中台的TL", "AI算法组的对接人"],
      },
      {
        category: "职能简介",
        icon: Briefcase,
        hint: "了解部门具体在做什么、负责哪些业务",
        items: ["技术部是干什么的", "数据部门负责哪些事", "介绍一下品牌中心", "财务共享中心简介"],
      },
      {
        category: "部门文化",
        icon: Flag,
        hint: "看看团队的信条与价值观",
        items: ["技术中台的团队文化", "销售部的信条是什么", "产品中心的价值观", "我们部门的slogan"],
      },
      {
        category: "绩效指标",
        icon: Target,
        hint: "了解部门KPI，便于跨部门对齐",
        items: ["研发部门的绩效指标", "运营部考核哪些数据", "客服部的KPI", "市场部的核心指标"],
      },
      {
        category: "人员构成",
        icon: Users,
        hint: "查人数、岗位结构与花名册",
        items: ["产品部有多少人", "研发中心都有哪些岗位", "销售部花名册", "AI组的成员列表"],
      },
      {
        category: "职能匹配",
        icon: Sparkles,
        hint: "用业务问题反查负责部门",
        items: ["哪个部门负责数字化转型", "客户投诉找哪个部门", "出海业务归谁管", "招聘流程对接哪里"],
      },
      {
        category: "组织架构",
        icon: Network,
        hint: "按层级看公司部门树",
        items: ["公司有哪些一级部门", "研发中心有几个组", "产品中心的下设部门", "整体组织架构图"],
      },
      {
        category: "我的部门",
        icon: Home,
        hint: "自动定位你所在的部门",
        items: ["我们部门的信条是什么", "我们组的负责人", "我所在部门的KPI", "我们部门有哪些同事"],
      },
    ],
  },
  role: {
    label: "按岗位/技能匹配",
    icon: Briefcase,
    color: "270 70% 62%",
    description: "根据岗位名称或技能关键词，找到对应的同事",
    prompts: [
      { label: "岗位名称", placeholder: "如：前端工程师、产品经理…" },
      { label: "技能关键词", placeholder: "如：React、Python、项目管理…" },
      { label: "经验要求（可选）", placeholder: "如：3年以上、资深级别…" },
    ],
  },
  need: {
    label: "按需求/项目匹配",
    icon: Lightbulb,
    color: "45 95% 55%",
    description: "描述你的业务需求或项目需要，AI智能匹配最合适的人选",
    prompts: [
      { label: "需求/项目描述", placeholder: "请描述你的需求或项目背景…" },
      { label: "需要的能力", placeholder: "如：数据分析、UI设计、后端开发…" },
      { label: "紧急程度", placeholder: "如：紧急、本周内、不急…" },
    ],
  },
  problem: {
    label: "解决问题和故障",
    icon: Wrench,
    color: "350 85% 62%",
    description: "遇到技术问题或系统故障？快速找到能帮你解决的专家",
    prompts: [
      { label: "问题描述", placeholder: "请描述遇到的问题或故障现象…" },
      { label: "相关系统/技术", placeholder: "如：K8s、数据库、网络…" },
      { label: "影响范围", placeholder: "如：影响生产环境、仅测试环境…" },
    ],
  },
  backup: {
    label: "备选人员匹配",
    icon: UserCheck,
    color: "25 95% 60%",
    description: "为关键岗位或项目匹配备选候选人，确保业务连续性",
    prompts: [
      { label: "目标岗位/角色", placeholder: "请输入需要备选的岗位…" },
      { label: "当前负责人（可选）", placeholder: "如：张三、李四…" },
      { label: "备选要求", placeholder: "如：需要相同技能栈、同部门优先…" },
    ],
  },
};

const CapabilityDetail = () => {
  const navigate = useNavigate();
  const { key } = useParams<{ key: string }>();
  const config = capabilityMap[key || ""] || capabilityMap.employee;
  const Icon = config.icon;
  const isAgentMode = !!config.examples;
  const [activeTab, setActiveTab] = useState(0);
  const activeGroup = isAgentMode ? config.examples![activeTab] : null;

  // 部门查询模式
  const isDeptMode = key === "dept";
  const [deptQuery, setDeptQuery] = useState("");
  const [deptResults, setDeptResults] = useState<DeptFull[] | null>(null);
  const [deptSections, setDeptSections] = useState<Section[]>([]);
  const [lastQuery, setLastQuery] = useState("");

  const handleDeptSubmit = (raw: string) => {
    const { deptText, needText } = parseDeptQuery(raw);
    setDeptResults(findDepts(deptText));
    setDeptSections(parseSections(needText));
    setLastQuery(raw);
    setDeptQuery("");
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-base active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-foreground">{config.label}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide space-y-3">
        {/* Hero / Welcome */}
        <div
          className="rounded-2xl p-4 shadow-soft"
          style={{
            background: `linear-gradient(135deg, hsl(${config.color} / 0.18), hsl(${config.color} / 0.05))`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `hsl(${config.color} / 0.22)` }}
            >
              <Icon className="h-5 w-5" style={{ color: `hsl(${config.color})` }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">{config.welcome || config.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
            </div>
          </div>
        </div>

        {isAgentMode ? (
          <>
            {/* Tabs */}
            <div className="rounded-2xl bg-card shadow-soft p-3">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="h-4 w-4" style={{ color: `hsl(${config.color})` }} />
                <p className="text-sm font-semibold text-foreground">试试这样问</p>
              </div>

              {/* Tab grid: 4 per row, wrap */}
              <div className="grid grid-cols-3 gap-1.5">
                {config.examples!.map((group, idx) => {
                  const GIcon = group.icon;
                  const active = idx === activeTab;
                  return (
                    <button
                      key={group.category}
                      onClick={() => setActiveTab(idx)}
                      className="flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium transition-base active:scale-95"
                      style={
                        active
                          ? {
                              background: `hsl(${config.color} / 0.15)`,
                              color: `hsl(${config.color})`,
                            }
                          : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }
                      }
                    >
                      <GIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{group.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active tab content */}
              {activeGroup && (
                <div key={activeTab} className="mt-4 space-y-2 animate-fade-in-up">
                  {activeGroup.hint && (
                    <p className="text-xs text-muted-foreground">{activeGroup.hint}</p>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {activeGroup.items.map((item) =>
                      isDeptMode ? (
                        <button
                          key={item}
                          onClick={() => setDeptQuery(item)}
                          className="text-left text-sm text-foreground/85 leading-relaxed before:content-['例·'] before:mr-1 before:text-xs before:text-muted-foreground hover:text-primary transition-base"
                        >
                          {item}
                        </button>
                      ) : (
                        <p
                          key={item}
                          className="text-sm text-foreground/85 leading-relaxed before:content-['例·'] before:mr-1 before:text-xs before:text-muted-foreground"
                        >
                          {item}
                        </p>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {config.intro && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                <span>{config.intro}</span>
                <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
              </div>
            )}

            {/* Dept search results */}
            {isDeptMode && deptResults !== null && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-muted-foreground px-1">
                  「{lastQuery}」{deptResults.length > 0 ? ` · 共 ${deptResults.length} 个部门` : ""}
                </p>
                {deptResults.length === 0 ? (
                  <div className="rounded-2xl bg-card p-6 shadow-soft text-center">
                    <p className="text-sm text-muted-foreground">
                      没有找到匹配的部门，请换个关键词试试
                    </p>
                  </div>
                ) : (
                  deptResults.map((dept) => (
                    <DeptResultCard
                      key={dept.id}
                      dept={dept}
                      sections={deptSections}
                      onOpen={() => navigate(`/colleagues/dept/${dept.id}`)}
                      onOpenEmployee={(id) => navigate(`/colleagues/employee/${id}`)}
                    />
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          /* Info collection prompts (form mode) */
          <div className="rounded-2xl bg-card shadow-soft p-4 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">请提供以下信息</p>
            </div>
            <p className="text-xs text-muted-foreground">填写越详细，匹配结果越精准</p>

            {config.prompts.map((prompt, i) => (
              <div key={i} className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{prompt.label}</label>
                <input
                  type="text"
                  placeholder={prompt.placeholder}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-base"
                />
              </div>
            ))}

            <button
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground shadow-md transition-bounce active:scale-[0.98]"
              style={{ background: `hsl(${config.color})` }}
            >
              <Icon className="h-4 w-4" />
              开始匹配
            </button>
          </div>
        )}
      </main>

      {isDeptMode ? (
        <ChatInputBar
          value={deptQuery}
          onChange={setDeptQuery}
          onSubmit={handleDeptSubmit}
          placeholder="如：技术部的负责人和职能"
        />
      ) : (
        <ChatInputBar />
      )}
    </div>
  );
};

export default CapabilityDetail;

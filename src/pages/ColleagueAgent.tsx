import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Users, Building2, Briefcase, Lightbulb, FolderKanban, Sparkles, ArrowUp, Bot, Settings, ChevronRight, Mic, Plus, Image as ImageIcon, RefreshCw, MessageSquare, Phone, User, Shield, Wrench, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import BottomTabBar from "@/components/agent/BottomTabBar";
import { smartSearch, employeesFull, type EmployeeFull, type DeptFull, type SmartSearchResult } from "@/data/colleagueData";

// ── Types ──
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: SmartSearchResult;
};

// ── Stats ──
const stats = [
  { icon: Users, value: "2,186", label: "员工总数", color: "210 90% 60%" },
  { icon: Building2, value: "45", label: "部门数", color: "160 70% 45%" },
  { icon: Briefcase, value: "128", label: "岗位类型", color: "270 70% 62%" },
  { icon: FolderKanban, value: "36", label: "活跃项目", color: "350 85% 62%" },
];

// ── Core capabilities ──
const capabilities = [
  { key: "employee", label: "直达员工", desc: "按姓名模糊搜索，快速定位同事", icon: Users, color: "210 90% 60%" },
  { key: "dept", label: "了解部门", desc: "浏览组织架构，查看部门详情", icon: Building2, color: "160 70% 45%" },
  { key: "role", label: "按岗位/技能匹配", desc: "根据岗位职能查找对应员工", icon: Briefcase, color: "270 70% 62%" },
  { key: "need", label: "按需求/项目匹配", desc: "描述业务需求，AI匹配合适人选", icon: Lightbulb, color: "45 95% 55%" },
  { key: "problem", label: "解决问题和故障", desc: "快速找到能解决特定问题的专家", icon: Wrench, color: "350 85% 62%" },
  { key: "backup", label: "备选人员匹配", desc: "为关键岗位匹配备选候选人", icon: UserCheck, color: "25 95% 60%" },
];

// ── Suggestion tabs ──
const suggestions = [
  "EXP 智能体平台的成员有哪些？",
  "谁能做性能优化？",
  "有没有懂微服务的后端？",
];

let msgCounter = 0;
const nextId = () => `msg-${++msgCounter}`;

const ColleagueAgent = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // kept for compatibility
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput("");

    const userMsg: ChatMessage = { id: nextId(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const result = smartSearch(q);
      const aiMsg: ChatMessage = {
        id: nextId(),
        role: "assistant",
        content: result.summary,
        result,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmpClick = (id: string, allEmployeeIds?: string[]) => navigate(`/colleagues/employee/${id}`, { state: { employeeIds: allEmployeeIds } });
  const handleDeptClick = (id: string) => navigate(`/colleagues/dept/${id}`);

  

  return (
    <>
      <h1 className="sr-only">找同事 - AI 智能同事查找</h1>
      <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-background/85 px-4 pb-2 pt-3 backdrop-blur-lg">
          <button
            aria-label="返回"
            onClick={goBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground transition-base active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-base font-semibold text-foreground">找同事</p>
          <button
            aria-label="设置"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground transition-base active:scale-95"
          >
            <Settings className="h-5 w-5" />
          </button>
        </header>

        {/* Content area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-3 scrollbar-hide">
          {!hasMessages ? (
            <div className="animate-fade-in-up px-4">
              {/* Banner card */}
              <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-medium text-primary-foreground/80">AI 找同事助手</span>
                </div>
                <h2 className="text-lg font-bold text-primary-foreground leading-tight mb-1">
                  智能连接每一位同事
                </h2>
                <p className="text-xs text-primary-foreground/70 leading-relaxed">
                  通过姓名、技能、需求、项目等多维度智能匹配，快速找到合适的同事与部门。
                </p>
              </div>


              {/* Core capabilities */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">核心能力</p>
                  <p className="text-[11px] text-muted-foreground">点击进入设置 / 查询</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {capabilities.map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.key}
                        onClick={() => navigate(`/colleagues/capability/${c.key}`)}
                        className="flex items-start gap-2.5 rounded-xl bg-card p-3 shadow-soft text-left transition-base active:scale-[0.98]"
                      >
                        <div
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `hsl(${c.color} / 0.12)` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: `hsl(${c.color})` }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{c.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{c.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Suggestion section — no tabs */}
              <div className="rounded-2xl bg-card shadow-soft overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      找同事 · 试试这样问
                    </span>
                  </div>
                  <button className="text-muted-foreground active:opacity-70">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="px-1 pb-1">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-base active:bg-secondary/50 rounded-lg"
                    >
                      <span className="text-sm text-primary">{s}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── Chat messages ── */
            <div className="space-y-4 px-4 pt-2">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <UserBubble key={msg.id} text={msg.content} />
                ) : (
                  <AiBubble
                    key={msg.id}
                    msg={msg}
                    onEmpClick={handleEmpClick}
                    onDeptClick={handleDeptClick}
                  />
                )
              )}
              {isTyping && <TypingIndicator />}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-3 pb-2 pt-1">
          <div className="flex items-end gap-2 rounded-3xl bg-secondary/60 p-2 shadow-soft backdrop-blur">
            <button
              aria-label="添加"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-base active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问我任何工作相关的问题…"
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {input.trim() ? (
              <button
                onClick={() => handleSend()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-bounce active:scale-90"
              >
                <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
              </button>
            ) : (
              <>
                <button
                  aria-label="图片"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-base active:scale-95"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button
                  aria-label="语音"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-base active:scale-95"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <BottomTabBar />
      </div>
    </>
  );
};

// ── Sub-components ──

const UserBubble = ({ text }: { text: string }) => (
  <div className="flex justify-end">
    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-soft">
      {text}
    </div>
  </div>
);

const AiBubble = ({
  msg,
  onEmpClick,
  onDeptClick,
}: {
  msg: ChatMessage;
  onEmpClick: (id: string, allEmployeeIds?: string[]) => void;
  onDeptClick: (id: string) => void;
}) => {
  const { result } = msg;
  const empCount = result?.employees.length ?? 0;
  const deptCount = result?.departments.length ?? 0;
  // Hide dept cards when employees all belong to a single dept (e.g. searching "算法")
  const uniqueEmpDepts = result ? new Set(result.employees.map(e => e.deptId)) : new Set();
  const showDepts = empCount === 0 || uniqueEmpDepts.size >= 2;

  return (
    <div className="flex gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="min-w-0 max-w-[90%] space-y-2">
        <div className="rounded-2xl rounded-tl-md bg-card px-4 py-2.5 text-sm text-foreground shadow-soft">
          {msg.content}
        </div>

        {/* Employee results — adaptive layout */}
        {result && empCount === 1 && (
          <HeroEmpCard emp={result.employees[0]} onClick={() => onEmpClick(result.employees[0].id, result.employees.map(e => e.id))} />
        )}
        {result && empCount >= 2 && (() => {
          const uniqueDepts = new Set(result.employees.map(e => e.deptId));
          const uniquePositions = new Set(result.employees.map(e => e.position));
          return uniqueDepts.size >= 2 && uniquePositions.size >= 2;
        })() && (
          <GroupedEmpCards
            employees={result.employees}
            onEmpClick={(id) => onEmpClick(id, result.employees.map(e => e.id))}
          />
        )}
        {result && empCount >= 2 && (() => {
          const uniqueDepts = new Set(result.employees.map(e => e.deptId));
          const uniquePositions = new Set(result.employees.map(e => e.position));
          return !(uniqueDepts.size >= 2 && uniquePositions.size >= 2);
        })() && (
          <div className="space-y-1.5">
            <p className="pl-1 text-[11px] font-medium text-muted-foreground">
              找到 {empCount} 位同事{empCount > 3 ? `，显示前 3 位` : ""}
            </p>
            <OverlapEmpCards
              employees={result.employees.slice(0, 3)}
              onEmpClick={(id) => onEmpClick(id, result.employees.map(e => e.id))}
            />
          </div>
        )}

        {/* Department results — adaptive layout (hide when employee-only intent) */}
        {result && showDepts && deptCount === 1 && (
          <HeroDeptCard dept={result.departments[0]} onClick={() => onDeptClick(result.departments[0].id)} />
        )}
        {result && showDepts && deptCount === 2 && (
          <div className="space-y-1.5">
            <p className="pl-1 text-[11px] font-medium text-muted-foreground">找到 {deptCount} 个部门</p>
            <div className="flex items-center justify-center gap-3 py-2">
              {result.departments.slice(0, 2).map((dept) => (
                <ScrollDeptCard key={dept.id} dept={dept} onClick={() => onDeptClick(dept.id)} />
              ))}
            </div>
          </div>
        )}
        {result && showDepts && deptCount >= 3 && (
          <div className="space-y-1.5">
            <p className="pl-1 text-[11px] font-medium text-muted-foreground">
              找到 {deptCount} 个部门{deptCount > 3 ? "，显示前 3 个" : ""}
            </p>
            <div className="flex items-center justify-center -space-x-6 py-2">
              <div className="z-0">
                <ScrollDeptCard dept={result.departments[0]} onClick={() => onDeptClick(result.departments[0].id)} />
              </div>
              <div className="z-20 relative scale-[1.08]">
                <ScrollDeptCard dept={result.departments[1]} onClick={() => onDeptClick(result.departments[1].id)} />
              </div>
              <div className="z-0">
                <ScrollDeptCard dept={result.departments[2]} onClick={() => onDeptClick(result.departments[2].id)} />
              </div>
            </div>
          </div>
        )}

        {result && showDepts && result.recommendation && (
          <div className="flex items-start gap-1.5 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-xs text-foreground/80 leading-relaxed">{result.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Hero Employee Card (single result) ── */
const HeroEmpCard = ({ emp, onClick }: { emp: EmployeeFull; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full overflow-hidden rounded-2xl bg-card shadow-soft text-left transition-base active:scale-[0.98]"
  >
    {/* Gradient header */}
    <div
      className="relative flex items-end gap-3 px-4 pb-3 pt-5"
      style={{ background: `linear-gradient(135deg, hsl(${emp.avatarColor}), hsl(${emp.avatarColor} / 0.6))` }}
    >
      {/* Role badges */}
      {(emp.isManager || emp.isOnDuty) && (
        <div className="absolute right-3 top-2 flex gap-1.5">
          {emp.isManager && (
            <span className="flex items-center gap-1 rounded-full bg-white/25 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
              <Shield className="h-3 w-3" />管理者
            </span>
          )}
          {emp.isOnDuty && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400/30 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />值班中
            </span>
          )}
        </div>
      )}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/25 text-lg font-bold text-white shadow-lg backdrop-blur-sm">
        {emp.name[0]}
      </div>
      <div className="min-w-0 pb-0.5">
        <p className="text-base font-bold text-white">{emp.name}</p>
        <p className="text-xs text-white/80">{emp.position}</p>
      </div>
    </div>
    {/* Info body */}
    <div className="px-4 py-3 space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{emp.deptName}</span>
        {emp.skills.slice(0, 3).map((s) => (
          <span key={s} className="rounded-full bg-accent/80 px-2 py-0.5 text-[10px] text-accent-foreground">{s}</span>
        ))}
      </div>
      {/* Quick actions */}
      <div className="flex gap-2">
        <div className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">发消息</span>
        </div>
        <div className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-primary/10 text-primary">
          <Phone className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">打电话</span>
        </div>
        <div className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-primary/10 text-primary">
          <User className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">主页</span>
        </div>
      </div>
    </div>
  </button>
);

/* ── Overlap Employee Cards (2-3 cards, center card elevated & overlapping) ── */
const OverlapEmpCards = ({
  employees,
  onEmpClick,
}: {
  employees: EmployeeFull[];
  onEmpClick: (id: string) => void;
}) => {
  const count = employees.length;
  return (
    <div className="flex items-center justify-center py-2">
      {count === 2 ? (
        <div className="flex items-center gap-3">
          <ScrollEmpCard emp={employees[0]} onClick={() => onEmpClick(employees[0].id)} />
          <ScrollEmpCard emp={employees[1]} onClick={() => onEmpClick(employees[1].id)} />
        </div>
      ) : (
        /* 3 cards: center slightly larger, all vertically centered */
        <div className="flex items-center -space-x-6">
          <div className="z-0">
            <ScrollEmpCard emp={employees[0]} onClick={() => onEmpClick(employees[0].id)} />
          </div>
          <div className="z-20 relative scale-[1.08]">
            <ScrollEmpCard emp={employees[1]} onClick={() => onEmpClick(employees[1].id)} />
          </div>
          <div className="z-0">
            <ScrollEmpCard emp={employees[2]} onClick={() => onEmpClick(employees[2].id)} />
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Position color mapping ── */
const getPositionColor = (position: string): string => {
  const p = position.toLowerCase();
  if (/前端|后端|运维|工程师|架构/.test(p)) return "210 90% 60%";
  if (/ai|算法|机器学习/.test(p)) return "160 70% 45%";
  if (/产品/.test(p)) return "270 70% 62%";
  if (/设计|ux|ui|交互/.test(p)) return "45 95% 55%";
  if (/销售|bd|客户|大客户/.test(p)) return "350 85% 62%";
  if (/测试|qa/.test(p)) return "180 60% 50%";
  if (/人力|hr|行政|财务/.test(p)) return "25 95% 60%";
  return "220 10% 60%";
};

/* ── Grouped Employee Cards (by position) ── */
const GroupedEmpCards = ({
  employees,
  onEmpClick,
}: {
  employees: EmployeeFull[];
  onEmpClick: (id: string) => void;
}) => {
  const groups: Record<string, EmployeeFull[]> = {};
  employees.forEach((emp) => {
    if (!groups[emp.position]) groups[emp.position] = [];
    groups[emp.position].push(emp);
  });

  // Pick one group each with 1, 2, 3 people for display variety
  const allEntries = Object.entries(groups);
  const pick1 = allEntries.find(([, e]) => e.length === 1);
  const pick2 = allEntries.find(([, e]) => e.length === 2);
  const pick3 = allEntries.find(([, e]) => e.length === 3);
  const displayGroups = [pick1, pick2, pick3].filter(Boolean) as [string, EmployeeFull[]][];
  // Fallback: if we can't find all 3 sizes, fill from remaining
  if (displayGroups.length < 3) {
    const usedPositions = new Set(displayGroups.map(([p]) => p));
    for (const entry of allEntries) {
      if (displayGroups.length >= 3) break;
      if (!usedPositions.has(entry[0])) displayGroups.push(entry);
    }
  }

  return (
    <div className="space-y-2">
      <p className="pl-1 text-[11px] font-medium text-muted-foreground">
        找到 {employees.length} 位同事，按岗位分组
      </p>
      {displayGroups.map(([position, emps]) => {
        const color = getPositionColor(position);
        return (
          <div key={position} className="rounded-xl bg-card shadow-soft overflow-hidden">
            {/* Position header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
              <span
                className="h-5 w-1.5 rounded-full"
                style={{ background: `hsl(${color})` }}
              />
              <span className="text-xs font-semibold text-foreground">{position}</span>
              <span className="ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-secondary">
                {emps.length}人
              </span>
            </div>
            {/* Employee cards row */}
            <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide">
              {emps.map((emp) => (
                <MiniEmpCard key={emp.id} emp={emp} color={color} onClick={() => onEmpClick(emp.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Mini Employee Card (for grouped display) ── */
const MiniEmpCard = ({ emp, color, onClick }: { emp: EmployeeFull; color: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex w-[120px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-base active:scale-[0.97] hover:bg-secondary/50"
  >
    <div className="relative">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
        style={{ background: `linear-gradient(135deg, hsl(${emp.avatarColor}), hsl(${emp.avatarColor} / 0.7))` }}
      >
        {emp.avatarUrl ? (
          <img src={emp.avatarUrl} alt={emp.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          emp.name[0]
        )}
      </div>
      {emp.isOnDuty && (
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-amber-400" title="值班中" />
      )}
      {emp.isOnline && (
        <span className="absolute -right-0.5 bottom-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
      )}
      {emp.isManager && (
        <span className="absolute -left-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
          <Shield className="h-2.5 w-2.5" />
        </span>
      )}
    </div>
    <div className="w-full min-w-0">
      <p className="truncate text-xs font-semibold text-foreground">{emp.name}</p>
      <p className="truncate text-[10px] text-muted-foreground">{emp.deptName}</p>
    </div>
  </button>
);

/* ── Scroll Employee Card (multi result) — wider card style ── */
const ScrollEmpCard = ({ emp, onClick }: { emp: EmployeeFull; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex w-[150px] flex-col items-center gap-2.5 rounded-2xl bg-card px-4 py-5 shadow-md text-center transition-base active:scale-[0.97]"
  >
    <div className="relative">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg ring-2 ring-white/50"
        style={{ background: `linear-gradient(135deg, hsl(${emp.avatarColor}), hsl(${emp.avatarColor} / 0.7))` }}
      >
        {emp.name[0]}
      </div>
      {emp.isManager && (
        <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
          <Shield className="h-3 w-3" />
        </span>
      )}
      {emp.isOnDuty && (
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-amber-400 shadow-sm" title="值班中" />
      )}
      {emp.isOnline && (
        <span className="absolute -right-0.5 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 shadow-sm" />
      )}
    </div>
    <div className="w-full min-w-0">
      <p className="truncate text-sm font-semibold text-foreground">{emp.name}</p>
      <p className="truncate text-[11px] text-muted-foreground mt-0.5">{emp.position}</p>
    </div>
    <div className="flex h-8 w-full items-center justify-center rounded-full border border-border text-xs font-medium text-foreground transition-base hover:bg-secondary">
      查看详情
    </div>
  </button>
);

/* ── Hero Department Card (single result) ── */
const HeroDeptCard = ({ dept, onClick }: { dept: DeptFull; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full overflow-hidden rounded-2xl bg-card shadow-soft text-left transition-base active:scale-[0.98]"
  >
    <div className="flex items-end gap-3 bg-gradient-to-br from-emerald-500/80 to-teal-600/60 px-4 pb-3 pt-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/25 shadow-lg backdrop-blur-sm">
        <Building2 className="h-7 w-7 text-white" />
      </div>
      <div className="min-w-0 pb-0.5">
        <p className="text-base font-bold text-white">{dept.name}</p>
        <p className="text-xs text-white/80">{dept.count} 名成员</p>
      </div>
    </div>
    <div className="px-4 py-3 space-y-2">
      <p className="text-xs text-muted-foreground leading-relaxed">{dept.description}</p>
      {dept.childIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {dept.childIds.slice(0, 4).map((cid) => (
            <span key={cid} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{cid}</span>
          ))}
        </div>
      )}
      <div className="flex h-8 items-center justify-center gap-1 rounded-lg bg-primary/10 text-primary">
        <Building2 className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium">查看部门详情</span>
      </div>
    </div>
  </button>
);

/* ── Scroll Department Card (multi result) ── */
const ScrollDeptCard = ({ dept, onClick }: { dept: DeptFull; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex w-[150px] shrink-0 flex-col items-center gap-2 rounded-2xl bg-card px-4 py-4 shadow-md text-center transition-base active:scale-[0.97]"
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 shadow-sm">
      <Building2 className="h-5 w-5 text-emerald-600" />
    </div>
    <div className="w-full min-w-0">
      <p className="truncate text-sm font-semibold text-foreground">{dept.name}</p>
      <p className="truncate text-[10px] text-muted-foreground">{dept.description}</p>
    </div>
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{dept.count}人</span>
  </button>
);

const TypingIndicator = () => (
  <div className="flex gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70">
      <Bot className="h-4 w-4 text-primary-foreground" />
    </div>
    <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-card px-4 py-3 shadow-soft">
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
    </div>
  </div>
);

export default ColleagueAgent;

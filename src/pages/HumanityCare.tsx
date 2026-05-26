import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Sparkles,
  HandHeart,
  TrendingUp,
  Users,
  Bell,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { careModuleList, type CareType } from "@/data/humanityCare";
import ChatInputBar from "@/components/agent/ChatInputBar";

type Prompt = {
  text: string;
  type: CareType;
  /** action: new = 跳转新建页(可带预填); detail = 跳到模块详情页 */
  action?: "new" | "detail";
  query?: Record<string, string>;
};

const promptGroups: { title: string; prompts: Prompt[] }[] = [
  {
    title: "🎂 生日关怀",
    prompts: [
      {
        text: "为研发部下月过生日的同事创建关怀",
        type: "birthday",
        action: "new",
        query: { audience: "研发中心", trigger: "生日当天 09:00", points: "50" },
      },
      { text: "查看本月生日关怀的触达情况", type: "birthday", action: "detail" },
      {
        text: "把生日祝福改成 AI 动态生成",
        type: "birthday",
        action: "new",
        query: { template: "✨ AI 动态生成" },
      },
    ],
  },
  {
    title: "🎉 节日关怀",
    prompts: [
      {
        text: "中秋节给全员发节日礼包 + 100 积分",
        type: "festival",
        action: "new",
        query: { festival: "中秋节", audience: "全公司员工", points: "100" },
      },
      { text: "查看春节关怀的统计报表", type: "festival", action: "detail" },
      {
        text: "新增端午节关怀方案",
        type: "festival",
        action: "new",
        query: { festival: "端午节" },
      },
    ],
  },
  {
    title: "☔ 天气关怀",
    prompts: [
      {
        text: "为户外岗位创建高温预警关怀",
        type: "weather",
        action: "new",
        query: { audience: "户外岗位", trigger: "高温 ≥ 35℃" },
      },
      { text: "查看本周天气关怀触达明细", type: "weather", action: "detail" },
      {
        text: "把暴雨预警阈值调整为橙色及以上",
        type: "weather",
        action: "new",
        query: { trigger: "暴雨 / 雷暴" },
      },
    ],
  },
  {
    title: "💪 工作强度关怀",
    prompts: [
      {
        text: "为研发中心设置深夜加班慰问 + 打车券",
        type: "workload",
        action: "new",
        query: { audience: "研发中心", trigger: "凌晨 0 点后仍在线", points: "30" },
      },
      { text: "查询连续加班 ≥ 3 天的员工名单", type: "workload", action: "detail" },
      { text: "统计上月工作强度关怀的触达人次", type: "workload", action: "detail" },
    ],
  },
];

const stats = [
  { label: "已配置方案", value: "12", icon: Settings, color: "--cat-1" },
  { label: "本月触达", value: "1,684", icon: Bell, color: "--cat-7" },
  { label: "覆盖员工", value: "1,286", icon: Users, color: "--cat-3" },
  { label: "积分发放", value: "32,510", icon: TrendingUp, color: "--cat-6" },
];

const HumanityCare = () => {
  const navigate = useNavigate();
  const [promptIdx, setPromptIdx] = useState(0);

  const refreshPrompts = () => setPromptIdx((i) => (i + 1) % promptGroups.length);
  const currentGroup = promptGroups[promptIdx];

  const goModule = (type: CareType) => navigate(`/agents/humanity-care/${type}`);

  return (
    <>
      <h1 className="sr-only">人文关怀 Agent - 关怀与福利引擎</h1>
      <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/85 px-3 pb-2 pt-3 backdrop-blur-lg">
          <div className="flex items-center gap-2">
            <button
              aria-label="返回"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-base active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center text-base font-semibold text-foreground">
              人文关怀
            </div>
            <button
              aria-label="设置"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-base active:scale-95"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 space-y-4 overflow-y-auto px-3 pb-4 pt-2 scrollbar-hide">
          {/* Hero 介绍卡片 */}
          <section className="relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-glow gradient-banner">
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <HandHeart className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium opacity-90">关怀与福利引擎</span>
              </div>
              <h2 className="mt-3 text-xl font-bold leading-snug">让每一份关怀,温暖且准时</h2>
              <p className="mt-1.5 text-xs leading-relaxed opacity-90">
                自动识别生日、节日、极端天气与高强度工作场景,
                通过 IM 准时触达员工,搭配积分与福利消费引导。
              </p>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          </section>

          {/* 数据概览 */}
          <section className="grid grid-cols-4 gap-2">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center rounded-2xl bg-card p-2.5 shadow-soft"
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{
                      background: `hsl(var(${s.color}) / 0.15)`,
                      color: `hsl(var(${s.color}))`,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </div>
                  <div className="mt-1.5 text-sm font-bold text-foreground">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              );
            })}
          </section>

          {/* 核心能力 */}
          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-foreground">核心能力</h3>
              <span className="text-[11px] text-muted-foreground">点击进入设置 / 查询 / 统计</span>
            </div>
            <ul className="grid grid-cols-2 gap-2.5">
              {careModuleList.map((m) => {
                const Icon = m.icon;
                return (
                  <li key={m.key}>
                    <button
                      onClick={() => goModule(m.key)}
                      className="group flex h-full w-full items-center gap-2.5 rounded-2xl bg-card p-2.5 text-left shadow-soft transition-base active:scale-[0.98] active:shadow-glow"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, hsl(var(${m.colorVar}) / 0.22), hsl(var(${m.colorVar}) / 0.08))`,
                          color: `hsl(var(${m.colorVar}))`,
                        }}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground">{m.name}</div>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
              {/* 占位 - 员工生命周期 */}
              <li className="col-span-2">
                <div className="flex items-center justify-between rounded-2xl border border-dashed border-border bg-card/60 p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">员工生命周期关怀</div>
                      <div className="text-[11px] text-muted-foreground">入职 / 转正 / 周年 等节点 · 即将上线</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">敬请期待</span>
                </div>
              </li>
            </ul>
          </section>

          {/* 常用提示词 */}
          <section className="rounded-2xl bg-card p-4 shadow-soft">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{currentGroup.title} · 试试这样问</h3>
              </div>
              <button
                onClick={refreshPrompts}
                aria-label="换一批"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-base active:scale-90"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="space-y-1.5">
              {currentGroup.prompts.map((p) => {
                const handleClick = () => {
                  if (p.action === "detail") {
                    navigate(`/agents/humanity-care/${p.type}`);
                  } else {
                    const qs = p.query
                      ? "?" +
                        new URLSearchParams(p.query).toString()
                      : "";
                    navigate(`/agents/humanity-care/${p.type}/new${qs}`);
                  }
                };
                return (
                  <li key={p.text}>
                    <button
                      onClick={handleClick}
                      className="flex w-full items-center justify-between gap-2 rounded-xl bg-accent/60 px-3 py-2 text-left text-xs text-accent-foreground transition-base active:scale-[0.99]"
                    >
                      <span className="line-clamp-1">{p.text}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </main>

        <ChatInputBar />
      </div>
    </>
  );
};

export default HumanityCare;

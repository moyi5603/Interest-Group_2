import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Bell,
  Users,
  Sparkles,
  Edit3,
  Trash2,
  Coins,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  careModules,
  defaultStatsTimeRange,
  statsTimeRangeScale,
  summarizeStatsTimeRange,
  type CareType,
  type CareRule,
  type StatsTimeRange,
} from "@/data/humanityCare";
import {
  StatsTimeRangeBar,
  StatsTimeRangePicker,
} from "@/components/care/StatsTimeRangePicker";
import {
  useCareRules,
  deleteCareRule,
  setCareRuleEnabled,
} from "@/data/careRulesStore";


const pointLabels: Record<CareType, string> = {
  birthday: "生日慰问金",
  festival: "节日慰问金",
  weather: "关怀提示",
  workload: "辛苦补贴",
};

const CareModuleDetail = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: CareType }>();
  const moduleType: CareType = (type as CareType) ?? "birthday";
  const mod = careModules[moduleType];
  const Icon = mod.icon;

  const rules = useCareRules(moduleType);

  const totalReached = rules.reduce((acc, r) => acc + r.reached, 0);
  const totalPoints = rules.reduce((acc, r) => acc + r.points * r.reached, 0);
  const [tab, setTab] = useState<"stats" | "rules">("rules");
  const [statsRange, setStatsRange] = useState<StatsTimeRange>(defaultStatsTimeRange);
  const statsRangeSummary = summarizeStatsTimeRange(statsRange);
  const rangeScale = statsTimeRangeScale(statsRange);

  const scopedStats = useMemo(() => {
    const reached = Math.max(1, Math.round(totalReached * rangeScale));
    const points = Math.round(totalPoints * rangeScale);
    const covered = Math.max(
      1,
      Math.round(1286 * Math.min(rangeScale * 2.5, 1)),
    );
    const checkRate = (86 + (reached % 10) * 0.6).toFixed(1);
    return { reached, points, covered, checkRate };
  }, [totalReached, totalPoints, rangeScale]);

  return (
    <>
      <h1 className="sr-only">{mod.name} - 人文关怀</h1>
      <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
        <header
          className="sticky top-0 z-30 px-3 pb-3 pt-3 text-primary-foreground"
          style={{
            background: `linear-gradient(135deg, hsl(var(${mod.colorVar})), hsl(var(${mod.colorVar}) / 0.7))`,
          }}
        >
          <div className="flex items-center gap-2">
            <button
              aria-label="返回"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-base active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-semibold leading-tight">{mod.name}</div>
                <div className="truncate text-[11px] opacity-90">{mod.desc}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3 scrollbar-hide">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "stats" | "rules")} className="w-full">
            <TabsList className="grid h-10 w-full grid-cols-2 rounded-full bg-muted p-1">
              <TabsTrigger value="rules" className="rounded-full text-xs data-[state=active]:shadow-soft">
                我的方案
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-full text-xs data-[state=active]:shadow-soft">
                数据统计
              </TabsTrigger>
            </TabsList>

            {/* 数据统计 Tab */}
            <TabsContent value="stats" className="mt-3 space-y-4">
              <StatsTimeRangePicker
                value={statsRange}
                onChange={setStatsRange}
                trigger={<StatsTimeRangeBar summary={statsRangeSummary} />}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <StatCard icon={Bell} label="累计触达" value={scopedStats.reached.toLocaleString()} colorVar={mod.colorVar} />
                <StatCard icon={Users} label="覆盖员工" value={scopedStats.covered.toLocaleString()} colorVar="--cat-3" />
                <StatCard icon={CheckCircle2} label="查收率" value={`${scopedStats.checkRate}%`} colorVar="--cat-1" />
                <StatCard icon={Coins} label={moduleType === "weather" ? "提醒次数" : `${pointLabels[moduleType]}发放`} value={moduleType === "weather" ? scopedStats.reached.toString() : scopedStats.points.toLocaleString()} colorVar="--cat-6" />
              </div>

              {/* 触达趋势图(柱状) */}
              <TrendChart colorVar={mod.colorVar} range={statsRange} />

              {/* 查收漏斗 */}
              <FunnelCard colorVar={mod.colorVar} reached={scopedStats.reached} />

              {rules.length > 0 && (
                <section className="rounded-2xl bg-card p-4 shadow-soft">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">最近触达记录</h3>
                  <ul className="space-y-2.5">
                    {rules.flatMap((r) =>
                      [1, 2, 3].map((i) => (
                        <li
                          key={`${r.id}-${i}`}
                          className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5 last:border-0 last:pb-0"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium text-foreground">{r.name}</div>
                            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {r.audience} · 已触达 {Math.floor(r.reached / i)} 人
                            </div>
                          </div>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {i} 小时前
                          </span>
                        </li>
                      )),
                    )}
                  </ul>
                </section>
              )}

            </TabsContent>

            {/* 我的方案 Tab */}
            <TabsContent value="rules" className="mt-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">方案列表</h2>
                <button
                  onClick={() => navigate(`/agents/humanity-care/${moduleType}/new`)}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow transition-base active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, hsl(var(${mod.colorVar})), hsl(var(${mod.colorVar}) / 0.75))`,
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> 新建方案
                </button>
              </div>
              {rules.length === 0 ? (
                <EmptyState onCreate={() => navigate(`/agents/humanity-care/${moduleType}/new`)} />
              ) : (
                <ul className="space-y-3">
                  {rules.map((r) => (
                    <RuleCard
                      key={r.id}
                      rule={r}
                      moduleType={moduleType}
                      enabled={r.enabled}
                      onToggle={(next) => {
                        setCareRuleEnabled(r.id, next);
                        toast.success(next ? `已启用「${r.name}」` : `已停用「${r.name}」`);
                      }}
                      onEdit={() =>
                        navigate(`/agents/humanity-care/${moduleType}/new?ruleId=${r.id}`)
                      }
                      onDelete={() => {
                        deleteCareRule(r.id);
                        toast.success(`已删除「${r.name}」`);
                      }}
                    />
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

/* ---------- subcomponents ---------- */

const RuleCard = ({
  rule,
  moduleType,
  enabled,
  onToggle,
  onEdit,
  onDelete,
}: {
  rule: CareRule;
  moduleType: CareType;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mod = careModules[moduleType];
  const Icon = mod.icon;
  // 演示用查收率
  const checkRate = (85 + (rule.reached % 12)).toFixed(1);

  return (
    <li
      className={`rounded-2xl bg-card p-3.5 shadow-soft transition-base active:scale-[0.99] ${
        enabled ? "" : "opacity-75"
      }`}
      onClick={onEdit}
      role="button"
    >
      {/* 头部:图标 + 标题 + 右上角开关 */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-soft"
          style={{
            background: enabled
              ? `linear-gradient(135deg, hsl(var(${mod.colorVar})), hsl(var(${mod.colorVar}) / 0.75))`
              : `hsl(var(--muted))`,
            color: enabled ? "white" : `hsl(var(--muted-foreground))`,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  enabled ? "bg-emerald-500" : "bg-muted-foreground/40"
                }`}
              />
              <h4
                className={`truncate text-sm font-semibold ${
                  enabled ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {rule.name}
              </h4>
            </div>
            <label
              className="flex shrink-0 cursor-pointer items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                checked={enabled}
                onCheckedChange={onToggle}
                aria-label={enabled ? "停用方案" : "启用方案"}
              />
              <span
                className={`text-[11px] font-medium ${
                  enabled
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {enabled ? "已启用" : "已停用"}
              </span>
            </label>
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="truncate max-w-[55%]">{rule.audience}</span>
            <span className="shrink-0">· {rule.triggerTime}</span>
          </p>
        </div>
      </div>

      {/* 数据三宫格 */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {rule.points > 0 ? (
          <div
            className="rounded-lg p-2 text-center"
            style={{ backgroundColor: `hsl(var(${mod.colorVar}) / 0.1)` }}
          >
            <div
              className="text-[10px] truncate"
              style={{ color: `hsl(var(${mod.colorVar}))` }}
            >
              {pointLabels[moduleType]}
            </div>
            <div
              className="mt-0.5 text-sm font-bold"
              style={{ color: `hsl(var(${mod.colorVar}))` }}
            >
              +{rule.points}
              <span className="ml-0.5 text-[10px] font-normal">积分</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-secondary p-2 text-center">
            <div className="text-[10px] text-muted-foreground">类型</div>
            <div className="mt-0.5 text-sm font-bold text-foreground">仅提醒</div>
          </div>
        )}
        <div className="rounded-lg bg-secondary/60 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">已触达</div>
          <div className="mt-0.5 text-sm font-bold text-foreground">
            {rule.reached.toLocaleString()}
            <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
              人次
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-secondary/60 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">查收率</div>
          <div className="mt-0.5 text-sm font-bold text-foreground">
            {checkRate}
            <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      {/* 底部操作栏:左触达徽章 + 右编辑/删除 */}
      <div
        className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {enabled && rule.reached > 0 ? (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium"
            style={{ color: `hsl(var(${mod.colorVar}))` }}
          >
            <Sparkles className="h-3 w-3" />
            {(rule.reached % 12) + 1}h 前触达
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground/60">
            {enabled ? "暂无触达" : "已停用"}
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground transition-base hover:bg-secondary/80 active:scale-95"
          >
            <Edit3 className="h-3 w-3" /> 编辑
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive transition-base hover:bg-destructive/15 active:scale-95"
          >
            <Trash2 className="h-3 w-3" /> 删除
          </button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>删除「{rule.name}」?</AlertDialogTitle>
            <AlertDialogDescription>
              删除后该方案将立即停止触达,历史数据仍会保留,但操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
};

const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
    <Sparkles className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
    <p className="text-sm text-muted-foreground">还没有方案,新建一个开始关怀员工吧</p>
    <button
      onClick={onCreate}
      className="mt-3 flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-glow"
    >
      <Plus className="h-3.5 w-3.5" /> 立即新建
    </button>
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  colorVar,
}: {
  icon: typeof Bell;
  label: string;
  value: string;
  colorVar: string;
}) => (
  <div className="rounded-2xl bg-card p-3 shadow-soft">
    <div className="flex items-center gap-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{
          background: `hsl(var(${colorVar}) / 0.15)`,
          color: `hsl(var(${colorVar}))`,
        }}
      >
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
    <div className="mt-2 text-xl font-bold text-foreground">{value}</div>
  </div>
);

const trendDemoByPreset: Record<
  StatsTimeRange["preset"],
  { labels: string[]; data: number[] }
> = {
  "7d": {
    labels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    data: [42, 56, 38, 71, 84, 95, 63],
  },
  "30d": {
    labels: ["第1周", "第2周", "第3周", "第4周", "第5周"],
    data: [198, 224, 186, 251, 217],
  },
  month: {
    labels: ["第1周", "第2周", "第3周", "第4周"],
    data: [156, 189, 172, 203],
  },
  year: {
    labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
    data: [320, 285, 410, 398, 452, 380],
  },
  custom: {
    labels: ["区间1", "区间2", "区间3", "区间4", "区间5", "区间6", "区间7"],
    data: [35, 48, 52, 44, 61, 58, 49],
  },
};

/** 触达趋势 - 简易柱状图 */
const TrendChart = ({
  colorVar,
  range,
}: {
  colorVar: string;
  range: StatsTimeRange;
}) => {
  const chart = trendDemoByPreset[range.preset];
  const { labels, data } = chart;
  const max = Math.max(...data);
  return (
    <section className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">触达趋势</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">总计 {data.reduce((a, b) => a + b)}</span>
      </div>
      <div className="flex h-28 items-end justify-between gap-1.5">
        {data.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="text-[9px] font-semibold text-foreground">{v}</div>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(v / max) * 80}%`,
                background: `linear-gradient(180deg, hsl(var(${colorVar})), hsl(var(${colorVar}) / 0.5))`,
              }}
            />
            <div className="text-[9px] text-muted-foreground">{labels[i]}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/** 查收漏斗 */
const FunnelCard = ({ colorVar, reached }: { colorVar: string; reached: number }) => {
  const opened = Math.round(reached * 0.92);
  const claimed = Math.round(reached * 0.78);
  const items = [
    { label: "已推送", value: reached, pct: 100 },
    { label: "已打开", value: opened, pct: Math.round((opened / Math.max(reached, 1)) * 100) },
    { label: "已查收", value: claimed, pct: Math.round((claimed / Math.max(reached, 1)) * 100) },
  ];
  return (
    <section className="rounded-2xl bg-card p-4 shadow-soft">
      <h3 className="mb-3 text-sm font-semibold text-foreground">查收漏斗</h3>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.label}>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{it.label}</span>
              <span className="font-semibold text-foreground">
                {it.value.toLocaleString()} <span className="text-muted-foreground">({it.pct}%)</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${it.pct}%`,
                  background: `linear-gradient(90deg, hsl(var(${colorVar})), hsl(var(${colorVar}) / 0.6))`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CareModuleDetail;

import React, { useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Edit3,
  Users,
  Clock,
  Heart,
  Coins,
  CalendarDays,
  Eye,
  X,
} from "lucide-react";
import {
  AudiencePicker,
  emptyAudience,
  summarize as summarizeAudience,
  type AudienceSelection,
} from "@/components/care/AudiencePicker";
import {
  careModules,
  type CareType,
  type CareRule,
  type CareRuleFormData,
  defaultWorkloadTrigger,
  summarizeWorkload,
  type WorkloadTriggerState,
  defaultWeatherTrigger,
  summarizeWeather,
  summarizeWeatherContent,
  truncateCarePreviewText,
  countWeatherContentReady,
  firstWeatherPreviewScenario,
  firstWeatherPreviewContent,
  weatherTriggerCategories,
  type WeatherContentMap,
  type WeatherTriggerState,
  AI_CARE_CONTENT_MARKER,
  aiCareContentVariants,
  isAiCareTemplate,
  normalizeWeatherContentEntry,
  resolveWeatherContent,
} from "@/data/humanityCare";
import { Textarea } from "@/components/ui/textarea";
import { getCareRule, upsertCareRule } from "@/data/careRulesStore";
import { WorkloadTriggerEditor } from "@/components/care/WorkloadTriggerEditor";
import { WeatherTriggerEditor } from "@/components/care/WeatherTriggerEditor";
import { WeatherCareContentSheetEditor } from "@/components/care/WeatherCareContentSheetEditor";
import { CareContentAiPanel } from "@/components/care/CareContentAiPanel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CareReceiveSimulator } from "@/components/care/CareReceiveSimulator";

// 不同关怀类型的积分名称(慰问 vs 奖励)
const pointLabels: Record<CareType, { name: string; hint: string }> = {
  birthday: { name: "生日慰问金", hint: "员工查收后自动入账" },
  festival: { name: "节日慰问金", hint: "员工查收后自动入账" },
  weather: { name: "关怀提示", hint: "天气提醒不发放积分" },
  workload: { name: "辛苦补贴", hint: "员工查收后自动入账" },
};

const triggerLabels: Record<CareType, string> = {
  birthday: "触达时间",
  festival: "触达时间",
  weather: "触发条件",
  workload: "触发条件",
};

// 节日列表 (按一年内时间顺序排列, 分中国 / 西方两组)
type FestivalOpt = { name: string; date: string; group: "cn" | "west" };
const festivalOptions: FestivalOpt[] = [
  { name: "元旦", date: "1/1", group: "cn" },
  { name: "春节", date: "农历正月初一", group: "cn" },
  { name: "元宵节", date: "农历正月十五", group: "cn" },
  { name: "情人节", date: "2/14", group: "west" },
  { name: "妇女节", date: "3/8", group: "cn" },
  { name: "清明节", date: "约 4/4～4/6", group: "cn" },
  { name: "劳动节", date: "5/1", group: "cn" },
  { name: "母亲节", date: "5 月第二个周日", group: "west" },
  { name: "端午节", date: "农历五月初五", group: "cn" },
  { name: "父亲节", date: "6 月第三个周日", group: "west" },
  { name: "建党节", date: "7/1", group: "cn" },
  { name: "建军节", date: "8/1", group: "cn" },
  { name: "七夕节", date: "农历七月初七", group: "cn" },
  { name: "中元节", date: "农历七月十五", group: "cn" },
  { name: "教师节", date: "9/10", group: "cn" },
  { name: "中秋节", date: "农历八月十五", group: "cn" },
  { name: "国庆节", date: "10/1", group: "cn" },
  { name: "重阳节", date: "农历九月初九", group: "cn" },
  { name: "万圣节", date: "10/31", group: "west" },
  { name: "感恩节", date: "11 月第四个周四", group: "west" },
  { name: "平安夜", date: "12/24", group: "west" },
  { name: "圣诞节", date: "12/25", group: "west" },
  { name: "跨年夜", date: "12/31", group: "west" },
];
const festivalNames = festivalOptions.map((f) => f.name);
const cnFestivalNames = festivalOptions.filter((f) => f.group === "cn").map((f) => f.name);
const westFestivalNames = festivalOptions.filter((f) => f.group === "west").map((f) => f.name);
const getFestivalDate = (name: string) =>
  festivalOptions.find((f) => f.name === name)?.date ?? "";
const getFestivalGroup = (name: string) =>
  festivalOptions.find((f) => f.name === name)?.group ?? "cn";

// 节日触达时间点
const festivalTriggerOptions = [
  "节日前 1 天 18:00",
  "节日当天 09:00",
  "节日当天 18:00",
];

const CareCreateRule = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: CareType }>();
  const [searchParams] = useSearchParams();
  const ruleId = searchParams.get("ruleId");
  const moduleType: CareType = (type as CareType) ?? "birthday";
  const mod = careModules[moduleType];
  const pointInfo = pointLabels[moduleType];
  const hasPoints = moduleType !== "weather";
  const existingRule = ruleId ? getCareRule(ruleId) : undefined;
  const isEdit = Boolean(existingRule);

  // 从 query 预填(由首页提示词联动)
  const prefill = useMemo(
    () => ({
      audience: searchParams.get("audience"),
      trigger: searchParams.get("trigger"),
      template: searchParams.get("template"),
      points: searchParams.get("points"),
      festival: searchParams.get("festival"),
    }),
    [searchParams],
  );

  const [audience, setAudience] = useState<AudienceSelection>(() => {
    if (existingRule?.formData?.audience) return existingRule.formData.audience;
    if (prefill.audience)
      return { ...emptyAudience, all: false, tags: [prefill.audience] };
    return emptyAudience;
  });
  const [festival, setFestival] = useState(
    () =>
      existingRule?.formData?.festival ??
      prefill.festival ??
      festivalNames[0],
  );
  const [trigger, setTrigger] = useState(
    () =>
      existingRule?.formData?.trigger ??
      prefill.trigger ??
      (moduleType === "festival"
        ? festivalTriggerOptions[0]
        : mod.triggers[0]),
  );
  const [template, setTemplate] = useState(() => {
    const t = existingRule?.template ?? prefill.template;
    if (t && !isAiCareTemplate(t)) return t;
    return AI_CARE_CONTENT_MARKER;
  });
  const [customContent, setCustomContent] = useState(() => {
    if (existingRule?.formData?.customContent?.trim()) {
      return existingRule.formData.customContent;
    }
    const t = existingRule?.template;
    if (t && !isAiCareTemplate(t)) return t;
    return "";
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [points, setPoints] = useState<number>(() => {
    if (existingRule) return existingRule.points;
    return hasPoints ? (prefill.points ? Number(prefill.points) : 50) : 0;
  });
  const [workloadTrigger, setWorkloadTrigger] = useState<WorkloadTriggerState>(
    () =>
      existingRule?.formData?.workloadTrigger ?? defaultWorkloadTrigger,
  );
  const workloadSummary = summarizeWorkload(workloadTrigger);
  const [weatherTrigger, setWeatherTrigger] = useState<WeatherTriggerState>(
    () => existingRule?.formData?.weatherTrigger ?? defaultWeatherTrigger,
  );
  const [weatherContents, setWeatherContents] = useState<WeatherContentMap>(() => {
    const raw = existingRule?.formData?.weatherContents;
    if (raw) {
      const migrated: WeatherContentMap = {};
      for (const cat of weatherTriggerCategories) {
        const entry = normalizeWeatherContentEntry(raw[cat.key]);
        if (entry) migrated[cat.key] = entry;
      }
      if (Object.keys(migrated).length > 0) return migrated;
    }
    if (existingRule?.type === "weather") {
      const legacy =
        existingRule.formData?.customContent?.trim() || existingRule.template;
      if (legacy && !isAiCareTemplate(legacy)) {
        return { extremeHeat: { selected: legacy } };
      }
    }
    return {};
  });
  const weatherSummary = summarizeWeather(weatherTrigger);
  const weatherContentSummary = summarizeWeatherContent(weatherTrigger, weatherContents);
  const weatherContentReadyCount = countWeatherContentReady(weatherTrigger, weatherContents);
  const audienceSummary = summarizeAudience(audience);
  const audienceRuleSummary = audience.tags.length
    ? audience.tags.join(" · ")
    : "无附加规则条件";

  // 内容编辑 & 积分编辑的 sheet 草稿
  const [contentOpen, setContentOpen] = useState(false);
  const [contentDraft, setContentDraft] = useState(customContent);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [pointsDraft, setPointsDraft] = useState(points);

  // 方案名称(可编辑)
  const [schemeName, setSchemeName] = useState(
    () => existingRule?.name ?? `新建${mod.name}方案`,
  );
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(schemeName);
  const openName = () => {
    setNameDraft(schemeName);
    setNameOpen(true);
  };
  const confirmName = () => {
    const v = nameDraft.trim();
    if (v) setSchemeName(v);
    setNameOpen(false);
  };

  const openContent = () => {
    setContentDraft(customContent);
    setContentOpen(true);
  };
  const handleAiContentSelect = (text: string) => {
    setContentDraft(text);
  };
  const confirmContent = () => {
    const final = contentDraft.trim();
    if (!final) {
      toast.error("请选择一条 AI 生成的关怀文案，或填写自定义内容");
      return;
    }
    setTemplate(AI_CARE_CONTENT_MARKER);
    setCustomContent(final);
    setContentOpen(false);
  };
  const openPoints = () => {
    setPointsDraft(points);
    setPointsOpen(true);
  };
  const confirmPoints = () => {
    setPoints(pointsDraft);
    setPointsOpen(false);
  };

  const buildTriggerTime = () => {
    if (moduleType === "workload") return summarizeWorkload(workloadTrigger).text;
    if (moduleType === "weather") return summarizeWeather(weatherTrigger).text;
    if (moduleType === "festival") return `${festival} · ${trigger}`;
    return trigger;
  };

  const handleSave = () => {
    if (moduleType !== "weather" && !customContent.trim()) {
      toast.error("请选择一条 AI 生成的关怀文案");
      return;
    }

    if (moduleType === "weather") {
      const enabled = weatherTriggerCategories.filter((c) => weatherTrigger.enabled[c.key]);
      if (enabled.length === 0) {
        toast.error("请至少启用一种极端天气触发条件");
        return;
      }
      const missing = enabled.filter(
        (c) => !resolveWeatherContent(weatherContents[c.key]),
      );
      if (missing.length > 0) {
        toast.error(
          `请为已启用的天气场景配置触达文案：${missing.map((c) => c.short).join("、")}`,
        );
        return;
      }
    }

    const audienceText =
      audienceSummary === "请选择关怀对象" ? "全公司员工" : audienceSummary;
    const content =
      moduleType === "weather"
        ? weatherContentSummary.text
        : customContent.trim();
    const formData: CareRuleFormData = {
      audience,
      trigger,
      festival: moduleType === "festival" ? festival : undefined,
      customContent: moduleType === "weather" ? undefined : customContent,
      workloadTrigger:
        moduleType === "workload" ? workloadTrigger : undefined,
      weatherTrigger: moduleType === "weather" ? weatherTrigger : undefined,
      weatherContents: moduleType === "weather" ? weatherContents : undefined,
    };

    const rule: CareRule = {
      id: existingRule?.id ?? `r-${Date.now()}`,
      type: moduleType,
      name: schemeName.trim() || `新建${mod.name}方案`,
      audience: audienceText,
      triggerTime: buildTriggerTime(),
      template: content,
      points: hasPoints ? points : 0,
      enabled: existingRule?.enabled ?? true,
      reached: existingRule?.reached ?? 0,
      formData,
    };

    upsertCareRule(rule);
    toast.success(isEdit ? `已更新「${rule.name}」` : `已创建「${rule.name}」`);
    navigate(-1);
  };

  return (
    <>
      <h1 className="sr-only">{schemeName}</h1>
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
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={openName}
                className="flex w-full items-center gap-1.5 text-left transition-base active:opacity-80"
              >
                <span className="truncate text-base font-semibold leading-tight">
                  {schemeName}
                </span>
                <Edit3 className="h-3.5 w-3.5 shrink-0 opacity-80" />
              </button>
              <div className="truncate text-[11px] opacity-90">
                AI 已根据您的指令自动生成了关怀流程
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 scrollbar-hide">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-foreground">策略全景图</h2>
            <p className="text-xs text-muted-foreground">
              点击任意环节即可弹出修改
            </p>
          </div>

          {/* 时间线 */}
          <div className="relative">
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
              {/* STEP 01 关怀对象 */}
              <TimelineStep
                step="01"
                title="关怀对象"
                icon={Users}
                colorVar="--cat-3"
                editTrigger={
                  <AudiencePicker
                    value={audience}
                    onChange={setAudience}
                    showSelectedPreview={false}
                    trigger={<EditPencil />}
                  />
                }
                summary={
                  <AudiencePicker
                    value={audience}
                    onChange={setAudience}
                    showSelectedPreview={false}
                    trigger={
                      <SummaryRow
                        icon={<Users className="h-3.5 w-3.5 text-muted-foreground" />}
                        text={audienceSummary === "请选择关怀对象" ? "全公司员工" : audienceSummary}
                        sub={audienceRuleSummary}
                      />
                    }
                  />
                }
              />

              {/* STEP 02 节日选择 (仅 festival) */}
              {moduleType === "festival" && (
                <TimelineStep
                  step="02"
                  title="节日选择"
                  icon={CalendarDays}
                  colorVar="--cat-4"
                  editTrigger={
                    <FestivalPicker
                      value={festival}
                      onChange={setFestival}
                      trigger={<EditPencil />}
                    />
                  }
                  summary={
                    <FestivalPicker
                      value={festival}
                      onChange={setFestival}
                      trigger={
                        <SummaryRow
                          icon={<CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />}
                          text={`${festival}  ${getFestivalDate(festival)}`}
                        />
                      }
                    />
                  }
                />
              )}

              {/* STEP 触发时间 */}
              <TimelineStep
                step={moduleType === "festival" ? "03" : "02"}
                title={moduleType === "weather" ? "触发条件" : "触发时间"}
                icon={Clock}
                colorVar="--cat-7"
                editTrigger={
                  moduleType === "workload" ? (
                    <WorkloadTriggerEditor
                      value={workloadTrigger}
                      onChange={setWorkloadTrigger}
                      trigger={<EditPencil />}
                    />
                  ) : moduleType === "weather" ? (
                    <WeatherTriggerEditor
                      value={weatherTrigger}
                      onChange={setWeatherTrigger}
                      trigger={<EditPencil />}
                    />
                  ) : (
                    <SelectLike
                      value={trigger}
                      options={
                        moduleType === "festival"
                          ? festivalTriggerOptions
                          : mod.triggers
                      }
                      onChange={setTrigger}
                      trigger={<EditPencil />}
                    />
                  )
                }
                summary={
                  moduleType === "workload" ? (
                    <WorkloadTriggerEditor
                      value={workloadTrigger}
                      onChange={setWorkloadTrigger}
                      trigger={
                        <SummaryRow
                          icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                          text={workloadSummary.text}
                          sub={workloadSummary.sub}
                        />
                      }
                    />
                  ) : moduleType === "weather" ? (
                    <WeatherTriggerEditor
                      value={weatherTrigger}
                      onChange={setWeatherTrigger}
                      trigger={
                        <SummaryRow
                          icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                          text={weatherSummary.text}
                          sub={weatherSummary.sub}
                        />
                      }
                    />
                  ) : (
                    <SelectLike
                      value={trigger}
                      options={
                        moduleType === "festival"
                          ? festivalTriggerOptions
                          : mod.triggers
                      }
                      onChange={setTrigger}
                      trigger={
                        <SummaryRow
                          icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                          text={trigger}
                          sub={`${triggerLabels[moduleType]}·自动触达`}
                        />
                      }
                    />
                  )
                }
              />


              {/* STEP 关怀内容 */}
              <TimelineStep
                step={moduleType === "festival" ? "04" : "03"}
                title="关怀内容"
                icon={Heart}
                colorVar={mod.colorVar}
                editTrigger={
                  moduleType === "weather" ? undefined : (
                    <button
                      type="button"
                      aria-label="编辑"
                      onClick={openContent}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-base active:scale-90 hover:bg-secondary"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )
                }
                summary={
                  moduleType === "weather" ? (
                    <WeatherCareContentSheetEditor
                      trigger={weatherTrigger}
                      contents={weatherContents}
                      onChange={setWeatherContents}
                      triggerNode={
                        <SummaryRow
                          icon={<Heart className="h-3.5 w-3.5 text-muted-foreground" />}
                          text={
                            weatherContentSummary.text === "未配置触达文案"
                              ? "请点击配置各场景触达文案"
                              : truncateCarePreviewText(weatherContentSummary.text, 36)
                          }
                          sub={weatherContentSummary.sub}
                        />
                      }
                    />
                  ) : (
                    <SummaryRow
                      icon={<Heart className="h-3.5 w-3.5 text-muted-foreground" />}
                      text={
                        customContent.trim() || "请点击编辑,选择 AI 生成文案"
                      }
                      sub={customContent.trim() ? "AI 动态生成" : undefined}
                      multiline
                      onClick={openContent}
                    />
                  )
                }
                extra={
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    disabled={
                      moduleType === "weather" && weatherContentReadyCount === 0
                    }
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-secondary/40 py-2 text-xs font-medium text-foreground transition-base active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {moduleType === "weather" && weatherContentReadyCount === 0
                      ? "请先配置至少 1 类文案后再模拟查收"
                      : "模拟员工查收"}
                  </button>
                }
              />

              {/* STEP 积分(慰问/奖励) */}
              {hasPoints && (
                <TimelineStep
                  step={moduleType === "festival" ? "05" : "04"}
                  title={pointInfo.name}
                  icon={Coins}
                  colorVar="--cat-1"
                  editTrigger={
                    <button
                      type="button"
                      aria-label="编辑"
                      onClick={openPoints}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-base active:scale-90 hover:bg-secondary"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  }
                  summary={
                    <SummaryRow
                      icon={<Coins className="h-3.5 w-3.5 text-muted-foreground" />}
                      text={`${points} 积分`}
                      sub={pointInfo.hint}
                      onClick={openPoints}
                    />
                  }
                />
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-primary/40 bg-accent/40 p-3">
            <div className="flex items-start gap-2 text-xs text-accent-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">
                设置完成后,系统将通过 IM
                <strong>「关怀与福利引擎」</strong>会话自动触达员工。
                {hasPoints &&
                  points > 0 &&
                  `员工查收后自动获得「${pointInfo.name}」提示。`}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-full border border-border bg-card py-2.5 text-sm font-medium text-foreground transition-base active:scale-95"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] rounded-full gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-base active:scale-95"
          >
            {isEdit ? "保存修改" : "保存并启用"}
          </button>
        </div>
      </div>

      {/* 关怀内容编辑 Sheet */}
      <Sheet open={contentOpen} onOpenChange={setContentOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-left text-base">编辑关怀内容</SheetTitle>
          </SheetHeader>
          <div className="mt-3 space-y-3">
            <CareContentAiPanel
              key={contentOpen ? moduleType : "closed"}
              pool={aiCareContentVariants[moduleType]}
              onSelect={handleAiContentSelect}
            />
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">
                自定义内容
              </label>
              <Textarea
                value={contentDraft}
                onChange={(e) => setContentDraft(e.target.value)}
                placeholder="选择上方 AI 方案后将自动填入，可自行修改"
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            <button
              type="button"
              onClick={confirmContent}
              disabled={!contentDraft.trim()}
              className="w-full rounded-full gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-base active:scale-95 disabled:opacity-40"
            >
              确定
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 积分编辑 Sheet */}
      <Sheet open={pointsOpen} onOpenChange={setPointsOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-left text-base">
              编辑{pointInfo.name}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">单次发放</span>
              <span className="text-2xl font-bold text-foreground">
                {pointsDraft} 积分
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 10, 20, 50, 100].map((p) => (
                <button
                  key={p}
                  onClick={() => setPointsDraft(p)}
                  className={`flex-1 rounded-lg border px-1 py-2 text-xs font-medium transition-base ${
                    pointsDraft === p
                      ? "border-transparent bg-primary text-primary-foreground shadow-glow"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <span className="text-xs text-muted-foreground">自定义</span>
              <input
                type="number"
                min={0}
                value={pointsDraft}
                onChange={(e) => setPointsDraft(Math.max(0, Number(e.target.value) || 0))}
                className="flex-1 bg-transparent text-right text-sm font-medium text-foreground focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">积分</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{pointInfo.hint}</p>
            <button
              onClick={confirmPoints}
              className="mt-2 w-full rounded-full gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-base active:scale-95"
            >
              确定
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 方案名称编辑 Sheet */}
      <Sheet open={nameOpen} onOpenChange={setNameOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-left text-base">编辑方案名称</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <input
              autoFocus
              type="text"
              value={nameDraft}
              maxLength={30}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmName();
              }}
              placeholder="请输入方案名称"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>建议简洁明了,便于团队识别</span>
              <span>{nameDraft.length}/30</span>
            </div>
            <button
              onClick={confirmName}
              className="mt-2 w-full rounded-full gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-base active:scale-95"
            >
              确定
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 模拟员工查收 - 全屏弹窗 */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="left-0 top-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0 sm:rounded-none [&>button]:hidden"
        >
          <DialogTitle className="sr-only">模拟员工查收 · 关怀与福利引擎</DialogTitle>
          <div className="flex h-full max-h-[100dvh] flex-col">
            {/* IM 顶栏 */}
            <header className="flex items-center gap-2 border-b border-border bg-card px-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-primary-foreground">
                <Heart className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">
                  关怀与福利引擎
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  企业内部 IM · 模拟查收
                </div>
              </div>
              <button
                aria-label="关闭"
                onClick={() => setPreviewOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-base active:scale-90 hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="min-h-0 flex-1">
              <CareReceiveSimulator
                moduleType={moduleType}
                content={
                  moduleType === "weather"
                    ? firstWeatherPreviewContent(weatherTrigger, weatherContents)
                    : customContent.trim()
                }
                points={points}
                pointName={pointInfo.name}
                hasPoints={hasPoints}
                weatherScenario={
                  moduleType === "weather"
                    ? firstWeatherPreviewScenario(weatherTrigger, weatherContents)
                    : undefined
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ---------- subcomponents ---------- */

const TimelineStep = ({
  step,
  title,
  icon: Icon,
  colorVar,
  summary,
  editTrigger,
  extra,
}: {
  step: string;
  title: string;
  icon: typeof Users;
  colorVar: string;
  summary: React.ReactNode;
  editTrigger?: React.ReactNode;
  extra?: React.ReactNode;
}) => (
  <div className="relative flex gap-3">
    <div
      className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-soft"
      style={{
        background: `linear-gradient(135deg, hsl(var(${colorVar})), hsl(var(${colorVar}) / 0.75))`,
      }}
    >
      <Icon className="h-4 w-4" strokeWidth={2.4} />
    </div>

    <div className="min-w-0 flex-1 rounded-2xl bg-card p-3 shadow-soft">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
            STEP {step}:
          </span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {editTrigger}
      </div>
      {summary}
      {extra}
    </div>
  </div>
);

const EditPencil = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="编辑"
    {...props}
    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-base active:scale-90 hover:bg-secondary"
  >
    <Edit3 className="h-3.5 w-3.5" />
  </button>
));
EditPencil.displayName = "EditPencil";

const SummaryRow = React.forwardRef<
  HTMLButtonElement,
  {
    icon?: React.ReactNode;
    text: string;
    sub?: string;
    multiline?: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ icon, text, sub, multiline, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    {...rest}
    className="flex w-full items-start gap-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-left transition-base hover:bg-secondary active:scale-[0.99]"
  >
    {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
    <div className="min-w-0 flex-1">
      <div
        className={`text-sm text-foreground ${
          multiline ? "line-clamp-2 leading-relaxed" : "truncate font-medium"
        }`}
      >
        {text}
      </div>
      {sub && (
        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  </button>
));
SummaryRow.displayName = "SummaryRow";

const SelectLike = ({
  value,
  options,
  onChange,
  meta,
  trigger,
  columns = 1,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  meta?: (opt: string) => string;
  trigger: React.ReactNode;
  columns?: 1 | 2;
}) => (
  <Sheet>
    <SheetTrigger asChild>{trigger}</SheetTrigger>
    <SheetContent side="bottom" className="rounded-t-3xl">
      <SheetHeader>
        <SheetTitle className="text-left text-base">请选择</SheetTitle>
      </SheetHeader>
      <ul
        className={`mt-3 max-h-[60vh] overflow-y-auto scrollbar-hide ${
          columns === 2 ? "grid grid-cols-2 gap-1.5" : "space-y-1"
        }`}
      >
        {options.map((opt) => (
          <li key={opt}>
            <SheetTrigger asChild>
              <button
                onClick={() => onChange(opt)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-base ${
                  value === opt
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground active:bg-secondary"
                }`}
              >
                <span className={columns === 2 ? "flex min-w-0 flex-col" : "flex items-baseline gap-2"}>
                  <span className="truncate">{opt}</span>
                  {meta && meta(opt) && (
                    <span className="truncate text-[11px] text-muted-foreground">
                      {meta(opt)}
                    </span>
                  )}
                </span>
                {value === opt && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            </SheetTrigger>
          </li>
        ))}
      </ul>
    </SheetContent>
  </Sheet>
);

const FestivalPicker = ({
  value,
  onChange,
  trigger,
}: {
  value: string;
  onChange: (v: string) => void;
  trigger: React.ReactNode;
}) => {
  const [tab, setTab] = useState<"cn" | "west">(getFestivalGroup(value));
  return (
    <Sheet onOpenChange={(o) => o && setTab(getFestivalGroup(value))}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-left text-base">选择节日</SheetTitle>
        </SheetHeader>
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "cn" | "west")}
          className="mt-3"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cn">中国节日</TabsTrigger>
            <TabsTrigger value="west">西方节日</TabsTrigger>
          </TabsList>
          {(["cn", "west"] as const).map((g) => (
            <TabsContent key={g} value={g} className="mt-3">
              <ul className="grid max-h-[55vh] grid-cols-2 gap-1.5 overflow-y-auto scrollbar-hide">
                {(g === "cn" ? cnFestivalNames : westFestivalNames).map((opt) => (
                  <li key={opt}>
                    <SheetTrigger asChild>
                      <button
                        onClick={() => onChange(opt)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-base ${
                          value === opt
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground active:bg-secondary"
                        }`}
                      >
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{opt}</span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {getFestivalDate(opt)}
                          </span>
                        </span>
                        {value === opt && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </button>
                    </SheetTrigger>
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default CareCreateRule;

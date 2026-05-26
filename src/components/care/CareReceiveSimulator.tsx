import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CheckCircle2, HandHeart } from "lucide-react";
import {
  careModules,
  getWeatherPreviewPerks,
  type CareType,
  type WeatherTriggerKey,
} from "@/data/humanityCare";
import { CarePreviewCard, previewConfig } from "./CarePreviewCard";
import { CareReceiveAnimation } from "./CareReceiveAnimation";

type Props = {
  moduleType: CareType;
  content: string;
  points: number;
  pointName: string;
  hasPoints: boolean;
  weatherScenario?: WeatherTriggerKey;
};

/** 按用户操作顺序追加的 IM 消息 */
type TimelineItem =
  | { id: string; kind: "tip"; text: string }
  | { id: string; kind: "received" };

const promptByType: Record<CareType, string> = {
  birthday: "你收到一份「生日关怀」🎂",
  festival: "你收到一份「节日关怀」🧧",
  weather: "你收到一条「天气出行提醒」☔",
  workload: "你收到一份「辛苦补贴关怀」🌙",
};

const ImBotBubble = ({
  children,
  gradientFrom,
  gradientTo,
  showAvatar = true,
}: {
  children: ReactNode;
  gradientFrom: string;
  gradientTo: string;
  showAvatar?: boolean;
}) => (
  <div className="flex items-end gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
    {showAvatar ? (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        <HandHeart className="h-4 w-4" />
      </div>
    ) : (
      <div className="h-8 w-8 shrink-0" />
    )}
    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-card px-3 py-2 text-[13px] leading-relaxed text-foreground shadow-soft">
      {children}
    </div>
  </div>
);

/**
 * 模拟「关怀与福利引擎」IM 会话:Bot 提示语 + 关怀卡片 + 贴士对话 + 按钮查收动画
 */
export const CareReceiveSimulator = ({
  moduleType,
  content,
  points,
  pointName,
  hasPoints,
  weatherScenario = "extremeHeat",
}: Props) => {
  const mod = careModules[moduleType];
  const cfg = previewConfig[moduleType];
  const receivedPerks =
    moduleType === "weather"
      ? getWeatherPreviewPerks(weatherScenario)
      : cfg.perks;
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [animating, setAnimating] = useState(false);

  const received = timeline.some((item) => item.kind === "received");

  const handleReceiveClick = () => {
    if (received || animating) return;
    setAnimating(true);
  };

  const handlePerkTip = (_label: string, body: string) => {
    if (!body) return;
    setTimeline((prev) => [
      ...prev,
      { id: `tip-${Date.now()}-${prev.length}`, kind: "tip", text: body },
    ]);
  };

  const handlePerkJump = (label: string) => {
    toast.info(`正在打开${label}…`, { duration: 2000 });
  };

  const handleAnimDone = () => {
    setAnimating(false);
    setTimeline((prev) => [
      ...prev,
      { id: `received-${Date.now()}`, kind: "received" },
    ]);
  };

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--secondary))]">
      <div className="flex justify-center px-4 pt-4">
        <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-[10px] text-muted-foreground">
          今天 · 刚刚
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-6 pt-3 scrollbar-hide">
        <ImBotBubble gradientFrom={cfg.gradientFrom} gradientTo={cfg.gradientTo}>
          <div className="font-medium">{promptByType[moduleType]}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {moduleType === "weather"
              ? "点击下方按钮完成查收，可先查看出行贴士 ↓"
              : "点击下方按钮完成查收，福利入口可点击跳转 ↓"}
          </div>
        </ImBotBubble>

        <div className="flex items-end gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
          <div className="h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1">
            <CarePreviewCard
              moduleType={moduleType}
              content={content}
              points={points}
              pointName={pointName}
              hasPoints={hasPoints}
              weatherScenario={
                moduleType === "weather" ? weatherScenario : undefined
              }
              onPerkTip={handlePerkTip}
              onPerkJump={handlePerkJump}
              onReceiveClick={handleReceiveClick}
              receiveDisabled={received || animating}
            />
          </div>
        </div>

        {timeline.map((item) =>
          item.kind === "tip" ? (
            <ImBotBubble
              key={item.id}
              gradientFrom={cfg.gradientFrom}
              gradientTo={cfg.gradientTo}
            >
              {item.text}
            </ImBotBubble>
          ) : (
            <ImBotBubble
              key={item.id}
              gradientFrom={cfg.gradientFrom}
              gradientTo={cfg.gradientTo}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>查收成功</span>
              </div>
              {hasPoints && points > 0 ? (
                <div className="mt-1 text-[12px] text-muted-foreground">
                  <span className="font-bold text-foreground">
                    {pointName} +{points}
                  </span>{" "}
                  已自动入账,可在「我的钱包」查看
                </div>
              ) : (
                <div className="mt-1 text-[12px] text-muted-foreground">
                  关怀已送达,愿你被温柔以待 💛
                </div>
              )}
              {receivedPerks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {receivedPerks.map((p) => (
                    <span
                      key={p.label}
                      className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground"
                    >
                      {p.label}
                    </span>
                  ))}
                </div>
              )}
            </ImBotBubble>
          ),
        )}
      </div>

      <CareReceiveAnimation
        moduleType={moduleType}
        active={animating}
        onDone={handleAnimDone}
      />
      <span className="sr-only">{mod.name}</span>
    </div>
  );
};

export default CareReceiveSimulator;

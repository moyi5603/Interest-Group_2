import { useEffect, useState } from "react";
import type { CareType } from "@/data/humanityCare";

type Props = {
  moduleType: CareType;
  active: boolean;
  onDone?: () => void;
};

/**
 * 全屏覆盖的炫酷查收动画。根据关怀类型展示不同的特效。
 */
export const CareReceiveAnimation = ({ moduleType, active, onDone }: Props) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        onDone?.();
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [active, onDone]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {/* 背景闪光 */}
      <div className="absolute inset-0 animate-[flash_0.6s_ease-out_forwards] bg-white/0" />

      {moduleType === "birthday" && <BirthdayFx />}
      {moduleType === "festival" && <FestivalFx />}
      {moduleType === "weather" && <WeatherFx />}
      {moduleType === "workload" && <WorkloadFx />}

      <style>{keyframes}</style>
    </div>
  );
};

/* ───────────────── 生日:蛋糕 + 多色彩带 ───────────────── */
const BirthdayFx = () => {
  const confetti = ["🎉", "🎊", "🎈", "🧁", "✨", "💖", "🎀"];
  return (
    <>
      {/* 中心放大蛋糕 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[heroPop_1.4s_cubic-bezier(.2,.9,.3,1.4)_forwards] text-[120px]">
        🎂
      </div>
      {/* 光环 */}
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-[ring_1.4s_ease-out_forwards] rounded-full border-4 border-pink-400/70" />
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-[ring_1.4s_ease-out_0.2s_forwards] rounded-full border-4 border-orange-400/70" />
      {/* Confetti 喷射 */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (360 / 24) * i;
        const dist = 180 + Math.random() * 120;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl"
            style={{
              animation: `burst 1.4s cubic-bezier(.2,.7,.4,1) ${i * 0.02}s forwards`,
              ["--tx" as never]: `${Math.cos((angle * Math.PI) / 180) * dist}px`,
              ["--ty" as never]: `${Math.sin((angle * Math.PI) / 180) * dist}px`,
            }}
          >
            {confetti[i % confetti.length]}
          </span>
        );
      })}
    </>
  );
};

/* ───────────────── 节日:红包 + 金币雨 ───────────────── */
const FestivalFx = () => (
  <>
    {/* 红色喜庆背景晕染 */}
    <div className="absolute inset-0 animate-[fadeInOut_1.8s_ease-out_forwards] bg-gradient-radial from-red-500/30 via-orange-400/15 to-transparent" />
    {/* 灯笼光晕 */}
    <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-[ring_1.4s_ease-out_forwards] rounded-full bg-amber-300/30 blur-3xl" />
    {/* 中心红包 */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[heroPop_1.4s_cubic-bezier(.2,.9,.3,1.4)_forwards] text-[110px] drop-shadow-2xl">
      🧧
    </div>
    {/* 金币 / 福字雨 */}
    {Array.from({ length: 18 }).map((_, i) => {
      const symbols = ["💰", "✨", "🪙", "🧧", "福"];
      const sym = symbols[i % symbols.length];
      return (
        <span
          key={i}
          className={`absolute text-2xl ${sym === "福" ? "font-bold text-red-600" : ""}`}
          style={{
            left: `${5 + i * 5.2}%`,
            top: "-8%",
            animation: `coinFall 1.6s ease-in ${i * 0.06}s forwards`,
          }}
        >
          {sym}
        </span>
      );
    })}
  </>
);

/* ───────────────── 天气:雨伞 + 雨滴 / 阳光 ───────────────── */
const WeatherFx = () => (
  <>
    {/* 蓝色波纹 */}
    <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-[ring_1.4s_ease-out_forwards] rounded-full border-4 border-sky-400/70" />
    <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-[ring_1.4s_ease-out_0.25s_forwards] rounded-full border-4 border-cyan-300/70" />
    {/* 中心雨伞 */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[umbrella_1.4s_cubic-bezier(.2,.9,.3,1.4)_forwards] text-[110px]">
      ☂️
    </div>
    {/* 雨滴 */}
    {Array.from({ length: 20 }).map((_, i) => (
      <span
        key={i}
        className="absolute text-xl"
        style={{
          left: `${3 + i * 4.8}%`,
          top: "-6%",
          animation: `rainFall 1.4s linear ${i * 0.04}s forwards`,
        }}
      >
        💧
      </span>
    ))}
  </>
);

/* ───────────────── 工作强度:月亮 + 星星 + 加班礼包 ───────────────── */
const WorkloadFx = () => (
  <>
    {/* 紫蓝渐变光晕 */}
    <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-[ring_1.4s_ease-out_forwards] rounded-full bg-indigo-400/30 blur-3xl" />
    {/* 月亮 */}
    <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 animate-[heroPop_1.4s_cubic-bezier(.2,.9,.3,1.4)_forwards] text-[100px]">
      🌙
    </div>
    {/* 漂浮星星 */}
    {Array.from({ length: 14 }).map((_, i) => (
      <span
        key={i}
        className="absolute text-xl"
        style={{
          left: `${5 + Math.random() * 90}%`,
          top: `${10 + Math.random() * 80}%`,
          animation: `starFloat 1.6s ease-out ${i * 0.05}s forwards`,
        }}
      >
        {i % 3 === 0 ? "⭐" : "✨"}
      </span>
    ))}
    {/* 底部滑入的加班礼包 */}
    <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 animate-[slideUpRotate_1.4s_cubic-bezier(.2,.9,.3,1.2)_forwards] rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-white shadow-2xl">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎁</span>
        <div>
          <div className="text-xs opacity-90">加班礼包</div>
          <div className="text-base font-bold">+30 元</div>
        </div>
      </div>
    </div>
  </>
);

const keyframes = `
@keyframes flash {
  0% { background-color: rgba(255,255,255,0.6); }
  100% { background-color: rgba(255,255,255,0); }
}
@keyframes heroPop {
  0% { transform: translate(-50%, -50%) scale(0.2) rotate(-30deg); opacity: 0; }
  40% { transform: translate(-50%, -50%) scale(1.25) rotate(8deg); opacity: 1; }
  70% { transform: translate(-50%, -50%) scale(0.95) rotate(-3deg); }
  100% { transform: translate(-50%, -50%) scale(1.05) rotate(0); opacity: 1; }
}
@keyframes umbrella {
  0% { transform: translate(-50%, -150%) scale(0.4) rotate(-90deg); opacity: 0; }
  60% { transform: translate(-50%, -50%) scale(1.2) rotate(15deg); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1) rotate(0); opacity: 1; }
}
@keyframes ring {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
}
@keyframes burst {
  0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
  20% { opacity: 1; }
  100% {
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1) rotate(360deg);
    opacity: 0;
  }
}
@keyframes coinFall {
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
}
@keyframes rainFall {
  0% { transform: translateY(0); opacity: 0.9; }
  100% { transform: translateY(110vh); opacity: 0; }
}
@keyframes starFloat {
  0% { transform: translateY(20px) scale(0.4); opacity: 0; }
  40% { opacity: 1; }
  100% { transform: translateY(-30px) scale(1.1); opacity: 0; }
}
@keyframes slideUpRotate {
  0% { transform: translate(-50%, 200%) rotate(-15deg); opacity: 0; }
  60% { transform: translate(-50%, -10%) rotate(6deg); opacity: 1; }
  100% { transform: translate(-50%, 0) rotate(0); opacity: 1; }
}
@keyframes fadeInOut {
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 0; }
}
.bg-gradient-radial {
  background-image: radial-gradient(circle at center, var(--tw-gradient-stops));
}
`;

export default CareReceiveAnimation;

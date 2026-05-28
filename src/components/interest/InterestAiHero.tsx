import { Sparkles } from "lucide-react";

type Props = {
  tagHint?: string;
};

const InterestAiHero = ({ tagHint }: Props) => (
  <div className="relative w-full overflow-hidden rounded-2xl p-3.5 text-primary-foreground shadow-glow gradient-banner">
    <div className="relative z-10 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium opacity-90">兴趣小组 · AI 助手</p>
        <h2 className="mt-1 text-base font-bold leading-snug">
          智能推荐社群，发现适合你的活动
        </h2>
        {tagHint && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed opacity-90">
            {tagHint}
          </p>
        )}
      </div>
    </div>
    <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
    <div className="pointer-events-none absolute -bottom-6 left-8 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
  </div>
);

export default InterestAiHero;

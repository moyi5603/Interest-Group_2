import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Sparkles, Zap, Gift } from "lucide-react";

const banners = [
  {
    title: "新Agent上线",
    subtitle: "智能简历助手 · 一键润色你的简历",
    cta: "立即体验",
    bg: "gradient-banner",
    icon: Sparkles,
  },
  {
    title: "效率提升 80%",
    subtitle: "工单智能分配 Agent 全员开放",
    cta: "查看详情",
    bg: "gradient-banner-2",
    icon: Zap,
  },
  {
    title: "积分翻倍周",
    subtitle: "完成 AI 任务赢双倍积分奖励",
    cta: "去挑战",
    bg: "gradient-banner-3",
    icon: Gift,
  },
];

const BannerCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <section className="px-4">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {banners.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="min-w-0 flex-[0_0_100%] pr-2 last:pr-0">
                <div className={`relative flex h-32 items-center justify-between overflow-hidden rounded-2xl px-5 ${b.bg} shadow-card`}>
                  <div className="relative z-10 text-primary-foreground">
                    <h3 className="text-lg font-bold drop-shadow-sm">{b.title}</h3>
                    <p className="mt-1 text-xs opacity-95">{b.subtitle}</p>
                    <button className="mt-3 rounded-full bg-white/25 px-3 py-1 text-xs font-medium backdrop-blur-sm transition-base active:scale-95">
                      {b.cta} →
                    </button>
                  </div>
                  <Icon className="absolute -right-4 -top-2 h-32 w-32 text-white/15" strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex justify-center gap-1.5">
        {banners.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-base ${
              selected === i ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default BannerCarousel;

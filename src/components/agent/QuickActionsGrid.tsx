import {
  Users,
  FileCheck,
  BookOpen,
  Flame,
  TrendingUp,
  Trophy,
  Gift,
  HeartHandshake,
  MessageSquareHeart,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Item = {
  label: string;
  icon: LucideIcon;
  colorVar: string;
  to?: string;
};

const items: Item[] = [
  { label: "找同事", icon: Users, colorVar: "var(--cat-1)", to: "/colleagues" },
  { label: "办手续", icon: FileCheck, colorVar: "var(--cat-2)" },
  { label: "查政策", icon: BookOpen, colorVar: "var(--cat-3)" },
  {
    label: "谋发展",
    icon: TrendingUp,
    colorVar: "var(--cat-5)",
    to: "/agents?tab=development",
  },
  { label: "悦文化", icon: Flame, colorVar: "var(--cat-4)", to: "/agents/interest-groups" },
  { label: "享福利", icon: Gift, colorVar: "var(--cat-7)" },
  { label: "提反馈", icon: MessageSquareHeart, colorVar: "var(--cat-9)" },
  { label: "更多Agent", icon: LayoutGrid, colorVar: "var(--cat-10)", to: "/agents" },
];

const QuickActionsGrid = () => {
  const navigate = useNavigate();
  return (
    <section className="mx-4 rounded-2xl bg-card p-4 shadow-soft">
      <div className="grid grid-cols-4 gap-y-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => item.to && navigate(item.to)}
              className="group flex flex-col items-center gap-1.5 transition-bounce active:scale-90"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-soft transition-base group-active:shadow-glow"
                style={{
                  background: `linear-gradient(135deg, hsl(${item.colorVar} / 0.18), hsl(${item.colorVar} / 0.08))`,
                }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: `hsl(${item.colorVar})` }}
                  strokeWidth={2.2}
                />
              </div>
              <span className="text-[11px] font-medium text-foreground">{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default QuickActionsGrid;

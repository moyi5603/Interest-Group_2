import { ShoppingBag, MessageCircle, Bot, User } from "lucide-react";

const tabs = [
  { id: "shop", label: "商城", icon: ShoppingBag },
  { id: "msg", label: "消息", icon: MessageCircle },
  { id: "agent", label: "智能体", icon: Bot, active: true },
  { id: "me", label: "我的", icon: User },
];

const BottomTabBar = () => {
  return (
    <nav className="grid grid-cols-4 border-t border-border/60 bg-background/95 px-2 pb-safe pt-1.5 backdrop-blur-lg shadow-tab">
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = !!t.active;
        return (
          <button
            key={t.id}
            className="flex flex-col items-center gap-0.5 py-1 transition-base active:scale-95"
          >
            <div
              className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-base ${
                active ? "gradient-primary shadow-glow" : ""
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.4 : 2}
              />
            </div>
            <span
              className={`text-[10px] ${
                active ? "font-semibold text-primary" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;

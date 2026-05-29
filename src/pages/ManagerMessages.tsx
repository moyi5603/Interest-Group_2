import {
  Award,
  BellOff,
  CreditCard,
  Gift,
  Megaphone,
  Pin,
  Plus,
  Search,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GROWTH_ENGINE_DEMO_NOTIFICATIONS } from "@/data/growthEngineDemo";
import { cn } from "@/lib/utils";

type FilterTab = "全部" | "未读" | "@我" | "群聊" | "私聊";

type MessagePrefix = {
  text: string;
  color: "purple" | "red";
};

type ChatItem = {
  id: string;
  name: string;
  preview: string;
  time: string;
  avatarBg: string;
  avatarContent: React.ReactNode;
  badge?: number;
  online?: boolean;
  official?: boolean;
  prefixes?: MessagePrefix[];
  pinned?: boolean;
  muted?: boolean;
  onClick?: () => void;
};

const FILTER_TABS: FilterTab[] = ["全部", "未读", "@我", "群聊", "私聊"];

const growthEngineAvatar = (
  <Gift className="h-6 w-6 text-[#8B7CF6]" strokeWidth={1.8} />
);

const GROWTH_ENGINE_CHAT_ITEM: ChatItem = {
  id: "growth-engine",
  name: "成长引擎",
  preview: GROWTH_ENGINE_DEMO_NOTIFICATIONS[0].preview,
  time: GROWTH_ENGINE_DEMO_NOTIFICATIONS[0].time,
  avatarBg: "#EDE8FF",
  avatarContent: growthEngineAvatar,
  official: true,
  prefixes: [{ text: "[提醒]", color: "purple" }],
  pinned: true,
  badge: GROWTH_ENGINE_DEMO_NOTIFICATIONS.length,
};

const STATIC_CHAT_ITEMS: ChatItem[] = [
  {
    id: "2",
    name: "张三",
    preview: "好的，明天见！",
    time: "10:30",
    avatarBg: "#FFE8EC",
    avatarContent: <span className="text-xl leading-none">👨</span>,
    badge: 2,
    online: true,
    pinned: true,
  },
  {
    id: "3",
    name: "李四",
    preview: "我看一下需求文档",
    time: "09:15",
    avatarBg: "#FFF0E5",
    avatarContent: <span className="text-xl leading-none">👩</span>,
    online: true,
    prefixes: [{ text: "[草稿]", color: "purple" }],
  },
  {
    id: "4",
    name: "产品讨论组",
    preview: "[图片]",
    time: "昨天",
    avatarBg: "#FFF8E5",
    avatarContent: (
      <span className="text-base font-semibold text-[#D4A017]">产</span>
    ),
    badge: 5,
    prefixes: [{ text: "[有人@我]", color: "red" }],
  },
  {
    id: "5",
    name: "王五",
    preview: "收到，谢谢！",
    time: "昨天",
    avatarBg: "#E8F2FF",
    avatarContent: <span className="text-xl leading-none">🧑‍💼</span>,
    muted: true,
  },
  {
    id: "6",
    name: "技术交流群",
    preview: "有人了解这个 API 吗？",
    time: "周一",
    avatarBg: "#FFE8F5",
    avatarContent: (
      <span className="text-base font-semibold text-[#E879A8]">技</span>
    ),
    badge: 12,
  },
  {
    id: "7",
    name: "赵六",
    preview: "设计稿已更新",
    time: "周一",
    avatarBg: "#FFE8EC",
    avatarContent: <span className="text-xl leading-none">🧑</span>,
    badge: 1,
    online: true,
  },
  {
    id: "8",
    name: "HR 通知",
    preview: "4月薪资已发放",
    time: "03/28",
    avatarBg: "#FFF0E5",
    avatarContent: (
      <Megaphone className="h-6 w-6 text-[#F5A623]" strokeWidth={1.8} />
    ),
    prefixes: [{ text: "[通知]", color: "purple" }],
  },
];

const BOTTOM_TABS = [
  { id: "hr", label: "HR", icon: UserCog },
  { id: "manager", label: "管理者", icon: Users, active: true },
  { id: "employee", label: "员工", icon: Award },
  { id: "mine", label: "我的", icon: User },
] as const;

const AvatarBadge = ({ count }: { count: number }) => (
  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF4D4F] px-1 text-[10px] font-medium leading-none text-white">
    {count > 99 ? "99+" : count}
  </span>
);

const OnlineDot = () => (
  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#F8F8F8] bg-[#52C41A]" />
);

const ChatRow = ({ item }: { item: ChatItem }) => (
  <button
    type="button"
    onClick={item.onClick}
    className="flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-black/[0.03]"
  >
    <div className="relative shrink-0">
      <div
        className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px]"
        style={{ backgroundColor: item.avatarBg }}
      >
        {item.avatarContent}
      </div>
      {item.badge ? <AvatarBadge count={item.badge} /> : null}
      {item.online ? <OnlineDot /> : null}
    </div>

    <div className="min-w-0 flex-1 border-b border-[#EFEFEF] pb-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[16px] font-semibold text-[#1A1A1A]">
            {item.name}
          </span>
          {item.official ? (
            <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-[#4A90E2] ring-1 ring-[#4A90E2]/30">
              官方
            </span>
          ) : null}
        </div>
        <span className="shrink-0 text-[12px] text-[#B0B0B0]">{item.time}</span>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[14px] leading-snug text-[#999999]">
          {item.prefixes?.map((prefix) => (
            <span
              key={prefix.text}
              className={
                prefix.color === "red" ? "text-[#FF4D4F]" : "text-[#8B7CF6]"
              }
            >
              {prefix.text}{" "}
            </span>
          ))}
          {item.preview}
        </p>
        <div className="flex shrink-0 items-center gap-1.5 pl-1">
          {item.pinned ? (
            <Pin className="h-3.5 w-3.5 text-[#C8C8C8]" strokeWidth={1.8} />
          ) : null}
          {item.muted ? (
            <BellOff className="h-3.5 w-3.5 text-[#C8C8C8]" strokeWidth={1.8} />
          ) : null}
        </div>
      </div>
    </div>
  </button>
);

const ManagerMessages = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("全部");

  const chatItems: ChatItem[] = [
    {
      ...GROWTH_ENGINE_CHAT_ITEM,
      onClick: () => navigate("/manager/growth-engine"),
    },
    ...STATIC_CHAT_ITEMS,
  ];

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-[#F8F8F8]">
      <header className="shrink-0 bg-[#F8F8F8] px-4 pb-2 pt-3">
        <div className="flex items-center gap-2.5">
          <h1 className="shrink-0 text-[22px] font-bold tracking-tight text-[#1A1A1A]">
            管理者
          </h1>

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B8B8B8]" />
            <input
              type="search"
              placeholder="搜索联系人或消息"
              className="h-9 w-full rounded-full border-0 bg-[#EEEEEE] pl-9 pr-3 text-[13px] text-[#333333] placeholder:text-[#B8B8B8] focus:outline-none focus:ring-1 focus:ring-[#8B7CF6]/30"
            />
          </div>

          <button
            type="button"
            aria-label="卡片"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEEEEE] text-[#666666] active:scale-95"
          >
            <CreditCard className="h-4 w-4" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            aria-label="新建"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B7CF6] text-white shadow-sm active:scale-95"
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-5 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "shrink-0 pb-1 text-[15px] transition-colors",
                activeFilter === tab
                  ? "font-semibold text-[#1A1A1A]"
                  : "font-normal text-[#999999]",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {chatItems.map((item) => (
          <ChatRow key={item.id} item={item} />
        ))}
      </main>

      <nav className="grid shrink-0 grid-cols-4 border-t border-[#ECECEC] bg-white px-2 pb-safe pt-1.5">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = "active" in tab && tab.active;
          return (
            <button
              key={tab.id}
              type="button"
              className="flex flex-col items-center gap-0.5 py-1 active:scale-95"
            >
              <Icon
                className={cn(
                  "h-[22px] w-[22px]",
                  active ? "text-[#8B7CF6]" : "text-[#999999]",
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={cn(
                  "text-[11px]",
                  active
                    ? "font-medium text-[#8B7CF6]"
                    : "text-[#999999]",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ManagerMessages;

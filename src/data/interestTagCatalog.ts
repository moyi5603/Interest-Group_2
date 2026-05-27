/** 兴趣标签分类库（与 Staff-Management 员工档案 / 我的资料一致） */

export type CatalogGroup = {
  title: string;
  items: string[];
};

export type CatalogCategory = {
  id: string;
  name: string;
  groups: CatalogGroup[];
};

export const INTEREST_TAG_CATALOG: CatalogCategory[] = [
  {
    id: "sport",
    name: "运动健身",
    groups: [
      {
        title: "球类运动",
        items: ["羽毛球", "篮球", "足球", "乒乓球", "网球", "排球", "台球"],
      },
      {
        title: "户外运动",
        items: ["跑步", "徒步", "骑行", "登山", "露营", "滑雪"],
      },
      {
        title: "健身塑形",
        items: ["游泳", "瑜伽", "健身", "力量训练", "普拉提"],
      },
    ],
  },
  {
    id: "culture",
    name: "文化艺术",
    groups: [
      {
        title: "阅读学习",
        items: ["阅读", "写作", "历史", "心理学", "哲学", "书法", "技术分享"],
      },
      {
        title: "音乐乐器",
        items: ["吉他", "钢琴", "唱歌", "音乐", "古筝", "小提琴", "架子鼓"],
      },
      {
        title: "视觉艺术",
        items: ["摄影", "绘画", "插画", "漫画", "雕塑", "陶艺"],
      },
    ],
  },
  {
    id: "life",
    name: "休闲娱乐",
    groups: [
      {
        title: "影视娱乐",
        items: ["电影", "电视剧", "综艺", "纪录片", "动漫", "播客"],
      },
      {
        title: "游戏互动",
        items: ["游戏", "电竞", "桌游", "剧本杀", "密室逃脱", "狼人杀"],
      },
      {
        title: "美食生活",
        items: ["烹饪", "烘焙", "咖啡", "茶艺", "调酒", "探店"],
      },
      {
        title: "旅行探索",
        items: ["旅行", "自驾游", "古镇游", "城市漫步"],
      },
    ],
  },
  {
    id: "social",
    name: "社交公益",
    groups: [
      {
        title: "社交活动",
        items: ["聚会", "唱K", "读书会", "英语角"],
      },
      {
        title: "公益志愿",
        items: ["志愿服务", "公益活动", "公益志愿", "环保志愿者"],
      },
      {
        title: "生活兴趣",
        items: ["宠物", "亲子活动", "园艺", "花艺", "手账"],
      },
    ],
  },
];

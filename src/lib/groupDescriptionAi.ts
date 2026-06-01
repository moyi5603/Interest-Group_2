import type { GroupCategory } from "@/data/interestTypes";

/** 小组简介 AI 生成系统提示（对接真实 LLM 时使用） */
export const GROUP_DESCRIPTION_AI_SYSTEM_PROMPT = `你是一位企业内部兴趣小组的内容运营专家。你的任务是根据用户输入的小组名称和标签，生成1条小组简介文案。

## 输出要求
1. **长度**：50-100字
2. **内容**：必须包含以下要素
   - 小组定位（是什么）
   - 主要活动形式（做什么）
   - 价值主张（为什么加入）
3. **语气**：亲切、有活力、有归属感
4. **禁止**：
   - 不要出现"公司"、"企业"等外部词汇（因为是内部系统）
   - 不要过于正式/官方
   - 不要超过120字`;

type TagMeta = {
  positioning: string;
  activity: string;
  value: string;
  audience: string;
  scene: string;
};

const TAG_META: Record<string, TagMeta> = {
  技术分享: {
    positioning: "热爱技术交流与实践的学习型小组",
    activity: "定期分享前沿技术与实战经验",
    value: "精进专业能力、结识志同道合的伙伴",
    audience: "对技术有热情、乐于分享的你",
    scene: "白板前热烈讨论、代码与灵感交织",
  },
  AI实践: {
    positioning: "探索 AI 应用与落地的实践小组",
    activity: "一起动手做项目、交流工具与方法论",
    value: "跟上 AI 浪潮、把想法变成可落地的成果",
    audience: "想用 AI 提升效率、爱折腾新工具的你",
    scene: "屏幕微光里，一个个好点子被点亮",
  },
  读书会: {
    positioning: "以书会友、以读促思的阅读小组",
    activity: "共读好书、线下茶话、碰撞观点",
    value: "拓宽视野、在交流中获得新启发",
    audience: "爱读书、愿分享读后感的你",
    scene: "茶香与书页间，思想缓缓流淌",
  },
  英语角: {
    positioning: "轻松开口、互助提升的英语练习小组",
    activity: "主题口语练习、情景模拟与小演讲",
    value: "告别哑巴英语、在氛围里自然进步",
    audience: "想提升口语、不怕开口试错的你",
    scene: "轻松氛围里，一句句英语越说越顺",
  },
  行业交流: {
    positioning: "跨团队碰撞视野的行业话题小组",
    activity: "案例研讨、趋势分享与经验互换",
    value: "打破信息茧房、收获更宽的认知边界",
    audience: "关注行业动态、乐于跨界交流的你",
    scene: "不同背景的人围坐一圈，火花四溅",
  },
  跑步: {
    positioning: "用脚步丈量城市的跑步爱好者小组",
    activity: "晨跑夜跑、配速训练与赛事组队",
    value: "养成运动习惯、在奔跑中释放压力",
    audience: "想动起来、享受奔跑节奏的你",
    scene: "晨曦或夜色里，脚步声与呼吸同频",
  },
  健身: {
    positioning: "互相督促、科学锻炼的健身小组",
    activity: "团课打卡、动作纠正与训练计划分享",
    value: "告别独自坚持难、一起练出好状态",
    audience: "想规律运动、需要同伴能量的你",
    scene: "器械与汗水之间，状态一点点变好",
  },
  羽毛球: {
    positioning: "挥拍交友、切磋球技的羽毛球小组",
    activity: "固定局约球、技术交流与友谊赛",
    value: "运动社交两不误、场上场下都尽兴",
    audience: "爱打球、想找到固定球友的你",
    scene: "清脆的击球声里，默契渐渐生长",
  },
  徒步: {
    positioning: "走向山野、拥抱自然的徒步小组",
    activity: "周末徒步、路线攻略与户外安全分享",
    value: "暂别屏幕、在自然里充电回血",
    audience: "向往户外、愿意结伴探索的你",
    scene: "山风拂面，脚步丈量未看过的风景",
  },
  公益志愿: {
    positioning: "用行动传递温暖的志愿服务小组",
    activity: "策划志愿活动、结对帮扶与公益实践",
    value: "在付出中收获意义感与同伴情谊",
    audience: "心怀善意、愿用行动影响他人的你",
    scene: "一次次行动中，温暖被悄悄传递",
  },
};

const DEFAULT_META: TagMeta = {
  positioning: "志同道合的兴趣爱好者小组",
  activity: "定期组织主题活动与交流分享",
  value: "找到归属感、结识聊得来的伙伴",
  audience: "对这项兴趣有热情的你",
  scene: "轻松氛围里，每一次相聚都值得期待",
};

const clampText = (text: string, max = 120) =>
  text.length <= max ? text : `${text.slice(0, max - 1)}…`;

const buildMeta = (tagNames: string[], category?: GroupCategory): TagMeta => {
  if (tagNames.length === 0 && category) {
    return {
      ...DEFAULT_META,
      positioning: `${category}方向的兴趣爱好者小组`,
      activity: `围绕${category}主题开展活动与交流`,
    };
  }
  const primary = tagNames.find((name) => TAG_META[name]) ?? tagNames[0];
  const base = (primary && TAG_META[primary]) || DEFAULT_META;
  if (tagNames.length <= 1) return base;

  const joined = tagNames.slice(0, 3).join("、");
  return {
    ...base,
    positioning: `聚焦${joined}的兴趣小组`,
    activity: `围绕${joined}开展主题活动与经验交流`,
  };
};

const buildStyleA = (name: string, meta: TagMeta) =>
  clampText(
    `「${name}」欢迎你加入！我们是${meta.positioning}，${meta.activity}，${meta.value}，一起创造更多精彩！`,
  );

/** 根据小组名称与标签生成一条简介（原型 mock） */
export const generateGroupDescription = (
  name: string,
  tagNames: string[],
  category?: GroupCategory,
): string => {
  const trimmedName = name.trim();
  const meta = buildMeta(tagNames, category);
  return buildStyleA(trimmedName, meta);
};

/** 模拟 AI 生成延迟 */
export const generateGroupDescriptionAsync = (
  name: string,
  tagNames: string[],
  category?: GroupCategory,
  delayMs = 700,
): Promise<string> =>
  new Promise((resolve) => {
    window.setTimeout(
      () => resolve(generateGroupDescription(name, tagNames, category)),
      delayMs,
    );
  });

import type { ActivityKind } from "@/data/interestTypes";
import { ACTIVITY_KIND_LABEL } from "@/components/interest/activityFormConstants";

/** 活动介绍 AI 生成系统提示（对接真实 LLM 时使用） */
export const ACTIVITY_DESCRIPTION_AI_SYSTEM_PROMPT = `你是一位企业内部兴趣小组的活动策划专家。你的任务是根据活动信息生成1条活动介绍文案。

## 输出要求
1. **长度**：80-150字
2. **必须包含的要素**：
   - 活动主题/亮点（做什么）
   - 活动形式/流程（怎么做）
   - 参与者能获得什么（价值）
   - 适合人群/注意事项（如有）
3. **语气**：亲切、有感染力、专业但不刻板
4. **禁止**：
   - 不要编造未提供的信息（如具体时间地点，除非用户已填写）
   - 不要出现"公司"、"企业"等外部词汇
   - 不要超过200字
   - 不要用"欢迎大家踊跃参加"等套话开头

## 风格参考
- **行动召唤型**：直接、有力，强调"来就对了"，用动词驱动
- **体验描绘型**：画面感强，让读者仿佛身临其境
- **信息详实型**：结构清晰，适合需要说明细节的活动（技术分享、培训类）`;

export type ActivityDescriptionInput = {
  title: string;
  activityKind: ActivityKind;
  location?: string;
  groupName?: string;
  tagNames?: string[];
};

type ActivityMeta = {
  highlight: string;
  flow: string;
  value: string;
  audience: string;
  scene: string;
};

const KIND_FLOW: Record<ActivityKind, string> = {
  one_off: "现场集中参与，围绕主题展开互动与实践",
  recurring: "按固定周期举办，每次聚焦一个子主题，便于持续跟进",
  series: "分多场递进推进，可按自身节奏选择参与场次",
};

const TAG_ACTIVITY_META: Record<string, Partial<ActivityMeta>> = {
  技术分享: {
    highlight: "聚焦前沿技术与实战经验",
    value: "收获可落地的方法与同行交流启发",
    audience: "对技术有热情、愿分享也愿倾听的伙伴",
    scene: "白板前观点碰撞、案例拆解层层深入",
  },
  AI实践: {
    highlight: "动手探索 AI 工具与落地场景",
    value: "把灵感变成可验证的小成果",
    audience: "想用 AI 提效、乐于试错迭代的伙伴",
    scene: "屏幕上代码与提示词交错，好点子不断冒出来",
  },
  读书会: {
    highlight: "共读精选书目，畅聊观点与感悟",
    value: "拓宽阅读视野，结识爱思考的读友",
    audience: "爱读书、愿意表达也乐于倾听的你",
    scene: "茶香与书页之间，思想缓缓交汇",
  },
  跑步: {
    highlight: "一起奔跑、互相配速、享受运动节奏",
    value: "养成运动习惯，在奔跑中释放压力",
    audience: "想动起来、无论快慢都欢迎加入的跑友",
    scene: "晨曦或夜色里，脚步声与呼吸同频",
  },
  徒步: {
    highlight: "结伴走向山野，感受自然与彼此陪伴",
    value: "暂别屏幕，在自然里充电回血",
    audience: "向往户外、愿意结伴探索的徒步爱好者",
    scene: "山风拂面，脚步丈量未看过的风景",
  },
  羽毛球: {
    highlight: "约球切磋、交流技法、享受对抗乐趣",
    value: "找到固定球友，场上场下都尽兴",
    audience: "爱挥拍、想稳定约球的你",
    scene: "清脆击球声里，默契在一来一回中生长",
  },
};

const DEFAULT_META: ActivityMeta = {
  highlight: "围绕主题展开深度体验与交流",
  flow: KIND_FLOW.one_off,
  value: "结识同好、收获新鲜体验与实用启发",
  audience: "对该主题感兴趣、愿意积极参与的伙伴",
  scene: "轻松而专注的氛围里，每个人都能找到参与感",
};

const clampText = (text: string, max = 200) =>
  text.length <= max ? text : `${text.slice(0, max - 1)}…`;

const resolveActivityTitle = (input: ActivityDescriptionInput): string => {
  const title = input.title.trim();
  if (title) return title;
  if (input.groupName?.trim()) {
    return `${input.groupName.trim()}·${ACTIVITY_KIND_LABEL[input.activityKind]}活动`;
  }
  const primaryTag = input.tagNames?.[0]?.trim();
  if (primaryTag) return `${primaryTag}主题活动`;
  return "本次主题活动";
};

const buildMeta = (input: ActivityDescriptionInput): ActivityMeta => {
  const primaryTag =
    input.tagNames?.find((name) => TAG_ACTIVITY_META[name]) ?? input.tagNames?.[0];
  const tagPart = primaryTag ? TAG_ACTIVITY_META[primaryTag] : undefined;
  const title = input.title.trim();

  let highlight = tagPart?.highlight ?? DEFAULT_META.highlight;
  if (title.length >= 4) {
    highlight = `以「${title}」为核心，${highlight}`;
  } else if (primaryTag) {
    highlight = `围绕${primaryTag}，${highlight}`;
  }

  return {
    highlight,
    flow: KIND_FLOW[input.activityKind],
    value: tagPart?.value ?? DEFAULT_META.value,
    audience: tagPart?.audience ?? DEFAULT_META.audience,
    scene: tagPart?.scene ?? DEFAULT_META.scene,
  };
};

const locationSuffix = (location?: string) => {
  const trimmed = location?.trim();
  return trimmed ? `地点：${trimmed}。` : "";
};

const pickStyle = (input: ActivityDescriptionInput): "A" | "B" | "C" => {
  const text = `${input.title} ${input.tagNames?.join("") ?? ""}`;
  if (/技术|AI|分享|培训|实践|研讨|读书|英语/.test(text)) return "C";
  if (/跑|徒步|球|健身|羽|户外/.test(text)) return "A";
  return "B";
};

const buildStyleA = (input: ActivityDescriptionInput, meta: ActivityMeta) => {
  const activityTitle = resolveActivityTitle(input);
  const groupHint = input.groupName?.trim()
    ? `由「${input.groupName.trim()}」发起，`
    : "";
  return clampText(
    `${groupHint}「${activityTitle}」值得你来！${meta.highlight}，${meta.flow}。参与其间你能${meta.value}，适合${meta.audience}。${locationSuffix(input.location)}`,
  );
};

const buildStyleB = (input: ActivityDescriptionInput, meta: ActivityMeta) => {
  const activityTitle = resolveActivityTitle(input);
  return clampText(
    `想象这样的画面：${meta.scene}。这正是「${activityTitle}」想带给你的——${meta.highlight}，${meta.flow}。你会${meta.value}。${locationSuffix(input.location)}`,
  );
};

const buildStyleC = (input: ActivityDescriptionInput, meta: ActivityMeta) => {
  const activityTitle = resolveActivityTitle(input);
  return clampText(
    `「${activityTitle}」${ACTIVITY_KIND_LABEL[input.activityKind]}活动｜亮点：${meta.highlight}。形式：${meta.flow}。适合${meta.audience}，你将${meta.value}。${locationSuffix(input.location)}`,
  );
};

/** 根据活动信息生成一条介绍（原型 mock） */
export const generateActivityDescription = (
  input: ActivityDescriptionInput,
): string => {
  const meta = buildMeta(input);
  const style = pickStyle(input);
  if (style === "A") return buildStyleA(input, meta);
  if (style === "C") return buildStyleC(input, meta);
  return buildStyleB(input, meta);
};

/** 模拟 AI 生成延迟 */
export const generateActivityDescriptionAsync = (
  input: ActivityDescriptionInput,
  delayMs = 700,
): Promise<string> =>
  new Promise((resolve) => {
    window.setTimeout(
      () => resolve(generateActivityDescription(input)),
      delayMs,
    );
  });

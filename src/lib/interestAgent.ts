import type { InterestGroupFull } from "@/data/interestTypes";
import {
  CURRENT_EMPLOYEE_ID,
  getJoinedGroups,
} from "@/data/interestGroups";
import {
  getUpcomingOccurrences,
  recommendGroups,
  type OccurrenceWithActivity,
  type ScoredGroup,
} from "./interestRecommend";

export type AgentIntent =
  | "recommend_group"
  | "list_activity"
  | "my_groups"
  | "create_hint"
  | "fallback";

export type AgentReply = {
  intent: AgentIntent;
  text: string;
  groups?: InterestGroupFull[];
  scoredGroups?: ScoredGroup[];
  occurrences?: OccurrenceWithActivity[];
};

export const parseIntent = (input: string): AgentIntent => {
  const q = input.trim().toLowerCase();
  if (/加入了哪些|我的小组|我的群组/.test(q)) return "my_groups";
  if (/推荐|跑步|摄影|小组|社群/.test(q)) return "recommend_group";
  if (/活动|报名|下周|团建|有什么/.test(q)) return "list_activity";
  if (/发起|创建|怎么建/.test(q)) return "create_hint";
  return "fallback";
};

export const buildReply = (
  intent: AgentIntent,
  viewerId: string = CURRENT_EMPLOYEE_ID,
): AgentReply => {
  switch (intent) {
    case "recommend_group": {
      const scored = recommendGroups(viewerId, 3);
      return {
        intent,
        text:
          scored.length > 0
            ? "根据你的兴趣，AI 为你挑选了这些小组："
            : "暂无更多推荐，可以先完善兴趣标签或浏览官方小组。",
        scoredGroups: scored,
      };
    }
    case "list_activity": {
      const occ = getUpcomingOccurrences(viewerId, 3);
      return {
        intent,
        text: "近期可参与的活动如下：",
        occurrences: occ,
      };
    }
    case "my_groups": {
      const groups = getJoinedGroups(viewerId);
      return {
        intent,
        text:
          groups.length > 0
            ? `你已加入 ${groups.length} 个兴趣小组：`
            : "你还没有加入任何小组，可以去首页看看推荐。",
        groups,
      };
    }
    case "create_hint":
      return {
        intent,
        text:
          "发起活动：进入已加入的小组 → 小组详情 → 发布活动。创建小组：在兴趣小组首页点击「创建小组」，填写信息后即可上线（请在7日内完成工会报备）。",
      };
    default:
      return {
        intent: "fallback",
        text:
          "你好！我是兴趣小组助手，可以帮你推荐小组、查询活动、查看已加入的社群。试试问我「推荐跑步小组」或「下周有什么活动」。",
      };
  }
};

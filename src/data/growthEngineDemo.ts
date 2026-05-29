import type { GrowthEngineNotificationType } from "@/data/growthEngineNotifications";

export type GrowthEngineDemoNotification = {
  id: string;
  type: GrowthEngineNotificationType;
  preview: string;
  time: string;
  link: string;
};

/** 成长引擎 demo：7 种场景各一条（静态展示，不区分用户） */
export const GROWTH_ENGINE_DEMO_NOTIFICATIONS: GrowthEngineDemoNotification[] =
  [
    {
      id: "demo-published",
      type: "activity_published",
      preview: "「健身房」发布了新活动「周三夜跑 5K」，快来看看",
      time: "10:32",
      link: "/agents/interest-groups/activities/act-1",
    },
    {
      id: "demo-enrolled",
      type: "activity_enrolled",
      preview: "李伟报名了「羽毛球友谊赛」，当前共 8 人报名",
      time: "10:28",
      link: "/agents/interest-groups/activities/act-6",
    },
    {
      id: "demo-starting-soon",
      type: "activity_starting_soon",
      preview: "「羽毛球友谊赛」将在 1 小时后开始，记得准时参加",
      time: "09:45",
      link: "/agents/interest-groups/activities/act-6",
    },
    {
      id: "demo-member-joined",
      type: "member_joined_group",
      preview: "王芳加入了「摄影社」，可前往小组详情查看",
      time: "09:15",
      link: "/agents/interest-groups/ig5",
    },
    {
      id: "demo-terminated",
      type: "activity_terminated",
      preview: "「三月主题展映系列」活动已终止，报名已作废",
      time: "昨天",
      link: "/agents/interest-groups/activities/act-e-org-3",
    },
    {
      id: "demo-ended-feedback",
      type: "activity_ended_feedback",
      preview: "「奥森春日人像外拍」已结束，欢迎留言分享你的感受与收获",
      time: "昨天",
      link: "/agents/interest-groups/activities/act-e-org-1",
    },
    {
      id: "demo-group-disbanded",
      type: "group_disbanded",
      preview: "「咖啡品鉴」已解散，感谢你的参与",
      time: "周一",
      link: "/agents/interest-groups/list/my-groups",
    },
  ];

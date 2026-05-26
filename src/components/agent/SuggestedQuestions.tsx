import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Sparkles } from "lucide-react";

const allQuestions = [
  ["帮我写一份季度述职报告", "查询本月剩余年假天数", "推荐适合我的内训课程"],
  ["如何申请出差报销？", "本季度业绩激励政策是什么", "给团队同事发送一张感恩卡"],
  ["最近有哪些团建活动？", "帮我预约下周三的会议室", "如何用积分兑换礼品？"],
  ["晋升答辩需要准备什么材料？", "查看我的导师推荐", "今年的销售激励方案"],
  ["匿名向 CEO 提一条建议", "查询本月考勤异常", "推荐一门 AI 相关课程"],
  ["帮我写一封给客户的感谢邮件", "公司食堂今日菜单", "如何加入兴趣小组？"],
];

const SuggestedQuestions = () => {
  const navigate = useNavigate();
  const [groupIdx, setGroupIdx] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const refresh = () => {
    setSpinning(true);
    setTimeout(() => {
      setGroupIdx((p) => (p + 1) % allQuestions.length);
      setSpinning(false);
    }, 350);
  };

  const current = allQuestions[groupIdx];

  return (
    <section className="mx-4 rounded-2xl gradient-card p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">可以这样问我</h2>
        </div>
        <button
          onClick={refresh}
          aria-label="换一批"
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-base active:scale-95 active:text-primary"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`} />
          换一批
        </button>
      </div>

      <div key={groupIdx} className="space-y-2 animate-fade-in-up">
        {current.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (q.includes("兴趣小组"))
                navigate("/agents/interest-groups");
            }}
            className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-left text-[13px] text-foreground transition-base active:scale-[0.98] active:border-primary/40 active:bg-accent"
          >
            <span className="line-clamp-1 flex-1 pr-2">{q}</span>
            <span className="text-primary">↗</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default SuggestedQuestions;

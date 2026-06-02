import { ArrowLeft, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { GROWTH_ENGINE_DEMO_NOTIFICATIONS } from "@/data/growthEngineDemo";

const GrowthEngineMessages = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack();

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-[#F8F8F8]">
      <header className="flex shrink-0 items-center gap-2 border-b border-[#ECECEC] bg-white px-3 py-3">
        <button
          type="button"
          aria-label="返回"
          onClick={goBack}
          className="flex h-9 w-9 items-center justify-center rounded-full active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#EDE8FF]">
            <Megaphone className="h-5 w-5 text-[#8B7CF6]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-[#1A1A1A]">沟通引擎</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide">
        <ul className="space-y-3">
          {GROWTH_ENGINE_DEMO_NOTIFICATIONS.map((item) => {
            const cardClass =
              "w-full rounded-2xl border border-[#EFEFEF] bg-white px-3.5 py-3 text-left shadow-sm";
            const content = (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#8B7CF6]">
                    [提醒]
                  </span>
                  <span className="text-xs text-[#B0B0B0]">{item.time}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#333333]">
                  {item.preview}
                </p>
              </>
            );

            return (
              <li key={item.id}>
                {item.link ? (
                  <button
                    type="button"
                    onClick={() => navigate(item.link!)}
                    className={`${cardClass} active:scale-[0.99]`}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={cardClass}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default GrowthEngineMessages;

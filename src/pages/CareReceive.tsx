import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { careModules, type CareType } from "@/data/humanityCare";
import { CareReceiveSimulator } from "@/components/care/CareReceiveSimulator";

const pointLabels: Record<CareType, string> = {
  birthday: "生日慰问金",
  festival: "节日慰问金",
  weather: "关怀提示",
  workload: "辛苦补贴",
};

const CareReceive = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: CareType }>();
  const [params] = useSearchParams();
  const moduleType: CareType = (type as CareType) ?? "birthday";
  const mod = careModules[moduleType];
  const hasPoints = moduleType !== "weather";
  const points = Number(params.get("points") ?? (hasPoints ? 50 : 0));
  const content = params.get("content") ?? mod.templates[0];
  const pointName = pointLabels[moduleType];

  return (
    <>
      <h1 className="sr-only">查收{mod.name}通知</h1>
      <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
        {/* IM 顶栏 */}
        <header className="flex items-center gap-2 border-b border-border bg-card px-3 py-3">
          <button
            aria-label="返回"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-base active:scale-90 hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-primary-foreground">
            <Heart className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">
              关怀与福利引擎
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              来自公司 · {mod.name}
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1">
          <CareReceiveSimulator
            moduleType={moduleType}
            content={content}
            points={points}
            pointName={pointName}
            hasPoints={hasPoints}
          />
        </div>
      </div>
    </>
  );
};

export default CareReceive;

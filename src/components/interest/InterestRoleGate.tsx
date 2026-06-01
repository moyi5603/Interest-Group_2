import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { canManageInterestGroups } from "@/lib/appRoleStore";

type Props = {
  actionLabel: string;
  backLabel?: string;
  onBack?: () => void;
  children: ReactNode;
};

/** 创建小组、发布活动等页面：仅管理员身份可进入 */
const InterestRoleGate = ({
  actionLabel,
  backLabel = "返回",
  onBack,
  children,
}: Props) => {
  const goBack = useNavigateBack();

  if (canManageInterestGroups()) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          aria-label="返回"
          onClick={onBack ?? goBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
        <p className="text-center text-sm text-muted-foreground">
          仅管理员身份可{actionLabel}
        </p>
        <p className="text-center text-xs text-muted-foreground">
          请在兴趣小组首页右上角切换为「管理员」后再试
        </p>
        <button
          type="button"
          onClick={onBack ?? goBack}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
};

export default InterestRoleGate;

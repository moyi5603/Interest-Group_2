import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, User, Users } from "lucide-react";
import type { AppRole } from "@/lib/appRoleStore";
import { cn } from "@/lib/utils";

const ROLES: {
  value: AppRole;
  label: string;
  icon: typeof User;
}[] = [
  { value: "employee", label: "员工", icon: User },
  { value: "manager", label: "管理员", icon: Users },
];

type Props = {
  value: AppRole;
  onChange: (role: AppRole) => void;
  className?: string;
};

const RoleIdentitySwitcher = ({ value, onChange, className }: Props) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = ROLES.find((r) => r.value === value) ?? ROLES[0];
  const CurrentIcon = current.icon;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const selectRole = (role: AppRole) => {
    setOpen(false);
    if (role !== value) onChange(role);
  };

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="切换角色身份"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full bg-secondary/90 py-1 pl-2 pr-1.5 text-sm font-medium text-foreground transition-base active:scale-[0.98]"
      >
        <CurrentIcon className="h-4 w-4 text-primary" strokeWidth={2} />
        <span>{current.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="角色身份"
          className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[132px] overflow-hidden rounded-xl border border-border/60 bg-background py-1 shadow-lg"
        >
          {ROLES.map(({ value: role, label, icon: Icon }) => {
            const active = role === value;
            return (
              <li key={role} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => selectRole(role)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm",
                    active
                      ? "bg-primary/5 font-medium text-foreground"
                      : "text-foreground active:bg-secondary/60",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                    strokeWidth={2}
                  />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <Check className="h-4 w-4 text-primary" strokeWidth={2} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RoleIdentitySwitcher;

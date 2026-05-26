import {
  Building2,
  ChevronRight,
  Users,
  UserCheck,
  Briefcase,
  Target,
  Flag,
  FileText,
} from "lucide-react";
import { getEmployee, getDeptEmployees, type DeptFull } from "@/data/colleagueData";
import type { Section } from "./deptSearch";

const sectionMeta: Record<Section, { label: string; icon: typeof Flag }> = {
  intro: { label: "部门简介", icon: FileText },
  culture: { label: "部门文化", icon: Flag },
  head: { label: "部门负责人", icon: UserCheck },
  duty: { label: "部门职能", icon: Briefcase },
  kpi: { label: "绩效指标", icon: Target },
  members: { label: "部门成员", icon: Users },
};

const DeptResultCard = ({
  dept,
  sections,
  onOpen,
  onOpenEmployee,
}: {
  dept: DeptFull;
  sections: Section[];
  onOpen: () => void;
  onOpenEmployee: (id: string) => void;
}) => {
  const head = getEmployee(dept.headId);
  const employees = getDeptEmployees(dept.id);
  const visibleEmps = employees.slice(0, 5);

  const order: Section[] = ["intro", "culture", "head", "duty", "kpi", "members"];
  const ordered = order.filter((s) => sections.includes(s));

  return (
    <section className="rounded-2xl bg-card shadow-soft overflow-hidden">
      <button
        onClick={onOpen}
        className="flex w-full items-center gap-3 px-4 py-3 text-left bg-gradient-to-r from-primary/8 to-accent/40 transition-base active:scale-[0.99]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{dept.name}</p>
          <p className="text-[11px] text-muted-foreground">{dept.count} 人</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="p-4 space-y-3">
        {ordered.map((sec) => {
          const meta = sectionMeta[sec];
          const Icon = meta.icon;
          return (
            <div key={sec}>
              <div className="mb-2 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">{meta.label}</span>
              </div>

              {sec === "intro" && (
                <p className="text-xs leading-relaxed text-foreground/80">{dept.description}</p>
              )}

              {sec === "culture" && dept.mission && (
                <div className="rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2">
                  <p className="text-xs italic leading-relaxed text-foreground/85">
                    "{dept.mission}"
                  </p>
                </div>
              )}

              {sec === "head" &&
                (head ? (
                  <button
                    onClick={() => onOpenEmployee(head.id)}
                    className="flex w-full items-center gap-3 rounded-xl bg-secondary/50 p-2.5 text-left transition-base active:scale-[0.99]"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: `hsl(${head.avatarColor})` }}
                    >
                      {head.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{head.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{head.position}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ) : (
                  <p className="text-xs text-muted-foreground">暂无负责人信息</p>
                ))}

              {sec === "duty" &&
                (dept.responsibilities && dept.responsibilities.length > 0 ? (
                  <ul className="space-y-1.5">
                    {dept.responsibilities.map((r, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-xs leading-relaxed text-foreground/85"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">暂无职能信息</p>
                ))}

              {sec === "kpi" &&
                (dept.kpis && dept.kpis.length > 0 ? (
                  <div className="space-y-1.5">
                    {dept.kpis.map((k, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-secondary/50 px-3 py-1.5 text-xs leading-relaxed text-foreground/85"
                      >
                        {k}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">暂无绩效信息</p>
                ))}

              {sec === "members" &&
                (employees.length > 0 ? (
                  <div className="space-y-1.5">
                    {visibleEmps.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => onOpenEmployee(emp.id)}
                        className="flex w-full items-center gap-2.5 rounded-lg bg-secondary/40 px-2.5 py-2 text-left transition-base active:scale-[0.99]"
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: `hsl(${emp.avatarColor})` }}
                        >
                          {emp.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {emp.position}
                          </p>
                        </div>
                      </button>
                    ))}
                    {employees.length > visibleEmps.length && (
                      <button
                        onClick={onOpen}
                        className="w-full rounded-lg py-1.5 text-[11px] text-primary"
                      >
                        查看全部 {employees.length} 人 →
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">暂无成员信息</p>
                ))}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DeptResultCard;

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNavigateBack } from "@/hooks/useNavigateBack";
import { useUrlEnumParam } from "@/hooks/useUrlEnumParam";
import { ArrowLeft, Building2, Users, ChevronRight, FolderOpen, Flag, Briefcase, Target, UserCheck } from "lucide-react";
import { getDept, getDeptEmployees, deptsFull, getEmployee } from "@/data/colleagueData";

type TabKey = "overview" | "duty";

const tabKeys: TabKey[] = ["overview", "duty"];

const DepartmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const dept = getDept(id || "");
  const [tab, setTab] = useUrlEnumParam<TabKey>("tab", "overview", tabKeys);
  const [showAllEmp, setShowAllEmp] = useState(false);

  if (!dept) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center bg-background">
        <p className="text-muted-foreground">未找到该部门</p>
      </div>
    );
  }

  const head = getEmployee(dept.headId);
  const childDepts = deptsFull.filter((d) => d.parentId === dept.id);
  const employees = getDeptEmployees(dept.id);
  const parentDept = dept.parentId ? getDept(dept.parentId) : null;
  const visibleEmployees = showAllEmp ? employees : employees.slice(0, 6);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "概览" },
    { key: "duty", label: "职能" },
  ];

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
        <button
          onClick={goBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-base active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-foreground">{dept.name}</h1>
      </header>

      {/* Tabs */}
      <div className="sticky top-[64px] z-20 flex gap-1 border-b border-border/50 bg-background/85 px-4 backdrop-blur-lg">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 py-3 text-sm font-medium transition-base ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t.label}
              {active && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-3 pb-6 scrollbar-hide space-y-3">
        {tab === "overview" && (
          <>
            {/* Header card */}
            <section className="rounded-2xl bg-card p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-foreground">{dept.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{dept.description}</p>
                </div>
              </div>

              {/* Culture inline */}
              {dept.mission && (
                <div className="mt-3 flex gap-2 rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2">
                  <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <p className="text-xs italic leading-relaxed text-foreground/85">"{dept.mission}"</p>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <div className="flex-1 rounded-xl bg-secondary/60 p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{dept.count}</p>
                  <p className="text-[10px] text-muted-foreground">总人数</p>
                </div>
                <div className="flex-1 rounded-xl bg-secondary/60 p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{childDepts.length}</p>
                  <p className="text-[10px] text-muted-foreground">子部门</p>
                </div>
                <div className="flex-1 rounded-xl bg-secondary/60 p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{employees.length}</p>
                  <p className="text-[10px] text-muted-foreground">直属员工</p>
                </div>
              </div>

              {parentDept && (
                <button
                  onClick={() => navigate(`/colleagues/dept/${parentDept.id}`)}
                  className="mt-3 flex items-center gap-1 text-xs text-primary"
                >
                  上级部门: {parentDept.name} <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </section>

            {/* Dept head */}
            {head && (
              <section className="rounded-2xl bg-card p-4 shadow-soft">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UserCheck className="h-4 w-4 text-primary" />
                  部门负责人
                </h3>
                <button
                  onClick={() => navigate(`/colleagues/employee/${head.id}`)}
                  className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/50 p-3 text-left transition-base active:scale-[0.99]"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: `hsl(${head.avatarColor})` }}
                  >
                    {head.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{head.name}</p>
                    <p className="text-xs text-muted-foreground">{head.position}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </section>
            )}

            {/* Sub-departments */}
            {childDepts.length > 0 && (
              <section className="rounded-2xl bg-card p-4 shadow-soft">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  子部门 ({childDepts.length})
                </h3>
                <div className="space-y-2">
                  {childDepts.map((cd) => (
                    <button
                      key={cd.id}
                      onClick={() => navigate(`/colleagues/dept/${cd.id}`)}
                      className="flex w-full items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2.5 text-left transition-base active:scale-[0.99]"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-foreground">{cd.name}</p>
                        <p className="text-[10px] text-muted-foreground">{cd.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{cd.count}人</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Employees */}
            <section className="rounded-2xl bg-card p-4 shadow-soft">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                部门员工 ({employees.length})
              </h3>
              {employees.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {visibleEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => navigate(`/colleagues/employee/${emp.id}`)}
                        className="flex w-full items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2.5 text-left transition-base active:scale-[0.99]"
                      >
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: `hsl(${emp.avatarColor})` }}
                        >
                          {emp.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-foreground">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{emp.position}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                  {employees.length > 6 && (
                    <button
                      onClick={() => setShowAllEmp((v) => !v)}
                      className="mt-3 w-full rounded-xl bg-secondary/40 py-2.5 text-xs font-medium text-primary transition-base active:scale-[0.99]"
                    >
                      {showAllEmp ? "收起" : `查看全部 ${employees.length} 人 →`}
                    </button>
                  )}
                </>
              ) : (
                <p className="py-4 text-center text-xs text-muted-foreground">暂无直属员工数据</p>
              )}
            </section>
          </>
        )}

        {tab === "duty" && (
          <>
            {dept.responsibilities && dept.responsibilities.length > 0 && (
              <section className="rounded-2xl bg-card p-4 shadow-soft">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Briefcase className="h-4 w-4 text-primary" />
                  部门职能
                </h3>
                <ul className="space-y-2">
                  {dept.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/85">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {dept.kpis && dept.kpis.length > 0 && (
              <section className="rounded-2xl bg-card p-4 shadow-soft">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  绩效指标
                </h3>
                <div className="space-y-2">
                  {dept.kpis.map((k, i) => (
                    <div key={i} className="rounded-lg bg-secondary/50 px-3 py-2 text-xs leading-relaxed text-foreground/85">
                      {k}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(!dept.responsibilities || dept.responsibilities.length === 0) &&
              (!dept.kpis || dept.kpis.length === 0) && (
                <p className="py-8 text-center text-xs text-muted-foreground">暂无职能与绩效信息</p>
              )}
          </>
        )}
      </main>
    </div>
  );
};

export default DepartmentDetail;

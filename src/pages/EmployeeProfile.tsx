import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Award, Star, Coins, Users } from "lucide-react";
import GroupAvatar from "@/components/interest/GroupAvatar";
import { getEmployee, getYearsOfService } from "@/data/colleagueData";
import { getGroupById } from "@/data/interestGroups";
import { resolveGroupCover } from "@/data/interestImages";

/* Tenure tier system */
const getTenureTier = (years: number) => {
  if (years >= 10) return { label: "传奇", color: "350 85% 55%", gradient: "from-rose-500 via-purple-500 to-indigo-500", rings: 5 };
  if (years >= 7) return { label: "钻石", color: "200 85% 55%", gradient: "from-cyan-400 via-blue-500 to-indigo-500", rings: 4 };
  if (years >= 5) return { label: "铂金", color: "45 95% 55%", gradient: "from-amber-400 via-yellow-400 to-orange-400", rings: 3 };
  if (years >= 3) return { label: "黄金", color: "25 95% 55%", gradient: "from-orange-400 to-amber-500", rings: 2 };
  return { label: "新锐", color: "160 70% 45%", gradient: "from-emerald-400 to-teal-500", rings: 1 };
};

const EmployeeProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const emp = getEmployee(id || "");

  if (!emp) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center bg-background">
        <p className="text-muted-foreground">未找到该员工</p>
      </div>
    );
  }

  const years = getYearsOfService(emp.joinDate);
  const tier = getTenureTier(years);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/85 px-3 py-3 backdrop-blur-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-base active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-foreground">{emp.name} 的主页</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide space-y-4">
        {/* Profile hero */}
        <section className="flex flex-col items-center rounded-2xl bg-card p-6 shadow-soft">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-glow"
            style={{ background: `hsl(${emp.avatarColor})` }}
          >
            {emp.name[0]}
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">{emp.name}</h2>
          <p className="text-sm text-muted-foreground">{emp.position} · {emp.deptName}</p>
          <p className="mt-2 text-center text-xs text-muted-foreground leading-relaxed max-w-[260px]">{emp.bio}</p>
        </section>

        {/* Tenure chart */}
        <section className="rounded-2xl bg-card p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            司龄等级
          </h3>
          <div className="flex items-center gap-4">
            {/* Rings visual */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute rounded-full border-2 ${
                    i < tier.rings ? `border-transparent bg-gradient-to-br ${tier.gradient} opacity-${100 - i * 15}` : "border-border"
                  }`}
                  style={{
                    width: `${96 - i * 16}px`,
                    height: `${96 - i * 16}px`,
                    opacity: i < tier.rings ? 1 - i * 0.15 : 0.15,
                    background: i < tier.rings ? undefined : "transparent",
                  }}
                />
              ))}
              <span className="relative z-10 text-lg font-bold text-foreground">{years}年</span>
            </div>
            <div className="flex-1">
              <div className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${tier.gradient} px-3 py-1 text-xs font-semibold text-white`}>
                <Star className="h-3 w-3" />
                {tier.label}
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                入职于 {emp.joinDate}，已在公司服务 {years} 年
              </p>
              {/* Tier progress bar */}
              <div className="mt-3 space-y-1">
                {["新锐", "黄金", "铂金", "钻石", "传奇"].map((t, i) => {
                  const thresholds = [0, 3, 5, 7, 10];
                  const active = years >= thresholds[i];
                  return (
                    <div key={t} className="flex items-center gap-2">
                      <span className={`w-8 text-[10px] ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{t}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${tier.gradient} transition-all`}
                          style={{ width: active ? "100%" : "0%" }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{thresholds[i]}+年</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Points card */}
        <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-primary/5 p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">积分卡</span>
            </div>
            <span className="text-2xl font-bold text-primary">{emp.points.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{emp.badges.length}</p>
              <p className="text-[10px] text-muted-foreground">勋章数</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{emp.projects.length}</p>
              <p className="text-[10px] text-muted-foreground">项目数</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{emp.interestGroups.length}</p>
              <p className="text-[10px] text-muted-foreground">兴趣组</p>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="rounded-2xl bg-card p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-foreground mb-3">🏅 荣誉勋章</h3>
          <div className="grid grid-cols-3 gap-3">
            {emp.badges.map((b) => (
              <div key={b.id} className="flex flex-col items-center gap-1.5 rounded-xl bg-secondary/50 p-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-soft ${
                  b.level === "gold" ? "bg-gradient-to-br from-amber-100 to-amber-200" :
                  b.level === "silver" ? "bg-gradient-to-br from-gray-100 to-gray-200" :
                  "bg-gradient-to-br from-orange-50 to-orange-100"
                }`}>
                  {b.icon}
                </div>
                <span className="text-xs font-medium text-foreground text-center">{b.name}</span>
                <span className="text-[10px] text-muted-foreground">{b.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Interest groups */}
        <section className="rounded-2xl bg-card p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            兴趣小组
          </h3>
          <div className="space-y-2">
            {emp.interestGroups.map((g) => {
              const fullGroup = getGroupById(g.id);
              const cover = resolveGroupCover({
                id: g.id,
                coverUrl: fullGroup?.coverUrl,
              });
              return (
                <div
                  key={g.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/agents/interest-groups/${g.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      navigate(`/agents/interest-groups/${g.id}`);
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2.5 active:scale-[0.99]"
                >
                  <GroupAvatar
                    coverUrl={cover}
                    name={g.name}
                    className="h-9 w-9 text-sm"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{g.name}</p>
                    <p className="text-[10px] text-muted-foreground">{g.members} 位成员</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmployeeProfile;

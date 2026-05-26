import { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MessageSquare, Phone, Heart, ChevronLeft, ChevronRight, CreditCard, GraduationCap, MoreHorizontal, Users, ChevronRight as ChevronRightSmall, Coins, Award, Shield } from "lucide-react";
import GroupAvatar from "@/components/interest/GroupAvatar";
import { getEmployee, getYearsOfService } from "@/data/colleagueData";
import { getGroupById } from "@/data/interestGroups";
import { resolveGroupCover } from "@/data/interestImages";

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const stateIds: string[] | undefined = (location.state as any)?.employeeIds;
  const employeeIds = stateIds && stateIds.length > 0 ? stateIds : [id || ""];
  const initialIndex = employeeIds.indexOf(id || "");
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [showMore, setShowMore] = useState(false);

  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const currentEmpId = employeeIds[currentIndex];
  const emp = getEmployee(currentEmpId);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < employeeIds.length - 1;
  const hasMultiple = employeeIds.length > 1;

  const goTo = (idx: number) => {
    setCurrentIndex(idx);
    const newId = employeeIds[idx];
    navigate(`/colleagues/employee/${newId}`, { state: { employeeIds }, replace: true });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - touchStartX.current;
    touchDeltaX.current = delta;
    if ((delta > 0 && canPrev) || (delta < 0 && canNext)) {
      setOffsetX(delta * 0.3);
    }
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    setOffsetX(0);
    const threshold = 80;
    if (touchDeltaX.current > threshold && canPrev) {
      goTo(currentIndex - 1);
    } else if (touchDeltaX.current < -threshold && canNext) {
      goTo(currentIndex + 1);
    }
  };

  if (!emp) {
    return (
      <div className="mx-auto flex h-screen max-w-md items-center justify-center bg-background">
        <p className="text-muted-foreground">未找到该员工</p>
      </div>
    );
  }

  const years = getYearsOfService(emp.joinDate);
  const displayBadges = emp.badges.slice(0, 6);
  const likeCount = Math.floor(emp.points * 0.3 + emp.badges.length * 12);
  const collaborations = emp.projects.length * 3 + emp.interestGroups.length * 5;

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background overflow-hidden relative">
      {/* Photo area - 40% height, full width */}
      <div
        className="relative w-full shrink-0"
        style={{ height: "40%" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="h-full w-full transition-transform"
          style={{
            transform: `translateX(${offsetX}px)`,
            transitionDuration: swiping ? "0ms" : "300ms",
          }}
        >
          {emp.avatarUrl ? (
            <img
              src={emp.avatarUrl}
              alt={emp.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-6xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${emp.avatarColor}), hsl(${emp.avatarColor} / 0.6))`,
              }}
            >
              {emp.name[0]}
            </div>
          )}

          {/* Online status dot on avatar */}
          {emp.isOnline !== undefined && (
            <span className={`absolute bottom-8 right-4 h-4 w-4 rounded-full border-2 border-background shadow-sm ${emp.isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
          )}

          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />

          <button
            onClick={() => navigate(-1)}
            className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-base active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>


          {hasMultiple && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {employeeIds.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swipe arrows at badges section height */}
      {canPrev && (
        <button
          onClick={() => goTo(currentIndex - 1)}
          className="absolute left-1 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-sm text-primary active:scale-95"
          style={{ top: "60%" }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => goTo(currentIndex + 1)}
          className="absolute right-1 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-sm text-primary active:scale-95"
          style={{ top: "60%" }}
        >
          <ChevronRightSmall className="h-5 w-5" />
        </button>
      )}

      {/* Info section - scrollable */}
      <div className="flex-1 overflow-y-auto -mt-6 relative z-10">
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-foreground">{emp.name}</h2>
            {emp.isManager && (
              <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                <Shield className="h-3 w-3" />部门负责人
              </span>
            )}
            {emp.isOnDuty && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />值班中
              </span>
            )}
            {emp.isOnline !== undefined && (
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${emp.isOnline ? 'bg-green-500/10 text-green-600' : 'bg-muted/60 text-muted-foreground'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${emp.isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                {emp.isOnline ? '在线' : '离线'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {emp.position} ·{" "}
            <button
              onClick={() => navigate(`/colleagues/dept/${emp.deptId}`)}
              className="text-primary underline underline-offset-2"
            >
              {emp.deptName}
            </button>
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {emp.skills.slice(0, 4).map((s) => (
              <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-start gap-2">
            <span className="text-lg text-muted-foreground/40 leading-none">"</span>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{emp.bio}</p>
          </div>

          <div className="mt-3 flex gap-4 text-muted-foreground">
            <span className="text-xs">📅 {years}年司龄</span>
            <span className="text-xs">❤️ {likeCount} 点赞</span>
            <span className="text-xs">🤝 {collaborations} 协作</span>
          </div>
        </div>

        {/* Badges section */}
        <div className="mx-4 mb-3 rounded-2xl bg-card p-4 shadow-soft border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">🏅 荣誉勋章</h3>
            <button
              onClick={() => navigate(`/colleagues/employee/${currentEmpId}/badges`)}
              className="flex items-center gap-0.5 text-xs text-primary"
            >
              全部 <ChevronRightSmall className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {displayBadges.map((b) => (
              <div key={b.id} className="flex flex-col items-center gap-1.5 w-14">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-soft ${
                  b.level === "gold" ? "bg-gradient-to-br from-amber-100 to-amber-200" :
                  b.level === "silver" ? "bg-gradient-to-br from-gray-100 to-gray-200" :
                  "bg-gradient-to-br from-orange-50 to-orange-100"
                }`}>
                  {b.icon}
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Points card section */}
        <div className="mx-4 mb-3 rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-primary/5 p-4 shadow-soft border border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              积分卡
            </h3>
            <button
              onClick={() => navigate(`/colleagues/employee/${currentEmpId}/points`)}
              className="flex items-center gap-0.5 text-xs text-primary"
            >
              全部 <ChevronRightSmall className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">最近获得</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {emp.badges.length > 0 ? `${emp.badges[0].name} +100` : "暂无记录"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">总积分</p>
              <p className="text-2xl font-bold text-primary">{emp.points.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">共 {emp.badges.length} 张积分卡</p>
          </div>
        </div>

        {/* Interest groups */}
        <div className="mx-4 mb-3 rounded-2xl bg-secondary p-4 shadow-soft border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              兴趣小组
            </h3>
            <button
              onClick={() => navigate(`/colleagues/employee/${currentEmpId}/groups`)}
              className="flex items-center gap-0.5 text-xs text-primary"
            >
              全部 <ChevronRightSmall className="h-3.5 w-3.5" />
            </button>
          </div>
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
                  className="flex cursor-pointer items-center gap-3 rounded-xl bg-background px-3 py-2.5 active:scale-[0.99]"
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
        </div>
      </div>

      {/* Bottom action buttons */}
      <div className="relative shrink-0 bg-background px-4 py-3">
        {showMore && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowMore(false)} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex gap-5 rounded-2xl bg-card border-2 border-primary/20 px-6 py-4 shadow-2xl z-40 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <ActionButton icon={CreditCard} label="发积分" color="35 90% 55%" />
              <ActionButton icon={GraduationCap} label="申请导师" color="250 70% 60%" />
              <ActionButton icon={Award} label="认可技能" color="170 70% 45%" />
            </div>
          </>
        )}
        <div className="flex items-center justify-center gap-5">
          <ActionButton icon={MessageSquare} label="发消息" color="210 90% 60%" />
          <ActionButton icon={Phone} label="打电话" color="160 70% 45%" />
          <ActionButton icon={Heart} label="点赞" color="350 85% 55%" filled />
          <ActionButton
            icon={MoreHorizontal}
            label="更多"
            color="0 0% 50%"
            onClick={() => setShowMore(!showMore)}
          />
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  color,
  filled,
  onClick,
}: {
  icon: any;
  label: string;
  color: string;
  filled?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 transition-base active:scale-90"
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm ${
          filled ? "text-white" : "bg-card border border-border"
        }`}
        style={filled ? { background: `hsl(${color})` } : {}}
      >
        <Icon
          className="h-5 w-5"
          style={!filled ? { color: `hsl(${color})` } : {}}
          fill={filled ? "currentColor" : "none"}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </button>
  );
};

export default EmployeeDetail;

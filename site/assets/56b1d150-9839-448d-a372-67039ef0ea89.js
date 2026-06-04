// mobile-cards.jsx — shared cards + nav context for the employee app.
const MobileCtx = React.createContext(null);
const useM = () => React.useContext(MobileCtx);

function SectionHeader({ title, sub, action, onAction, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '0 0 13px' }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: -0.2,
          display: 'flex', alignItems: 'center', gap: 7 }}>
          {accent && <span style={{ width: 6, height: 18, borderRadius: 99, background: accent }} />}{title}
        </div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>{sub}</div>}
      </div>
      {action && <button onClick={onAction} style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>{action}<Icon name="chevR" size={15} /></button>}
    </div>
  );
}

function AvatarStack({ names = [], n = 4, size = 24, extra }) {
  const show = names.slice(0, n);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {show.map((nm, i) => <div key={i} style={{ marginLeft: i ? -9 : 0, zIndex: n - i }}>
        <Avatar name={nm} size={size} style={{ boxShadow: '0 0 0 2px var(--surface)' }} /></div>)}
      {extra > 0 && <div style={{ marginLeft: -9, width: size, height: size, borderRadius: '50%',
        background: 'var(--bg-2)', color: 'var(--ink-2)', fontSize: size * 0.34, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px var(--surface)' }}>+{extra}</div>}
    </div>
  );
}

function MetaRow({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
      <Icon name={icon} size={15} stroke={2} style={{ color: 'var(--ink-3)' }} />
      <span className="clamp1">{children}</span>
    </div>
  );
}

function needsDetailEnroll(type) {
  return type === 'recurring' || type === 'series';
}

function handleActivityEnrollClick(e, a, actions, nav) {
  e.stopPropagation();
  const enrollViaDetail = needsDetailEnroll(a.type);
  if (enrollViaDetail) {
    const sessions = a.sessions;
    const joined = sessions ? sessions.filter(s => s.joinedByMe).length : 0;
    if (sessions && a.joinedByMe && joined === 1) {
      actions.setSessionSignups(a.id, []);
      toast('已取消报名', { icon: 'check' });
      return;
    }
    nav.go('activity', { aid: a.id, pickEnroll: sessions });
    return;
  }
  actions.toggleSignup(a.id);
}

// big activity card (feed)
function ActivityCard({ a, onClick, recReason }) {
  const { actions, store, nav } = useM();
  const cur = store.acts.find(x => x.id === a.id) || a;
  const g = store.groups.find(x => x.id === a.gid);
  const moms = DB.moments.filter(m => m.aid === a.id);
  const cancelled = cur.status === 'cancelled';
  const ended = cur.status === 'ended' || cancelled;
  const enrollViaDetail = needsDetailEnroll(cur.type);
  const cardTitle = a.type === 'series' && a.series
    ? (a.seriesIdx ? `${a.series} · 第${a.seriesIdx}期` : a.series)
    : a.title;
  return (
    <div onClick={onClick} className="rise" style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow)', overflow: 'hidden', cursor: 'pointer' }}>
      <div style={{ position: 'relative', height: 152 }}>
        <Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} dim />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <CatBadge cat={a.cat} size="sm" solid />
          {cur.ai && <AIPill label="AI 共创" />}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}><TypeTag type={a.type} /></div>
        {!ended && (
          <div style={{ position: 'absolute', bottom: 11, right: 12, display: 'flex', gap: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 800, color: '#fff', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 99 }}>
              <Icon name="heart" size={15} fill={cur.liked} />{cur.likes}</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 28%, rgba(0,0,0,0.72))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px 15px 13px' }}>
          {g && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 3 }} className="clamp1">{g.name}</div>}
          <div style={{ fontSize: 15.5, fontWeight: 800, lineHeight: 1.3, letterSpacing: -0.2, color: '#fff', paddingRight: ended ? 0 : 52 }} className="clamp1">{cardTitle}</div>
          {ended && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 4 }}>
              {cancelled ? '已终止' : `已结束${moms.length ? ` · ${moms.length} 条精彩瞬间` : ''}`}
            </div>
          )}
        </div>
      </div>
      {!ended && (
        <div style={{ padding: '12px 15px 13px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recReason ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500, minWidth: 0 }}>
                <Sparkles size={15} color="var(--ai)" style={{ flexShrink: 0 }} />
                <span className="clamp1" style={{ color: 'var(--ink-2)' }}>
                  <span style={{ color: 'var(--ai)', fontWeight: 700 }}>{recReason}</span>
                  <span style={{ color: 'var(--ink-3)' }}> · {a.date} · {a.time}</span>
                </span>
              </div>
            ) : (
              <MetaRow icon="calendar">{a.date} · {a.time}</MetaRow>
            )}
            {a.loc && <MetaRow icon="pin">{a.loc}</MetaRow>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '11px 0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 5 }}>
                <span style={{ color: 'var(--ink-2)' }}>已报名 {cur.signed}/{a.cap}</span>
                <span style={{ color: cur.signed >= a.cap ? 'var(--brand)' : 'var(--ink-3)' }}>{cur.signed >= a.cap ? '已满员' : `余 ${a.cap - cur.signed} 位`}</span>
              </div>
              <ProgressBar value={cur.signed} max={a.cap} color={CATS[a.cat].color} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <AvatarStack names={DB.NAMES.slice(0, 6)} n={4} size={26} extra={Math.max(0, cur.signed - 4)} />
            <Btn variant={cur.joinedByMe ? 'ghost' : 'primary'} size="sm"
              icon={cur.joinedByMe ? 'check' : 'ticket'}
              onClick={e => handleActivityEnrollClick(e, cur, actions, nav)}>
              {cur.joinedByMe ? (enrollViaDetail ? '取消报名' : '已报名') : (enrollViaDetail ? '选场次报名' : '报名')}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// compact list row
function ActivityRow({ a, onClick }) {
  const { store } = useM();
  const cur = store.acts.find(x => x.id === a.id) || a;
  return (
    <div onClick={onClick} style={{ display: 'flex', gap: 12, padding: 11, background: 'var(--surface)',
      borderRadius: 'var(--r)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', alignItems: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
        <Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700 }} className="clamp1">{a.title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', margin: '3px 0 6px' }} className="clamp1">{a.date} · {a.time}</div>
        <div style={{ display: 'flex', gap: 6 }}><CatBadge cat={a.cat} size="sm" /><TypeTag type={a.type} /></div>
      </div>
      <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />
    </div>
  );
}

// AI recommendation card (horizontal)
function RecCard({ a, reason, onClick }) {
  const { store, actions, nav } = useM();
  const cur = store.acts.find(x => x.id === a.id) || a;
  const enrollViaDetail = needsDetailEnroll(cur.type);
  return (
    <div onClick={onClick} style={{ width: 230, flexShrink: 0, background: 'var(--surface)', borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow)', overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start' }}>
      <div style={{ position: 'relative', height: 110 }}>
        <Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} dim />
        <div style={{ position: 'absolute', top: 10, left: 10 }}><CatBadge cat={a.cat} size="sm" solid /></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.65))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px 11px' }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, lineHeight: 1.3, color: '#fff' }} className="clamp2">{a.title}</div>
        </div>
      </div>
      <div style={{ padding: '10px 11px 11px' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }} className="clamp1">{a.date.slice(0, 7)} · {a.time.split(' ')[0]}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 9px', borderRadius: 11,
          background: 'var(--ai-soft)', marginBottom: 10 }}>
          <Sparkles size={14} color="var(--ai)" />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ai)', lineHeight: 1.3 }} className="clamp2">{reason}</span>
        </div>
        <Btn variant={cur.joinedByMe ? 'ghost' : 'primary'} size="sm" full icon={cur.joinedByMe ? 'check' : 'ticket'}
          onClick={e => handleActivityEnrollClick(e, cur, actions, nav)}>{cur.joinedByMe ? (enrollViaDetail ? '取消报名' : '已报名') : (enrollViaDetail ? '选场次报名' : '一键报名')}</Btn>
      </div>
    </div>
  );
}

// group card (horizontal + list)
function GroupCard({ g, onClick, wide }) {
  const { store, actions } = useM();
  const cur = store.groups.find(x => x.id === g.id) || g;
  return (
    <div onClick={onClick} style={{ width: wide ? 'auto' : 256, flexShrink: 0, background: 'var(--surface)',
      borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow)', overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start' }}>
      <div style={{ position: 'relative', height: 96 }}>
        <Photo seed={g.id + g.cat} icon={CATS[g.cat].icon} dim />
        <div style={{ position: 'absolute', top: 10, left: 10 }}><CatBadge cat={g.cat} size="sm" solid /></div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }} className="clamp1">{g.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '5px 0 11px', lineHeight: 1.5 }} className="clamp2">{g.intro}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AvatarStack names={DB.NAMES.slice(2, 8)} n={3} size={24} />
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{cur.members} 人</span>
          </div>
          <Btn variant={cur.joined ? 'ghost' : 'soft'} size="sm" icon={cur.joined ? 'check' : 'plus'}
            onClick={e => { e.stopPropagation(); actions.toggleJoin(g.id); }}>{cur.joined ? '已加入' : '加入'}</Btn>
        </div>
      </div>
    </div>
  );
}

function EndedActsStrip({ acts, groups, onViewDetail }) {
  if (!acts || acts.length === 0) return null;
  return (
    <div className="noscroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 16px 6px' }}>
      {acts.map(a => {
        const g = groups.find(x => x.id === a.gid);
        return (
          <div key={a.id} onClick={() => onViewDetail(a.id)}
            style={{ flex: '0 0 120px', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer', position: 'relative', height: 82 }}>
            {a.cover
              ? <img src={a.cover} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <Photo seed={a.id + a.cat} icon={CATS[a.cat].icon} dim />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: 6, left: 8, right: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', lineHeight: 1.3 }} className="clamp2">{a.title}</div>
            </div>
            <div style={{ position: 'absolute', top: 6, right: 6, padding: '2px 6px', borderRadius: 99,
              background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.85)', fontSize: 10.5, fontWeight: 700 }}>已结束</div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { MobileCtx, useM, SectionHeader, AvatarStack, MetaRow, ActivityCard, ActivityRow, RecCard, GroupCard, EndedActsStrip });

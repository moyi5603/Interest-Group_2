// admin.jsx — PC admin app: dashboard, groups CRUD, activities, signups, comments, moments.
const { useState: aUseState } = React;
const useAdminPagination = window.useAdminPagination || ((total, config, enabled) => ({
  slice: items => items,
  nav: null,
}));
const AdminPagination = window.AdminPagination || (() => null);
const ADMIN_PAGE = window.ADMIN_PAGE || { groups: { default: 15, options: [15, 50, 100] }, moments: { default: 20, options: [20, 50, 100] }, std: { default: 10, options: [10, 20, 50, 100] } };

const SIGNUP_BAR = 'var(--brand)';
const MODE_TAG_STYLE = { background: 'var(--surface-2)', color: 'var(--ink-2)' };
const signupStatusStyle = (ended, full) => ended
  ? { background: 'var(--bg-2)', color: 'var(--ink-3)' }
  : { background: 'var(--brand-soft)', color: 'var(--brand-600)' };

// ---------- mini bar chart ----------
function MiniBars({ data, color = 'var(--brand)', height = 120 }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: height < 100 ? 4 : 7, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: height < 100 ? 22 : 30, height: `${(d.v / max) * 100}%`, background: i === data.length - 1 ? color : 'color-mix(in oklch, ' + color + ' 32%, white)',
            borderRadius: '7px 7px 3px 3px', transition: 'height .6s', minHeight: 4 }} title={d.v} />
          <span style={{ fontSize: height < 100 ? 10 : 11, color: 'var(--ink-3)', fontWeight: 600 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}

function getPendingJoins(store) {
  return (store.joinRequests || []).filter(r => {
    if (r.status !== 'pending') return false;
    const g = store.groups.find(x => x.id === r.gid);
    return g && g.join === 'approve';
  });
}

function PendingJoinCard({ r, groupName, onApprove, onReject, showNote }) {
  return (
    <div style={{
      padding: '12px 12px 10px', borderRadius: 12, background: 'var(--bg)',
      boxShadow: 'inset 0 0 0 1px var(--line)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'color-mix(in oklch, var(--c-music) 14%, white)', color: 'var(--c-music)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="userPlus" size={18} stroke={2.2} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>{r.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
            {[r.dept, r.appliedAt].filter(Boolean).join(' · ') || '刚刚申请'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6, fontWeight: 600, lineHeight: 1.4 }}>
            申请加入「{groupName || '小组'}」
          </div>
          {showNote && r.note && (
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.45 }}>备注：{r.note}</div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <Btn variant="ghost" size="sm" style={{ flex: 1 }} onClick={onReject}>拒绝</Btn>
        <Btn variant="soft" size="sm" style={{ flex: 1 }} onClick={onApprove}>通过</Btn>
      </div>
    </div>
  );
}

function PendingJoinsPage() {
  const { store, setView, actions } = useA();
  const pendingJoins = getPendingJoins(store);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }} className="noscroll">
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', position: 'relative',
        padding: '10px 12px', background: 'var(--surface)', borderBottom: '1px solid var(--line)',
      }}>
        <button type="button" onClick={() => setView({ section: 'dashboard' })} aria-label="返回"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px 4px', color: 'var(--ink-2)' }}>
          <Icon name="back" size={18} />
        </button>
        <div style={{
          position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none',
          fontSize: 16, fontWeight: 800,
        }}>待审核</div>
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pendingJoins.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>暂无待审核的加入申请</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>共 {pendingJoins.length} 条</div>
              <Btn variant="soft" size="sm" onClick={() => actions.approveAllJoin()}>全部通过</Btn>
            </div>
            {pendingJoins.map(r => {
              const g = store.groups.find(x => x.id === r.gid);
              return (
                <PendingJoinCard key={r.id} r={r} groupName={g ? g.name : ''} showNote
                  onApprove={() => actions.approveJoin(r.id)}
                  onReject={() => actions.rejectJoin(r.id)} />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { store, setView, actions, mobileAdmin } = useA();
  const upcoming = store.acts.filter(a => a.status === 'upcoming');
  const pendingJoins = getPendingJoins(store);
  const pad = mobileAdmin ? 14 : 28;
  const gap = mobileAdmin ? 14 : 22;
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title="工作台" compact={!!mobileAdmin}
        right={<Btn variant="ai" icon="spark" size={mobileAdmin ? 'sm' : 'md'} onClick={useAOpen}>{mobileAdmin ? 'AI 策划' : 'AI 策划活动'}</Btn>} />
      <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: mobileAdmin ? 5 : 16 }}>
          <StatCard compact={!!mobileAdmin} icon="users" label={mobileAdmin ? '小组' : '活跃小组'} value={store.groups.length} delta="+2" color="var(--brand)" />
          <StatCard compact={!!mobileAdmin} icon="user" label={mobileAdmin ? '成员' : '参与成员'} value="758" delta="+46" color="var(--c-music)" />
          <StatCard compact={!!mobileAdmin} icon="calendar" label="本周活动" value={upcoming.length} delta="+3" color="var(--c-outdoor)" />
          <StatCard compact={!!mobileAdmin} icon="ticket" label={mobileAdmin ? '本周报名' : '本周报名人次'} value="312" delta="+18%" color="var(--c-reading)" />
        </div>

        <div style={{ display: 'flex', flexDirection: mobileAdmin ? 'column' : 'row', gap: mobileAdmin ? 14 : 22 }}>
          <div style={{ flex: 1.4, background: 'var(--surface)', borderRadius: 18, padding: mobileAdmin ? 14 : 22, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div><div style={{ fontSize: mobileAdmin ? 15 : 16, fontWeight: 800 }}>近 8 周活动参与趋势</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>报名人次 · 持续上升</div></div>
            </div>
            <MiniBars height={mobileAdmin ? 72 : 120} data={[{ l: 'W1', v: 120 }, { l: 'W2', v: 145 }, { l: 'W3', v: 132 }, { l: 'W4', v: 178 },
              { l: 'W5', v: 165 }, { l: 'W6', v: 210 }, { l: 'W7', v: 245 }, { l: 'W8', v: 312 }]} />
          </div>
          <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 18, padding: mobileAdmin ? 14 : 22, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: mobileAdmin ? 10 : 4, gap: 8 }}>
              <div style={{ fontSize: mobileAdmin ? 15 : 16, fontWeight: 800 }}>待审核</div>
              {pendingJoins.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>{pendingJoins.length} 条</span>
                  {mobileAdmin ? (
                    <button type="button" onClick={() => setView({ section: 'pendingJoins' })}
                      style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: 2,
                        border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                      查看全部<Icon name="chevR" size={14} />
                    </button>
                  ) : (
                    <Btn variant="soft" size="sm" onClick={() => actions.approveAllJoin()}>全部通过</Btn>
                  )}
                </div>
              )}
            </div>
            {pendingJoins.length === 0 ? (
              <div style={{ padding: '28px 8px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>暂无待审核的加入申请</div>
            ) : mobileAdmin ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingJoins.slice(0, 3).map(r => {
                  const g = store.groups.find(x => x.id === r.gid);
                  return (
                    <PendingJoinCard key={r.id} r={r} groupName={g ? g.name : ''}
                      onApprove={() => actions.approveJoin(r.id)}
                      onReject={() => actions.rejectJoin(r.id)} />
                  );
                })}
                {pendingJoins.length > 3 && (
                  <button type="button" onClick={() => setView({ section: 'pendingJoins' })}
                    style={{
                      width: '100%', padding: '11px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: 'var(--brand-soft)', color: 'var(--brand-600)', fontSize: 13, fontWeight: 700,
                    }}>
                    查看全部 {pendingJoins.length} 条
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, maxHeight: 'calc(36px * 3 + 11px * 2)', overflowY: 'auto', paddingRight: 4 }} className="noscroll">
                {pendingJoins.map(r => {
                  const g = store.groups.find(x => x.id === r.gid);
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'color-mix(in oklch, var(--c-music) 14%, white)', color: 'var(--c-music)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="userPlus" size={18} stroke={2.2} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }} className="clamp1">{r.name} 申请加入「{g.name}」</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{[r.dept, r.appliedAt].filter(Boolean).join(' · ')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <Btn variant="ghost" size="sm" onClick={() => actions.rejectJoin(r.id)}>拒绝</Btn>
                        <Btn variant="soft" size="sm" onClick={() => actions.approveJoin(r.id)}>通过</Btn>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* recent activities table */}
        <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: mobileAdmin ? '14px 16px' : '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: mobileAdmin ? 15 : 16, fontWeight: 800 }}>近期活动</div>
            <button onClick={() => setView({ section: 'activities' })} style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>查看全部<Icon name="chevR" size={15} /></button>
          </div>
          {mobileAdmin ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 14px 14px' }}>
              {upcoming.slice(0, 4).map(a => (
                <AdminActRow key={a.id} a={a} onClick={() => setView({ section: 'actDetail', aid: a.id, back: { section: 'dashboard' } })} />
              ))}
            </div>
          ) : (
            <ActTable acts={upcoming.slice(0, 4)} hideAi onRow={(a) => setView({ section: 'actDetail', aid: a.id, back: { section: 'dashboard' } })} />
          )}
        </div>
      </div>
    </div>
  );
}

// Group acts into logical display units.
// - series acts with same `series` + gid → one 'series' unit with eps[]
// - recurring → 'recurring' unit (already has sessions[] inside)
// - once → 'single' unit
function groupActs(acts) {
  const units = [];
  const seenSeries = new Set();
  acts.forEach(a => {
    if (a.type === 'series' && a.series) {
      const key = a.series + '|||' + a.gid;
      if (!seenSeries.has(key)) {
        seenSeries.add(key);
        const eps = acts.filter(x => x.type === 'series' && x.series === a.series && x.gid === a.gid)
          .sort((x, y) => (x.seriesIdx || 0) - (y.seriesIdx || 0));
        units.push({ kind: 'series', key, eps, gid: a.gid });
      }
    } else {
      units.push({ kind: a.type === 'recurring' ? 'recurring' : 'single', key: a.id, act: a });
    }
  });
  return units;
}

function detailAct(unit) {
  if (unit.kind === 'single' || unit.kind === 'recurring') return unit.act;
  return unit.eps[0];
}

function AdminActRow({ a, onClick, subtitle }) {
  const { store } = useA();
  const g = store.groups.find(x => x.id === a.gid);
  const terminated = a.status === 'cancelled';
  const full = a.signed >= a.cap;
  const ended = a.status === 'ended';
  const label = terminated ? '已终止' : ended ? '已结束' : full ? '已满员' : '报名中';
  const pillSt = terminated ? { background: 'oklch(0.96 0.04 25)', color: 'oklch(0.55 0.2 25)' } : signupStatusStyle(ended, full);
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
      padding: '12px 14px', border: 'none', background: 'var(--surface)', borderRadius: 14,
      boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
        <Cover src={a.cover} seed={a.id + a.cat} icon={getCat(a.cat).icon} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, flex: 1, minWidth: 0 }} className="clamp1">{a.title}</div>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 99, flexShrink: 0, ...pillSt }}>{label}</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{subtitle || `${g ? g.name : ''} · ${a.date} ${a.time}`}</div>
        {!ended && !terminated && (
          <div style={{ marginTop: 6 }}><ProgressBar value={a.signed} max={a.cap} color={typeof SIGNUP_BAR !== 'undefined' ? SIGNUP_BAR : 'var(--brand)'} height={5} /></div>
        )}
      </div>
      <Icon name="chevR" size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
    </button>
  );
}

/** 管理者移动端：视觉对齐员工端 ActivityCard，底部改为编辑 */
function AdminMobileActCard({ a, groupName, seriesHint, onOpen, onEdit }) {
  const cat = getCat(a.cat);
  const cancelled = a.status === 'cancelled';
  const ended = a.status === 'ended' || cancelled;
  const statusMeta = cancelled
    ? { label: '已终止', color: '#fff', bg: 'rgba(120,113,108,0.92)' }
    : a.status === 'ended'
      ? { label: '已结束', color: '#fff', bg: 'rgba(60,60,60,0.78)' }
      : null;
  const cardTitle = a.type === 'series' && a.series ? a.series : a.title;
  const when = typeof ActWhen !== 'undefined' && ActWhen.compact ? ActWhen.compact(a) : `${a.date || ''} ${a.time || ''}`;
  const days = typeof ActWhen !== 'undefined' && ActWhen.daysBadge ? ActWhen.daysBadge(a) : null;
  const moms = (typeof DB !== 'undefined' && DB.moments) ? DB.moments.filter(m => m.aid === a.id || (a.series && m.series === a.series)) : [];
  const names = (typeof DB !== 'undefined' && DB.NAMES) ? DB.NAMES.slice(0, 6) : [];
  return (
    <div onClick={onOpen} className="rise" style={{
      background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow)', overflow: 'hidden', cursor: 'pointer',
    }}>
      <div style={{ position: 'relative', height: 152 }}>
        <Cover src={a.cover} seed={a.id + a.cat} icon={cat.icon} dim />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          {statusMeta && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 99,
              fontSize: 11, fontWeight: 800, color: statusMeta.color, background: statusMeta.bg, backdropFilter: 'blur(4px)',
            }}>{statusMeta.label}</span>
          )}
          <CatBadge cat={a.cat} size="sm" solid />
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}><TypeTag type={a.type} /></div>
        {!ended && (
          <div style={{ position: 'absolute', bottom: 11, right: 12, display: 'flex', gap: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 800, color: '#fff',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 99,
            }}>
              <Icon name="heart" size={15} />{a.likes || 0}
            </span>
          </div>
        )}
        <div style={{
          position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 28%, rgba(0,0,0,0.72))',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px 15px 13px',
        }}>
          {(groupName || seriesHint) && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 3 }} className="clamp1">
              {seriesHint || groupName}
            </div>
          )}
          <div style={{
            fontSize: 15.5, fontWeight: 800, lineHeight: 1.3, letterSpacing: -0.2, color: '#fff',
            paddingRight: ended ? 0 : 52,
          }} className="clamp1">{cardTitle}</div>
          {ended && !cancelled && moms.length > 0 && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 4 }}>
              {moms.length} 条精彩瞬间
            </div>
          )}
        </div>
      </div>
      {!ended && (
        <div style={{ padding: '12px 15px 13px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {typeof MetaRow === 'function' ? (
              <MetaRow icon="calendar">
                {when}
                {days && (
                  <span style={{
                    marginLeft: 6, padding: '1px 6px', borderRadius: 6,
                    background: 'var(--brand-tint, color-mix(in oklch, var(--brand) 12%, white))',
                    color: 'var(--brand)', fontSize: 11, fontWeight: 700,
                  }}>{days}</span>
                )}
              </MetaRow>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{when}{days ? ` · ${days}` : ''}</div>
            )}
            {a.loc && (typeof MetaRow === 'function'
              ? <MetaRow icon="pin">{a.loc}</MetaRow>
              : <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{a.loc}</div>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '11px 0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 5 }}>
                <span style={{ color: 'var(--ink-2)' }}>已报名 {a.signed}/{a.cap}</span>
                <span style={{ color: a.signed >= a.cap ? 'var(--brand)' : 'var(--ink-3)' }}>
                  {a.signed >= a.cap ? '已满员' : `余 ${a.cap - a.signed} 位`}
                </span>
              </div>
              <ProgressBar value={a.signed} max={a.cap} color={cat.color || 'var(--brand)'} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {typeof AvatarStack === 'function'
              ? <AvatarStack names={names} n={4} size={26} extra={Math.max(0, (a.signed || 0) - 4)} />
              : <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{a.signed || 0} 人已报名</span>}
            <Btn variant="soft" size="sm" icon="edit" onClick={e => { e.stopPropagation(); onEdit && onEdit(); }}>编辑</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function ActTable({ acts, onRow, hideAi, pagination }) {
  const { store } = useA();
  const allUnits = groupActs(acts);
  const pg = useAdminPagination(allUnits.length, pagination || ADMIN_PAGE.std, !!pagination);
  const units = pg.slice(allUnits);

  const StatusPill = ({ a }) => {
    const terminated = a.status === 'cancelled';
    const full = a.signed >= a.cap;
    const ended = a.status === 'ended';
    const label = terminated ? '已终止' : ended ? '已结束' : full ? '已满员' : '报名中';
    const st = terminated ? { background: 'oklch(0.96 0.04 25)', color: 'oklch(0.55 0.2 25)' } : signupStatusStyle(ended, full);
    return <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, ...st }}>{label}</span>;
  };

  const rowProps = (a) => ({
    onClick: () => onRow && onRow(a),
    style: { borderTop: '1px solid var(--line)', cursor: onRow ? 'pointer' : 'default' },
    onMouseEnter: e => { e.currentTarget.style.background = 'var(--surface-2)'; },
    onMouseLeave: e => { e.currentTarget.style.background = 'transparent'; },
  });

  return (
    <>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
      <thead><tr style={{ background: 'var(--surface-2)', color: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }}>
        {['活动', '类型', '时间', '报名', '状态', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 22px', fontWeight: 700 }}>{h}</th>)}
      </tr></thead>
      <tbody>
        {units.map(unit => {
          if (unit.kind === 'single') {
            const a = unit.act;
            const g = store.groups.find(x => x.id === a.gid);
            return (
              <tr key={unit.key} {...rowProps(a)}>
                <td style={{ padding: '13px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><Cover src={a.cover} seed={a.id + a.cat} icon={getCat(a.cat).icon} /></div>
                    <div><div style={{ fontWeight: 700 }} className="clamp1">{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{g ? g.name : ''}</div></div>
                  </div>
                </td>
                <td style={{ padding: '13px 22px' }}><TypeTag type={a.type} /></td>
                <td style={{ padding: '13px 22px', color: 'var(--ink-2)' }}>{a.date}{ActWhen.isCross(a) ? <> → {a.endDate}</> : ''}<br /><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.time}{ActWhen.daysBadge(a) ? ` · ${ActWhen.daysBadge(a)}` : ''}</span></td>
                <td style={{ padding: '13px 22px', minWidth: 120 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>{a.signed}/{a.cap}</div>
                  <ProgressBar value={a.signed} max={a.cap} color={SIGNUP_BAR} height={6} />
                </td>
                <td style={{ padding: '13px 22px' }}><StatusPill a={a} /></td>
                <td style={{ padding: '13px 22px' }}><Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} /></td>
              </tr>
            );
          }

          if (unit.kind === 'recurring') {
            const a = unit.act;
            const g = store.groups.find(x => x.id === a.gid);
            const sessions = a.sessions || [];
            const next = sessions[0] || {};
            const st = signupStatusStyle(false, false);
            return (
              <tr key={unit.key} {...rowProps(a)}>
                <td style={{ padding: '13px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><Cover src={a.cover} seed={a.id + a.cat} icon={getCat(a.cat).icon} /></div>
                    <div>
                      <div style={{ fontWeight: 700 }} className="clamp1">{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{g ? g.name : ''}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 22px' }}><TypeTag type={a.type} /></td>
                <td style={{ padding: '13px 22px', color: 'var(--ink-2)' }}>
                  {a.date}<br /><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.time}{ActWhen.isCross(a) ? ` → ${a.endDate}` : ''}</span>
                </td>
                <td style={{ padding: '13px 22px', minWidth: 120 }}>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 4 }}>下期 {next.signed || 0}/{next.cap || a.cap}</div>
                  <ProgressBar value={next.signed || 0} max={next.cap || a.cap} color={SIGNUP_BAR} height={6} />
                </td>
                <td style={{ padding: '13px 22px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, ...st }}>报名中</span>
                </td>
                <td style={{ padding: '13px 22px' }}><Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} /></td>
              </tr>
            );
          }

          if (unit.kind === 'series') {
            const { eps, key } = unit;
            const first = eps[0];
            const last = eps[eps.length - 1];
            const target = detailAct(unit);
            const g = store.groups.find(x => x.id === unit.gid);
            const mode = first.seriesSignupMode || 'independent';
            const totalSigned = mode === 'all' ? (eps.find(e => e.status !== 'ended') || first).signed : eps.reduce((s, e) => s + e.signed, 0);
            const totalCap = mode === 'all' ? first.cap : eps.reduce((s, e) => s + e.cap, 0);
            const dateRange = typeof ActWhen.seriesRange === 'function' ? ActWhen.seriesRange(eps) : first.date;
            const allEnded = eps.every(e => e.status === 'ended');
            const anyFull = eps.some(e => e.signed >= e.cap && e.status !== 'ended');
            return (
              <tr key={key} {...rowProps(target)}>
                <td style={{ padding: '13px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><Cover src={first.cover} seed={first.id + first.cat} icon={getCat(first.cat).icon} /></div>
                    <div>
                      <div style={{ fontWeight: 700 }} className="clamp1">{first.series || first.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{g ? g.name : ''} · 共 {eps.length} 期</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 22px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
                    <TypeTag type="series" />
                    <span style={{ padding: '2px 7px', borderRadius: 99, fontSize: 10.5, fontWeight: 700, ...MODE_TAG_STYLE }}>
                      {mode === 'all' ? '整场报名' : '按场次'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '13px 22px', color: 'var(--ink-2)' }}>
                  {dateRange}<br /><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{eps.length} 期</span>
                </td>
                <td style={{ padding: '13px 22px', minWidth: 120 }}>
                  {mode === 'all' ? (
                    <>
                      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>{totalSigned}/{totalCap}</div>
                      <ProgressBar value={totalSigned} max={totalCap} color={SIGNUP_BAR} height={6} />
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 3 }}>{totalSigned} 人次</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>各期独立</div>
                    </>
                  )}
                </td>
                <td style={{ padding: '13px 22px' }}>
                  {(() => {
                    const st = signupStatusStyle(allEnded, !allEnded && anyFull && mode === 'all');
                    const label = allEnded ? '已结束' : anyFull && mode === 'all' ? '已满员' : '报名中';
                    return <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, ...st }}>{label}</span>;
                  })()}
                </td>
                <td style={{ padding: '13px 22px' }}><Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} /></td>
              </tr>
            );
          }
          return null;
        })}
      </tbody>
    </table>
    {pg.nav && <AdminPagination {...pg.nav} />}
    </>
  );
}

// ---------- groups ----------
/** 管理者移动端：视觉对齐员工端 GroupCard，右侧改为编辑/删除 */
function AdminMobileGroupCard({ g, onOpen, onEdit, onDelete }) {
  const cat = getCat(g.cat);
  const names = (typeof DB !== 'undefined' && DB.NAMES) ? DB.NAMES.slice(2, 8) : [];
  return (
    <div onClick={onOpen} style={{
      width: 'auto', background: 'var(--surface)', borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow)', overflow: 'hidden', cursor: 'pointer',
    }}>
      <div style={{ position: 'relative', height: 96 }}>
        {g.cover
          ? <img src={g.cover} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <Photo seed={g.id + g.cat} icon={cat.icon} dim />}
        <div style={{ position: 'absolute', top: 10, left: 10 }}><CatBadge cat={g.cat} size="sm" solid /></div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }} className="clamp1">{g.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '5px 0 11px', lineHeight: 1.5 }} className="clamp2">{g.intro}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {typeof AvatarStack === 'function'
              ? <AvatarStack names={names} n={3} size={24} />
              : null}
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{g.members} 人</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Btn variant="soft" size="sm" icon="edit" onClick={e => { e.stopPropagation(); onEdit(); }}>编辑</Btn>
            <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}
              aria-label="删除"
              style={{
                width: 34, height: 34, borderRadius: 11, border: 'none', cursor: 'pointer',
                background: 'oklch(0.96 0.04 25)', color: 'oklch(0.55 0.2 25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupsSection() {
  const { store, setView, openGroupForm, actions, mobileAdmin } = useA();
  const [q, setQ] = aUseState('');
  const [deleteTarget, setDeleteTarget] = aUseState(null);
  const list = store.groups.filter(g => g.name.includes(q));
  const pg = useAdminPagination(list.length, ADMIN_PAGE.groups, !mobileAdmin);
  const shown = pg.slice(list);
  const confirmDelete = () => {
    if (!deleteTarget) return;
    actions.delGroup(deleteTarget.id);
    toast('小组已删除', { icon: 'trash' });
    setDeleteTarget(null);
  };
  const cardGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 18 }}>
        {shown.map(g => (
          <div key={g.id} className="rise" style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
            cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }} onClick={() => setView({ section: 'groupDetail', gid: g.id })}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            <div style={{ height: 110, position: 'relative' }}>{g.cover
              ? <img src={g.cover} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <Photo seed={g.id + g.cat} icon={getCat(g.cat).icon} dim />}
              <div style={{ position: 'absolute', top: 12, left: 12 }}><CatBadge cat={g.cat} size="sm" solid /></div>
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                <button onClick={e => { e.stopPropagation(); openGroupForm(g); }} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="edit" size={16} /></button>
                <button onClick={e => { e.stopPropagation(); setDeleteTarget(g); }} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(0.55 0.2 25)' }}><Icon name="trash" size={16} /></button>
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 16.5, fontWeight: 800 }}>{g.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: '7px 0 13px', height: 38 }} className="clamp2">{g.intro}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="user" size={15} />{g.members} 成员</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="calendar" size={15} />{g.acts} 活动</span>
                <span style={{ padding: '3px 9px', borderRadius: 99, background: g.join === 'free' ? 'color-mix(in oklch, var(--c-outdoor) 14%, white)' : 'var(--sun-soft)',
                  color: g.join === 'free' ? 'var(--c-outdoor)' : 'oklch(0.55 0.13 70)', fontWeight: 700 }}>{g.join === 'free' ? '自由加入' : '审核加入'}</span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
  if (mobileAdmin) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
        <div style={{ padding: '12px 14px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 14,
              background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
              <Icon name="search" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索小组名称"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--ink)', minWidth: 0 }} />
              {q && (
                <button type="button" onClick={() => setQ('')} aria-label="清除搜索"
                  style={{ display: 'flex', color: 'var(--ink-3)', padding: 2, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
            <Btn variant="primary" size="sm" icon="plus" onClick={() => openGroupForm(null)} style={{ flexShrink: 0 }}>新建</Btn>
          </div>
          {list.length
            ? list.map(g => (
              <AdminMobileGroupCard key={g.id} g={g}
                onOpen={() => setView({ section: 'groupDetail', gid: g.id })}
                onEdit={() => openGroupForm(g)}
                onDelete={() => setDeleteTarget(g)} />
            ))
            : <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
                {q.trim() ? '没有匹配的小组' : '暂无小组'}
              </div>}
        </div>
        <ConfirmSheet open={!!deleteTarget} title="删除小组"
          message={deleteTarget ? `确认删除「${deleteTarget.name}」？删除后不可恢复。` : ''}
          confirmLabel="删除" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    );
  }
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title="小组管理" sub={`共 ${store.groups.length} 个小组 · 758 名成员`}
        right={<Btn variant="primary" icon="plus" onClick={() => openGroupForm(null)}>新建小组</Btn>} />
      <div style={{ padding: 28 }}>
        <AdminListToolbar search={<AdminSearchBar value={q} onChange={setQ} placeholder="搜索小组名称" />} />
        {cardGrid}
        {pg.nav && <AdminPagination {...pg.nav} style={{ marginTop: 18, background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)' }} />}
      </div>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="删除小组" width={420}>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>
            确认删除小组「<span style={{ fontWeight: 700, color: 'var(--ink)' }}>{deleteTarget ? deleteTarget.name : ''}</span>」？删除后不可恢复。
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
            <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>取消</Btn>
            <Btn variant="danger" icon="trash" onClick={confirmDelete}>确认删除</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminGroupDetail({ gid }) {
  const { store, setView, openActForm, openGroupForm, mobileAdmin } = useA();
  const g = store.groups.find(x => x.id === gid);
  const acts = store.acts.filter(a => a.gid === gid);
  const moms = DB.moments.filter(m => m.gid === gid);
  const [tab, setTab] = aUseState('acts');
  if (!g) return null;
  const pad = mobileAdmin ? 14 : 28;
  const tabs = [['acts', `活动 ${acts.length}`], ['members', `成员 ${g.members}`], ['comments', '评论'], ['moments', `精彩瞬间 ${moms.length}`]];
  const members = DB.NAMES.slice(0, 18);
  const actRow = (a) => setView({ section: 'actDetail', aid: a.id, back: { section: 'groupDetail', gid } });
  const btnGrow = mobileAdmin ? { flex: 1, minWidth: 0 } : undefined;
  const heroH = mobileAdmin ? 188 : 220;
  const actionBtns = (
    <>
      <Btn variant="ghost" icon="edit" size="md" style={btnGrow} onClick={() => openGroupForm(g)}>编辑</Btn>
      <Btn variant="primary" icon="plus" size="md" style={btnGrow} onClick={() => openActForm(gid)}>新建活动</Btn>
    </>
  );
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }} className="noscroll">
        <div style={{ position: 'relative', height: heroH, background: 'var(--bg-2)' }}>
          {g.cover
            ? <img src={g.cover} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <Photo seed={g.id + g.cat} icon={getCat(g.cat).icon} dim />}
          <button type="button" onClick={() => setView({ section: 'groups' })} aria-label="返回"
            style={{
              position: 'absolute', top: mobileAdmin ? 12 : 16, left: mobileAdmin ? 12 : 20,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              height: mobileAdmin ? 36 : 38, padding: mobileAdmin ? '0 10px' : '0 12px',
              borderRadius: 99, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 10px oklch(0.4 0.03 60 / 0.18)',
              fontSize: 13, fontWeight: 600, color: 'var(--ink)',
            }}>
            <Icon name="back" size={17} />{mobileAdmin ? null : '返回小组列表'}
          </button>
          <div style={{ position: 'absolute', bottom: 12, left: mobileAdmin ? 12 : 20 }}>
            <CatBadge cat={g.cat} size="sm" solid />
          </div>
        </div>
        <div style={{ background: 'var(--surface)', padding: `0 ${pad}px 0`, borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: 16, paddingTop: mobileAdmin ? 14 : 18, paddingBottom: mobileAdmin ? 14 : 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <div style={{ fontSize: mobileAdmin ? 18 : 23, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{g.name}</div>
              </div>
              <div style={{ fontSize: mobileAdmin ? 13 : 13.5, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 620, marginBottom: 10 }}>{g.intro}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: 13, color: 'var(--ink-2)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="user" size={15} />组长 {g.lead}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{g.join === 'free' ? '自由加入' : '审核加入'}</span>
              </div>
              {g.area ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>
                  <Icon name="pin" size={15} />{g.area}
                </div>
              ) : null}
            </div>
            {!mobileAdmin && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                {actionBtns}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: mobileAdmin ? 6 : 16, paddingBottom: mobileAdmin ? 12 : 16 }}>
            <StatCard compact={!!mobileAdmin} icon="user" label="成员" value={g.members} color="var(--brand)"
              onClick={() => setTab('members')} />
            <StatCard compact={!!mobileAdmin} icon="calendar" label="累计活动" value={g.acts} color="var(--c-outdoor)"
              onClick={() => setTab('acts')} />
            <StatCard compact={!!mobileAdmin} icon="heart" label="本月互动" value="486" color="var(--c-music)"
              onClick={() => setTab('comments')} />
            <StatCard compact={!!mobileAdmin} icon="image" label="精彩瞬间" value={moms.length} color="var(--sun)"
              onClick={() => setTab('moments')} />
          </div>
          <div style={{ display: 'flex', gap: 4, overflowX: mobileAdmin ? 'auto' : 'visible', flexWrap: mobileAdmin ? 'nowrap' : 'wrap' }} className={mobileAdmin ? 'noscroll' : undefined}>
            {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={{ padding: mobileAdmin ? '10px 12px' : '12px 16px', fontSize: mobileAdmin ? 13 : 14, fontWeight: 700, flexShrink: mobileAdmin ? 0 : undefined, whiteSpace: mobileAdmin ? 'nowrap' : 'normal',
              color: tab === k ? 'var(--brand-600)' : 'var(--ink-3)', borderBottom: tab === k ? '2.5px solid var(--brand)' : '2.5px solid transparent', marginBottom: -1 }}>{l}</button>)}
          </div>
        </div>

        <div style={{ padding: pad, paddingBottom: mobileAdmin ? 88 : pad }}>
          {tab === 'acts' && (mobileAdmin ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {acts.map(a => <AdminActRow key={a.id} a={a} onClick={() => actRow(a)} />)}
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}><ActTable acts={acts} onRow={actRow} /></div>
          ))}
          {tab === 'members' && <MembersGrid members={members} lead={g.lead} />}
          {tab === 'comments' && <CommentsView acts={acts} />}
          {tab === 'moments' && <MomentsGrid moms={moms} navBack={{ section: 'groupDetail', gid }} />}
        </div>
      </div>

      {mobileAdmin && (
        <div style={{
          flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center',
          padding: '10px 14px calc(10px + env(safe-area-inset-bottom, 0px))',
          background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--line)', boxShadow: '0 -4px 16px oklch(0.45 0.04 60 / 0.08)',
        }}>
          {actionBtns}
        </div>
      )}
    </div>
  );
}

const MEMBER_DEPT_FALLBACK = ['产品部', '研发中心', '市场部', '设计部', '人力资源部', '行政部', '财务部', '运营部'];
function memberDept(name) {
  const emp = (typeof DB !== 'undefined' && DB.employees || []).find(e => e.name === name);
  if (emp && emp.dept) return emp.dept;
  let h = 0;
  const s = String(name || '');
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 1)) % 997;
  return MEMBER_DEPT_FALLBACK[h % MEMBER_DEPT_FALLBACK.length];
}

function MembersGrid({ members, lead }) {
  const { mobileAdmin } = useA();
  const list = [lead, ...members.filter(m => m !== lead)];
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: mobileAdmin ? 12 : 22 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: mobileAdmin ? 8 : 12 }}>
        {list.map((m, i) => {
          const isLead = i === 0 || m === lead;
          return (
            <div key={m} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: mobileAdmin ? '10px 4px 8px' : '12px 8px', borderRadius: 12,
              background: isLead ? 'color-mix(in oklch, var(--sun) 10%, var(--surface-2))' : 'var(--surface-2)',
              boxShadow: isLead ? 'inset 0 0 0 1px color-mix(in oklch, var(--sun) 35%, transparent)' : 'none',
              minWidth: 0,
            }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={m} size={mobileAdmin ? 40 : 44} ring={isLead} />
                {isLead && (
                  <span style={{
                    position: 'absolute', left: '50%', bottom: -6, transform: 'translateX(-50%)',
                    padding: '1px 6px', borderRadius: 99, whiteSpace: 'nowrap',
                    background: 'var(--sun-soft)', color: 'oklch(0.55 0.13 70)',
                    fontSize: 9, fontWeight: 800, lineHeight: 1.4,
                    boxShadow: '0 1px 2px oklch(0.5 0.05 70 / 0.15)',
                  }}>组长</span>
                )}
              </div>
              <div style={{ fontSize: mobileAdmin ? 12 : 13, fontWeight: 700, textAlign: 'center', width: '100%', marginTop: isLead ? 6 : 0 }} className="clamp1">{m}</div>
              <div style={{ fontSize: mobileAdmin ? 10 : 11.5, color: 'var(--ink-3)', textAlign: 'center', width: '100%', fontWeight: 600 }} className="clamp1">
                {memberDept(m)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminActDetail({ aid, back }) {
  const { store, setView, openActForm, actions, mobileAdmin } = useA();
  const pad = mobileAdmin ? 14 : 28;
  const [deleteOpen, setDeleteOpen] = aUseState(false);
  const [terminateOpen, setTerminateOpen] = aUseState(false);
  const [tab, setTab] = aUseState('desc');
  const aIn = store.acts.find(x => x.id === aid);
  if (!aIn) return null;
  const episodes = DBH.seriesEps(store.acts, aIn);
  const isSeries = episodes.length > 0;
  const a = isSeries ? episodes[0] : aIn;
  const g = store.groups.find(x => x.id === a.gid);
  const mode = isSeries ? (a.seriesSignupMode || 'independent') : null;
  const sessions = (!isSeries && aIn.type === 'recurring' && aIn.sessions) ? aIn.sessions : null;
  const recentSessions = DBH.recentSessions(sessions);
  const signupBlocksDisplay = recentSessions || (isSeries ? episodes : null);
  const terminated = isSeries
    ? episodes.every(e => e.status === 'cancelled')
    : aIn.status === 'cancelled';
  const ended = isSeries ? episodes.every(e => e.status === 'ended') : aIn.status === 'ended';
  const canTerminate = !terminated && (
    isSeries ? episodes.some(e => e.status === 'upcoming') : aIn.status === 'upcoming'
  );
  const activeEp = isSeries ? (episodes.find(e => e.status !== 'ended') || episodes[episodes.length - 1]) : aIn;
  const signed = signupBlocksDisplay
    ? (isSeries && mode === 'all' ? activeEp.signed : signupBlocksDisplay.reduce((t, s) => t + s.signed, 0))
    : aIn.signed;
  const cap = signupBlocksDisplay
    ? (isSeries && mode === 'all' ? activeEp.cap : signupBlocksDisplay.reduce((t, s) => t + s.cap, 0))
    : aIn.cap;
  const full = !signupBlocksDisplay && signed >= cap;
  const canDelete = signed === 0;
  const title = isSeries ? a.series : aIn.title;
  const dateLabel = isSeries
    ? (typeof ActWhen.seriesRange === 'function' ? ActWhen.seriesRange(episodes) : aIn.date)
    : aIn.date;
  const timeLabel = isSeries ? `共${episodes.length}期` : aIn.time;
  const desc = isSeries ? (a.seriesDesc || a.desc) : aIn.desc;
  const likes = isSeries ? episodes.reduce((m, e) => Math.max(m, e.likes || 0), 0) : aIn.likes;
  const commentActs = isSeries ? episodes : [aIn];
  const commentCount = (store.comments || []).filter(c => commentActs.some(x => x.id === c.aid) && !c.isAI).length;
  const momentCount = DB.moments.filter(m => commentActs.some(x => x.id === m.aid)).length;
  const moms = DB.moments.filter(m => commentActs.some(x => x.id === m.aid));
  const detailTabs = [
    ['desc', '活动描述'],
    ['signups', '报名情况'],
    ['comments', '评论&互动'],
    ['moments', '精彩瞬间'],
  ];
  const backTo = back || { section: 'activities' };
  const timeIcon = isSeries ? 'series' : aIn.type === 'recurring' ? 'repeat' : 'calendar';

  const signupsActs = isSeries ? episodes : [aIn];
  const signupsPanel = typeof SignupsView === 'function'
    ? <SignupsView acts={signupsActs} paginate={false} embedded />
    : <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>报名组件未加载</div>;

  const momentsPanel = (
    <MomentsGrid
      moms={moms}
      navBack={backTo}
      emptyText="暂无精彩瞬间"
    />
  );

  const statsRow = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: mobileAdmin ? 6 : 16 }}>
      <StatCard compact={!!mobileAdmin} icon="ticket"
        label={recentSessions ? '已报名 · 最近5场' : signupBlocksDisplay ? (isSeries && mode === 'all' ? '已报名 · 整场' : '已报名 · 全部场次') : '已报名'}
        value={`${signed}/${cap}`} color="var(--brand)"
        onClick={mobileAdmin ? () => setTab('signups') : undefined} />
      <StatCard compact={!!mobileAdmin} icon="heart" label="点赞" value={likes} color="var(--c-music)"
        onClick={mobileAdmin ? () => setTab('comments') : undefined} />
      <StatCard compact={!!mobileAdmin} icon="comment" label="评论" value={commentCount} color="var(--c-reading)"
        onClick={mobileAdmin ? () => setTab('comments') : undefined} />
      <StatCard compact={!!mobileAdmin} icon="image" label="精彩瞬间" value={momentCount} color="var(--sun)"
        onClick={mobileAdmin ? () => setTab('moments') : undefined} />
    </div>
  );

  const statusPill = (
    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, ...(terminated ? { background: 'oklch(0.96 0.04 25)', color: 'oklch(0.55 0.2 25)' } : signupStatusStyle(ended, full)) }}>{terminated ? '已终止' : ended ? '已结束' : full ? '已满员' : '报名中'}</span>
  );
  const metaItem = (icon, children, style) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, ...style }}>
      <Icon name={icon} size={15} />{children}
    </span>
  );
  const metaRows = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
      <div>
        {metaItem(timeIcon, (
          <>
            {isSeries ? `${dateLabel} · ${timeLabel}` : ActWhen.full(aIn)}
            {!isSeries && ActWhen.daysBadge(aIn) && (
              <span style={{ marginLeft: 2, padding: '1px 7px', borderRadius: 6, background: 'color-mix(in oklch, var(--brand) 12%, white)', color: 'var(--brand)', fontSize: 11, fontWeight: 700 }}>{ActWhen.daysBadge(aIn)}</span>
            )}
            {aIn.type === 'recurring' && !isSeries && ' (周期)'}
          </>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
        {metaItem('users', g ? g.name : '')}
        {g && metaItem('user', <>小组组长 {g.lead}</>)}
      </div>
      {a.loc ? <div>{metaItem('pin', a.loc)}</div> : null}
      {a.signupDeadline ? (
        <div>{metaItem('clock', <>报名截止 {a.signupDeadline}</>, { color: 'oklch(0.55 0.13 70)' })}</div>
      ) : null}
    </div>
  );
  const hasActActions = (!terminated) || canTerminate || canDelete;
  // mobile 底栏：删除(低频·窄) | 终止(中频·中) | 编辑(高频·宽)；高度统一
  const barBtnH = { height: 44, boxSizing: 'border-box', paddingTop: 0, paddingBottom: 0 };
  const actionBtns = mobileAdmin ? (
    <>
      {canDelete && (
        <Btn variant="ghost" icon="trash" size="md" aria-label="删除"
          style={{ ...barBtnH, flexShrink: 0, width: 44, paddingLeft: 0, paddingRight: 0 }}
          onClick={() => setDeleteOpen(true)} />
      )}
      {canTerminate && (
        <Btn variant="danger" icon="flag" size="md"
          style={{ ...barBtnH, flex: 1.1, minWidth: 0 }}
          onClick={() => setTerminateOpen(true)}>终止</Btn>
      )}
      {!terminated && (
        <Btn variant="primary" icon="edit" size="md"
          style={{ ...barBtnH, flex: 2, minWidth: 0 }}
          onClick={() => openActForm(aIn.gid, aIn)}>编辑</Btn>
      )}
    </>
  ) : (
    <>
      {!terminated && <Btn variant="ghost" icon="edit" size="md" onClick={() => openActForm(aIn.gid, aIn)}>编辑</Btn>}
      {canTerminate && (
        <Btn variant="danger" icon="flag" size="md" onClick={() => setTerminateOpen(true)}>终止</Btn>
      )}
      {canDelete && (
        <Btn variant="ghost" icon="trash" size="md" onClick={() => setDeleteOpen(true)} />
      )}
    </>
  );
  const descPanel = (
    <div style={mobileAdmin
      ? { padding: 0 }
      : { background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
      {!mobileAdmin && <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>活动描述</div>}
      {desc
        ? <div className="richtext" style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: desc }} />
        : <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>暂无描述</div>}
    </div>
  );
  const commentsPanel = (
    <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>评论 & 互动</div>
      <CommentsView acts={commentActs} inline />
    </div>
  );

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }} className="noscroll">
        {mobileAdmin ? (
          <>
            <div style={{ position: 'relative', height: 188, background: 'var(--bg-2)' }}>
              <Cover src={a.cover} fallbackSrc={g && g.cover} seed={a.id + a.cat} icon={getCat(a.cat).icon} dim />
              <button type="button" onClick={() => setView(backTo)} aria-label="返回"
                style={{
                  position: 'absolute', top: 12, left: 12, zIndex: 2,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
                  background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 10px oklch(0.4 0.03 60 / 0.18)',
                  color: 'var(--ink)',
                }}>
                <Icon name="back" size={17} />
              </button>
              <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 6, flexWrap: 'wrap', zIndex: 1 }}>
                <CatBadge cat={a.cat} size="sm" solid />
                <TypeTag type={isSeries ? 'series' : aIn.type} />
                {isSeries && (
                  <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, ...MODE_TAG_STYLE }}>
                    {mode === 'all' ? '整场报名' : '按场次报名'}
                  </span>
                )}
                {statusPill}
              </div>
            </div>
            <div style={{ background: 'var(--surface)', padding: `14px ${pad}px 16px`, borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 8 }}>{title}</div>
              {metaRows}
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '16px 28px 0', background: 'var(--surface)' }}>
              <button type="button" onClick={() => setView(backTo)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 14, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><Icon name="back" size={17} />返回</button>
            </div>
            <div style={{ background: 'var(--surface)', padding: '0 28px 22px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ width: 200, height: 112, borderRadius: 16, overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                  <Cover src={a.cover} fallbackSrc={g && g.cover} seed={a.id + a.cat} icon={getCat(a.cat).icon} dim />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <CatBadge cat={a.cat} size="sm" /><TypeTag type={isSeries ? 'series' : aIn.type} />
                    {isSeries && (
                      <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, ...MODE_TAG_STYLE }}>
                        {mode === 'all' ? '整场报名' : '按场次报名'}
                      </span>
                    )}
                    {statusPill}
                  </div>
                  <div style={{ fontSize: 23, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 8 }}>{title}</div>
                  {metaRows}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>{actionBtns}</div>
              </div>
            </div>
          </>
        )}

        {mobileAdmin ? (
          <>
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
              <div style={{ padding: `${pad}px ${pad}px 0` }}>{statsRow}</div>
              <div style={{ display: 'flex', gap: 4, overflowX: 'auto', flexWrap: 'nowrap', marginTop: 10 }} className="noscroll">
                {detailTabs.map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setTab(k)}
                    style={{
                      padding: '10px 12px', fontSize: 13, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                      color: tab === k ? 'var(--brand-600)' : 'var(--ink-3)',
                      borderBottom: tab === k ? '2.5px solid var(--brand)' : '2.5px solid transparent',
                      marginBottom: -1, background: 'transparent', cursor: 'pointer',
                    }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: pad, paddingBottom: hasActActions ? 16 : 24 }}>
              {tab === 'desc' && descPanel}
              {tab === 'signups' && signupsPanel}
              {tab === 'comments' && <CommentsView acts={commentActs} />}
              {tab === 'moments' && momentsPanel}
            </div>
          </>
        ) : (
          <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {statsRow}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 22, alignItems: 'flex-start' }}>
              <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
                {descPanel}
                {commentsPanel}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>{signupsPanel}</div>
            </div>
          </div>
        )}
      </div>

      {mobileAdmin && hasActActions && (
        <div style={{
          flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center',
          padding: '10px 14px calc(10px + env(safe-area-inset-bottom, 0px))',
          background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--line)', boxShadow: '0 -4px 16px oklch(0.45 0.04 60 / 0.08)',
        }}>
          {actionBtns}
        </div>
      )}

      {mobileAdmin ? (
        <>
          <ConfirmSheet open={terminateOpen} title="终止活动"
            message={`确认终止活动「${title}」？${isSeries ? '将终止该系列全部场次，' : ''}终止后状态不可恢复。`}
            confirmLabel="确认终止" onConfirm={() => { actions.terminateAct(aIn.id); setTerminateOpen(false); }} onCancel={() => setTerminateOpen(false)} />
          <ConfirmSheet open={deleteOpen} title="删除活动"
            message={`确认删除活动「${title}」？${isSeries ? '将删除该系列全部场次，' : ''}删除后不可恢复。`}
            confirmLabel="确认删除" onConfirm={() => { actions.delAct(aIn.id); setDeleteOpen(false); setView(backTo); }} onCancel={() => setDeleteOpen(false)} />
        </>
      ) : (
        <>
          <Modal open={terminateOpen} onClose={() => setTerminateOpen(false)} title="终止活动" width={420}>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>
                确认终止活动「<span style={{ fontWeight: 700, color: 'var(--ink)' }}>{title}</span>」？{isSeries ? '将终止该系列全部场次，' : ''}终止后状态不可恢复。
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                <Btn variant="ghost" onClick={() => setTerminateOpen(false)}>取消</Btn>
                <Btn variant="danger" icon="flag" onClick={() => { actions.terminateAct(aIn.id); setTerminateOpen(false); }}>确认终止</Btn>
              </div>
            </div>
          </Modal>
          <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="删除活动" width={420}>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>
                确认删除活动「<span style={{ fontWeight: 700, color: 'var(--ink)' }}>{title}</span>」？{isSeries ? '将删除该系列全部场次，' : ''}删除后不可恢复。
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                <Btn variant="ghost" onClick={() => setDeleteOpen(false)}>取消</Btn>
                <Btn variant="danger" icon="trash" onClick={() => { actions.delAct(aIn.id); setDeleteOpen(false); setView(backTo); }}>确认删除</Btn>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}

Object.assign(window, { Dashboard, PendingJoinsPage, ActTable, AdminActRow, AdminMobileActCard, groupActs, detailAct, GroupsSection, AdminGroupDetail, AdminActDetail, MembersGrid, MiniBars });

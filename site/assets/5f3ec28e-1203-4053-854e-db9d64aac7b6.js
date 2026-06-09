// admin.jsx — PC admin app: dashboard, groups CRUD, activities, signups, comments, moments.
const { useState: aUseState } = React;

const SIGNUP_BAR = 'var(--brand)';
const MODE_TAG_STYLE = { background: 'var(--surface-2)', color: 'var(--ink-2)' };
const signupStatusStyle = (ended, full) => ended
  ? { background: 'var(--bg-2)', color: 'var(--ink-3)' }
  : { background: 'var(--brand-soft)', color: 'var(--brand-600)' };

// ---------- mini bar chart ----------
function MiniBars({ data, color = 'var(--brand)' }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 30, height: `${(d.v / max) * 100}%`, background: i === data.length - 1 ? color : 'color-mix(in oklch, ' + color + ' 32%, white)',
            borderRadius: '7px 7px 3px 3px', transition: 'height .6s', minHeight: 6 }} title={d.v} />
          <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { store, setView, actions } = useA();
  const upcoming = store.acts.filter(a => a.status === 'upcoming');
  const pendingJoins = (store.joinRequests || []).filter(r => {
    if (r.status !== 'pending') return false;
    const g = store.groups.find(x => x.id === r.gid);
    return g && g.join === 'approve';
  });
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title="工作台"
        right={<Btn variant="ai" icon="spark" onClick={useAOpen}>AI 策划活动</Btn>} />
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <StatCard icon="users" label="活跃小组" value={store.groups.length} delta="+2" color="var(--brand)" />
          <StatCard icon="user" label="参与成员" value="758" delta="+46" color="var(--c-music)" />
          <StatCard icon="calendar" label="本周活动" value={upcoming.length} delta="+3" color="var(--c-outdoor)" />
          <StatCard icon="ticket" label="本周报名人次" value="312" delta="+18%" color="var(--c-reading)" />
        </div>

        <div style={{ display: 'flex', gap: 22 }}>
          <div style={{ flex: 1.4, background: 'var(--surface)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div><div style={{ fontSize: 16, fontWeight: 800 }}>近 8 周活动参与趋势</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>报名人次 · 持续上升</div></div>
            </div>
            <MiniBars data={[{ l: 'W1', v: 120 }, { l: 'W2', v: 145 }, { l: 'W3', v: 132 }, { l: 'W4', v: 178 },
              { l: 'W5', v: 165 }, { l: 'W6', v: 210 }, { l: 'W7', v: 245 }, { l: 'W8', v: 312 }]} />
          </div>
          <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>待审核</div>
              {pendingJoins.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>{pendingJoins.length} 条</span>
                  <Btn variant="soft" size="sm" onClick={() => actions.approveAllJoin()}>全部通过</Btn>
                </div>
              )}
            </div>
            {pendingJoins.length === 0 ? (
              <div style={{ padding: '28px 8px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>暂无待审核的加入申请</div>
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
          <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>近期活动</div>
            <button onClick={() => setView({ section: 'activities' })} style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>查看全部<Icon name="chevR" size={15} /></button>
          </div>
          <ActTable acts={upcoming.slice(0, 4)} hideAi onRow={(a) => setView({ section: 'actDetail', aid: a.id, back: { section: 'dashboard' } })} />
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

function ActTable({ acts, onRow, hideAi }) {
  const { store } = useA();
  const units = groupActs(acts);

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
                    <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} /></div>
                    <div><div style={{ fontWeight: 700 }} className="clamp1">{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{g ? g.name : ''}</div></div>
                    {a.ai && !hideAi && <AIPill />}
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
                    <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} /></div>
                    <div>
                      <div style={{ fontWeight: 700 }} className="clamp1">{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{g ? g.name : ''}</div>
                    </div>
                    {a.ai && !hideAi && <AIPill />}
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
                    <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><Cover src={first.cover} seed={first.id + first.cat} icon={CATS[first.cat].icon} /></div>
                    <div>
                      <div style={{ fontWeight: 700 }} className="clamp1">{first.series || first.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{g ? g.name : ''} · 共 {eps.length} 期</div>
                    </div>
                    {first.ai && !hideAi && <AIPill />}
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
  );
}

// ---------- groups ----------
function GroupsSection() {
  const { store, setView, openGroupForm, actions } = useA();
  const [q, setQ] = aUseState('');
  const list = store.groups.filter(g => g.name.includes(q) || CATS[g.cat].label.includes(q));
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title="小组管理" sub={`共 ${store.groups.length} 个小组 · 758 名成员`}
        right={<><div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', borderRadius: 12, padding: '0 12px', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          <Icon name="search" size={18} style={{ color: 'var(--ink-3)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索小组" style={{ border: 'none', outline: 'none', padding: '10px 0', fontSize: 13.5, width: 150, background: 'transparent' }} /></div>
          <Btn variant="primary" icon="plus" onClick={() => openGroupForm(null)}>新建小组</Btn></>} />
      <div style={{ padding: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 18 }}>
        {list.map(g => (
          <div key={g.id} className="rise" style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
            cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }} onClick={() => setView({ section: 'groupDetail', gid: g.id })}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            <div style={{ height: 110, position: 'relative' }}>{g.cover
              ? <img src={g.cover} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <Photo seed={g.id + g.cat} icon={CATS[g.cat].icon} dim />}
              <div style={{ position: 'absolute', top: 12, left: 12 }}><CatBadge cat={g.cat} size="sm" solid /></div>
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                <button onClick={e => { e.stopPropagation(); openGroupForm(g); }} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="edit" size={16} /></button>
                <button onClick={e => { e.stopPropagation(); if (confirm('确认删除该小组?')) { actions.delGroup(g.id); toast('小组已删除', { icon: 'trash' }); } }} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(0.55 0.2 25)' }}><Icon name="trash" size={16} /></button>
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
    </div>
  );
}

function AdminGroupDetail({ gid }) {
  const { store, setView, openActForm, openGroupForm } = useA();
  const g = store.groups.find(x => x.id === gid);
  const acts = store.acts.filter(a => a.gid === gid);
  const moms = DB.moments.filter(m => m.gid === gid);
  const [tab, setTab] = aUseState('overview');
  if (!g) return null;
  const tabs = [['overview', '概览'], ['acts', `活动 ${acts.length}`], ['members', `成员 ${g.members}`], ['signups', '报名'], ['comments', '评论'], ['moments', `精彩瞬间 ${moms.length}`]];
  const members = DB.NAMES.slice(0, 18);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <div style={{ padding: '16px 28px 0', background: 'var(--surface)' }}>
        <button onClick={() => setView({ section: 'groups' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 14 }}><Icon name="back" size={17} />返回小组列表</button>
      </div>
      <div style={{ background: 'var(--surface)', padding: '0 28px 0', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 18, paddingBottom: 18 }}>
          <div style={{ width: 96, height: 96, borderRadius: 18, overflow: 'hidden', flexShrink: 0 }}><Photo seed={g.id + g.cat} icon={CATS[g.cat].icon} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ fontSize: 23, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{g.name}</div>
              <CatBadge cat={g.cat} size="sm" />
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 620, marginBottom: 10 }}>{g.intro}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: 13, color: 'var(--ink-2)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="user" size={15} />组长 {g.lead}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="pin" size={15} />{g.area}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{g.join === 'free' ? '自由加入' : '审核加入'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Btn variant="ghost" icon="edit" onClick={() => openGroupForm(g)}>编辑</Btn>
            <Btn variant="primary" icon="plus" onClick={() => openActForm(gid)}>新建活动</Btn>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700,
            color: tab === k ? 'var(--brand-600)' : 'var(--ink-3)', borderBottom: tab === k ? '2.5px solid var(--brand)' : '2.5px solid transparent', marginBottom: -1 }}>{l}</button>)}
        </div>
      </div>

      <div style={{ padding: 28 }}>
        {tab === 'overview' && <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <StatCard icon="user" label="成员" value={g.members} color="var(--brand)" />
            <StatCard icon="calendar" label="累计活动" value={g.acts} color="var(--c-outdoor)" />
            <StatCard icon="heart" label="本月互动" value="486" color="var(--c-music)" />
            <StatCard icon="image" label="精彩瞬间" value={moms.length} color="var(--sun)" />
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', fontSize: 15, fontWeight: 800 }}>近期活动</div>
            <ActTable acts={acts} onRow={(a) => setView({ section: 'actDetail', aid: a.id, back: { section: 'groupDetail', gid } })} />
          </div>
        </div>}
        {tab === 'acts' && <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}><ActTable acts={acts} onRow={(a) => setView({ section: 'actDetail', aid: a.id, back: { section: 'groupDetail', gid } })} /></div>}
        {tab === 'members' && <MembersGrid members={members} lead={g.lead} />}
        {tab === 'signups' && <SignupsView acts={acts} />}
        {tab === 'comments' && <CommentsView acts={acts} />}
        {tab === 'moments' && <MomentsGrid moms={moms} navBack={{ section: 'groupDetail', gid }} />}
      </div>
    </div>
  );
}

function MembersGrid({ members, lead }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
        {[lead, ...members.filter(m => m !== lead)].map((m, i) => (
          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 11, borderRadius: 13, background: 'var(--surface-2)' }}>
            <Avatar name={m} size={40} ring={i === 0} />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 700 }} className="clamp1">{m}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{i === 0 ? '组长 · 创建人' : '成员'}</div></div>
            {i === 0 && <span style={{ padding: '3px 9px', borderRadius: 99, background: 'var(--sun-soft)', color: 'oklch(0.55 0.13 70)', fontSize: 11, fontWeight: 700 }}>组长</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

const ACT_DETAIL_AVATAR_COLS = 4;
const ACT_DETAIL_AVATAR_MAX = ACT_DETAIL_AVATAR_COLS * 2; // 固定 2 行

function AdminActDetail({ aid, back }) {
  const { store, setView, openActForm, actions } = useA();
  const [sessionOpen, setSessionOpen] = aUseState({});
  const [memberModal, setMemberModal] = aUseState(null);
  const toggleSession = id => setSessionOpen(s => ({ ...s, [id]: !s[id] }));
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
  const tags = isSeries ? (a.seriesTags || a.tags) : aIn.tags;
  const likes = isSeries ? episodes.reduce((m, e) => Math.max(m, e.likes || 0), 0) : aIn.likes;
  const commentActs = isSeries ? episodes : [aIn];
  const commentCount = (store.comments || []).filter(c => commentActs.some(x => x.id === c.aid)).length;
  const backTo = back || { section: 'activities' };
  const timeIcon = isSeries ? 'series' : aIn.type === 'recurring' ? 'repeat' : 'calendar';

  const SignupAvatars = ({ count, modalTitle }) => {
    if (count === 0) return <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>暂无报名</span>;
    const overflow = count > ACT_DETAIL_AVATAR_MAX;
    // 溢出时占满 2 行（8 格）：前 7 格头像，第 8 格放「+N 人」按钮，保证它落在第二行末尾
    const shown = overflow ? ACT_DETAIL_AVATAR_MAX - 1 : count;
    const names = signupMemberNames(shown);
    const chip = { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 6px', borderRadius: 99, background: 'var(--surface)', minWidth: 0 };
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ACT_DETAIL_AVATAR_COLS}, minmax(0, 1fr))`, gap: 8 }}>
        {names.map((m, i) => (
          <div key={m + i} style={chip}>
            <Avatar name={m} size={24} /><span style={{ fontSize: 12.5, fontWeight: 600, minWidth: 0 }} className="clamp1">{m}</span>
          </div>
        ))}
        {overflow && (
          <button type="button" onClick={() => setMemberModal({ count, title: modalTitle })}
            style={{ ...chip, justifyContent: 'center', gap: 4, padding: '6px 10px', cursor: 'pointer',
              background: 'var(--brand-soft)', color: 'var(--brand-600)', fontSize: 12.5, fontWeight: 700 }}>
            +{count - (ACT_DETAIL_AVATAR_MAX - 1)} 人<Icon name="chevR" size={14} />
          </button>
        )}
      </div>
    );
  };

  const renderSignupBlock = (s, memberCount) => {
    const count = memberCount != null ? memberCount : s.signed;
    const isOpen = !!sessionOpen[s.id];
    const sfull = count >= s.cap;
    const sEnded = s.status === 'ended';
    return (
      <div key={s.id} style={{ borderRadius: 13, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div onClick={() => toggleSession(s.id)}
          style={{ padding: '11px 13px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in oklch, var(--brand) 6%, var(--surface-2))'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <div style={{ fontSize: 13, fontWeight: 700, flex: 1, minWidth: 0 }}>
              {s.seriesIdx ? `第 ${s.seriesIdx} 期 · ` : ''}{ActWhen.short(s.date)}{ActWhen.isCross(s) ? ` → ${ActWhen.short(s.endDate)}` : ''} <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{s.time}{ActWhen.isCross(s) ? ' · 跨天' : ''}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, ...signupStatusStyle(sEnded, sfull) }}>
                {sEnded ? '已结束' : sfull ? '已满员' : '报名中'}
              </span>
              <Icon name={isOpen ? 'chevD' : 'chevR'} size={16} style={{ color: 'var(--ink-3)' }} />
            </div>
          </div>
          <ProgressBar value={count} max={s.cap} color={SIGNUP_BAR} height={6} />
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 6 }}>{count} / {s.cap} 人 · 余 {Math.max(0, s.cap - count)} 位</div>
        </div>
        {isOpen && (
          <div style={{ padding: '0 13px 12px', borderTop: '1px solid var(--line)' }} className="fade">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', margin: '10px 0 8px' }}>已报名 ({count})</div>
            <SignupAvatars count={count} modalTitle={`${title}${s.seriesIdx ? ` · 第 ${s.seriesIdx} 期` : ''} · ${ActWhen.short(s.date)} · 已报名 (${count})`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <div style={{ padding: '16px 28px 0', background: 'var(--surface)' }}>
        <button onClick={() => setView(backTo)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 14 }}><Icon name="back" size={17} />返回</button>
      </div>
      <div style={{ background: 'var(--surface)', padding: '0 28px 22px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ width: 200, height: 112, borderRadius: 16, overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
            <Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} dim /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <CatBadge cat={a.cat} size="sm" /><TypeTag type={isSeries ? 'series' : aIn.type} />              {isSeries && (
                <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, ...MODE_TAG_STYLE }}>
                  {mode === 'all' ? '整场报名' : '按场次报名'}
                </span>
              )}
              <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, ...(terminated ? { background: 'oklch(0.96 0.04 25)', color: 'oklch(0.55 0.2 25)' } : signupStatusStyle(ended, full)) }}>{terminated ? '已终止' : ended ? '已结束' : full ? '已满员' : '报名中'}</span>
            </div>
            <div style={{ fontSize: 23, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 8 }}>{title}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: 13, color: 'var(--ink-2)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name={timeIcon} size={15} />{isSeries ? `${dateLabel} · ${timeLabel}` : ActWhen.full(aIn)}{!isSeries && ActWhen.daysBadge(aIn) && <span style={{ marginLeft: 2, padding: '1px 7px', borderRadius: 6, background: 'color-mix(in oklch, var(--brand) 12%, white)', color: 'var(--brand)', fontSize: 11, fontWeight: 700 }}>{ActWhen.daysBadge(aIn)}</span>}{aIn.type === 'recurring' && !isSeries && ' (周期)'}</span>
              <button onClick={() => g && setView({ section: 'groupDetail', gid: g.id })} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--ink-2)' }}><Icon name="users" size={15} />{g ? g.name : ''}</button>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="user" size={15} />发起人 {a.host}</span>
              {a.loc && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="pin" size={15} />{a.loc}</span>}
              {a.signupDeadline && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'oklch(0.55 0.13 70)' }}><Icon name="clock" size={15} />报名截止 {a.signupDeadline}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
            {!terminated && <Btn variant="ghost" icon="edit" onClick={() => openActForm(aIn.gid, aIn)}>编辑</Btn>}
            {canTerminate && (
              <Btn variant="danger" icon="flag" onClick={() => { if (confirm('确认终止该活动？终止后状态不可恢复。')) { actions.terminateAct(aIn.id); } }}>终止</Btn>
            )}
            {canDelete && (
              <Btn variant="ghost" icon="trash" onClick={() => { if (confirm('确认删除该活动?')) { actions.delAct(aIn.id); setView(backTo); } }} />
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <StatCard icon="ticket" label={recentSessions ? '已报名 · 最近5场' : signupBlocksDisplay ? (isSeries && mode === 'all' ? '已报名 · 整场' : '已报名 · 全部场次') : '已报名'} value={`${signed}/${cap}`} color="var(--brand)" />
          <StatCard icon="trending" label="报名率" value={`${Math.round(signed / cap * 100)}%`} color="var(--c-outdoor)" />
          <StatCard icon="heart" label="点赞" value={likes} color="var(--c-music)" />
          <StatCard icon="comment" label="评论" value={commentCount} color="var(--c-reading)" />
        </div>

        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
            <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>活动描述</div>
              {desc
                ? <div className="richtext" style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: desc }} />
                : <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>暂无描述</div>}
              {tags && tags.length > 0 && (
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 14 }}>
                  {tags.map(t => <span key={t} style={{ padding: '5px 11px', borderRadius: 99, background: 'var(--bg-2)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>#{t}</span>)}
                </div>
              )}
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>评论 & 互动</div>
              <CommentsView acts={commentActs} inline />
            </div>
          </div>

          <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: 22, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>报名情况</div>
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 700 }}>
                {recentSessions
                  ? `最近 ${recentSessions.length} 场`
                  : signupBlocksDisplay
                    ? `共 ${signupBlocksDisplay.length} ${isSeries ? '期' : '场'}`
                    : (full ? '已满员' : `余 ${cap - signed} 位`)}
              </span>
            </div>
            {isSeries && mode === 'all' && (
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600 }}>整场报名模式</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>各期共用同一批报名成员</div>
              </div>
            )}
            {signupBlocksDisplay ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {signupBlocksDisplay.map(s => renderSignupBlock(
                  s,
                  isSeries && mode === 'all' ? activeEp.signed : null
                ))}
              </div>
            ) : (
              <div style={{ borderRadius: 13, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div onClick={() => toggleSession('single')}
                  style={{ padding: '11px 13px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in oklch, var(--brand) 6%, var(--surface-2))'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>已报名 {signed}/{cap}</span>
                    <Icon name={sessionOpen.single ? 'chevD' : 'chevR'} size={16} style={{ color: 'var(--ink-3)' }} />
                  </div>
                  <ProgressBar value={signed} max={cap} color={SIGNUP_BAR} height={8} />
                </div>
                {sessionOpen.single && (
                  <div style={{ padding: '0 13px 12px', borderTop: '1px solid var(--line)' }} className="fade">
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', margin: '10px 0 8px' }}>已报名 ({signed})</div>
                    <SignupAvatars count={signed} modalTitle={`${title} · 已报名 (${signed})`} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <SignupMembersModal open={!!memberModal} onClose={() => setMemberModal(null)}
        count={memberModal ? memberModal.count : 0} title={memberModal ? memberModal.title : ''} />
    </div>
  );
}

Object.assign(window, { Dashboard, ActTable, GroupsSection, AdminGroupDetail, AdminActDetail, MembersGrid, MiniBars });

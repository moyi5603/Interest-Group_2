// admin-sections.jsx — signups, comments, moments views, activities section, forms, AdminApp shell.
const useAdminPagination = window.useAdminPagination || ((total, config, enabled) => ({
  slice: items => items,
  nav: null,
}));
const AdminPagination = window.AdminPagination || (() => null);
const ADMIN_PAGE = window.ADMIN_PAGE || { groups: { default: 15, options: [15, 50, 100] }, moments: { default: 20, options: [20, 50, 100] }, std: { default: 10, options: [10, 20, 50, 100] } };

function findScrollParent(el) {
  let p = el && el.parentElement;
  while (p && p !== document.body) {
    const oy = getComputedStyle(p).overflowY;
    if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') return p;
    p = p.parentElement;
  }
  return null;
}

/** mobile 列表滚动加载：哨兵进入可视区时加载下一批；resetKey 变化时重新观察（便于连续加载） */
function useScrollLoadMore(hasMore, onLoadMore, resetKey) {
  const sentinelRef = React.useRef(null);
  const onLoadMoreRef = React.useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  React.useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const root = findScrollParent(el);
    let busy = false;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some(e => e.isIntersecting) || busy) return;
      busy = true;
      onLoadMoreRef.current();
    }, { root: root || null, rootMargin: '180px', threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, resetKey]);
  return sentinelRef;
}

function ScrollLoadFooter({ sentinelRef, hasMore, total, pageSize }) {
  if (!total) return null;
  if (hasMore) {
    return (
      <div ref={sentinelRef} style={{ padding: '14px 0', textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)' }}>
        加载更多…
      </div>
    );
  }
  if (total > pageSize) {
    return (
      <div style={{ padding: '14px 0', textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)' }}>
        已加载全部 {total} 条
      </div>
    );
  }
  return null;
}

const SIGNUP_BAR = 'var(--brand)';
const MODE_TAG_STYLE = { background: 'var(--surface-2)', color: 'var(--ink-2)' };
const SESSION_IDX_STYLE = { background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' };
const SIGNUP_AVATAR_MAX = 8;

// 根据报名人数生成确定性的成员名单（mock：人数可能超过 NAMES 列表长度，循环并加序号）
function signupMemberNames(count) {
  const base = DB.NAMES;
  const list = [];
  for (let i = 0; i < count; i++) {
    const name = base[i % base.length];
    const round = Math.floor(i / base.length);
    list.push(round === 0 ? name : `${name}${round + 1}`);
  }
  return list;
}

const SIGNUP_DEPT_FALLBACK = ['产品部', '研发中心', '市场部', '设计部', '人力资源部', '行政部', '财务部', '运营部'];
function signupMemberDept(displayName) {
  const baseName = String(displayName || '').replace(/\d+$/, '');
  const emp = (typeof DB !== 'undefined' && DB.employees || []).find(e => e.name === baseName);
  if (emp && emp.dept) return emp.dept;
  let h = 0;
  for (let i = 0; i < baseName.length; i++) h = (h + baseName.charCodeAt(i) * (i + 1)) % 997;
  return SIGNUP_DEPT_FALLBACK[h % SIGNUP_DEPT_FALLBACK.length];
}

const SIGNUP_MOBILE_AVATAR_MAX = 8;

// 全部报名成员弹窗 / 移动端 Sheet
function SignupMembersModal({ open, onClose, count, title, mobile }) {
  if (!open) return null;
  const names = signupMemberNames(count);
  const grid = (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(4, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))', gap: mobile ? 10 : 10 }}>
      {names.map((name, i) => (
        <div key={name + i} style={{
          display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: 'center',
          gap: mobile ? 4 : 9, padding: mobile ? '8px 4px' : '8px 12px 8px 8px',
          borderRadius: 12, background: 'var(--surface-2)', minWidth: 0,
        }}>
          <Avatar name={name} size={mobile ? 36 : 30} />
          {mobile ? (
            <>
              <span style={{ fontSize: 11, fontWeight: 600, minWidth: 0, textAlign: 'center', width: '100%' }} className="clamp1">{name}</span>
              <span style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--ink-3)', textAlign: 'center', width: '100%' }} className="clamp1">{signupMemberDept(name)}</span>
            </>
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }} className="clamp1">{name}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', marginTop: 1 }} className="clamp1">{signupMemberDept(name)}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
  if (mobile && typeof Sheet === 'function') {
    return (
      <Sheet open={open} onClose={onClose} title={title || `已报名成员 (${count})`}>
        <div style={{ padding: '8px 14px calc(16px + env(safe-area-inset-bottom, 0px))' }}>{grid}</div>
      </Sheet>
    );
  }
  return (
    <Modal open={open} onClose={onClose} title={title || `已报名成员 (${count})`} width={600}>
      <div style={{ padding: 22 }}>{grid}</div>
    </Modal>
  );
}

function SignupsView({ acts, paginate = true, embedded = false }) {
  const { store, mobileAdmin } = useA();
  const [memberModal, setMemberModal] = React.useState(null);
  const m = !!mobileAdmin;

  // Build display units (same grouping logic as ActTable)
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

  const pg = useAdminPagination(units.length, ADMIN_PAGE.std, paginate && !m);
  const shownUnits = pg.slice(units);

  const [open, setOpen] = React.useState(units[0] ? units[0].key : null);
  const [sessionOpen, setSessionOpen] = React.useState({});
  const toggleSession = k => setSessionOpen(s => ({ ...s, [k]: !s[k] }));
  const unitOpen = (key) => embedded || open === key;

  const ProgressBlock = ({ signed, cap, sub, height = 6 }) => (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: m ? 12 : 12.5, fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span>{signed}/{cap}</span>
        <span style={{ color: 'var(--ink-3)' }}>{cap ? Math.round(signed / cap * 100) : 0}%</span>
      </div>
      <ProgressBar value={signed} max={cap || 1} color={SIGNUP_BAR} height={height} />
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, fontWeight: 600 }}>{sub}</div>}
    </div>
  );

  const Avatars = ({ count, title }) => {
    if (m) {
      const overflow = count > SIGNUP_MOBILE_AVATAR_MAX;
      const shown = overflow ? SIGNUP_MOBILE_AVATAR_MAX : count;
      const names = signupMemberNames(shown);
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {names.map((name, i) => (
              <div key={name + i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 0 }}>
                <Avatar name={name} size={36} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink)', textAlign: 'center', width: '100%' }} className="clamp1">{name}</span>
                <span style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--ink-3)', textAlign: 'center', width: '100%' }} className="clamp1">{signupMemberDept(name)}</span>
              </div>
            ))}
          </div>
          {overflow && (
            <button type="button" onClick={() => setMemberModal({ count, title })}
              style={{
                marginTop: 10, width: '100%', padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'var(--brand-soft)', color: 'var(--brand-600)', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
              查看全部 {count} 人<Icon name="chevR" size={15} />
            </button>
          )}
        </div>
      );
    }
    const overflow = count > SIGNUP_AVATAR_MAX;
    const shown = overflow ? SIGNUP_AVATAR_MAX - 1 : count;
    const names = signupMemberNames(shown);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        {names.map((name, i) => (
          <div key={name + i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px 6px 6px', borderRadius: 14, background: 'var(--surface-2)' }}>
            <Avatar name={name} size={26} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2 }}>{name}</div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-3)', marginTop: 2 }}>{signupMemberDept(name)}</div>
            </div>
          </div>
        ))}
        {overflow && (
          <button type="button" onClick={() => setMemberModal({ count, title })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 99,
              background: 'var(--brand-soft)', color: 'var(--brand-600)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
            +{count - (SIGNUP_AVATAR_MAX - 1)} 人<Icon name="chevR" size={14} />
          </button>
        )}
      </div>
    );
  };

  const ModePill = ({ mode }) => (
    <span style={{ padding: '2px 7px', borderRadius: 99, fontSize: 10.5, fontWeight: 700, flexShrink: 0, ...MODE_TAG_STYLE }}>
      {mode === 'all' ? '整场报名' : '按场次'}
    </span>
  );

  const cardPad = m ? 12 : 16;
  const coverSz = m ? 44 : 48;

  if (!units.length) {
    return <div style={{ padding: '36px 16px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>暂无报名数据</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: m ? 10 : 14 }}>
      {shownUnits.map(unit => {
        const isOpen = unitOpen(unit.key);

        if (unit.kind === 'single') {
          const a = unit.act;
          const g = store.groups.find(x => x.id === a.gid);
          const meta = `${g ? g.name : ''} · ${ActWhen.full(a)}${ActWhen.daysBadge(a) ? ` · ${ActWhen.daysBadge(a)}` : ''}`;
          return (
            <div key={unit.key} style={{ background: 'var(--surface)', borderRadius: m ? 14 : 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              {!embedded && (
              <div onClick={() => setOpen(isOpen ? null : unit.key)}
                style={{ padding: cardPad, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: m ? 10 : 14 }}>
                  <div style={{ width: coverSz, height: coverSz, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    <Cover src={a.cover} seed={a.id + a.cat} icon={getCat(a.cat).icon} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: m ? 14 : 15, fontWeight: 700 }} className="clamp1">{a.title}</span>
                      <TypeTag type={a.type} />
                    </div>
                    <div style={{ fontSize: m ? 11.5 : 12.5, color: 'var(--ink-3)', marginTop: 3 }} className="clamp1">{meta}</div>
                  </div>
                  {!m && (
                    <div style={{ width: 130, flexShrink: 0 }}><ProgressBlock signed={a.signed} cap={a.cap} /></div>
                  )}
                  <Icon name={isOpen ? 'chevD' : 'chevR'} size={m ? 18 : 20} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                </div>
                {m && <div style={{ marginTop: 10 }}><ProgressBlock signed={a.signed} cap={a.cap} /></div>}
              </div>
              )}
              {embedded && (
                <div style={{ padding: cardPad }}>
                  <ProgressBlock signed={a.signed} cap={a.cap} />
                </div>
              )}
              {isOpen && (
                <div style={{ padding: m ? '0 12px 12px' : '0 16px 16px', borderTop: '1px solid var(--line)' }} className="fade">
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', margin: m ? '10px 0 8px' : '14px 0 11px' }}>已报名成员 ({a.signed})</div>
                  <Avatars count={a.signed} title={`${a.title} · 已报名成员 (${a.signed})`} />
                </div>
              )}
            </div>
          );
        }

        if (unit.kind === 'recurring') {
          const a = unit.act;
          const g = store.groups.find(x => x.id === a.gid);
          const sessionsAll = a.sessions || [];
          const sessions = DBH.recentSessions(sessionsAll) || [];
          const recentSigned = sessions.reduce((t, s) => t + s.signed, 0);
          const recentCap = sessions.reduce((t, s) => t + s.cap, 0);
          const sessionLabel = sessionsAll.length > DBH.RECENT_SESSIONS_MAX
            ? `最近 ${sessions.length} 场（共 ${sessionsAll.length} 场）`
            : `共 ${sessionsAll.length} 个场次`;
          return (
            <div key={unit.key} style={{ background: 'var(--surface)', borderRadius: m ? 14 : 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              {!embedded && (
              <div onClick={() => setOpen(isOpen ? null : unit.key)} style={{ padding: cardPad, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: m ? 10 : 14 }}>
                  <div style={{ width: coverSz, height: coverSz, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    <Cover src={a.cover} seed={a.id + a.cat} icon={getCat(a.cat).icon} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: m ? 14 : 15, fontWeight: 700 }} className="clamp1">{a.title}</span>
                      <TypeTag type={a.type} />
                    </div>
                    <div style={{ fontSize: m ? 11.5 : 12.5, color: 'var(--ink-3)', marginTop: 3 }} className="clamp1">
                      {g ? g.name : ''} · {sessionLabel} · 按场次报名
                    </div>
                  </div>
                  {!m && (
                    <div style={{ width: 130, flexShrink: 0 }}>
                      {sessions.length > 0
                        ? <ProgressBlock signed={recentSigned} cap={recentCap} sub={`最近 ${sessions.length} 场人次`} />
                        : <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>按场次报名</div>}
                    </div>
                  )}
                  <Icon name={isOpen ? 'chevD' : 'chevR'} size={m ? 18 : 20} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                </div>
                {m && sessions.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <ProgressBlock signed={recentSigned} cap={recentCap} sub={`最近 ${sessions.length} 场人次`} />
                  </div>
                )}
              </div>
              )}
              {embedded && sessions.length > 0 && (
                <div style={{ padding: cardPad }}>
                  <ProgressBlock signed={recentSigned} cap={recentCap} sub={`最近 ${sessions.length} 场人次`} />
                </div>
              )}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--line)' }} className="fade">
                  {sessions.length > 0 && (
                    <div style={{ padding: m ? '10px 12px 0' : '12px 16px 0', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>
                      最近 {sessions.length} 场{sessionsAll.length > sessions.length ? ` · 仅展示最近 ${DBH.RECENT_SESSIONS_MAX} 场` : ''}
                    </div>
                  )}
                  {sessions.map((s, si) => {
                    const sOpen = sessionOpen[s.id];
                    return (
                      <div key={s.id} style={{ borderTop: si ? '1px solid var(--line)' : 'none' }}>
                        <div onClick={() => toggleSession(s.id)}
                          style={{ padding: m ? '12px' : '12px 16px', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1, ...SESSION_IDX_STYLE }}>{si + 1}</div>
                            <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, lineHeight: 1.4 }}>
                              {s.date}{ActWhen.isCross(s) ? ` → ${s.endDate}` : ''}
                              <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}> {s.time}{ActWhen.isCross(s) ? ' · 跨天' : ''}</span>
                            </div>
                            {!m && (
                              <div style={{ width: 110 }}><ProgressBlock signed={s.signed} cap={s.cap} height={5} /></div>
                            )}
                            <Icon name={sOpen ? 'chevD' : 'chevR'} size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                          </div>
                          {m && <div style={{ marginTop: 8, paddingLeft: 34 }}><ProgressBlock signed={s.signed} cap={s.cap} height={5} /></div>}
                        </div>
                        {sOpen && (
                          <div style={{ padding: m ? '0 12px 12px' : '0 16px 14px 54px' }} className="fade">
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 9 }}>已报名 ({s.signed})</div>
                            <Avatars count={s.signed} title={`${a.title} · ${s.date} · 已报名 (${s.signed})`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {sessions.length === 0 && (
                    <div style={{ padding: '16px', fontSize: 13, color: 'var(--ink-3)' }}>暂无场次数据</div>
                  )}
                </div>
              )}
            </div>
          );
        }

        if (unit.kind === 'series') {
          const { eps, key } = unit;
          const first = eps[0];
          const g = store.groups.find(x => x.id === unit.gid);
          const mode = first.seriesSignupMode || 'independent';
          const totalSigned = mode === 'all' ? first.signed : eps.reduce((s, e) => s + e.signed, 0);
          const totalCap = mode === 'all' ? first.cap : eps.reduce((s, e) => s + e.cap, 0);
          return (
            <div key={key} style={{ background: 'var(--surface)', borderRadius: m ? 14 : 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              {!embedded && (
              <div onClick={() => setOpen(isOpen ? null : key)} style={{ padding: cardPad, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: m ? 10 : 14 }}>
                  <div style={{ width: coverSz, height: coverSz, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    <Cover src={first.cover} seed={first.id + first.cat} icon={getCat(first.cat).icon} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: m ? 14 : 15, fontWeight: 700 }} className="clamp1">{first.series || first.title}</span>
                      <TypeTag type="series" />
                      <ModePill mode={mode} />
                    </div>
                    <div style={{ fontSize: m ? 11.5 : 12.5, color: 'var(--ink-3)', marginTop: 3 }} className="clamp1">
                      {g ? g.name : ''} · 共 {eps.length} 场
                    </div>
                  </div>
                  {!m && (
                    <div style={{ width: 130, flexShrink: 0 }}>
                      {mode === 'all'
                        ? <ProgressBlock signed={totalSigned} cap={totalCap} />
                        : <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{totalSigned} 人次</div>}
                    </div>
                  )}
                  <Icon name={isOpen ? 'chevD' : 'chevR'} size={m ? 18 : 20} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                </div>
                {m && (
                  <div style={{ marginTop: 10 }}>
                    {mode === 'all'
                      ? <ProgressBlock signed={totalSigned} cap={totalCap} />
                      : <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>合计 {totalSigned} 人次</div>}
                  </div>
                )}
              </div>
              )}
              {embedded && (
                <div style={{ padding: cardPad }}>
                  {mode === 'all'
                    ? <ProgressBlock signed={totalSigned} cap={totalCap} />
                    : <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>合计 {totalSigned} 人次 · 共 {eps.length} 场</div>}
                </div>
              )}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--line)' }} className="fade">
                  {mode === 'all' ? (
                    <div style={{ padding: m ? '12px' : '14px 16px 16px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 11 }}>
                        整场报名成员 ({totalSigned}) · 参与全部 {eps.length} 场
                      </div>
                      <Avatars count={totalSigned} title={`${first.series || first.title} · 整场报名成员 (${totalSigned})`} />
                    </div>
                  ) : (
                    eps.map((ep, ei) => {
                      const epOpen = sessionOpen[ep.id];
                      return (
                        <div key={ep.id} style={{ borderTop: ei ? '1px solid var(--line)' : 'none' }}>
                          <div onClick={() => toggleSession(ep.id)} style={{ padding: m ? '12px' : '12px 16px', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 24, height: 24, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, ...SESSION_IDX_STYLE }}>{ep.seriesIdx || ei + 1}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 600 }} className="clamp1">{ep.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--ink-3)' }} className="clamp1">{ActWhen.full(ep)}{ActWhen.daysBadge(ep) ? ` · ${ActWhen.daysBadge(ep)}` : ''}</div>
                              </div>
                              {!m && (
                                <div style={{ width: 110 }}><ProgressBlock signed={ep.signed} cap={ep.cap} height={5} /></div>
                              )}
                              <Icon name={epOpen ? 'chevD' : 'chevR'} size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                            </div>
                            {m && <div style={{ marginTop: 8, paddingLeft: 34 }}><ProgressBlock signed={ep.signed} cap={ep.cap} height={5} /></div>}
                          </div>
                          {epOpen && (
                            <div style={{ padding: m ? '0 12px 12px' : '0 16px 14px 54px' }} className="fade">
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 9 }}>已报名 ({ep.signed})</div>
                              <Avatars count={ep.signed} title={`${ep.title} · 已报名 (${ep.signed})`} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        }
        return null;
      })}
      {pg.nav && <AdminPagination {...pg.nav} style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)' }} />}
      <SignupMembersModal open={!!memberModal} onClose={() => setMemberModal(null)} mobile={m}
        count={memberModal ? memberModal.count : 0} title={memberModal ? memberModal.title : ''} />
    </div>
  );
}

const COMMENTS_PAGE = 5;

function CommentsView({ acts, inline }) {
  const { store, actions, mobileAdmin } = useA();
  const [page, setPage] = React.useState(1);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const pageSize = ADMIN_PAGE.std.default;
  const [visibleCount, setVisibleCount] = React.useState(pageSize);
  const aids = acts.map(a => a.id);
  const comments = (store.comments || []).filter(c => aids.includes(c.aid) && !c.isAI);
  const total = comments.length;
  const pg = useAdminPagination(total, ADMIN_PAGE.std, !inline && !mobileAdmin);
  React.useEffect(() => { setVisibleCount(pageSize); }, [total, pageSize]);
  const scrollHasMore = !!(mobileAdmin && !inline && visibleCount < total);
  const sentinelRef = useScrollLoadMore(scrollHasMore, () => {
    setVisibleCount(v => Math.min(v + pageSize, total));
  }, visibleCount);

  const doDelete = () => {
    if (!deleteTarget) return;
    actions.delComment(deleteTarget.id);
    toast('评论已删除', { icon: 'trash' });
    setDeleteTarget(null);
  };
  const deleteConfirm = mobileAdmin ? (
    <ConfirmSheet open={!!deleteTarget} title="删除评论"
      message={deleteTarget ? `确认删除「${deleteTarget.author}」的评论？删除后不可恢复。` : ''}
      confirmLabel="确认删除" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
  ) : (
    <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="删除评论" width={420}>
      <div style={{ padding: '20px 24px 24px' }}>
        <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>
          确认删除{deleteTarget ? <>「<span style={{ fontWeight: 700, color: 'var(--ink)' }}>{deleteTarget.author}</span>」的</> : '该'}评论？删除后不可恢复。
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>取消</Btn>
          <Btn variant="danger" icon="trash" onClick={doDelete}>确认删除</Btn>
        </div>
      </div>
    </Modal>
  );

  if (!comments.length) return <><Empty text="暂无评论" />{deleteConfirm}</>;

  const CommentRow = ({ c, i }) => {
    const a = store.acts.find(x => x.id === c.aid);
    return (
      <div key={c.id} style={{ display: 'flex', gap: 13, padding: 18, borderTop: i ? '1px solid var(--line)' : 'none' }}>
        {c.isAI
          ? <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ai-grad)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} color="#fff" /></div>
          : <Avatar name={c.author} size={40} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: c.isAI ? 'var(--ai)' : 'var(--ink)' }}>{c.author}</span>
            {c.isAI && <AIPill />}<span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{c.time}</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.55, margin: '5px 0 7px' }}>{c.text}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 10 }}>
            {a && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }} className="clamp1"><Icon name={getCat(a.cat).icon} size={13} style={{ color: getCat(a.cat).color, flexShrink: 0 }} />{a.title}</span>}
            {!a && <span style={{ flex: 1 }} />}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, flexShrink: 0, marginLeft: 'auto' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 36 }}>
                <Icon name="heart" size={13} />{c.likes}
              </span>
              <button type="button" title="删除" onClick={() => setDeleteTarget(c)}
                style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'oklch(0.55 0.2 25)', flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                <Icon name="trash" size={15} />
              </button>
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (inline) {
    const shown = comments.slice(0, page * COMMENTS_PAGE);
    const hasMore = shown.length < total;
    return (
      <>
        <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)' }}>
          {shown.map((c, i) => <CommentRow key={c.id} c={c} i={i} />)}
          {hasMore && (
            <div style={{ borderTop: '1px solid var(--line)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>已显示 {shown.length} / {total} 条</span>
              <button type="button" onClick={() => setPage(p => p + 1)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>
                显示更多<Icon name="chevD" size={15} />
              </button>
            </div>
          )}
          {!hasMore && total > COMMENTS_PAGE && (
            <div style={{ borderTop: '1px solid var(--line)', padding: '14px 18px', display: 'flex', justifyContent: 'center' }}>
              <button type="button" onClick={() => setPage(1)}
                style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="chevU" size={15} />收起
              </button>
            </div>
          )}
        </div>
        {deleteConfirm}
      </>
    );
  }

  if (mobileAdmin) {
    const shown = comments.slice(0, visibleCount);
    return (
      <>
        <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)' }}>
          {shown.map((c, i) => <CommentRow key={c.id} c={c} i={i} />)}
        </div>
        <ScrollLoadFooter sentinelRef={sentinelRef} hasMore={scrollHasMore} total={total} pageSize={pageSize} />
        {deleteConfirm}
      </>
    );
  }

  const shown = pg.slice(comments);
  return (
    <>
      <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)' }}>
        {shown.map((c, i) => <CommentRow key={c.id} c={c} i={i} />)}
        {pg.nav && <AdminPagination {...pg.nav} />}
      </div>
      {deleteConfirm}
    </>
  );
}

function AdminMomentPhotos({ seeds }) {
  const [lb, setLb] = React.useState({ open: false, i: 0 });
  const n = seeds.length;
  const cols = n === 1 ? 1 : n === 2 || n === 4 ? 2 : 3;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, borderRadius: 14, overflow: 'hidden' }}>
        {seeds.map((s, i) => (
          <div key={i} role="button" tabIndex={0} onClick={e => { e.stopPropagation(); setLb({ open: true, i }); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); setLb({ open: true, i }); } }}
            style={{ aspectRatio: n === 1 ? '16/10' : '1', overflow: 'hidden', borderRadius: n === 1 ? 14 : 10, cursor: 'pointer' }}>
            <Photo seed={s} label="活动照片" />
          </div>
        ))}
      </div>
      <PhotoLightbox open={lb.open} seeds={seeds} index={lb.i} onClose={() => setLb({ open: false, i: 0 })} />
    </>
  );
}

function MomentDetailModal({ open, moment: m, onClose, navBack }) {
  const { setView } = useA();
  if (!m) return null;
  const act = DB.acts.find(x => x.id === m.aid);
  const group = DB.groups.find(x => x.id === m.gid);
  const goAct = () => {
    if (!act) return;
    onClose();
    setView({ section: 'actDetail', aid: act.id, back: navBack });
  };
  const goGroup = () => {
    if (!group) return;
    onClose();
    setView({ section: 'groupDetail', gid: group.id, back: navBack });
  };
  return (
    <Modal open={open} onClose={onClose} title="精彩瞬间详情" width={640}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Avatar name={m.author} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{m.author}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{m.time}</div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="heart" size={16} fill style={{ color: 'var(--brand)' }} />{m.likes} 赞
          </span>
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink)', marginBottom: 18, whiteSpace: 'pre-wrap' }}>{m.text}</div>
        {m.imgs && m.imgs.length > 0 && <div style={{ marginBottom: 20 }}><AdminMomentPhotos seeds={m.imgs} /></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          {group && (
            <button type="button" onClick={goGroup} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12,
              background: 'var(--surface-2)', textAlign: 'left', width: '100%' }}>
              <Icon name="users" size={18} style={{ color: 'var(--brand)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>所属小组</div>
                <div style={{ fontSize: 14, fontWeight: 700 }} className="clamp1">{group.name}</div>
              </div>
              <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />
            </button>
          )}
          {act && (
            <button type="button" onClick={goAct} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12,
              background: 'var(--surface-2)', textAlign: 'left', width: '100%' }}>
              <Icon name={getCat(act.cat).icon} size={18} style={{ color: getCat(act.cat).color }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>关联活动</div>
                <div style={{ fontSize: 14, fontWeight: 700 }} className="clamp1">{act.title}</div>
              </div>
              <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** 管理端移动：对齐员工端 MomentCard 纵向 feed（审核删除） */
function AdminMomentCard({ m, navBack, onDeleted }) {
  const { setView } = useA();
  const act = DB.acts.find(a => a.id === m.aid);
  const comments = (DB.momentComments || []).filter(c => c.mid === m.id);
  const [lb, setLb] = React.useState({ open: false, i: 0 });
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const Grid = typeof ImgGrid === 'function' ? ImgGrid : null;

  const goAct = () => {
    if (!act) return;
    setView({ section: 'actDetail', aid: act.id, back: navBack || { section: 'groupDetail', gid: m.gid } });
  };
  const doDelete = () => {
    const idx = DB.moments.findIndex(x => x.id === m.id);
    if (idx >= 0) DB.moments.splice(idx, 1);
    setConfirmDel(false);
    if (onDeleted) onDeleted(m.id);
    toast('已删除', { icon: 'trash' });
  };

  return (
    <>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', padding: 15 }}>
        <div style={{ display: 'flex', gap: 11, marginBottom: 11, alignItems: 'flex-start' }}>
          <Avatar name={m.author} size={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>{m.author}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{m.time}</div>
          </div>
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.6, marginBottom: 11 }}>{m.text}</div>
        {m.imgs && m.imgs.length > 0 && (
          Grid
            ? <>
                <Grid seeds={m.imgs} onImgClick={i => setLb({ open: true, i })} />
                <PhotoLightbox open={lb.open} seeds={m.imgs} index={lb.i} onClose={() => setLb({ open: false, i: 0 })} />
              </>
            : <AdminMomentPhotos seeds={m.imgs} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
          {act && (
            <button type="button" onClick={goAct} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 10,
              background: 'var(--bg-2)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)',
              border: 'none', cursor: 'pointer', minWidth: 0, flex: '1 1 auto',
            }}>
              <Icon name={getCat(act.cat).icon} size={14} stroke={2.2} style={{ color: getCat(act.cat).color, flexShrink: 0 }} />
              <span className="clamp1" style={{ minWidth: 0 }}>来自 · {act.title}</span>
              <Icon name="chevR" size={14} style={{ flexShrink: 0 }} />
            </button>
          )}
          <div style={{ position: 'relative', flexShrink: 0, marginLeft: act ? 0 : 'auto' }}>
            <button type="button" aria-label="更多" onClick={() => setMoreOpen(v => !v)}
              style={{ width: 32, height: 28, borderRadius: 8, background: 'var(--bg-2)', color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, letterSpacing: 1, border: 'none', cursor: 'pointer' }}>
              ···
            </button>
            {moreOpen && (
              <>
                <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 6, zIndex: 41,
                  display: 'flex', flexWrap: 'nowrap', alignItems: 'stretch',
                  width: 'max-content', borderRadius: 8, overflow: 'hidden', whiteSpace: 'nowrap',
                  background: 'rgba(70,70,70,0.95)', boxShadow: 'var(--shadow-md)',
                }}>
                  <button type="button" onClick={() => { setMoreOpen(false); setConfirmDel(true); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', color: '#fff',
                      fontSize: 13, fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer',
                      flexShrink: 0, whiteSpace: 'nowrap' }}>
                    <Icon name="trash" size={15} />删除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {(m.likes > 0 || comments.length > 0) && (
          <div style={{ marginTop: 10, borderRadius: 10, background: 'var(--bg-2)', padding: '8px 10px' }}>
            {m.likes > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600,
                color: 'var(--brand-600)', paddingBottom: comments.length ? 7 : 0,
                borderBottom: comments.length ? '1px solid var(--line)' : 'none', marginBottom: comments.length ? 6 : 0 }}>
                <Icon name="heart" size={13} fill style={{ color: 'var(--brand)' }} />
                {m.likes} 人觉得很赞
              </div>
            )}
            {comments.map(c => (
              <div key={c.id} style={{ padding: '3px 0', fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
                <span style={{ fontWeight: 700, color: 'var(--brand-600)' }}>{c.author}</span>
                {c.replyAuthor && <>
                  <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}> 回复 </span>
                  <span style={{ fontWeight: 700, color: 'var(--brand-600)' }}>{c.replyAuthor}</span>
                </>}
                <span style={{ fontWeight: 500 }}>：{c.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {typeof ConfirmSheet === 'function' && (
        <ConfirmSheet
          open={confirmDel}
          title="删除精彩瞬间"
          message="确认删除这条精彩瞬间？删除后不可恢复。"
          cancelLabel="取消"
          confirmLabel="确认删除"
          onCancel={() => setConfirmDel(false)}
          onConfirm={doDelete}
        />
      )}
    </>
  );
}

function MomentsGrid({ moms, navBack, paginate = false, emptyText = '暂无精彩瞬间' }) {
  const { mobileAdmin } = useA();
  const [detail, setDetail] = React.useState(null);
  const [imgLb, setImgLb] = React.useState({ open: false, seeds: [], i: 0 });
  const [gone, setGone] = React.useState({});
  const pageSize = ADMIN_PAGE.moments.default;
  const [visibleCount, setVisibleCount] = React.useState(pageSize);
  const list = (moms || []).filter(m => !gone[m.id]);
  const total = list.length;
  React.useEffect(() => { setVisibleCount(pageSize); }, [total, pageSize]);
  const scrollHasMore = !!(mobileAdmin && visibleCount < total);
  const sentinelRef = useScrollLoadMore(scrollHasMore, () => {
    setVisibleCount(v => Math.min(v + pageSize, total));
  }, visibleCount);
  const pg = useAdminPagination(total, ADMIN_PAGE.moments, paginate && !mobileAdmin);
  const shown = mobileAdmin ? list.slice(0, visibleCount) : pg.slice(list);
  const aiBar = (
    <div style={{ borderRadius: 16, padding: 2, background: 'var(--ai-grad)' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: mobileAdmin ? 12 : 16, display: 'flex', alignItems: 'center', gap: 13 }}>
        <Sparkles size={mobileAdmin ? 20 : 22} color="var(--ai)" />
        <div style={{ flex: 1, fontSize: mobileAdmin ? 12.5 : 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          <b style={{ color: 'var(--ink)' }}>AI 汇总:</b> 共 {list.length} 条精彩瞬间,累计 {list.reduce((s, m) => s + (m.likes || 0), 0)} 个赞,氛围积极。已自动同步至各活动详情页与小组圈。
        </div>
      </div>
    </div>
  );
  if (!list.length) return <Empty text={emptyText} />;

  if (mobileAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {aiBar}
        {shown.map(m => (
          <AdminMomentCard key={m.id} m={m} navBack={navBack}
            onDeleted={id => setGone(s => ({ ...s, [id]: true }))} />
        ))}
        <ScrollLoadFooter sentinelRef={sentinelRef} hasMore={scrollHasMore} total={total} pageSize={pageSize} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {aiBar}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 16 }}>
        {shown.map(m => {
          const a = DB.acts.find(x => x.id === m.aid);
          return (
            <div key={m.id} role="button" tabIndex={0} onClick={() => setDetail(m)} onKeyDown={e => { if (e.key === 'Enter') setDetail(m); }}
              style={{ background: 'var(--surface)', borderRadius: 16, boxShadow: 'var(--shadow-sm)', overflow: 'hidden', cursor: 'pointer',
                transition: 'transform .15s, box-shadow .15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: m.imgs.length > 1 ? '1fr 1fr' : '1fr', gap: 3, height: 150 }}
                onClick={e => { e.stopPropagation(); setImgLb({ open: true, seeds: m.imgs, i: 0 }); }}>
                {m.imgs.slice(0, m.imgs.length > 1 ? 2 : 1).map((s, i) => <Photo key={i} seed={s} label="活动照片" />)}
                {m.imgs.length > 2 && <span style={{ position: 'absolute', bottom: 8, right: 8, padding: '4px 9px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontWeight: 700 }}>+{m.imgs.length - 2} 张</span>}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Avatar name={m.author} size={28} /><span style={{ fontSize: 13, fontWeight: 700 }}>{m.author}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="heart" size={13} fill />{m.likes}</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }} className="clamp2">{m.text}</div>
                {a && <div style={{ marginTop: 9, fontSize: 11.5, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name={getCat(a.cat).icon} size={13} style={{ color: getCat(a.cat).color }} />{a.title}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {pg.nav && <AdminPagination {...pg.nav} style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)' }} />}
      <MomentDetailModal open={!!detail} moment={detail} onClose={() => setDetail(null)} navBack={navBack} />
      <PhotoLightbox open={imgLb.open} seeds={imgLb.seeds} index={imgLb.i} onClose={() => setImgLb({ open: false, seeds: [], i: 0 })} />
    </div>
  );
}

function filterMomentsBySearch(moments, acts, groups, actQ, groupQ) {
  const actTerm = actQ.trim();
  const groupTerm = groupQ.trim();
  if (!actTerm && !groupTerm) return moments;
  const actOf = id => acts.find(a => a.id === id);
  const groupNameOf = gid => (groups.find(g => g.id === gid) || {}).name || '';
  return moments.filter(m => {
    const a = actOf(m.aid);
    const gid = m.gid || (a ? a.gid : '');
    const actOk = !actTerm || (a && (a.title.includes(actTerm) || (a.series && a.series.includes(actTerm))));
    const groupOk = !groupTerm || groupNameOf(gid).includes(groupTerm);
    return actOk && groupOk;
  });
}

function filterActsBySearch(acts, groups, actQ, groupQ) {
  const actTerm = actQ.trim();
  const groupTerm = groupQ.trim();
  if (!actTerm && !groupTerm) return acts;
  const groupNameOf = gid => (groups.find(g => g.id === gid) || {}).name || '';
  const matches = a => {
    const actOk = !actTerm || a.title.includes(actTerm) || (a.series && a.series.includes(actTerm));
    const groupOk = !groupTerm || groupNameOf(a.gid).includes(groupTerm);
    return actOk && groupOk;
  };
  const seriesKeys = new Set();
  acts.forEach(a => {
    if (a.type === 'series' && a.series && matches(a)) seriesKeys.add(a.series + '|||' + a.gid);
  });
  return acts.filter(a => {
    if (a.type === 'series' && a.series && seriesKeys.has(a.series + '|||' + a.gid)) return true;
    return matches(a);
  });
}

/** 管理者移动端 · AI 对话逐步创建（核心字段） */
const AI_GUIDE_TOTAL = 9;
const AI_GUIDE_Q = {
  group: '先选一个所属小组吧～',
  type: '这次是什么类型的活动？',
  title: '活动标题想叫什么？也可以点下面的建议。',
  when: '什么时候办？',
  loc: '集合地点写在哪？',
  cap: '人数上限大概多少？（直接回数字即可）',
  desc: '要不要我按「开场 + 活动安排 + 亮点 + 注意事项」帮你写简介？也可以自己输入。',
  cover: '封面图是必填的，请上传一张活动封面（JPG / PNG）。',
  confirm: '信息齐了，确认一下再发布～',
};
function aiGuideTitleHints(g) {
  const cat = g ? (typeof getCat === 'function' ? getCat(g.cat).label : '') : '';
  const name = g ? g.name : '兴趣小组';
  return [`${name} · 周末局`, `${cat || '主题'}体验日`, `新人友好 · ${name}`];
}
/** 简介提示词结构：开场 + 活动安排 + 亮点 + 注意事项；纯文本约 150–300 字 */
const AI_GUIDE_DESC_PROMPT = [
  '开场吸引语（1-2句话说明这是什么活动，为什么值得参加）',
  '📋 活动安排',
  '● 🕒 时间...',
  '● 📍 地点...',
  '● 其他安排项...',
  '✨ 亮点 / 为什么参加',
  '● 亮点1 / 亮点2 / 亮点3',
  '⚠️ 注意事项 / 温馨提示',
  '总字数150-300字（纯文本计），用emoji增强可读性。',
].join('\n');
function aiGuideDescPlain({ title, loc, when, cap, cat, typeLabel }) {
  const t = title || '本次活动';
  const place = loc || '详见群内通知';
  const time = when || '时间待定';
  const hooks = {
    sport: `想流点汗又认识新同事？「${t}」轻松开练，节奏随你，下班后正好放松一下。`,
    outdoor: `走出工位呼吸新鲜空气。「${t}」约你一起把脚步交给山野与风景。`,
    reading: `一本书，一群人，慢慢读。「${t}」不打卡不焦虑，只在文字里相遇。`,
    music: `把耳朵交给现场。「${t}」适合拼票同行，也欢迎只会听歌的你。`,
    game: `快乐第一，胜负随缘。「${t}」新手友好，午休或下班随时开局。`,
    photo: `用镜头记录光影。「${t}」主题外拍，新手老炮都能找到灵感。`,
    food: `工资的一半交给胃。「${t}」认真吃、认真打分，做最懂吃的一群人。`,
  };
  const highlights = {
    sport: ['配速分组，零基础也有人带', '出发前热身、结束后拉伸', '跑后可自由约饭复盘'],
    outdoor: ['线路分级清晰，强度心里有数', '领队持证，安全提醒到位', '风景与同伴都值得期待'],
    reading: ['轻松讨论，不强制发言', '主题提前公布，可带着问题来', '适合充电、也适合交友'],
    music: ['氛围轻松，重在一起听', '可拼车同行，费用透明', '结束后还能约饭复盘'],
    game: ['有教学局，新人也能玩', '时长可控，不耽误正事', '快乐优先，输赢不较真'],
    photo: ['主题明确，好出片', '可互勉构图与器材', '作品欢迎发小组圈'],
    food: ['人均预算群内公示', '口味说明清楚，忌口可提前说', '吃完可晒图打分'],
  };
  const tips = {
    sport: ['请穿运动鞋并自备水壶', '身体不适请量力而行'],
    outdoor: ['请穿防滑鞋，备好防晒与少量路餐', '听从领队安排，勿独自离队'],
    reading: ['请提前阅读指定章节更佳', '现场保持轻声，方便讨论'],
    music: ['集合时间请预留交通缓冲', '现场请勿大声喧哗影响他人'],
    game: ['请准时到场，方便开局', '公共区域请爱护桌椅与道具'],
    photo: ['相机/手机请满电，备好存储', '注意安全与他人隐私'],
    food: ['忌口与过敏请提前告知同行', '文明用餐，AA 费用当场结清'],
  };
  const key = hooks[cat] ? cat : 'sport';
  const lines = [
    hooks[key],
    '',
    '📋 活动安排',
    `● 🕒 时间：${time}`,
    `● 📍 地点：${place}`,
    `● 👥 人数：上限 ${cap || 20} 人`,
    typeLabel ? `● 🏷 类型：${typeLabel}` : null,
    '',
    '✨ 亮点 / 为什么参加',
    ...(highlights[key] || highlights.sport).map(h => `● ${h}`),
    '',
    '⚠️ 注意事项 / 温馨提示',
    ...(tips[key] || tips.sport).map(h => `● ${h}`),
  ].filter(x => x !== null);
  let plain = lines.join('\n');
  // 控制在约 150–300 字（按去掉空白后的字符数估算）
  const count = s => s.replace(/\s/g, '').length;
  if (count(plain) > 300) {
    plain = lines.filter((l, i) => i < lines.length - 1 || count(lines.slice(0, -1).join('\n')) >= 150).join('\n');
  }
  return plain;
}
function aiGuidePlainToHtml(plain) {
  const esc = String(plain || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<p>${esc.replace(/\n/g, '<br/>')}</p>`;
}
function aiGuideHtmlToPlain(html) {
  return String(html || '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<li>/gi, '● ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
const DESC_IMG_MAX = 9;
function countDescImgs(html) {
  return (String(html || '').match(/<img\b/gi) || []).length;
}
function appendDescImgs(html, dataUrls) {
  const imgs = (dataUrls || []).map(src =>
    `<p style="margin:10px 0 0"><img src="${src}" alt="" style="max-width:100%;border-radius:12px;display:block"/></p>`
  ).join('');
  return String(html || '') + imgs;
}
function extractDescImgSrcs(html) {
  const out = [];
  String(html || '').replace(/<img[^>]+src=["']([^"']+)["']/gi, (_, src) => { out.push(src); return _; });
  return out;
}

function fuzzyMatchGroups(groups, query) {
  const q = String(query || '').trim();
  if (!q) return [];
  return (groups || []).filter(g => String(g.name || '').includes(q));
}

function pickRandomGroups(groups, n) {
  const list = (groups || []).slice();
  const limit = Math.min(typeof n === 'number' ? n : 4, list.length);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = list[i]; list[i] = list[j]; list[j] = t;
  }
  return list.slice(0, limit);
}

function ActAiGuide({ store, onClose, onPublish }) {
  const groups = store.groups || [];
  const [step, setStep] = React.useState(0); // 0..8
  const [msgs, setMsgs] = React.useState([{ role: 'ai', text: AI_GUIDE_Q.group }]);
  const [draft, setDraft] = React.useState(() => normalizeActForm({
    title: '', gid: groups[0] ? groups[0].id : 'g1', cat: groups[0] ? groups[0].cat : 'sport', type: 'once',
    dateValue: isoToday(), endDateValue: '', timeStart: '19:00', timeEnd: '21:00',
    loc: '', cap: 20, desc: '', cover: '',
    repeatMode: 'weekly', repeatWeekdays: [3], repeatMonthDays: [],
    sessions: [{ dateValue: isoToday(), endDateValue: '', timeStart: '19:00', timeEnd: '21:00' }],
    seriesSignupMode: 'independent', seriesCount: 3,
    deadlineMode: 'none', deadlineDate: '', deadlineTime: '18:00', deadlineHours: 2,
  }));
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [whenDate, setWhenDate] = React.useState('');
  const [whenStart, setWhenStart] = React.useState('');
  const [whenEnd, setWhenEnd] = React.useState('');
  const [seriesCount, setSeriesCount] = React.useState(3);
  const [seriesPhase, setSeriesPhase] = React.useState('count'); // count | session | signup（仅系列）
  const [seriesIdx, setSeriesIdx] = React.useState(0);
  const [seriesSessions, setSeriesSessions] = React.useState([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [groupPhase, setGroupPhase] = React.useState('pick'); // pick | confirm
  const [groupCandidates, setGroupCandidates] = React.useState(() => pickRandomGroups(groups, 4));
  const [pendingGroup, setPendingGroup] = React.useState(null);
  const [descPhase, setDescPhase] = React.useState('write'); // write | askImgs | upload
  const endRef = React.useRef(null);
  const coverRef = React.useRef(null);
  const descImgRef = React.useRef(null);
  const keys = ['group', 'type', 'title', 'when', 'loc', 'cap', 'desc', 'cover', 'confirm'];
  const key = keys[step];
  const g = groups.find(x => x.id === draft.gid);
  const signupModeLabel = (mode) => (mode === 'all' ? '整场报名' : '按场次报名');

  React.useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, busy, step, seriesPhase, seriesIdx, descPhase, draft.desc]);

  const push = (role, text) => setMsgs(m => [...m, { role, text }]);
  const whenQuestion = (d) => {
    if (d.type === 'series') return '系列一共几场？可点下方快捷项，或在输入框手输场数（2–20）。';
    if (d.type === 'recurring') return '每周几办？再选一下时间段。';
    return '哪一天办？请选日期和时间。';
  };
  const askNext = (nextStep, draftNext) => {
    setTimeout(() => {
      setBusy(false);
      setStep(nextStep);
      if (draftNext) setDraft(draftNext);
      const k = keys[nextStep];
      const d = draftNext || draft;
      if (k === 'when') {
        if (d.type === 'series') {
          setSeriesPhase('count');
          setSeriesIdx(0);
          setSeriesSessions([]);
        }
        push('ai', whenQuestion(d));
      } else {
        push('ai', AI_GUIDE_Q[k]);
      }
    }, 420);
  };

  const commit = (userText, patch, nextStep) => {
    push('user', userText);
    setBusy(true);
    setInput('');
    const next = normalizeActForm({ ...draft, ...patch });
    setDraft(next);
    askNext(nextStep, next);
  };

  const selectGroup = (gr) => {
    if (!gr || busy) return;
    setPendingGroup(null);
    setGroupPhase('pick');
    commit(gr.name, { gid: gr.id, cat: gr.cat || 'sport' }, 1);
  };

  const refreshGroupShortcuts = () => {
    setGroupPhase('pick');
    setPendingGroup(null);
    setGroupCandidates(pickRandomGroups(groups, 4));
  };

  const pickSeriesCount = (raw) => {
    const n = typeof raw === 'number' ? raw : parseInt(String(raw).replace(/[^\d]/g, ''), 10);
    if (!n || n < 2 || n > 20) {
      toast('请输入 2–20 之间的场数', { icon: 'alert' });
      return;
    }
    push('user', `${n} 场`);
    setBusy(true);
    setSeriesCount(n);
    setSeriesSessions([]);
    setSeriesIdx(0);
    setWhenDate('');
    setWhenStart('');
    setWhenEnd('');
    setTimeout(() => {
      setBusy(false);
      setSeriesPhase('session');
      push('ai', `好的，共 ${n} 场。请填写第 1 场的日期和时间。`);
    }, 420);
  };

  const pickSeriesSignupMode = (mode) => {
    const label = signupModeLabel(mode);
    push('user', label);
    setBusy(true);
    const next = normalizeActForm({ ...draft, seriesSignupMode: mode });
    setDraft(next);
    askNext(4, next);
  };

  const confirmSeriesSession = () => {
    if (!whenDate || !whenStart) { toast('请填写本场日期和时间', { icon: 'alert' }); return; }
    const sess = { dateValue: whenDate, endDateValue: '', timeStart: whenStart, timeEnd: whenEnd };
    const nextSessions = seriesSessions.concat([sess]);
    push('user', `第 ${seriesIdx + 1} 场：${formatDateCN(whenDate)} ${formatTimeRange(whenStart, whenEnd)}`);
    setBusy(true);
    if (nextSessions.length >= seriesCount) {
      const next = normalizeActForm({
        ...draft,
        type: 'series',
        sessions: nextSessions,
        dateValue: nextSessions[0].dateValue,
        timeStart: nextSessions[0].timeStart,
        timeEnd: nextSessions[0].timeEnd,
      });
      setDraft(next);
      setSeriesSessions(nextSessions);
      setTimeout(() => {
        setBusy(false);
        setSeriesPhase('signup');
        push('ai', '场次时间都齐了。报名方式选哪种？\n· 整场报名：一次报完所有场次，活动开始后中途不可报名\n· 按场次报名：可单独选择参加哪一场');
      }, 420);
      return;
    }
    setSeriesSessions(nextSessions);
    const nextIdx = seriesIdx + 1;
    setSeriesIdx(nextIdx);
    const d = new Date(whenDate + 'T12:00:00');
    d.setDate(d.getDate() + 7);
    setWhenDate(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
    setTimeout(() => {
      setBusy(false);
      push('ai', `已记下第 ${seriesIdx + 1} 场。请继续填写第 ${nextIdx + 1} 场的日期和时间。`);
    }, 420);
  };

  const confirmWhen = () => {
    if (draft.type === 'once') {
      if (!whenDate || !whenStart) { toast('请填写日期和时间', { icon: 'alert' }); return; }
      commit(`${formatDateCN(whenDate)} ${formatTimeRange(whenStart, whenEnd)}`, {
        dateValue: whenDate, endDateValue: '', timeStart: whenStart, timeEnd: whenEnd,
      }, 4);
      return;
    }
    if (draft.type === 'recurring') {
      if (!(draft.repeatWeekdays || []).length || !whenStart) { toast('请选择星期几和时间', { icon: 'alert' }); return; }
      commit(`每周${CN_WEEK[draft.repeatWeekdays[0]]} ${formatTimeRange(whenStart, whenEnd)}`, {
        timeStart: whenStart, timeEnd: whenEnd, repeatMode: 'weekly',
      }, 4);
      return;
    }
    // series 走独立流程
    if (seriesPhase === 'count') {
      toast('请选择或输入场数', { icon: 'alert' });
      return;
    }
    if (seriesPhase === 'signup') {
      toast('请选择报名方式', { icon: 'alert' });
      return;
    }
    confirmSeriesSession();
  };

  const sendText = () => {
    const t = input.trim();
    if (!t || busy) return;
    if (key === 'group') {
      if (!groups.length) {
        push('user', t);
        setInput('');
        push('ai', '暂无可用小组');
        return;
      }
      push('user', t);
      setBusy(true);
      setInput('');
      const hits = fuzzyMatchGroups(groups, t);
      setTimeout(() => {
        setBusy(false);
        if (hits.length === 0) {
          setGroupPhase('pick');
          setPendingGroup(null);
          setGroupCandidates(pickRandomGroups(groups, 4));
          push('ai', '没找到相关小组，换个名字试试～');
          return;
        }
        if (hits.length === 1) {
          setGroupPhase('confirm');
          setPendingGroup(hits[0]);
          setGroupCandidates([]);
          push('ai', `是「${hits[0].name}」吗？`);
          return;
        }
        setGroupPhase('pick');
        setPendingGroup(null);
        setGroupCandidates(hits);
        push('ai', '找到这几个，选一个吧～');
      }, 420);
      return;
    }
    if (key === 'when' && draft.type === 'series' && seriesPhase === 'count') {
      pickSeriesCount(t);
      setInput('');
      return;
    }
    if (key === 'title') {
      commit(t, { title: t }, 3);
      return;
    }
    if (key === 'loc') {
      commit(t, { loc: t }, 5);
      return;
    }
    if (key === 'cap') {
      const n = parseInt(t.replace(/[^\d]/g, ''), 10);
      if (!n || n < 2) { toast('请输入有效人数（至少 2）', { icon: 'alert' }); return; }
      commit(`${n} 人`, { cap: n }, 6);
      return;
    }
    if (key === 'desc') {
      if (descPhase !== 'write') return;
      push('user', t);
      setBusy(true);
      setInput('');
      const next = { ...draft, desc: `<p>${t.replace(/</g, '&lt;')}</p>` };
      setDraft(next);
      setTimeout(() => {
        setBusy(false);
        setDescPhase('askImgs');
        push('ai', '简介写好了～要不要在正文下方配几张图？可不传，最多 9 张。');
      }, 420);
      return;
    }
  };

  const askDescImgs = (nextDraft) => {
    setDescPhase('askImgs');
    push('ai', '简介写好了～要不要在正文下方配几张图？可不传，最多 9 张。');
    if (nextDraft) setDraft(nextDraft);
  };

  const skipDescImgs = () => {
    push('user', '不用了');
    setBusy(true);
    askNext(7, draft);
  };

  const startDescImgs = () => {
    push('user', '上传图片');
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDescPhase('upload');
      push('ai', `好的，选图片放到简介正文下方吧～最多 ${DESC_IMG_MAX} 张，可不传直接点完成。`);
      setTimeout(() => { if (descImgRef.current) descImgRef.current.click(); }, 80);
    }, 320);
  };

  const finishDescImgs = () => {
    const n = countDescImgs(draft.desc);
    push('user', n ? `配图完成（${n} 张）` : '完成（不配图）');
    setBusy(true);
    askNext(7, draft);
  };

  const pickDescImgs = (e) => {
    const files = Array.from((e.target.files || [])).filter(f => /^image\//.test(f.type));
    e.target.value = '';
    if (!files.length) { toast('请选择图片文件', { icon: 'alert' }); return; }
    const have = countDescImgs(draft.desc);
    const room = DESC_IMG_MAX - have;
    if (room <= 0) { toast(`最多 ${DESC_IMG_MAX} 张`, { icon: 'alert' }); return; }
    const take = files.slice(0, room);
    if (files.length > room) toast(`已达上限，本次只加入 ${room} 张`, { icon: 'alert' });
    Promise.all(take.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then(urls => {
      const next = { ...draft, desc: appendDescImgs(draft.desc, urls) };
      setDraft(next);
      const total = countDescImgs(next.desc);
      push('user', `已添加 ${urls.length} 张图`);
      push('ai', total >= DESC_IMG_MAX
        ? `已满 ${DESC_IMG_MAX} 张，点「完成」进入下一步～`
        : `已配 ${total}/${DESC_IMG_MAX} 张，可继续添加或点「完成」。`);
    }).catch(() => toast('图片读取失败', { icon: 'alert' }));
  };

  const genDesc = () => {
    if (descPhase !== 'write') return;
    push('user', '帮我写简介');
    setBusy(true);
    setTimeout(() => {
      const typeLab = { once: '单次', recurring: '周期性', series: '系列' }[draft.type] || draft.type;
      const when = draft.type === 'recurring'
        ? `每周${CN_WEEK[(draft.repeatWeekdays || [])[0] || 0]} ${formatTimeRange(draft.timeStart, draft.timeEnd)}`
        : draft.type === 'series'
          ? `共 ${(draft.sessions || []).length} 场 · 首场 ${formatDateCN((draft.sessions[0] || {}).dateValue || draft.dateValue)} ${formatTimeRange(draft.timeStart, draft.timeEnd)} · ${signupModeLabel(draft.seriesSignupMode)}`
          : `${formatDateCN(draft.dateValue)} ${formatTimeRange(draft.timeStart, draft.timeEnd)}`;
      const plain = aiGuideDescPlain({
        title: draft.title, loc: draft.loc, when, cap: draft.cap, cat: draft.cat, typeLabel: typeLab,
      });
      const html = aiGuidePlainToHtml(plain);
      const next = { ...draft, desc: html };
      setDraft(next);
      setBusy(false);
      push('ai', plain);
      setTimeout(() => askDescImgs(next), 360);
    }, 900);
  };

  const pickCover = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast('请上传图片文件', { icon: 'alert' }); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const cover = ev.target.result;
      push('user', '已上传封面');
      setBusy(true);
      const next = { ...draft, cover };
      setDraft(next);
      setTimeout(() => {
        setBusy(false);
        push('ai', '封面已收到，看起来不错～');
        askNext(8, next);
      }, 350);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const publish = () => {
    if (!draft.cover) { toast('请先上传封面图', { icon: 'alert' }); return; }
    const payload = actFormPayload({
      ...draft,
      cover: draft.cover,
      deadlineMode: 'none',
    });
    onPublish(payload);
    onClose();
  };

  const typeLabel = { once: '单次', recurring: '周期性', series: '系列' }[draft.type] || draft.type;
  const whenSummary = draft.type === 'recurring'
    ? `每周${CN_WEEK[(draft.repeatWeekdays || [])[0] || 0]} ${formatTimeRange(draft.timeStart, draft.timeEnd)}`
    : draft.type === 'series'
      ? `共 ${(draft.sessions || []).length} 场 · ${signupModeLabel(draft.seriesSignupMode)}\n${(draft.sessions || []).map((s, i) => `第 ${i + 1} 场 ${formatDateCN(s.dateValue)} ${formatTimeRange(s.timeStart, s.timeEnd)}`).join('\n')}`
      : `${formatDateCN(draft.dateValue)} ${formatTimeRange(draft.timeStart, draft.timeEnd)}`;

  const chip = (label, onClick, active) => (
    <button key={label} type="button" onClick={onClick} disabled={busy}
      style={{
        padding: '9px 14px', borderRadius: 99, border: 'none', cursor: busy ? 'default' : 'pointer',
        fontSize: 13, fontWeight: 700,
        background: active ? 'var(--brand-soft)' : 'var(--surface-2)',
        color: active ? 'var(--brand-600)' : 'var(--ink-2)',
      }}>{label}</button>
  );

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        background: 'var(--surface)', borderBottom: '1px solid var(--line)',
      }}>
        <button type="button" onClick={onClose} aria-label="退出"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
            border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-2)', padding: 0 }}>
          <Icon name="back" size={18} />
        </button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="spark" size={16} style={{ color: 'var(--ai)' }} />AI 创建
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>{Math.min(step + 1, AI_GUIDE_TOTAL)}/{AI_GUIDE_TOTAL}</span>
      </div>

      <div className="noscroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 10px' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10,
          }}>
            <div style={{
              maxWidth: '86%', padding: '10px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? 'var(--brand)' : 'var(--surface)',
              color: m.role === 'user' ? '#fff' : 'var(--ink)',
              fontSize: 14, fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              boxShadow: m.role === 'user' ? 'none' : 'var(--shadow-sm)',
            }}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
            <div style={{ padding: '10px 14px', borderRadius: 16, background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
              {typeof TypingDots === 'function' ? <TypingDots /> : '…'}
            </div>
          </div>
        )}

        {!busy && key === 'group' && groupPhase === 'pick' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {groupCandidates.map(gr => chip(gr.name, () => selectGroup(gr), draft.gid === gr.id))}
          </div>
        )}
        {!busy && key === 'group' && groupPhase === 'confirm' && pendingGroup && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {chip('是', () => selectGroup(pendingGroup), false)}
            {chip('否', () => {
              push('user', '否');
              setBusy(true);
              setTimeout(() => {
                setBusy(false);
                refreshGroupShortcuts();
                push('ai', '好的，再输入小组名称，或点下面快捷选～');
              }, 420);
            }, false)}
          </div>
        )}
        {!busy && key === 'type' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {[['once', '单次'], ['recurring', '周期性'], ['series', '系列']].map(([v, l]) =>
              chip(l, () => commit(l, { type: v }, 2), draft.type === v))}
          </div>
        )}
        {!busy && key === 'title' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {aiGuideTitleHints(g).map(h => chip(h, () => commit(h, { title: h }, 3)))}
          </div>
        )}
        {!busy && key === 'when' && draft.type === 'series' && seriesPhase === 'count' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {[2, 3, 4, 5].map(n => chip(`${n} 场`, () => pickSeriesCount(n), seriesCount === n))}
          </div>
        )}
        {!busy && key === 'when' && draft.type === 'series' && seriesPhase === 'session' && (
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 14, marginBottom: 8,
            boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>
              第 {seriesIdx + 1} / {seriesCount} 场
            </div>
            {seriesSessions.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {seriesSessions.map((s, i) => `✓ 第 ${i + 1} 场 ${formatDateCN(s.dateValue)} ${formatTimeRange(s.timeStart, s.timeEnd)}`).join('\n')}
              </div>
            )}
            <AppDateField value={whenDate} onChange={setWhenDate} />
            <AppTimeRangeField start={whenStart} end={whenEnd} onChange={(s, e) => { setWhenStart(s); setWhenEnd(e); }} />
            <Btn variant="primary" full onClick={confirmSeriesSession}>
              {seriesIdx + 1 >= seriesCount ? '完成本场' : `确认第 ${seriesIdx + 1} 场`}
            </Btn>
          </div>
        )}
        {!busy && key === 'when' && draft.type === 'series' && seriesPhase === 'signup' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {chip('整场报名', () => pickSeriesSignupMode('all'), draft.seriesSignupMode === 'all')}
            {chip('按场次报名', () => pickSeriesSignupMode('independent'), draft.seriesSignupMode === 'independent')}
          </div>
        )}
        {!busy && key === 'when' && draft.type !== 'series' && (
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 14, marginBottom: 8,
            boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {draft.type === 'recurring' && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 8 }}>每周几</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CN_WEEK.map((lab, i) => chip(lab, () => setDraft(s => ({ ...s, repeatWeekdays: [i] })),
                    (draft.repeatWeekdays || [])[0] === i))}
                </div>
              </div>
            )}
            {draft.type === 'once' && (
              <AppDateField value={whenDate} onChange={setWhenDate} />
            )}
            <AppTimeRangeField start={whenStart} end={whenEnd} onChange={(s, e) => { setWhenStart(s); setWhenEnd(e); }} />
            <Btn variant="primary" full onClick={confirmWhen}>下一步</Btn>
          </div>
        )}
        {!busy && key === 'cap' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {[10, 20, 30, 40].map(n => chip(`${n} 人`, () => commit(`${n} 人`, { cap: n }, 6)))}
          </div>
        )}
        {!busy && key === 'desc' && descPhase === 'write' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {chip('帮我写简介', genDesc)}
          </div>
        )}
        {!busy && key === 'desc' && descPhase === 'askImgs' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {chip('上传图片', startDescImgs)}
            {chip('不用了', skipDescImgs)}
          </div>
        )}
        {!busy && key === 'desc' && descPhase === 'upload' && (
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 14, marginBottom: 8,
            boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <input ref={descImgRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={pickDescImgs} />
            {extractDescImgSrcs(draft.desc).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {extractDescImgSrcs(draft.desc).map((src, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>
              已配 {countDescImgs(draft.desc)}/{DESC_IMG_MAX} 张 · 插在简介正文下方
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {countDescImgs(draft.desc) < DESC_IMG_MAX && chip(
                countDescImgs(draft.desc) === 0 ? '选择图片' : '继续添加',
                () => descImgRef.current && descImgRef.current.click()
              )}
              {chip('完成', finishDescImgs)}
            </div>
          </div>
        )}
        {!busy && key === 'cover' && (
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 14, marginBottom: 8,
            boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickCover} />
            <button type="button" onClick={() => coverRef.current && coverRef.current.click()}
              style={{
                width: '100%', minHeight: 140, borderRadius: 12, border: '2px dashed var(--line-2)',
                background: 'var(--bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--ink-3)',
              }}>
              <Icon name="image" size={28} stroke={1.6} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>点击上传封面</span>
              <span style={{ fontSize: 11.5, fontWeight: 600 }}>支持 JPG / PNG，建议 16:9</span>
            </button>
          </div>
        )}
        {!busy && key === 'confirm' && (
          <div style={{
            background: 'var(--surface)', borderRadius: 16, padding: 14, marginBottom: 8,
            boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {draft.cover ? (
              <div style={{ height: 120, borderRadius: 12, overflow: 'hidden' }}>
                <img src={draft.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: 'oklch(0.55 0.2 25)', fontWeight: 700 }}>尚未上传封面，请返回上一步上传</div>
            )}
            <div style={{ fontSize: 16, fontWeight: 800 }}>{draft.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              {`${g ? g.name : ''} · ${typeLabel}\n${whenSummary}\n${draft.loc || '地点待定'} · 上限 ${draft.cap} 人`}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Btn variant="ghost" full onClick={() => setPreviewOpen(true)}>查看</Btn>
              <Btn variant="ai" full icon="spark" disabled={!draft.cover} onClick={publish}
                style={!draft.cover ? { opacity: 0.5 } : undefined}>发布活动</Btn>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {(((key === 'group' && groups.length > 0)
        || ['title', 'loc', 'cap'].includes(key)
        || (key === 'desc' && descPhase === 'write'))
        || (key === 'when' && draft.type === 'series' && seriesPhase === 'count')) && !busy && (
        <div style={{
          flexShrink: 0, display: 'flex', gap: 8, padding: '10px 12px calc(10px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--surface)', borderTop: '1px solid var(--line)',
        }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendText(); }}
            inputMode={key === 'when' || key === 'cap' ? 'numeric' : undefined}
            placeholder={
              key === 'group' ? '输入小组名称'
                : key === 'when' ? '场数，例如 7'
                : key === 'cap' ? '例如 20'
                : key === 'desc' ? '自己写简介…'
                : '输入回复…'
            }
            style={{
              flex: 1, border: 'none', outline: 'none', padding: '11px 14px', borderRadius: 14,
              background: 'var(--bg)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
            }} />
          <Btn variant="primary" size="sm" disabled={!input.trim()} onClick={sendText}>发送</Btn>
        </div>
      )}

      <Sheet open={previewOpen} onClose={() => setPreviewOpen(false)} title="活动预览">
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {draft.cover && (
            <div style={{ height: 160, borderRadius: 14, overflow: 'hidden' }}>
              <img src={draft.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div style={{ fontSize: 18, fontWeight: 800 }}>{draft.title || '未命名活动'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <CatBadge cat={draft.cat} size="sm" />
            <TypeTag type={draft.type} />
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.6 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <Icon name="users" size={16} style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: 2 }} />
              <span>{g ? g.name : '未选小组'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <Icon name="calendar" size={16} style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: 2 }} />
              <span style={{ whiteSpace: 'pre-wrap' }}>{whenSummary}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <Icon name="pin" size={16} style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: 2 }} />
              <span>{draft.loc || '地点待定'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Icon name="ticket" size={16} style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: 2 }} />
              <span>上限 {draft.cap} 人</span>
            </div>
          </div>
          {draft.desc && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>活动简介</div>
              <div
                style={{
                  fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.55,
                  padding: 12, borderRadius: 12, background: 'var(--bg)', wordBreak: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: draft.desc }}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Btn variant="ghost" full onClick={() => setPreviewOpen(false)}>关闭</Btn>
            <Btn variant="ai" full icon="spark" disabled={!draft.cover} onClick={() => { setPreviewOpen(false); publish(); }}
              style={!draft.cover ? { opacity: 0.5 } : undefined}>发布活动</Btn>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function ActivitiesSection() {
  const { store, openActForm, setView, mobileAdmin } = useA();
  const [type, setType] = React.useState('all');
  const [actQ, setActQ] = React.useState('');
  const [groupQ, setGroupQ] = React.useState('');
  const [createSheet, setCreateSheet] = React.useState(false);
  const typeOpts = [{ value: 'all', label: '全部' }, { value: 'once', label: '单次', icon: 'calendar' }, { value: 'recurring', label: '周期性', icon: 'repeat' }, { value: 'series', label: '系列', icon: 'series' }];
  const byType = type === 'all' ? store.acts : store.acts.filter(a => a.type === type);
  const list = filterActsBySearch(byType, store.groups, actQ, groupQ);

  if (mobileAdmin) {
    const units = groupActs(list);
    const pickManual = () => { setCreateSheet(false); openActForm(null); };
    const pickAi = () => { setCreateSheet(false); useAOpen(); };
    return (
      <div style={{ flex: 1, overflow: 'hidden', background: 'var(--bg)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto' }} className="noscroll">
          <div style={{ padding: '12px 14px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 14,
                background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                <Icon name="search" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                <input value={actQ} onChange={e => setActQ(e.target.value)} placeholder="搜索活动名称"
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--ink)', minWidth: 0 }} />
                {actQ && (
                  <button type="button" onClick={() => setActQ('')} aria-label="清除搜索"
                    style={{ display: 'flex', color: 'var(--ink-3)', padding: 2, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Icon name="x" size={16} />
                  </button>
                )}
              </div>
              <Btn variant="primary" size="sm" icon="plus" onClick={() => setCreateSheet(true)} style={{ flexShrink: 0 }}>新建</Btn>
            </div>
            <Segmented value={type} onChange={setType} options={typeOpts} />
            {units.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
                {actQ.trim() || type !== 'all' ? '没有匹配的活动' : '暂无活动'}
              </div>
            ) : units.map(unit => {
              const a = detailAct(unit) || unit.act || (unit.eps && unit.eps[0]);
              if (!a) return null;
              let display = a;
              let seriesHint;
              const g = store.groups.find(x => x.id === a.gid || x.id === unit.gid);
              if (unit.kind === 'series') {
                const eps = unit.eps;
                const first = eps[0];
                const mode = first.seriesSignupMode || 'independent';
                const totalSigned = mode === 'all' ? (eps.find(e => e.status !== 'ended') || first).signed : eps.reduce((s, e) => s + e.signed, 0);
                const totalCap = mode === 'all' ? first.cap : eps.reduce((s, e) => s + e.cap, 0);
                const allEnded = eps.every(e => e.status === 'ended');
                display = {
                  ...first,
                  title: first.series || first.title,
                  series: first.series,
                  signed: totalSigned,
                  cap: totalCap,
                  status: allEnded ? 'ended' : first.status,
                };
                seriesHint = `${g ? g.name : ''} · 共 ${eps.length} 期`;
              }
              const openAid = a.id;
              return (
                <AdminMobileActCard key={unit.key} a={display} groupName={g ? g.name : ''} seriesHint={seriesHint}
                  onOpen={() => setView({ section: 'actDetail', aid: openAid, back: { section: 'activities' } })}
                  onEdit={() => openActForm(a.gid, a)} />
              );
            })}
          </div>
        </div>
        <Sheet open={createSheet} onClose={() => setCreateSheet(false)} title="新建活动">
          <div style={{ padding: '4px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" onClick={pickManual}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                padding: '14px 14px', borderRadius: 16, border: 'none', cursor: 'pointer',
                background: 'var(--bg)', boxShadow: 'inset 0 0 0 1px var(--line)',
              }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: 'var(--brand-soft)', color: 'var(--brand-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name="edit" size={20} stroke={2.2} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>手动创建</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, fontWeight: 600 }}>填写表单，发布活动</div>
              </div>
              <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />
            </button>
            <button type="button" onClick={pickAi}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                padding: '14px 14px', borderRadius: 16, border: 'none', cursor: 'pointer',
                background: 'var(--bg)', boxShadow: 'inset 0 0 0 1px var(--line)',
              }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: 'var(--ai-soft)', color: 'var(--ai)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon name="spark" size={20} stroke={2.2} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>AI 对话创建</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, fontWeight: 600 }}>一句话生成完整活动方案</div>
              </div>
              <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />
            </button>
            <Btn variant="ghost" full onClick={() => setCreateSheet(false)} style={{ marginTop: 4 }}>取消</Btn>
          </div>
        </Sheet>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title="活动管理" sub="支持单次、周期性、指定时间的系列活动"
        right={<><Btn variant="ai" icon="spark" onClick={useAOpen}>AI 策划</Btn><Btn variant="primary" icon="plus" onClick={() => openActForm(null)}>新建活动</Btn></>} />
      <div style={{ padding: 28 }}>
        <AdminListToolbar
          search={<AdminActSearchBars actQ={actQ} groupQ={groupQ} onActQ={setActQ} onGroupQ={setGroupQ} />}
          secondRow={<Segmented value={type} onChange={setType} options={typeOpts} />}
        />
        <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <ActTable acts={list} pagination={ADMIN_PAGE.std} onRow={(a) => setView({ section: 'actDetail', aid: a.id, back: { section: 'activities' } })} />
        </div>
      </div>
    </div>
  );
}

function GlobalSection({ section }) {
  const { store } = useA();
  const [actQ, setActQ] = React.useState('');
  const [groupQ, setGroupQ] = React.useState('');
  const titles = {
    signups: ['报名管理', '查看与审核所有活动的报名情况'],
    comments: ['评论&互动', '查看活动下的员工评论,可删除不当内容'],
    moments: ['精彩瞬间', '成员在活动后分享的高光时刻,自动同步至小组圈'],
  };
  const [t, sub] = titles[section];
  const baseActs = section === 'signups' ? store.acts.filter(a => a.status === 'upcoming') : store.acts;
  const acts = (section === 'signups' || section === 'comments')
    ? filterActsBySearch(baseActs, store.groups, actQ, groupQ) : baseActs;
  const moms = section === 'moments'
    ? filterMomentsBySearch(DB.moments, store.acts, store.groups, actQ, groupQ) : DB.moments;
  const showActSearch = section === 'signups' || section === 'comments' || section === 'moments';
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title={t} sub={sub} />
      <div style={{ padding: 28 }}>
        {showActSearch && (
          <AdminListToolbar search={<AdminActSearchBars actQ={actQ} groupQ={groupQ} onActQ={setActQ} onGroupQ={setGroupQ} />} />
        )}
        {section === 'signups' && <SignupsView acts={acts} />}
        {section === 'comments' && <CommentsView acts={acts} />}
        {section === 'moments' && <MomentsGrid moms={moms} paginate navBack={{ section: 'moments' }} />}
      </div>
    </div>
  );
}

// ---------- group form ----------
function GroupForm({ open, onClose, onSave, init, asPage }) {
  const blank = { name: '', cat: 'sport', lead: '陈航', join: 'free', area: '', tags: '', intro: '', cover: '' };
  const [f, setF] = React.useState(blank);
  const [genning, setGenning] = React.useState(false);
  const coverRef = React.useRef(null);
  const pickCover = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setF(s => ({ ...s, cover: ev.target.result }));
    reader.readAsDataURL(file);
  };
  React.useEffect(() => {
    if (asPage) {
      setGenning(false);
      setF(init ? { ...init, tags: (init.tags || []).join(' / ') } : blank);
      return;
    }
    if (open) setF(init ? { ...init, tags: (init.tags || []).join(' / ') } : blank);
  }, [asPage, open, init?.id]);
  const genIntro = () => {
    setGenning(true);
    setTimeout(() => { setGenning(false);
      const samples = { sport: '挥洒汗水,结识同好。我们提供专业指导与轻松氛围,无论你是健身老手还是零基础新人,都能在这里找到属于自己的节奏。',
        outdoor: '走出工位,拥抱自然。每月精选 2-3 条线路,从轻徒步到登顶看日出,领队持证、装备互助,带你安全地野一把。',
        reading: '一本书,一群人,慢慢读。我们不打卡、不焦虑,只在文字里相遇,在讨论中碰撞,给思想一个停靠的港湾。',
        music: '让耳朵去旅行。从拼票同行到内部开放麦,这里聚集了公司里所有热爱现场的灵魂。',
        game: '快乐第一,胜负其次。剧本杀、桌游、电竞开黑,午休和下班随时开局,菜也是一种风格。',
        photo: '用镜头记录光影与烟火。每月主题外拍,作品在小组圈互评,新手老炮都能找到灵感。',
        food: '工资的一半交给胃。每周锁定一家宝藏小馆,预算透明、认真打分,做公司里最懂吃的一群人。' };
      setF(s => ({ ...s, intro: samples[s.cat] })); }, 1200);
  };
  const ok = f.name.trim() && (init || f.cover);
  const doSave = () => { onSave({ ...f, tags: f.tags.split('/').map(s => s.trim()).filter(Boolean) }); if (!asPage) onClose(); };
  const formInner = (
      <>
        <Field label={init ? '封面图' : '封面图 *'} hint="必填 · 支持 JPG / PNG">
          <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickCover} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 120, height: 68, borderRadius: 9, overflow: 'hidden', background: 'var(--bg)', flexShrink: 0,
              border: f.cover ? 'none' : '2px dashed var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
              onClick={() => coverRef.current && coverRef.current.click()}>
              {f.cover
                ? <img src={f.cover} alt="封面" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: 'var(--ink-3)' }}>
                    <Icon name="image" size={24} stroke={1.6} />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>点击上传</span>
                  </div>}
              {f.cover && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.38)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                  <button type="button" onClick={e => { e.stopPropagation(); coverRef.current && coverRef.current.click(); }}
                    style={{ padding: '4px 9px', borderRadius: 7, background: 'rgba(255,255,255,0.9)', fontSize: 11.5, fontWeight: 700 }}>更换</button>
                  <button type="button" onClick={e => { e.stopPropagation(); setF(s => ({ ...s, cover: '' })); }}
                    style={{ padding: '4px 9px', borderRadius: 7, background: 'rgba(255,255,255,0.9)', fontSize: 11.5, fontWeight: 700, color: 'oklch(0.55 0.2 25)' }}>删除</button>
                </div>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>JPG / PNG，建议 16:9</span>
          </div>
        </Field>
        <Field label="小组名称"><TextInput value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="例如:城市夜跑团" /></Field>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}><Field label="分类">
            <select value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })} style={{ ...inputStyle }}>
              <option value="">未分类</option>{(typeof catsList === 'function' ? catsList() : Object.values(CATS)).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></Field></div>
          <div style={{ flex: 1 }}><Field label="组长">
            <EmployeeLeadSearch value={f.lead} onChange={lead => setF({ ...f, lead })} /></Field></div>
        </div>
        <Field label="小组简介">
          <div style={{ position: 'relative' }}>
            <TextArea value={genning ? '' : f.intro} onChange={e => setF({ ...f, intro: e.target.value })} placeholder="介绍一下你的小组…" />
            {genning && <div style={{ position: 'absolute', top: 12, left: 13 }}><TypingDots color="var(--ai)" /></div>}
            <button onClick={genIntro} style={{ position: 'absolute', bottom: 10, right: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 9, background: 'var(--ai-soft)', color: 'var(--ai)', fontSize: 12, fontWeight: 700 }}>
              <Sparkles size={14} color="var(--ai)" />AI 帮写</button>
          </div>
        </Field>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}><Field label="加入方式">
            <Segmented value={f.join} onChange={v => setF({ ...f, join: v })} options={[{ value: 'free', label: '自由加入' }, { value: 'approve', label: '审核加入' }]} style={{ width: '100%' }} /></Field></div>
          <div style={{ flex: 1 }}><Field label="活动区域"><TextInput value={f.area} onChange={e => setF({ ...f, area: e.target.value })} /></Field></div>
        </div>
        <Field label="标签" hint="用 / 分隔,例如:每周三场 / 零基础友好"><TextInput value={f.tags} onChange={e => setF({ ...f, tags: e.target.value })} /></Field>
        {!asPage && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>取消</Btn>
          <Btn variant="primary" icon="check" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }}
            onClick={doSave}>{init ? '保存修改' : '创建小组'}</Btn>
        </div>
        )}
      </>
  );
  if (asPage) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg)' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 10, flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
            <button type="button" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
              <Icon name="back" size={22} />
            </button>
            <div style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 800 }}>{init ? '编辑小组' : '新建兴趣小组'}</div>
            <Btn variant="primary" size="sm" icon="check" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={doSave}>保存</Btn>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 32px' }} className="noscroll">
          {formInner}
        </div>
      </div>
    );
  }
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={init ? '编辑小组' : '新建兴趣小组'} width={580}>
      <div style={{ padding: 24 }}>
        {formInner}
      </div>
    </Modal>
  );
}

// ---------- rich text editor (text + inline images) ----------
const RT_DEFAULT_COLOR = '#1F2329';
const RT_RECENT_KEY = 'ig:rt:recentColors';
const RT_PALETTE_MAIN = [
  '#FFFFFF', '#000000', '#E7E6E6', '#44546A', '#4472C4', '#00B0F0', '#00B050', '#FF0000', '#FFC000', '#7030A0',
  '#F2F2F2', '#7F7F7F', '#D0CECE', '#D6DCE4', '#8FAADC', '#9DC3E6', '#A9D18E', '#F4B083', '#FFD966', '#B4A7D6',
  '#D9D9D9', '#595959', '#AEAAAA', '#ADB9CA', '#5B9BD5', '#6BB8E1', '#70AD47', '#ED7D31', '#FFEB9C', '#8E7CC3',
  '#BFBFBF', '#3F3F3F', '#757070', '#8496B0', '#2E75B6', '#4BACC6', '#548235', '#C55A11', '#FFF2CC', '#7030A0',
  '#A6A6A6', '#262626', '#3A3838', '#333F4F', '#1F4E79', '#2F5597', '#385723', '#833C0C', '#FFE699', '#5B2C6F',
  '#808080', '#0D0D0D', '#161616', '#222A35', '#153D63', '#1E3A5F', '#254016', '#5C2E0A', '#DFC18A', '#3D1F49',
];
const RT_STANDARD = ['#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#7030A0', '#C00000', '#FF6600'];

function rtLoadRecent() {
  try { return JSON.parse(localStorage.getItem(RT_RECENT_KEY) || '[]').slice(0, 10); } catch (e) { return []; }
}
function rtSaveRecent(c) {
  const next = [c, ...rtLoadRecent().filter(x => x !== c)].slice(0, 10);
  try { localStorage.setItem(RT_RECENT_KEY, JSON.stringify(next)); } catch (e) {}
  return next;
}

function ColorSwatch({ color, onPick, size = 20 }) {
  const isWhite = color.toUpperCase() === '#FFFFFF';
  return (
    <button type="button" title={color} onMouseDown={e => e.preventDefault()} onClick={() => onPick(color)}
      style={{ width: size, height: size, borderRadius: 2, background: color, cursor: 'pointer', padding: 0, flexShrink: 0,
        border: isWhite ? '1px solid #E5E6EB' : '1px solid transparent' }} />
  );
}

function RichText({ value, onChange, placeholder }) {
  const ref = React.useRef(null);
  const imgRef = React.useRef(null);
  const moreColorRef = React.useRef(null);
  const colorPopRef = React.useRef(null);
  const [empty, setEmpty] = React.useState(true);
  const [fontColor, setFontColor] = React.useState(RT_DEFAULT_COLOR);
  const [colorOpen, setColorOpen] = React.useState(false);
  const [recentColors, setRecentColors] = React.useState(rtLoadRecent);
  const isBlank = () => !ref.current.textContent.trim() && !ref.current.querySelector('img');
  const sync = () => { const blank = isBlank(); setEmpty(blank); onChange(blank ? '' : ref.current.innerHTML); };
  React.useEffect(() => {
    if (ref.current) { ref.current.innerHTML = value || ''; setEmpty(isBlank()); }
  }, []);
  React.useEffect(() => {
    if (!colorOpen) return;
    const close = (e) => { if (colorPopRef.current && !colorPopRef.current.contains(e.target)) setColorOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [colorOpen]);
  const exec = (cmd, val) => { ref.current.focus(); document.execCommand(cmd, false, val == null ? null : val); sync(); };
  const applyColor = (c) => {
    setFontColor(c);
    setRecentColors(rtSaveRecent(c));
    exec('foreColor', c);
    setColorOpen(false);
  };
  const applyDefault = () => applyColor(RT_DEFAULT_COLOR);
  const pickImg = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      ref.current.focus();
      document.execCommand('insertHTML', false,
        `<img src="${ev.target.result}" style="max-width:100%;border-radius:8px;margin:8px 0;display:block" /><p><br/></p>`);
      sync();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const tbBtn = { minWidth: 30, height: 28, borderRadius: 7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 5, padding: '0 8px', color: 'var(--ink-2)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' };
  return (
    <div style={{ border: '1.5px solid var(--line-2)', borderRadius: 12, background: 'var(--surface)', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px', borderBottom: '1px solid var(--line)', background: 'var(--bg)',
        borderRadius: '12px 12px 0 0', position: 'relative', zIndex: 2 }}>
        <button type="button" title="加粗" onMouseDown={e => e.preventDefault()} onClick={() => exec('bold')} style={tbBtn}><span style={{ fontWeight: 800, fontSize: 14 }}>B</span></button>
        <div ref={colorPopRef} style={{ position: 'relative' }}>
          <button type="button" title="字体颜色" onMouseDown={e => e.preventDefault()}
            onClick={() => setColorOpen(o => !o)} style={{ ...tbBtn, flexDirection: 'column', gap: 1, padding: '2px 6px', minWidth: 32 }}>
            <span style={{ fontWeight: 800, fontSize: 14, lineHeight: 1, color: 'var(--ink)' }}>A</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{ width: 16, height: 3, borderRadius: 1, background: fontColor, border: fontColor.toUpperCase() === '#FFFFFF' ? '1px solid #E5E6EB' : 'none' }} />
              <Icon name="chevD" size={12} style={{ color: 'var(--ink-3)' }} />
            </span>
          </button>
          <input ref={moreColorRef} type="color" style={{ display: 'none' }} onChange={e => applyColor(e.target.value)} />
          {colorOpen && (
            <div onMouseDown={e => e.preventDefault()} style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, zIndex: 120, width: 248, padding: 12,
              background: 'var(--surface)', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.14)', border: '1px solid var(--line)',
            }}>
              <button type="button" onClick={applyDefault} style={{
                width: '100%', height: 32, marginBottom: 10, borderRadius: 6, border: '1px solid var(--line-2)',
                background: 'var(--bg)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer',
              }}>默认</button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 20px)', gap: 4, marginBottom: 12 }}>
                {RT_PALETTE_MAIN.map(c => <ColorSwatch key={c} color={c} onPick={applyColor} />)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>标准色</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 20px)', gap: 4, marginBottom: 12 }}>
                {RT_STANDARD.map(c => <ColorSwatch key={'s' + c} color={c} onPick={applyColor} />)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>最近使用</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 20px)', gap: 4, marginBottom: 10 }}>
                {Array.from({ length: 10 }, (_, i) => {
                  const c = recentColors[i];
                  return c ? <ColorSwatch key={'r' + c + i} color={c} onPick={applyColor} />
                    : <span key={'e' + i} style={{ width: 20, height: 20, borderRadius: 2, border: '1px solid #E5E6EB', background: '#FAFAFA' }} />;
                })}
              </div>
              <div style={{ height: 1, background: 'var(--line)', margin: '4px 0 8px' }} />
              <button type="button" onClick={() => moreColorRef.current && moreColorRef.current.click()} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', border: 'none',
                background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)', fontWeight: 600,
              }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }} />
                <span style={{ flex: 1, textAlign: 'left' }}>更多颜色</span>
                <Icon name="chevR" size={16} style={{ color: 'var(--ink-3)' }} />
              </button>
            </div>
          )}
        </div>
        <div style={{ width: 1, height: 16, background: 'var(--line)', margin: '0 2px' }} />
        <button type="button" title="无序列表" onMouseDown={e => e.preventDefault()} onClick={() => exec('insertUnorderedList')} style={tbBtn}><Icon name="list" size={16} /></button>
        <button type="button" title="有序列表" onMouseDown={e => e.preventDefault()} onClick={() => exec('insertOrderedList')} style={tbBtn}><Icon name="listOl" size={16} /></button>
        <div style={{ width: 1, height: 16, background: 'var(--line)', margin: '0 4px' }} />
        <button type="button" title="插入图片" onMouseDown={e => e.preventDefault()} onClick={() => imgRef.current && imgRef.current.click()} style={tbBtn}>
          <Icon name="image" size={16} /><span style={{ fontSize: 12.5, fontWeight: 700 }}>图片</span></button>
        <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickImg} />
      </div>
      <div style={{ position: 'relative', borderRadius: '0 0 12px 12px' }}>
        <div ref={ref} contentEditable suppressContentEditableWarning onInput={sync} className="richtext"
          style={{ minHeight: 140, padding: '11px 13px', fontSize: 14, lineHeight: 1.7, outline: 'none', color: 'var(--ink)',
            resize: 'vertical', overflow: 'auto', display: 'block', width: '100%', boxSizing: 'border-box' }} />
        {empty && <div style={{ position: 'absolute', top: 11, left: 13, fontSize: 14, color: 'var(--ink-3)', pointerEvents: 'none' }}>{placeholder}</div>}
      </div>
    </div>
  );
}


/** APP · 飞书式图文简介：点输入框全屏编辑，底栏插图 / 加粗 */
function MobileDescComposer({ value, onChange, placeholder = '活动安排、注意事项…', onAiWrite, aiBusy }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const imgRef = React.useRef(null);
  const [empty, setEmpty] = React.useState(true);
  const [draftHtml, setDraftHtml] = React.useState(value || '');

  const isBlankEl = (el) => !el || (!el.textContent.trim() && !el.querySelector('img'));
  const syncFromEl = () => {
    if (!ref.current) return;
    const blank = isBlankEl(ref.current);
    setEmpty(blank);
    setDraftHtml(blank ? '' : ref.current.innerHTML);
  };

  React.useEffect(() => {
    if (!open) return;
    setDraftHtml(value || '');
    requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.innerHTML = value || '';
      setEmpty(isBlankEl(ref.current));
      ref.current.focus();
      try {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {}
    });
  }, [open]);

  React.useEffect(() => {
    if (!open || !ref.current || aiBusy) return;
    // AI 帮写回填后刷新编辑区
    const cur = ref.current.innerHTML || '';
    if ((value || '') !== cur) {
      ref.current.innerHTML = value || '';
      setDraftHtml(value || '');
      setEmpty(isBlankEl(ref.current));
    }
  }, [value, aiBusy, open]);

  const closeSave = () => {
    if (ref.current) {
      const blank = isBlankEl(ref.current);
      const html = blank ? '' : ref.current.innerHTML;
      onChange(html);
      setDraftHtml(html);
    } else {
      onChange(draftHtml);
    }
    setOpen(false);
  };

  const exec = (cmd, val) => {
    if (!ref.current) return;
    ref.current.focus();
    document.execCommand(cmd, false, val == null ? null : val);
    syncFromEl();
  };

  const pickImg = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (!ref.current) return;
      ref.current.focus();
      document.execCommand('insertHTML', false,
        `<img src="${ev.target.result}" style="max-width:100%;border-radius:10px;margin:10px 0;display:block" /><p><br/></p>`);
      syncFromEl();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const plain = typeof htmlToPlainText === 'function' ? htmlToPlainText(value) : '';
  const imgCount = (String(value || '').match(/<img\b/gi) || []).length;
  const tbBtn = {
    width: 44, height: 40, borderRadius: 10, border: 'none', background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', cursor: 'pointer',
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{
        width: '100%', minHeight: 120, textAlign: 'left', padding: '12px 14px', borderRadius: 12,
        border: '1.5px solid var(--line-2)', background: 'var(--surface)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 8, boxSizing: 'border-box',
      }}>
        {plain || imgCount ? (
          <>
            {plain ? (
              <div className="clamp3" style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{plain}</div>
            ) : null}
            {imgCount > 0 && (
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="image" size={14} />已插入 {imgCount} 张图 · 点按继续编辑
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6 }}>{placeholder}</div>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 240, background: 'var(--surface)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
            borderBottom: '1px solid var(--line)', paddingTop: 'max(10px, env(safe-area-inset-top))',
          }}>
            <button type="button" onClick={closeSave} aria-label="完成"
              style={{ display: 'flex', width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
                border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink)' }}>
              <Icon name="back" size={22} />
            </button>
            <div style={{ flex: 1, fontSize: 16, fontWeight: 800 }}>活动介绍</div>
            <button type="button" onClick={closeSave}
              style={{ padding: '7px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                background: 'var(--brand)', color: '#fff', fontSize: 13, fontWeight: 700 }}>完成</button>
          </div>

          <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'auto' }} className="noscroll">
            <div ref={ref} contentEditable suppressContentEditableWarning
              onInput={syncFromEl}
              className="richtext"
              style={{
                minHeight: '100%', padding: '16px 16px 24px', fontSize: 16, lineHeight: 1.7,
                outline: 'none', color: 'var(--ink)', boxSizing: 'border-box',
              }} />
            {empty && (
              <div style={{ position: 'absolute', top: 16, left: 16, fontSize: 16, color: 'var(--ink-3)', pointerEvents: 'none' }}>
                {placeholder}
              </div>
            )}
            {aiBusy && (
              <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}><TypingDots color="var(--ai)" /></div>
            )}
          </div>

          <div style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px',
            borderTop: '1px solid var(--line)', background: 'var(--bg)',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          }}>
            <button type="button" title="插入图片" onMouseDown={e => e.preventDefault()}
              onClick={() => imgRef.current && imgRef.current.click()} style={tbBtn}>
              <Icon name="image" size={22} />
            </button>
            <button type="button" title="加粗" onMouseDown={e => e.preventDefault()}
              onClick={() => exec('bold')} style={{ ...tbBtn, fontWeight: 800, fontSize: 17 }}>B</button>
            <button type="button" title="无序列表" onMouseDown={e => e.preventDefault()}
              onClick={() => exec('insertUnorderedList')} style={tbBtn}>
              <Icon name="list" size={20} />
            </button>
            <div style={{ flex: 1 }} />
            {typeof onAiWrite === 'function' && (
              <button type="button" onClick={onAiWrite} disabled={aiBusy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 10,
                  border: 'none', background: 'var(--ai-soft)', color: 'var(--ai)', fontSize: 12.5, fontWeight: 700,
                  cursor: aiBusy ? 'wait' : 'pointer', opacity: aiBusy ? 0.7 : 1 }}>
                <Sparkles size={14} color="var(--ai)" />AI 帮写
              </button>
            )}
            <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickImg} />
          </div>
        </div>
      )}
    </>
  );
}

// ---------- activity form (manual) ----------
const WEEKDAYS = [
  { v: 1, label: '周一' }, { v: 2, label: '周二' }, { v: 3, label: '周三' }, { v: 4, label: '周四' },
  { v: 5, label: '周五' }, { v: 6, label: '周六' }, { v: 0, label: '周日' },
];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function formatRepeatDate(f) {
  if (f.repeatMode === 'monthly') {
    const days = (f.repeatMonthDays || []).slice().sort((a, b) => a - b);
    return days.length ? `每月 ${days.join('、')} 号` : '每月';
  }
  const wd = normalizeRepeatWeekdays(f.repeatWeekdays);
  const labels = WEEKDAYS.filter(w => wd.includes(w.v)).map(w => w.label);
  return labels.length ? `每${labels.join('、')}` : '每周';
}

const CN_WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
function pad2(n) { return String(n).padStart(2, '0'); }
function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function formatDateCN(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getMonth() + 1)}月${pad2(d.getDate())}日 ${CN_WEEK[d.getDay()]}`;
}
function formatTimeRange(start, end) {
  if (!start) return '';
  const e = end || start;
  return e !== start ? `${start} - ${e}` : start;
}
function weekOrd(v) { return v === 0 ? 7 : v; }
/** 周期重复规则：单选一个周 x（再点同一天可取消） */
function toggleRepeatWeekday(current, v) {
  const cur = current || [];
  return cur.length === 1 && cur[0] === v ? [] : [v];
}
function normalizeRepeatWeekdays(wd) {
  const s = (wd || []).slice().sort((a, b) => weekOrd(a) - weekOrd(b));
  return s.length ? [s[0]] : [];
}
/** 周期 · 重复规则：仅允许一个星期几；结束时间早于开始 → 次日结束 */
function recurringRepeatMeta(repeatWeekdays, timeStart, timeEnd) {
  const wd = normalizeRepeatWeekdays(repeatWeekdays);
  const overnight = !!(timeStart && timeEnd && timeEnd < timeStart);
  if (!wd.length) return { endDate: undefined, spanDays: overnight ? 1 : 0, repeatWeekdays: wd };
  if (!overnight) return { endDate: undefined, spanDays: 0, repeatWeekdays: wd };
  return { endDate: CN_WEEK[(wd[0] + 1) % 7], spanDays: 1, repeatWeekdays: wd };
}
function recurringRepeatHint(repeatWeekdays) {
  const wd = normalizeRepeatWeekdays(repeatWeekdays);
  if (!wd.length) return '请选择一个重复的星期几（仅可选一天）';
  return `每周${CN_WEEK[wd[0]]}重复`;
}
function parseDateCN(str) {
  const m = str && str.match(/(\d{1,2})月(\d{1,2})日/);
  if (!m) return '';
  return `${new Date().getFullYear()}-${pad2(+m[1])}-${pad2(+m[2])}`;
}
function parseTimeRange(str) {
  const parts = (str || '').split(/\s*-\s*/).map(s => s.trim()).filter(Boolean);
  return { start: parts[0] || '', end: parts[1] || parts[0] || '' };
}
/** APP 简介：富文本 → 纯文本（给输入框展示） */
function htmlToPlainText(html) {
  if (!html) return '';
  if (typeof document === 'undefined') {
    return String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h[1-6])>/gi, '\n').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim();
  }
  const d = document.createElement('div');
  d.innerHTML = String(html);
  d.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  d.querySelectorAll('p,div,li,h1,h2,h3,h4').forEach(el => { el.appendChild(document.createTextNode('\n')); });
  return (d.innerText || d.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}
/** APP 简介：纯文本 → 简单 HTML（兼容详情页渲染） */
function plainTextToDescHtml(text) {
  const t = String(text || '');
  if (!t.trim()) return '';
  return t.split(/\n/).map(line => {
    const esc = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<p>${esc || '<br/>'}</p>`;
  }).join('');
}

function normalizeActForm(raw) {
  const f = { ...raw };
  if (!f.dateValue && f.date) f.dateValue = parseDateCN(f.date);
  if (!f.endDateValue && f.endDate) f.endDateValue = parseDateCN(f.endDate);
  if (f.spanDays == null) f.spanDays = 0;
  if (!f.timeStart && f.time) { const t = parseTimeRange(f.time); f.timeStart = t.start; f.timeEnd = t.end; }
  if (f.sessions) {
    f.sessions = f.sessions.map(s => {
      const x = { ...s };
      if (!x.dateValue && x.date) x.dateValue = parseDateCN(x.date);
      if (!x.endDateValue && x.endDate) x.endDateValue = parseDateCN(x.endDate);
      if (!x.timeStart && x.time) { const t = parseTimeRange(x.time); x.timeStart = t.start; x.timeEnd = t.end; }
      return x;
    });
  }
  return f;
}
function actFormPayload(f) {
  const deadlineSummary = f.deadlineMode === 'fixed'
    ? (f.deadlineDate ? `${formatDateCN(f.deadlineDate)} ${f.deadlineTime || '18:00'}` : null)
    : f.deadlineMode === 'hours_before'
    ? `开始前 ${f.deadlineHours < 24 ? f.deadlineHours + ' 小时' : f.deadlineHours / 24 + ' 天'}`
    : null;
  // 单次/系列：结束日期晚于开始日期才算跨天
  const crossEnd = (dv, edv) => (edv && edv !== dv ? formatDateCN(edv) : undefined);
  const recMeta = f.type === 'recurring' && f.repeatMode !== 'monthly'
    ? recurringRepeatMeta(f.repeatWeekdays, f.timeStart, f.timeEnd) : { endDate: undefined, spanDays: 0, repeatWeekdays: f.repeatWeekdays };
  return {
    ...f,
    repeatWeekdays: f.type === 'recurring' && f.repeatMode !== 'monthly' ? recMeta.repeatWeekdays : f.repeatWeekdays,
    date: f.type === 'recurring' ? formatRepeatDate(f) : formatDateCN(f.dateValue),
    endDate: f.type === 'recurring' ? recMeta.endDate : crossEnd(f.dateValue, f.endDateValue),
    spanDays: f.type === 'recurring' ? recMeta.spanDays : undefined,
    time: formatTimeRange(f.timeStart, f.timeEnd),
    sessions: (f.sessions || []).map(s => ({
      ...s, date: formatDateCN(s.dateValue), endDate: crossEnd(s.dateValue, s.endDateValue), time: formatTimeRange(s.timeStart, s.timeEnd),
    })),
    signupDeadline: deadlineSummary,
    deadlineMode: f.deadlineMode,
    deadlineHours: f.deadlineMode === 'hours_before' ? f.deadlineHours : undefined,
  };
}

function DatePicker({ value, onChange, style, min }) {
  return (
    <input type="date" value={value || ''} min={min || undefined} onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, colorScheme: 'light', ...style }} />
  );
}

function TimePicker({ value, onChange, style }) {
  return (
    <input type="time" value={value || ''} onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, colorScheme: 'light', ...style }} />
  );
}

function TimeRangePicker({ start, end, onChange, style, overnightLabel = true }) {
  const overnight = overnightLabel && start && end && end < start;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="time" value={start || ''} onChange={e => onChange(e.target.value, end)}
          style={{ ...inputStyle, flex: 1, colorScheme: 'light' }} />
        <span style={{ fontSize: 13, color: 'var(--ink-3)', flexShrink: 0 }}>至</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <input type="time" value={end || ''} onChange={e => onChange(start, e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: 0, colorScheme: 'light' }} />
          {overnight && (
            <span style={{
              flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--brand)',
              padding: '4px 8px', borderRadius: 8, background: 'var(--brand-tint)', whiteSpace: 'nowrap',
            }}>次日 {end}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** App 滚轮列：中间高亮，scroll-snap */
const APP_WHEEL_ITEM_H = 40;
function AppWheelColumn({ options, value, onChange }) {
  const ref = React.useRef(null);
  const syncing = React.useRef(false);
  const timer = React.useRef(null);
  const scrollToValue = (v) => {
    if (!ref.current) return;
    const i = Math.max(0, options.findIndex(o => o.value === v));
    syncing.current = true;
    ref.current.scrollTop = i * APP_WHEEL_ITEM_H;
    requestAnimationFrame(() => { syncing.current = false; });
  };
  React.useLayoutEffect(() => { scrollToValue(value); }, [value, options]);
  const commitNearest = () => {
    if (!ref.current || !options.length) return;
    const i = Math.max(0, Math.min(options.length - 1, Math.round(ref.current.scrollTop / APP_WHEEL_ITEM_H)));
    const next = options[i].value;
    ref.current.scrollTop = i * APP_WHEEL_ITEM_H;
    if (next !== value) onChange(next);
  };
  const onScroll = () => {
    if (syncing.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(commitNearest, 80);
  };
  return (
    <div style={{ position: 'relative', flex: 1, height: APP_WHEEL_ITEM_H * 5, minWidth: 0 }}>
      <div aria-hidden style={{
        pointerEvents: 'none', position: 'absolute', left: 6, right: 6, top: APP_WHEEL_ITEM_H * 2,
        height: APP_WHEEL_ITEM_H, borderRadius: 10, background: 'var(--brand-soft)', zIndex: 1,
      }} />
      <div ref={ref} onScroll={onScroll} className="noscroll" style={{
        height: APP_WHEEL_ITEM_H * 5, overflowY: 'auto', scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch', position: 'relative', zIndex: 2,
      }}>
        <div style={{ height: APP_WHEEL_ITEM_H * 2 }} />
        {options.map(o => (
          <div key={String(o.value)} onClick={() => onChange(o.value)} style={{
            height: APP_WHEEL_ITEM_H, scrollSnapAlign: 'center', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 17, fontWeight: o.value === value ? 800 : 600,
            color: o.value === value ? 'var(--ink)' : 'var(--ink-3)', cursor: 'pointer',
          }}>{o.label}</div>
        ))}
        <div style={{ height: APP_WHEEL_ITEM_H * 2 }} />
      </div>
    </div>
  );
}

function AppPickerSheet({ open, title, onCancel, onConfirm, children }) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{
      position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(30,18,12,0.42)',
      backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-end', animation: 'fadeIn .2s',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: 'var(--surface)', borderRadius: '22px 22px 0 0',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.18)', animation: 'slideUp .32s cubic-bezier(.2,.85,.25,1)',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 8px', borderBottom: '1px solid var(--line)',
        }}>
          <button type="button" onClick={onCancel} style={{
            border: 'none', background: 'transparent', color: 'var(--ink-3)', fontSize: 15, fontWeight: 700, cursor: 'pointer', padding: '4px 2px',
          }}>取消</button>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
          <button type="button" onClick={onConfirm} style={{
            border: 'none', background: 'transparent', color: 'var(--brand)', fontSize: 15, fontWeight: 800, cursor: 'pointer', padding: '4px 2px',
          }}>确定</button>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: '8px 10px 4px', position: 'relative' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}
function parseIsoParts(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}
function snapMinute(m) {
  const n = Math.round((Number(m) || 0) / 5) * 5;
  return n >= 60 ? 55 : n;
}
function parseHm(hm) {
  if (!hm || !/^\d{1,2}:\d{2}$/.test(hm)) return null;
  const [h, m] = hm.split(':').map(Number);
  return { h, m: snapMinute(m) };
}

function AppDateField({ value, onChange, label = '日期', placeholder = '请选择日期' }) {
  const [open, setOpen] = React.useState(false);
  const today = new Date();
  const seed = parseIsoParts(value) || { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };
  const [y, setY] = React.useState(seed.y);
  const [m, setM] = React.useState(seed.m);
  const [d, setD] = React.useState(seed.d);
  React.useEffect(() => {
    if (!open) return;
    const s = parseIsoParts(value) || { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };
    setY(s.y); setM(s.m); setD(s.d);
  }, [open, value]);
  const maxD = daysInMonth(y, m);
  React.useEffect(() => { if (d > maxD) setD(maxD); }, [y, m, maxD, d]);
  const years = React.useMemo(() => {
    const cy = today.getFullYear();
    return Array.from({ length: 6 }, (_, i) => ({ value: cy + i, label: `${cy + i}年` }));
  }, []);
  const months = React.useMemo(() => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` })), []);
  const days = React.useMemo(() => Array.from({ length: maxD }, (_, i) => ({ value: i + 1, label: `${i + 1}日` })), [maxD]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
        padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--line-2)',
        background: 'var(--bg)', cursor: 'pointer',
      }}>
        <Icon name="calendar" size={18} style={{ color: 'var(--ink-3)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: value ? 'var(--ink)' : 'var(--ink-3)' }}>
            {value ? formatDateCN(value) : placeholder}
          </div>
        </div>
        <Icon name="chevR" size={16} style={{ color: 'var(--ink-3)' }} />
      </button>
      <AppPickerSheet open={open} title="选择日期" onCancel={() => setOpen(false)} onConfirm={() => {
        const dd = Math.min(d, daysInMonth(y, m));
        onChange(`${y}-${pad2(m)}-${pad2(dd)}`);
        setOpen(false);
      }}>
        <AppWheelColumn options={years} value={y} onChange={setY} />
        <AppWheelColumn options={months} value={m} onChange={setM} />
        <AppWheelColumn options={days} value={Math.min(d, maxD)} onChange={setD} />
      </AppPickerSheet>
    </>
  );
}

function AppTimeRangeField({ start, end, onChange, label = '时间', placeholder = '请选择时间' }) {
  const [open, setOpen] = React.useState(false);
  const seedS = parseHm(start) || { h: 19, m: 0 };
  const seedE = parseHm(end) || { h: 21, m: 0 };
  const [sh, setSh] = React.useState(seedS.h);
  const [sm, setSm] = React.useState(seedS.m);
  const [eh, setEh] = React.useState(seedE.h);
  const [em, setEm] = React.useState(seedE.m);
  React.useEffect(() => {
    if (!open) return;
    const s = parseHm(start) || { h: 19, m: 0 };
    const e = parseHm(end) || { h: 21, m: 0 };
    setSh(s.h); setSm(s.m); setEh(e.h); setEm(e.m);
  }, [open, start, end]);
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => ({ value: i, label: pad2(i) })), []);
  const mins = React.useMemo(() => Array.from({ length: 12 }, (_, i) => ({ value: i * 5, label: pad2(i * 5) })), []);
  const overnight = !!(start && end && end < start);
  const display = start
    ? (end && end !== start ? `${start} – ${end}${overnight ? '（次日）' : ''}` : start)
    : placeholder;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
        padding: '12px 14px', borderRadius: 14, border: '1.5px solid var(--line-2)',
        background: 'var(--bg)', cursor: 'pointer',
      }}>
        <Icon name="clock" size={18} style={{ color: 'var(--ink-3)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: start ? 'var(--ink)' : 'var(--ink-3)' }}>{display}</div>
        </div>
        <Icon name="chevR" size={16} style={{ color: 'var(--ink-3)' }} />
      </button>
      <AppPickerSheet open={open} title="选择时间" onCancel={() => setOpen(false)} onConfirm={() => {
        onChange(`${pad2(sh)}:${pad2(sm)}`, `${pad2(eh)}:${pad2(em)}`);
        setOpen(false);
      }}>
        <AppWheelColumn options={hours} value={sh} onChange={setSh} />
        <AppWheelColumn options={mins} value={sm} onChange={setSm} />
        <div style={{ width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--ink-3)' }}>至</div>
        <AppWheelColumn options={hours} value={eh} onChange={setEh} />
        <AppWheelColumn options={mins} value={em} onChange={setEm} />
      </AppPickerSheet>
    </>
  );
}

function actFormReady(f, editing) {
  if (editing) {
    if (!f.title.trim()) return false;
    if (!f.timeStart) return false;
    return f.type === 'recurring' ? true : !!f.dateValue;
  }
  if (!f.title.trim() || !f.cover) return false;
  if (f.type === 'once') return !!(f.dateValue && f.timeStart && !(f.endDateValue && f.endDateValue < f.dateValue));
  if (f.type === 'recurring') {
    if (!f.timeStart) return false;
    if (f.repeatMode === 'monthly') return (f.repeatMonthDays || []).length > 0;
    return (f.repeatWeekdays || []).length === 1;
  }
  if (f.type === 'series') {
    return (f.sessions || []).length > 0 && f.sessions.every(s => s.dateValue && s.timeStart && !(s.endDateValue && s.endDateValue < s.dateValue));
  }
  return true;
}

function ActForm({ open, onClose, onSave, store, gidInit, initAct, asPage }) {
  const { mobileAdmin } = useA();
  const editing = !!initAct;
  if (!asPage && (!open || !editing)) return null;
  const blank = normalizeActForm({
    title: '', gid: gidInit || 'g1', cat: 'sport', type: 'once',
    dateValue: isoToday(), endDateValue: '', spanDays: 0, timeStart: '19:00', timeEnd: '21:00',
    loc: '', cap: 20, desc: '', cover: '',
    repeatMode: 'weekly', repeatWeekdays: [], repeatMonthDays: [],
    sessions: [{ dateValue: '2026-06-15', endDateValue: '', timeStart: '04:30', timeEnd: '14:00' }],
    seriesSignupMode: 'independent',
    deadlineMode: 'none', deadlineDate: '', deadlineTime: '18:00', deadlineHours: 2,
  });
  const [f, setF] = React.useState(blank);
  const [editorKey, setEditorKey] = React.useState(0);
  const [descGenning, setDescGenning] = React.useState(false);
  const coverRef = React.useRef(null);
  const applyForm = (next) => { setF(normalizeActForm(next)); setEditorKey(k => k + 1); };
  const genActDesc = () => {
    setDescGenning(true);
    setTimeout(() => {
      setDescGenning(false);
      const title = f.title.trim() || '本次活动';
      const when = f.dateValue && f.timeStart
        ? `定于 ${formatDateCN(f.dateValue)} ${formatTimeRange(f.timeStart, f.timeEnd)}。`
        : f.timeStart ? `时间 ${formatTimeRange(f.timeStart, f.timeEnd)}。` : '';
      const loc = f.loc.trim() || '详见群内通知';
      const samples = {
        sport: `<p>欢迎参加 <b>${title}</b>!${when}</p><ul><li>集合地点:${loc}</li><li>请穿运动服与防滑鞋,建议自带水壶</li><li>热身约 10 分钟,零基础有领队陪同</li></ul>`,
        outdoor: `<p><b>${title}</b> 等你来野!${when}</p><ul><li>集合:${loc}</li><li>请穿徒步鞋,自备防晒与少量路餐</li><li>领队持证,全程有收尾与保险说明</li></ul>`,
        reading: `<p>本期 <b>${title}</b>${when ? ' ' + when : ''}</p><ul><li>地点:${loc}</li><li>请提前阅读指定章节,现场轮流分享</li><li>轻松讨论,不打卡、不焦虑</li></ul>`,
        music: `<p><b>${title}</b> — 一起把耳朵交给现场!${when}</p><ul><li>集合:${loc}</li><li>可拼车同行,费用 AA</li><li>结束后可在群内约饭复盘</li></ul>`,
        game: `<p><b>${title}</b> 开局啦!${when}</p><ul><li>地点:${loc}</li><li>新手有教学,40 分钟左右一局</li><li>快乐第一,胜负随缘</li></ul>`,
        photo: `<p><b>${title}</b> 外拍招募!${when}</p><ul><li>集合:${loc}</li><li>建议携带相机或手机满电,可互勉构图</li><li>作品欢迎发小组圈</li></ul>`,
        food: `<p><b>${title}</b> 开吃!${when}</p><ul><li>集合:${loc}</li><li>人均预算群内公示,口味偏辣请自备解辣</li><li>吃完记得在小组圈晒图打分</li></ul>`,
      };
      setF(s => ({ ...s, desc: samples[s.cat] || samples.sport }));
      setEditorKey(k => k + 1);
    }, 1200);
  };
  const pickCover = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setF(s => ({ ...s, cover: ev.target.result }));
    reader.readAsDataURL(file);
  };
  React.useEffect(() => {
    if (asPage) {
      setDescGenning(false);
      if (initAct) applyForm({ ...blank, ...initAct });
      else applyForm({ ...blank, gid: gidInit || 'g1' });
      return;
    }
    if (!open) return;
    setDescGenning(false);
    applyForm({ ...blank, ...initAct });
  }, [asPage, open, gidInit, initAct?.id]);
  const formInner = (
    <>
        {!editing && !asPage && (
          <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--ai-soft)', marginBottom: 10, alignItems: 'center' }}>
            <Sparkles size={18} color="var(--ai)" />
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-2)' }}>不想手动填？试试用一句话让 AI 生成完整方案</span>
            <Btn variant="ai" size="sm" icon="spark" onClick={() => { onClose(); useAOpen(); }}>AI 策划</Btn>
          </div>
        )}

        <Field label={editing ? '封面图' : '封面图 *'} hint={editing ? undefined : '必填 · 支持 JPG / PNG'}>
          <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickCover} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 120, height: 68, borderRadius: 9, overflow: 'hidden', background: 'var(--bg)', flexShrink: 0,
              border: f.cover ? 'none' : '2px dashed var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
              onClick={() => coverRef.current && coverRef.current.click()}>
              {f.cover
                ? <img src={f.cover} alt="封面" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: 'var(--ink-3)' }}>
                    <Icon name="image" size={24} stroke={1.6} />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>点击上传</span>
                  </div>}
              {f.cover && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.38)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                  <button type="button" onClick={e => { e.stopPropagation(); coverRef.current && coverRef.current.click(); }}
                    style={{ padding: '4px 9px', borderRadius: 7, background: 'rgba(255,255,255,0.9)', fontSize: 11.5, fontWeight: 700 }}>更换</button>
                  <button type="button" onClick={e => { e.stopPropagation(); setF(s => ({ ...s, cover: '' })); }}
                    style={{ padding: '4px 9px', borderRadius: 7, background: 'rgba(255,255,255,0.9)', fontSize: 11.5, fontWeight: 700, color: 'oklch(0.55 0.2 25)' }}>删除</button>
                </div>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>JPG / PNG，建议 16:9</span>
          </div>
        </Field>
        <Field label="活动标题">
          <TextInput value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="例如:滨江 8K 夜跑" />
        </Field>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Field label="所属小组">
              <select value={f.gid} onChange={e => { const ng = store.groups.find(x => x.id === e.target.value); setF({ ...f, gid: e.target.value, cat: ng ? ng.cat : f.cat }); }} style={inputStyle}>
                {store.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="分类">
              <select value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })} style={inputStyle}>
                <option value="">未分类</option>{(typeof catsList === 'function' ? catsList() : Object.values(CATS)).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {editing ? (
          <>
            <Field label="活动类型">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TypeTag type={f.type} /><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>活动类型创建后不可更改</span></div>
            </Field>
            {f.type === 'recurring' ? (
              <>
                <Field label="重复规则"><div style={{ ...inputStyle, background: 'var(--bg)', color: 'var(--ink-2)' }}>{initAct.date}{initAct.endDate ? ` → ${initAct.endDate}` : ''}{initAct.spanDays > 1 ? ` · 跨 ${initAct.spanDays} 天` : ''}</div></Field>
                <Field label="时间" hint={f.timeStart && f.timeEnd && f.timeEnd < f.timeStart ? `结束已过 0 点，视为次日 ${f.timeEnd}` : '结束时间早于开始时间时，视为次日该时刻结束'}>
                  <TimeRangePicker start={f.timeStart} end={f.timeEnd} onChange={(a, b) => setF({ ...f, timeStart: a, timeEnd: b })} />
                </Field>
              </>
            ) : (
              <>
                <Field label="开始">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <DatePicker value={f.dateValue} onChange={v => setF(s => ({ ...s, dateValue: v, endDateValue: s.endDateValue && s.endDateValue < v ? v : s.endDateValue }))} style={{ flex: 1, minWidth: 0 }} />
                    <TimePicker value={f.timeStart} onChange={v => setF({ ...f, timeStart: v })} style={{ width: 128, flexShrink: 0 }} />
                  </div>
                </Field>
                <Field label="结束" hint={f.endDateValue && f.endDateValue !== f.dateValue ? '跨天活动' : '默认与开始同一天'}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <DatePicker value={f.endDateValue || f.dateValue} min={f.dateValue} onChange={v => setF({ ...f, endDateValue: v })} style={{ flex: 1, minWidth: 0 }} />
                    <TimePicker value={f.timeEnd} onChange={v => setF({ ...f, timeEnd: v })} style={{ width: 128, flexShrink: 0 }} />
                  </div>
                </Field>
              </>
            )}
          </>
        ) : (
          <>
            <Field label="活动类型">
              <Segmented value={f.type} onChange={v => setF(s => ({
                ...s, type: v,
                ...(v === 'recurring' ? { repeatMode: 'weekly', repeatWeekdays: [], repeatMonthDays: [] } : null),
              }))} style={{ width: '100%' }}
                options={[{ value: 'once', label: '单次', icon: 'calendar' }, { value: 'recurring', label: '周期性', icon: 'repeat' }, { value: 'series', label: '系列', icon: 'series' }]} />
            </Field>
            {f.type === 'once' && (
              <>
                <Field label="开始">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <DatePicker value={f.dateValue} onChange={v => setF(s => ({ ...s, dateValue: v, endDateValue: s.endDateValue && s.endDateValue < v ? v : s.endDateValue }))} style={{ flex: 1, minWidth: 0 }} />
                    <TimePicker value={f.timeStart} onChange={v => setF({ ...f, timeStart: v })} style={{ width: 128, flexShrink: 0 }} />
                  </div>
                </Field>
                <Field label="结束" hint={f.endDateValue && f.endDateValue !== f.dateValue ? '跨天活动' : '默认与开始同一天'}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <DatePicker value={f.endDateValue || f.dateValue} min={f.dateValue} onChange={v => setF({ ...f, endDateValue: v })} style={{ flex: 1, minWidth: 0 }} />
                    <TimePicker value={f.timeEnd} onChange={v => setF({ ...f, timeEnd: v })} style={{ width: 128, flexShrink: 0 }} />
                  </div>
                </Field>
              </>
            )}
            {f.type === 'recurring' && (
              <>
                <Field label="重复规则" hint={recurringRepeatHint(f.repeatWeekdays)}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {WEEKDAYS.map(d => {
                      const on = (f.repeatWeekdays || []).includes(d.v);
                      return (
                        <button key={d.v} type="button" onClick={() => setF(s => ({
                          ...s, repeatMode: 'weekly', repeatWeekdays: toggleRepeatWeekday(s.repeatWeekdays, d.v),
                        }))} style={{ minWidth: 44, height: 34, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          background: on ? 'var(--brand-tint)' : 'var(--bg)', color: on ? 'var(--brand-600)' : 'var(--ink-2)',
                          border: on ? '1.5px solid var(--brand)' : '1.5px solid var(--line-2)' }}>{d.label}</button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="时间" hint={f.timeStart && f.timeEnd && f.timeEnd < f.timeStart ? `结束已过 0 点，视为次日 ${f.timeEnd}` : '结束时间早于开始时间时，视为次日该时刻结束'}>
                  <TimeRangePicker start={f.timeStart} end={f.timeEnd} onChange={(a, b) => setF({ ...f, timeStart: a, timeEnd: b })} />
                </Field>
              </>
            )}
            {f.type === 'series' && (
              <>
                <Field label="报名方式">
                  <Segmented value={f.seriesSignupMode || 'independent'} onChange={v => setF({ ...f, seriesSignupMode: v })}
                    options={[{ value: 'independent', label: '按场次报名', desc: '用户可独立选择参加每一场' }, { value: 'all', label: '整场报名', desc: '报名截止后不可中途加入' }]} />
                </Field>
                <Field label="场次安排" hint="每期可单独设置起止日期与时间，结束日期晚于开始即为跨天">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(f.sessions || []).map((s, i) => {
                      const cross = s.endDateValue && s.endDateValue !== s.dateValue;
                      return (
                      <div key={i} style={{ border: '1.5px solid var(--line-2)', borderRadius: 11, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ width: 22, fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', flexShrink: 0 }}>开始</span>
                          <DatePicker value={s.dateValue} onChange={v => setF(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, dateValue: v, endDateValue: x.endDateValue && x.endDateValue < v ? v : x.endDateValue } : x) }))} style={{ flex: 1, minWidth: 0 }} />
                          <TimePicker value={s.timeStart} onChange={v => setF(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, timeStart: v } : x) }))} style={{ width: 128, flexShrink: 0 }} />
                          {(f.sessions || []).length > 1 && (
                            <button type="button" onClick={() => setF(st => ({ ...st, sessions: st.sessions.filter((_, j) => j !== i) }))}
                              style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(0.55 0.2 25)', flexShrink: 0, marginLeft: 'auto' }}>
                              <Icon name="trash" size={16} /></button>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 30 }}>
                          <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', flexShrink: 0 }}>结束</span>
                          <DatePicker value={s.endDateValue || s.dateValue} min={s.dateValue} onChange={v => setF(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, endDateValue: v } : x) }))} style={{ flex: 1, minWidth: 0 }} />
                          <TimePicker value={s.timeEnd} onChange={v => setF(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, timeEnd: v } : x) }))} style={{ width: 128, flexShrink: 0 }} />
                          {cross && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', flexShrink: 0 }}>跨天</span>}
                        </div>
                      </div>
                      );
                    })}
                    <Btn variant="ghost" size="sm" icon="plus" type="button" onClick={() => setF(st => ({
                      ...st, sessions: [...(st.sessions || []), { dateValue: isoToday(), endDateValue: '', timeStart: '19:00', timeEnd: '21:00' }],
                    }))}>添加场次</Btn>
                  </div>
                </Field>
              </>
            )}
          </>
        )}

        <Field label="报名截止" hint={f.deadlineMode === 'fixed' ? '到达指定时间后不可报名' : f.deadlineMode === 'hours_before' ? '距活动开始不足 N 小时后不可报名' : '不设截止，活动开始前均可报名'}>
          <DeadlinePicker mode={f.deadlineMode || 'none'} date={f.deadlineDate || ''} time={f.deadlineTime || '18:00'} hours={f.deadlineHours || 2}
            onChange={({ mode, date, time, hours }) => setF(s => ({ ...s, deadlineMode: mode, deadlineDate: date, deadlineTime: time, deadlineHours: hours }))} />
        </Field>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}><Field label="地点"><TextInput value={f.loc} onChange={e => setF({ ...f, loc: e.target.value })} placeholder="集合地点" /></Field></div>
          <div style={{ flex: 1 }}><Field label="人数上限"><TextInput type="number" value={f.cap} onChange={e => setF({ ...f, cap: +e.target.value })} /></Field></div>
        </div>

        <Field label="活动介绍">
          {mobileAdmin ? (
            <MobileDescComposer
              value={f.desc}
              onChange={html => setF(s => ({ ...s, desc: html }))}
              placeholder="活动安排、注意事项…"
              onAiWrite={genActDesc}
              aiBusy={descGenning}
            />
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ opacity: descGenning ? 0.45 : 1, pointerEvents: descGenning ? 'none' : 'auto' }}>
                <RichText key={editorKey} value={f.desc} onChange={html => setF(s => ({ ...s, desc: html }))} placeholder="活动安排、注意事项…" />
              </div>
              {descGenning && <div style={{ position: 'absolute', top: 52, left: 13, zIndex: 3 }}><TypingDots color="var(--ai)" /></div>}
              <button type="button" onClick={genActDesc} disabled={descGenning}
                style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 4, display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 11px', borderRadius: 9, background: 'var(--ai-soft)', color: 'var(--ai)', fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: descGenning ? 'wait' : 'pointer', opacity: descGenning ? 0.7 : 1 }}>
                <Sparkles size={14} color="var(--ai)" />AI 帮写</button>
            </div>
          )}
        </Field>

        {/* footer */}
        {!(asPage && mobileAdmin) && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center', marginTop: asPage ? 24 : 8,
          paddingTop: asPage ? 20 : 0, borderTop: asPage ? '1px solid var(--line)' : 'none' }}>
          <Btn variant="ghost" onClick={onClose}>取消</Btn>
          {(() => { const ok = actFormReady(f, editing); return (
          <Btn variant="primary" icon="check" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={() => { onSave({ ...actFormPayload(f), id: editing ? initAct.id : undefined }); onClose(); }}>{editing ? '保存修改' : '发布活动'}</Btn>
          ); })()}
        </div>
        )}
    </>
  );
  if (asPage) {
    const pageTitle = editing ? '编辑活动' : '新建活动';
    const saveLabel = editing ? '保存' : '发布';
    const ok = actFormReady(f, editing);
    const doSave = () => { onSave({ ...actFormPayload(f), id: editing ? initAct.id : undefined }); onClose(); };
    if (mobileAdmin) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg)' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 10, flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
              <button type="button" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
                <Icon name="back" size={22} />
              </button>
              <div style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 800 }}>{pageTitle}</div>
              <Btn variant="primary" size="sm" icon="check" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={doSave}>{saveLabel}</Btn>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 32px' }} className="noscroll">
            {formInner}
          </div>
        </div>
      );
    }
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
        <div style={{ padding: '16px 28px 0', background: 'var(--surface)' }}>
          <button type="button" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 14 }}>
            <Icon name="back" size={17} />返回
          </button>
        </div>
        <Topbar title={pageTitle} sub={editing ? undefined : '填写活动信息并发布给小组成员'}
          right={!editing ? <Btn variant="ai" icon="spark" onClick={useAOpen}>AI 策划</Btn> : undefined} />
        <div style={{ padding: '0 28px 32px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: '28px 32px 32px' }}>
            {formInner}
          </div>
        </div>
      </div>
    );
  }
  return (
    <Modal open={open} onClose={onClose} title="编辑活动" width={580}>
      <div style={{ padding: 24 }}>
        {formInner}
      </div>
    </Modal>
  );
}

// ============ CATEGORIES ============
// 图标来源：window.ICONS（site/assets/b000b729-….js）；取 20 个排满两行（每行 10）
const CAT_ICON_PREFERRED = [
  'zap', 'sun', 'bookmark', 'camera', 'mic', 'ticket', 'cards', 'controller', 'heart', 'users',
  'trending', 'award', 'pin', 'plane', 'gift', 'calendar', 'lightbulb', 'image', 'chat', 'flag',
];
const CAT_ICON_OPTS = CAT_ICON_PREFERRED.filter(n => ICONS && ICONS[n]).slice(0, 20);
const CAT_COLOR_OPTS = [
  { v: 'var(--c-sport)', label: '运动橙' },
  { v: 'var(--c-reading)', label: '阅读绿' },
  { v: 'var(--c-photo)', label: '职场青' },
  { v: 'var(--c-outdoor)', label: '户外绿' },
  { v: 'var(--c-food)', label: '志愿红' },
  { v: 'var(--c-game)', label: '电竞紫' },
  { v: 'var(--c-music)', label: '音乐蓝' },
  { v: 'var(--c-other)', label: '其他灰' },
];

function catFormBlank() {
  return { key: '', label: '', icon: 'zap', color: 'var(--c-sport)', order: 0 };
}
function sortCats(list) {
  const cmp = typeof compareCats === 'function' ? compareCats : (a, b) => {
    const oa = a && a.order != null ? Number(a.order) : 0;
    const ob = b && b.order != null ? Number(b.order) : 0;
    if (oa !== ob) return oa - ob;
    return ((b && b.createdAt) || 0) - ((a && a.createdAt) || 0);
  };
  return (list || []).slice().sort(cmp);
}

function CatFormFields({ draft, setDraft, showOrder = true }) {
  return (
    <>
      <Field label="名称"><TextInput value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="例如：运动健身" maxLength={12} /></Field>
      <Field label="图标">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8 }}>
          {CAT_ICON_OPTS.map(n => {
            const on = draft.icon === n;
            return (
              <button key={n} type="button" onClick={() => setDraft({ ...draft, icon: n })}
                title={n}
                style={{
                  width: '100%', aspectRatio: '1', borderRadius: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: on ? 'var(--brand-tint)' : 'var(--bg)',
                  border: on ? '1.5px solid var(--brand)' : '1.5px solid var(--line-2)',
                  color: on ? 'var(--brand-600)' : 'var(--ink-2)',
                }}>
                <Icon name={n} size={18} stroke={2.2} />
              </button>
            );
          })}
        </div>
      </Field>
      {showOrder && <Field label="排序"><TextInput type="number" value={draft.order} onChange={e => setDraft({ ...draft, order: e.target.value })} /></Field>}
      <Field label="颜色">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CAT_COLOR_OPTS.map(opt => {
            const on = draft.color === opt.v;
            return (
              <button key={opt.v} type="button" onClick={() => setDraft({ ...draft, color: opt.v })}
                title={opt.label}
                style={{
                  width: 34, height: 34, borderRadius: 10, background: opt.v, cursor: 'pointer',
                  border: on ? '2px solid var(--ink)' : '2px solid transparent', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                }} />
            );
          })}
        </div>
      </Field>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--bg)' }}>
        <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>预览</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 99, fontWeight: 700, fontSize: 13,
          background: `color-mix(in oklch, ${draft.color} 15%, white)`, color: draft.color }}>
          <Icon name={draft.icon || 'dots'} size={15} />{(draft.label || '').trim() || '分类名称'}
        </span>
      </div>
    </>
  );
}

function CatFormPage({ init, onClose, onSave }) {
  const { store } = useA();
  const [draft, setDraft] = React.useState(() => init ? { ...init } : catFormBlank());
  React.useEffect(() => {
    setDraft(init ? { ...init } : catFormBlank());
  }, [init?.key]);
  const doSave = () => {
    const label = (draft.label || '').trim();
    if (!label) { toast('请填写分类名称', { icon: 'alert' }); return; }
    if (label.length > 12) { toast('名称不超过 12 字', { icon: 'alert' }); return; }
    onSave({
      key: init ? init.key : ('c' + Date.now()),
      label,
      icon: draft.icon || 'dots',
      color: draft.color || 'var(--c-other)',
      order: Number(draft.order) || 0,
      createdAt: init ? (init.createdAt || 0) : Date.now(),
    });
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg)', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', padding: '10px 12px' }}>
          <button type="button" onClick={onClose} aria-label="返回"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, zIndex: 1,
              border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
            <Icon name="back" size={22} />
          </button>
          <div style={{
            position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none',
            fontSize: 16, fontWeight: 800,
          }}>{init ? '编辑分类' : '新建分类'}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 96px', display: 'flex', flexDirection: 'column', gap: 14 }} className="noscroll">
        <CatFormFields draft={draft} setDraft={setDraft} />
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 12,
        padding: '12px 14px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(180deg, transparent 0%, var(--bg) 28%)',
        pointerEvents: 'none',
      }}>
        <Btn variant="primary" icon="check" onClick={doSave}
          style={{ width: '100%', pointerEvents: 'auto', boxShadow: '0 6px 20px oklch(0.55 0.14 40 / 0.28)' }}>保存</Btn>
      </div>
    </div>
  );
}

function CategoriesSection() {
  const { store, actions, mobileAdmin, openCatForm } = useA();
  const [form, setForm] = React.useState({ open: false, init: null });
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const list = sortCats(store.cats || []);
  const countFor = (key) => ({
    g: store.groups.filter(x => x.cat === key).length,
    a: store.acts.filter(x => x.cat === key).length,
  });
  const blank = () => catFormBlank();
  const [draft, setDraft] = React.useState(blank);
  const openCreate = () => {
    if (mobileAdmin) openCatForm(null);
    else { setDraft(blank()); setForm({ open: true, init: null }); }
  };
  const openEdit = (c) => {
    if (mobileAdmin) openCatForm(c);
    else { setDraft({ ...c }); setForm({ open: true, init: c }); }
  };
  const save = () => {
    const label = (draft.label || '').trim();
    if (!label) { toast('请填写分类名称', { icon: 'alert' }); return; }
    if (label.length > 12) { toast('名称不超过 12 字', { icon: 'alert' }); return; }
    actions.saveCat({
      key: form.init ? form.init.key : ('c' + Date.now()),
      label,
      icon: draft.icon || 'dots',
      color: draft.color || 'var(--c-other)',
      order: Number(draft.order) || 0,
      createdAt: form.init ? (form.init.createdAt || 0) : Date.now(),
    });
    setForm({ open: false, init: null });
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    actions.delCat(deleteTarget.key);
    setDeleteTarget(null);
  };
  const delCounts = deleteTarget ? countFor(deleteTarget.key) : { g: 0, a: 0 };
  const deleteMessage = deleteTarget
    ? `确认删除分类「${deleteTarget.label}」？${(delCounts.g > 0 || delCounts.a > 0)
      ? `将有 ${delCounts.g} 个小组、${delCounts.a} 个活动变为「未分类」。`
      : '当前无关联小组/活动。'}`
    : '';
  const rowIconBtn = (onClick, disabled, icon, danger) => (
    <button type="button" disabled={disabled} onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', border: 'none', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.35 : 1, color: danger ? 'oklch(0.55 0.2 25)' : 'var(--ink-2)', flexShrink: 0,
    }}><Icon name={icon} size={17} /></button>
  );
  const th = { textAlign: 'left', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', padding: '10px 14px', borderBottom: '1px solid var(--line)' };
  const td = { padding: '12px 14px', borderBottom: '1px solid var(--line)', fontSize: 13.5, verticalAlign: 'middle' };

  const [menuKey, setMenuKey] = React.useState(null);
  if (mobileAdmin) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
        <Topbar compact title="分类"
          right={<Btn variant="primary" size="sm" icon="plus" onClick={openCreate}>新建</Btn>} />
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((c, i) => {
            const cnt = countFor(c.key);
            const menuOpen = menuKey === c.key;
            const menuItem = (label, onClick, opts = {}) => (
              <button type="button" disabled={!!opts.disabled} onClick={() => { setMenuKey(null); if (!opts.disabled) onClick(); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                  color: opts.danger ? '#FFB4B4' : '#fff', fontSize: 13, fontWeight: 600,
                  border: 'none', background: 'transparent', cursor: opts.disabled ? 'default' : 'pointer',
                  opacity: opts.disabled ? 0.35 : 1, flexShrink: 0, whiteSpace: 'nowrap',
                  borderLeft: opts.borderL ? '1px solid rgba(255,255,255,0.15)' : 'none',
                }}>
                {opts.icon ? <Icon name={opts.icon} size={15} /> : null}{label}
              </button>
            );
            return (
              <div key={c.key} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px 12px 14px',
                background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-sm)',
              }}>
                <button type="button" onClick={() => openEdit(c)}
                  style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                    border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: 'inherit' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in oklch, ${c.color} 18%, white)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                    <Icon name={c.icon} size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }} className="clamp1">{c.label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{cnt.g} 小组 · {cnt.a} 活动</div>
                  </div>
                </button>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button type="button" aria-label="更多" onClick={() => setMenuKey(menuOpen ? null : c.key)}
                    style={{ width: 32, height: 28, borderRadius: 8, background: 'var(--bg-2)', color: 'var(--ink-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, letterSpacing: 1,
                      border: 'none', cursor: 'pointer' }}>
                    ···
                  </button>
                  {menuOpen && (
                    <>
                      <div onClick={() => setMenuKey(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                      <div style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: 6, zIndex: 41,
                        display: 'flex', flexWrap: 'nowrap', alignItems: 'stretch',
                        width: 'max-content', borderRadius: 8, overflow: 'hidden', whiteSpace: 'nowrap',
                        background: 'rgba(70,70,70,0.95)', boxShadow: 'var(--shadow-md)',
                      }}>
                        {menuItem('上移', () => actions.moveCat(c.key, -1), { icon: 'chevU', disabled: i === 0 })}
                        {menuItem('下移', () => actions.moveCat(c.key, 1), { icon: 'chevD', disabled: i === list.length - 1, borderL: true })}
                        {menuItem('删除', () => setDeleteTarget(c), { icon: 'trash', danger: true, borderL: true })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {!list.length && (
            <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 36, fontSize: 14 }}>暂无分类，点击右上角新建</div>
          )}
        </div>
        <ConfirmSheet open={!!deleteTarget} title="删除分类" message={deleteMessage}
          confirmLabel="删除" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title="分类管理" sub={`共 ${list.length} 个分类`}
        right={<Btn variant="primary" icon="plus" onClick={openCreate}>新建分类</Btn>} />
      <div style={{ padding: 28 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={{ ...th, width: 72 }}>排序</th>
                <th style={th}>分类</th>
                <th style={{ ...th, width: 88 }}>颜色</th>
                <th style={{ ...th, width: 88 }}>小组</th>
                <th style={{ ...th, width: 88 }}>活动</th>
                <th style={{ ...th, width: 300 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c, i) => {
                const cnt = countFor(c.key);
                return (
                  <tr key={c.key}>
                    <td style={td}>{c.order}</td>
                    <td style={td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                        <Icon name={c.icon} size={18} style={{ color: c.color }} />{c.label}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 7, background: c.color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />
                    </td>
                    <td style={td}>{cnt.g}</td>
                    <td style={td}>{cnt.a}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        <Btn variant="ghost" icon="edit" onClick={() => openEdit(c)}>编辑</Btn>
                        <Btn variant="ghost" disabled={i === 0} onClick={() => actions.moveCat(c.key, -1)}>上移</Btn>
                        <Btn variant="ghost" disabled={i === list.length - 1} onClick={() => actions.moveCat(c.key, 1)}>下移</Btn>
                        <Btn variant="ghost" icon="trash" onClick={() => setDeleteTarget(c)} style={{ color: 'oklch(0.55 0.2 25)' }}>删除</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!list.length && (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: 'var(--ink-3)', padding: 36 }}>暂无分类，点击右上角新建</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={form.open} onClose={() => setForm({ open: false, init: null })} title={form.init ? '编辑分类' : '新建分类'} width={480}>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CatFormFields draft={draft} setDraft={setDraft} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Btn variant="ghost" onClick={() => setForm({ open: false, init: null })}>取消</Btn>
            <Btn variant="primary" icon="check" onClick={save}>保存</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="删除分类" width={440}>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>
            确认删除分类「<span style={{ fontWeight: 700, color: 'var(--ink)' }}>{deleteTarget ? deleteTarget.label : ''}</span>」？
            {(delCounts.g > 0 || delCounts.a > 0)
              ? <>将有 <b>{delCounts.g}</b> 个小组、<b>{delCounts.a}</b> 个活动变为「未分类」。</>
              : <>当前无关联小组/活动。</>}
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

// ============ ADMIN APP SHELL ============
const MOBILE_ADMIN_TABS = [
  { k: 'dashboard', label: '工作台', icon: 'grid' },
  { k: 'groups', label: '小组', icon: 'users' },
  { k: 'activities', label: '活动', icon: 'calendar' },
  { k: 'categories', label: '分类', icon: 'layers' },
];
const MOBILE_ADMIN_PARENT = {
  groupDetail: 'groups', actDetail: 'activities', actCreate: 'activities', actEdit: 'activities', actAiCreate: 'activities',
  pendingJoins: 'dashboard',
};

function RoleIdentitySwitcher({ role, onChange, style }) {
  const isManager = role === 'manager';
  const label = isManager ? '管理者' : '员工';
  const next = isManager ? 'employee' : 'manager';
  const nextLabel = isManager ? '员工' : '管理者';
  return (
    <button
      type="button"
      onClick={() => onChange && onChange(next)}
      aria-label={`当前${label}，点击切换为${nextLabel}`}
      title={`点击切换为${nextLabel}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 11px',
        borderRadius: 99, border: 'none', cursor: 'pointer',
        background: 'var(--surface)', boxShadow: 'var(--shadow-sm)',
        fontSize: 12, fontWeight: 700, color: 'var(--brand-600)', whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <Icon name="user" size={14} stroke={2.2} style={{ color: 'var(--brand)' }} />
      {label}
      <Icon name="repeat" size={12} stroke={2.2} style={{ color: 'var(--ink-3)' }} />
    </button>
  );
}

function AdminApp({ variant = 'pc', role = 'manager', onRoleChange }) {
  const isMobile = variant === 'mobile';
  const [groups, setGroups] = React.useState(() => DB.groups.map(g => ({ ...g })));
  const [acts, setActs] = React.useState(() => DB.acts.map(a => ({ ...a })));
  const [cats, setCats] = React.useState(() => (typeof catsList === 'function' ? catsList() : Object.values(CATS)).map(c => ({ ...c })));
  const [joinRequests, setJoinRequests] = React.useState(() => (DB.joinRequests || []).map(r => ({ ...r })));
  const [comments, setComments] = React.useState(() => DB.comments.map(c => ({ ...c })));
  const [view, setView] = React.useState({ section: 'dashboard' });
  const [groupForm, setGroupForm] = React.useState({ open: false, init: null });
  const [actForm, setActForm] = React.useState({ open: false, gid: null, init: null });

  const applyCats = (next) => {
    const sorted = sortCats(next);
    setCats(sorted);
    if (typeof syncWindowCats === 'function') syncWindowCats(sorted);
  };

  React.useEffect(() => {
    const h = () => {
      if (view.section === 'actCreate') {
        setView({ section: 'actAiCreate', back: { section: 'actCreate', gid: view.gid, back: view.back } });
        return;
      }
      const back = view.section === 'groupDetail' && view.gid
        ? { section: 'groupDetail', gid: view.gid }
        : view.section === 'dashboard'
        ? { section: 'dashboard' }
        : { section: 'activities' };
      setView({ section: 'actAiCreate', back });
    };
    window.addEventListener('open-ai-composer', h);
    return () => window.removeEventListener('open-ai-composer', h);
  }, [view]);

  const actions = {
    saveCat: (data) => {
      const exists = cats.some(c => c.key === data.key);
      applyCats(exists
        ? cats.map(c => c.key === data.key ? { ...c, ...data, createdAt: data.createdAt != null ? data.createdAt : c.createdAt } : c)
        : [...cats, { ...data, createdAt: data.createdAt || Date.now() }]);
      toast(exists ? '分类已更新' : '分类已创建', { icon: 'check' });
    },
    delCat: (key) => {
      applyCats(cats.filter(c => c.key !== key));
      setGroups(s => s.map(g => g.cat === key ? { ...g, cat: '' } : g));
      setActs(s => s.map(a => a.cat === key ? { ...a, cat: '' } : a));
      toast('分类已删除', { icon: 'trash' });
    },
    moveCat: (key, dir) => {
      const sorted = sortCats(cats);
      const i = sorted.findIndex(c => c.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= sorted.length) return;
      const oi = sorted[i].order, oj = sorted[j].order;
      if (oi === oj) {
        const ti = sorted[i].createdAt || 0, tj = sorted[j].createdAt || 0;
        sorted[i] = { ...sorted[i], createdAt: tj };
        sorted[j] = { ...sorted[j], createdAt: ti };
      } else {
        sorted[i] = { ...sorted[i], order: oj };
        sorted[j] = { ...sorted[j], order: oi };
      }
      applyCats(sorted);
    },
    delGroup: (gid) => setGroups(s => s.filter(g => g.id !== gid)),
    saveGroup: (data) => {
      if (data.id) { setGroups(s => s.map(g => g.id === data.id ? { ...g, ...data } : g)); toast('小组已更新', { icon: 'check' }); }
      else { setGroups(s => [{ ...data, id: 'g' + Date.now(), members: 1, acts: 0, joined: true }, ...s]); toast('小组创建成功', { ai: true }); }
    },
    addAct: (d, ai) => {
      const g = groups.find(x => x.id === d.gid);
      const base = { gid: d.gid, cat: d.cat || (g ? g.cat : 'sport'), loc: d.loc, host: g ? g.lead : '陈航', cap: +d.cap,
        signed: 0, liked: false, likes: 0, joinedByMe: false, status: 'upcoming', desc: d.desc, tags: d.tags || [],
        cover: d.cover || '', ai: !!ai };
      const ts = Date.now();
      if (d.type === 'series' && d.sessions && d.sessions.length) {
        const series = d.title.trim();
        const total = d.sessions.length;
        const newActs = d.sessions.map((s, i) => ({
          ...base, id: 'a' + ts + '_' + i, type: 'series', title: total > 1 ? `${d.title} · 第 ${i + 1} 场` : d.title,
          date: s.date, time: s.time, series, seriesIdx: i + 1, seriesTotal: total,
          seriesSignupMode: d.seriesSignupMode || 'independent',
          signupDeadline: d.seriesSignupMode === 'all' ? s.date : null,
        }));
        setActs(s => [...newActs, ...s]);
        toast(`系列活动已发布,共 ${total} 个场次`, { ai: !!ai });
        return;
      }
      if (d.type === 'recurring') {
        setActs(s => [{ ...base, id: 'a' + ts, type: 'recurring', title: d.title,
          date: formatRepeatDate(d), endDate: d.endDate, spanDays: d.spanDays, time: d.time,
          repeatMode: d.repeatMode, repeatWeekdays: d.repeatWeekdays, repeatMonthDays: d.repeatMonthDays,
        }, ...s]);
        toast(ai ? 'AI 活动已发布,已推送给小组成员' : '活动已发布', { ai: !!ai });
        return;
      }
      setActs(s => [{ ...base, id: 'a' + ts, type: d.type || 'once', title: d.title, date: d.date, time: d.time }, ...s]);
      toast(ai ? 'AI 活动已发布,已推送给小组成员' : '活动已发布', { ai: !!ai });
    },
    updateAct: (d) => {
      const g = groups.find(x => x.id === d.gid);
      setActs(s => s.map(x => x.id === d.id ? {
        ...x, title: d.title, cover: d.cover, gid: d.gid, cat: d.cat, loc: d.loc, cap: +d.cap, desc: d.desc,
        time: d.time, host: g ? g.lead : x.host,
        ...(x.type === 'recurring' ? { endDate: d.endDate, spanDays: d.spanDays } : { date: d.date }),
      } : x));
      toast('活动已更新', { icon: 'check' });
    },
    delAct: (id) => {
      setActs(s => {
        const act = s.find(x => x.id === id);
        if (!act) return s;
        if (act.type === 'series' && act.series) {
          return s.filter(x => !(x.type === 'series' && x.series === act.series && x.gid === act.gid));
        }
        return s.filter(x => x.id !== id);
      });
      toast('活动已删除', { icon: 'trash' });
    },
    terminateAct: (id) => {
      setActs(s => {
        const act = s.find(x => x.id === id);
        if (!act) return s;
        return s.map(x => {
          if (x.id === id) return { ...x, status: 'cancelled' };
          if (act.type === 'series' && act.series && x.type === 'series' && x.series === act.series && x.gid === act.gid)
            return { ...x, status: 'cancelled' };
          return x;
        });
      });
      toast('活动已终止', { icon: 'flag' });
    },
    approveJoin: (id) => {
      const req = joinRequests.find(r => r.id === id && r.status === 'pending');
      if (!req) return;
      setJoinRequests(s => s.filter(r => r.id !== id));
      setGroups(s => s.map(g => g.id === req.gid ? { ...g, members: (g.members || 0) + 1 } : g));
      const g = groups.find(x => x.id === req.gid);
      // 本人(C 端)申请：写回 DB,使 C 端切回后小组变「已加入」,可报名
      if (req.self) DBH.patchGroup(req.gid, { joined: true, pending: false, members: (g ? g.members : 0) + 1 });
      DBH.removeJoinRequest(id);
      toast(`已通过 ${req.name} 加入「${g ? g.name : '小组'}」`, { icon: 'check' });
    },
    rejectJoin: (id) => {
      const req = joinRequests.find(r => r.id === id && r.status === 'pending');
      if (!req) return;
      setJoinRequests(s => s.filter(r => r.id !== id));
      if (req.self) DBH.patchGroup(req.gid, { pending: false });
      DBH.removeJoinRequest(id);
      toast(`已拒绝 ${req.name} 的加入申请`, { icon: 'x' });
    },
    delComment: (id) => {
      setComments(s => s.filter(c => c.id !== id));
      const idx = DB.comments.findIndex(c => c.id === id);
      if (idx >= 0) DB.comments.splice(idx, 1);
    },
    approveAllJoin: () => {
      const pending = joinRequests.filter(r => {
        if (r.status !== 'pending') return false;
        const g = groups.find(x => x.id === r.gid);
        return g && g.join === 'approve';
      });
      if (!pending.length) return;
      const memberDelta = {};
      pending.forEach(r => { memberDelta[r.gid] = (memberDelta[r.gid] || 0) + 1; });
      setJoinRequests(s => s.filter(r => !pending.some(p => p.id === r.id)));
      setGroups(s => s.map(g => memberDelta[g.id] ? { ...g, members: (g.members || 0) + memberDelta[g.id] } : g));
      pending.forEach(r => {
        if (r.self) { const g = groups.find(x => x.id === r.gid); DBH.patchGroup(r.gid, { joined: true, pending: false, members: (g ? g.members : 0) + memberDelta[r.gid] }); }
        DBH.removeJoinRequest(r.id);
      });
      toast(`已全部通过 ${pending.length} 条加入申请`, { icon: 'check' });
    },
  };
  const store = { groups, acts, cats, joinRequests, comments };
  const ctx = { view, setView, store, actions, mobileAdmin: isMobile,
    openGroupForm: (init) => {
      if (isMobile) {
        setView({
          section: 'groupForm',
          init,
          back: view.section === 'groupDetail'
            ? { section: 'groupDetail', gid: view.gid }
            : { section: 'groups' },
        });
      } else {
        setGroupForm({ open: true, init });
      }
    },
    openActForm: (gid, init) => {
      if (init) {
        if (isMobile) {
          setView({
            section: 'actEdit',
            gid, init,
            back: view.section === 'actDetail'
              ? { section: 'actDetail', aid: view.aid, back: view.back }
              : view.section === 'groupDetail'
              ? { section: 'groupDetail', gid: view.gid }
              : { section: 'activities' },
          });
        } else {
          setActForm({ open: true, gid, init });
        }
      } else {
        const back = view.section === 'groupDetail' && view.gid
          ? { section: 'groupDetail', gid: view.gid }
          : { section: 'activities' };
        setView({ section: 'actCreate', gid: gid || (view.section === 'groupDetail' ? view.gid : null), back });
      }
    },
    openCatForm: (init) => {
      if (isMobile) setView({ section: 'catForm', init, back: { section: 'categories' } });
    } };

  const render = () => {
    switch (view.section) {
      case 'dashboard': return <Dashboard />;
      case 'pendingJoins': return <PendingJoinsPage />;
      case 'groups': return <GroupsSection />;
      case 'categories': return <CategoriesSection />;
      case 'groupDetail': return <AdminGroupDetail gid={view.gid} />;
      case 'groupForm': return (
        <GroupForm asPage init={view.init}
          onClose={() => setView(view.back || { section: 'groups' })}
          onSave={(d) => { actions.saveGroup(d); setView(view.back || { section: 'groups' }); }} />
      );
      case 'catForm': return (
        <CatFormPage init={view.init}
          onClose={() => setView(view.back || { section: 'categories' })}
          onSave={(d) => { actions.saveCat(d); setView(view.back || { section: 'categories' }); }} />
      );
      case 'actDetail': return <AdminActDetail aid={view.aid} back={view.back} />;
      case 'actCreate': return (
        <ActForm asPage gidInit={view.gid} store={store}
          onClose={() => setView(view.back || { section: 'activities' })}
          onSave={(d) => actions.addAct(d, false)} />
      );
      case 'actEdit': return (
        <ActForm asPage initAct={view.init} gidInit={view.gid} store={store}
          onClose={() => setView(view.back || { section: 'activities' })}
          onSave={(d) => { actions.updateAct(d); setView(view.back || { section: 'activities' }); }} />
      );
      case 'actAiCreate': return isMobile ? (
        <ActAiGuide store={store}
          onClose={() => setView(view.back || { section: 'activities' })}
          onPublish={(d) => actions.addAct(d, true)} />
      ) : (
        <AIComposer asPage store={store}
          onClose={() => setView(view.back || { section: 'activities' })}
          onPublish={(d) => actions.addAct(d, true)} />
      );
      case 'activities': return <ActivitiesSection />;
      case 'signups': case 'comments': case 'moments':
        return isMobile ? <Dashboard /> : <GlobalSection section={view.section} />;
      default: return <Dashboard />;
    }
  };

  const activeTab = MOBILE_ADMIN_PARENT[view.section] || (MOBILE_ADMIN_TABS.some(t => t.k === view.section) ? view.section : 'dashboard');
  const isRootTab = ['dashboard', 'groups', 'activities', 'categories'].includes(view.section);

  if (isMobile) {
    return (
      <AdminCtx.Provider value={ctx}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative',
          fontFamily: 'var(--font)', color: 'var(--ink)', background: 'var(--bg)' }}>
          {isRootTab && (
            <div style={{ flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                gap: 8, padding: '10px 12px 6px',
              }}>
                <RoleIdentitySwitcher role={role} onChange={r => onRoleChange && onRoleChange(r)} style={{ flexShrink: 0 }} />
              </div>
              <div style={{ display: 'flex', padding: '0 4px' }}>
                {MOBILE_ADMIN_TABS.map(t => {
                  const on = activeTab === t.k;
                  return (
                    <button key={t.k} type="button" onClick={() => setView({ section: t.k })}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: '10px 0 9px', border: 'none', background: 'transparent', cursor: 'pointer',
                        color: on ? 'var(--brand-600)' : 'var(--ink-3)', fontWeight: on ? 800 : 600, fontSize: 13,
                        boxShadow: on ? 'inset 0 -2px 0 var(--brand-600)' : 'inset 0 -2px 0 transparent',
                      }}>
                      <Icon name={t.icon} size={15} stroke={on ? 2.4 : 2} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {render()}
          </div>
          <GroupForm open={groupForm.open} init={groupForm.init} onClose={() => setGroupForm({ open: false, init: null })} onSave={actions.saveGroup} />
          <ActForm open={actForm.open} gidInit={actForm.gid} initAct={actForm.init} store={store} onClose={() => setActForm({ open: false, gid: null, init: null })} onSave={(d) => actions.updateAct(d)} />
          <ToastHost />
        </div>
      </AdminCtx.Provider>
    );
  }

  return (
    <AdminCtx.Provider value={ctx}>
      <div style={{ display: 'flex', height: '100%', position: 'relative', fontFamily: 'var(--font)', color: 'var(--ink)' }}>
        <Sidebar />
        {render()}
        <GroupForm open={groupForm.open} init={groupForm.init} onClose={() => setGroupForm({ open: false, init: null })} onSave={actions.saveGroup} />
        <ActForm open={actForm.open} gidInit={actForm.gid} initAct={actForm.init} store={store} onClose={() => setActForm({ open: false, gid: null, init: null })} onSave={(d) => actions.updateAct(d)} />
        <ToastHost />
      </div>
    </AdminCtx.Provider>
  );
}

Object.assign(window, { SignupsView, CommentsView, MomentsGrid, MomentDetailModal, ActivitiesSection, GlobalSection, CategoriesSection, GroupForm, CatFormPage, ActForm, ActAiGuide, AdminApp, RoleIdentitySwitcher, SignupMembersModal, signupMemberNames, signupMemberDept });

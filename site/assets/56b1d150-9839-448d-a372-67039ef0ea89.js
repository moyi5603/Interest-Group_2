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

function MetaRow({ icon, children, wrap }) {
  return (
    <div style={{ display: 'flex', alignItems: wrap ? 'flex-start' : 'center', gap: 7, fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
      <Icon name={icon} size={15} stroke={2} style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: wrap ? 2 : 0 }} />
      <span className={wrap ? undefined : 'clamp1'}>{children}</span>
    </div>
  );
}

function needsDetailEnroll(type) {
  return type === 'recurring' || type === 'series';
}

// 本人对某小组的三态：member（已入组）/ pending（待审核）/ none（未入组）
function groupMemberState(group) {
  if (!group) return 'member';
  if (group.joined) return 'member';
  if (group.pending) return 'pending';
  return 'none';
}

// 是否按场次/按期可增减（周期 或 系列·按场次）
function isAdjustableAct(a) {
  return a.type === 'recurring' || (a.type === 'series' && (a.seriesSignupMode || 'independent') === 'independent');
}

// 报名按钮文案/样式（卡片用）。需先加入小组才能报名。
function enrollBtnInfo(a, cur, group, opts) {
  const simpleLabel = opts && opts.simpleLabel;
  const via = needsDetailEnroll(a.type);
  const adjustable = isAdjustableAct(a);
  const gs = groupMemberState(group);
  if (gs === 'pending') return { label: '审核中', icon: 'clock', variant: 'ghost', disabled: true };
  if (gs === 'none') return { label: '报名+入组', icon: 'userPlus', variant: 'primary' };
  if (cur.joinedByMe) {
    if (adjustable) return { label: '调整场次', icon: 'ticket', variant: 'soft' };
    if (via || (simpleLabel && a.type === 'once')) return { label: '取消报名', icon: 'x', variant: 'ghost' };
    return { label: '已报名', icon: 'check', variant: 'ghost' };
  }
  return { label: (adjustable && !simpleLabel) ? '选场次报名' : '报名', icon: 'ticket', variant: 'primary' };
}

function handleActivityEnrollClick(e, a, actions, nav, group, detailAid) {
  e.stopPropagation();
  const aid = detailAid || a.id;
  const gs = groupMemberState(group);
  if (gs === 'pending') { toast('申请审核中,通过后可报名', { icon: 'clock' }); return; }
  if (gs === 'none') {
    if (group.join === 'approve') { actions.applyJoin(group.id); return; }
    // 自由加入：入组后报名
    if (needsDetailEnroll(a.type)) { actions.joinGroupFree(group.id); nav.go('activity', { aid, pickEnroll: true }); return; }
    actions.signupAndJoinFree(aid, group.id);
    return;
  }
  // 已是成员：周期/系列进详情调整场次,单次直接报名/取消
  if (needsDetailEnroll(a.type)) {
    nav.go('activity', { aid, pickEnroll: true });
    return;
  }
  actions.toggleSignup(aid);
}

// big activity card (feed)
function ActivityCard({ a, onClick, recReason, simpleEnrollLabel }) {
  const { actions, store, nav } = useM();
  const view = DBH.forListCard(a, store.acts);
  const cur = store.acts.find(x => x.id === view.id) || view;
  const g = store.groups.find(x => x.id === view.gid);
  const moms = DB.moments.filter(m => m.aid === view.id);
  const cancelled = view.status === 'cancelled';
  const ended = view.status === 'ended' || cancelled;
  const statusMeta = cancelled
    ? { label: '已终止', color: '#fff', bg: 'rgba(120,113,108,0.92)' }
    : view.status === 'ended'
      ? { label: '已结束', color: '#fff', bg: 'rgba(60,60,60,0.78)' }
      : null;
  const cardTitle = view.type === 'series' && view.series ? view.series : view.title;
  const openDetail = () => { nav.go('activity', { aid: view._detailAid || view.id }); onClick && onClick(); };
  return (
    <div onClick={openDetail} className="rise" style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow)', overflow: 'hidden', cursor: 'pointer' }}>
      <div style={{ position: 'relative', height: 152 }}>
        <Cover src={view.cover} seed={view.id + view.cat} icon={CATS[view.cat].icon} dim />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          {statusMeta && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 99,
              fontSize: 11, fontWeight: 800, color: statusMeta.color, background: statusMeta.bg,
              backdropFilter: 'blur(4px)' }}>{statusMeta.label}</span>
          )}
          <CatBadge cat={view.cat} size="sm" solid />
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}><TypeTag type={view.type} /></div>
        {!ended && (
          <div style={{ position: 'absolute', bottom: 11, right: 12, display: 'flex', gap: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 800, color: '#fff', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 99 }}>
              <Icon name="heart" size={15} fill={cur.liked} />{cur.likes}</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 28%, rgba(0,0,0,0.72))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px 15px 13px' }}>
          {!ended && recReason && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '100%', display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 99, background: 'var(--ai-grad)', boxShadow: '0 2px 8px oklch(0.66 0.21 4 / 0.35)', marginBottom: 6 }}>
              <Sparkles size={12} color="#fff" />
              <span className="clamp1" style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{recReason}</span>
            </div>
          )}
          {g && !recReason && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 3 }} className="clamp1">{g.name}</div>}
          <div style={{ fontSize: 15.5, fontWeight: 800, lineHeight: 1.3, letterSpacing: -0.2, color: '#fff', paddingRight: ended ? 0 : 52 }} className="clamp1">{cardTitle}</div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <MetaRow icon="calendar">
                {ActWhen.compact(view)}
                {ActWhen.daysBadge(view) && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 6, background: 'var(--brand-tint, color-mix(in oklch, var(--brand) 12%, white))', color: 'var(--brand)', fontSize: 11, fontWeight: 700 }}>{ActWhen.daysBadge(view)}</span>}
              </MetaRow>
            </div>
            {view.loc && <MetaRow icon="pin">{view.loc}</MetaRow>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '11px 0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 5 }}>
                <span style={{ color: 'var(--ink-2)' }}>已报名 {view.signed}/{view.cap}</span>
                <span style={{ color: view.signed >= view.cap ? 'var(--brand)' : 'var(--ink-3)' }}>{view.signed >= view.cap ? '已满员' : `余 ${view.cap - view.signed} 位`}</span>
              </div>
              <ProgressBar value={view.signed} max={view.cap} color={CATS[view.cat].color} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <AvatarStack names={DB.NAMES.slice(0, 6)} n={4} size={26} extra={Math.max(0, view.signed - 4)} />
            {(() => { const b = enrollBtnInfo(cur, view, g, { simpleLabel: simpleEnrollLabel }); return (
              <Btn variant={b.variant} size="sm" icon={b.icon} disabled={b.disabled}
                style={b.disabled ? { opacity: 0.55 } : undefined}
                onClick={e => handleActivityEnrollClick(e, cur, actions, nav, g, view._detailAid || view.id)}>{b.label}</Btn>
            ); })()}
          </div>
        </div>
      )}
    </div>
  );
}

// compact list row
function ActivityRow({ a, onClick }) {
  const { store, nav } = useM();
  const view = DBH.forListCard(a, store.acts);
  const cardTitle = view.type === 'series' && view.series ? view.series : view.title;
  const openDetail = () => { nav.go('activity', { aid: view._detailAid || view.id }); onClick && onClick(); };
  return (
    <div onClick={openDetail} style={{ display: 'flex', gap: 12, padding: 11, background: 'var(--surface)',
      borderRadius: 'var(--r)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', alignItems: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
        <Cover src={view.cover} seed={view.id + view.cat} icon={CATS[view.cat].icon} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700 }} className="clamp1">{cardTitle}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', margin: '3px 0 6px' }} className="clamp1">{ActWhen.compact(view)}{ActWhen.daysBadge(view) ? ` · ${ActWhen.daysBadge(view)}` : ''}</div>
        <div style={{ display: 'flex', gap: 6 }}><CatBadge cat={view.cat} size="sm" /><TypeTag type={view.type} /></div>
      </div>
      <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />
    </div>
  );
}

// AI recommendation card (horizontal)
function RecCard({ a, reason, onClick }) {
  const { store, actions, nav } = useM();
  const cur = store.acts.find(x => x.id === a.id) || a;
  const g = store.groups.find(x => x.id === a.gid);
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
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }} className="clamp1">{ActWhen.compact(a)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 9px', borderRadius: 11,
          background: 'var(--ai-soft)', marginBottom: 10 }}>
          <Sparkles size={14} color="var(--ai)" />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ai)', lineHeight: 1.3 }} className="clamp2">{reason}</span>
        </div>
        {(() => { const b = enrollBtnInfo(cur, cur, g); return (
          <Btn variant={b.variant} size="sm" full icon={b.icon} disabled={b.disabled}
            style={b.disabled ? { opacity: 0.55 } : undefined}
            onClick={e => handleActivityEnrollClick(e, cur, actions, nav, g)}>{b.label}</Btn>
        ); })()}
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
          {(() => {
            const gs = groupMemberState(cur);
            const jb = gs === 'member' ? { label: '已加入', icon: 'check', variant: 'ghost', disabled: true }
              : gs === 'pending' ? { label: '审核中', icon: 'clock', variant: 'ghost', disabled: true }
              : { label: cur.join === 'approve' ? '申请加入' : '加入', icon: 'plus', variant: 'soft', disabled: false };
            return <Btn variant={jb.variant} size="sm" icon={jb.icon} disabled={jb.disabled}
              style={jb.disabled ? { opacity: 0.55 } : undefined}
              onClick={e => { e.stopPropagation(); if (!jb.disabled) actions.toggleJoin(g.id); }}>{jb.label}</Btn>;
          })()}
        </div>
      </div>
    </div>
  );
}

function EndedActsStrip({ acts, groups, onViewDetail }) {
  if (!acts || acts.length === 0) {
    return (
      <div style={{ padding: '8px 16px 4px' }}>
        <Empty text="暂无往期精彩回顾" />
      </div>
    );
  }
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

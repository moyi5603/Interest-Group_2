// admin-sections.jsx — signups, comments, moments views, activities section, forms, AdminApp shell.

const SIGNUP_BAR = 'var(--brand)';
const MODE_TAG_STYLE = { background: 'var(--surface-2)', color: 'var(--ink-2)' };
const SESSION_IDX_STYLE = { background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' };
const SIGNUP_AVATAR_MAX = 20;

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

// 全部报名成员弹窗
function SignupMembersModal({ open, onClose, count, title }) {
  if (!open) return null;
  const names = signupMemberNames(count);
  return (
    <Modal open={open} onClose={onClose} title={title || `已报名成员 (${count})`} width={600}>
      <div style={{ padding: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {names.map((m, i) => (
            <div key={m + i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px 8px 8px', borderRadius: 12, background: 'var(--surface-2)' }}>
              <Avatar name={m} size={30} />
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 0 }} className="clamp1">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function SignupsView({ acts }) {
  const { store } = useA();
  const [memberModal, setMemberModal] = React.useState(null);

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

  const [open, setOpen] = React.useState(units[0] ? units[0].key : null);
  const [sessionOpen, setSessionOpen] = React.useState({});
  const toggleSession = k => setSessionOpen(s => ({ ...s, [k]: !s[k] }));

  const Avatars = ({ count, title }) => {
    const overflow = count > SIGNUP_AVATAR_MAX;
    // 有溢出时少显示一个头像，把「+N 人」按钮占据第 20 个位置，避免它单独换一行
    const shown = overflow ? SIGNUP_AVATAR_MAX - 1 : count;
    const names = signupMemberNames(shown);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        {names.map((m, i) => (
          <div key={m + i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px 6px 6px', borderRadius: 99, background: 'var(--surface-2)' }}>
            <Avatar name={m} size={26} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{m}</span>
          </div>
        ))}
        {overflow && (
          <button type="button" onClick={() => setMemberModal({ count, title })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 99,
              background: 'var(--brand-soft)', color: 'var(--brand-600)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {units.map(unit => {
        const isOpen = open === unit.key;

        if (unit.kind === 'single') {
          const a = unit.act;
          const g = store.groups.find(x => x.id === a.gid);
          return (
            <div key={unit.key} style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div onClick={() => setOpen(isOpen ? null : unit.key)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }} className="clamp1">{a.title}</span>
                    <TypeTag type={a.type} />
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>{g ? g.name : ''} · {ActWhen.full(a)}{ActWhen.daysBadge(a) ? ` · ${ActWhen.daysBadge(a)}` : ''}</div>
                </div>
                <div style={{ width: 130 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{a.signed}/{a.cap}</span><span style={{ color: 'var(--ink-3)' }}>{Math.round(a.signed / a.cap * 100)}%</span>
                  </div>
                  <ProgressBar value={a.signed} max={a.cap} color={SIGNUP_BAR} height={6} />
                </div>
                <Icon name={isOpen ? 'chevD' : 'chevR'} size={20} style={{ color: 'var(--ink-3)' }} />
              </div>
              {isOpen && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--line)' }} className="fade">
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', margin: '14px 0 11px' }}>已报名成员 ({a.signed})</div>
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
            <div key={unit.key} style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div onClick={() => setOpen(isOpen ? null : unit.key)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }} className="clamp1">{a.title}</span>
                    <TypeTag type={a.type} />
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>{g ? g.name : ''} · {a.date} · {sessionLabel} · 各期独立报名</div>
                </div>
                <div style={{ width: 130 }}>
                  {sessions.length > 0 ? (
                    <>
                      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{recentSigned}/{recentCap}</span>
                        <span style={{ color: 'var(--ink-3)' }}>{recentCap ? Math.round(recentSigned / recentCap * 100) : 0}%</span>
                      </div>
                      <ProgressBar value={recentSigned} max={recentCap} color={SIGNUP_BAR} height={6} />
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, fontWeight: 600 }}>最近 {sessions.length} 场人次</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>各期独立</div>
                  )}
                </div>
                <Icon name={isOpen ? 'chevD' : 'chevR'} size={20} style={{ color: 'var(--ink-3)' }} />
              </div>
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--line)' }} className="fade">
                  {sessions.length > 0 && (
                    <div style={{ padding: '12px 16px 0', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>
                      最近 {sessions.length} 场报名情况{sessionsAll.length > sessions.length ? ` · 仅展示最近 ${DBH.RECENT_SESSIONS_MAX} 场` : ''}
                    </div>
                  )}
                  {sessions.map((s, si) => {
                    const sOpen = sessionOpen[s.id];
                    return (
                      <div key={s.id} style={{ borderTop: si ? '1px solid var(--line)' : 'none' }}>
                        <div onClick={() => toggleSession(s.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, ...SESSION_IDX_STYLE }}>{si + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.date}{ActWhen.isCross(s) ? ` → ${s.endDate}` : ''}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.time}{ActWhen.isCross(s) ? ' · 跨天' : ''}</div>
                          </div>
                          <div style={{ width: 110 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                              <span>{s.signed}/{s.cap}</span><span style={{ color: 'var(--ink-3)' }}>{Math.round(s.signed / s.cap * 100)}%</span>
                            </div>
                            <ProgressBar value={s.signed} max={s.cap} color={SIGNUP_BAR} height={5} />
                          </div>
                          <Icon name={sOpen ? 'chevD' : 'chevR'} size={18} style={{ color: 'var(--ink-3)' }} />
                        </div>
                        {sOpen && (
                          <div style={{ padding: '0 16px 14px 54px' }} className="fade">
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
            <div key={key} style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div onClick={() => setOpen(isOpen ? null : key)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><Cover src={first.cover} seed={first.id + first.cat} icon={CATS[first.cat].icon} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }} className="clamp1">{first.series || first.title}</span>
                    <TypeTag type="series" />
                    <ModePill mode={mode} />
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>{g ? g.name : ''} · 共 {eps.length} 期</div>
                </div>
                <div style={{ width: 130 }}>
                  {mode === 'all' ? (
                    <>
                      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{totalSigned}/{totalCap}</span><span style={{ color: 'var(--ink-3)' }}>{Math.round(totalSigned / totalCap * 100)}%</span>
                      </div>
                      <ProgressBar value={totalSigned} max={totalCap} color={SIGNUP_BAR} height={6} />
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{totalSigned} 人次</div>
                  )}
                </div>
                <Icon name={isOpen ? 'chevD' : 'chevR'} size={20} style={{ color: 'var(--ink-3)' }} />
              </div>
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--line)' }} className="fade">
                  {mode === 'all' ? (
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 11 }}>整场报名成员 ({totalSigned}) · 参与全部 {eps.length} 期</div>
                      <Avatars count={totalSigned} title={`${first.series || first.title} · 整场报名成员 (${totalSigned})`} />
                    </div>
                  ) : (
                    eps.map((ep, ei) => {
                      const epOpen = sessionOpen[ep.id];
                      return (
                        <div key={ep.id} style={{ borderTop: ei ? '1px solid var(--line)' : 'none' }}>
                          <div onClick={() => toggleSession(ep.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, ...SESSION_IDX_STYLE }}>{ep.seriesIdx || ei + 1}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13.5, fontWeight: 600 }} className="clamp1">{ep.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{ActWhen.full(ep)}{ActWhen.daysBadge(ep) ? ` · ${ActWhen.daysBadge(ep)}` : ''}</div>
                            </div>
                            <div style={{ width: 110 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                                <span>{ep.signed}/{ep.cap}</span><span style={{ color: 'var(--ink-3)' }}>{Math.round(ep.signed / ep.cap * 100)}%</span>
                              </div>
                              <ProgressBar value={ep.signed} max={ep.cap} color={SIGNUP_BAR} height={5} />
                            </div>
                            <Icon name={epOpen ? 'chevD' : 'chevR'} size={18} style={{ color: 'var(--ink-3)' }} />
                          </div>
                          {epOpen && (
                            <div style={{ padding: '0 16px 14px 54px' }} className="fade">
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
      <SignupMembersModal open={!!memberModal} onClose={() => setMemberModal(null)}
        count={memberModal ? memberModal.count : 0} title={memberModal ? memberModal.title : ''} />
    </div>
  );
}

const COMMENTS_PAGE = 5;

function CommentsView({ acts, inline }) {
  const { store, actions } = useA();
  const [page, setPage] = React.useState(1);
  const aids = acts.map(a => a.id);
  const comments = (store.comments || []).filter(c => aids.includes(c.aid));
  if (!comments.length) return <Empty text="暂无评论" />;

  const total = comments.length;
  // inline mode (inside act detail card): paginate; standalone (global comments section): show all
  const shown = inline ? comments.slice(0, page * COMMENTS_PAGE) : comments;
  const hasMore = inline && shown.length < total;
  const hiddenCount = total - shown.length;

  const CommentRow = ({ c, i }) => {
    const a = store.acts.find(x => x.id === c.aid);
    return (
      <div key={c.id} style={{ display: 'flex', gap: 13, padding: 18, borderTop: i ? '1px solid var(--line)' : 'none' }}>
        {c.isAI
          ? <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ai-grad)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} color="#fff" /></div>
          : <Avatar name={c.author} size={40} />}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: c.isAI ? 'var(--ai)' : 'var(--ink)' }}>{c.author}</span>
            {c.isAI && <AIPill />}<span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{c.time}</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.55, margin: '5px 0 7px' }}>{c.text}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 14 }}>
            {a && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name={CATS[a.cat].icon} size={13} style={{ color: CATS[a.cat].color }} />{a.title}</span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={13} />{c.likes}</span>
          </div>
        </div>
        <button type="button" title="删除" onClick={() => { if (confirm('确认删除该评论？')) { actions.delComment(c.id); toast('评论已删除', { icon: 'trash' }); } }}
          style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'oklch(0.55 0.2 25)', flexShrink: 0, alignSelf: 'flex-start' }}>
          <Icon name="trash" size={16} />
        </button>
      </div>
    );
  };

  return (
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
      {inline && !hasMore && total > COMMENTS_PAGE && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '14px 18px', display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={() => setPage(1)}
            style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="chevU" size={15} />收起
          </button>
        </div>
      )}
    </div>
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
              <Icon name={CATS[act.cat].icon} size={18} style={{ color: CATS[act.cat].color }} />
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

function MomentsGrid({ moms, navBack }) {
  const [detail, setDetail] = React.useState(null);
  const [imgLb, setImgLb] = React.useState({ open: false, seeds: [], i: 0 });
  if (!moms.length) return <Empty text="暂无精彩瞬间" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ borderRadius: 16, padding: 2, background: 'var(--ai-grad)' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
          <Sparkles size={22} color="var(--ai)" />
          <div style={{ flex: 1, fontSize: 13.5, color: 'var(--ink-2)' }}><b style={{ color: 'var(--ink)' }}>AI 汇总:</b> 共 {moms.length} 条精彩瞬间,累计 {moms.reduce((s, m) => s + m.likes, 0)} 个赞,情绪积极。已自动同步至各活动详情页与小组圈。</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 16 }}>
        {moms.map(m => {
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
                {a && <div style={{ marginTop: 9, fontSize: 11.5, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name={CATS[a.cat].icon} size={13} style={{ color: CATS[a.cat].color }} />{a.title}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <MomentDetailModal open={!!detail} moment={detail} onClose={() => setDetail(null)} navBack={navBack} />
      <PhotoLightbox open={imgLb.open} seeds={imgLb.seeds} index={imgLb.i} onClose={() => setImgLb({ open: false, seeds: [], i: 0 })} />
    </div>
  );
}

function ActivitiesSection() {
  const { store, openActForm, setView } = useA();
  const [type, setType] = React.useState('all');
  const list = type === 'all' ? store.acts : store.acts.filter(a => a.type === type);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title="活动管理" sub="支持单次、周期性、指定时间的系列活动"
        right={<><Btn variant="ai" icon="spark" onClick={useAOpen}>AI 策划</Btn><Btn variant="primary" icon="plus" onClick={() => openActForm(null)}>新建活动</Btn></>} />
      <div style={{ padding: 28 }}>
        <div style={{ marginBottom: 18 }}><Segmented value={type} onChange={setType}
          options={[{ value: 'all', label: '全部' }, { value: 'once', label: '单次', icon: 'calendar' }, { value: 'recurring', label: '周期性', icon: 'repeat' }, { value: 'series', label: '系列', icon: 'series' }]} /></div>
        <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <ActTable acts={list} onRow={(a) => setView({ section: 'actDetail', aid: a.id, back: { section: 'activities' } })} />
        </div>
      </div>
    </div>
  );
}

function GlobalSection({ section }) {
  const { store } = useA();
  const titles = {
    signups: ['报名管理', '查看与审核所有活动的报名情况'],
    comments: ['评论&互动', '查看活动下的员工评论,可删除不当内容'],
    moments: ['精彩瞬间', '成员在活动后分享的高光时刻,自动同步至小组圈'],
  };
  const [t, sub] = titles[section];
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title={t} sub={sub} />
      <div style={{ padding: 28 }}>
        {section === 'signups' && <SignupsView acts={store.acts.filter(a => a.status === 'upcoming')} />}
        {section === 'comments' && <CommentsView acts={store.acts} />}
        {section === 'moments' && <MomentsGrid moms={DB.moments} navBack={{ section: 'moments' }} />}
      </div>
    </div>
  );
}

// ---------- group form ----------
function GroupForm({ open, onClose, onSave, init }) {
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
  React.useEffect(() => { if (open) setF(init ? { ...init, tags: (init.tags || []).join(' / ') } : blank); }, [open, init]);
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
  return (
    <Modal open={open} onClose={onClose} title={init ? '编辑小组' : '新建兴趣小组'} width={580}>
      <div style={{ padding: 24 }}>
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
              {Object.values(CATS).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></Field></div>
          <div style={{ flex: 1 }}><Field label="组长" hint="搜索公司员工姓名、工号或部门">
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
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>取消</Btn>
          {(() => { const ok = f.name.trim() && (init || f.cover); return (
          <Btn variant="primary" icon="check" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }}
            onClick={() => { onSave({ ...f, tags: f.tags.split('/').map(s => s.trim()).filter(Boolean) }); onClose(); }}>{init ? '保存修改' : '创建小组'}</Btn>
          ); })()}
        </div>
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
  const labels = WEEKDAYS.filter(w => (f.repeatWeekdays || []).includes(w.v)).map(w => w.label);
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
function parseDateCN(str) {
  const m = str && str.match(/(\d{1,2})月(\d{1,2})日/);
  if (!m) return '';
  return `${new Date().getFullYear()}-${pad2(+m[1])}-${pad2(+m[2])}`;
}
function parseTimeRange(str) {
  const parts = (str || '').split(/\s*-\s*/).map(s => s.trim()).filter(Boolean);
  return { start: parts[0] || '', end: parts[1] || parts[0] || '' };
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
  // 周期：结束时间落在开始日后第 spanDays 天 → 推算结束星期标签
  let recEndDate;
  if (f.type === 'recurring' && f.spanDays > 0) {
    const wd = (f.repeatWeekdays || []).slice().sort((a, b) => a - b)[0];
    if (wd != null) recEndDate = CN_WEEK[(wd + f.spanDays) % 7];
  }
  return {
    ...f,
    date: formatDateCN(f.dateValue),
    endDate: f.type === 'recurring' ? recEndDate : crossEnd(f.dateValue, f.endDateValue),
    spanDays: f.type === 'recurring' ? (f.spanDays || 0) : undefined,
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

function TimeRangePicker({ start, end, onChange, style }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', ...style }}>
      <input type="time" value={start || ''} onChange={e => onChange(e.target.value, end)}
        style={{ ...inputStyle, flex: 1, colorScheme: 'light' }} />
      <span style={{ fontSize: 13, color: 'var(--ink-3)', flexShrink: 0 }}>至</span>
      <input type="time" value={end || ''} onChange={e => onChange(start, e.target.value)}
        style={{ ...inputStyle, flex: 1, colorScheme: 'light' }} />
    </div>
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
    if (f.repeatMode === 'monthly') return (f.repeatWeekdays || []).length > 0;
    return (f.repeatWeekdays || []).length > 0;
  }
  if (f.type === 'series') {
    return (f.sessions || []).length > 0 && f.sessions.every(s => s.dateValue && s.timeStart && !(s.endDateValue && s.endDateValue < s.dateValue));
  }
  return true;
}

function ActForm({ open, onClose, onSave, store, gidInit, initAct }) {
  const editing = !!initAct;
  const blank = normalizeActForm({
    title: '', gid: gidInit || 'g1', cat: 'sport', type: 'once',
    dateValue: isoToday(), endDateValue: '', spanDays: 0, timeStart: '19:00', timeEnd: '21:00',
    loc: '', cap: 20, desc: '', cover: '',
    repeatMode: 'weekly', repeatWeekdays: [3, 5], repeatMonthDays: [8],
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
    if (!open) return;
    setDescGenning(false);
    if (editing) { applyForm({ ...blank, ...initAct }); return; }
    applyForm({ ...blank, gid: gidInit || 'g1' });
  }, [open, gidInit, editing]);
  return (
    <Modal open={open} onClose={onClose} title={editing ? '编辑活动' : '新建活动'} width={580}>
      <div style={{ padding: 24 }}>

        {!editing && (
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
                {Object.values(CATS).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
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
                <Field label="重复规则"><div style={{ ...inputStyle, background: 'var(--bg)', color: 'var(--ink-2)' }}>{initAct.date}</div></Field>
                <Field label="时间"><TimeRangePicker start={f.timeStart} end={f.timeEnd} onChange={(a, b) => setF({ ...f, timeStart: a, timeEnd: b })} /></Field>
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
              <Segmented value={f.type} onChange={v => setF({ ...f, type: v })} style={{ width: '100%' }}
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
                <Field label="重复规则" hint="选择每周重复的具体日期">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {WEEKDAYS.map(d => {
                      const on = (f.repeatWeekdays || []).includes(d.v);
                      return (
                        <button key={d.v} type="button" onClick={() => setF(s => ({
                          ...s, repeatMode: 'weekly', repeatWeekdays: on ? s.repeatWeekdays.filter(x => x !== d.v) : [...(s.repeatWeekdays || []), d.v].sort((a, b) => a - b),
                        }))} style={{ minWidth: 44, height: 34, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          background: on ? 'var(--brand-tint)' : 'var(--bg)', color: on ? 'var(--brand-600)' : 'var(--ink-2)',
                          border: on ? '1.5px solid var(--brand)' : '1.5px solid var(--line-2)' }}>{d.label}</button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="时间" hint="周期性活动无需选择具体日期">
                  <TimeRangePicker start={f.timeStart} end={f.timeEnd} onChange={(a, b) => setF({ ...f, timeStart: a, timeEnd: b })} />
                </Field>
                <Field label="结束于" hint={f.spanDays > 0 ? '通宵/跨天场，结束时间落在开始日的次日' : '当天结束'}>
                  <Segmented value={String(f.spanDays || 0)} onChange={v => setF({ ...f, spanDays: +v })} style={{ width: '100%' }}
                    options={[{ value: '0', label: '当天结束' }, { value: '1', label: '次日结束' }, { value: '2', label: '第 3 天结束' }]} />
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
        </Field>

        {/* footer */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>取消</Btn>
          {(() => { const ok = actFormReady(f, editing); return (
          <Btn variant="primary" icon="check" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={() => { onSave({ ...actFormPayload(f), id: editing ? initAct.id : undefined }); onClose(); }}>{editing ? '保存修改' : '发布活动'}</Btn>
          ); })()}
        </div>
      </div>
    </Modal>
  );
}

// ============ ADMIN APP SHELL ============
function AdminApp() {
  const [groups, setGroups] = React.useState(() => DB.groups.map(g => ({ ...g })));
  const [acts, setActs] = React.useState(() => DB.acts.map(a => ({ ...a })));
  const [joinRequests, setJoinRequests] = React.useState(() => (DB.joinRequests || []).map(r => ({ ...r })));
  const [comments, setComments] = React.useState(() => DB.comments.map(c => ({ ...c })));
  const [view, setView] = React.useState({ section: 'dashboard' });
  const [aiOpen, setAiOpen] = React.useState(false);
  const [groupForm, setGroupForm] = React.useState({ open: false, init: null });
  const [actForm, setActForm] = React.useState({ open: false, gid: null, init: null });

  React.useEffect(() => {
    const h = () => setAiOpen(true);
    window.addEventListener('open-ai-composer', h);
    return () => window.removeEventListener('open-ai-composer', h);
  }, []);

  const actions = {
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
          ...base, id: 'a' + ts + '_' + i, type: 'series', title: total > 1 ? `${d.title} · 第 ${i + 1} 期` : d.title,
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
          date: formatRepeatDate(d), time: d.time,
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
        time: d.time, host: g ? g.lead : x.host, ...(x.type === 'recurring' ? {} : { date: d.date }),
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
  const store = { groups, acts, joinRequests, comments };
  const ctx = { view, setView, store, actions,
    openGroupForm: (init) => setGroupForm({ open: true, init }),
    openActForm: (gid, init) => setActForm({ open: true, gid, init: init || null }) };

  const render = () => {
    switch (view.section) {
      case 'dashboard': return <Dashboard />;
      case 'groups': return <GroupsSection />;
      case 'groupDetail': return <AdminGroupDetail gid={view.gid} />;
      case 'actDetail': return <AdminActDetail aid={view.aid} back={view.back} />;
      case 'activities': return <ActivitiesSection />;
      case 'signups': case 'comments': case 'moments': return <GlobalSection section={view.section} />;
      default: return <Dashboard />;
    }
  };

  return (
    <AdminCtx.Provider value={ctx}>
      <div style={{ display: 'flex', height: '100%', position: 'relative', fontFamily: 'var(--font)', color: 'var(--ink)' }}>
        <Sidebar />
        {render()}
        <AIComposer open={aiOpen} onClose={() => setAiOpen(false)} store={store} onPublish={(d) => actions.addAct(d, true)} />
        <GroupForm open={groupForm.open} init={groupForm.init} onClose={() => setGroupForm({ open: false, init: null })} onSave={actions.saveGroup} />
        <ActForm open={actForm.open} gidInit={actForm.gid} initAct={actForm.init} store={store} onClose={() => setActForm({ open: false, gid: null, init: null })} onSave={(d) => actForm.init ? actions.updateAct(d) : actions.addAct(d, false)} />
        <ToastHost />
      </div>
    </AdminCtx.Provider>
  );
}

Object.assign(window, { SignupsView, CommentsView, MomentsGrid, MomentDetailModal, ActivitiesSection, GlobalSection, GroupForm, ActForm, AdminApp, SignupMembersModal, signupMemberNames });

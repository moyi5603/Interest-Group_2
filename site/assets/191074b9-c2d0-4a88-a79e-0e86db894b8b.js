// admin-sections.jsx — signups, comments, moments views, activities section, forms, AdminApp shell.

const SIGNUP_BAR = 'var(--brand)';
const MODE_TAG_STYLE = { background: 'var(--surface-2)', color: 'var(--ink-2)' };
const SESSION_IDX_STYLE = { background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' };

function SignupsView({ acts }) {
  const { store } = useA();

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

  const Avatars = ({ count }) => {
    const names = DB.NAMES.slice(0, Math.min(count, 12));
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        {names.map(m => (
          <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px 6px 6px', borderRadius: 99, background: 'var(--surface-2)' }}>
            <Avatar name={m} size={26} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{m}</span>
          </div>
        ))}
        {count > 12 && <span style={{ padding: '8px 12px', fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>+{count - 12} 人</span>}
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
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>{g ? g.name : ''} · {a.date} · {a.time}</div>
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
                  <Avatars count={a.signed} />
                </div>
              )}
            </div>
          );
        }

        if (unit.kind === 'recurring') {
          const a = unit.act;
          const g = store.groups.find(x => x.id === a.gid);
          const sessions = a.sessions || [];
          return (
            <div key={unit.key} style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div onClick={() => setOpen(isOpen ? null : unit.key)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }} className="clamp1">{a.title}</span>
                    <TypeTag type={a.type} />
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>{g ? g.name : ''} · {a.date} · 共 {sessions.length} 个场次 · 各期独立报名</div>
                </div>
                <div style={{ width: 130, fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>各期独立</div>
                <Icon name={isOpen ? 'chevD' : 'chevR'} size={20} style={{ color: 'var(--ink-3)' }} />
              </div>
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--line)' }} className="fade">
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
                            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.date}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.time}</div>
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
                            <Avatars count={s.signed} />
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                      <Avatars count={totalSigned} />
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
                              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{ep.date} · {ep.time}</div>
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
                              <Avatars count={ep.signed} />
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
    </div>
  );
}

function CommentsView({ acts }) {
  const { store } = useA();
  const aids = acts.map(a => a.id);
  const comments = DB.comments.filter(c => aids.includes(c.aid));
  if (!comments.length) return <Empty text="暂无评论" />;
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 18, boxShadow: 'var(--shadow-sm)' }}>
      {comments.map((c, i) => {
        const a = store.acts.find(x => x.id === c.aid);
        return (
          <div key={c.id} style={{ display: 'flex', gap: 13, padding: 18, borderTop: i ? '1px solid var(--line)' : 'none' }}>
            {c.isAI ? <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ai-grad)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} color="#fff" /></div> : <Avatar name={c.author} size={40} />}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: c.isAI ? 'var(--ai)' : 'var(--ink)' }}>{c.author}</span>
                {c.isAI && <AIPill />}<span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, margin: '5px 0 7px' }}>{c.text}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name={CATS[a.cat].icon} size={13} style={{ color: CATS[a.cat].color }} />{a.title}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={13} />{c.likes}</span>
              </div>
            </div>
            <button onClick={() => toast('已隐藏该评论')} style={{ color: 'var(--ink-3)', alignSelf: 'flex-start' }}><Icon name="dots" size={20} /></button>
          </div>
        );
      })}
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
  const titles = { signups: ['报名管理', '查看与审核所有活动的报名情况'], moments: ['精彩瞬间', '成员在活动后分享的高光时刻,自动同步至小组圈'] };
  const [t, sub] = titles[section];
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} className="noscroll">
      <Topbar title={t} sub={sub} />
      <div style={{ padding: 28 }}>
        {section === 'signups' && <SignupsView acts={store.acts.filter(a => a.status === 'upcoming')} />}
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
        <Field label="封面图" hint="必填 · 支持 JPG / PNG">
          <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickCover} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--line-2)', background: 'var(--bg)' }}>
            <div style={{ width: 96, height: 54, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: f.cover ? 'none' : '1.5px dashed var(--line-2)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {f.cover
                ? <img src={f.cover} alt="封面预览" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <Icon name="image" size={22} stroke={1.8} style={{ color: 'var(--ink-3)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 2 }}>{f.cover ? '已选择封面' : '尚未上传封面'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>JPG / PNG</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Btn variant="ghost" size="sm" icon="image" type="button" onClick={() => coverRef.current && coverRef.current.click()}>{f.cover ? '更换' : '上传'}</Btn>
              {f.cover && <Btn variant="danger" size="sm" icon="trash" type="button" onClick={() => setF(s => ({ ...s, cover: '' }))} />}
            </div>
          </div>
        </Field>
        <Field label="小组名称"><TextInput value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="例如:城市夜跑团" /></Field>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}><Field label="分类">
            <select value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })} style={{ ...inputStyle }}>
              {Object.values(CATS).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></Field></div>
          <div style={{ flex: 1 }}><Field label="组长"><TextInput value={f.lead} onChange={e => setF({ ...f, lead: e.target.value })} /></Field></div>
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
      <div style={{ position: 'relative', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        <div ref={ref} contentEditable suppressContentEditableWarning onInput={sync} className="richtext"
          style={{ minHeight: 110, maxHeight: 240, overflowY: 'auto', padding: '11px 13px', fontSize: 14, lineHeight: 1.7, outline: 'none', color: 'var(--ink)' }} />
        {empty && <div style={{ position: 'absolute', top: 11, left: 13, fontSize: 14, color: 'var(--ink-3)', pointerEvents: 'none' }}>{placeholder}</div>}
      </div>
    </div>
  );
}

// ---------- activity form (manual) ----------
const ACT_DRAFT_KEY = 'ig:admin:actDraft';
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
  if (!f.timeStart && f.time) { const t = parseTimeRange(f.time); f.timeStart = t.start; f.timeEnd = t.end; }
  if (f.sessions) {
    f.sessions = f.sessions.map(s => {
      const x = { ...s };
      if (!x.dateValue && x.date) x.dateValue = parseDateCN(x.date);
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
  return {
    ...f,
    date: formatDateCN(f.dateValue),
    time: formatTimeRange(f.timeStart, f.timeEnd),
    sessions: (f.sessions || []).map(s => ({
      ...s, date: formatDateCN(s.dateValue), time: formatTimeRange(s.timeStart, s.timeEnd),
    })),
    signupDeadline: deadlineSummary,
    deadlineMode: f.deadlineMode,
    deadlineHours: f.deadlineMode === 'hours_before' ? f.deadlineHours : undefined,
  };
}

function DatePicker({ value, onChange, style }) {
  return (
    <input type="date" value={value || ''} onChange={e => onChange(e.target.value)}
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

function actHasContent(x) {
  if (!x) return false;
  const descText = (x.desc || '').replace(/<[^>]*>/g, '').trim();
  return !!((x.title && x.title.trim()) || x.cover || descText || (x.loc && x.loc.trim())
    || (x.sessions && x.sessions.some(s => s.date || s.time)) || (x.repeatWeekdays && x.repeatWeekdays.length));
}

function actFormReady(f, editing) {
  if (editing) {
    if (!f.title.trim()) return false;
    if (!f.timeStart) return false;
    return f.type === 'recurring' ? true : !!f.dateValue;
  }
  if (!f.title.trim() || !f.cover) return false;
  if (f.type === 'once') return !!(f.dateValue && f.timeStart);
  if (f.type === 'recurring') {
    if (!f.timeStart) return false;
    if (f.repeatMode === 'monthly') return (f.repeatWeekdays || []).length > 0;
    return (f.repeatWeekdays || []).length > 0;
  }
  if (f.type === 'series') {
    return (f.sessions || []).length > 0 && f.sessions.every(s => s.dateValue && s.timeStart);
  }
  return true;
}

function ActForm({ open, onClose, onSave, store, gidInit, initAct }) {
  const editing = !!initAct;
  const blank = normalizeActForm({
    title: '', gid: gidInit || 'g1', cat: 'sport', type: 'once',
    dateValue: isoToday(), timeStart: '19:00', timeEnd: '21:00',
    loc: '', cap: 20, desc: '', cover: '',
    repeatMode: 'weekly', repeatWeekdays: [3, 5], repeatMonthDays: [8],
    sessions: [{ dateValue: '2026-06-15', timeStart: '04:30', timeEnd: '14:00' }],
    seriesSignupMode: 'independent',
    deadlineMode: 'none', deadlineDate: '', deadlineTime: '18:00', deadlineHours: 2,
  });
  const [f, setF] = React.useState(blank);
  const [editorKey, setEditorKey] = React.useState(0);
  const [draft, setDraft] = React.useState(null);
  const coverRef = React.useRef(null);
  const applyForm = (next) => { setF(normalizeActForm(next)); setEditorKey(k => k + 1); };
  const pickCover = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setF(s => ({ ...s, cover: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const clearDraft = () => { try { localStorage.removeItem(ACT_DRAFT_KEY); } catch (e) {} setDraft(null); };
  React.useEffect(() => {
    if (!open) return;
    if (editing) { applyForm({ ...blank, ...initAct }); setDraft(null); return; }
    applyForm({ ...blank, gid: gidInit || 'g1' });
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(ACT_DRAFT_KEY) || 'null'); } catch (e) {}
    setDraft(actHasContent(saved) ? saved : null);
  }, [open, gidInit, editing]);
  React.useEffect(() => {
    if (!open || editing || !actHasContent(f)) return;
    try { localStorage.setItem(ACT_DRAFT_KEY, JSON.stringify(f)); } catch (e) {}
  }, [f, open, editing]);
  const g = store.groups.find(x => x.id === f.gid);
  const SecHead = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 6px' }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
  const InlineFieldPair = ({ items }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
      <div style={{ width: 88, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', gap: 10, minWidth: 0 }}>
        {items.map((item, i) => (
          <div key={i} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', flexShrink: 0, whiteSpace: 'nowrap', paddingTop: 9 }}>{item.label}</span>
            <div style={{ flex: 1, minWidth: 0 }}>{item.children}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={editing ? '编辑活动' : '新建活动'} width={680}>
      <div style={{ padding: '4px 20px 20px' }}>

        {/* AI hint / draft restore */}
        {!editing && (
          <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--ai-soft)', margin: '16px 0 4px', alignItems: 'center' }}>
            <Sparkles size={18} color="var(--ai)" />
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-2)' }}>不想手动填？试试用一句话让 AI 生成完整方案</span>
            <Btn variant="ai" size="sm" icon="spark" onClick={() => { onClose(); useAOpen(); }}>AI 策划</Btn>
          </div>
        )}
        {!editing && draft && (
          <div style={{ display: 'flex', gap: 11, padding: '11px 13px', borderRadius: 12, background: 'var(--sun-soft)', margin: '10px 0 0', alignItems: 'center', border: '1px solid color-mix(in oklch, oklch(0.8 0.13 70) 30%, transparent)' }}>
            <Icon name="clock" size={18} style={{ color: 'oklch(0.55 0.13 70)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>发现未发布的活动草稿</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }} className="clamp1">{draft.title ? `「${draft.title}」` : '上次编辑的内容'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Btn variant="ghost" size="sm" onClick={clearDraft}>放弃</Btn>
              <Btn variant="primary" size="sm" icon="repeat" onClick={() => { applyForm({ ...blank, ...normalizeActForm(draft), gid: draft.gid || gidInit || 'g1' }); setDraft(null); }}>恢复</Btn>
            </div>
          </div>
        )}

        {/* ── 基本信息 ── */}
        <SecHead label="基本信息" />
        <Field label={editing ? '封面图' : '封面图 *'} inline>
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
        <Field label="活动标题" inline>
          <TextInput value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="例如:滨江 8K 夜跑" />
        </Field>
        <InlineFieldPair items={[
          { label: '所属小组', children: (
            <select value={f.gid} onChange={e => { const ng = store.groups.find(x => x.id === e.target.value); setF({ ...f, gid: e.target.value, cat: ng ? ng.cat : f.cat }); }} style={inputStyle}>
              {store.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          ) },
          { label: '分类', children: (
            <select value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })} style={inputStyle}>
              {Object.values(CATS).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          ) },
        ]} />

        {/* ── 时间安排 ── */}
        <SecHead label="时间安排" />
        {editing ? (
          <>
            <Field label="活动类型" inline>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 2 }}><TypeTag type={f.type} /><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>活动类型创建后不可更改</span></div>
            </Field>
            {f.type === 'recurring' ? (
              <>
                <Field label="重复规则" inline><div style={{ ...inputStyle, background: 'var(--bg)', color: 'var(--ink-2)' }}>{initAct.date}</div></Field>
                <Field label="时间" inline><TimeRangePicker start={f.timeStart} end={f.timeEnd} onChange={(a, b) => setF({ ...f, timeStart: a, timeEnd: b })} /></Field>
              </>
            ) : (
              <InlineFieldPair items={[
                { label: '日期', children: <DatePicker value={f.dateValue} onChange={v => setF({ ...f, dateValue: v })} /> },
                { label: '时间', children: <TimeRangePicker start={f.timeStart} end={f.timeEnd} onChange={(a, b) => setF({ ...f, timeStart: a, timeEnd: b })} /> },
              ]} />
            )}
          </>
        ) : (
          <>
            <Field label="活动类型" inline>
              <Segmented value={f.type} onChange={v => setF({ ...f, type: v })} style={{ width: '100%' }}
                options={[{ value: 'once', label: '单次', icon: 'calendar' }, { value: 'recurring', label: '周期性', icon: 'repeat' }, { value: 'series', label: '系列', icon: 'series' }]} />
            </Field>
            {f.type === 'once' && (
              <InlineFieldPair items={[
                { label: '日期', children: <DatePicker value={f.dateValue} onChange={v => setF({ ...f, dateValue: v })} /> },
                { label: '时间', children: <TimeRangePicker start={f.timeStart} end={f.timeEnd} onChange={(a, b) => setF({ ...f, timeStart: a, timeEnd: b })} /> },
              ]} />
            )}
            {f.type === 'recurring' && (
              <>
                <Field label="重复规则" inline hint="选择每周重复的具体日期">
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
                <Field label="时间" inline hint="周期性活动无需选择具体日期">
                  <TimeRangePicker start={f.timeStart} end={f.timeEnd} onChange={(a, b) => setF({ ...f, timeStart: a, timeEnd: b })} />
                </Field>
              </>
            )}
            {f.type === 'series' && (
              <>
                <Field label="报名方式" inline>
                  <Segmented value={f.seriesSignupMode || 'independent'} onChange={v => setF({ ...f, seriesSignupMode: v })}
                    options={[{ value: 'independent', label: '按场次报名', desc: '用户可独立选择参加每一场' }, { value: 'all', label: '整场报名', desc: '报名截止后不可中途加入' }]} />
                </Field>
                <Field label="场次安排" inline hint="每期可单独设置日期与时间">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(f.sessions || []).map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ width: 22, fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                        <DatePicker value={s.dateValue} onChange={v => setF(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, dateValue: v } : x) }))} style={{ flex: 1, minWidth: 0 }} />
                        <TimeRangePicker start={s.timeStart} end={s.timeEnd}
                          onChange={(a, b) => setF(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, timeStart: a, timeEnd: b } : x) }))} style={{ flex: 1.2, minWidth: 0 }} />
                        {(f.sessions || []).length > 1 && (
                          <button type="button" onClick={() => setF(st => ({ ...st, sessions: st.sessions.filter((_, j) => j !== i) }))}
                            style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(0.55 0.2 25)', flexShrink: 0 }}>
                            <Icon name="trash" size={16} /></button>
                        )}
                      </div>
                    ))}
                    <Btn variant="ghost" size="sm" icon="plus" type="button" onClick={() => setF(st => ({
                      ...st, sessions: [...(st.sessions || []), { dateValue: isoToday(), timeStart: '19:00', timeEnd: '21:00' }],
                    }))}>添加场次</Btn>
                  </div>
                </Field>
              </>
            )}
          </>
        )}

        {/* ── 报名设置 ── */}
        <SecHead label="报名设置" />
        <Field label="报名截止" inline hint={f.deadlineMode === 'fixed' ? '到达指定时间后不可报名' : f.deadlineMode === 'hours_before' ? '距活动开始不足 N 小时后不可报名' : '不设截止，活动开始前均可报名'}>
          <DeadlinePicker mode={f.deadlineMode || 'none'} date={f.deadlineDate || ''} time={f.deadlineTime || '18:00'} hours={f.deadlineHours || 2}
            onChange={({ mode, date, time, hours }) => setF(s => ({ ...s, deadlineMode: mode, deadlineDate: date, deadlineTime: time, deadlineHours: hours }))} />
        </Field>
        <InlineFieldPair items={[
          { label: '地点', children: <TextInput value={f.loc} onChange={e => setF({ ...f, loc: e.target.value })} placeholder="集合地点" /> },
          { label: '人数上限', children: <TextInput type="number" value={f.cap} onChange={e => setF({ ...f, cap: +e.target.value })} /> },
        ]} />

        {/* ── 活动介绍 ── */}
        <SecHead label="活动介绍" />
        <Field label="" hint="支持加粗、字体颜色、有序/无序列表与插入图片">
          <RichText key={editorKey} value={f.desc} onChange={html => setF(s => ({ ...s, desc: html }))} placeholder="活动安排、注意事项…(可插入图片)" />
        </Field>

        {/* footer */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
          {!editing && actHasContent(f) && <span style={{ marginRight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-3)' }}><Icon name="check" size={14} stroke={2.6} />内容已自动暂存</span>}
          <Btn variant="ghost" onClick={onClose}>取消</Btn>
          {(() => { const ok = actFormReady(f, editing); return (
          <Btn variant="primary" icon="check" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={() => { if (!editing) clearDraft(); onSave({ ...actFormPayload(f), id: editing ? initAct.id : undefined }); onClose(); }}>{editing ? '保存修改' : '发布活动'}</Btn>
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
    delAct: (id) => { setActs(s => s.filter(x => x.id !== id)); toast('活动已删除', { icon: 'trash' }); },
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
      toast(`已通过 ${req.name} 加入「${g ? g.name : '小组'}」`, { icon: 'check' });
    },
    rejectJoin: (id) => {
      const req = joinRequests.find(r => r.id === id && r.status === 'pending');
      if (!req) return;
      setJoinRequests(s => s.filter(r => r.id !== id));
      toast(`已拒绝 ${req.name} 的加入申请`, { icon: 'x' });
    },
  };
  const store = { groups, acts, joinRequests };
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
      case 'signups': case 'moments': return <GlobalSection section={view.section} />;
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

Object.assign(window, { SignupsView, CommentsView, MomentsGrid, MomentDetailModal, ActivitiesSection, GlobalSection, GroupForm, ActForm, AdminApp });

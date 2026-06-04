// mobile.jsx — employee app shell: store, nav, home tab, moments, post, lists.

function ScreenScroll({ children, insetBottom = 0 }) {
  return <div className="noscroll" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: insetBottom, overflowY: 'auto', background: 'var(--bg)' }}>{children}</div>;
}

function PostMomentPhotos({ imgs, onChange }) {
  const [lb, setLb] = React.useState({ open: false, i: 0 });
  const MAX = 9;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>
          照片 <span style={{ color: imgs.length >= MAX ? 'var(--brand)' : 'var(--ink-2)' }}>{imgs.length}/{MAX}</span>
        </span>
        {imgs.length >= MAX && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>已达上限</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {imgs.map((s, i) => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', cursor: 'pointer' }} onClick={() => setLb({ open: true, i })}>
              <Photo seed={s} label="照片" />
            </div>
            <button type="button" onClick={() => onChange(imgs.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 5, right: 5, width: 24, height: 24,
              borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={15} /></button>
          </div>
        ))}
        {imgs.length < MAX && (
          <button type="button" onClick={() => onChange([...imgs, 'add' + imgs.length])} style={{ aspectRatio: '1', borderRadius: 14, border: '2px dashed var(--line-2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--ink-3)' }}>
            <Icon name="camera" size={24} /><span style={{ fontSize: 11.5 }}>添加照片</span></button>
        )}
      </div>
      <PhotoLightbox open={lb.open} seeds={imgs} index={lb.i} onClose={() => setLb({ open: false, i: 0 })} />
    </>
  );
}

function HomeMomentStripItem({ m, onOpenFeed }) {
  const [lb, setLb] = React.useState({ open: false, i: 0 });
  return (
    <div style={{ width: 132, flexShrink: 0 }}>
      <div style={{ height: 132, borderRadius: 18, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
        onClick={e => { e.stopPropagation(); setLb({ open: true, i: 0 }); }}>
        <Photo seed={m.imgs[0]} label="精彩瞬间" dim />
        <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Avatar name={m.author} size={20} /><span style={{ fontSize: 11.5, fontWeight: 700 }} className="clamp1">{m.author}</span>
        </div>
      </div>
      <div onClick={onOpenFeed} style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 6, cursor: 'pointer' }} className="clamp2">{m.text}</div>
      <PhotoLightbox open={lb.open} seeds={m.imgs} index={lb.i} onClose={() => setLb({ open: false, i: 0 })} />
    </div>
  );
}

// ---------- HOME TAB ----------
function HomeTab() {
  const { nav, store } = useM();
  const upcoming = store.acts.filter(a => a.status === 'upcoming');
  // 热门小组：运营 hot 置顶，其余按成员数、累计活动数降序，首页横滑最多 5 条
  const hotGroups = [...store.groups]
    .sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || (b.members - a.members) || (b.acts - a.acts))
    .slice(0, 5);
  const recentMoments = DB.moments.slice(0, 4);

  const recs = [
    { aid: 'a1', reason: '因为你常参加「城市夜跑团」' },
    { aid: 'a5', reason: '同部门 6 位同学已报名' },
    { aid: 'a3', reason: '午休时段 · 离你工位 2 分钟' },
  ];

  // ---- 活动 Tab：推荐 / 最新 / 热门 ----
  const [actTab, setActTab] = React.useState('rec');
  const dateKey = (a) => {
    const m = (a.date || '').match(/(\d+)月(\d+)日/);
    return m ? parseInt(m[1], 10) * 100 + parseInt(m[2], 10) : 9999;
  };
  const recItems = recs.map(r => ({ a: store.acts.find(x => x.id === r.aid), reason: r.reason })).filter(x => x.a);
  const latestActs = [...upcoming].sort((x, y) => dateKey(x) - dateKey(y)).slice(0, 3);
  const hotActs = [...upcoming].sort((x, y) => (y.likes - x.likes) || (y.signed - x.signed)).slice(0, 3);
  const actTabs = [
    { key: 'rec', label: '推荐' },
    { key: 'latest', label: '最新' },
    { key: 'hot', label: '热门' },
  ];

  return (
    <ScreenScroll insetBottom={74}>
      {/* AI natural language entry */}
      <div style={{ padding: '18px 16px 4px' }}>
        <div onClick={() => nav.go('aichat')} style={{ borderRadius: 18, padding: 2, background: 'var(--ai-grad)', cursor: 'pointer', boxShadow: '0 10px 24px oklch(0.66 0.21 4 / 0.22)' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 11 }}>
            <Sparkles size={22} color="var(--ai)" style={{ animation: 'sparkle 2.4s infinite' }} />
            <span style={{ flex: 1, fontSize: 14.5, color: 'var(--ink-3)', fontWeight: 500 }}>推荐小组、查询活动…</span>
            <div style={{ padding: '7px 12px', borderRadius: 11, background: 'var(--ai-grad)', color: '#fff', fontSize: 12.5, fontWeight: 700, display: 'flex', gap: 4, alignItems: 'center' }}>
              <Icon name="mic" size={15} stroke={2.4} />问</div>
          </div>
        </div>
        <div className="noscroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginTop: 10 }}>
          {['周末的羽毛球活动', '适合新人的小组', '本周还有什么活动'].map(s =>
            <button key={s} onClick={() => nav.go('aichat')} style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 99,
              background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)',
              display: 'inline-flex', alignItems: 'center', gap: 4 }}><Sparkles size={12} color="var(--ai)" />{s}</button>)}
        </div>
      </div>

      {/* my shortcuts */}
      <div style={{ display: 'flex', gap: 10, padding: '10px 16px 2px' }}>
        {[
          { key: 'myActivities', label: '我的活动', icon: 'ticket' },
          { key: 'myGroups',     label: '我的小组', icon: 'star'   },
        ].map(({ key, label, icon }) => {
          const count = key === 'myActivities'
            ? store.acts.filter(a => a.joinedByMe).length
            : store.groups.filter(g => g.joined).length;
          return (
            <button key={key} onClick={() => nav.go(key)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 5, padding: '10px 12px', borderRadius: 14, background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)', cursor: 'pointer', position: 'relative',
                border: 'none' }}>
              <div style={{ position: 'relative' }}>
                <Icon name={icon} size={20} stroke={2} style={{ color: 'var(--brand)' }} />
                {count > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 16, height: 16,
                    padding: '0 3px', borderRadius: 99, background: 'var(--brand)', color: '#fff',
                    fontSize: 9.5, fontWeight: 800, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', boxShadow: '0 0 0 1.5px #fff' }}>{count}</span>
                )}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* activity tabs: 推荐 / 最新 / 热门 */}
      <div style={{ padding: '18px 16px 4px' }}>
        <SectionHeader title="活动" action="全部" onAction={() => nav.go('allActs')} accent="var(--brand)" />
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 13, background: 'var(--bg-2)', marginBottom: 15 }}>
          {actTabs.map(t => {
            const on = actTab === t.key;
            return (
              <button key={t.key} onClick={() => setActTab(t.key)} style={{ flex: 1, padding: '8px 0', borderRadius: 10,
                fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: on ? 'var(--ink)' : 'transparent', color: on ? '#fff' : 'var(--ink-2)',
                boxShadow: on ? 'var(--shadow-sm)' : 'none', transition: 'background .18s, color .18s' }}>{t.label}</button>
            );
          })}
        </div>
        {actTab === 'rec' && (
          recItems.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {recItems.map(({ a, reason }) => (
              <ActivityCard key={a.id} a={a} recReason={reason} onClick={() => nav.go('activity', { aid: a.id })} />
            ))}
          </div> : <Empty text="暂无推荐活动" />
        )}
        {actTab === 'latest' && (
          latestActs.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {latestActs.map(a => <ActivityCard key={a.id} a={a} onClick={() => nav.go('activity', { aid: a.id })} />)}
          </div> : <Empty text="暂无最新活动" />
        )}
        {actTab === 'hot' && (
          hotActs.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {hotActs.map(a => <ActivityCard key={a.id} a={a} onClick={() => nav.go('activity', { aid: a.id })} />)}
          </div> : <Empty text="暂无热门活动" />
        )}
      </div>

      {/* moments strip */}
      <div style={{ padding: '20px 0 4px' }}>
        <div style={{ padding: '0 16px' }}><SectionHeader title="热门小组" action="全部" onAction={() => nav.go('allGroups')} accent="var(--c-music)" /></div>
        <div className="noscroll" style={{ display: 'flex', gap: 13, overflowX: 'auto', padding: '0 16px 4px', scrollSnapType: 'x mandatory' }}>
          {hotGroups.map(g => <GroupCard key={g.id} g={g} onClick={() => nav.go('group', { gid: g.id })} />)}
        </div>
      </div>

      {/* past activities — horizontal cover strip */}
      <div style={{ padding: '14px 0 20px' }}>
        <div style={{ padding: '0 16px' }}>
          <SectionHeader title="往期精彩回顾" sub="已结束活动 · 看大家分享的精彩瞬间" accent="var(--sun)"
            action="小组圈" onAction={() => nav.go('moments', {})} />
        </div>
        <EndedActsStrip acts={store.acts.filter(a => a.status === 'ended')} groups={store.groups} onViewDetail={aid => nav.go('activity', { aid })} />
      </div>
    </ScreenScroll>
  );
}

// ---------- 小组圈 feed ----------
function MomentsFeed({ gid }) {
  const { nav, store } = useM();
  const list = gid ? store.moments.filter(m => m.gid === gid) : store.moments;
  const postableActs = DBH.momentEligibleActs(store.acts, gid);
  const title = gid ? (DB.groups.find(g => g.id === gid) || {}).name + ' · 小组圈' : '小组圈';
  const totalLikes = list.reduce((s, m) => s + (m.likes || 0), 0);
  const top = [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  const topAct = top && DB.acts.find(a => a.id === top.aid);
  const highlight = topAct ? `「${topAct.series || topAct.title.replace(/ · .+$/, '')}」${top.imgs && top.imgs.length > 1 ? '组图' : '瞬间'}最受欢迎` : '';
  return (
    <ScreenScroll>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 11, padding: '14px',
        background: 'rgba(255,247,241,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
        <button onClick={nav.back} style={{ display: 'flex' }}><Icon name="back" size={24} /></button>
        <div style={{ fontSize: 17, fontWeight: 800, flex: 1 }}>{title}</div>
        {postableActs.length > 0 && <Btn variant="ai" size="sm" icon="camera" onClick={() => nav.go('post', { gid })}>发布</Btn>}
      </div>
      <div style={{ padding: '16px 14px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderRadius: 12,
            background: 'var(--ai-soft, oklch(0.97 0.01 340))', border: '1px solid oklch(0.88 0.06 340 / 0.5)' }}>
          <Sparkles size={15} color="var(--ai)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>本周高光 · </span>
            共 {list.length} 条精彩瞬间,累计 {totalLikes} 个赞{highlight ? `,${highlight}。` : '。'}
          </div>
        </div>
        {list.map(m => <MomentCard key={m.id} m={m} />)}
      </div>
    </ScreenScroll>
  );
}

// ---------- post moment ----------
function PostMoment({ gid, aid: aidInit }) {
  const { nav, actions, store } = useM();
  const eligibleActs = React.useMemo(
    () => DBH.momentEligibleActs(store.acts, gid),
    [store.acts, gid]
  );
  const [text, setText] = React.useState('');
  const [imgs, setImgs] = React.useState(['new-1', 'new-2']);
  const [writing, setWriting] = React.useState(false);
  const [aid, setAid] = React.useState(() => {
    if (aidInit && eligibleActs.some(a => a.id === aidInit)) return aidInit;
    return eligibleActs.length === 1 ? eligibleActs[0].id : '';
  });
  const [showPicker, setShowPicker] = React.useState(!aid);

  const act = eligibleActs.find(a => a.id === aid);
  const ready = !!text.trim() && !!act;
  const aiWrite = () => {
    setWriting(true);
    setTimeout(() => { setWriting(false);
      setText('今天太尽兴了!和大家一起的每一刻都值得记录,期待下次再聚 🎉 这次的高光必须存档!'); }, 1200);
  };
  const publish = () => {
    if (!act) { toast('请选择你参与过的已结束活动', { icon: 'alert' }); setShowPicker(true); return; }
    if (!text.trim()) return;
    actions.postMoment({ gid: act.gid, aid: act.id, text, imgs });
    nav.back();
    toast('精彩瞬间已发布到小组圈', { ai: true });
  };
  return (
    <ScreenScroll>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <button onClick={nav.back} style={{ display: 'flex', color: 'var(--ink)' }}><Icon name="x" size={24} /></button>
        <div style={{ fontSize: 16, fontWeight: 800 }}>发布精彩瞬间</div>
        <Btn variant="primary" size="sm" disabled={!ready} onClick={publish} style={{ opacity: ready ? 1 : 0.5 }}>发布</Btn>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 8 }}>
            关联活动 <span style={{ color: 'var(--brand)' }}>*</span>
          </div>
          <button onClick={() => setShowPicker(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 13,
              width: '100%', background: act ? 'var(--brand-tint)' : 'var(--surface-2)',
              border: `1px solid ${act ? 'var(--brand)' : 'var(--line)'}`,
              textAlign: 'left', cursor: 'pointer' }}>
            <Icon name={act ? CATS[act.cat].icon : 'calendar'} size={16} stroke={2.2}
              style={{ color: act ? 'var(--brand-600)' : 'var(--ink-3)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: act ? 'var(--brand-600)' : 'var(--ink-3)' }}>
              {act ? act.title : '请选择你参与过的已结束活动'}
            </span>
            <Icon name={showPicker ? 'chevD' : 'chevR'} size={16} style={{ color: 'var(--ink-3)' }} />
          </button>
          {!act && !showPicker && (
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>仅报名参与的活动结束后才可发布</div>
          )}
        </div>
        {showPicker && (
          <div style={{ borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--line)',
            overflow: 'hidden', marginTop: -8 }} className="fade">
            <div style={{ padding: '10px 13px 6px', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)' }}>
              {gid ? '本小组 · 你参与过的已结束活动' : '你参与过的已结束活动'}
            </div>
            {eligibleActs.length === 0 && (
              <div style={{ padding: '10px 13px 14px', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
                暂无可发布的活动。只有报名参加了活动，在活动结束后才可以发布精彩瞬间。
              </div>
            )}
            {eligibleActs.map((a, i) => (
              <button key={a.id} onClick={() => { setAid(a.id); setShowPicker(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px',
                  width: '100%', textAlign: 'left', borderTop: i ? '1px solid var(--line)' : 'none',
                  background: aid === a.id ? 'var(--brand-tint)' : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = aid === a.id ? 'var(--brand-tint)' : 'transparent'}>
                <Icon name={CATS[a.cat].icon} size={15} style={{ color: CATS[a.cat].color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }} className="clamp1">{a.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>
                    {(DB.groups.find(g => g.id === a.gid) || {}).name} · {a.date} · {a.time}
                  </div>
                </div>
                {aid === a.id && <Icon name="check" size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        )}
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="分享这一刻的精彩…"
          style={{ width: '100%', minHeight: 100, border: 'none', outline: 'none', resize: 'none', fontSize: 15.5, lineHeight: 1.6,
            background: 'transparent', fontFamily: 'var(--font)' }} />
        <button onClick={aiWrite} disabled={writing} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 14px', borderRadius: 13, background: 'var(--ai-soft)', color: 'var(--ai)', fontSize: 13.5, fontWeight: 700 }}>
          {writing ? <TypingDots color="var(--ai)" /> : <><Sparkles size={17} color="var(--ai)" />AI帮写</>}</button>
        <PostMomentPhotos imgs={imgs} onChange={setImgs} />
      </div>
    </ScreenScroll>
  );
}

// ---------- list screens ----------
function ListSearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 14,
      background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px var(--line)', marginBottom: 16 }}>
      <Icon name="search" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--ink)' }} />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="清除搜索"
          style={{ display: 'flex', color: 'var(--ink-3)', padding: 2 }}>
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}

function ListScreen({ title, children, onBack, search, onSearchChange, searchPlaceholder }) {
  return (
    <ScreenScroll>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 11, padding: '14px',
        background: 'rgba(255,247,241,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
        <button onClick={onBack} style={{ display: 'flex' }}><Icon name="back" size={24} /></button>
        <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
      </div>
      <div style={{ padding: '16px 14px 40px' }}>
        {search != null && onSearchChange && (
          <ListSearchBar value={search} onChange={onSearchChange} placeholder={searchPlaceholder || '搜索'} />
        )}
        {children}
      </div>
    </ScreenScroll>
  );
}

function filterActs(acts, groups, q) {
  const s = q.trim().toLowerCase();
  if (!s) return acts;
  return acts.filter(a => {
    const g = groups.find(x => x.id === a.gid);
    const blob = [a.title, g && g.name, ...(a.tags || [])]
      .filter(Boolean).join(' ').toLowerCase();
    return blob.includes(s);
  });
}

function filterGroups(groups, q) {
  const s = q.trim().toLowerCase();
  if (!s) return groups;
  return groups.filter(g => {
    const cat = (CATS[g.cat] || {}).label || '';
    const blob = [g.name, g.intro, g.lead, g.area, cat, ...(g.tags || [])]
      .filter(Boolean).join(' ').toLowerCase();
    return blob.includes(s);
  });
}

function isOpenActivity(a) {
  return a.status === 'upcoming';
}

function MyActivities() {
  const { nav, store } = useM();
  const [tab, setTab] = React.useState('all');
  const myActs = store.acts.filter(a => a.joinedByMe);
  const filtered = tab === 'all'     ? myActs
    : tab === 'upcoming' ? myActs.filter(a => a.status === 'upcoming')
    :                      myActs.filter(a => a.status === 'ended' || a.status === 'cancelled');
  const tabDefs = [
    { key: 'all',      label: '全部' },
    { key: 'upcoming', label: '未开始' },
    { key: 'ended',    label: '已结束' },
  ];
  return (
    <ScreenScroll>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,247,241,0.92)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 14px 10px' }}>
          <button onClick={nav.back} style={{ display: 'flex' }}><Icon name="back" size={24} /></button>
          <div style={{ fontSize: 17, fontWeight: 800 }}>我的活动</div>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '0 14px 12px' }}>
          {tabDefs.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 700, border: 'none',
              cursor: 'pointer',
              background: tab === key ? 'var(--brand)' : 'var(--surface-2)',
              color:      tab === key ? '#fff'         : 'var(--ink-3)',
            }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 14px 40px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        {filtered.length === 0 ? (
          <div style={{ paddingTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Empty text={tab === 'all' ? '还没有报名任何活动' : '该状态下暂无活动'} />
            {tab === 'all' && (
              <Btn variant="soft" size="sm" onClick={() => nav.go('allActs')}>去看看</Btn>
            )}
          </div>
        ) : (
          filtered.map(a => (
            <ActivityCard key={a.id} a={a} onClick={() => nav.go('activity', { aid: a.id })} />
          ))
        )}
      </div>
    </ScreenScroll>
  );
}

function AllActivities() {
  const { nav, store } = useM();
  const [q, setQ] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('all');
  
  const filterByDate = (acts) => {
    if (dateFilter === 'all') return acts;
    
    // 简单的本周/本月判断（原型中 today 假定为 06月03日 周一）
    const today = new Date(2026, 5, 3); // 06月03日
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // 本周一
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // 本周日
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return acts.filter(a => {
      const match = a.date.match(/(\d+)月(\d+)日/);
      if (!match) return false;
      const month = parseInt(match[1]);
      const day = parseInt(match[2]);
      const aDate = new Date(2026, month - 1, day);
      
      if (dateFilter === 'week') {
        return aDate >= weekStart && aDate <= weekEnd;
      } else if (dateFilter === 'month') {
        return aDate >= monthStart && aDate <= monthEnd;
      }
      return true;
    });
  };
  
  const allActs = filterActs(filterByDate(store.acts.filter(isOpenActivity)), store.groups, q);
  const list = q.trim() ? allActs : filterByDate(store.acts.filter(isOpenActivity));
  
  const dateFilterOptions = [
    { key: 'all', label: '全部' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
  ];
  
  return (
    <ScreenScroll>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,247,241,0.92)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 14px 10px' }}>
          <button onClick={nav.back} style={{ display: 'flex' }}><Icon name="back" size={24} /></button>
          <div style={{ fontSize: 17, fontWeight: 800 }}>全部活动</div>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '0 14px 10px' }}>
          {dateFilterOptions.map(({ key, label }) => (
            <button key={key} onClick={() => setDateFilter(key)} style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 700, border: 'none',
              cursor: 'pointer',
              background: dateFilter === key ? 'var(--brand)' : 'var(--surface-2)',
              color:      dateFilter === key ? '#fff'         : 'var(--ink-3)',
            }}>{label}</button>
          ))}
        </div>
        <ListSearchBar value={q} onChange={setQ} placeholder="搜索活动、小组" />
      </div>
      <div style={{ padding: '16px 14px 40px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        {list.length
          ? list.map(a => <ActivityCard key={a.id} a={a} onClick={() => nav.go('activity', { aid: a.id })} />)
          : <Empty text={q.trim() ? '没有匹配的活动' : '暂无活动'} />}
      </div>
    </ScreenScroll>
  );
}

function MyGroups() {
  const { nav, store } = useM();
  const myGroups = store.groups.filter(g => g.joined);
  return (
    <ScreenScroll>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center',
        gap: 11, padding: '14px', background: 'rgba(255,247,241,0.92)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
        <button onClick={nav.back} style={{ display: 'flex' }}><Icon name="back" size={24} /></button>
        <div style={{ fontSize: 17, fontWeight: 800 }}>我的小组</div>
      </div>
      <div style={{ padding: '12px 14px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {myGroups.length === 0 ? (
          <div style={{ paddingTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Empty text="还没有加入任何小组" />
            <Btn variant="soft" size="sm" onClick={() => nav.go('allGroups')}>去探索</Btn>
          </div>
        ) : (
          myGroups.map(g => (
            <GroupCard key={g.id} g={g} wide onClick={() => nav.go('group', { gid: g.id })} />
          ))
        )}
      </div>
    </ScreenScroll>
  );
}

function AllGroups() {
  const { nav, store } = useM();
  const [q, setQ] = React.useState('');
  const list = filterGroups(store.groups, q);
  return (
    <ListScreen title="全部小组" onBack={nav.back} search={q} onSearchChange={setQ} searchPlaceholder="搜索小组名称、分类、标签">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
        {list.length
          ? list.map(g => <GroupCard key={g.id} g={g} wide onClick={() => nav.go('group', { gid: g.id })} />)
          : <Empty text={q.trim() ? '没有匹配的小组' : '暂无小组'} />}
      </div>
    </ListScreen>
  );
}

// ---------- nav bar ----------
function NavBar({ tab, setTab, unread }) {
  const items = [['home', '主页', 'home'], ['im', '沟通', 'chat']];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 74, background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(12px)', borderTop: '1px solid var(--line)', display: 'flex', paddingBottom: 8, zIndex: 40 }}>
      {items.map(([k, l, ic]) => {
        const on = tab === k;
        return (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4, color: on ? 'var(--brand)' : 'var(--ink-3)', position: 'relative', paddingTop: 6 }}>
            <div style={{ position: 'relative' }}>
              <Icon name={ic} size={25} fill={on} stroke={on ? 0 : 2.1} />
              {k === 'im' && unread > 0 && <span style={{ position: 'absolute', top: -4, right: -8, minWidth: 17, height: 17, padding: '0 4px',
                borderRadius: 99, background: 'var(--brand)', color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex',
                alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #fff' }}>{unread}</span>}
            </div>
            <span style={{ fontSize: 11, fontWeight: on ? 700 : 600 }}>{l}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- app shell ----------
function MobileApp() {
  const [acts, setActs] = React.useState(() => DB.acts.map(a => ({ ...a })));
  const [groups, setGroups] = React.useState(() => DB.groups.map(g => ({ ...g })));
  const [moments, setMoments] = React.useState(() => DB.moments.map(m => ({ ...m, _liked: false })));
  const [tab, setTab] = React.useState('home');
  const [stack, setStack] = React.useState([]);

  const nav = {
    go: (name, params = {}) => {
      if (name === 'im') { setTab('im'); setStack([]); return; }
      if (name === 'home') { setTab('home'); setStack([]); return; }
      setStack(s => [...s, { name, params }]);
    },
    back: () => setStack(s => s.slice(0, -1)),
  };
  const actions = {
    toggleSignup: (aid) => setActs(s => s.map(a => a.id === aid ? { ...a, joinedByMe: !a.joinedByMe, signed: a.signed + (a.joinedByMe ? -1 : 1) } : a))
      || toast(acts.find(a => a.id === aid).joinedByMe ? '已取消报名' : '报名成功,已通知发起人', { ai: !acts.find(a => a.id === aid).joinedByMe }),
    setSessionSignups: (aid, joinedIds) => {
      const act = acts.find(a => a.id === aid);
      if (!act || !act.sessions) return;
      const before = act.sessions.filter(s => s.joinedByMe).length;
      const after = act.sessions.filter(s => joinedIds.includes(s.id)).length;
      setActs(s => s.map(a => {
        if (a.id !== aid || !a.sessions) return a;
        const sessions = a.sessions.map(se => {
          const want = joinedIds.includes(se.id);
          if (want === !!se.joinedByMe) return se;
          return { ...se, joinedByMe: want, signed: se.signed + (want ? 1 : -1) };
        });
        return { ...a, sessions, joinedByMe: sessions.some(x => x.joinedByMe),
          signed: sessions[0].signed, cap: sessions[0].cap };
      }));
      const diff = after - before;
      if (diff > 0) toast(`已报名 ${diff} 个场次,已通知发起人`, { ai: true });
      else if (diff < 0) toast(`已取消 ${-diff} 个场次`, { icon: 'check' });
      else toast('报名场次已更新', { icon: 'check' });
    },
    toggleLike: (aid) => setActs(s => s.map(a => a.id === aid ? { ...a, liked: !a.liked, likes: a.likes + (a.liked ? -1 : 1) } : a)),
    toggleJoin: (gid) => { const g = groups.find(x => x.id === gid);
      setGroups(s => s.map(x => x.id === gid ? { ...x, joined: !x.joined, members: x.members + (x.joined ? -1 : 1) } : x));
      toast(g.joined ? '已退出小组' : (g.join === 'approve' ? '申请已提交,等待组长审核' : '已加入小组,欢迎!'), { ai: !g.joined && g.join !== 'approve' }); },
    toggleMomentLike: (mid) => setMoments(s => s.map(m => m.id === mid ? { ...m, _liked: !m._liked, likes: m.likes + (m._liked ? -1 : 1) } : m)),
    postMoment: ({ gid, aid, text, imgs }) => {
      const act = acts.find(a => a.id === aid);
      if (!DBH.canPostMoment(act)) {
        toast('仅报名参与的活动结束后可发布精彩瞬间', { icon: 'alert' });
        return;
      }
      setMoments(s => [{ id: 'mx' + Date.now(), gid, aid, author: DB.ME, text, imgs, likes: 0, _liked: false, time: '刚刚' }, ...s]);
    },
  };

  const store = { acts, groups, moments };
  const top = stack[stack.length - 1];
  const renderTop = () => {
    if (!top) return null;
    const p = top.params;
    switch (top.name) {
      case 'activity': return <ActivityDetail aid={p.aid} pickEnroll={!!p.pickEnroll} />;
      case 'group': return <GroupDetail gid={p.gid} />;
      case 'moments': return <MomentsFeed gid={p.gid} />;
      case 'post': return <PostMoment gid={p.gid} aid={p.aid} />;
      case 'aichat': return <AIChat />;
      case 'notify': return <NotifyThread />;
      case 'groupchat': return <GroupChat cid={p.cid} />;
      case 'myActivities': return <MyActivities />;
      case 'myGroups': return <MyGroups />;
      case 'allActs': return <AllActivities />;
      case 'allGroups': return <AllGroups />;
      default: return null;
    }
  };
  const unread = DB.convos.reduce((s, c) => s + c.unread, 0);

  return (
    <MobileCtx.Provider value={{ store, actions, nav }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* roots */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {tab === 'home' ? <HomeTab /> :
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ padding: '18px 16px 10px' }}>
                <div style={{ fontSize: 23, fontWeight: 800, fontFamily: 'var(--font-display)' }}>沟通引擎</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>消息 · 通知 · 小趣助手</div>
              </div>
              <div style={{ position: 'absolute', top: 76, left: 0, right: 0, bottom: 74, overflowY: 'auto' }} className="noscroll"><ConvoList /></div>
            </div>}
        </div>
        {!top && <NavBar tab={tab} setTab={(t) => { setStack([]); setTab(t); }} unread={unread} />}
        {/* pushed screen */}
        {top && <div key={stack.length} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--bg)', animation: 'slideIn .28s cubic-bezier(.2,.8,.2,1)' }}>{renderTop()}</div>}
        <ToastHost />
      </div>
    </MobileCtx.Provider>
  );
}

Object.assign(window, { MobileApp, ScreenScroll, HomeTab, MomentsFeed, PostMoment, AllActivities, AllGroups, MyActivities, MyGroups, NavBar });

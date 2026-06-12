// mobile.jsx — employee app shell: store, nav, home tab, moments, post, lists.

function ScreenScroll({ children, insetBottom = 0, style, ...rest }) {
  return <div className="noscroll" {...rest} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: insetBottom, overflowY: 'auto', background: 'var(--bg)', ...style }}>{children}</div>;
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
  const upcomingList = DBH.collapseActsForList(upcoming, store.acts);
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
  const latestActs = [...upcomingList].sort((x, y) => dateKey(x) - dateKey(y)).slice(0, 3);
  const hotActs = [...upcomingList].sort((x, y) => (y.likes - x.likes) || (y.signed - x.signed)).slice(0, 3);
  const actTabs = [
    { key: 'rec', label: '推荐' },
    { key: 'latest', label: '最新' },
    { key: 'hot', label: '热门' },
  ];
  const noUpcomingActs = upcomingList.length === 0;
  const actEmptyGuide = (
    <Empty
      text="暂无活动，先去浏览感兴趣的小组吧，加入小组即可"
      actionLabel="浏览全部小组"
      onAction={() => nav.go('allGroups')}
    />
  );

  const headerEntries = [
    { key: 'myActivities', label: '我的活动', icon: 'ticket' },
    { key: 'myGroups', label: '我的小组', icon: 'star' },
  ];

  return (
    <ScreenScroll insetBottom={16}>
      {/* home header: title + 我的活动 / 我的小组 icon entries */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 2px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>兴趣小组</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {headerEntries.map(({ key, label, icon }) => (
            <button key={key} type="button" onClick={() => nav.go(key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                borderRadius: 99, border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Icon name={icon} size={15} stroke={2.2} style={{ color: 'var(--brand)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI natural language entry */}
      <div style={{ padding: '10px 16px 4px' }}>
        <div onClick={() => nav.go('aichat')} style={{ borderRadius: 14, padding: 1.5, background: 'var(--ai-grad)', cursor: 'pointer', boxShadow: '0 6px 18px oklch(0.66 0.21 4 / 0.18)' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 12.5, padding: '8px 11px', display: 'flex', alignItems: 'center', gap: 8, minHeight: 40 }}>
            <Sparkles size={18} color="var(--ai)" style={{ animation: 'sparkle 2.4s infinite', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 500, lineHeight: 1.3 }}>推荐小组、查询活动…</span>
            <div style={{ padding: '5px 10px', borderRadius: 9, background: 'var(--ai-grad)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
              <Icon name="mic" size={14} stroke={2.4} />问</div>
          </div>
        </div>
        <div className="noscroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginTop: 8 }}>
          {['职场成长的活动有什么', '适合新人的小组', '本周还有什么活动'].map(s =>
            <button key={s} onClick={() => nav.go('aichat')} style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 99,
              background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)',
              display: 'inline-flex', alignItems: 'center', gap: 4 }}><Sparkles size={12} color="var(--ai)" />{s}</button>)}
        </div>
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
          noUpcomingActs ? actEmptyGuide
            : recItems.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {recItems.map(({ a, reason }) => (
                <ActivityCard key={a.id} a={a} recReason={reason} simpleEnrollLabel onClick={() => nav.go('activity', { aid: a.id })} />
              ))}
            </div> : <Empty text="暂无推荐活动" />
        )}
        {actTab === 'latest' && (
          noUpcomingActs ? actEmptyGuide
            : latestActs.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {latestActs.map(a => <ActivityCard key={a._listKey || a.id} a={a} simpleEnrollLabel />)}
            </div> : <Empty text="暂无最新活动" />
        )}
        {actTab === 'hot' && (
          noUpcomingActs ? actEmptyGuide
            : hotActs.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {hotActs.map(a => <ActivityCard key={a._listKey || a.id} a={a} simpleEnrollLabel />)}
            </div> : <Empty text="暂无热门活动" />
        )}
      </div>

      {/* moments strip */}
      <div style={{ padding: '20px 0 4px' }}>
        <div style={{ padding: '0 16px' }}><SectionHeader title="热门小组" action="全部" onAction={() => nav.go('allGroups')} accent="var(--c-music)" /></div>
        <div className="noscroll" style={{ display: 'flex', gap: 13, overflowX: 'auto', padding: '0 16px 4px', scrollSnapType: 'x mandatory' }}>
          {hotGroups.length
            ? hotGroups.map(g => <GroupCard key={g.id} g={g} onClick={() => nav.go('group', { gid: g.id })} />)
            : <div style={{ width: '100%', padding: '8px 0 4px' }}><Empty text="暂无小组" /></div>}
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
        {list.length
          ? list.map(m => <MomentCard key={m.id} m={m} />)
          : <Empty text="还没有精彩瞬间,参加活动后来这里分享吧" />}
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
                    {(DB.groups.find(g => g.id === a.gid) || {}).name} · {ActWhen.compact(a)}
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

const REG_STATUS_META = {
  pending:   { label: '待审核', icon: 'sun', bg: '#FFF7E6', color: '#D48806', border: '#FFE7BA' },
  success:   { label: '报名成功', icon: 'check', bg: '#F0FFF4', color: '#389E0D', border: '#D9F7BE' },
  rejected:  { label: '已驳回', icon: 'alert', bg: '#FFF1F0', color: '#CF1322', border: '#FFCCC7' },
  upcoming:  { label: '未开始', icon: 'clock', bg: '#E8F4FF', color: '#1677FF', border: '#BAE0FF' },
  ended:     { label: '已结束', icon: 'check', bg: 'var(--surface-2)', color: 'var(--ink-3)', border: 'var(--line)' },
  cancelled: { label: '已终止', icon: 'flag', bg: '#FFF1F0', color: '#CF1322', border: '#FFCCC7' },
};

function MyRegistrationCard({ item, onCancel, onRetry, onCardClick }) {
  const st = REG_STATUS_META[item.status] || REG_STATUS_META.success;
  const canCancel = item.status === 'pending' || item.status === 'success' || item.status === 'upcoming';
  const clickable = !!(onCardClick && item.actId);
  const stop = e => e.stopPropagation();
  const outlineBtn = { padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, flexShrink: 0,
    border: '1.5px solid var(--brand)', color: 'var(--brand)', background: '#fff', whiteSpace: 'nowrap' };
  const primaryBtn = { padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
    background: 'var(--brand)', color: '#fff', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-brand)' };
  return (
    <div role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onCardClick(item) : undefined}
      onKeyDown={clickable ? e => { if (e.key === 'Enter') onCardClick(item); } : undefined}
      style={{ background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
        cursor: clickable ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', gap: 12, padding: 14 }}>
        <div style={{ width: 88, height: 88, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
          <Photo seed={item.coverSeed} label={item.title} />
        </div>
        <div style={{ flex: 1, minWidth: 0, position: 'relative', paddingRight: 4 }}>
          <div style={{ position: 'absolute', top: 0, right: 0, display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6, background: st.bg, border: `1px solid ${st.border}`, fontSize: 11, fontWeight: 700, color: st.color }}>
            <Icon name={st.icon} size={12} stroke={2.4} />{st.label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.35, paddingRight: 72, marginBottom: item.role ? 6 : 8 }} className="clamp2">{item.title}</div>
          {item.role && (
            <span style={{ display: 'inline-block', marginBottom: 8, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: '#E8F4FF', color: '#1677FF', border: '1px solid #BAE0FF' }}>{item.role}</span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0, flex: 1 }}>
                <Icon name="clock" size={14} style={{ flexShrink: 0 }} /><span className="clamp1">{item.dateTime}</span>
              </span>
              {canCancel && (
                <button type="button" style={outlineBtn} onClick={e => { stop(e); onCancel(item); }}>取消报名</button>
              )}
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'flex-start', gap: 5 }}>
              <Icon name="pin" size={14} style={{ marginTop: 1, flexShrink: 0 }} /><span className="clamp2">{item.location}</span>
            </span>
          </div>
        </div>
      </div>
      {item.rejectReason && (
        <div style={{ margin: '0 14px 12px', padding: '10px 12px', borderRadius: 8, background: '#FFF1F0', fontSize: 12.5, lineHeight: 1.5, color: '#CF1322' }}>
          驳回原因：{item.rejectReason}
        </div>
      )}
      {(item.appliedAt || item.status === 'rejected') && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px',
          borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
          {item.appliedAt && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>报名时间：{item.appliedAt}</span>}
          {item.status === 'rejected' && (
            <button type="button" style={primaryBtn} onClick={e => { stop(e); onRetry(item); }}>再次报名</button>
          )}
        </div>
      )}
    </div>
  );
}

// 与移动员工端一致：周期 / 系列·按场次 → 详情内调整场次 Sheet；单次 / 系列·整场 → toggleSignup
function igActNeedsPickSheet(act) {
  return act.type === 'recurring'
    || (act.type === 'series' && (act.seriesSignupMode || 'independent') === 'independent');
}

function cancelIgRegistration(item, { store, nav, actions }) {
  const act = store.acts.find(x => x.id === item.actId);
  if (!act) return;
  if (act.status !== 'upcoming') {
    toast('该活动当前不可取消报名', { icon: 'alert' });
    return;
  }
  if (igActNeedsPickSheet(act)) {
    nav.go('activity', { aid: act.id, pickEnroll: true, pickEnrollIntent: 'cancel' });
    return;
  }
  const aid = act.type === 'series' && act.series
    ? (DBH.seriesEps(store.acts, act)[0] || act).id
    : act.id;
  actions.toggleSignup(aid);
}

// 兴趣小组已报名活动 → 转换为 myRegistration 格式的 mock
function igActsToRegItems(acts, groups) {
  return acts
    .filter(a => a.joinedByMe)
    .map(a => {
      const g = groups.find(x => x.id === a.gid) || {};
      return {
        id: 'ig-' + a.id,
        status: a.status === 'cancelled' ? 'cancelled' : a.status,
        title: a.title,
        dateTime: (ActWhen.full(a) + (ActWhen.daysBadge(a) ? ` · ${ActWhen.daysBadge(a)}` : '')).trim(),
        location: a.loc || g.area || '待定',
        appliedAt: '2026-06-01 10:00',
        coverSeed: a.id + (a.cat || ''),
        role: g.lead === DB.ME ? '组长' : undefined,
        actId: a.id,
      };
    });
}

const REG_STATUS_TABS_CULTURE = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'success', label: '报名成功' },
  { key: 'rejected', label: '已驳回' },
];
const REG_STATUS_TABS_IG = [
  { key: 'all', label: '全部' },
  { key: 'upcoming', label: '未开始' },
  { key: 'ended', label: '已结束' },
  { key: 'cancelled', label: '已终止' },
];

function filterRegList(list, statusTab, mode) {
  if (statusTab === 'all') return list;
  return list.filter(r => r.status === statusTab);
}

function MyRegTabList({ list, onCancel, onCardClick, mode = 'culture' }) {
  const [statusTab, setStatusTab] = React.useState('all');
  const statusDefs = mode === 'ig' ? REG_STATUS_TABS_IG : REG_STATUS_TABS_CULTURE;
  const filtered = filterRegList(list, statusTab, mode);
  return (
    <>
      {mode === 'ig' ? (
        <div style={{ display: 'flex', gap: 4, padding: 4, margin: '0 14px 12px', borderRadius: 12, background: 'var(--bg-2)' }}>
          {statusDefs.map(({ key, label }) => {
            const on = statusTab === key;
            return (
              <button key={key} type="button" onClick={() => setStatusTab(key)} style={{
                flex: 1, padding: '7px 0', borderRadius: 9, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: on ? 'var(--ink)' : 'transparent', color: on ? '#fff' : 'var(--ink-2)',
                boxShadow: on ? 'var(--shadow-sm)' : 'none',
              }}>{label}</button>
            );
          })}
        </div>
      ) : (
        <div className="noscroll" style={{ display: 'flex', gap: 8, padding: '0 14px 12px', overflowX: 'auto' }}>
          {statusDefs.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setStatusTab(key)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 700, border: 'none',
              background: statusTab === key ? 'var(--brand)' : 'var(--surface-2)',
              color: statusTab === key ? '#fff' : 'var(--ink-3)',
            }}>{label}</button>
          ))}
        </div>
      )}
      <div style={{ padding: '12px 14px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ paddingTop: 48 }}><Empty text="该状态下暂无报名记录" /></div>
        ) : filtered.map(item => (
          <MyRegistrationCard key={item.id} item={item}
            onCancel={onCancel}
            onCardClick={onCardClick}
            onRetry={() => toast('已提交再次报名', { ai: true })} />
        ))}
      </div>
    </>
  );
}

function MyRegistrations() {
  const { nav, store, actions } = useM();
  const [category, setCategory] = React.useState('culture');
  const [cultureList, setCultureList] = React.useState(() => (DB.myRegistrations || []).map(r => ({ ...r })));
  const [cancelConfirm, setCancelConfirm] = React.useState(null);
  const igList = igActsToRegItems(store.acts, store.groups);

  const openCancelConfirm = (item, mode) => setCancelConfirm({ item, mode });
  const closeCancelConfirm = () => setCancelConfirm(null);

  const executeCancel = () => {
    if (!cancelConfirm) return;
    const { item, mode } = cancelConfirm;
    setCancelConfirm(null);
    if (mode === 'culture') {
      setCultureList(s => s.filter(r => r.id !== item.id));
      toast('已取消报名', { icon: 'check' });
      return;
    }
    cancelIgRegistration(item, { store, nav, actions });
  };

  const handleCultureCancel = (item) => openCancelConfirm(item, 'culture');
  const handleIgCancel = (item) => {
    const act = store.acts.find(x => x.id === item.actId);
    if (!act) return;
    if (act.status !== 'upcoming') {
      toast('该活动当前不可取消报名', { icon: 'alert' });
      return;
    }
    if (igActNeedsPickSheet(act)) {
      nav.go('activity', { aid: act.id, pickEnroll: true, pickEnrollIntent: 'cancel' });
      return;
    }
    openCancelConfirm(item, 'ig');
  };
  const handleIgCardClick = (item) => {
    if (item.actId) nav.go('activity', { aid: item.actId });
  };

  const catDefs = [
    { key: 'culture', label: '悦文化' },
    { key: 'ig', label: '兴趣小组' },
  ];

  return (
    <>
      <ScreenScroll>
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,247,241,0.92)',
          backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 14px 10px' }}>
            <button type="button" onClick={nav.back} style={{ display: 'flex' }}><Icon name="back" size={24} /></button>
            <div style={{ fontSize: 17, fontWeight: 800 }}>我的报名</div>
          </div>
          {/* 一级 Tab：悦文化 / 兴趣小组 */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--line)', margin: '0 14px 0' }}>
            {catDefs.map(({ key, label }) => {
              const on = category === key;
              return (
                <button key={key} type="button" onClick={() => setCategory(key)} style={{
                  flex: 1, padding: '10px 0', fontSize: 14, fontWeight: on ? 800 : 600, border: 'none',
                  background: 'transparent', color: on ? 'var(--brand)' : 'var(--ink-3)',
                  borderBottom: on ? '2px solid var(--brand)' : '2px solid transparent',
                  marginBottom: -2, transition: 'color .15s',
                }}>{label}</button>
              );
            })}
          </div>
          {/* 二级 Tab：状态 */}
        </div>
        {/* 状态 Tab + 内容（组合为子组件，切换一级 Tab 时状态重置）*/}
        {category === 'culture'
          ? <MyRegTabList key="culture" mode="culture" list={cultureList} onCancel={handleCultureCancel} />
          : <MyRegTabList key="ig" mode="ig" list={igList} onCancel={handleIgCancel} onCardClick={handleIgCardClick} />
        }
      </ScreenScroll>
      <ConfirmSheet
        open={!!cancelConfirm}
        title="取消报名"
        message={cancelConfirm ? `确认取消「${cancelConfirm.item.title}」的报名？` : ''}
        cancelLabel="再想想"
        confirmLabel="确认取消"
        onCancel={closeCancelConfirm}
        onConfirm={executeCancel}
      />
    </>
  );
}

// ---------- App · 我的互动（点赞 / 收藏 / 评论）----------
const MINE_INTERACT_TABS = [
  { key: 'likes', label: '点赞' },
  { key: 'favorites', label: '收藏' },
  { key: 'comments', label: '评论' },
];
const MINE_INTERACT_CATS = [
  { key: 'article', label: '文章' },
  { key: 'course', label: '课程' },
  { key: 'activity', label: '活动' },
  { key: 'ig', label: '兴趣小组' },
];
function mineInteractCatsFor(tab) {
  return tab === 'favorites' ? MINE_INTERACT_CATS.filter(c => c.key !== 'ig') : MINE_INTERACT_CATS;
}

function mineInteractFeedItems(kind, category) {
  return (DB.mineInteractFeed || []).filter(x => x.kind === kind && x.category === category);
}

function igInteractItems(acts, kind) {
  const commentAids = new Set((DB.comments || []).filter(c => c.author === DB.ME).map(c => c.aid));
  const list = kind === 'likes' ? acts.filter(a => a.liked)
    : acts.filter(a => commentAids.has(a.id));
  return list.map(a => ({
    id: 'ig-' + a.id,
    title: a.title,
    commentCount: (DBH.commentsOf(a.id) || []).length,
    date: (a.date || '').replace(/^(\d+月\d+日).*/, '$1'),
    coverSeed: a.id + (a.cat || ''),
    actId: a.id,
  }));
}

function AppMineInteractFeedRow({ item, onClick }) {
  const clickable = !!onClick;
  return (
    <div role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onClick(item) : undefined}
      onKeyDown={clickable ? e => { if (e.key === 'Enter') onClick(item); } : undefined}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)',
        cursor: clickable ? 'pointer' : 'default' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.45, color: 'var(--ink)', marginBottom: 8 }} className="clamp2">{item.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.35 }}>
          {item.commentCount > 0 ? `${item.commentCount}评论 ` : ''}{item.date}
        </div>
      </div>
      <div style={{ width: 108, height: 68, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)' }}>
        <Photo seed={item.coverSeed} label={item.title} />
      </div>
    </div>
  );
}

function AppMineInteractListEnd() {
  return (
    <div style={{ padding: '28px 0 36px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', letterSpacing: 0.2 }}>
      … 已经到底了 …
    </div>
  );
}

function AppMineInteractTabBar({ tab, onTab }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', margin: '0 14px' }}>
      {MINE_INTERACT_TABS.map(({ key, label }) => {
        const on = tab === key;
        return (
          <button key={key} type="button" onClick={() => onTab(key)} style={{
            flex: 1, padding: '11px 0 10px', fontSize: 15, fontWeight: on ? 800 : 600, border: 'none',
            background: 'transparent', color: on ? 'var(--ink)' : 'var(--ink-3)',
            borderBottom: on ? '2px solid var(--brand)' : '2px solid transparent', marginBottom: -1,
          }}>{label}</button>
        );
      })}
    </div>
  );
}

function AppMineInteractCatPills({ cats, cat, onCat }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 4px', overflowX: 'auto' }} className="noscroll">
      {cats.map(({ key, label }) => {
        const on = cat === key;
        return (
          <button key={key} type="button" onClick={() => onCat(key)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            border: on ? '1.5px solid var(--ink)' : '1.5px solid var(--line-2)',
            background: '#fff', color: on ? 'var(--ink)' : 'var(--ink-2)', cursor: 'pointer',
          }}>{label}</button>
        );
      })}
    </div>
  );
}

function AppMineInteract({ initialTab = 'likes' }) {
  const { nav, store } = useM();
  const [tab, setTab] = React.useState(initialTab);
  const [cat, setCat] = React.useState('activity');
  const cats = mineInteractCatsFor(tab);
  React.useEffect(() => {
    if (tab === 'favorites' && cat === 'ig') setCat('activity');
  }, [tab, cat]);
  const list = cat === 'ig' ? igInteractItems(store.acts, tab) : mineInteractFeedItems(tab, cat);
  const onRowClick = cat === 'ig'
    ? (item) => { if (item.actId) nav.go('activity', { aid: item.actId }); }
    : undefined;

  return (
    <ScreenScroll>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)',
        borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px 4px' }}>
          <button type="button" onClick={nav.back} style={{ display: 'flex' }}><Icon name="back" size={24} /></button>
        </div>
        <AppMineInteractTabBar tab={tab} onTab={setTab} />
        <AppMineInteractCatPills cats={cats} cat={cat} onCat={setCat} />
      </div>
      <div style={{ padding: '4px 14px 0', background: 'var(--surface)', minHeight: '60vh' }}>
        {list.length
          ? list.map(item => <AppMineInteractFeedRow key={item.id} item={item} onClick={onRowClick} />)
          : <div style={{ paddingTop: 48 }}><Empty text="暂无相关内容" /></div>}
        <AppMineInteractListEnd />
      </div>
    </ScreenScroll>
  );
}

function MyActivities() {
  const { nav, store } = useM();
  const [tab, setTab] = React.useState('all');
  const myActs = store.acts.filter(a => a.joinedByMe);
  const myList = DBH.collapseActsForList(myActs, store.acts);
  const filtered = tab === 'all'      ? myList
    : tab === 'upcoming'  ? myList.filter(a => a.status === 'upcoming')
    : tab === 'ended'     ? myList.filter(a => a.status === 'ended')
    : tab === 'cancelled' ? myList.filter(a => a.status === 'cancelled')
    : myList;
  const tabDefs = [
    { key: 'all',      label: '全部' },
    { key: 'upcoming', label: '未开始' },
    { key: 'ended',    label: '已结束' },
    { key: 'cancelled', label: '已终止' },
  ];
  return (
    <ScreenScroll>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,247,241,0.92)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 14px 10px' }}>
          <button onClick={nav.back} style={{ display: 'flex' }}><Icon name="back" size={24} /></button>
          <div style={{ fontSize: 17, fontWeight: 800 }}>我的活动</div>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, margin: '0 14px 12px', borderRadius: 12, background: 'var(--bg-2)' }}>
          {tabDefs.map(({ key, label }) => {
            const on = tab === key;
            return (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, padding: '7px 0', borderRadius: 9, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: on ? 'var(--ink)' : 'transparent', color: on ? '#fff' : 'var(--ink-2)',
                boxShadow: on ? 'var(--shadow-sm)' : 'none', transition: 'background .18s, color .18s',
              }}>{label}</button>
            );
          })}
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
            <ActivityCard key={a._listKey || a.id} a={a} />
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
  const [statusFilter, setStatusFilter] = React.useState('all');
  
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
  
  const byStatus = (acts) => statusFilter === 'all' ? acts : acts.filter(a => a.status === statusFilter);
  const list = filterActs(filterByDate(byStatus(DBH.collapseActsForList(store.acts, store.acts))), store.groups, q);

  const statusOptions = [
    { key: 'all', label: '全部' },
    { key: 'upcoming', label: '未开始' },
    { key: 'ended', label: '已结束' },
    { key: 'cancelled', label: '已终止' },
  ];
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
        {/* status: primary segmented tabs */}
        <div style={{ display: 'flex', gap: 4, padding: 4, margin: '0 14px 10px', borderRadius: 12, background: 'var(--bg-2)' }}>
          {statusOptions.map(({ key, label }) => {
            const on = statusFilter === key;
            return (
              <button key={key} onClick={() => setStatusFilter(key)} style={{
                flex: 1, padding: '7px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: on ? 'var(--ink)' : 'transparent', color: on ? '#fff' : 'var(--ink-2)',
                boxShadow: on ? 'var(--shadow-sm)' : 'none', transition: 'background .18s, color .18s',
              }}>{label}</button>
            );
          })}
        </div>
        {/* time: secondary lightweight pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px 10px' }}>
          <Icon name="calendar" size={14} stroke={2} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          {dateFilterOptions.map(({ key, label }) => (
            <button key={key} onClick={() => setDateFilter(key)} style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, border: 'none',
              cursor: 'pointer',
              background: dateFilter === key ? 'color-mix(in oklch, var(--brand) 14%, white)' : 'var(--surface-2)',
              color:      dateFilter === key ? 'var(--brand-600, var(--brand))' : 'var(--ink-3)',
            }}>{label}</button>
          ))}
        </div>
        <ListSearchBar value={q} onChange={setQ} placeholder="搜索活动、小组" />
      </div>
      <div style={{ padding: '16px 14px 40px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        {list.length
          ? list.map(a => <ActivityCard key={a._listKey || a.id} a={a} simpleEnrollLabel />)
          : <Empty
              text={q.trim() ? '没有匹配的活动' : '暂无活动，可以先浏览小组，找到感兴趣的小组加入'}
              actionLabel={q.trim() ? undefined : '浏览全部小组'}
              onAction={q.trim() ? undefined : () => nav.go('allGroups')}
            />}
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

// ---------- 无数据预览：临时清空 DB，供 Showcase「移动端-无数据」查看空态 ----------
let _emptyDbSnapshot = null;

function enterEmptyDbMode() {
  if (_emptyDbSnapshot) return;
  _emptyDbSnapshot = {
    acts: DB.acts,
    groups: DB.groups,
    moments: DB.moments,
    comments: DB.comments,
    notifications: DB.notifications,
    convos: DB.convos,
    joinRequests: DB.joinRequests,
    mineInteractFeed: DB.mineInteractFeed,
    myRegistrations: DB.myRegistrations,
  };
  DB.acts = [];
  DB.groups = [];
  DB.moments = [];
  DB.comments = [];
  DB.notifications = [];
  DB.convos = [];
  DB.joinRequests = [];
  if (DB.mineInteractFeed) DB.mineInteractFeed = [];
  if (DB.myRegistrations) DB.myRegistrations = [];
}

function exitEmptyDbMode() {
  if (!_emptyDbSnapshot) return;
  DB.acts = _emptyDbSnapshot.acts;
  DB.groups = _emptyDbSnapshot.groups;
  DB.moments = _emptyDbSnapshot.moments;
  DB.comments = _emptyDbSnapshot.comments;
  DB.notifications = _emptyDbSnapshot.notifications;
  DB.convos = _emptyDbSnapshot.convos;
  DB.joinRequests = _emptyDbSnapshot.joinRequests;
  if (_emptyDbSnapshot.mineInteractFeed) DB.mineInteractFeed = _emptyDbSnapshot.mineInteractFeed;
  if (_emptyDbSnapshot.myRegistrations) DB.myRegistrations = _emptyDbSnapshot.myRegistrations;
  _emptyDbSnapshot = null;
}

// ---------- shared mobile store / nav ----------
function useInterestMobileState(empty = false) {
  const [acts, setActs] = React.useState(() => (empty ? [] : DB.acts.map(a => ({ ...a }))));
  const [groups, setGroups] = React.useState(() => (empty ? [] : DB.groups.map(g => ({ ...g }))));
  const [moments, setMoments] = React.useState(() => (empty ? [] : DB.moments.map(m => ({ ...m, _liked: false }))));
  const [stack, setStack] = React.useState([]);
  const nav = {
    go: (name, params = {}) => setStack(s => [...s, { name, params }]),
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
    // 系列(按场次)：按期批量增减报名,每期是独立活动
    setEpisodeSignups: (episodeIds, selectedIds) => {
      const eps = acts.filter(a => episodeIds.includes(a.id));
      const sel = new Set(selectedIds);
      const toAdd = eps.filter(a => !a.joinedByMe && sel.has(a.id) && a.signed < a.cap);
      const toRemove = eps.filter(a => a.joinedByMe && !sel.has(a.id));
      if (!toAdd.length && !toRemove.length) { toast('报名场次已更新', { icon: 'check' }); return; }
      const addIds = new Set(toAdd.map(a => a.id)), remIds = new Set(toRemove.map(a => a.id));
      setActs(s => s.map(a => {
        if (addIds.has(a.id)) return { ...a, joinedByMe: true, signed: a.signed + 1 };
        if (remIds.has(a.id)) return { ...a, joinedByMe: false, signed: Math.max(0, a.signed - 1) };
        return a;
      }));
      if (toAdd.length && !toRemove.length) toast(`已报名 ${toAdd.length} 个场次,已通知发起人`, { ai: true });
      else if (toRemove.length && !toAdd.length) toast(`已取消 ${toRemove.length} 个场次`, { icon: 'check' });
      else toast('报名场次已更新', { icon: 'check' });
    },
    toggleLike: (aid) => setActs(s => s.map(a => a.id === aid ? { ...a, liked: !a.liked, likes: a.likes + (a.liked ? -1 : 1) } : a)),
    // 自由加入：直接入组（写回 DB,跨 Tab 持久）
    joinGroupFree: (gid, silent) => {
      const g = groups.find(x => x.id === gid);
      if (!g || g.joined) return;
      setGroups(s => s.map(x => x.id === gid ? { ...x, joined: true, pending: false, members: x.members + 1 } : x));
      DBH.patchGroup(gid, { joined: true, pending: false, members: (g.members || 0) + 1 });
      if (!silent) toast('已加入小组,欢迎!', { ai: true });
    },
    // 审核加入：提交入组申请,进入待审核态,并把本人申请推入 DB.joinRequests 供 PC 审核
    applyJoin: (gid) => {
      const g = groups.find(x => x.id === gid);
      if (!g || g.joined || g.pending) return;
      setGroups(s => s.map(x => x.id === gid ? { ...x, pending: true } : x));
      DBH.patchGroup(gid, { pending: true });
      DBH.pushSelfJoinRequest(gid);
      toast('申请已提交,等待小组审核,通过后可报名', { ai: true });
    },
    // 自由加入小组的活动：一键入组 + 报名（单次/系列锚点用 aid）
    signupAndJoinFree: (aid, gid) => {
      const g = groups.find(x => x.id === gid);
      if (g && !g.joined) {
        setGroups(s => s.map(x => x.id === gid ? { ...x, joined: true, pending: false, members: x.members + 1 } : x));
        DBH.patchGroup(gid, { joined: true, pending: false, members: (g.members || 0) + 1 });
      }
      setActs(s => s.map(a => a.id === aid ? { ...a, joinedByMe: true, signed: a.signed + 1 } : a));
      toast('已加入小组,报名成功', { ai: true });
    },
    // 退出小组：若该组有本人已报名活动,二次确认并连带取消报名
    leaveGroupWithConfirm: (gid) => {
      const mine = acts.filter(a => a.gid === gid && (a.joinedByMe || (a.sessions || []).some(se => se.joinedByMe)));
      if (mine.length > 0 && !window.confirm(`退出后将取消你在该小组 ${mine.length} 个活动的报名,确认退出?`)) return;
      setActs(s => s.map(a => {
        if (a.gid !== gid) return a;
        let na = a;
        if (a.sessions) {
          const sessions = a.sessions.map(se => se.joinedByMe ? { ...se, joinedByMe: false, signed: Math.max(0, se.signed - 1) } : se);
          na = { ...na, sessions };
        } else if (a.joinedByMe) {
          na = { ...na, signed: Math.max(0, na.signed - 1) };
        }
        return { ...na, joinedByMe: false };
      }));
      const g = groups.find(x => x.id === gid);
      setGroups(s => s.map(x => x.id === gid ? { ...x, joined: false, pending: false, members: Math.max(0, x.members - 1) } : x));
      DBH.patchGroup(gid, { joined: false, pending: false, members: Math.max(0, (g ? g.members : 1) - 1) });
      toast('已退出小组', { icon: 'check' });
    },
    // 小组卡片/详情统一入口：按三态分流
    toggleJoin: (gid) => {
      const g = groups.find(x => x.id === gid);
      if (!g) return;
      if (g.joined) return actions.leaveGroupWithConfirm(gid);
      if (g.pending) return toast('申请审核中,通过后可报名', { icon: 'clock' });
      if (g.join === 'approve') return actions.applyJoin(gid);
      return actions.joinGroupFree(gid);
    },
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
  return { store: { acts, groups, moments }, actions, nav, stack, emptyMode: empty };
}

function renderMobileScreen(top) {
  if (!top) return null;
  const p = top.params;
  switch (top.name) {
    case 'activity': return <ActivityDetail aid={p.aid} pickEnroll={!!p.pickEnroll} pickEnrollIntent={p.pickEnrollIntent} />;
    case 'group': return <GroupDetail gid={p.gid} />;
    case 'moments': return <MomentsFeed gid={p.gid} />;
    case 'post': return <PostMoment gid={p.gid} aid={p.aid} />;
    case 'aichat': return <AIChat />;
    case 'notify': return <NotifyThread />;
    case 'groupchat': return <GroupChat cid={p.cid} />;
    case 'myActivities': return <MyActivities />;
    case 'myRegistrations': return <MyRegistrations />;
    case 'mineInteract': return <AppMineInteract initialTab={p.tab || 'likes'} />;
    case 'myGroups': return <MyGroups />;
    case 'allActs': return <AllActivities />;
    case 'allGroups': return <AllGroups />;
    default: return null;
  }
}

function MobileStackOverlay({ stack, children }) {
  const top = stack[stack.length - 1];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
      {top && <div key={stack.length} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--bg)',
        animation: 'slideIn .28s cubic-bezier(.2,.8,.2,1)' }}>{renderMobileScreen(top)}</div>}
      <ToastHost />
    </div>
  );
}

// ---------- 兴趣小组（仅首页，无底部沟通 Tab）----------
function MobileApp() {
  const shell = useInterestMobileState();
  return (
    <MobileCtx.Provider value={shell}>
      <MobileStackOverlay stack={shell.stack}><HomeTab /></MobileStackOverlay>
    </MobileCtx.Provider>
  );
}

/** Showcase「移动端-无数据」：不加载 mock，用于验收各页空态 */
function MobileAppEmpty() {
  enterEmptyDbMode();
  React.useEffect(() => () => exitEmptyDbMode(), []);
  const shell = useInterestMobileState(true);
  return (
    <MobileCtx.Provider value={shell}>
      <MobileStackOverlay stack={shell.stack}><HomeTab /></MobileStackOverlay>
    </MobileCtx.Provider>
  );
}

// ---------- IM 消息（原「沟通」）----------
function ImMobileApp() {
  const shell = useInterestMobileState();
  return (
    <MobileCtx.Provider value={shell}>
      <MobileStackOverlay stack={shell.stack}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto' }} className="noscroll"><ConvoList /></div>
        </div>
      </MobileStackOverlay>
    </MobileCtx.Provider>
  );
}

// ---------- App · 我的（悦生活员工端）----------
const APP_MINE_PHONE = '18518168316';
const APP_MINE_BALANCE = '286.15';
function appMineInteractStats(acts) {
  const feed = DB.mineInteractFeed || [];
  const igLikes = acts.filter(a => a.liked).length;
  const commentAids = new Set((DB.comments || []).filter(c => c.author === DB.ME).map(c => c.aid));
  const igComments = acts.filter(a => commentAids.has(a.id)).length;
  return {
    likes: feed.filter(x => x.kind === 'likes').length + igLikes,
    favorites: feed.filter(x => x.kind === 'favorites').length,
    comments: feed.filter(x => x.kind === 'comments').length + igComments,
  };
}

function AppMineHeaderAction({ icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 36 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={17} style={{ color: 'var(--ink-2)' }} />
      </div>
      <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

/** 点赞 / 收藏 / 评论 互动统计条 */
function AppMineInteractStat({ value, icon, label, color, bg, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0, border: 'none', background: 'transparent' }}>
      <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{value}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={14} style={{ color }} fill={icon === 'star'} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{label}</span>
      </div>
    </button>
  );
}

function AppMineInteractStats({ stats, onClick, highlighted }) {
  const items = [
    { key: 'likes', value: stats.likes, icon: 'thumbsUp', label: '点赞', color: '#F97316', bg: '#FFEDE8' },
    { key: 'favorites', value: stats.favorites, icon: 'star', label: '收藏', color: '#EAB308', bg: '#FFF8D6' },
    { key: 'comments', value: stats.comments, icon: 'comment', label: '评论', color: '#3B82F6', bg: '#E8F0FF' },
  ];
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, boxShadow: highlighted
      ? '0 0 0 3px var(--brand), 0 8px 24px color-mix(in oklch, var(--brand) 35%, transparent), var(--shadow-sm)'
      : 'var(--shadow-sm)', padding: '14px 8px', marginBottom: 12, display: 'flex', alignItems: 'stretch' }}>
      {items.map((it, i) => (
        <React.Fragment key={it.key}>
          {i > 0 && <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)', margin: '4px 0' }} />}
          <AppMineInteractStat {...it} onClick={() => onClick(it.key)} />
        </React.Fragment>
      ))}
    </div>
  );
}

function AppMineServiceBtn({ s, btnRef, highlighted, onClick, style }) {
  return (
    <button ref={btnRef} type="button" onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0, border: 'none', background: 'transparent', ...style,
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: highlighted ? '0 0 0 3px var(--brand), 0 8px 24px color-mix(in oklch, var(--brand) 45%, transparent)' : '0 4px 12px rgba(0,0,0,0.06)',
        transform: highlighted ? 'scale(1.06)' : 'none', transition: 'transform .2s, box-shadow .2s' }}>
        <Icon name={s.icon} size={24} style={{ color: s.color }} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: highlighted ? 800 : 600, color: highlighted ? 'var(--brand)' : 'var(--ink-2)', textAlign: 'center', lineHeight: 1.25 }}>{s.label}</span>
    </button>
  );
}

const APP_MINE_GUIDE_MASK_ID = 'appmine-guide-mask';

function measureGuideHole(shellEl, targetEl, pad = 10) {
  const shell = shellEl.getBoundingClientRect();
  const t = targetEl.getBoundingClientRect();
  return {
    top: t.top - shell.top,
    left: t.left - shell.left,
    width: t.width,
    height: t.height,
    pad,
    holeTop: t.top - shell.top - pad,
    holeLeft: t.left - shell.left - pad,
    holeW: t.width + pad * 2,
    holeH: t.height + pad * 2,
  };
}

/** 蒙层：高亮「点赞/收藏/评论」与「我的报名」，其余区域不可点 */
function AppMineGuideOverlay({ open, shellRef, interactRef, regBtnRef, interactStats, onInteractClick, regService, onRegClick }) {
  const [holes, setHoles] = React.useState([]);

  const updateHoles = React.useCallback(() => {
    if (!open || !shellRef.current) return;
    const shell = shellRef.current;
    const next = [];
    if (interactRef.current) next.push({ key: 'interact', ...measureGuideHole(shell, interactRef.current, 8) });
    if (regBtnRef.current) next.push({ key: 'reg', ...measureGuideHole(shell, regBtnRef.current, 10) });
    setHoles(next);
  }, [open, shellRef, interactRef, regBtnRef]);

  React.useLayoutEffect(() => {
    if (!open) return;
    updateHoles();
    const t = setTimeout(updateHoles, 80);
    window.addEventListener('resize', updateHoles);
    const scrollEl = shellRef.current?.querySelector('[data-appmine-scroll]');
    scrollEl?.addEventListener('scroll', updateHoles, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateHoles);
      scrollEl?.removeEventListener('scroll', updateHoles);
    };
  }, [open, updateHoles, shellRef]);

  if (!open || !holes.length) return null;
  const shellH = shellRef.current?.offsetHeight || 800;
  const shellW = shellRef.current?.offsetWidth || 400;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, pointerEvents: 'auto' }} aria-hidden={false}>
      <svg width={shellW} height={shellH} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <defs>
          <mask id={APP_MINE_GUIDE_MASK_ID}>
            <rect width="100%" height="100%" fill="white" />
            {holes.map(h => (
              <rect key={h.key} x={h.holeLeft} y={h.holeTop} width={h.holeW} height={h.holeH} rx="18" fill="black" />
            ))}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.58)" mask={`url(#${APP_MINE_GUIDE_MASK_ID})`} />
      </svg>
      {holes.map(h => {
        if (h.key === 'interact') {
          return (
            <div key={h.key} style={{ position: 'absolute', top: h.top, left: h.left, width: h.width, height: h.height, zIndex: 2 }}>
              <AppMineInteractStats stats={interactStats} onClick={onInteractClick} highlighted />
            </div>
          );
        }
        if (h.key === 'reg' && regService) {
          return (
            <div key={h.key} style={{ position: 'absolute', top: h.top, left: h.left, width: h.width, height: h.height, zIndex: 2 }}>
              <AppMineServiceBtn s={regService} highlighted onClick={onRegClick}
                style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function AppMineBottomNav({ active = 'my' }) {
  const tabs = [
    { key: 'home', label: '首页', icon: 'home' },
    { key: 'food', label: '悦全食', icon: 'gift' },
    { key: 'staff', label: '职工之家', icon: 'users' },
    { key: 'cart', label: '购物车', icon: 'cart' },
    { key: 'my', label: '我的', icon: 'user' },
  ];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 58, background: 'var(--surface)',
      borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'stretch', paddingBottom: 4, zIndex: 40 }}>
      {tabs.map(t => {
        const on = t.key === active;
        return (
          <div key={t.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Icon name={t.icon} size={22} style={{ color: on ? 'var(--brand)' : 'var(--ink-3)' }} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 600, color: on ? 'var(--brand)' : 'var(--ink-3)' }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function AppMineApp() {
  const shell = useInterestMobileState();
  const { nav } = shell;
  const shellRef = React.useRef(null);
  const interactRef = React.useRef(null);
  const regBtnRef = React.useRef(null);
  const [guideOpen, setGuideOpen] = React.useState(true);
  const noop = () => {};
  const goRegistrations = () => { setGuideOpen(false); nav.go('myRegistrations'); };
  const goInteract = (tab) => { setGuideOpen(false); nav.go('mineInteract', { tab }); };
  const interactStats = appMineInteractStats(shell.store.acts);

  const orderItems = [
    { label: '待付款', icon: 'wallet', color: '#5B8DEF' },
    { label: '已付款', icon: 'coin', color: '#F5A623' },
    { label: '待收货/使用', icon: 'truck', color: '#4A9FE8' },
    { label: '已完成', icon: 'listOl', color: '#52C41A' },
    { label: '售后', icon: 'headset', color: '#8B7AE8' },
  ];

  const services = [
    { label: '福利申领', icon: 'gift', bg: 'linear-gradient(145deg,#FFE8E3,#FFD4CC)', color: '#E85D4A', onClick: noop },
    { label: '客服中心', icon: 'headset', bg: 'linear-gradient(145deg,#E3F0FF,#C8E4FF)', color: '#3B82F6', onClick: noop },
    { label: '收货地址', icon: 'pin', bg: 'linear-gradient(145deg,#FFF0E0,#FFE0C2)', color: '#F97316', onClick: noop },
    { label: '我的收藏', icon: 'star', bg: 'linear-gradient(145deg,#FFF8D6,#FFECB0)', color: '#EAB308', onClick: noop },
    { label: '我的报名', icon: 'ticket', bg: 'linear-gradient(145deg,#EDE8FF,#D8CCFF)', color: '#7C5CFC', onClick: goRegistrations },
    { label: '我的LIFE', icon: 'globe', bg: 'linear-gradient(145deg,#E0F7EE,#C4EFDC)', color: '#22C55E', onClick: noop },
    { label: 'IM', icon: 'chat', bg: 'linear-gradient(145deg,#FFE8F0,#FFD0E4)', color: '#EC4899', onClick: noop },
  ];

  const card = { background: 'var(--surface)', borderRadius: 16, boxShadow: 'var(--shadow-sm)' };

  const regService = services.find(s => s.label === '我的报名');

  React.useLayoutEffect(() => {
    if (!guideOpen) return;
    const el = interactRef.current || regBtnRef.current;
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [guideOpen]);

  return (
    <MobileCtx.Provider value={shell}>
      <MobileStackOverlay stack={shell.stack}>
        <div ref={shellRef} style={{ position: 'absolute', inset: 0 }}>
        <ScreenScroll insetBottom={58} data-appmine-scroll style={{ pointerEvents: guideOpen ? 'none' : 'auto' }}>
          <div style={{ padding: '12px 14px 20px', background: 'var(--bg)' }}>
            {/* 顶栏：头像 + 手机号 + 快捷入口 + 付款码 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
              <Avatar name={DB.ME} size={48} />
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', paddingTop: 12, flex: 1, minWidth: 0 }}>{APP_MINE_PHONE}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexShrink: 0 }}>
                <AppMineHeaderAction icon="card" label="绑卡" onClick={noop} />
                <AppMineHeaderAction icon="bell" label="消息" onClick={noop} />
                <AppMineHeaderAction icon="settings" label="设置" onClick={noop} />
                <button type="button" onClick={noop} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginLeft: 2 }}>
                  <div style={{ padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(135deg, oklch(0.72 0.19 36), oklch(0.62 0.2 32))',
                    boxShadow: '0 4px 14px color-mix(in oklch, var(--brand) 35%, transparent)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Icon name="grid" size={22} style={{ color: '#fff' }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>付款码</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 钱包卡片 */}
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12, boxShadow: '0 8px 24px color-mix(in oklch, var(--brand) 28%, transparent)' }}>
              <div style={{ background: 'linear-gradient(135deg, oklch(0.72 0.19 36), oklch(0.58 0.2 32))', padding: '14px 16px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="coin" size={16} style={{ color: '#FFE8A0' }} fill />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>我的余额</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{APP_MINE_BALANCE}</span>
                  </div>
                  <button type="button" onClick={noop} style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.9)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    进入钱包<Icon name="chevR" size={14} style={{ color: 'rgba(255,255,255,0.9)' }} />
                  </button>
                </div>
              </div>
              <div style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFFBF5 100%)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderRight: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>0</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: '#FFE8E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="ticket" size={14} style={{ color: '#E85D4A' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>卡券</span>
                  </div>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{APP_MINE_BALANCE}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: '#FFF0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand)' }}>豆</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>悦豆</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 我的订单 */}
            <div style={{ ...card, padding: '14px 12px 16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '0 4px' }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>我的订单</span>
                <button type="button" onClick={noop} style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  全部<Icon name="chevR" size={15} />
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {orderItems.map(o => (
                  <button key={o.label} type="button" onClick={noop} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in oklch, ${o.color} 12%, white)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={o.icon} size={22} style={{ color: o.color }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.25, whiteSpace: 'pre-wrap' }}>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 用户账单 */}
            <button type="button" onClick={noop} style={{ ...card, width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', marginBottom: 12, textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'color-mix(in oklch, var(--brand) 14%, white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="receipt" size={20} style={{ color: 'var(--brand)' }} />
              </div>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>用户账单</span>
              <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}>查看<Icon name="chevR" size={15} /></span>
            </button>

            {/* 点赞 / 收藏 / 评论（应用服务上方） */}
            <div ref={interactRef} style={guideOpen ? { visibility: 'hidden' } : undefined}>
              <AppMineInteractStats stats={interactStats} onClick={goInteract} />
            </div>

            {/* 应用服务 */}
            <div style={{ ...card, padding: '14px 12px 18px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, padding: '0 4px' }}>应用服务</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px 8px' }}>
                {services.map(s => (
                  <AppMineServiceBtn key={s.label} s={s}
                    btnRef={s.label === '我的报名' ? regBtnRef : null}
                    onClick={guideOpen ? noop : s.onClick}
                    style={guideOpen && s.label === '我的报名' ? { visibility: 'hidden' } : undefined} />
                ))}
              </div>
            </div>
          </div>
        </ScreenScroll>
        <div style={{ pointerEvents: guideOpen ? 'none' : 'auto' }}><AppMineBottomNav active="my" /></div>
        <AppMineGuideOverlay open={guideOpen && !shell.stack.length} shellRef={shellRef}
          interactRef={interactRef} regBtnRef={regBtnRef} interactStats={interactStats}
          onInteractClick={goInteract} regService={regService} onRegClick={goRegistrations} />
        </div>
      </MobileStackOverlay>
    </MobileCtx.Provider>
  );
}

Object.assign(window, { MobileApp, MobileAppEmpty, ImMobileApp, AppMineApp, ScreenScroll, HomeTab, MomentsFeed, PostMoment, AllActivities, AllGroups, MyActivities, MyRegistrations, MyGroups });

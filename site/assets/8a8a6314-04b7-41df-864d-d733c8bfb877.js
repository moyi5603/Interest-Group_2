// mobile-im.jsx — 沟通引擎: conversation list, AI chat (小趣), notifications, group chat.

const IM_FILTER_TABS = ['全部', '未读', '@我', '群聊', '私聊'];

function convoMatchesFilter(c, tab) {
  if (tab === '未读') return c.unread > 0;
  if (tab === '@我') return !!c.prefix && c.prefix.includes('@');
  if (tab === '群聊') return c.kind === 'group';
  if (tab === '私聊') return c.kind === 'dm';
  return true;
}

function ConvoAvatar({ c }) {
  const box = { width: 50, height: 50, borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
  if (c.kind === 'ai') {
    return <div style={{ ...box, background: 'var(--ai-grad)' }}><Sparkles size={28} color="#fff" /></div>;
  }
  if (c.kind === 'notify') {
    return <div style={{ ...box, background: c.seed === 'hr' ? 'var(--sun-soft)' : 'var(--ai-soft)', color: c.seed === 'hr' ? 'var(--sun)' : 'var(--ai)' }}>
      <Icon name="bell" size={26} stroke={2.2} /></div>;
  }
  if (c.kind === 'dm') {
    return <Avatar name={c.name} size={50} style={{ borderRadius: 16 }} />;
  }
  const g = DB.groups.find(x => x.id === c.seed);
  const letter = (g && g.name) ? g.name.slice(0, 1) : '群';
  const catColor = g ? CATS[g.cat].color : 'var(--brand)';
  return (
    <div style={{ ...box, background: `color-mix(in oklch, ${catColor} 18%, white)` }}>
      {g ? <Photo seed={c.seed} icon={CATS[g.cat].icon} /> : <span style={{ fontSize: 18, fontWeight: 800, color: catColor }}>{letter}</span>}
    </div>
  );
}

function ConvoList() {
  const { nav } = useM();
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('全部');

  const list = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return DB.convos
      .filter(c => convoMatchesFilter(c, filter))
      .filter(c => !qq || c.name.toLowerCase().includes(qq) || c.preview.toLowerCase().includes(qq))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [q, filter]);

  const openConvo = (c) => {
    if (c.kind === 'ai') nav.go('aichat');
    else if (c.kind === 'notify') nav.go('notify');
    else nav.go('groupchat', { cid: c.id });
  };

  return (
    <div style={{ padding: '0 0 24px' }}>
      <div style={{ padding: '14px 14px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 14,
          background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          <Icon name="search" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索联系人或消息"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--ink)' }} />
        </div>
        <div className="noscroll" style={{ display: 'flex', gap: 18, marginTop: 12, overflowX: 'auto', paddingBottom: 2 }}>
          {IM_FILTER_TABS.map(tab => (
            <button key={tab} type="button" onClick={() => setFilter(tab)} style={{ flexShrink: 0, padding: '0 0 6px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: filter === tab ? 700 : 500, color: filter === tab ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: filter === tab ? '2px solid var(--brand)' : '2px solid transparent' }}>{tab}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {list.length ? list.map(c => (
          <div key={c.id} onClick={() => openConvo(c)}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ position: 'relative' }}>
              <ConvoAvatar c={c} />
              {c.unread > 0 && <div style={{ position: 'absolute', top: -4, right: -4, minWidth: 19, height: 19, padding: '0 5px',
                borderRadius: 99, background: 'var(--brand)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex',
                alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px var(--bg)' }}>{c.unread > 99 ? '99+' : c.unread}</div>}
              {c.online && <div style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: '50%',
                background: 'var(--c-outdoor)', border: '2px solid var(--bg)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }} className="clamp1">{c.name}</span>
                  {c.official && <span style={{ flexShrink: 0, padding: '2px 6px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                    color: 'var(--brand)', background: 'color-mix(in oklch, var(--brand) 12%, white)' }}>官方</span>}
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--ink-3)', flexShrink: 0 }}>{c.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
                <div style={{ fontSize: 13, color: c.unread ? 'var(--ink-2)' : 'var(--ink-3)', fontWeight: c.unread ? 600 : 400, minWidth: 0 }} className="clamp1">
                  {c.prefix && <span style={{ color: c.prefixRed ? 'var(--brand)' : 'var(--ai)', fontWeight: 700 }}>{c.prefix} </span>}
                  {c.preview}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {c.pinned && <Icon name="pin" size={14} style={{ color: 'var(--ink-3)' }} stroke={2} />}
                  {c.muted && <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>免打扰</span>}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13.5, color: 'var(--ink-3)' }}>暂无匹配的会话</div>
        )}
      </div>
    </div>
  );
}

// mini group card inside chat
function ChatGroupCard({ g, reason }) {
  const { store, actions, nav } = useM();
  const cur = store.groups.find(x => x.id === g.id) || g;
  const gs = groupMemberState(cur);
  const jb = gs === 'member' ? { label: '已加入', icon: 'check', variant: 'ghost', disabled: true }
    : gs === 'pending' ? { label: '审核中', icon: 'clock', variant: 'ghost', disabled: true }
    : { label: cur.join === 'approve' ? '申请加入' : '加入小组', icon: 'plus', variant: 'primary', disabled: false };
  return (
    <div onClick={() => nav.go('group', { gid: g.id })} style={{ background: 'var(--surface)', borderRadius: 16,
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden', cursor: 'pointer', width: 230, flexShrink: 0 }}>
      <div style={{ height: 84, position: 'relative' }}><Photo seed={g.id + g.cat} icon={CATS[g.cat].icon} dim />
        <div style={{ position: 'absolute', top: 8, left: 8 }}><CatBadge cat={g.cat} size="sm" solid /></div></div>
      <div style={{ padding: 11 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }} className="clamp1">{g.name}</div>
        {reason && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, padding: '3px 8px',
          borderRadius: 99, background: 'var(--ai-soft)', maxWidth: '100%' }}>
          <Sparkles size={11} color="var(--ai)" />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ai)', lineHeight: 1.3 }} className="clamp1">{reason}</span>
        </div>}
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '6px 0 9px' }}>{cur.members} 位成员 · {cur.acts} 场活动</div>
        <Btn variant={jb.variant} size="sm" full icon={jb.icon} disabled={jb.disabled}
          style={jb.disabled ? { opacity: 0.55 } : undefined}
          onClick={e => { e.stopPropagation(); if (!jb.disabled) actions.toggleJoin(g.id); }}>{jb.label}</Btn>
      </div>
    </div>
  );
}

// mini activity card inside chat
function ChatActCard({ a }) {
  const { store, actions, nav } = useM();
  const cur = store.acts.find(x => x.id === a.id) || a;
  return (
    <div onClick={() => nav.go('activity', { aid: a.id })} style={{ background: 'var(--surface)', borderRadius: 16,
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden', cursor: 'pointer', width: 230 }}>
      <div style={{ height: 84, position: 'relative' }}><Cover src={a.cover} seed={a.id + a.cat} icon={CATS[a.cat].icon} dim />
        <div style={{ position: 'absolute', top: 8, left: 8 }}><CatBadge cat={a.cat} size="sm" solid /></div></div>
      <div style={{ padding: 11 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }} className="clamp1">{a.title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '3px 0 9px' }}>{ActWhen.isCross(a) ? `${ActWhen.short(a.date)} → ${ActWhen.short(a.endDate)}` : ActWhen.short(a.date)} · 余 {a.cap - cur.signed} 位</div>
        <Btn variant={cur.joinedByMe ? 'ghost' : 'primary'} size="sm" full icon={cur.joinedByMe ? 'check' : 'ticket'}
          onClick={e => { e.stopPropagation(); actions.toggleSignup(a.id); }}>{cur.joinedByMe ? '已报名' : '报名'}</Btn>
      </div>
    </div>
  );
}

function Bubble({ side, children, ai }) {
  return (
    <div style={{ display: 'flex', justifyContent: side === 'me' ? 'flex-end' : 'flex-start', gap: 9 }}>
      {side === 'ai' && <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--ai-grad)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}><Sparkles size={19} color="#fff" /></div>}
      <div style={{ maxWidth: '80%', padding: '11px 14px', borderRadius: side === 'me' ? '18px 18px 5px 18px' : '5px 18px 18px 18px',
        background: side === 'me' ? 'var(--brand)' : 'var(--surface)', color: side === 'me' ? '#fff' : 'var(--ink)',
        fontSize: 14.5, lineHeight: 1.6, boxShadow: side === 'me' ? 'var(--shadow-brand)' : 'var(--shadow-sm)', fontWeight: side === 'me' ? 500 : 400,
        whiteSpace: 'pre-line' }}>
        {children}
      </div>
    </div>
  );
}

const AI_DIV = '━━━━━━━━━━━━━━━━━━━━━━━━';
const AI_ACT_REC = '为你推荐以下活动';
const AI_GUIDE = 'Hi，我能帮你做这些事：\n\n🎯 推荐活动 — "推荐适合我的活动"\n🔍 搜索活动 — "有没有摄影活动"\n👥 搜索小组 — "有没有篮球组"\n📅 按条件筛选 — "下周有什么活动"\n🔥 热门排行 — "最近哪个最火"\n📋 查看详情 — "XX活动做什么"\n\n你想了解什么？😊';

function aiUpcomingActs() {
  return DB.acts.filter(a => a.status !== 'ended');
}
function aiHotActs(n = 3) {
  return [...aiUpcomingActs()].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, n);
}
function aiActiveGroups(n = 3) {
  return [...DB.groups].sort((a, b) => b.members - a.members || b.acts - a.acts).slice(0, n);
}
function aiGroupName(a) {
  const g = DB.groups.find(x => x.id === a.gid);
  return g ? g.name : '';
}
function aiActStatus(a) {
  const left = a.cap - a.signed;
  if (left <= 0) return '已满';
  if (left <= 3) return '即将满员';
  return '可报名';
}
function aiTrendLabel(a) {
  if (a.ai || !(a.likes || 0)) return '✨ 新晋热门';
  if (a.signed / a.cap > 0.8) return '🔥 即将满员';
  if ((a.likes || 0) >= 80) return '📈 持续升温';
  return '✅ 稳定热门';
}

/** 从用户句子里提取小组搜索关键词 */
function extractGroupKeyword(text) {
  return text
    .replace(/我想加入|想加入|有没有|找|搜索|相关的|相关|类|的|圈子|群组|社群|社团|小组/g, '')
    .replace(/组$/g, '')
    .trim();
}

/** 从用户句子里提取活动搜索关键词 */
function extractActivityKeyword(text) {
  if (/摄影|拍照/.test(text)) return '摄影';
  if (/编程|Go|go语言|讲座/.test(text)) return '编程';
  if (/羽毛球|羽球/.test(text)) return '羽毛球';
  if (/徒步|户外/.test(text)) return '户外';
  if (/篮球/.test(text)) return '篮球';
  if (/桌游|电竞|阿瓦隆/.test(text)) return '桌游';
  return text
    .replace(/有没有|找|搜索|搜一下|我想找|有没有教|教|相关的|相关|的活动|活动|吗|？|\?/g, '')
    .trim()
    .slice(0, 8);
}

/** 场景 C · 搜索小组 — 按关键词匹配 Mock 小组 */
function resolveGroupSearch(text) {
  const presets = [
    { test: /新人|新手|适合新人/, keyword: '新人友好', items: [
      { gid: 'g5', reason: '新手教学 · 自由加入' },
      { gid: 'g3', reason: '不催进度 · 氛围友好' },
    ] },
    { test: /羽毛球|羽球/, keyword: '羽毛球', items: [{ gid: 'g8', reason: '每周二四 · 场地已包' }] },
    { test: /桌游|电竞|游戏|阿瓦隆|狼人/, keyword: '桌游', items: [{ gid: 'g5', reason: '每周开局 · 五黑常驻' }] },
    { test: /读书|学习|围读/, keyword: '读书', items: [{ gid: 'g3', reason: '不打卡不焦虑 · 双周一围读' }] },
    { test: /设计|视觉|UI|UX|创意/, keyword: '设计', items: [{ gid: 'g9', reason: 'UI/UX · 设计分享 · 作品互评' }] },
    { test: /电影|观影|音乐|弹唱|影像|摄影/, keyword: '观影', items: [{ gid: 'g4', reason: '每周放映 · 影乐分享 · 偶尔开麦' }] },
    { test: /运动|跑步|夜跑|徒步|户外/, keyword: '运动', items: [
      { gid: 'g1', reason: '城市夜跑 · 零基础友好' },
      { gid: 'g2', reason: '周末徒步 · 装备互助' },
    ] },
    { test: /职场|成长|汇报|表达/, keyword: '职场成长', items: [{ gid: 'g6', reason: '经验分享 · 简历互助 · 需审核' }] },
    { test: /公益|志愿/, keyword: '公益', items: [{ gid: 'g7', reason: '月度活动 · 工会支持' }] },
  ];
  for (const p of presets) {
    if (p.test.test(text)) return { keyword: p.keyword, items: p.items };
  }
  const kw = extractGroupKeyword(text);
  if (kw) {
    const hits = DB.groups.filter(g => {
      const blob = [g.name, g.intro, ...(g.tags || [])].join(' ');
      return blob.includes(kw);
    }).map(g => ({ gid: g.id, reason: `${g.members} 位成员 · ${g.acts} 场活动` }));
    if (hits.length) return { keyword: kw, items: hits.slice(0, 3) };
    return { keyword: kw, items: [] };
  }
  return { keyword: '', items: [] };
}

function formatGroupSearchReply({ keyword, items }) {
  if (!items.length) {
    const kw = keyword || '该关键词';
    const active = aiActiveGroups(3);
    const lines = active.map((g, i) => `${i + 1}️⃣ 【${g.name}】— 👥 ${g.members}人 · 本月${g.acts}场活动`);
    return {
      groupCards: active.map(g => ({ gid: g.id, reason: `${g.members} 位成员 · ${g.acts} 场活动` })),
      answer: [
        `🔍 搜索小组「${kw}」`,
        '',
        AI_DIV,
        `暂未找到与「${kw}」相关的小组`,
        '',
        '💡 你可以试试：',
        '· 换个关键词搜',
        '· 看看活跃小组 👇',
        '',
        '📌 当前活跃小组：',
        ...lines,
        AI_DIV,
        '',
        '💬 如果公司还没有你想要的小组，可以联系管理员建议新建哦～',
        '',
        '想加入已有的活跃小组，还是换个词再搜？🔍',
      ].join('\n'),
    };
  }
  const gLines = items.map((it, i) => {
    const g = DB.groups.find(x => x.id === it.gid);
    if (!g) return '';
    const join = g.joined ? '已加入' : '未加入';
    return `${i + 1}️⃣ 【${g.name}】\n🏷 ${(g.tags || []).slice(0, 3).join(' · ')}\n👥 ${g.members}名成员 · 本月${g.acts}场活动\n→ ${it.reason}\n✅ ${join}`;
  }).filter(Boolean);
  return {
    groupCards: items,
    answer: [
      `🔍 搜索小组「${keyword}」`,
      '',
      AI_DIV,
      `找到 ${items.length} 个小组`,
      '',
      ...gLines,
      AI_DIV,
      '',
      '想加入哪个小组？或者看看它们最近有什么活动？👇',
    ].join('\n'),
  };
}

/** 场景 B · 搜索活动 */
function resolveActivitySearch(text) {
  const presets = [
    { test: /羽毛球|羽球/, keyword: '羽毛球', ids: ['a5'], brief: '周四晚体育馆已包 4 片场地，可借拍' },
    { test: /摄影|拍照/, keyword: '摄影', ids: ['a16'], brief: '沿滨江步道拍日落与街景，零基础可报名' },
    { test: /编程|Go|go语言|讲座/, keyword: '编程', ids: ['a13', 'a14'], brief: 'Go 语言系列，按场次独立报名' },
    { test: /徒步|户外/, keyword: '户外', ids: ['a8', 'a2'], brief: '周末山野线路，领队持证全程保障' },
    { test: /桌游|电竞|阿瓦隆/, keyword: '桌游', ids: ['a3'], brief: '午休快开一局，新手有人带' },
  ];
  for (const p of presets) {
    if (p.test.test(text)) return { keyword: p.keyword, ids: p.ids, brief: p.brief };
  }
  const kw = extractActivityKeyword(text);
  if (kw) {
    const hits = aiUpcomingActs().filter(a => {
      const g = DB.groups.find(x => x.id === a.gid);
      const blob = [a.title, a.cat, ...(a.tags || []), g?.name, ...(g?.tags || [])].join(' ');
      return blob.includes(kw);
    });
    if (hits.length) return { keyword: kw, ids: hits.slice(0, 3).map(a => a.id), brief: null };
    return { keyword: kw, ids: [], brief: null };
  }
  if (/有没有/.test(text) && /活动/.test(text)) {
    return { keyword: '活动', ids: ['a5'], brief: null };
  }
  return { keyword: '', ids: [], brief: null };
}

function formatActivitySearchReply({ keyword, ids, brief }) {
  if (!ids.length) {
    const kw = keyword || '该关键词';
    const hot = aiHotActs(3);
    const lines = hot.map((a, i) => `${i + 1}️⃣ 【${a.title}】— ${aiGroupName(a)} · ${ActWhen.short(a.date)}`);
    return {
      cards: hot.map(a => a.id),
      answer: [
        `🔍 搜索活动「${kw}」`,
        '',
        AI_DIV,
        `暂未找到与「${kw}」相关的活动`,
        '',
        '💡 你可以试试：',
        '· 换个关键词搜（如搜"摄影"而不是"拍照"）',
        '· 看看当前热门活动 👇',
        '',
        '🎯 为你推荐热门活动：',
        ...lines,
        AI_DIV,
        '',
        '对热门活动感兴趣，还是想换个词再搜？🔍',
      ].join('\n'),
    };
  }
  const acts = ids.map(id => DB.acts.find(a => a.id === id)).filter(Boolean);
  const aLines = acts.map((a, i) => {
    const cat = CATS[a.cat]?.label || a.cat;
    return `${i + 1}️⃣ 【${a.title}】\n🏷 ${aiGroupName(a)} · ${cat}\n📅 ${ActWhen.short(a.date)}\n→ ${brief || (a.tags || []).slice(0, 2).join(' · ') || '详情见卡片'}\n✅ ${aiActStatus(a)}`;
  });
  return {
    cards: ids,
    answer: [
      `🔍 搜索活动「${keyword}」`,
      '',
      AI_DIV,
      `找到 ${ids.length} 个活动`,
      '',
      ...aLines,
      AI_DIV,
      '',
      '想看哪个活动的详细介绍？📋',
    ].join('\n'),
  };
}

/** 场景 D · 按条件筛选 */
function resolveFilter(text) {
  const hasBasketball = /篮球/.test(text);
  const hasCareer = (/职场|成长营|职场成长/.test(text)) && !/小组|组|圈子/.test(text);
  const hasWeek = /本周|这周/.test(text);
  const hasNextWeek = /下周/.test(text);
  const hasWeekend = /周末/.test(text);
  const hasRecent = /最近|近期/.test(text);
  const hasNextMonth = /下个月/.test(text);

  if (hasNextMonth) {
    return { condition: hasBasketball ? '下个月 · 篮球' : '下个月', ids: [], chipShort: false };
  }
  if (hasNextWeek) {
    if (hasBasketball) {
      return { condition: '下周 · 篮球', ids: [], chipShort: false };
    }
    return { condition: '下周', ids: ['a4', 'a14'], chipShort: false };
  }
  if (hasWeekend) return { condition: '本周末', ids: ['a2', 'a22'], chipShort: false };
  if (hasWeek) return { condition: '本周', ids: ['a3', 'a1', 'a5'], chipShort: true };
  if (hasRecent) {
    const hot = aiHotActs(3);
    return { condition: '近期', ids: hot.map(a => a.id), chipShort: false };
  }
  if (hasCareer) return { condition: '职场成长', ids: ['a14', 'a15'], chipShort: /活动/.test(text) };
  return { condition: '', ids: [], chipShort: false };
}

function formatFilterReply({ condition, ids, chipShort }) {
  if (chipShort && ids.length) {
    return { cards: ids, answer: AI_ACT_REC };
  }
  if (!ids.length) {
    const hot = aiHotActs(3);
    const lines = hot.map((a, i) => `${i + 1}️⃣ 【${a.title}】— ${aiGroupName(a)} · ${ActWhen.short(a.date)}`);
    return {
      cards: hot.map(a => a.id),
      answer: [
        `📅 筛选结果：${condition}`,
        '',
        AI_DIV,
        '暂未找到符合条件的活动',
        '',
        '💡 你可以试试：',
        '· 扩大时间范围（搜"近期"而不是"下周"）',
        '· 去掉类别筛选（搜"下周有什么活动"）',
        '· 看看近期热门活动 👇',
        '',
        '🔥 近期热门活动：',
        ...lines,
        AI_DIV,
        '',
        '想换个条件试试，还是看看这些热门活动？🔍',
      ].join('\n'),
    };
  }
  const acts = ids.map(id => DB.acts.find(a => a.id === id)).filter(Boolean);
  const aLines = acts.map((a, i) => {
    const left = a.cap - a.signed;
    const status = left <= 0 ? '已满' : left <= 3 ? '即将满员' : '名额充足';
    return `${i + 1}️⃣ 【${a.title}】\n🏷 ${aiGroupName(a)}\n📅 ${ActWhen.short(a.date)} · ${a.loc?.split('·')[0]?.trim() || a.loc}\n👥 ${a.signed}/${a.cap}人 · ${status}`;
  });
  return {
    cards: ids,
    answer: [
      `📅 筛选结果：${condition}`,
      '',
      AI_DIV,
      `找到 ${ids.length} 个活动`,
      '',
      ...aLines,
      AI_DIV,
      '',
      '需要帮你报名吗？🙋',
    ].join('\n'),
  };
}

/** Mock 意图识别 · v1.2 对齐 Prompt 文档（原型用规则模拟 LLM 层） */
function detectIntent(text) {
  if (/做什么|怎么样|介绍|多少人|详情/.test(text)) {
    return { intent: 'detail', confidence: 0.9 };
  }
  if (/最火|热门|大家都在|流行|排行/.test(text)) {
    return { intent: 'trending', confidence: 0.85 };
  }
  const isNewcomerGroup = /新人|新手/.test(text) || ((/推荐|适合/.test(text)) && /小组/.test(text));
  const isGroupEntity = /组|群组|圈子|社群|社团/.test(text) && !/活动/.test(text) && !/教/.test(text);
  const isGroupJoin = /加入/.test(text) && !/活动|报名/.test(text);
  if (isNewcomerGroup || isGroupEntity || isGroupJoin || (/有没有/.test(text) && /组/.test(text))) {
    return { intent: 'search_group', confidence: 0.85 };
  }
  const hasTimeFilter = /下周|本周|这周|周末|最近|近期|下个月/.test(text);
  const isFilter = hasTimeFilter
    || /篮球赛/.test(text)
    || (/职场|成长营|职场成长/.test(text) && /活动/.test(text));
  if (isFilter) {
    return { intent: 'filter', confidence: 0.85 };
  }
  // recommend 优先于 search_activity，但次于 filter（「周末有什么活动」应走筛选）
  const isRecommend = /推荐|好玩的|有什么推荐|帮我找活动/.test(text)
    || (/适合我|适合我的/.test(text) && /活动/.test(text))
    || (/有什么活动/.test(text) && !hasTimeFilter && !/职场|成长营|职场成长/.test(text));
  if (isRecommend) {
    return { intent: 'recommend', confidence: 0.85 };
  }
  const isActivityEntity = /教|讲座|搜一下|有没有教|找.*相关|参加|徒步/.test(text)
    || (/有没有|找|搜/.test(text) && /活动/.test(text))
    || (/有没有|找|搜/.test(text) && !/组|圈子|社群|社团/.test(text))
    || /羽毛球|摄影|拍照|编程|Go|户外|桌游/.test(text);
  if (isActivityEntity) {
    return { intent: 'search_activity', confidence: 0.8 };
  }
  if (/^[啊哈嗯哦呵]+[！!？?…]*$/.test(text.trim()) || text.trim().length <= 1) {
    return { intent: 'unknown', confidence: 0.2 };
  }
  return { intent: 'unknown', confidence: 0.5 };
}

/** 原型意图路由 · v1.2 七场景 · 对齐 Prompt 兴趣小组AI助手-会话场景设计.md */
function aiChatReply(text) {
  let cards = [], groupCards = [], answer;
  const { intent, confidence } = detectIntent(text);

  if (confidence < 0.6) {
    answer = AI_GUIDE;
    return { cards, groupCards, answer };
  }

  // F 查看详情
  if (intent === 'detail') {
    if (/桌游|电竞|阿瓦隆|狼人/.test(text)) {
      const g = DB.groups.find(x => x.id === 'g5');
      groupCards = [{ gid: 'g5', reason: `${g ? g.members : 142} 名成员` }];
      answer = [
        '📊 小组档案',
        '',
        AI_DIV,
        '【桌游电竞局】',
        `👥 ${g ? g.members : 142} 名成员`,
        '🏷 每周开局 · 新手教学 · 五黑常驻',
        `📅 本月活动：${g ? g.acts : 40} 场`,
        '',
        '🚀 当前热门活动',
        '· 午休快开一局 · 阿瓦隆 — 06月03日 · 已报名 8 人',
        '',
        '👤 加入状态：已加入',
        AI_DIV,
        '',
        '要加入吗？加入后可第一时间收到活动通知 👇',
      ].join('\n');
      return { cards, groupCards, answer };
    }
    if (/夜跑|跑步|8K|滨江/.test(text)) {
      cards = ['a1'];
      answer = [
        '📋 活动详情',
        '',
        AI_DIV,
        '【滨江 8K 夜跑 · 江风配速团】',
        '🏷 城市夜跑团 · 运动',
        '📅 每周四 19:30-21:00 · 滨江园区南门',
        '👥 27/40人 · ❤️ 86赞',
        '',
        '📌 沿滨江绿道往返 8 公里，分 6′30″ / 6′00″ / 5′30″ 三组',
        '👤 零基础友好，有陪跑员',
        '🎒 穿跑鞋即可，建议带水杯',
        '✅ 你已报名 · 本周四场次',
        AI_DIV,
        '',
        '需要报名吗？或者看看同类活动 ↗',
      ].join('\n');
      return { cards, groupCards, answer };
    }
    if (/羽毛球/.test(text)) {
      cards = ['a5'];
      answer = [
        '📋 活动详情',
        '',
        AI_DIV,
        '【周四羽毛球娱乐局 · 水平不限】',
        '🏷 羽毛球俱乐部 · 运动',
        '📅 每周四 18:30-20:30 · 体育馆 1-4 号场',
        '👥 30/32人 · 即将满员',
        '',
        '📌 已包 4 片场地，娱乐局与水平局分区',
        '👤 新手有人带，无拍可现场借',
        '✅ 尚有 2 个名额',
        AI_DIV,
        '',
        '需要帮你报名吗？',
      ].join('\n');
      return { cards, groupCards, answer };
    }
    answer = AI_GUIDE;
    return { cards, groupCards, answer };
  }

  // E 热门排行
  if (intent === 'trending') {
    const hot = aiHotActs(5);
    cards = hot.map(a => a.id);
    const lines = hot.map((a, i) => [
      `${i + 1}️⃣ 【${a.title}】`,
      `🏷 ${aiGroupName(a)} · ${aiTrendLabel(a)}`,
      `👥 ${a.signed}人已报名（剩余${Math.max(0, a.cap - a.signed)}个名额）`,
    ].join('\n'));
    answer = [
      '🔥 当前热门排行',
      '',
      AI_DIV,
      ...lines,
      AI_DIV,
      '',
      '想冲哪个？我帮你报名 🎯',
    ].join('\n');
    return { cards, groupCards, answer };
  }

  // C 搜索小组
  if (intent === 'search_group') {
    const r = formatGroupSearchReply(resolveGroupSearch(text));
    groupCards = r.groupCards;
    answer = r.answer;
    return { cards, groupCards, answer };
  }

  // B 搜索活动
  if (intent === 'search_activity') {
    const r = formatActivitySearchReply(resolveActivitySearch(text));
    cards = r.cards;
    answer = r.answer;
    return { cards, groupCards, answer };
  }

  // D 按条件筛选
  if (intent === 'filter') {
    const r = formatFilterReply(resolveFilter(text));
    cards = r.cards;
    answer = r.answer;
    return { cards, groupCards, answer };
  }

  // A 推荐活动（短文案 + 卡片，与 Chip 一致，详情见卡片）
  if (intent === 'recommend') {
    cards = ['a1', 'a22', 'a5'];
    answer = '🎯 为你推荐\n\n根据你的兴趣和近期参与记录，这 3 个活动值得看看：\n\n感兴趣哪个？点卡片查看详情或直接报名 👇';
    return { cards, groupCards, answer };
  }

  // G 兜底
  answer = AI_GUIDE;
  return { cards, groupCards, answer };
}

function AIChat() {
  const { nav, emptyMode } = useM();
  const [msgs, setMsgs] = React.useState(() => emptyMode ? [
    { id: 1, side: 'ai', text: '嗨 👋 我是小趣。当前暂无活动与小组数据,你可以去「全部活动」「我的小组」等页面查看空状态展示。' },
  ] : [
    { id: 1, side: 'ai', text: '嗨 林浅 👋 我是小趣。想找活动、找小组，或看看热门排行，直接告诉我就行~' },
    { id: 2, side: 'ai', cards: ['a1'], text: '顺便提醒：你报名的「滨江 8K 夜跑」本周四 19:30 开始，记得准时到～' },
  ]);
  const [val, setVal] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef(null);
  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, typing]);

  const reply = (text) => aiChatReply(text);
  const send = (text) => {
    const v = (text ?? val).trim(); if (!v) return;
    setMsgs(m => [...m, { id: Date.now(), side: 'me', text: v }]); setVal(''); setTyping(true);
    setTimeout(() => {
      const r = reply(v); setTyping(false);
      setMsgs(m => [...m, { id: Date.now() + 1, side: 'ai', text: r.answer, cards: r.cards, groupCards: r.groupCards }]);
    }, 1000);
  };
  const sugg = ['职场成长的活动有什么', '推荐适合新人的小组', '本周还有什么活动'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <ChatHeader title="你的兴趣助手" ai onBack={nav.back} />
      <div ref={scrollRef} className="noscroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <Bubble side={m.side} ai={m.side === 'ai'}>{m.text}</Bubble>
            {m.groupCards && m.groupCards.length > 0 && <div style={{ paddingLeft: m.side === 'ai' ? 43 : 0, display: 'flex', gap: 10, overflowX: 'auto' }} className="noscroll">
              {m.groupCards.map(item => {
                const gid = typeof item === 'string' ? item : item.gid;
                const g = DB.groups.find(x => x.id === gid);
                return g ? <ChatGroupCard key={gid} g={g} reason={typeof item === 'object' ? item.reason : undefined} /> : null;
              })}</div>}
            {m.cards && <div style={{ paddingLeft: m.side === 'ai' ? 43 : 0, display: 'flex', gap: 10, overflowX: 'auto' }} className="noscroll">
              {m.cards.map(id => { const a = DB.acts.find(x => x.id === id); return a ? <ChatActCard key={id} a={a} /> : null; })}</div>}
          </div>
        ))}
        {typing && <Bubble side="ai" ai><TypingDots color="var(--ai)" /></Bubble>}
      </div>
      <div style={{ padding: '8px 14px 0' }} className="noscroll">
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 8 }}>
          {sugg.map(s => <button key={s} onClick={() => send(s)} style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 99,
            background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>{s}</button>)}
        </div>
      </div>
      <div style={{ padding: '10px 14px', background: 'var(--surface)', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }}
          placeholder="和小悦说点什么…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, padding: '8px 0' }} />
        <button onClick={() => send()} style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--ai-grad)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="send" size={19} /></button>
      </div>
    </div>
  );
}

function ChatHeader({ title, sub, ai, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
      <button onClick={onBack} style={{ display: 'flex' }}><Icon name="back" size={24} /></button>
      {ai ? <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--ai-grad)', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} color="#fff" /></div>
        : <Avatar name={title} size={40} style={{ borderRadius: 12 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800 }} className="clamp1">{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: ai ? 'var(--ai)' : 'var(--ink-3)', fontWeight: 600 }}>{sub}</div>}
      </div>
      <button style={{ display: 'flex', color: 'var(--ink-3)' }}><Icon name="dots" size={22} /></button>
    </div>
  );
}

const NOTIF_META = {
  published: { icon: 'megaphone', color: 'var(--brand)' },
  signup: { icon: 'ticket', color: 'var(--c-outdoor)' },
  join: { icon: 'userPlus', color: 'var(--c-music)' },
  join_request: { icon: 'users', color: 'var(--c-photo)' },
  join_result: { icon: 'check', color: 'var(--c-outdoor)' },
  terminate: { icon: 'flag', color: 'var(--ink-3)' },
  disband: { icon: 'layers', color: 'var(--ink-3)' },
  starting_1h: { icon: 'clock', color: 'var(--brand)' },
  starting_1d: { icon: 'bell', color: 'var(--brand)' },
  ended: { icon: 'star', color: 'var(--c-reading)' },
  cancel: { icon: 'x', color: 'var(--ink-3)' },
  comment_reply: { icon: 'comment', color: 'var(--c-reading)' },
};
function notifMeta(n) {
  if (n.kind === 'join_result' && n.approved === false) return { icon: 'x', color: 'var(--ink-3)' };
  return NOTIF_META[n.kind] || { icon: 'bell', color: 'var(--ink-3)' };
}
function notifClickable(n) {
  return (n.linkTo === 'activity' && n.aid) || (n.linkTo === 'group' && n.gid);
}
function openNotif(nav, n) {
  if (n.linkTo === 'activity' && n.aid) nav.go('activity', { aid: n.aid });
  else if (n.linkTo === 'group' && n.gid) nav.go('group', { gid: n.gid });
}
function NotifyThread() {
  const { nav } = useM();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <ChatHeader title="沟通引擎" sub="活动 · 报名 · 入组 · 提醒 · 评论" onBack={nav.back} />
      <div className="noscroll" style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {DB.notifications.map(n => {
          const m = notifMeta(n);
          const clickable = notifClickable(n);
          return (
            <div key={n.id} onClick={() => openNotif(nav, n)}
              style={{ display: 'flex', gap: 12, padding: 13, marginBottom: 9, background: 'var(--surface)', borderRadius: 16,
                boxShadow: 'var(--shadow-sm)', cursor: clickable ? 'pointer' : 'default', alignItems: 'center',
                borderLeft: n.read ? 'none' : `3px solid ${m.color}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in oklch, ${m.color} 14%, white)`,
                color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={m.icon} size={20} stroke={2.2} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink)' }}>{n.text}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4 }}>{n.time}</div>
              </div>
              {clickable && <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />}
            </div>
          );
        })}
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', padding: '14px 0' }}>· 早些的通知已读 ·</div>
      </div>
    </div>
  );
}

function GroupChat({ cid }) {
  const { nav } = useM();
  const c = DB.convos.find(x => x.id === cid) || DB.convos[0];
  const g = c.kind === 'group' ? DB.groups.find(x => x.id === c.seed) : null;
  const chat = c.kind === 'dm' ? [
    { side: 'other', who: c.name, text: c.preview },
    { side: 'me', text: '好的,收到!' },
  ] : [
    { side: 'other', who: '沈星', text: '今晚五黑还差一个,有人来吗?' },
    { side: 'other', who: '林浅', text: '我我我,十分钟后上线' },
    { side: 'ai', text: '已为本群创建「五黑上分之夜 · 第 13 期」活动并开启报名,点击下方卡片即可加入 👇', cards: ['a3'] },
    { side: 'me', text: '报名了!指挥归我' },
  ];
  const sub = c.kind === 'group' ? `群聊 · ${g ? g.members : 0} 人` : '私聊';
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <ChatHeader title={c.name} sub={sub} onBack={nav.back} />
      <div className="noscroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {chat.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {m.side === 'other' && <div style={{ display: 'flex', gap: 9 }}>
              <Avatar name={m.who} size={34} />
              <div><div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 3, marginLeft: 2 }}>{m.who}</div>
                <Bubble side="other">{m.text}</Bubble></div></div>}
            {m.side !== 'other' && <Bubble side={m.side} ai={m.side === 'ai'}>{m.text}</Bubble>}
            {m.cards && <div style={{ paddingLeft: m.side === 'ai' ? 43 : 0, display: 'flex', justifyContent: m.side === 'ai' ? 'flex-start' : 'flex-end' }}>
              {m.cards.map(id => { const a = DB.acts.find(x => x.id === id); return a ? <ChatActCard key={id} a={a} /> : null; })}</div>}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 14px', background: 'var(--surface)', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'var(--bg-2)', borderRadius: 14, padding: '11px 14px', fontSize: 14, color: 'var(--ink-3)' }}>发消息…</div>
        <button style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="send" size={19} /></button>
      </div>
    </div>
  );
}

Object.assign(window, { ConvoList, AIChat, NotifyThread, GroupChat, ChatHeader, ChatActCard, ChatGroupCard, Bubble });

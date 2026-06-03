// mobile-im.jsx — 沟通引擎: conversation list, AI chat (小趣), notifications, group chat.

function ConvoList() {
  const { nav } = useM();
  return (
    <div style={{ padding: '0 14px 96px' }}>
      {/* AI quick entry banner */}
      <div onClick={() => nav.go('aichat')} style={{ margin: '4px 0 14px', borderRadius: 'var(--r-lg)', padding: 2,
        background: 'var(--ai-grad)', cursor: 'pointer' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 22, padding: 15, display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--ai-grad)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', animation: 'pulseRing 2.2s infinite' }}><Sparkles size={26} color="#fff" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>问问小趣 <AIPill style={{ verticalAlign: 'middle' }} /></div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>“帮我找周末的羽毛球活动”</div>
          </div>
          <Icon name="chevR" size={20} style={{ color: 'var(--ink-3)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {DB.convos.map(c => {
          const isAI = c.kind === 'ai', isNotify = c.kind === 'notify';
          return (
            <div key={c.id} onClick={() => nav.go(isAI ? 'aichat' : isNotify ? 'notify' : 'groupchat', { cid: c.id })}
              style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 8px', borderRadius: 16, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ position: 'relative' }}>
                {isAI ? <div style={{ width: 50, height: 50, borderRadius: 16, background: 'var(--ai-grad)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center' }}><Sparkles size={28} color="#fff" /></div>
                  : isNotify ? <div style={{ width: 50, height: 50, borderRadius: 16, background: 'var(--sun-soft)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--sun)' }}><Icon name="bell" size={26} stroke={2.2} /></div>
                    : <div style={{ width: 50, height: 50, borderRadius: 16, overflow: 'hidden' }}><Photo seed={c.seed} icon="users" /></div>}
                {c.unread > 0 && <div style={{ position: 'absolute', top: -4, right: -4, minWidth: 19, height: 19, padding: '0 5px',
                  borderRadius: 99, background: 'var(--brand)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px var(--surface)' }}>{c.unread}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }} className="clamp1">{c.name}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--ink-3)', flexShrink: 0, marginLeft: 8 }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 13, color: c.unread ? 'var(--ink-2)' : 'var(--ink-3)', marginTop: 3, fontWeight: c.unread ? 600 : 400 }} className="clamp1">{c.preview}</div>
              </div>
            </div>
          );
        })}
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
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '3px 0 9px' }}>{a.date} · 余 {a.cap - cur.signed} 位</div>
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
        fontSize: 14.5, lineHeight: 1.6, boxShadow: side === 'me' ? 'var(--shadow-brand)' : 'var(--shadow-sm)', fontWeight: side === 'me' ? 500 : 400 }}>
        {children}
      </div>
    </div>
  );
}

function AIChat() {
  const { nav } = useM();
  const [msgs, setMsgs] = React.useState([
    { id: 1, side: 'ai', text: '嗨 林浅 👋 我是小趣。最近想动一动还是想充充电?你也可以直接告诉我想找什么活动~' },
    { id: 2, side: 'ai', cards: ['a5', 'a8'], text: '顺便提醒:你报名的「滨江 8K 夜跑」明天 19:30 开始,要不要把搭子也叫上?' },
  ]);
  const [val, setVal] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef(null);
  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, typing]);

  const reply = (text) => {
    const t = text.toLowerCase();
    let cards = [], answer;
    if (text.includes('羽毛球')) { cards = ['a5']; answer = '为你找到本周的羽毛球活动 🏸 周四晚体育馆已包 4 片场地、可借拍,目前余 2 位,要现在报名吗?'; }
    else if (text.includes('周末')) { cards = ['a2', 'a6']; answer = '这个周末有 2 个不错的选择:看日出徒步(中级强度)和潮汕砂锅粥探店。看你想出汗还是想吃好的 😋'; }
    else if (text.includes('新人') || text.includes('新手') || text.includes('小组')) { cards = ['a3', 'a4']; answer = '想轻松融入的话,推荐先从“午休桌游局”和“读书围读会”开始,氛围都很友好,不会冷场~'; }
    else { cards = ['a1', 'a3']; answer = '根据你的兴趣(运动 / 桌游)和最近的活跃时段,这两个我觉得你会喜欢。需要我帮你直接报名吗?'; }
    return { cards, answer };
  };
  const send = (text) => {
    const v = (text ?? val).trim(); if (!v) return;
    setMsgs(m => [...m, { id: Date.now(), side: 'me', text: v }]); setVal(''); setTyping(true);
    setTimeout(() => {
      const r = reply(v); setTyping(false);
      setMsgs(m => [...m, { id: Date.now() + 1, side: 'ai', text: r.answer, cards: r.cards }]);
    }, 1000);
  };
  const sugg = ['帮我找周末的羽毛球活动', '推荐适合新人的小组', '本周还有什么活动'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <ChatHeader title="小趣 · 你的兴趣助手" sub="AI 在线 · 随时帮你找活动、催报名" ai onBack={nav.back} />
      <div ref={scrollRef} className="noscroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {msgs.map(m => (
          <div key={m.id} className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <Bubble side={m.side} ai={m.side === 'ai'}>{m.text}</Bubble>
            {m.cards && <div style={{ display: 'flex', gap: 10, paddingLeft: 43, overflowX: 'auto' }} className="noscroll">
              {m.cards.map(id => { const a = DB.acts.find(x => x.id === id); return a ? <ChatActCard key={id} a={a} /> : null; })}</div>}
          </div>
        ))}
        {typing && <Bubble side="ai" ai><TypingDots /></Bubble>}
      </div>
      <div style={{ padding: '10px 14px', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div className="noscroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 10 }}>
          {sugg.map(s => <button key={s} onClick={() => send(s)} style={{ whiteSpace: 'nowrap', padding: '7px 13px', borderRadius: 99,
            background: 'var(--ai-soft)', color: 'var(--ai)', fontSize: 12.5, fontWeight: 600 }}>{s}</button>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)', borderRadius: 14, padding: '4px 6px 4px 14px' }}>
            <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="和小趣说点什么…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, padding: '8px 0' }} />
            <Icon name="mic" size={20} style={{ color: 'var(--ink-3)' }} />
          </div>
          <button onClick={() => send()} style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--ai-grad)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="send" size={19} /></button>
        </div>
      </div>
    </div>
  );
}

function ChatHeader({ title, sub, ai, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 14px 12px', background: 'var(--surface)',
      borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
      <button onClick={onBack} style={{ display: 'flex', color: 'var(--ink)' }}><Icon name="back" size={24} /></button>
      {ai && <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--ai-grad)', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} color="#fff" /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800 }} className="clamp1">{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: ai ? 'var(--ai)' : 'var(--ink-3)', fontWeight: 600 }}>{sub}</div>}
      </div>
      <button style={{ display: 'flex', color: 'var(--ink-3)' }}><Icon name="dots" size={22} /></button>
    </div>
  );
}

const NOTIF_META = {
  reminder: { icon: 'clock', color: 'var(--brand)' }, signup: { icon: 'ticket', color: 'var(--c-outdoor)' },
  join: { icon: 'userPlus', color: 'var(--c-music)' }, comment: { icon: 'comment', color: 'var(--c-reading)' },
  cancel: { icon: 'x', color: 'var(--ink-3)' },
};
function NotifyThread() {
  const { nav } = useM();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <ChatHeader title="活动通知" sub="报名 · 加入 · 提醒 · 评论" onBack={nav.back} />
      <div className="noscroll" style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {DB.notifications.map(n => {
          const m = NOTIF_META[n.kind];
          return (
            <div key={n.id} onClick={() => n.aid && nav.go('activity', { aid: n.aid })}
              style={{ display: 'flex', gap: 12, padding: 13, marginBottom: 9, background: 'var(--surface)', borderRadius: 16,
                boxShadow: 'var(--shadow-sm)', cursor: n.aid ? 'pointer' : 'default', alignItems: 'center',
                borderLeft: n.read ? 'none' : `3px solid ${m.color}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in oklch, ${m.color} 14%, white)`,
                color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={m.icon} size={20} stroke={2.2} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink)' }}>{n.text}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4 }}>{n.time}</div>
              </div>
              {n.aid && <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />}
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
  const c = DB.convos.find(x => x.id === cid) || DB.convos[2];
  const chat = [
    { side: 'other', who: '沈星', text: '今晚五黑还差一个,有人来吗?' },
    { side: 'other', who: '林浅', text: '我我我,十分钟后上线' },
    { side: 'ai', text: '已为本群创建「五黑上分之夜 · 第 13 期」活动并开启报名,点击下方卡片即可加入 👇', cards: ['a3'] },
    { side: 'me', text: '报名了!指挥归我' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <ChatHeader title={c.name} sub="群聊 · 142 人" onBack={nav.back} />
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

Object.assign(window, { ConvoList, AIChat, NotifyThread, GroupChat, ChatHeader, ChatActCard, Bubble });

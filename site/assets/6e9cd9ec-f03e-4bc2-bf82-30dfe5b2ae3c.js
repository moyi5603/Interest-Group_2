// mobile-detail.jsx — activity / group / moments / comments screens.

function DeadlineCountdown({ deadlineIso }) {
  const calc = () => Math.floor((new Date(deadlineIso) - Date.now()) / 1000);
  const [secs, setSecs] = React.useState(calc);
  React.useEffect(() => {
    const t = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(t);
  }, [deadlineIso]);
  if (secs <= 0) return <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>已截止报名</span>;
  const d = Math.floor(secs / 86400), h = Math.floor((secs % 86400) / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  const urgent = secs < 3600, warm = secs < 86400;
  const color = urgent ? 'oklch(0.50 0.20 25)' : warm ? 'oklch(0.50 0.15 55)' : 'var(--brand)';
  const text = d > 0
    ? `距截止 ${d} 天 ${h} 小时`
    : h > 0
    ? `距截止 ${h} 小时 ${m} 分`
    : `距截止 ${m} 分 ${String(s).padStart(2, '0')} 秒`;
  return <span style={{ color, fontWeight: 700 }}>{text}</span>;
}

function FloatBtn({ icon, onClick, style }) {
  return <button onClick={onClick} style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(6px)', boxShadow: '0 4px 14px rgba(0,0,0,0.16)', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', ...style }}><Icon name={icon} size={20} stroke={2.4} /></button>;
}

function ImgGrid({ seeds = [], onImgClick }) {
  const n = seeds.length;
  const cols = n === 1 ? 1 : n === 2 || n === 4 ? 2 : 3;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 5, borderRadius: 14, overflow: 'hidden' }}>
      {seeds.map((s, i) => (
        <div key={i} role="button" tabIndex={0} onClick={e => { e.stopPropagation(); onImgClick && onImgClick(i); }}
          onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onImgClick && onImgClick(i); } }}
          style={{ aspectRatio: n === 1 ? '4/3' : '1', cursor: onImgClick ? 'pointer' : 'default' }}>
          <Photo seed={s} label="活动照片" />
        </div>
      ))}
    </div>
  );
}

// ---- 小组圈 moment card ----
function MomentCard({ m }) {
  const { store, actions, nav } = useM();
  const cur = store.moments.find(x => x.id === m.id) || m;
  const act = DB.acts.find(a => a.id === m.aid);
  const mine = m.author === DB.ME;
  const comments = (store.momentComments || []).filter(c => c.mid === m.id);
  const [lb, setLb] = React.useState({ open: false, i: 0 });
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [delComment, setDelComment] = React.useState(null);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [compose, setCompose] = React.useState({ open: false, replyTo: null, replyAuthor: null, text: '' });
  const inputRef = React.useRef(null);

  const openCompose = (replyTo = null, replyAuthor = null) => {
    setMoreOpen(false);
    setCompose({ open: true, replyTo, replyAuthor, text: '' });
    setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 80);
  };
  const closeCompose = () => setCompose({ open: false, replyTo: null, replyAuthor: null, text: '' });
  const sendComment = () => {
    const t = (compose.text || '').trim();
    if (!t) return;
    actions.postMomentComment({
      mid: m.id, text: t,
      replyTo: compose.replyTo, replyAuthor: compose.replyAuthor,
    });
    closeCompose();
    toast(compose.replyAuthor ? '回复已发布' : '评论已发布', { icon: 'check' });
  };
  const onTapComment = (c) => {
    if (c.author === DB.ME) setDelComment(c);
    else openCompose(c.id, c.author);
  };
  const doDeleteMoment = () => {
    actions.delMoment(m.id);
    setConfirmDel(false);
    toast('已删除', { icon: 'trash' });
  };
  const doDeleteComment = () => {
    if (!delComment) return;
    actions.delMomentComment(delComment.id);
    setDelComment(null);
    toast('评论已删除', { icon: 'trash' });
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
        {m.imgs && m.imgs.length > 0 && <>
          <ImgGrid seeds={m.imgs} onImgClick={i => setLb({ open: true, i })} />
          <PhotoLightbox open={lb.open} seeds={m.imgs} index={lb.i} onClose={() => setLb({ open: false, i: 0 })} />
        </>}
        {/* 活动标签 + ···（赞 / 评）同排 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
          {act && (
            <button type="button" onClick={() => nav.go('activity', { aid: act.id })} style={{
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
                  position: 'absolute', right: 0, top: '100%', marginTop: 6,
                  zIndex: 41, display: 'flex', flexWrap: 'nowrap', alignItems: 'stretch',
                  width: 'max-content', maxWidth: 'none',
                  borderRadius: 8, overflow: 'hidden', whiteSpace: 'nowrap',
                  background: 'rgba(70,70,70,0.95)', boxShadow: 'var(--shadow-md)',
                }}>
                  <button type="button" onClick={() => { actions.toggleMomentLike(m.id); setMoreOpen(false); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', color: '#fff',
                      fontSize: 13, fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.15)',
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      flexShrink: 0, whiteSpace: 'nowrap' }}>
                    <Icon name="heart" size={15} fill={!!cur._liked} />{cur._liked ? '取消' : '赞'}
                  </button>
                  <button type="button" onClick={() => openCompose()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', color: '#fff',
                      fontSize: 13, fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer',
                      flexShrink: 0, whiteSpace: 'nowrap' }}>
                    <Icon name="comment" size={15} /><span>评论</span>
                  </button>
                  {mine && (
                    <button type="button" onClick={() => { setMoreOpen(false); setConfirmDel(true); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', color: '#fff',
                        fontSize: 13, fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.15)',
                        border: 'none', background: 'transparent', cursor: 'pointer',
                        flexShrink: 0, whiteSpace: 'nowrap' }}>
                      <Icon name="trash" size={15} />删除
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 灰底：赞摘要 + 评论列表 */}
        {(cur.likes > 0 || comments.length > 0) && (
          <div style={{ marginTop: 10, borderRadius: 10, background: 'var(--bg-2)', padding: '8px 10px' }}>
            {cur.likes > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600,
                color: 'var(--brand-600)', paddingBottom: comments.length ? 7 : 0,
                borderBottom: comments.length ? '1px solid var(--line)' : 'none', marginBottom: comments.length ? 6 : 0 }}>
                <Icon name="heart" size={13} fill style={{ color: 'var(--brand)' }} />
                {cur._liked ? `你${cur.likes > 1 ? ` 等 ${cur.likes} 人` : ''}` : `${cur.likes} 人`}觉得很赞
              </div>
            )}
            {comments.map(c => (
              <button key={c.id} type="button" onClick={() => onTapComment(c)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '3px 0',
                  fontSize: 13, lineHeight: 1.5, color: 'var(--ink)', background: 'transparent', border: 'none' }}>
                <span style={{ fontWeight: 700, color: 'var(--brand-600)' }}>{c.author}</span>
                {c.replyAuthor && <>
                  <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}> 回复 </span>
                  <span style={{ fontWeight: 700, color: 'var(--brand-600)' }}>{c.replyAuthor}</span>
                </>}
                <span style={{ fontWeight: 500 }}>：{c.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 评论输入 */}
      <Sheet open={compose.open} onClose={closeCompose} title={compose.replyAuthor ? `回复 ${compose.replyAuthor}` : '发表评论'}>
        <div style={{ padding: '8px 16px 20px', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <input ref={inputRef} value={compose.text}
            onChange={e => setCompose(s => ({ ...s, text: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') sendComment(); }}
            placeholder={compose.replyAuthor ? `回复 ${compose.replyAuthor}…` : '说点什么…'}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'var(--bg-2)', borderRadius: 12,
              padding: '11px 13px', fontSize: 14.5, color: 'var(--ink)' }} />
          <Btn variant="primary" size="sm" disabled={!compose.text.trim()} onClick={sendComment}
            style={{ opacity: compose.text.trim() ? 1 : 0.45 }}>发送</Btn>
        </div>
      </Sheet>

      <ConfirmSheet
        open={confirmDel}
        title="删除精彩瞬间"
        message="确认删除这条精彩瞬间？删除后不可恢复。"
        cancelLabel="取消"
        confirmLabel="确认删除"
        onCancel={() => setConfirmDel(false)}
        onConfirm={doDeleteMoment}
      />
      <ConfirmSheet
        open={!!delComment}
        title="删除评论"
        message="确认删除这条评论？"
        cancelLabel="取消"
        confirmLabel="确认删除"
        onCancel={() => setDelComment(null)}
        onConfirm={doDeleteComment}
      />
    </>
  );
}

// ---- AI summary card ----
function AISummaryCard({ title = '小趣的总结', points, foot, showAiPill = true }) {
  return (
    <div style={{ borderRadius: 'var(--r-lg)', padding: 2, background: 'var(--ai-grad)' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 22, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--ai-grad)', display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}><Sparkles size={18} color="#fff" /></div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
          {showAiPill && <AIPill label="AI 生成" style={{ marginLeft: 'auto' }} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {points.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink)' }}>
              <span style={{ color: 'var(--ai)', fontWeight: 800 }}>·</span><span>{p}</span>
            </div>
          ))}
        </div>
        {foot && <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-3)' }}>{foot}</div>}
      </div>
    </div>
  );
}

function CommentItem({ c, onLike, onReply }) {
  return (
    <div style={{ display: 'flex', gap: 11, padding: '15px 0', borderBottom: '1px solid var(--line)' }}>
      {c.isAI ? <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--ai-grad)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} color="#fff" /></div>
        : <Avatar name={c.author} size={38} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: c.isAI ? 'var(--ai)' : 'var(--ink)' }}>{c.author}</span>
          {c.isAI && <AIPill />}
        </div>
        {c.replyAuthor && (
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
            回复 <span style={{ fontWeight: 700, color: 'var(--brand)' }}>@{c.replyAuthor.replace(/ · AI$/, '')}</span>
          </div>
        )}
        <div style={{ fontSize: 14, lineHeight: 1.55, margin: '4px 0 6px', color: 'var(--ink)' }}>{c.text}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--ink-3)' }}>
          <span>{c.time}</span>
          <LikeButton liked={!!c._liked} count={c.likes || 0} onToggle={() => onLike(c.id)} size={16} />
          <button type="button" onClick={() => onReply(c)}
            style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
            回复
          </button>
        </div>
      </div>
    </div>
  );
}

function sessionMonthKey(dateStr) {
  const m = dateStr.match(/(\d{1,2})月/);
  return m ? `2026年${parseInt(m[1], 10)}月` : '其他';
}

function sessionDateShort(dateStr) {
  if (typeof ActWhen.short === 'function') return ActWhen.short(dateStr);
  const m = (dateStr || '').match(/(\d{1,2})月(\d{1,2})日/);
  return m ? `${parseInt(m[1], 10)}/${parseInt(m[2], 10)}` : (dateStr || '');
}

function sessionTimes(timeStr) {
  const parts = (timeStr || '').split(/\s*-\s*/).map(x => x.trim()).filter(Boolean);
  return { start: parts[0] || '', end: parts[1] || parts[0] || '' };
}

/** 场次格日期：跨天显示 6/6→6/7 */
function sessionDateLine(s) {
  if (!ActWhen.isCross(s)) return sessionDateShort(s.date);
  const start = sessionDateShort(s.date);
  const end = sessionDateShort(s.endDate);
  return end && end !== start ? `${start}→${end}` : start;
}

/** 场次格时间：M/D 几点 → M/D 几点 */
function sessionWhenRange(s) {
  const { start, end } = sessionTimes(s.time);
  const ds = sessionDateShort(s.date);
  if (!ActWhen.isCross(s)) {
    if (!start) return ds;
    return end && end !== start ? `${ds} ${start} – ${end}` : `${ds} ${start}`;
  }
  const de = sessionDateShort(s.endDate);
  if (!start) return `${ds} – ${de}`;
  return `${ds} ${start} – ${de} ${end}`;
}

function sessionCrossTag(s) {
  if (typeof ActWhen.crossTag === 'function') return ActWhen.crossTag(s);
  return ActWhen.isCross(s) ? '跨天' : null;
}

/** 与详情页「最近场次」一致的场次方块 */
function SessionSlotTile({ s, active, disabled, onClick, grid, cancelMode, topLabel, ended }) {
  const full = s.signed >= s.cap;
  const cross = ActWhen.isCross(s);
  const mine = !ended && (cancelMode ? active : (s.joinedByMe || active));
  const statusColor = ended ? 'var(--ink-3)'
    : cancelMode && !active ? 'var(--ink-3)' : mine ? 'var(--brand)' : full ? 'var(--ink-3)' : 'var(--c-outdoor)';
  const statusText = ended ? '已结束'
    : cancelMode ? (active ? '已报名' : '将取消')
    : mine ? '已报名' : full ? '已满员' : `余 ${s.cap - s.signed} 位`;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{
        width: grid ? '100%' : undefined,
        minWidth: grid ? 0 : (cross ? 188 : 112),
        aspectRatio: grid && !cross ? '1' : undefined,
        minHeight: grid ? (cross ? 78 : undefined) : 72,
        flexShrink: grid ? undefined : 0,
        padding: grid ? (cross ? '8px 6px' : '7px 5px') : '12px 14px',
        borderRadius: 13,
        background: mine ? 'var(--brand-tint)' : 'var(--bg-2)',
        border: mine ? '1.5px solid var(--brand)' : '1.5px solid transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: grid ? 'center' : 'stretch',
        justifyContent: 'center',
        textAlign: grid ? 'center' : 'left',
        opacity: disabled ? 0.45 : ended ? 0.7 : 1,
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
      }}>
      {topLabel && <div style={{ fontSize: 10, fontWeight: 800, lineHeight: 1.2, marginBottom: 1,
        color: mine ? 'var(--brand)' : 'var(--c-outdoor)' }}>{topLabel}</div>}
      <div style={{ fontSize: grid ? 12 : 12.5, fontWeight: 800, lineHeight: 1.25, whiteSpace: 'nowrap' }}>
        {sessionDateLine(s)}
        {sessionCrossTag(s) && <span style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--brand)', marginLeft: 3 }}>{sessionCrossTag(s)}</span>}
      </div>
      <div style={{
        fontSize: cross && grid ? 9.5 : (cross ? 10 : 10.5), color: 'var(--ink-3)', margin: '2px 0 2px', lineHeight: 1.3,
        whiteSpace: 'nowrap', letterSpacing: cross && grid ? -0.2 : undefined,
      }}>{sessionWhenRange(s)}</div>
      <div style={{ fontSize: grid ? 10 : 11, fontWeight: 700, color: statusColor, lineHeight: 1.2 }}>{statusText}</div>
    </Tag>
  );
}

function groupSessionsByMonth(sessions) {
  const map = new Map();
  for (const s of sessions) {
    const key = sessionMonthKey(s.date);
    const list = map.get(key) || [];
    list.push(s);
    map.set(key, list);
  }
  return [...map.entries()];
}

// ===================== ACTIVITY DETAIL =====================
function fmtSeriesRange(eps) {
  if (typeof ActWhen.seriesRange === 'function') return ActWhen.seriesRange(eps);
  const short = (d) => {
    const m = (d || '').match(/(\d{1,2})月(\d{1,2})日/);
    return m ? `${parseInt(m[1], 10)}/${parseInt(m[2], 10)}` : (d || '');
  };
  if (!eps || !eps.length) return '';
  if (eps.length === 1) return short(eps[0].date);
  return `${short(eps[0].date)} - ${short(eps[eps.length - 1].date)}`;
}

function ActivityDetail({ aid, pickEnroll, pickEnrollIntent }) {
  const { store, actions, nav } = useM();
  const aIn = store.acts.find(x => x.id === aid);
  if (!aIn) {
    return (
      <ScreenScroll>
        <div style={{ padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Empty text="未找到该活动" />
          <FloatBtn icon="back" onClick={nav.back} />
        </div>
      </ScreenScroll>
    );
  }
  const episodes = DBH.seriesEps(store.acts, aIn);
  const isSeries = episodes.length > 0;
  const a = isSeries ? episodes[0] : aIn;
  const g = store.groups.find(x => x.id === aIn.gid) || (DB.groups || []).find(x => x.id === aIn.gid);
  const mode = isSeries ? (a.seriesSignupMode || 'independent') : null;
  const activeEp = isSeries ? (episodes.find(e => e.status !== 'ended') || episodes[episodes.length - 1]) : aIn;
  const viewEndedEp = aIn.status === 'ended';
  const ended = viewEndedEp || (isSeries ? episodes.every(e => e.status === 'ended') : false);
  const showAsSeries = isSeries && !viewEndedEp;
  const hero = viewEndedEp ? aIn : a;
  const title = showAsSeries ? a.series : aIn.title;
  const dateLabel = showAsSeries ? fmtSeriesRange(episodes) : aIn.date;
  const timeLabel = showAsSeries ? `共 ${episodes.length} 场` : aIn.time;
  const desc = showAsSeries ? (a.seriesDesc || a.desc) : aIn.desc;
  const tags = showAsSeries ? (a.seriesTags || a.tags) : aIn.tags;
  const commentAids = viewEndedEp ? [aIn.id] : (isSeries ? episodes.map(e => e.id) : [aIn.id]);
  const moms = DB.moments.filter(m => commentAids.includes(m.aid));
  const [comments, setComments] = React.useState(
    () => DB.comments.filter(c => commentAids.includes(c.aid) && !c.isAI).map(c => ({ ...c, _liked: false }))
  );
  const [draft, setDraft] = React.useState('');
  const [replyTo, setReplyTo] = React.useState(null);
  const commentAid = viewEndedEp ? aIn.id : (isSeries ? activeEp.id : aIn.id);
  const [detailExpanded, setDetailExpanded] = React.useState(!ended);
  const sessionsAll = (!isSeries && aIn.type === 'recurring' && aIn.sessions) ? aIn.sessions : null;
  const sessions = DBH.recentSessions(sessionsAll);
  // 可按场次/按期增减报名的活动：周期 + 系列(按场次)
  const isSeriesIndep = isSeries && mode === 'independent';
  const adjustable = !!sessions || isSeriesIndep;
  const slotsAll = sessions ? sessionsAll : isSeriesIndep ? episodes : null;
  const slots = sessions ? sessions : isSeriesIndep ? episodes : null;
  const joinedCount = slotsAll ? slotsAll.filter(s => s.joinedByMe).length : 0;
  const seriesJoined = isSeries && mode === 'all' ? activeEp.joinedByMe : isSeries ? episodes.some(e => e.joinedByMe) : aIn.joinedByMe;
  const displaySigned = viewEndedEp ? aIn.signed : isSeries
    ? (mode === 'all' ? activeEp.signed : episodes.reduce((s, e) => s + e.signed, 0))
    : aIn.signed;
  const displayCap = viewEndedEp ? aIn.cap : isSeries
    ? (mode === 'all' ? activeEp.cap : episodes.reduce((s, e) => s + e.cap, 0))
    : aIn.cap;
  const [pickOpen, setPickOpen] = React.useState(false);
  const [sel, setSel] = React.useState([]);
  const [commentSheetOpen, setCommentSheetOpen] = React.useState(false);
  const [navSolid, setNavSolid] = React.useState(false);
  const onDetailScroll = (e) => {
    const y = e.currentTarget.scrollTop;
    setNavSolid(y > 200);
  };
  const origSel = (slots || []).filter(s => s.joinedByMe).map(s => s.id);
  // 打开「调整报名场次」弹窗：预选已报名的场次/期,可勾选新增、取消勾选移除
  const openPickEnroll = () => {
    setSel((slots || []).filter(s => s.joinedByMe).map(s => s.id));
    setPickOpen(true);
  };
  React.useEffect(() => {
    if (!pickEnroll || !adjustable || ended) return;
    const t = setTimeout(() => openPickEnroll(), 80);
    return () => clearTimeout(t);
  }, [aid, pickEnroll]);
  const toggleSel = (s) => {
    if (s.signed >= s.cap && !s.joinedByMe) return; // 已满且非本人不可新增
    setSel(cur => cur.includes(s.id) ? cur.filter(x => x !== s.id) : [...cur, s.id]);
  };
  const selChanged = sel.length !== origSel.length || sel.some(id => !origSel.includes(id));
  const confirmPick = () => {
    if (sessions) actions.setSessionSignups(aid, sel);
    else if (isSeriesIndep) actions.setEpisodeSignups(episodes.map(e => e.id), sel);
    setPickOpen(false);
  };

  const pickSheetTitle = pickEnrollIntent === 'cancel'
    ? '取消报名场次'
    : (joinedCount > 0 ? '调整报名场次' : '选择报名场次');
  const pickSheetHint = pickEnrollIntent === 'cancel'
    ? '取消勾选要退出的场次，全部取消勾选即取消报名（已满场次不可新增）'
    : `勾选新增、取消勾选移除，确认后生效（已满场次不可新增）${sessions ? ` · 仅显示最近 ${DBH.RECENT_SESSIONS_MAX} 场` : ''}`;

  const isSlotPast = (s) => (DBH.isSlotPast ? DBH.isSlotPast(s, aIn.status) : s.status === 'ended');
  const endedJoinedEps = isSeries ? episodes.filter(e => e.status === 'ended' && (mode === 'all' ? seriesJoined : e.joinedByMe)) : [];
  const hasEndedJoinedSessions = sessionsAll ? sessionsAll.some(s => s.joinedByMe && isSlotPast(s)) : false;
  let showPostMoment = false;
  let postMomentAid = null;
  if (viewEndedEp && aIn.joinedByMe) {
    showPostMoment = true;
    postMomentAid = aIn.id;
  } else if (sessionsAll && hasEndedJoinedSessions) {
    showPostMoment = true;
    postMomentAid = aid;
  } else if (isSeries && endedJoinedEps.length) {
    showPostMoment = true;
    postMomentAid = endedJoinedEps[0].id;
  } else if (ended && aIn.joinedByMe) {
    showPostMoment = true;
    postMomentAid = aIn.id;
  }
  const showEnrollActions = !ended && aIn.status !== 'cancelled';
  const dualActions = showPostMoment && showEnrollActions;

  // 报名门槛：必须先加入活动所属小组
  const gs = groupMemberState(g);
  const onJoinEnroll = () => {
    if (!g) { toast('未找到活动所属小组', { icon: 'alert' }); return; }
    if (g.join === 'approve') { actions.applyJoin(g.id); return; }
    if (adjustable) { actions.joinGroupFree(g.id); openPickEnroll(); return; }
    actions.signupAndJoinFree(isSeries ? activeEp.id : aid, g.id);
  };

  const renderEnrollBtn = ({ full = true, size = dualActions ? 'md' : 'lg', style: btnStyle } = {}) => {
    const flexStyle = dualActions && !full ? { flex: 1, minWidth: 0, ...btnStyle } : btnStyle;
    const merge = (s) => ({ ...s, ...flexStyle });
    if (!showEnrollActions) return null;
    if (gs === 'pending') {
      return <Btn variant="primary" full={full} size={size} icon="ticket" disabled style={merge({ opacity: 0.55 })}>立即报名</Btn>;
    }
    if (gs === 'none') {
      return <Btn variant="primary" full={full} size={size} icon="userPlus" onClick={onJoinEnroll} style={flexStyle}>报名并加入小组</Btn>;
    }
    if (adjustable) {
      return <Btn variant={joinedCount > 0 ? 'soft' : 'primary'} full={full} size={size} icon="ticket"
        onClick={openPickEnroll} style={flexStyle}>{joinedCount > 0 ? (dualActions ? '调整场次' : '调整报名场次') : '立即报名'}</Btn>;
    }
    return <Btn variant={seriesJoined ? 'ghost' : 'primary'} full={full} size={size}
      icon={seriesJoined ? 'x' : 'ticket'} style={flexStyle}
      onClick={() => actions.toggleSignup(isSeries ? activeEp.id : aid)}>{seriesJoined ? '取消报名' : '立即报名'}</Btn>;
  };

  const toggleCommentLike = (id) => {
    setComments(cs => cs.map(c => c.id === id
      ? { ...c, _liked: !c._liked, likes: (c.likes || 0) + (c._liked ? -1 : 1) }
      : c));
  };
  const openCommentCompose = () => {
    setReplyTo(null);
    setDraft('');
    setCommentSheetOpen(true);
  };
  const startReply = (c) => {
    setReplyTo(c);
    setDraft('');
    setCommentSheetOpen(true);
  };
  const cancelReply = () => {
    setReplyTo(null);
    setDraft('');
    setCommentSheetOpen(false);
  };
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const wasReply = !!replyTo;
    setComments(cs => [...cs, {
      id: 'cx' + Date.now(),
      aid: commentAid,
      author: DB.ME,
      text,
      likes: 0,
      _liked: false,
      time: '刚刚',
      replyTo: replyTo ? replyTo.id : undefined,
      replyAuthor: replyTo ? replyTo.author : undefined,
    }]);
    setDraft('');
    setReplyTo(null);
    setCommentSheetOpen(false);
    toast(wasReply ? '回复已发布' : '评论已发布', { icon: 'check' });
  };
  const replyName = replyTo ? replyTo.author.replace(/ · AI$/, '') : '';
  const enrolledBadge = viewEndedEp ? aIn.joinedByMe : (isSeries ? seriesJoined : aIn.joinedByMe);

  const slotJoinedHint = sessions
    ? (joinedCount > 0 ? `已报 ${joinedCount} 场` : null)
    : (showAsSeries && mode === 'independent' && episodes.filter(e => e.joinedByMe).length > 0
      ? `已报 ${episodes.filter(e => e.joinedByMe).length} 场` : null);
  const slotSectionTitle = (sessions || showAsSeries) ? '场次' : null;

  return (
    <ScreenScroll onScroll={onDetailScroll}>
      <div style={{ position: 'relative', height: 340 }}>
        <Cover
          src={hero.cover}
          fallbackSrc={g && g.cover}
          seed={hero.id + hero.cat}
          icon={CATS[hero.cat].icon}
          dim
        />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 42%, rgba(0,0,0,0.55) 100%)',
        }} />
        <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 1 }}>
          <FloatBtn icon="back" onClick={nav.back} />
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', gap: 7, zIndex: 1 }}>
          <CatBadge cat={hero.cat} size="sm" solid /><TypeTag type={hero.type} />
        </div>
      </div>

      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', gap: 10,
        height: navSolid ? 'auto' : 0,
        overflow: 'hidden',
        padding: navSolid ? '10px 12px' : 0,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(10px)',
        borderBottom: navSolid ? '1px solid var(--line)' : 'none',
        boxShadow: navSolid ? '0 4px 14px rgba(0,0,0,0.06)' : 'none',
        opacity: navSolid ? 1 : 0,
        pointerEvents: navSolid ? 'auto' : 'none',
        transition: 'opacity .2s ease',
      }}>
        <FloatBtn icon="back" onClick={nav.back} style={{ width: 34, height: 34, boxShadow: 'var(--shadow-sm)' }} />
        <div className="clamp1" style={{ flex: 1, fontSize: 15, fontWeight: 800, minWidth: 0 }}>{title}</div>
      </div>

      <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.28, letterSpacing: -0.3 }}>{title}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {ended && (
              <span style={{ padding: '2px 8px', borderRadius: 8, background: 'var(--bg-2)', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)' }}>已结束</span>
            )}
            {!ended && enrolledBadge && (
              <span style={{ padding: '2px 8px', borderRadius: 8, background: 'var(--brand-soft)', fontSize: 11, fontWeight: 700, color: 'var(--brand-600)' }}>已报名</span>
            )}
          </div>
          {g && (
            <button type="button" onClick={() => nav.go('group', { gid: g.id })} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 10, fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
              <Icon name={CATS[g.cat].icon} size={15} style={{ color: CATS[g.cat].color }} stroke={2.2} />{g.name}<Icon name="chevR" size={14} />
            </button>
          )}
        </div>

        {ended && !detailExpanded ? (
          <button type="button" onClick={() => setDetailExpanded(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px 0', borderRadius: 14, background: 'var(--surface-2)',
              fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', border: '1px dashed var(--line-2)', cursor: 'pointer' }}>
            <Icon name="chevD" size={16} style={{ color: 'var(--ink-3)' }} />查看活动详情
          </button>
        ) : (
          <>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 12 }}>
              <MetaRow wrap={!showAsSeries && ActWhen.isCross(aIn)} icon={showAsSeries ? 'series' : aIn.type === 'recurring' ? 'repeat' : 'calendar'}>{showAsSeries ? `${dateLabel} · ${timeLabel}` : ActWhen.full(aIn)}{!showAsSeries && ActWhen.daysBadge(aIn) && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 6, background: 'color-mix(in oklch, var(--brand) 12%, white)', color: 'var(--brand)', fontSize: 11, fontWeight: 700 }}>{ActWhen.daysBadge(aIn)}</span>}{aIn.type === 'recurring' && !isSeries && <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--ink-3)' }}>(周期)</span>}</MetaRow>
              <MetaRow icon="pin">{hero.loc}</MetaRow>
              <MetaRow icon="user">发起人 {hero.host}</MetaRow>
              {showAsSeries && mode === 'all' && <MetaRow icon="ticket">整场报名 · 共 {episodes.length} 场</MetaRow>}
              {showAsSeries && mode === 'independent' && <MetaRow icon="ticket">按场次报名</MetaRow>}
              {aIn.deadlineIso && !ended && (
                <MetaRow icon="clock"><DeadlineCountdown deadlineIso={aIn.deadlineIso} /></MetaRow>
              )}
              {!sessions && !showAsSeries && (
                <>
                  <div style={{ height: 1, background: 'var(--line)' }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, marginBottom: 7 }}>
                      <span>已报名 {displaySigned}/{displayCap}</span>
                      <span style={{ color: displaySigned >= displayCap ? 'var(--brand)' : 'var(--ink-3)' }}>{displaySigned >= displayCap ? '已满员' : `余 ${displayCap - displaySigned} 位`}</span>
                    </div>
                    <ProgressBar value={displaySigned} max={displayCap} color={CATS[a.cat].color} height={8} />
                    <div style={{ marginTop: 11 }}><AvatarStack names={DB.NAMES} n={6} size={28} extra={Math.max(0, displaySigned - 6)} /></div>
                  </div>
                </>
              )}
            </div>

            {(sessions || showAsSeries) && (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {slotSectionTitle}
                    {slotJoinedHint && <span style={{ color: 'var(--brand)', marginLeft: 8, fontSize: 12.5, fontWeight: 700 }}>{slotJoinedHint}</span>}
                  </div>
                </div>
                <div className="noscroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 2px 4px' }}>
                  {sessions
                    ? sessions.map(s => (
                      <SessionSlotTile key={s.id} s={s} active={s.joinedByMe} ended={isSlotPast(s)} />
                    ))
                    : episodes.map(ep => (
                      <SessionSlotTile key={ep.id} s={ep} active={ep.joinedByMe} ended={ep.status === 'ended'} />
                    ))}
                </div>
              </div>
            )}

            {((desc && desc.trim()) || (tags || []).length > 0) && (
              <div>
                {desc && desc.trim() && (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>活动简介</div>
                    <div className="richtext" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: desc }} />
                  </>
                )}
                {(tags || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: desc && desc.trim() ? 14 : 0 }}>
                    {(tags || []).map(t => <span key={t} style={{ padding: '5px 11px', borderRadius: 99, background: 'var(--bg-2)',
                      fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>#{t}</span>)}
                  </div>
                )}
              </div>
            )}

            {ended && (
              <button type="button" onClick={() => setDetailExpanded(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 0', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <Icon name="chevU" size={15} style={{ color: 'var(--ink-3)' }} />收起活动详情
              </button>
            )}
          </>
        )}

        {moms.length > 0 && (ended || showPostMoment) && (
          <div>
            <SectionHeader title="精彩瞬间" sub={`${moms.length} 位同学分享 · 也已同步到小组圈`} accent="var(--sun)"
              action="全部" onAction={() => nav.go('moments', { gid: a.gid })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {moms.map(m => <MomentCard key={m.id} m={m} />)}
            </div>
          </div>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              评论 <span style={{ color: 'var(--ink-3)', fontWeight: 700 }}>{comments.length}</span>
            </div>
            <Btn variant="soft" size="sm" icon="edit" onClick={openCommentCompose}>写评论</Btn>
          </div>
          {comments.length
            ? <div>{comments.map(c => <CommentItem key={c.id} c={c} onLike={toggleCommentLike} onReply={startReply} />)}</div>
            : <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>还没有评论，来抢沙发吧</div>}
        </div>
      </div>

      <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)', boxShadow: '0 -6px 20px rgba(0,0,0,0.06)', borderTop: '1px solid var(--line)',
        padding: '12px 14px calc(12px + env(safe-area-inset-bottom, 0px))', display: 'flex',
        flexDirection: 'column', gap: 9, zIndex: 5 }}>
        {!ended && gs !== 'member' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '8px 11px', borderRadius: 12,
            background: gs === 'pending' ? 'var(--sun-soft)' : 'var(--bg-2)', fontSize: 12, lineHeight: 1.45,
            color: gs === 'pending' ? 'oklch(0.5 0.13 70)' : 'var(--ink-2)' }}>
            <Icon name={gs === 'pending' ? 'clock' : 'userPlus'} size={15} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{gs === 'pending'
              ? '加入小组申请正在审核中，审核通过后方可报名'
              : g && g.join === 'approve' ? '该活动所属小组需审核加入,点击下方按钮提交申请' : '报名将同时加入该小组'}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <LikeButton liked={hero.liked} count={hero.likes} onToggle={() => actions.toggleLike(hero.id)} size={24} />
          <div style={{ flex: 1, display: 'flex', gap: 8, minWidth: 0 }}>
            {showPostMoment && (
              <Btn variant="ai" size={dualActions ? 'md' : 'lg'} icon="camera" full={!dualActions}
                style={dualActions ? { flex: 1, minWidth: 0 } : undefined}
                onClick={() => nav.go('post', { gid: aIn.gid, aid: postMomentAid })}>
                {dualActions ? '精彩瞬间' : '发布精彩瞬间'}
              </Btn>
            )}
            {showEnrollActions && (dualActions ? renderEnrollBtn({ full: false }) : !showPostMoment && renderEnrollBtn())}
          </div>
        </div>
      </div>

      {adjustable && (
        <Sheet open={pickOpen} onClose={() => setPickOpen(false)} title={pickSheetTitle}>
          <div style={{ padding: '2px 14px 0', fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>
            {pickSheetHint}
          </div>
          <div style={{ padding: '8px 14px 4px', maxHeight: '52vh', overflowY: 'auto' }} className="noscroll">
            {(slots || []).length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>暂无可报名场次</div>
            ) : groupSessionsByMonth(slots || []).map(([month, list]) => {
              const crossCols = list.some(s => ActWhen.isCross(s));
              return (
              <section key={month} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8 }}>{month}</div>
                <div style={{ display: 'grid', gridTemplateColumns: crossCols ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: 10 }}>
                  {list.map(s => {
                    const full = s.signed >= s.cap;
                    const ep = isSlotPast(s);
                    const checked = sel.includes(s.id);
                    const disabled = ep || (full && !s.joinedByMe);
                    return (
                      <SessionSlotTile key={s.id} s={s} grid active={checked} disabled={disabled} ended={ep}
                        onClick={() => toggleSel(s)} />
                    );
                  })}
                </div>
              </section>
              );
            })}
          </div>
          <div style={{ padding: '8px 14px calc(12px + env(safe-area-inset-bottom))', position: 'sticky', bottom: 0, background: 'var(--surface)' }}>
            <Btn variant={sel.length === 0 ? 'ghost' : 'primary'} full size="md"
              icon={sel.length === 0 ? 'x' : 'ticket'} onClick={confirmPick} disabled={!selChanged}>
              {!selChanged ? '未做更改' : sel.length === 0 ? '确认取消报名' : `确认 · 共 ${sel.length} 场`}
            </Btn>
          </div>
        </Sheet>
      )}

      <Sheet open={commentSheetOpen} onClose={cancelReply} title={replyTo ? `回复 @${replyName}` : '写评论'}>
        <div style={{ padding: '8px 14px calc(12px + env(safe-area-inset-bottom))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)', borderRadius: 14, padding: '6px 6px 6px 14px' }}>
            <input value={draft} onChange={e => setDraft(e.target.value)}
              placeholder={replyTo ? `回复 ${replyName}…` : '说点什么…'}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, outline: 'none', padding: '10px 0' }} />
            <button type="button" onClick={send} style={{
              width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: draft.trim() ? 'var(--brand)' : 'var(--line-2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="send" size={17} /></button>
          </div>
        </div>
      </Sheet>
    </ScreenScroll>
  );
}

// ===================== GROUP DETAIL =====================
function GroupDetail({ gid }) {
  const { store, actions, nav } = useM();
  const g = store.groups.find(x => x.id === gid);
  const actsRaw = DB.acts.filter(a => a.gid === gid);
  const acts = DBH.collapseActsForList(actsRaw, store.acts);
  const moms = store.moments.filter(m => m.gid === gid);
  const isMember = groupMemberState(g) === 'member';
  const [tab, setTab] = React.useState('acts');
  const members = DB.NAMES.slice(0, 14);
  const goPostMoment = () => nav.go('post', { gid });

  return (
    <ScreenScroll>
      <div style={{ position: 'relative', height: 340 }}>
        <Cover src={g.cover} seed={g.id + g.cat} icon={CATS[g.cat].icon} dim />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent 45%, rgba(0,0,0,0.4) 100%)',
        }} />
        <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 1 }}>
          <FloatBtn icon="back" onClick={nav.back} />
        </div>
      </div>
      <div style={{ padding: '0 16px 110px' }}>
        <div style={{ marginTop: -34, position: 'relative', background: 'var(--surface)', borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CatBadge cat={g.cat} size="sm" />
          </div>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.3 }}>{g.name}</div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)', margin: '9px 0 13px' }}>{g.intro}</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
            {g.tags.map(t => <span key={t} style={{ padding: '5px 11px', borderRadius: 99, background: 'var(--bg-2)',
              fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>{t}</span>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: g.area ? 8 : 14, fontSize: 12.5, color: 'var(--ink-2)' }}>
            <span><b style={{ fontSize: 16, color: 'var(--ink)' }}>{g.members}</b> 成员</span>
            <span><b style={{ fontSize: 16, color: 'var(--ink)' }}>{g.acts}</b> 活动</span>
          </div>
          {g.area ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14, fontSize: 12.5, color: 'var(--ink-2)' }}>
              <Icon name="pin" size={14} />{g.area}
            </div>
          ) : null}
          {(() => {
            const gs = groupMemberState(g);
            if (gs === 'pending') return <Btn variant="ghost" full icon="clock" disabled style={{ opacity: 0.55 }}>审核中…</Btn>;
            if (gs === 'member') return <Btn variant="ghost" full icon="check" onClick={() => actions.leaveGroupWithConfirm(gid)}>退出小组</Btn>;
            return <Btn variant="primary" full icon="userPlus"
              onClick={() => (g.join === 'approve' ? actions.applyJoin(gid) : actions.joinGroupFree(gid))}>{g.join === 'approve' ? '申请加入' : '加入小组'}</Btn>;
          })()}
          {g.pending && <div style={{ fontSize: 11.5, color: 'oklch(0.55 0.13 70)', marginTop: 8, textAlign: 'center' }}>已提交申请,等待小组审核,通过后可报名</div>}
          {g.join === 'approve' && !g.joined && !g.pending && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8, textAlign: 'center' }}>该小组需组长审核后加入</div>}
        </div>

        <div style={{ display: 'flex', gap: 6, margin: '18px 0 16px' }}>
          {[['acts', '活动', acts.length], ['members', '成员', g.members], ['moments', '小组圈', moms.length]].map(([k, l, n]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: '9px 0', borderRadius: 12, fontSize: 13.5,
              fontWeight: 700, background: tab === k ? 'var(--ink)' : 'var(--surface)', color: tab === k ? '#fff' : 'var(--ink-2)',
              boxShadow: tab === k ? 'none' : 'var(--shadow-sm)' }}>{l} <span style={{ opacity: 0.6 }}>{n}</span></button>
          ))}
        </div>

        {tab === 'acts' && <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {acts.map(a => <ActivityRow key={a._listKey || a.id} a={a} />)}</div>}

        {tab === 'members' && <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 13, background: 'var(--surface)',
            borderRadius: 'var(--r)', boxShadow: 'var(--shadow-sm)', marginBottom: 11 }}>
            <Avatar name={g.lead} size={46} ring />
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700 }}>{g.lead}</div></div>
            <span style={{ padding: '4px 10px', borderRadius: 99, background: 'var(--sun-soft)', color: 'oklch(0.55 0.13 70)',
              fontSize: 11.5, fontWeight: 700 }}>组长</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 13, padding: 16, background: 'var(--surface)',
            borderRadius: 'var(--r)', boxShadow: 'var(--shadow-sm)' }}>
            {members.map(m => <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <Avatar name={m} size={42} /><span style={{ fontSize: 11, color: 'var(--ink-2)' }} className="clamp1">{m}</span></div>)}
          </div>
        </div>}

        {tab === 'moments' && (
          <div>
            {isMember && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
                  分享你参与活动的精彩瞬间
                </div>
                <Btn variant="ai" size="sm" icon="camera" onClick={goPostMoment}>发布</Btn>
              </div>
            )}
            {moms.length
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {moms.map(m => <MomentCard key={m.id} m={m} />)}
                </div>
              : <Empty
                  text="还没有精彩瞬间,参加活动后来这里分享吧"
                  actionLabel={isMember ? '发布精彩瞬间' : undefined}
                  onAction={isMember ? goPostMoment : undefined}
                />}
          </div>
        )}
      </div>
    </ScreenScroll>
  );
}

function Empty({ text, actionLabel, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--ink-3)', fontSize: 13.5 }}>
      <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--bg-2)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 12px' }}><Icon name="image" size={26} style={{ color: 'var(--ink-3)' }} /></div>
      <div style={{ lineHeight: 1.55, maxWidth: 280, margin: '0 auto' }}>{text}</div>
      {actionLabel && onAction && (
        <div style={{ marginTop: 16 }}>
          <Btn variant="soft" size="sm" onClick={onAction}>{actionLabel}</Btn>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ActivityDetail, GroupDetail, MomentCard, AISummaryCard, CommentItem, ImgGrid, FloatBtn, Empty });

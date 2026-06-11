// admin-ui.jsx — PC admin shell pieces: context, sidebar, topbar, stat cards, AI composer.
const AdminCtx = React.createContext(null);
const useA = () => React.useContext(AdminCtx);

const NAV_IG = {
  label: '兴趣小组',
  icon: 'users',
  children: [
    { k: 'dashboard', label: '工作台', icon: 'grid' },
    { k: 'groups', label: '小组管理', icon: 'users' },
    { k: 'activities', label: '活动管理', icon: 'calendar' },
    { k: 'signups', label: '报名管理', icon: 'ticket' },
    { k: 'comments', label: '评论&互动', icon: 'comment' },
    { k: 'moments', label: '精彩瞬间', icon: 'image' },
  ],
};
const IG_KEYS = NAV_IG.children.map(c => c.k);
const IG_DETAIL_PARENT = { groupDetail: 'groups', actDetail: 'activities' };
function igActiveChild(section) {
  if (IG_KEYS.includes(section)) return section;
  return IG_DETAIL_PARENT[section] || null;
}
function isIgSection(section) { return !!igActiveChild(section); }
const NAV = NAV_IG.children;

function Sidebar() {
  const { view, setView, store } = useA();
  const badge = { groups: store.groups.length };
  const activeChild = igActiveChild(view.section);
  const igActive = !!activeChild;
  const [igOpen, setIgOpen] = React.useState(true);
  React.useEffect(() => { if (isIgSection(view.section)) setIgOpen(true); }, [view.section]);

  const navBtn = (on, props) => (
    <button {...props} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
      borderRadius: 12, marginBottom: 3, fontSize: 14, fontWeight: on ? 700 : 600, color: on ? 'var(--brand-600)' : 'var(--ink-2)',
      background: on ? 'var(--brand-tint)' : 'transparent', transition: 'all .15s', ...props.style }}
      onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { if (!on) e.currentTarget.style.background = on ? 'var(--brand-tint)' : 'transparent'; }} />
  );

  return (
    <div style={{ width: 232, background: 'var(--surface)', borderRight: '1px solid var(--line)', display: 'flex',
      flexDirection: 'column', flexShrink: 0, height: '100%' }}>
      <div style={{ padding: '16px 12px 6px', flex: 1 }}>
        {navBtn(igActive, {
          onClick: () => setIgOpen(o => !o),
          children: <>
            <Icon name={NAV_IG.icon} size={20} stroke={2.1} />{NAV_IG.label}
            <Icon name={igOpen ? 'chevD' : 'chevR'} size={16} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
          </>,
        })}
        {igOpen && <div style={{ marginBottom: 4, paddingLeft: 8 }}>
          {NAV_IG.children.map(n => {
            const on = activeChild === n.k;
            return navBtn(on, {
              key: n.k,
              onClick: () => setView({ section: n.k }),
              style: { padding: '9px 13px 9px 28px', fontSize: 13.5 },
              children: <>
                <Icon name={n.icon} size={18} stroke={2.1} />{n.label}
                {n.k === 'groups' && <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)' }}>{badge.groups}</span>}
              </>,
            });
          })}
        </div>}
      </div>
    </div>
  );
}
// helper to open AI composer from anywhere via window event
function useAOpen() { window.dispatchEvent(new CustomEvent('open-ai-composer')); }

function Topbar({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px',
      borderBottom: '1px solid var(--line)', background: 'var(--surface)', flexShrink: 0 }}>
      <div>
        <div style={{ fontSize: 21, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: -0.3 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{right}</div>}
    </div>
  );
}

/** PC 管理端 · 列表页统一搜索框 */
function AdminSearchBar({ value, onChange, placeholder, width = 150 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', borderRadius: 12, padding: '0 12px', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
      <Icon name="search" size={18} style={{ color: 'var(--ink-3)' }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ border: 'none', outline: 'none', padding: '10px 0', fontSize: 13.5, width, background: 'transparent' }} />
    </div>
  );
}

/** PC 管理端 · 列表工具栏：搜索靠左；可选第二行放 Tab 等筛选 */
function AdminListToolbar({ search, left, secondRow, style }) {
  return (
    <div style={{ marginBottom: 18, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {search && <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{search}</div>}
        {left && <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>{left}</div>}
      </div>
      {secondRow && <div style={{ marginTop: 12 }}>{secondRow}</div>}
    </div>
  );
}

/** PC 管理端 · 活动/报名/评论页双搜索 */
function AdminActSearchBars({ actQ, groupQ, onActQ, onGroupQ }) {
  return <>
    <AdminSearchBar value={actQ} onChange={onActQ} placeholder="搜索活动名称" />
    <AdminSearchBar value={groupQ} onChange={onGroupQ} placeholder="搜索小组名称" />
  </>;
}

/** PC 管理端 · 列表分页配置 */
const ADMIN_PAGE = {
  groups: { default: 15, options: [15, 50, 100] },
  moments: { default: 20, options: [20, 50, 100] },
  std: { default: 10, options: [10, 20, 50, 100] },
};

function useAdminPagination(total, config, enabled = true) {
  const defaultSize = config?.default ?? 10;
  const options = config?.options ?? ADMIN_PAGE.std.options;
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultSize);
  React.useEffect(() => { setPage(1); }, [total, pageSize]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * pageSize;
  return {
    slice: items => (enabled ? items.slice(offset, offset + pageSize) : items),
    nav: enabled ? {
      total, page: safePage, pageSize, totalPages, pageSizeOptions: options,
      onPageChange: setPage,
      onPageSizeChange: n => { setPageSize(n); setPage(1); },
    } : null,
  };
}

function AdminPagination({ total, page, pageSize, totalPages, pageSizeOptions, onPageChange, onPageSizeChange, style }) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(page * pageSize, total);
  const navBtn = disabled => ({
    width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--surface-2)', color: disabled ? 'var(--ink-3)' : 'var(--ink-2)',
    opacity: disabled ? 0.45 : 1, cursor: disabled ? 'default' : 'pointer', flexShrink: 0,
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 22px',
      borderTop: '1px solid var(--line)', flexWrap: 'wrap', ...style }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>
        {total > 0 ? `第 ${start}-${end} 条，共 ${total} 条` : '共 0 条'}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>每页</span>
          <select value={pageSize} onChange={e => onPageSizeChange(+e.target.value)}
            style={{ padding: '6px 10px', fontSize: 13, fontWeight: 600, borderRadius: 9, border: '1.5px solid var(--line-2)',
              background: 'var(--surface)', color: 'var(--ink-2)', cursor: 'pointer', outline: 'none' }}>
            {pageSizeOptions.map(n => <option key={n} value={n}>{n} 条</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} style={navBtn(page <= 1)} aria-label="上一页">
            <Icon name="chevL" size={18} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', minWidth: 52, textAlign: 'center' }}>{page} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} style={navBtn(page >= totalPages)} aria-label="下一页">
            <Icon name="chevR" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, delta, color = 'var(--brand)' }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 18, padding: 18, boxShadow: 'var(--shadow-sm)', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in oklch, ${color} 14%, white)`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={21} stroke={2.2} /></div>
        {delta && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-outdoor)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <Icon name="trending" size={14} stroke={2.6} />{delta}</span>}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: -1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Field({ label, children, hint, inline }) {
  if (inline) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 8 }}>
        <div style={{ width: 88, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', flexShrink: 0, whiteSpace: 'nowrap', paddingTop: 9 }}>{label}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {children}
            {hint && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{hint}</div>}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--ink-2)' }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
const inputStyle = { width: '100%', padding: '8px 11px', borderRadius: 10, border: '1.5px solid var(--line-2)',
  fontSize: 13.5, outline: 'none', fontFamily: 'var(--font)', background: 'var(--surface)', color: 'var(--ink)' };
function TextInput(p) { return <input {...p} style={{ ...inputStyle, ...p.style }} onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--line-2)'} />; }
function TextArea(p) { return <textarea {...p} style={{ ...inputStyle, resize: 'vertical', minHeight: 84, lineHeight: 1.6, ...p.style }} onFocus={e => e.target.style.borderColor = 'var(--brand)'} onBlur={e => e.target.style.borderColor = 'var(--line-2)'} />; }

/** PC 管理端 · 组长选择：边输入边搜索公司员工 */
function EmployeeLeadSearch({ value, onChange, placeholder }) {
  const [query, setQuery] = React.useState(value || '');
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);
  const list = DB.employees || [];

  React.useEffect(() => { setQuery(value || ''); }, [value]);
  React.useEffect(() => {
    const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const q = query.trim();
  const results = !q
    ? list.slice(0, 6)
    : list.filter(e =>
        e.name.includes(q) || e.dept.includes(q) || e.id.toLowerCase().includes(q.toLowerCase())
        || (e.title && e.title.includes(q))
      ).slice(0, 8);

  const pick = (emp) => {
    setQuery(emp.name);
    onChange(emp.name);
    setOpen(false);
  };

  return (
    <div ref={wrapRef}>
      <div style={{ position: 'relative' }}>
        <Icon name="search" size={16} stroke={2.1}
          style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
        <input
          value={query}
          placeholder={placeholder || ''}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand)'; setOpen(true); }}
          onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
          style={{ ...inputStyle, paddingLeft: 34 }}
        />
      </div>
      {open && (
        <div style={{ marginTop: 6, borderRadius: 10, border: '1.5px solid var(--line-2)', background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {results.length ? results.map(emp => {
            const on = emp.name === value;
            return (
              <button key={emp.id} type="button" onMouseDown={e => { e.preventDefault(); pick(emp); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none',
                  background: on ? 'var(--brand-tint)' : 'transparent', cursor: 'pointer', textAlign: 'left',
                  borderBottom: '1px solid var(--line)' }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = on ? 'var(--brand-tint)' : 'transparent'; }}>
                <Avatar name={emp.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{emp.dept} · {emp.title}</div>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600, flexShrink: 0 }}>{emp.id}</span>
                {on && <Icon name="check" size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />}
              </button>
            );
          }) : (
            <div style={{ padding: '18px 12px', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>未找到匹配员工</div>
          )}
        </div>
      )}
    </div>
  );
}

// AI-generated cover poster (SVG data URL) — honors the now-required cover field.
function escapeXml(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function makeAiPoster(title, cat) {
  const grads = {
    sport: ['#FF8E62', '#FF5E8E'], game: ['#7C8BFF', '#A66BFF'], learning: ['#5B9BD5', '#3D6FB0'],
    movie: ['#C66BC6', '#7B5FD4'], volunteer: ['#FF9B5A', '#FF6E6E'], career: ['#4FB3C9', '#3B82C4'],
    team: ['#5FBF7E', '#3B9E8F'], other: ['#9AA0A6', '#6B7177'],
  };
  const [c1, c2] = grads[cat] || ['#FF8E62', '#FF5E8E'];
  const safe = escapeXml((title || '活动海报').slice(0, 15));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">`
    + `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`
    + `<rect width="640" height="360" fill="url(#g)"/>`
    + `<circle cx="548" cy="74" r="130" fill="#fff" opacity="0.12"/><circle cx="86" cy="310" r="96" fill="#fff" opacity="0.10"/>`
    + `<path d="M70 64 l13 36 36 13 -36 13 -13 36 -13-36 -36-13 36-13z" fill="#fff" opacity="0.92"/>`
    + `<text x="40" y="300" font-family="-apple-system,Segoe UI,sans-serif" font-size="46" font-weight="800" fill="#fff">${safe}</text>`
    + `<text x="42" y="336" font-family="-apple-system,Segoe UI,sans-serif" font-size="18" fill="#fff" opacity="0.85">AI 生成</text>`
    + `</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// ============ AI ACTIVITY/GROUP COMPOSER ============
const AI_BLANK = {
  title: '', gid: 'g1', cat: 'sport', type: 'once',
  dateValue: '', endDateValue: '', spanDays: 0, timeStart: '19:00', timeEnd: '21:00',
  loc: '', cap: 20, desc: '', cover: '',
  repeatMode: 'weekly', repeatWeekdays: [], repeatMonthDays: [],
  sessions: [], poster: '', tags: [],
  deadlineMode: 'none', deadlineDate: '', deadlineTime: '18:00', deadlineHours: 2,
};

function AIComposer({ open, onClose, onPublish, store }) {
  const [phase, setPhase] = React.useState('input'); // input | thinking | result
  const [prompt, setPrompt] = React.useState('');
  const [form, setForm] = React.useState(null);
  const [editorKey, setEditorKey] = React.useState(0);
  const coverRef = React.useRef(null);
  React.useEffect(() => { if (open) { setPhase('input'); setPrompt(''); setForm(null); } }, [open]);

  const pickCover = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(s => ({ ...s, cover: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const setType = (v) => setForm(s => {
    const next = { ...s, type: v };
    if (!next.timeStart) { next.timeStart = '19:00'; next.timeEnd = '21:00'; }
    if (v === 'once' && !next.dateValue) next.dateValue = isoToday();
    if (v === 'recurring' && !(next.repeatWeekdays || []).length && !(next.repeatMonthDays || []).length) {
      next.repeatMode = 'weekly'; next.repeatWeekdays = [3];
    }
    if (v === 'series' && !(next.sessions || []).length) {
      next.sessions = [{ dateValue: isoToday(), timeStart: '19:00', timeEnd: '21:00' }];
    }
    return next;
  });

  const examples = ['每周三下班后组织一次滨江夜跑,8 公里,分配速组',
    '周末搞一次中级难度的登山看日出,需要拼车',
    '午休时间在休闲区办一个轻松的桌游局,适合新人'];

  const generate = () => {
    setPhase('thinking');
    setTimeout(() => {
      const isRun = prompt.includes('跑') || prompt.includes('夜跑');
      const isHike = prompt.includes('登山') || prompt.includes('徒步') || prompt.includes('日出');
      const d = isHike ? {
        title: '云端晨行 · 登顶看日出', cat: 'sport', type: 'series', gid: 'g2',
        loc: '云栖谷停车场 (统一拼车)', cap: 24, seriesSignupMode: 'all',
        sessions: [
          { date: '06月15日 周日', time: '04:30 - 14:00' },
          { date: '06月29日 周日', time: '04:30 - 14:00' },
        ],
        desc: '<p>凌晨集合拼车前往云栖谷,<b>登顶迎接第一缕阳光</b>,溪谷线下撤。</p><ul><li>全程约 9 公里、累计爬升 600m,中级强度</li><li>领队持野外急救证,提供保险与能量补给</li><li>需登山鞋,头灯由小组统一准备</li></ul>',
        poster: '🌄 四点半的黑暗,是为了五点半的光。\n这个周末,把闹钟交给我们,把日出交给你。\n中级强度|含拼车|领队全程保障', tags: ['看日出系列', '中级强度', '含拼车'],
      } : isRun ? {
        title: '滨江 8K 夜跑 · 江风配速团', cat: 'sport', type: 'recurring', gid: 'g1',
        repeatMode: 'weekly', repeatWeekdays: [1, 3, 5], time: '19:30 - 21:00', loc: '滨江园区南门集合', cap: 40,
        desc: '<p>沿滨江绿道往返 8 公里,按 <b>6′30″ / 6′00″ / 5′30″</b> 分三个配速组。</p><ul><li>出发前 10 分钟动态拉伸,跑后江边拉伸</li><li>跑完自由聚餐(AA),零基础友好,有陪跑员</li></ul>',
        poster: '🏃 下班别急着回家,江风在等你。\n8 公里,三档配速,总有一个适合你。\n每周三场|零基础友好|跑完撸串', tags: ['8 公里', '配速分组', '跑后聚餐'],
      } : {
        title: '午休轻松局 · 桌游开黑', cat: 'game', type: 'once', gid: 'g5',
        date: '06月04日 周三', time: '12:30 - 13:20', loc: '休闲区 3 号桌', cap: 10,
        desc: '<p>午饭吃快点,我们一起放松一下!</p><ul><li>本期桌游,新手有教学</li><li>40 分钟一局,绝不耽误下午摸鱼</li></ul>',
        poster: '🎲 午休 50 分钟,够赢三局。\n不用动脑的快乐,工位旁就有。\n新手友好|午休局|输的请奶茶', tags: ['午休局', '新手友好'],
      };
      d.cover = makeAiPoster(d.title, d.cat);
      setForm(normalizeActForm({ ...AI_BLANK, ...d }));
      setEditorKey(k => k + 1);
      setPhase('result');
    }, 1700);
  };

  const publish = () => { onPublish(actFormPayload(form)); onClose(); };

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} width={620}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--ai-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={24} color="#fff" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>AI 活动策划 <AIPill label="Beta" /></div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>用一句话描述你的想法,帮你生成完整方案</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--ink-3)' }}><Icon name="x" size={22} /></button>
        </div>

        {phase === 'input' && (
          <div className="fade">
            <TextArea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="例如:每周三下班后组织一次滨江夜跑,8 公里,分配速组…" style={{ minHeight: 96 }} />
            <div style={{ margin: '12px 0' }}>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8, fontWeight: 600 }}>试试这些 ↓</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {examples.map(ex => <button key={ex} onClick={() => setPrompt(ex)} style={{ textAlign: 'left', padding: '10px 13px', borderRadius: 11,
                  background: 'var(--surface-2)', fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Sparkles size={14} color="var(--ai)" />{ex}</button>)}
              </div>
            </div>
            <Btn variant="ai" full size="lg" icon="spark" disabled={!prompt.trim()} onClick={generate} style={{ opacity: prompt.trim() ? 1 : 0.5 }}>生成活动方案</Btn>
          </div>
        )}

        {phase === 'thinking' && (
          <div style={{ padding: '40px 0', textAlign: 'center' }} className="fade">
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--ai-grad)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 18px', animation: 'pulseRing 1.6s infinite' }}><Sparkles size={32} color="#fff" style={{ animation: 'sparkle 1.4s infinite' }} /></div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>正在策划中…</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 280, margin: '0 auto' }}>
              {['理解你的需求', '匹配合适的小组与场地', '生成方案'].map((t, i) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--ink-2)', opacity: 0,
                  animation: `floatUp .4s ${i * 0.45}s both` }}>
                  <Icon name="check" size={16} style={{ color: 'var(--c-outdoor)' }} stroke={3} />{t}</div>
              ))}
            </div>
          </div>
        )}

        {phase === 'result' && form && (
          <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--ai-soft)', marginBottom: 16, alignItems: 'center' }}>
              <Sparkles size={18} color="var(--ai)" /><span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-2)' }}>方案已生成,下面每一项都可以直接修改后再发布</span>
            </div>

            <Field label="封面图" hint="AI 已生成 · 可重新生成或上传替换">
              <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickCover} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 120, height: 68, borderRadius: 9, overflow: 'hidden', background: 'var(--bg)', flexShrink: 0,
                  border: form.cover ? 'none' : '2px dashed var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                  onClick={() => coverRef.current && coverRef.current.click()}>
                  {form.cover
                    ? <img src={form.cover} alt="封面" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: 'var(--ink-3)' }}>
                        <Icon name="image" size={24} stroke={1.6} />
                        <span style={{ fontSize: 11, fontWeight: 600 }}>点击上传</span>
                      </div>}
                  {form.cover && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.38)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                      <button type="button" onClick={e => { e.stopPropagation(); coverRef.current && coverRef.current.click(); }}
                        style={{ padding: '4px 9px', borderRadius: 7, background: 'rgba(255,255,255,0.9)', fontSize: 11.5, fontWeight: 700 }}>更换</button>
                      <button type="button" onClick={e => { e.stopPropagation(); setForm(s => ({ ...s, cover: '' })); }}
                        style={{ padding: '4px 9px', borderRadius: 7, background: 'rgba(255,255,255,0.9)', fontSize: 11.5, fontWeight: 700, color: 'oklch(0.55 0.2 25)' }}>删除</button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>JPG / PNG，建议 16:9</span>
                  <Btn variant="ai" size="sm" icon="spark" type="button" onClick={() => setForm(s => ({ ...s, cover: makeAiPoster(s.title, s.cat) }))}>重新生成</Btn>
                </div>
              </div>
            </Field>

            <Field label="活动标题"><TextInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="例如:滨江 8K 夜跑" /></Field>

            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1 }}><Field label="所属小组"><select value={form.gid} onChange={e => { const ng = store.groups.find(x => x.id === e.target.value); setForm({ ...form, gid: e.target.value, cat: ng ? ng.cat : form.cat }); }} style={inputStyle}>
                {store.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field></div>
              <div style={{ flex: 1 }}><Field label="分类"><select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })} style={inputStyle}>{Object.values(CATS).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></Field></div>
            </div>

            <Field label="活动类型" hint="单次=指定日期;周期性=按周/月重复;系列=多场次各自定时间">
              <Segmented value={form.type} onChange={setType} style={{ width: '100%' }}
                options={[{ value: 'once', label: '单次', icon: 'calendar' }, { value: 'recurring', label: '周期性', icon: 'repeat' }, { value: 'series', label: '系列', icon: 'series' }]} />
            </Field>

            {form.type === 'once' && (
              <>
                <Field label="开始">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <DatePicker value={form.dateValue} onChange={v => setForm(s => ({ ...s, dateValue: v, endDateValue: s.endDateValue && s.endDateValue < v ? v : s.endDateValue }))} style={{ flex: 1, minWidth: 0 }} />
                    <TimePicker value={form.timeStart} onChange={v => setForm({ ...form, timeStart: v })} style={{ width: 128, flexShrink: 0 }} />
                  </div>
                </Field>
                <Field label="结束" hint={form.endDateValue && form.endDateValue !== form.dateValue ? '跨天活动' : '默认与开始同一天'}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <DatePicker value={form.endDateValue || form.dateValue} min={form.dateValue} onChange={v => setForm({ ...form, endDateValue: v })} style={{ flex: 1, minWidth: 0 }} />
                    <TimePicker value={form.timeEnd} onChange={v => setForm({ ...form, timeEnd: v })} style={{ width: 128, flexShrink: 0 }} />
                  </div>
                </Field>
              </>
            )}

            {form.type === 'recurring' && (
              <>
                <Field label="重复规则" hint="选择每周重复的具体日期">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {WEEKDAYS.map(d => {
                      const on = (form.repeatWeekdays || []).includes(d.v);
                      return (
                        <button key={d.v} type="button" onClick={() => setForm(s => ({
                          ...s, repeatMode: 'weekly', repeatWeekdays: on ? s.repeatWeekdays.filter(x => x !== d.v) : [...(s.repeatWeekdays || []), d.v].sort((a, b) => a - b),
                        }))} style={{ minWidth: 44, height: 34, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          background: on ? 'var(--brand-tint)' : 'var(--bg)', color: on ? 'var(--brand-600)' : 'var(--ink-2)',
                          border: on ? '1.5px solid var(--brand)' : '1.5px solid var(--line-2)' }}>{d.label}</button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="时间" hint="结束时间早于开始时间时，视为次日该时刻结束">
                  <TimeRangePicker start={form.timeStart} end={form.timeEnd} onChange={(a, b) => setForm({ ...form, timeStart: a, timeEnd: b })} />
                </Field>
              </>
            )}

            {form.type === 'series' && (
              <>
                <Field label="报名方式">
                  <Segmented 
                    value={form.seriesSignupMode || 'independent'}
                    onChange={v => setForm({ ...form, seriesSignupMode: v })}
                    options={[
                      { value: 'independent', label: '按场次报名', desc: '用户可独立选择参加每一场' },
                      { value: 'all', label: '整场报名', desc: '报名截止后不可中途加入' }
                    ]}
                  />
                </Field>
                <Field label="场次安排" hint="每期可单独设置起止日期与时间，结束日期晚于开始即为跨天">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(form.sessions || []).map((s, i) => {
                      const cross = s.endDateValue && s.endDateValue !== s.dateValue;
                      return (
                      <div key={i} style={{ border: '1.5px solid var(--line-2)', borderRadius: 11, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ width: 22, fontSize: 12, fontWeight: 800, color: 'var(--ink-3)', textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', flexShrink: 0 }}>开始</span>
                          <DatePicker value={s.dateValue} onChange={v => setForm(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, dateValue: v, endDateValue: x.endDateValue && x.endDateValue < v ? v : x.endDateValue } : x) }))}
                            style={{ flex: 1, minWidth: 0 }} />
                          <TimePicker value={s.timeStart} onChange={v => setForm(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, timeStart: v } : x) }))} style={{ width: 128, flexShrink: 0 }} />
                          {(form.sessions || []).length > 1 && (
                            <button type="button" onClick={() => setForm(st => ({ ...st, sessions: st.sessions.filter((_, j) => j !== i) }))}
                              style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(0.55 0.2 25)', flexShrink: 0, marginLeft: 'auto' }}>
                              <Icon name="trash" size={16} /></button>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 30 }}>
                          <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', flexShrink: 0 }}>结束</span>
                          <DatePicker value={s.endDateValue || s.dateValue} min={s.dateValue} onChange={v => setForm(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, endDateValue: v } : x) }))}
                            style={{ flex: 1, minWidth: 0 }} />
                          <TimePicker value={s.timeEnd} onChange={v => setForm(st => ({ ...st, sessions: st.sessions.map((x, j) => j === i ? { ...x, timeEnd: v } : x) }))} style={{ width: 128, flexShrink: 0 }} />
                          {cross && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', flexShrink: 0 }}>跨天</span>}
                        </div>
                      </div>
                      );
                    })}
                    <Btn variant="ghost" size="sm" icon="plus" type="button" onClick={() => setForm(st => ({
                      ...st, sessions: [...(st.sessions || []), { dateValue: isoToday(), endDateValue: '', timeStart: '19:00', timeEnd: '21:00' }],
                    }))}>添加场次</Btn>
                  </div>
                </Field>
              </>
            )}

            <Field label="报名截止" hint={form.deadlineMode === 'none' ? '不设截止，活动开始前均可报名' : form.deadlineMode === 'fixed' ? '到达指定时间后不可报名' : '距活动开始不足 N 小时后不可报名'}>
              <DeadlinePicker
                mode={form.deadlineMode || 'none'}
                date={form.deadlineDate || ''}
                time={form.deadlineTime || '18:00'}
                hours={form.deadlineHours || 2}
                onChange={({ mode, date, time, hours }) => setForm(s => ({ ...s, deadlineMode: mode, deadlineDate: date, deadlineTime: time, deadlineHours: hours }))}
              />
            </Field>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 2 }}><Field label="地点"><TextInput value={form.loc} onChange={e => setForm({ ...form, loc: e.target.value })} placeholder="集合地点" /></Field></div>
              <div style={{ flex: 1 }}><Field label="人数上限"><TextInput type="number" value={form.cap} onChange={e => setForm({ ...form, cap: +e.target.value })} /></Field></div>
            </div>

            <Field label="活动描述">
              <RichText key={editorKey} value={form.desc} onChange={html => setForm(s => ({ ...s, desc: html }))} placeholder="活动安排、注意事项…" />
            </Field>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Btn variant="ghost" icon="repeat" onClick={() => setPhase('input')}>重新生成</Btn>
              {(() => { const ok = actFormReady(form, false); return (
                <Btn variant="ai" full icon="check" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={publish}>确认并发布活动</Btn>
              ); })()}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DeadlinePicker({ mode, date, time, hours, onChange }) {
  const setMode = v => onChange({ mode: v, date, time, hours });
  const btnStyle = (v) => ({
    flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    background: mode === v ? 'var(--brand-tint)' : 'var(--bg)',
    color: mode === v ? 'var(--brand-600)' : 'var(--ink-2)',
    border: mode === v ? '1.5px solid var(--brand)' : '1.5px solid var(--line-2)',
  });
  const HOUR_OPTS = [1, 2, 3, 6, 12, 24, 48];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={btnStyle('none')} onClick={() => setMode('none')}>不设置</button>
        <button type="button" style={btnStyle('fixed')} onClick={() => setMode('fixed')}>指定时间</button>
        <button type="button" style={btnStyle('hours_before')} onClick={() => setMode('hours_before')}>开始前 N 小时</button>
      </div>
      {mode === 'fixed' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <DatePicker value={date} onChange={v => onChange({ mode, date: v, time, hours })} style={{ flex: 1 }} />
          <input type="time" value={time || '18:00'} onChange={e => onChange({ mode, date, time: e.target.value, hours })}
            style={{ ...inputStyle, flex: 0.7, colorScheme: 'light' }} />
        </div>
      )}
      {mode === 'hours_before' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {HOUR_OPTS.map(h => (
            <button key={h} type="button" onClick={() => onChange({ mode, date, time, hours: h })}
              style={{ minWidth: 52, height: 34, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: hours === h ? 'var(--brand-tint)' : 'var(--bg)',
                color: hours === h ? 'var(--brand-600)' : 'var(--ink-2)',
                border: hours === h ? '1.5px solid var(--brand)' : '1.5px solid var(--line-2)' }}>
              {h < 24 ? `${h} 小时` : `${h / 24} 天`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AdminCtx, useA, NAV, Sidebar, Topbar, AdminSearchBar, AdminListToolbar, AdminActSearchBars, ADMIN_PAGE, useAdminPagination, AdminPagination, StatCard, Field, TextInput, TextArea, EmployeeLeadSearch, AIComposer, DeadlinePicker, inputStyle, useAOpen });

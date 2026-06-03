// ui.jsx — shared UI primitives for both mobile & admin. Exports to window.
const { useState, useEffect, useRef, createContext, useContext } = React;

const TYPE_META = {
  once:      { label: '单次',    icon: 'calendar', tip: '单次活动' },
  recurring: { label: '周期性',  icon: 'repeat',   tip: '固定周期循环' },
  series:    { label: '系列',    icon: 'series',   tip: '指定时间的系列活动' },
};

function Btn({ children, variant = 'primary', size = 'md', icon, iconR, full, style, ...p }) {
  const sizes = {
    sm: { padding: '7px 13px', fontSize: 13, gap: 6, radius: 11 },
    md: { padding: '11px 18px', fontSize: 14.5, gap: 7, radius: 14 },
    lg: { padding: '15px 22px', fontSize: 16, gap: 8, radius: 16 },
  }[size];
  const variants = {
    primary: { background: 'var(--brand)', color: '#fff', boxShadow: 'var(--shadow-brand)' },
    soft: { background: 'var(--brand-soft)', color: 'var(--brand-600)' },
    ghost: { background: 'transparent', color: 'var(--ink-2)', boxShadow: 'inset 0 0 0 1.5px var(--line-2)' },
    dark: { background: 'var(--ink)', color: '#fff' },
    ai: { background: 'var(--ai-grad)', color: '#fff', boxShadow: '0 8px 20px oklch(0.66 0.21 4 / 0.32)' },
    danger: { background: 'oklch(0.96 0.04 25)', color: 'oklch(0.55 0.2 25)' },
  };
  return (
    <button {...p} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: sizes.gap,
      padding: sizes.padding, fontSize: sizes.fontSize, fontWeight: 700, fontFamily: 'var(--font)',
      borderRadius: sizes.radius, width: full ? '100%' : undefined, lineHeight: 1.1,
      transition: 'transform .12s, filter .15s, box-shadow .15s', whiteSpace: 'nowrap',
      ...variants[variant], ...style,
    }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      {icon && <Icon name={icon} size={sizes.fontSize + 3} stroke={2.4} />}
      {children}
      {iconR && <Icon name={iconR} size={sizes.fontSize + 3} stroke={2.4} />}
    </button>
  );
}

function CatBadge({ cat, size = 'md', solid = false }) {
  const c = CATS[cat]; if (!c) return null;
  const s = size === 'sm' ? { fs: 11.5, ic: 13, pad: '3px 9px 3px 7px', gap: 4 }
    : { fs: 13, ic: 15, pad: '5px 11px 5px 9px', gap: 5 };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap, padding: s.pad,
      borderRadius: 99, fontSize: s.fs, fontWeight: 700,
      background: solid ? c.color : `color-mix(in oklch, ${c.color} 15%, white)`,
      color: solid ? '#fff' : c.color }}>
      <Icon name={c.icon} size={s.ic} stroke={2.4} />{c.label}
    </span>
  );
}

function TypeTag({ type, size = 'sm' }) {
  const m = TYPE_META[type]; if (!m) return null;
  const fs = size === 'sm' ? 11.5 : 13;
  return (
    <span title={m.tip} style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size === 'sm' ? '3px 8px' : '4px 10px', borderRadius: 8, fontSize: fs, fontWeight: 700,
      background: 'var(--surface-2)', color: 'var(--ink-2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
      <Icon name={m.icon} size={fs + 1} stroke={2.2} />{m.label}
    </span>
  );
}

function Chip({ children, active, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 13px', borderRadius: 99, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
      transition: 'all .15s', background: active ? 'var(--ink)' : 'var(--surface)',
      color: active ? '#fff' : 'var(--ink-2)',
      boxShadow: active ? 'none' : 'inset 0 0 0 1.4px var(--line-2)', ...style }}>
      {children}
    </button>
  );
}

function AIPill({ label = 'AI', size = 'sm', style }) {
  const fs = size === 'sm' ? 10.5 : 12;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: size === 'sm' ? '2px 7px 2px 5px' : '3px 9px 3px 7px',
      borderRadius: 99, background: 'var(--ai-grad)', color: '#fff', fontSize: fs, fontWeight: 800,
      fontFamily: 'var(--font-display)', letterSpacing: 0.2, ...style }}>
      <Sparkles size={fs + 2} color="#fff" /> {label}
    </span>
  );
}

function Segmented({ options, value, onChange, style }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--bg-2)', borderRadius: 13, padding: 4, gap: 2, ...style }}>
      {options.map(o => {
        const v = o.value ?? o; const lab = o.label ?? o;
        const on = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            position: 'relative', padding: '7px 15px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap',
            color: on ? 'var(--ink)' : 'var(--ink-3)', background: on ? 'var(--surface)' : 'transparent',
            boxShadow: on ? 'var(--shadow-sm)' : 'none', transition: 'all .18s', display: 'inline-flex',
            alignItems: 'center', gap: 6 }}>
            {o.icon && <Icon name={o.icon} size={15} stroke={2.2} />}{lab}
          </button>
        );
      })}
    </div>
  );
}

function ProgressBar({ value, max, color = 'var(--brand)', height = 7 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ height, background: 'var(--bg-2)', borderRadius: 99, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 99,
        transition: 'width .6s cubic-bezier(.2,.8,.2,1)' }} />
    </div>
  );
}

function LikeButton({ liked, count, onToggle, size = 20, showCount = true }) {
  const [burst, setBurst] = useState(false);
  return (
    <button onClick={(e) => { e.stopPropagation(); if (!liked) { setBurst(true); setTimeout(() => setBurst(false), 500); } onToggle(); }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: liked ? 'var(--brand)' : 'var(--ink-3)',
        fontWeight: 700, fontSize: size * 0.7 }}>
      <Icon name="heart" size={size} fill={liked} stroke={2.2}
        style={{ animation: burst ? 'heartBurst .5s' : 'none' }} />
      {showCount && <span style={{ minWidth: 14, textAlign: 'left' }}>{count}</span>}
    </button>
  );
}

// ---- bottom sheet (mobile) ----
function Sheet({ open, onClose, children, title, height = 'auto', maxH = '88%' }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(30,18,12,0.42)',
      backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-end', animation: 'fadeIn .2s' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: maxH, height,
        background: 'var(--surface)', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(0,0,0,0.18)',
        animation: 'slideUp .32s cubic-bezier(.2,.85,.25,1)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden' }}>
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: 'var(--line-2)' }} />
        </div>
        {title && <div style={{ padding: '6px 22px 12px', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)' }}>{title}</div>}
        <div className="noscroll" style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ---- center modal (PC) ----
function Modal({ open, onClose, children, width = 560, title }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(30,18,12,0.4)',
      backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .2s', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxWidth: '100%', maxHeight: '90%', background: 'var(--surface)',
        borderRadius: 22, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'pop .3s cubic-bezier(.2,.85,.25,1)' }}>
        {title && (
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 800, fontSize: 19, fontFamily: 'var(--font-display)' }}>{title}</div>
            <button onClick={onClose} style={{ color: 'var(--ink-3)', display: 'flex' }}><Icon name="x" size={22} /></button>
          </div>
        )}
        <div className="noscroll" style={{ overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// ---- toast ----
function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const h = (e) => {
      const id = Math.random();
      setItems(s => [...s, { id, ...e.detail }]);
      setTimeout(() => setItems(s => s.filter(x => x.id !== id)), 2400);
    };
    window.addEventListener('app-toast', h);
    return () => window.removeEventListener('app-toast', h);
  }, []);
  return (
    <div style={{ position: 'absolute', top: 14, left: 0, right: 0, zIndex: 200, display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
      {items.map(it => (
        <div key={it.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '11px 18px',
          background: it.ai ? 'var(--ai-grad)' : 'var(--ink)', color: '#fff', borderRadius: 14, fontSize: 14,
          fontWeight: 600, boxShadow: 'var(--shadow-lg)', animation: 'floatUp .3s', maxWidth: '86%' }}>
          {it.ai ? <Sparkles size={17} color="#fff" /> : it.icon ? <Icon name={it.icon} size={18} stroke={2.4} /> : null}
          {it.msg}
        </div>
      ))}
    </div>
  );
}
window.toast = (msg, opts = {}) => window.dispatchEvent(new CustomEvent('app-toast', { detail: { msg, ...opts } }));

// typing dots for AI
function TypingDots({ color = 'var(--ai)' }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: color,
        animation: `blink 1s ${i * 0.15}s infinite` }} />)}
    </div>
  );
}

Object.assign(window, { Btn, CatBadge, TypeTag, Chip, AIPill, Segmented, ProgressBar, LikeButton, Sheet, Modal, ToastHost, TypingDots, TYPE_META });

// icons.jsx — simple line-icon set + shared visual helpers. Exports to window.
const ICONS = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5',
  chat: 'M4 5h16v11H8l-4 4z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  heart: 'M12 20s-7-4.6-9.3-9.2C1.2 7.6 3 4.5 6.2 4.5c2 0 3.2 1.2 3.8 2.3.6-1.1 1.8-2.3 3.8-2.3 3.2 0 5 3.1 3.5 6.3C19 15.4 12 20 12 20z',
  comment: 'M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z',
  users: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15 4.1a3.5 3.5 0 0 1 0 6.8',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1',
  calendar: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19zM4 9.5h16M8 3.5v3M16 3.5v3',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
  repeat: 'M4 9a5 5 0 0 1 5-5h8l-2.5-2.5M20 15a5 5 0 0 1-5 5H7l2.5 2.5M17 4l2.5 2.5L17 9M7 20l-2.5-2.5L7 15',
  series: 'M4 7h10M4 12h13M4 17h7M19 5v6m0 0 2.2-2.2M19 11l-2.2-2.2',
  bell: 'M18 8a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 14 18 8zM10.5 20a2 2 0 0 0 3 0',
  plus: 'M12 5v14M5 12h14',
  chevR: 'M9 6l6 6-6 6',
  chevL: 'M15 6l-6 6 6 6',
  chevD: 'M6 9l6 6 6-6',
  chevU: 'M18 15l-6-6-6 6',
  x: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
  send: 'M5 12l15-7-4.5 15-3.5-6z M12 13.5 20 5',
  image: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5zM4 16l4.5-4 4 3.5L16 11l4 4M9 9.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z',
  camera: 'M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-2h5.6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5zM12 16a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z',
  pin: 'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  edit: 'M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2zM14.5 6.5l3 3',
  trash: 'M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  filter: 'M4 6h16M7 12h10M10 18h4',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  listOl: 'M10 6h11M10 12h11M10 18h11M4 6h1v4M6 6h1.5a1.5 1.5 0 0 1 0 3H4M4 12h2a1.5 1.5 0 0 1 0 3H4v-2M4 18h2.5a1.5 1.5 0 0 1 0 3H4',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V20a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13a2 2 0 1 1 0-4 1.6 1.6 0 0 0 1.1-2.7l-.1-.1A2 2 0 1 1 7.8 3.4l.1.1A1.6 1.6 0 0 0 10.6 4 2 2 0 1 1 14.6 4a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 20 9a2 2 0 1 1 0 4z',
  logout: 'M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M15 16l4-4-4-4M19 12H9',
  arrowU: 'M12 19V5M6 11l6-6 6 6',
  mic: 'M12 15a3.5 3.5 0 0 0 3.5-3.5V7a3.5 3.5 0 1 0-7 0v4.5A3.5 3.5 0 0 0 12 15zM5.5 11.5a6.5 6.5 0 0 0 13 0M12 18.5V21',
  star: 'M12 3.5l2.6 5.6 6 .7-4.4 4.2 1.2 6L12 17.7 6.6 20l1.2-6L3.4 9.8l6-.7z',
  share: 'M16 8a3 3 0 1 0-2.8-4M8 12a3 3 0 1 0 0 0zm8 4a3 3 0 1 0-2.8 1.9M9.5 10.5l5-3M9.5 13.5l5 3',
  trending: 'M3 17l5-5 3.5 3.5L20 8M20 8h-4M20 8v4',
  ticket: 'M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4zM14 6v12',
  userPlus: 'M14 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-3A3.5 3.5 0 0 0 4 17.5V19M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM18 8v6M21 11h-6',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1zM14 8a4 4 0 0 1 0 8M14 4a8 8 0 0 1 0 16',
  back: 'M15 6l-6 6 6 6',
  sliders: 'M4 7h10M18 7h2M4 12h2M10 12h10M4 17h7M15 17h5M14 5v4M6 10v4M11 15v4',
  flag: 'M5 21V4h13l-2.5 4L18 12H5',
  thumbsUp: 'M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 2 2v3h5a2 2 0 0 1 2 2.3l-1.1 6A2 2 0 0 1 17 20H7',
  bookmark: 'M6 4h12v17l-6-4-6 4z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9h17M3.5 15h17M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18',
  zap: 'M13 3 4 14h6l-1 7 9-11h-6z',
  award: 'M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.5 13l-1.5 8 5-3 5 3-1.5-8',
  gift: 'M4 11h16v9H4zM3.5 7h17v4h-17zM12 7v13M12 7S10.5 3.5 8 4.5 9 7 12 7zM12 7s1.5-3.5 4-2.5S15 7 12 7z',
  cart: 'M6 6h15l-1.5 9H7.5L6 6zM6 6l-2-3H2M9 20a1.2 1.2 0 1 0 0-2.4M18 20a1.2 1.2 0 1 0 0-2.4',
  wallet: 'M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 7l2-4h14l2 4M16 11h.01',
  truck: 'M1 6h13l2 8h11v6a1 1 0 0 1-1 1h-1M6 21a2 2 0 1 0 0-4M18 21a2 2 0 1 0 0-4M5 6V4a1 1 0 0 1 1-1h3',
  receipt: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h4',
  headset: 'M4 14v-2a8 8 0 0 1 16 0v2M6 14h-.5a1.5 1.5 0 0 0 0 3H7M18 14h.5a1.5 1.5 0 0 1 0 3H18M12 18v3',
  card: 'M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 10h18',
  coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M8 11h8',
  alert: 'M12 8v5M12 16h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  sun: 'M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
};

function Icon({ name, size = 22, stroke = 2, fill = false, style, className }) {
  const d = ICONS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'} strokeWidth={stroke} strokeLinecap="round"
      strokeLinejoin="round" style={{ flexShrink: 0, display: 'block', ...style }} className={className}>
      <path d={d} />
    </svg>
  );
}

// Sparkle cluster used for AI affordances
function Sparkles({ size = 18, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', ...style }}>
      <path d="M12 2.5l1.7 5L19 9l-5.3 1.5L12 16l-1.7-5.5L5 9l5.3-1.5z" fill={color} />
      <path d="M18.5 14l.8 2.4L22 17l-2.7.7-.8 2.4-.8-2.4L15 17l2.7-.6z" fill={color} opacity="0.7" />
      <path d="M5 15l.6 1.8L7.5 17.5l-1.9.6L5 20l-.6-1.9L2.5 17.5l1.9-.7z" fill={color} opacity="0.55" />
    </svg>
  );
}

// Deterministic warm gradient placeholder for any "photo" — honest but lively.
const GRADS = [
  ['oklch(0.78 0.15 45)', 'oklch(0.7 0.18 18)'],
  ['oklch(0.82 0.14 80)', 'oklch(0.72 0.16 40)'],
  ['oklch(0.78 0.13 150)', 'oklch(0.72 0.15 195)'],
  ['oklch(0.76 0.15 330)', 'oklch(0.7 0.17 0)'],
  ['oklch(0.8 0.13 250)', 'oklch(0.72 0.16 300)'],
  ['oklch(0.82 0.14 95)', 'oklch(0.74 0.16 135)'],
];
function hashStr(s = '') { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

function Photo({ seed = '', label, icon, radius = 0, style, children, dim = false }) {
  const g = GRADS[hashStr(seed) % GRADS.length];
  const ang = (hashStr(seed + 'a') % 90) + 100;
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      borderRadius: radius, background: `linear-gradient(${ang}deg, ${g[0]}, ${g[1]})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.16,
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.6) 0 2px, transparent 2px 11px)' }} />
      {dim && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(40,20,10,0.55))' }} />}
      {(label || icon) && !children && (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.92)', fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: 0.3 }}>
          {icon && <Icon name={icon} size={26} stroke={2} style={{ opacity: 0.9 }} />}
          {label && <span style={{ background: 'rgba(0,0,0,0.18)', padding: '2px 8px', borderRadius: 99 }}>{label}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

// Cover image with graceful fallback to the gradient placeholder.
function Cover({ src, seed = '', icon, dim = false, radius = 0, style }) {
  if (src) {
    return <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: radius, ...style }} />;
  }
  return <Photo seed={seed} icon={icon} dim={dim} radius={radius} style={style} />;
}

// Round monogram avatar with warm color from name
function Avatar({ name = '?', size = 38, style, ring }) {
  const hues = [36, 66, 155, 330, 265, 22, 230, 110];
  const h = hues[hashStr(name) % hues.length];
  const ch = name.replace(/[^\u4e00-\u9fa5A-Za-z]/g, '').slice(-1) || name.slice(0, 1);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(140deg, oklch(0.8 0.12 ${h}), oklch(0.68 0.16 ${h}))`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.42, fontFamily: 'var(--font-display)',
      boxShadow: ring ? '0 0 0 2.5px #fff, 0 0 0 4px ' + `oklch(0.68 0.16 ${h})` : 'none', ...style,
    }}>{ch}</div>
  );
}

function PhotoLightbox({ open, seeds = [], index = 0, onClose }) {
  const [idx, setIdx] = React.useState(index);
  React.useEffect(() => { if (open) setIdx(index); }, [open, index]);
  if (!open || !seeds.length) return null;
  const n = seeds.length;
  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + n) % n); };
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % n); };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(12,10,8,0.94)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 52px', animation: 'fadeIn .2s' }}>
      <button type="button" onClick={e => { e.stopPropagation(); onClose(); }} aria-label="关闭"
        style={{ position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="x" size={22} /></button>
      {n > 1 && <div style={{ position: 'absolute', top: 18, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.85)',
        fontSize: 13, fontWeight: 700 }}>{idx + 1} / {n}</div>}
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, maxHeight: '78vh', aspectRatio: '4/3',
        borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>
        <Photo seed={seeds[idx]} label="活动照片" />
      </div>
      {n > 1 && <>
        <button type="button" onClick={prev} aria-label="上一张"
          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.14)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevL" size={24} /></button>
        <button type="button" onClick={next} aria-label="下一张"
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.14)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevR" size={24} /></button>
      </>}
    </div>
  );
}

Object.assign(window, { Icon, Sparkles, Photo, PhotoLightbox, Avatar, hashStr, ICONS });

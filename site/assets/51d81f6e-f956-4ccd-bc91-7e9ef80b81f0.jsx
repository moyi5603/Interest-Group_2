// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// Chrome.jsx — Simplified Chrome browser window (dark theme, macOS)
// No dependencies, no image assets. All inline styles + inline SVG.
// Exports (to window): ChromeWindow, ChromeTabBar, ChromeToolbar, ChromeTab, ChromeTrafficLights
//
// Usage — wrap your page content in <ChromeWindow> to get the tab bar + URL bar:
//
//   <ChromeWindow width={1100} height={680} url="acme.design/pricing">
//     ...your page content...
//   </ChromeWindow>
/* END USAGE */

const CHROME_C = {
  barBg: '#202124',
  tabBg: '#35363a',
  text: '#e8eaed',
  dim: '#9aa0a6',
  urlBg: '#282a2d',
};

function ChromeTrafficLights() {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 14px' }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
    </div>
  );
}

// Single tab (active has curved scoops)
function ChromeTab({ title = 'New Tab', active = false }) {
  const curve = (flip) => (
    <svg width="8" height="10" viewBox="0 0 8 10"
      style={{ position: 'absolute', bottom: 0, [flip ? 'right' : 'left']: -8, transform: flip ? 'scaleX(-1)' : 'none' }}>
      <path d="M0 10C2 9 6 8 8 0V10H0Z" fill={CHROME_C.tabBg}/>
    </svg>
  );
  return (
    <div style={{
      position: 'relative', height: 34, alignSelf: 'flex-end',
      padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8,
      background: active ? CHROME_C.tabBg : 'transparent',
      borderRadius: '8px 8px 0 0', minWidth: 120, maxWidth: 220,
      fontFamily: 'system-ui, sans-serif', fontSize: 12,
      color: active ? CHROME_C.text : CHROME_C.dim,
    }}>
      {active && curve(false)}
      {active && curve(true)}
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#5f6368', flexShrink: 0 }} />
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
    </div>
  );
}

function ChromeTabBar({ tabs = [{ title: 'New Tab' }], activeIndex = 0 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: 44,
      background: CHROME_C.barBg, paddingRight: 8,
    }}>
      <ChromeTrafficLights />
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingLeft: 4, flex: 1 }}>
        {tabs.map((t, i) => <ChromeTab key={i} title={t.title} active={i === activeIndex} />)}
      </div>
    </div>
  );
}

function ChromeToolbar({ url = 'example.com' }) {
  const iconDot = (
    <div style={{
      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: CHROME_C.dim, opacity: 0.4 }} />
    </div>
  );
  return (
    <div style={{
      height: 40, background: CHROME_C.tabBg,
      display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px',
    }}>
      {iconDot}
      {/* url bar */}
      <div style={{
        flex: 1, height: 30, borderRadius: 15, background: CHROME_C.urlBg,
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px',
        margin: '0 6px',
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: CHROME_C.dim, opacity: 0.4 }} />
        <span style={{
          flex: 1, color: CHROME_C.text, fontSize: 13,
          fontFamily: 'system-ui, sans-serif',
        }}>{url}</span>
      </div>
      {iconDot}
    </div>
  );
}

function ChromeWindow({
  tabs = [{ title: 'New Tab' }], activeIndex = 0, url = 'example.com',
  width = 900, height = 600, children,
}) {
  return (
    <div style={{
      width, height, borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column', background: CHROME_C.tabBg,
    }}>
      <ChromeTabBar tabs={tabs} activeIndex={activeIndex} />
      <ChromeToolbar url={url} />
      <div style={{ flex: 1, background: '#fff', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

// App 装修后台 · 导航管理页（Ant Design Pro 风格静态还原）
const AD_C = {
  sidebarBg: '#fff', sidebarBorder: '#f0f0f0', menuText: 'rgba(0,0,0,0.88)', menuSubText: 'rgba(0,0,0,0.65)',
  menuIcon: 'rgba(0,0,0,0.45)', activeBg: '#e6f4ff', activeText: '#1677ff', panelBg: '#f0f2f5', sectionBg: '#fff',
  sectionBorder: '#f0f0f0', tileBorder: '#f0f0f0', tileIcon: '#bfbfbf', tileLabel: 'rgba(0,0,0,0.65)', toolbarBg: '#fff', primary: '#1677ff',
};
const AD_ICONS = {
  dashboard: 'M12 2.5l8 4.5v11l-8 4.5-8-4.5V7zM12 7v10M4 7l8 4.5M20 7l-8 4.5',
  idcard: 'M4 7h16v10H4zM8 11h4M8 14h6M14 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2',
  gift: 'M4 11h16v9H4zM3.5 7h17v4h-17zM12 7v13M12 7S10.5 3.5 8 4.5 9 7 12 7zM12 7s1.5-3.5 4-2.5S15 7 12 7z',
  puzzle: 'M8 4a2 2 0 0 1 2-2h1v2h2V2h1a2 2 0 0 1 2 2v1h2v2h-2v1a2 2 0 0 1-2 2h-1v2h-2v-2H8v2H6v-2H4v-2h2V8H4V6h2V4z',
  grid4: 'M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z',
  table: 'M4 6h16M4 10h16M4 14h16M4 18h16M8 6v12M16 6v12',
  calendar: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19zM4 9.5h16M8 3.5v3M16 3.5v3',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1',
  yen: 'M12 3v18M8 7h8M7 11h10M9 15h6',
  mail: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5zM4 7l8 5.5L20 7',
  layout: 'M4 5h16v14H4zM4 5v14M12 5v14M4 12h16',
  phone: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 17h.01',
  home: 'M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5',
  waterfall: 'M4 7h16M4 11h16M4 15h10M4 19h13',
  cardUser: 'M4 7h16v10H4zM9 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6 17c0-2 2.5-3 6-3s6 1 6 3',
  clipboard: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6M9 12h6M9 16h4',
  wallet: 'M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 7l2-4h14l2 4M16 11h.01',
  coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M8 11h8',
  dollar: 'M12 3v18M9 9.5a3 3 0 0 1 6 0c0 2-2 2.5-3 3s-3 1.5-3 3a3 3 0 0 0 6 0',
  listNav: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  chevD: 'M6 9l6 6 6-6', chevU: 'M18 15l-6-6-6 6',
};
function AdIcon({ name, size = 14, color = 'currentColor', stroke = 1.6 }) {
  const d = AD_ICONS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block' }}>
      <path d={d} />
    </svg>
  );
}
function AdMenuItem({ icon, label, active, sub, chevron, open, indent = 0 }) {
  const isSub = indent > 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, height: isSub ? 36 : 40,
      padding: isSub ? `0 16px 0 ${16 + indent}px` : '0 16px', margin: isSub && active ? '0 8px' : 0,
      borderRadius: isSub && active ? 6 : 0, background: active ? AD_C.activeBg : 'transparent',
      color: active ? AD_C.activeText : (isSub ? AD_C.menuSubText : AD_C.menuText),
      fontSize: 14, lineHeight: '22px', cursor: 'default', userSelect: 'none',
    }}>
      <AdIcon name={icon} size={14} color={active ? AD_C.activeText : AD_C.menuIcon} />
      <span style={{ flex: 1, fontWeight: active ? 500 : 400 }}>{label}</span>
      {chevron && <AdIcon name={open ? 'chevU' : 'chevD'} size={12} color="rgba(0,0,0,0.25)" stroke={2} />}
    </div>
  );
}
function AdSidebar() {
  return (
    <div style={{
      width: 208, flexShrink: 0, height: '100%', background: AD_C.sidebarBg,
      borderRight: `1px solid ${AD_C.sidebarBorder}`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
      overflowY: 'auto',
    }}>
      <AdMenuItem icon="dashboard" label="工作台" />
      <AdMenuItem icon="idcard" label="员工管理" chevron />
      <AdMenuItem icon="gift" label="福利发放" chevron />
      <AdMenuItem icon="puzzle" label="App装修" chevron open />
      <AdMenuItem icon="dashboard" label="页面装修" sub indent={24} />
      <AdMenuItem icon="table" label="二楼装修" sub indent={24} />
      <AdMenuItem icon="puzzle" label="装修模板" sub indent={24} />
      <AdMenuItem icon="grid4" label="导航管理" sub indent={24} active />
      <AdMenuItem icon="dashboard" label="启动管理" sub indent={24} />
      <AdMenuItem icon="dashboard" label="页面装修" chevron />
      <AdMenuItem icon="calendar" label="企微考勤数据" chevron />
      <AdMenuItem icon="user" label="消费规则管理" chevron />
      <AdMenuItem icon="yen" label="账户管理" chevron />
      <AdMenuItem icon="mail" label="公告信息" chevron />
      <AdMenuItem icon="layout" label="资讯管理" chevron />
    </div>
  );
}
function AdDeviceBar() {
  const btn = (icon, active) => (
    <div style={{
      width: 32, height: 32, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: active ? AD_C.primary : 'transparent', color: active ? '#fff' : 'rgba(0,0,0,0.45)',
    }}>
      <AdIcon name={icon} size={16} color={active ? '#fff' : 'rgba(0,0,0,0.45)'} stroke={1.8} />
    </div>
  );
  return (
    <div style={{
      height: 48, flexShrink: 0, background: AD_C.toolbarBg, borderBottom: `1px solid ${AD_C.sectionBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {btn('phone', false)}{btn('home', true)}{btn('user', false)}
    </div>
  );
}
function AdSectionHeader({ label, open = true }) {
  return (
    <div style={{
      height: 48, display: 'flex', alignItems: 'center', padding: '0 16px', background: AD_C.sectionBg,
      borderBottom: `1px solid ${AD_C.sectionBorder}`, fontSize: 14, fontWeight: 500, color: AD_C.menuText,
    }}>
      <span style={{ flex: 1 }}>{label}</span>
      <AdIcon name={open ? 'chevD' : 'chevU'} size={12} color="rgba(0,0,0,0.25)" stroke={2} />
    </div>
  );
}
function AdComponentTile({ icon, label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '12px 4px 10px', background: AD_C.sectionBg, border: `1px solid ${AD_C.tileBorder}`,
      borderRadius: 2, cursor: 'default', userSelect: 'none', minHeight: 88, width: 104,
    }}>
      <AdIcon name={icon} size={28} color={AD_C.tileIcon} stroke={1.4} />
      <span style={{ fontSize: 12, color: AD_C.tileLabel, textAlign: 'center', lineHeight: '18px' }}>{label}</span>
    </div>
  );
}
function AdComponentGrid({ items, cols = 3 }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${cols}, 104px)`, gap: 8,
      padding: '12px 16px', background: AD_C.panelBg,
    }}>
      {items.map(it => <AdComponentTile key={it.label} icon={it.icon} label={it.label} />)}
    </div>
  );
}
function AdComponentPanel() {
  return (
    <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', background: AD_C.panelBg }}>
      <AdDeviceBar />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <AdSectionHeader label="热区" />
        <AdSectionHeader label="商品组件" />
        <AdComponentGrid items={[{ icon: 'waterfall', label: '商品瀑布流' }]} />
        <AdSectionHeader label="用户组件" />
        <AdComponentGrid items={[
          { icon: 'cardUser', label: '用户卡片' }, { icon: 'clipboard', label: '用户订单' },
          { icon: 'wallet', label: '用户资产' }, { icon: 'coin', label: '用户账单' },
          { icon: 'dollar', label: '用户服务' }, { icon: 'clipboard', label: '用户互动' },
          { icon: 'clipboard', label: '荣誉组件' },
        ]} />
        <AdSectionHeader label="文章组件" />
        <AdComponentGrid items={[{ icon: 'listNav', label: '文章导航' }]} />
      </div>
    </div>
  );
}
function AppDecoAdmin() {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', background: '#fff', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
    }}>
      <AdSidebar /><AdComponentPanel />
    </div>
  );
}

Object.assign(window, {
  ChromeWindow, ChromeTabBar, ChromeToolbar, ChromeTab, ChromeTrafficLights, AppDecoAdmin,
});

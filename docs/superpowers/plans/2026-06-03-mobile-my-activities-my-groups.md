# 移动员工端「我的活动」与「我的小组」实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `site/` 离线 HTML 原型的移动员工端 HomeTab 新增 2 个快捷按钮（我的活动 / 我的小组），并实现对应的两个新页面。

**Architecture:** 所有改动集中在 `site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js`（mobile-screens 文件）。新增两个纯函数组件 `MyActivities` / `MyGroups`，复用现有的 `ListScreen`、`ActivityCard`、`GroupCard`、`Empty` 组件；在 `HomeTab` 的推荐词行下方插入 2 个快捷按钮；在 `MobileApp.renderTop` 注册两个新路由名。

**Tech Stack:** Vanilla React (JSX in `<script>`)、内联 CSS-in-JS、现有 `useM()` context hook

---

## 文件变更地图

| 文件 | 行区域 | 操作 |
|---|---|---|
| `site/assets/9e8f0b88-…js` | 73-78（HomeTab 建议词行） | 在下方插入快捷按钮块 |
| `site/assets/9e8f0b88-…js` | 314 之后（AllActivities 之前） | 新增 `MyActivities` 组件 |
| `site/assets/9e8f0b88-…js` | 329 之后（AllGroups 之前） | 新增 `MyGroups` 组件 |
| `site/assets/9e8f0b88-…js` | 433-436（renderTop switch cases） | 新增两个 case |
| `site/assets/9e8f0b88-…js` | 463（Object.assign 导出） | 添加两个新组件到导出 |

---

## Task 1：HomeTab 快捷按钮

**Files:**
- Modify: `site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js` (HomeTab，line 73–78)

- [ ] **Step 1：定位插入点**

打开文件，找到 HomeTab 内建议词 `div`（line 73）：
```js
        <div className="noscroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginTop: 10 }}>
          {['周末的羽毛球活动', '适合新人的小组', '本周还有什么活动'].map(s =>
```
目标是在这段 `</div>` 之后（line 78 的 `</div>` 关闭），下一行（AI 推荐 section 之前）插入快捷按钮块。

- [ ] **Step 2：插入快捷按钮**

将以下代码块插入在建议词 `</div>` 结束之后、`{/* AI recommendations */}` 注释之前：

```js
      {/* my shortcuts */}
      <div style={{ display: 'flex', gap: 12, padding: '12px 16px 4px' }}>
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
                gap: 8, padding: '14px 16px', borderRadius: 16, background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)', cursor: 'pointer', position: 'relative',
                border: 'none' }}>
              <div style={{ position: 'relative' }}>
                <Icon name={icon} size={24} stroke={2} style={{ color: 'var(--brand)' }} />
                {count > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -8, minWidth: 17, height: 17,
                    padding: '0 4px', borderRadius: 99, background: 'var(--brand)', color: '#fff',
                    fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', boxShadow: '0 0 0 2px #fff' }}>{count}</span>
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
            </button>
          );
        })}
      </div>
```

- [ ] **Step 3：验证**

打开 `site/index.html` 在浏览器中查看移动端 HomeTab，AI 搜索栏下方建议词行的正下方应出现「我的活动」和「我的小组」两个卡片式按钮。点击任一按钮不应报错（此时路由尚未注册，页面不跳转属正常，下一 task 实现）。

- [ ] **Step 4：提交**

```bash
git add site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js
git commit -m "feat(site/mobile): add my-activities and my-groups shortcuts to HomeTab"
```

---

## Task 2：MyActivities 页面

**Files:**
- Modify: `site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js`（在 line 314 `AllActivities` 前插入）

- [ ] **Step 1：插入 MyActivities 组件**

在 `function AllActivities()` 函数定义之前（line 315 之前）插入以下代码：

```js
function MyActivities() {
  const { nav, store } = useM();
  const [tab, setTab] = React.useState('all');
  const myActs = store.acts.filter(a => a.joinedByMe);
  const filtered = tab === 'all'     ? myActs
    : tab === 'upcoming' ? myActs.filter(a => a.status === 'upcoming')
    :                      myActs.filter(a => a.status === 'ended');
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
              <Btn variant="soft" size="sm" onClick={() => nav.go('allActs')}>
                去看看
              </Btn>
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
```

- [ ] **Step 2：验证**

打开文件，确认 `function MyActivities` 被插入在 `function AllActivities` 之前，且语法正确（无多余 `{}`）。

- [ ] **Step 3：提交**

```bash
git add site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js
git commit -m "feat(site/mobile): add MyActivities page"
```

---

## Task 3：MyGroups 页面

**Files:**
- Modify: `site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js`（在 `AllGroups` 前插入）

- [ ] **Step 1：插入 MyGroups 组件**

在 `function AllGroups()` 函数定义之前插入以下代码：

```js
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
            <Btn variant="soft" size="sm" onClick={() => nav.go('allGroups')}>
              去探索
            </Btn>
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
```

- [ ] **Step 2：验证语法**

确认 `function MyGroups` 被插入在 `function AllGroups` 之前，无语法错误。

- [ ] **Step 3：提交**

```bash
git add site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js
git commit -m "feat(site/mobile): add MyGroups page"
```

---

## Task 4：注册路由 & 导出

**Files:**
- Modify: `site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js`（`renderTop` switch 与导出行）

- [ ] **Step 1：在 renderTop 中添加两个 case**

找到 `renderTop` 函数的 switch 语句（原有 case 包括 `activity`、`group`、`moments` 等）：

```js
    switch (top.name) {
      case 'activity': return <ActivityDetail aid={p.aid} pickEnroll={!!p.pickEnroll} />;
      case 'group': return <GroupDetail gid={p.gid} />;
      case 'moments': return <MomentsFeed gid={p.gid} />;
      case 'post': return <PostMoment gid={p.gid} aid={p.aid} />;
      case 'aichat': return <AIChat />;
      case 'notify': return <NotifyThread />;
      case 'groupchat': return <GroupChat cid={p.cid} />;
      case 'allActs': return <AllActivities />;
      case 'allGroups': return <AllGroups />;
      default: return null;
    }
```

在 `case 'allActs'` 行之前插入两行：

```js
      case 'myActivities': return <MyActivities />;
      case 'myGroups': return <MyGroups />;
```

结果应为：

```js
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
```

- [ ] **Step 2：更新 Object.assign 导出**

找到文件最后一行：
```js
Object.assign(window, { MobileApp, ScreenScroll, HomeTab, MomentsFeed, PostMoment, AllActivities, AllGroups, NavBar });
```

改为：
```js
Object.assign(window, { MobileApp, ScreenScroll, HomeTab, MomentsFeed, PostMoment, AllActivities, AllGroups, MyActivities, MyGroups, NavBar });
```

- [ ] **Step 3：端到端验证**

打开 `site/index.html` → 切换到移动端视图 → 确认：
1. HomeTab 建议词下方有「我的活动」「我的小组」两个按钮，且分别显示数量徽标（林浅有 `joinedByMe: true` 的活动和 `joined: true` 的小组）
2. 点「我的活动」→ 进入 MyActivities 页，列出所有 `joinedByMe=true` 的活动；「全部/未开始/已结束」tab 切换正常
3. 点返回 → 回到 HomeTab
4. 点「我的小组」→ 进入 MyGroups 页，列出所有 `joined=true` 的小组
5. 在 MyGroups 页点击小组卡片 → 进入小组详情页

- [ ] **Step 4：最终提交**

```bash
git add site/assets/9e8f0b88-caf3-40f7-8fa9-75ecfa7b59d8.js
git commit -m "feat(site/mobile): wire MyActivities and MyGroups into MobileApp router"
```

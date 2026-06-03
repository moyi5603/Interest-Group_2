---
name: exp-mobile-patterns
description: EXP C 端移动端页面结构与交互模式。在新建或重构兴趣小组页面、列表页、详情页时使用。实现位于 site/ 原型。
---

# EXP Mobile Page Patterns

**载体**：`site/assets/9e8f0b88-…js`（移动壳层）+ 各详情脚本。

## 标准列表页

`ListScreen`：粘性顶栏（返回 + 标题）+ 可选 `ListSearchBar` + 滚动内容区。

```javascript
<ListScreen title="全部活动" onBack={nav.back} search={q} onSearchChange={setQ}>
  {/* ActivityCard 列表 */}
</ListScreen>
```

## 首页

`HomeTab` + `ScreenScroll` + 底部 `NavBar`（`insetBottom={74}`）。

区块：`SectionHeader` + 横向/纵向列表；「全部」入口 `nav.go('allActs')` / `nav.go('allGroups')`。

## 详情页

活动/小组详情在 `site/assets/6e9cd9ec-…js` 等；已结束活动可折叠详情、展示精彩瞬间入口。

## 筛选与状态

- 全部活动：仅 `store.acts.filter(a => a.status === 'upcoming')`（`isOpenActivity`）
- 往期回顾：首页 `EndedActsStrip`，仅 `status === 'ended'`

## PC 与 C 分离

- C 端：`site/` 手机框 + 移动导航
- PC 端：独立 `AdminApp`，勿套用移动 `ListScreen` 布局

## 参考文件

| 类型 | 文件 |
|------|------|
| 首页 / 全部活动 | `site/assets/9e8f0b88-…js` |
| 活动详情 | `site/assets/6e9cd9ec-…js` |
| 卡片 | `site/assets/56b1d150-…js` |

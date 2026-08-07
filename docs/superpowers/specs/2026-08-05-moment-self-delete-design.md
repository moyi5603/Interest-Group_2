# C 端精彩瞬间 · 自己发布可删除

日期：2026-08-05  
范围：移动员工端 `MomentCard` + `actions.delMoment`

## 行为

- 仅 `author === DB.ME` 显示删除入口（垃圾桶）
- 点击 → 确认 Modal → 从 `store.moments` 移除 → toast「已删除」
- 小组圈 / 活动详情 / 小组详情凡用 `MomentCard` 处生效

## 不做

- PC 管理端瞬间删除
- 撤销、批量删

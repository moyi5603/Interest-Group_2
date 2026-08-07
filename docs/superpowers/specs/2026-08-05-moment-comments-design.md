# C 端精彩瞬间 · 朋友圈式评论

日期：2026-08-05  
范围：移动端 `MomentCard` + `store.momentComments`

## 能力（A+B+C）

- 评论列表（灰底）+ 发表
- 回复某人：`甲 回复 乙：…`
- 「···」弹出：赞 / 评论
- 点自己的评论可删（确认）

## 数据

`momentComments[]`：`{ id, mid, author, text, replyTo?, replyAuthor?, time }`

## 不做

- PC 管理瞬间评论
- @ 选人、图片评论

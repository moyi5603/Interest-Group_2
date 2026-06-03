// data.js — mock dataset for 兴趣小组. Exposed as window.DB / window.CATS / helpers.
(function () {
  const CATS = {
    sport:     { key: 'sport',     label: '运动健身', icon: 'zap',      color: 'var(--c-sport)' },
    learning:  { key: 'learning',  label: '学习充电', icon: 'bookmark', color: 'var(--c-reading)' },
    career:    { key: 'career',    label: '职场成长', icon: 'trending', color: 'var(--c-photo)' },
    team:      { key: 'team',      label: '团队拓展', icon: 'users',    color: 'var(--c-outdoor)' },
    volunteer: { key: 'volunteer', label: '公益志愿', icon: 'heart',    color: 'var(--c-food)' },
    game:      { key: 'game',      label: '桌游电竞', icon: 'star',     color: 'var(--c-game)' },
    movie:     { key: 'movie',     label: '电影音乐', icon: 'mic',      color: 'var(--c-music)' },
    other:     { key: 'other',     label: '其他',     icon: 'dots',     color: 'var(--c-other)' },
  };

  const NAMES = ['林浅','陈航','苏曼','江野','周棠','许墨','沈星','何夕','顾乔','叶蓁','秦风','安然',
    '罗茜','黎川','温野','傅瑶','邵阳','简一','池夏','卫然','于归','骆铭','邓蔻','穆青'];
  const ME = '林浅'; // 当前员工

  const groups = [
    { id: 'g1', name: '城市夜跑团', cat: 'sport', lead: '江野', members: 128, acts: 24,
      join: 'free', joined: true, tags: ['每周三场','零基础友好','配速分组'], area: '总部 · 滨江园区',
      intro: '下班后甩开屏幕,用脚步丈量城市。我们按配速分组,从 6′30″ 到 5′00″ 都有搭子,跑完一起撸串复盘。',
      hot: true },
    { id: 'g2', name: '周末徒步野行', cat: 'sport', lead: '苏曼', members: 96, acts: 18,
      join: 'approve', joined: true, tags: ['周末出行','装备互助','AA 拼车'], area: '近郊 · 多线路',
      intro: '逃离工位,走进山野。每月 2-3 条线路,从溪谷轻徒步到登顶看日出,领队持证、全程保障。' },
    { id: 'g3', name: '深夜读书会', cat: 'learning', lead: '周棠', members: 64, acts: 31,
      join: 'free', joined: false, tags: ['双周一次','主题共读','不打卡不焦虑'], area: '总部 · 三楼书吧',
      intro: '一本书、一杯茶、一群不催进度的人。每期共读一本,线下围读 + 自由发言,读得慢也没关系。' },
    { id: 'g4', name: '周五观影会', cat: 'movie', lead: '许墨', members: 73, acts: 13,
      join: 'free', joined: false, tags: ['每周放映','影乐分享','偶尔开麦'], area: '总部 · 多功能厅',
      intro: '下班留下来,一起看场电影、聊聊配乐。从经典老片到话题新作,也有同事的现场弹唱开放麦。' },
    { id: 'g5', name: '桌游电竞局', cat: 'game', lead: '沈星', members: 142, acts: 40,
      join: 'free', joined: true, tags: ['每周开局','新手教学','五黑常驻'], area: '总部 · 休闲区',
      intro: '剧本杀、阿瓦隆、狼人杀、五黑上分,午休和下班后随时开局,菜也没关系,快乐第一。', hot: true },
    { id: 'g6', name: '职场成长营', cat: 'career', lead: '何夕', members: 58, acts: 16,
      join: 'approve', joined: false, tags: ['双周一次','经验分享','简历互助'], area: '总部 · 学习室',
      intro: '把同事的经验变成你的捷径。每期一个主题:汇报表达、向上沟通、项目复盘,老带新少走弯路。' },
    { id: 'g7', name: '暖心公益志愿队', cat: 'volunteer', lead: '顾乔', members: 110, acts: 29,
      join: 'free', joined: false, tags: ['月度活动','工会支持','人人可参与'], area: '城市 · 各公益点',
      intro: '用业余时间做点暖心的事。社区助老、山区捐书、公益义卖,工会提供保障,报名即可参与。' },
    { id: 'g8', name: '羽毛球俱乐部', cat: 'sport', lead: '叶蓁', members: 87, acts: 35,
      join: 'free', joined: false, tags: ['每周二四','场地已包','拍可借'], area: '总部 · 体育馆',
      intro: '已包下体育馆 4 片场地,周二周四晚常态开打。从娱乐双打到水平局,都能找到对手。' },
  ];

  function fmt(d) { return d; }

  /** 周期活动 mock：只物化近期若干场（UI 展示最近 5 场，场次理论上无限） */
  const RECURRING_SESSIONS_MOCK = 8;
  function recurringSessions(actId, dates, time, cap, firstSigned, joinedFirst) {
    return dates.slice(0, RECURRING_SESSIONS_MOCK).map((date, i) => ({
      id: `${actId}-s${i + 1}`,
      date,
      time,
      cap,
      signed: Math.max(0, Math.round(firstSigned * Math.pow(0.55, i))),
      joinedByMe: i === 0 && !!joinedFirst,
    }));
  }

  const actsRaw = [
    // ── 周期活动（按场次独立报名，sessions[] 内各场 signed 不同）──
    { id: 'a1', gid: 'g1', title: '滨江 8K 夜跑 · 江风配速团', type: 'recurring', cat: 'sport',
      date: '每周四', time: '19:30 - 21:00', repeatMode: 'weekly', repeatWeekdays: [4],
      loc: '滨江园区南门集合', host: '江野',
      cap: 40, signed: 27, liked: true, likes: 86, joinedByMe: true, status: 'upcoming',
      desc: '<p>沿滨江绿道往返 8 公里,按 <b>6′30″ / 6′00″ / 5′30″</b> 分三个配速组。</p><ul><li>出发前 10 分钟动态拉伸,跑后江边拉伸</li><li>跑完自由聚餐(AA),零基础友好,有陪跑员</li><li><b>按场次报名</b>,每期独立选人,不必每期都来</li></ul>',
      tags: ['8 公里','配速分组','按场次报名'], ai: false, repeatMonthDays: [],
      sessions: recurringSessions('a1', [
        '06月05日 周四', '06月12日 周四', '06月19日 周四', '06月26日 周四',
        '07月03日 周四', '07月10日 周四', '07月17日 周四', '07月24日 周四',
        '07月31日 周四', '08月07日 周四',
      ], '19:30 - 21:00', 40, 27, true) },
    { id: 'a10', gid: 'g3', title: '周一晚共读 · 固定围读局', type: 'recurring', cat: 'learning',
      date: '每周一', time: '19:00 - 20:00', repeatMode: 'weekly', repeatWeekdays: [1],
      loc: '三楼书吧', host: '周棠',
      cap: 18, signed: 12, liked: false, likes: 29, joinedByMe: false, status: 'upcoming',
      desc: '<p>每周一晚雷打不动的固定围读局,长期开放报名,来一次算一次,<b>无需追进度</b>。</p><ul><li>19:00 到场签到、自由领茶点</li><li>19:10–19:50 主题围读 + 自由发言</li><li>19:50–20:00 下期预告与共读书目投票</li></ul>',
      tags: ['每周一','固定场次','按场次报名'], ai: false, repeatMonthDays: [],
      deadlineIso: '2026-06-08T17:00:00+08:00',
      sessions: recurringSessions('a10', [
        '06月08日 周一', '06月15日 周一', '06月22日 周一', '06月29日 周一',
        '07月06日 周一', '07月13日 周一', '07月20日 周一', '07月27日 周一',
        '08月03日 周一', '08月10日 周一',
      ], '19:00 - 20:00', 18, 12, false) },
    { id: 'a5', gid: 'g8', title: '周四羽毛球娱乐局 · 水平不限', type: 'recurring', cat: 'sport',
      date: '每周四', time: '18:30 - 20:30', repeatMode: 'weekly', repeatWeekdays: [4],
      loc: '体育馆 1-4 号场', host: '叶蓁',
      cap: 32, signed: 30, liked: true, likes: 52, joinedByMe: false, status: 'upcoming',
      desc: '<p>常态周四局,已包 4 片场地。自由组队轮转,无拍可现场借。</p><ul><li>18:30 到场热身,19:00 正式开打</li><li>娱乐局与水平局分区,新手有人带</li></ul>',
      tags: ['每周四','可借拍','按场次报名'], ai: true, repeatMonthDays: [],
      sessions: recurringSessions('a5', [
        '06月05日 周四', '06月12日 周四', '06月19日 周四', '06月26日 周四',
        '07月03日 周四', '07月10日 周四', '07月17日 周四', '07月24日 周四',
        '07月31日 周四', '08月07日 周四',
      ], '18:30 - 20:30', 32, 30, false) },
    { id: 'a6', gid: 'g7', title: '社区助老 · 周末陪伴行动', type: 'recurring', cat: 'volunteer',
      date: '每周五', time: '14:00 - 16:30', repeatMode: 'weekly', repeatWeekdays: [5],
      loc: '滨江社区养老服务中心', host: '顾乔',
      cap: 12, signed: 9, liked: false, likes: 38, joinedByMe: false, status: 'upcoming',
      desc: '<p>陪社区长者聊天、教用智能手机、帮忙整理物品。</p><ul><li>工会提供交通补贴与志愿服务证明</li><li>每月固定周五下午,长期招募,按场次报名</li></ul>',
      tags: ['工会支持','含志愿证明','按场次报名'], ai: false, repeatMonthDays: [],
      sessions: recurringSessions('a6', [
        '06月06日 周五', '06月13日 周五', '06月20日 周五', '06月27日 周五',
        '07月04日 周五', '07月11日 周五', '07月18日 周五', '07月25日 周五',
        '08月01日 周五', '08月08日 周五',
      ], '14:00 - 16:30', 12, 9, false) },

    // ── 系列活动 · 整场报名（各期 signed 相同,同一批人）──
    { id: 'a8', gid: 'g2', title: '云栖谷溪行 · 看日出系列 ①', type: 'series', cat: 'sport',
      date: '05月25日 周日', time: '04:30 - 14:00', loc: '云栖谷停车场 (拼车)', host: '苏曼',
      cap: 24, signed: 24, liked: true, likes: 252, joinedByMe: true, status: 'ended',
      seriesDesc: '<p>「看日出」系列共 4 期,凌晨集合拼车前往云栖谷,登顶观日出后溪谷下撤。</p><ul><li>全程约 9 公里、累计爬升 600m,中级强度</li><li>需登山鞋,头灯由小组统一准备</li><li>领队持野外急救证,提供保险与能量补给</li><li><b>整场报名</b>,报名后须参与全部场次,不可中途加入</li></ul>',
      seriesTags: ['看日出系列','中级强度','整场报名','含拼车'],
      desc: '<p>「看日出」系列首期,凌晨集合拼车前往云栖谷。</p><ul><li>云海如约而至,全员登顶打卡</li><li>溪谷下撤,全程约 9 公里</li></ul>',
      tags: ['已结束','满员'], series: '看日出系列', seriesIdx: 1, seriesTotal: 4, seriesSignupMode: 'all', ai: false },
    { id: 'a2', gid: 'g2', title: '云栖谷溪行 · 看日出系列 ②', type: 'series', cat: 'sport',
      date: '06月08日 周日', time: '04:30 - 14:00', loc: '云栖谷停车场 (拼车)', host: '苏曼',
      cap: 24, signed: 22, liked: false, likes: 64, joinedByMe: true, status: 'upcoming',
      desc: '<p>「看日出」系列第 2 期。凌晨集合拼车,登顶观日出后溪谷下撤。</p><ul><li>全程约 9 公里、累计爬升 600m,中级强度</li><li>需登山鞋,头灯由小组统一准备</li><li>领队持野外急救证,提供保险与能量补给</li><li><b>整场报名</b>,与系列①同一批队员,不可中途加入</li></ul>',
      tags: ['看日出系列','中级强度','整场报名'], series: '看日出系列', seriesIdx: 2, seriesTotal: 4, seriesSignupMode: 'all',
      signupDeadline: '06月01日 周日', ai: false,
      deadlineIso: '2026-06-06T18:00:00+08:00' },
    { id: 'a11', gid: 'g2', title: '云栖谷溪行 · 看日出系列 ③', type: 'series', cat: 'sport',
      date: '06月22日 周日', time: '04:30 - 14:00', loc: '云栖谷停车场 (拼车)', host: '苏曼',
      cap: 24, signed: 22, liked: false, likes: 0, joinedByMe: true, status: 'upcoming',
      desc: '<p>「看日出」系列第 3 期。延续②线路,登顶后新增溪谷溯溪段。</p><ul><li>全程约 10 公里,中级偏上强度</li><li>需防水登山鞋,头灯与能量补给由小组统一准备</li></ul>',
      tags: ['看日出系列','中级强度','整场报名'], series: '看日出系列', seriesIdx: 3, seriesTotal: 4, seriesSignupMode: 'all', ai: false },
    { id: 'a12', gid: 'g2', title: '云栖谷溪行 · 看日出系列 ④', type: 'series', cat: 'sport',
      date: '07月06日 周日', time: '04:30 - 14:00', loc: '云栖谷停车场 (拼车)', host: '苏曼',
      cap: 24, signed: 22, liked: false, likes: 0, joinedByMe: true, status: 'upcoming',
      desc: '<p>「看日出」系列收官期。登顶看日出 + 溪谷下撤 + 系列结业合影。</p><ul><li>全程约 9 公里,中级强度</li><li>系列全程参与者颁发纪念徽章</li></ul>',
      tags: ['看日出系列','收官期','整场报名'], series: '看日出系列', seriesIdx: 4, seriesTotal: 4, seriesSignupMode: 'all', ai: false },

    // ── 系列活动 · 按场次报名（各期 signed 独立,可中途加入）──
    { id: 'a13', gid: 'g6', title: 'Go 语言技术分享 · 第 1 期', type: 'series', cat: 'career',
      date: '06月05日 周四', time: '19:00 - 20:30', loc: '总部 · 学习室 A', host: '何夕',
      cap: 20, signed: 18, liked: false, likes: 22, joinedByMe: false, status: 'upcoming',
      seriesDesc: '<p>Go 语言技术分享系列共 3 期,面向有编程基础的同学,从语法入门到微服务实战。</p><ul><li>每期独立主题,可只报感兴趣的场次</li><li>现场 Demo + Q&A,提供示例代码仓库</li><li>老带新,欢迎跨部门交流</li></ul>',
      seriesTags: ['Go 语言','按场次报名','职场成长'],
      desc: '<p>Go 语言技术分享系列第 1 期:基础语法与并发入门。</p><ul><li>适合有编程基础但未接触过 Go 的同学</li><li>现场 Demo + Q&A,提供示例代码仓库</li></ul>',
      tags: ['Go 语言','基础入门'], series: 'Go 语言技术分享', seriesIdx: 1, seriesTotal: 3, seriesSignupMode: 'independent', ai: false,
      deadlineIso: '2026-06-04T23:59:00+08:00' },
    { id: 'a14', gid: 'g6', title: 'Go 语言技术分享 · 第 2 期', type: 'series', cat: 'career',
      date: '06月12日 周四', time: '19:00 - 20:30', loc: '总部 · 学习室 A', host: '何夕',
      cap: 20, signed: 16, liked: false, likes: 0, joinedByMe: true, status: 'upcoming',
      desc: '<p>Go 语言技术分享系列第 2 期:并发模型与 channel 实践。</p><ul><li>不要求参加过第 1 期,有基础即可</li><li>结合真实项目案例讲解 goroutine 最佳实践</li></ul>',
      tags: ['Go 语言','并发模型','按场次报名'], series: 'Go 语言技术分享', seriesIdx: 2, seriesTotal: 3, seriesSignupMode: 'independent', ai: false },
    { id: 'a15', gid: 'g6', title: 'Go 语言技术分享 · 第 3 期', type: 'series', cat: 'career',
      date: '06月19日 周四', time: '19:00 - 20:30', loc: '总部 · 学习室 A', host: '何夕',
      cap: 20, signed: 9, liked: false, likes: 0, joinedByMe: false, status: 'upcoming',
      desc: '<p>Go 语言技术分享系列第 3 期:微服务架构与性能调优。</p><ul><li>独立报名,欢迎只参加本期</li><li>分享 gRPC、链路追踪与 pprof 实战经验</li></ul>',
      tags: ['Go 语言','微服务','按场次报名'], series: 'Go 语言技术分享', seriesIdx: 3, seriesTotal: 3, seriesSignupMode: 'independent', ai: true },

    // ── 单次活动 ──
    { id: 'a3', gid: 'g5', title: '午休快开一局 · 阿瓦隆', type: 'once', cat: 'game',
      date: '06月03日 周二', time: '12:30 - 13:20', loc: '休闲区 3 号桌', host: '沈星',
      cap: 10, signed: 8, liked: true, likes: 41, joinedByMe: false, status: 'upcoming',
      desc: '<p>午饭吃快点!10 人局阿瓦隆,新手有教学。</p><ul><li>40 分钟一局,绝不耽误下午摸鱼</li><li>输的人请下午奶茶 🧋</li></ul>',
      tags: ['午休局','新手友好'], ai: false,
      deadlineIso: '2026-06-03T10:30:00+08:00' },
    { id: 'a4', gid: 'g3', title: '六月共读《被讨厌的勇气》围读会', type: 'once', cat: 'learning',
      date: '06月12日 周四', time: '19:00 - 20:30', loc: '三楼书吧', host: '周棠',
      cap: 20, signed: 11, liked: false, likes: 33, joinedByMe: false, status: 'upcoming',
      desc: '<p>本期共读阿德勒心理学经典《被讨厌的勇气》。</p><ul><li>读到第几章都能来,现场围读 + 自由发言</li><li>提供茶点,不打卡不焦虑</li></ul>',
      tags: ['主题共读','提供茶点'], ai: false,
      deadlineIso: '2026-06-12T17:00:00+08:00' },

    // ── Mock 样例：无人报名 / 已终止 ──
    { id: 'a16', gid: 'g4', title: '初夏滨江摄影 Walk · 试点场', type: 'once', cat: 'movie',
      date: '06月18日 周三', time: '17:30 - 19:00', loc: '滨江步道 · 南门集合', host: '许墨',
      cap: 15, signed: 0, liked: false, likes: 0, joinedByMe: false, status: 'upcoming',
      desc: '<p>沿滨江步道拍摄日落与街景,<b>零基础可报名</b>,现场提供构图小贴士。</p><ul><li>自备手机或相机即可,无需专业设备</li><li>活动结束后可选交片参与内部评选</li><li><b>当前暂无人报名</b>,管理端可删除或继续招募</li></ul>',
      tags: ['摄影','试点场','无人报名'], ai: false,
      deadlineIso: '2026-06-18T16:00:00+08:00' },
    { id: 'a17', gid: 'g7', title: '六一亲子义卖 · 志愿者专场', type: 'once', cat: 'volunteer',
      date: '06月01日 周日', time: '09:00 - 16:00', loc: '滨江社区广场', host: '顾乔',
      cap: 30, signed: 18, liked: false, likes: 45, joinedByMe: true, status: 'cancelled',
      desc: '<p>因天气原因活动已<b>终止</b>,已报名同事将收到通知。</p><ul><li>原定协助布置摊位、引导人流、清点物资</li><li>工会将为已报名同学生成志愿时长说明</li><li>后续将择机重新发布,敬请关注小组动态</li></ul>',
      tags: ['已终止','亲子义卖','有人报名'], ai: false },

    // ── 已结束（单次历史场次,保留精彩瞬间关联）──
    { id: 'a7', gid: 'g1', title: '滨江 8K 夜跑 · 第 23 期', type: 'once', cat: 'sport',
      date: '05月29日 周四', time: '19:30 - 21:00', loc: '滨江园区南门集合', host: '江野',
      cap: 40, signed: 38, liked: true, likes: 120, joinedByMe: true, status: 'ended',
      desc: '<p>第 23 期已圆满结束,<b>38 人到场</b>,刷新本团单场到场纪录。</p><ul><li>6′00″ 组人数最多,跑后江边拉伸 + 自由撸串</li><li>精彩瞬间已同步至小组圈</li></ul>',
      tags: ['已结束','38人到场'], ai: false },
    { id: 'a9', gid: 'g5', title: '五黑上分之夜 · 第 12 期', type: 'once', cat: 'game',
      date: '05月28日 周三', time: '20:00 - 23:00', loc: '线上 + 休闲区', host: '沈星',
      cap: 20, signed: 18, liked: false, likes: 60, joinedByMe: false, status: 'ended',
      desc: '<p>五黑上分之夜第 12 期,连胜七局,喜提小组圈高光集锦。</p><ul><li>20:00 线上集合,22:00 线下复盘</li><li>新手可旁观学习,下期继续</li></ul>',
      tags: ['已结束','五黑'], ai: false },
  ];

  const acts = actsRaw.map(a => ({
    ...a,
    cover: `assets/covers/${a.id}.jpg`,
    repeatMonthDays: a.repeatMonthDays || [],
  }));

  // 精彩瞬间 (活动结束后成员发布)
  const moments = [
    { id: 'm1', aid: 'a7', gid: 'g1', author: '江野', text: '38 人!本团历史新高,这张全员合影必须存档 📸 下周三老地方见!',
      imgs: ['run-group','run-night'], likes: 47, time: '5月29日 21:36' },
    { id: 'm2', aid: 'a7', gid: 'g1', author: '林浅', text: '今晚 PB 了!5′28″ 跑完 8K,江风真的很顶。',
      imgs: ['run-track'], likes: 23, time: '5月29日 22:01' },
    { id: 'm3', aid: 'a8', gid: 'g2', author: '苏曼', text: '凌晨四点出发是值得的。云海翻涌的那一刻,所有人都安静了。',
      imgs: ['sunrise-1','sunrise-2','sunrise-3'], likes: 89, time: '5月25日 07:12' },
    { id: 'm4', aid: 'a8', gid: 'g2', author: '周棠', text: '第一次看到云海,腿软但值。系列②我还来!',
      imgs: ['sunrise-4'], likes: 31, time: '5月25日 09:40' },
    { id: 'm6', aid: 'a8', gid: 'g2', author: '江野', text: '全员登顶合影,云海就在身后。这张是系列①的高光 📸 24 人一个不少!',
      imgs: ['sunrise-cloud','sunrise-group'], likes: 76, time: '5月25日 07:28' },
    { id: 'm7', aid: 'a8', gid: 'g2', author: '顾乔', text: '下撤路上的溪谷太美了,水冰凉但脚程轻快。领队全程押队,安全感拉满。',
      imgs: ['sunrise-creek'], likes: 22, time: '5月25日 11:05' },
    { id: 'm8', aid: 'a8', gid: 'g2', author: '叶蓁', text: '四点集合时困到灵魂出窍,看到日出瞬间清醒。头灯串成一条线往上爬,像萤火虫。',
      imgs: ['sunrise-trail','sunrise-dawn'], likes: 19, time: '5月25日 06:58' },
    { id: 'm9', aid: 'a8', gid: 'g2', author: '黎川', text: '首期满员打卡!全程 9 公里没掉队的都是真·战友,系列②装备清单已收藏。',
      imgs: ['sunrise-team'], likes: 15, time: '5月25日 14:20' },
    { id: 'm5', aid: 'a9', gid: 'g5', author: '沈星', text: '七连胜截图来了,这波指挥我可以吹一年。',
      imgs: ['game-win'], likes: 28, time: '5月28日 23:18' },
  ];

  const comments = [
    { id: 'c1', aid: 'a1', author: '周棠', text: '6′00″ 组报到!上周差点跟丢,这次跟稳了。', likes: 8, time: '昨天 18:20' },
    { id: 'c2', aid: 'a1', author: '许墨', text: '跑后撸串记得叫我,我负责订位 🍢', likes: 12, time: '昨天 19:02' },
    { id: 'c3', aid: 'a1', author: '小趣 · AI', isAI: true, text: '已为本场报名的 27 位同学生成了配速分组建议表,出发前会推送到群里~ 雨天预案也准备好了 ☔️', likes: 5, time: '今天 09:10' },
    { id: 'c4', aid: 'a2', author: '江野', text: '装备清单看群公告,头灯一定要带!整场报名不可临时加入哦。', likes: 6, time: '前天 21:30' },
    { id: 'c5', aid: 'a3', author: '何夕', text: '午休局太香了,吃饭十分钟解决冲了。', likes: 4, time: '今天 10:05' },
    { id: 'c6', aid: 'a14', author: '黎川', text: '第 2 期 channel 案例很实用,没报第 1 期也能跟上。', likes: 3, time: '昨天 14:20' },
    { id: 'c7', aid: 'a13', author: '小趣 · AI', isAI: true, text: 'Go 系列第 1 期还剩 2 个名额,建议有 Java/Python 基础的同学优先报名~', likes: 2, time: '今天 08:30' },
    { id: 'c8', aid: 'a8', author: '苏曼', text: '系列①圆满收官!感谢 24 位战友凌晨四点准时集合,云海没有辜负我们。精彩瞬间已同步小组圈~', likes: 18, time: '5月25日 15:00' },
    { id: 'c9', aid: 'a8', author: '顾乔', text: '领队太稳了,下撤段全程押队。登山鞋和头灯真的不能省,系列②见!', likes: 9, time: '5月25日 16:22' },
    { id: 'c10', aid: 'a8', author: '江野', text: '从夜跑团跨界来徒步,体力还扛得住。这张云海合影必须当壁纸 🌄', likes: 14, time: '5月25日 18:05' },
  ];

  // PC 管理端：待审核的加入小组申请（仅 join === 'approve' 的小组）
  const joinRequests = [
    { id: 'jr1', gid: 'g6', name: '邵阳', dept: '产品部', appliedAt: '10 分钟前', status: 'pending' },
    { id: 'jr2', gid: 'g2', name: '黎川', dept: '研发部', appliedAt: '1 小时前', status: 'pending', note: '有多次徒步经验' },
    { id: 'jr3', gid: 'g6', name: '温野', dept: '设计部', appliedAt: '昨天 16:20', status: 'pending' },
  ];

  const notifications = [
    { id: 'n1', kind: 'reminder', aid: 'a1', read: false, time: '10 分钟前',
      text: '你报名的「滨江 8K 夜跑」明天 19:30 开始,记得带好装备哦' },
    { id: 'n2', kind: 'signup', gid: 'g1', aid: 'a1', read: false, time: '32 分钟前',
      text: '许墨 报名了你创建的活动「滨江 8K 夜跑 · 江风配速团」' },
    { id: 'n3', kind: 'join', gid: 'g1', read: false, time: '1 小时前', text: '邵阳 加入了你管理的小组「城市夜跑团」' },
    { id: 'n4', kind: 'comment', aid: 'a1', read: true, time: '2 小时前', text: '许墨 评论了「滨江 8K 夜跑」:跑后撸串记得叫我' },
    { id: 'n5', kind: 'cancel', gid: 'g2', aid: 'a2', read: true, time: '昨天', text: '罗茜 取消了「看日出系列」整场报名 (第 2 期起生效)' },
  ];

  // IM 沟通引擎会话
  const convos = [
    { id: 'cv0', kind: 'ai', name: '小趣 · 你的兴趣助手', seed: 'ai', time: '刚刚', unread: 2,
      preview: '为你找到 3 个周末的羽毛球活动,要现在报名吗?' },
    { id: 'cv1', kind: 'notify', name: '活动通知', seed: 'bell', time: '10 分钟前', unread: 3,
      preview: '「滨江 8K 夜跑」明天 19:30 开始,记得带装备' },
    { id: 'cv2', kind: 'group', name: '城市夜跑团', seed: 'g1', time: '21:36', unread: 0,
      preview: '江野:38 人!本团历史新高,合影已发小组圈' },
    { id: 'cv3', kind: 'group', name: '桌游电竞局', seed: 'g5', time: '12:48', unread: 5,
      preview: '沈星:午休阿瓦隆三缺一,速来休闲区 3 号桌!' },
    { id: 'cv4', kind: 'group', name: '周末徒步野行', seed: 'g2', time: '昨天', unread: 0,
      preview: '苏曼:系列②装备清单已更新,头灯必带' },
  ];

  // helpers
  const byId = (arr, id) => arr.find(x => x.id === id);
  const seriesEps = (acts, a) => {
    if (!a || a.type !== 'series' || !a.series) return [];
    return acts.filter(x => x.type === 'series' && x.series === a.series && x.gid === a.gid)
      .sort((x, y) => (x.seriesIdx || 0) - (y.seriesIdx || 0));
  };
  const seriesAnchor = (acts, a) => seriesEps(acts, a)[0] || a;
  const RECENT_SESSIONS_MAX = 5;
  const recentSessions = (sessions) => sessions ? sessions.slice(0, RECENT_SESSIONS_MAX) : null;
  const canPostMoment = (act) => !!act && act.status === 'ended' && !!act.joinedByMe;
  const momentEligibleActs = (acts, gid) => {
    let list = acts.filter(canPostMoment);
    if (gid) list = list.filter(a => a.gid === gid);
    return list.sort((a, b) => (a.date > b.date ? -1 : 1));
  };
  const actsOf = gid => acts.filter(a => a.gid === gid);
  const momentsOf = aid => moments.filter(m => m.aid === aid);
  const momentsOfGroup = gid => moments.filter(m => m.gid === gid);
  const commentsOf = aid => comments.filter(c => c.aid === aid);
  const groupOf = aid => groups.find(g => g.id === (byId(acts, aid) || {}).gid);

  window.DB = { groups, acts, moments, comments, joinRequests, notifications, convos, NAMES, ME };
  window.CATS = CATS;
  window.DBH = { byId, seriesEps, seriesAnchor, recentSessions, RECENT_SESSIONS_MAX, actsOf, canPostMoment, momentEligibleActs, momentsOf, momentsOfGroup, commentsOf, groupOf };
})();

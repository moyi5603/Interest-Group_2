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
  // PC 管理端 · 员工列表（组长搜索 mock）
  const employees = [
    { id: 'E10001', name: '陈航', dept: '人力资源部', title: 'HR 专员' },
    { id: 'E10002', name: '江野', dept: '产品部', title: '产品经理' },
    { id: 'E10003', name: '苏曼', dept: '市场部', title: '品牌运营' },
    { id: 'E10004', name: '周棠', dept: '研发中心', title: '前端工程师' },
    { id: 'E10005', name: '许墨', dept: '设计部', title: '视觉设计师' },
    { id: 'E10006', name: '沈星', dept: '产品部', title: '产品运营' },
    { id: 'E10007', name: '何夕', dept: '人力资源部', title: '培训专员' },
    { id: 'E10008', name: '顾乔', dept: '行政部', title: '行政主管' },
    { id: 'E10009', name: '叶蓁', dept: '财务部', title: '财务分析' },
    { id: 'E10010', name: '林浅', dept: '产品部', title: '产品专员' },
  ];

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
    { id: 'g4', name: '周五观影会', cat: 'movie', lead: '许墨', members: 73, acts: 17,
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
    { id: 'g9', name: '视觉设计交流组', cat: 'other', lead: '许墨', members: 45, acts: 12,
      join: 'free', joined: false, tags: ['UI/UX','设计分享','作品互评'], area: '总部 · 设计开放区',
      intro: 'UI、品牌、插画爱好者的圈子。双周设计分享、作品互评，设计部同事常驻交流。' },
  ];

  function fmt(d) { return d; }

  /** 周期活动 mock：只物化近期若干场（UI 展示最近 5 场，场次理论上无限） */
  const RECURRING_SESSIONS_MOCK = 8;
  function recurringSessions(actId, dates, time, cap, firstSigned, joinedFirst, endDates) {
    return dates.slice(0, RECURRING_SESSIONS_MOCK).map((date, i) => ({
      id: `${actId}-s${i + 1}`,
      date,
      endDate: endDates ? endDates[i] : undefined,
      time,
      cap,
      signed: Math.max(0, Math.round(firstSigned * Math.pow(0.55, i))),
      joinedByMe: i === 0 && !!joinedFirst,
    }));
  }

  const actsRaw = [
    // ── Mock 样例：无人报名（置顶便于 PC/移动端验收）──
    { id: 'a16', gid: 'g4', title: '初夏滨江摄影 Walk · 试点场', type: 'once', cat: 'movie',
      date: '06月18日 周三', time: '17:30 - 19:00', loc: '滨江步道 · 南门集合', host: '许墨',
      cap: 15, signed: 0, liked: false, likes: 0, joinedByMe: false, status: 'upcoming',
      desc: '<p>沿滨江步道拍摄日落与街景,<b>零基础可报名</b>,现场提供构图小贴士。</p><ul><li>自备手机或相机即可,无需专业设备</li><li>活动结束后可选交片参与内部评选</li><li><b>当前暂无人报名</b>,管理端可删除或继续招募</li></ul>',
      tags: ['摄影','试点场','无人报名'], ai: false,
      deadlineIso: '2026-06-18T16:00:00+08:00' },

    // ── 周期活动（按场次独立报名，sessions[] 内各场 signed 不同）──
    { id: 'a1', gid: 'g1', title: '滨江 8K 夜跑 · 江风配速团', type: 'recurring', cat: 'sport',
      date: '每周四', time: '19:30 - 21:00', repeatMode: 'weekly', repeatWeekdays: [4],
      loc: '滨江园区南门集合', host: '江野',
      cap: 40, signed: 27, liked: true, likes: 86, joinedByMe: true, status: 'upcoming',
      desc: '<p>沿滨江绿道往返 8 公里,按 <b>6′30″ / 6′00″ / 5′30″</b> 分三个配速组。</p><ul><li>出发前 10 分钟动态拉伸,跑后江边拉伸</li><li>跑完自由聚餐(AA),零基础友好,有陪跑员</li><li><b>按场次报名</b>,每期独立选人,不必每期都来</li></ul>',
      tags: ['8 公里','配速分组','按场次报名'], ai: false, repeatMonthDays: [],
      sessions: [
        { id: 'a1-s0', date: '05月29日 周四', time: '19:30 - 21:00', cap: 40, signed: 38, joinedByMe: true, status: 'ended' },
        ...recurringSessions('a1', [
        '06月05日 周四', '06月12日 周四', '06月19日 周四', '06月26日 周四',
        '07月03日 周四', '07月10日 周四', '07月17日 周四', '07月24日 周四',
        '07月31日 周四', '08月07日 周四',
      ], '19:30 - 21:00', 40, 27, true) ],
    },
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
    // 周期 · 跨天（通宵场,结束在次日）
    { id: 'a19', gid: 'g5', title: '通宵桌游马拉松 · 周五不眠局', type: 'recurring', cat: 'game',
      date: '每周五', endDate: '周六', spanDays: 1, time: '22:00 - 02:00', repeatMode: 'weekly', repeatWeekdays: [5],
      loc: '总部 · 休闲区', host: '沈星',
      cap: 16, signed: 10, liked: false, likes: 34, joinedByMe: false, status: 'upcoming',
      desc: '<p>周五夜不归宿,从晚上 22:00 一路开到<b>次日凌晨 02:00</b>。</p><ul><li>剧本杀 / 阿瓦隆 / 狼人杀轮换,新手有教学</li><li>提供宵夜与饮料,跨天场地已申请</li><li>按场次报名,来一次算一次</li></ul>',
      tags: ['跨天','通宵局','按场次报名'], ai: false, repeatMonthDays: [],
      sessions: recurringSessions('a19', [
        '06月06日 周五', '06月13日 周五', '06月20日 周五', '06月27日 周五',
        '07月04日 周五', '07月11日 周五', '07月18日 周五', '07月25日 周五',
      ], '22:00 - 02:00', 16, 10, false, [
        '06月07日 周六', '06月14日 周六', '06月21日 周六', '06月28日 周六',
        '07月05日 周六', '07月12日 周六', '07月19日 周六', '07月26日 周六',
      ]) },

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

    // 系列 · 跨天场次（每期过夜,结束在次日）
    { id: 'a20', gid: 'g2', title: '星空露营系列 · 第 1 期', type: 'series', cat: 'team',
      date: '06月14日 周六', endDate: '06月15日 周日', time: '16:00 - 09:00', loc: '近郊 · 萤火谷营地', host: '苏曼',
      cap: 30, signed: 19, liked: false, likes: 28, joinedByMe: false, status: 'upcoming',
      seriesDesc: '<p>星空露营系列共 2 期,<b>每期周六傍晚入营、周日上午撤营</b>,过夜跨天。</p><ul><li>含帐篷营位与早餐,自带睡袋</li><li>天文领队带观星,雨天顺延</li><li>整场报名,跨天活动请安排好行程</li></ul>',
      seriesTags: ['星空露营','跨天过夜','整场报名'],
      desc: '<p>星空露营第 1 期:萤火谷扎营观星。<b>06月14日 16:00 入营,06月15日 09:00 撤营</b>。</p><ul><li>傍晚扎营 + 篝火晚餐</li><li>夜间观星 + 次日溪边早餐</li></ul>',
      tags: ['星空露营','跨天过夜'], series: '星空露营系列', seriesIdx: 1, seriesTotal: 2, seriesSignupMode: 'all', ai: false,
      deadlineIso: '2026-06-12T18:00:00+08:00' },
    { id: 'a21', gid: 'g2', title: '星空露营系列 · 第 2 期', type: 'series', cat: 'team',
      date: '06月28日 周六', endDate: '06月29日 周日', time: '16:00 - 09:00', loc: '近郊 · 萤火谷营地', host: '苏曼',
      cap: 30, signed: 19, liked: false, likes: 0, joinedByMe: false, status: 'upcoming',
      desc: '<p>星空露营第 2 期:延续首期营地,新增银河摄影环节。<b>06月28日 16:00 入营,06月29日 09:00 撤营</b>。</p><ul><li>银河摄影教学</li><li>整场报名,与第 1 期同一批队员</li></ul>',
      tags: ['星空露营','跨天过夜'], series: '星空露营系列', seriesIdx: 2, seriesTotal: 2, seriesSignupMode: 'all', ai: false },

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
      cap: 20, signed: 15, liked: false, likes: 0, joinedByMe: false, status: 'upcoming',
      desc: '<p>Go 语言技术分享系列第 2 期:并发模型与 channel 实践。</p><ul><li>不要求参加过第 1 期,有基础即可</li><li>结合真实项目案例讲解 goroutine 最佳实践</li></ul>',
      tags: ['Go 语言','并发模型','按场次报名'], series: 'Go 语言技术分享', seriesIdx: 2, seriesTotal: 3, seriesSignupMode: 'independent', ai: false },
    { id: 'a15', gid: 'g6', title: 'Go 语言技术分享 · 第 3 期', type: 'series', cat: 'career',
      date: '06月19日 周四', time: '19:00 - 20:30', loc: '总部 · 学习室 A', host: '何夕',
      cap: 20, signed: 9, liked: false, likes: 0, joinedByMe: false, status: 'upcoming',
      desc: '<p>Go 语言技术分享系列第 3 期:微服务架构与性能调优。</p><ul><li>独立报名,欢迎只参加本期</li><li>分享 gRPC、链路追踪与 pprof 实战经验</li></ul>',
      tags: ['Go 语言','微服务','按场次报名'], series: 'Go 语言技术分享', seriesIdx: 3, seriesTotal: 3, seriesSignupMode: 'independent', ai: true },

    // ── 系列活动 · 按场次报名 · 自由加入小组（g4 验收用）──
    { id: 'a22', gid: 'g4', title: '银幕金曲 LIVE · 第 1 期', type: 'series', cat: 'movie',
      date: '06月07日 周六', time: '19:30 - 21:00', loc: '总部 · 多功能厅', host: '许墨',
      cap: 40, signed: 22, liked: false, likes: 36, joinedByMe: false, status: 'upcoming',
      seriesDesc: '<p>「银幕金曲 LIVE」系列共 4 期,每周六晚在多功能厅现场弹唱经典电影配乐。<b>自由加入小组,按场次报名</b>,只报想听的场次即可。</p><ul><li>每期独立主题,不必追进度</li><li>现场开放麦,欢迎自带乐器</li><li>提供茶点,结束后可自由交流</li></ul>',
      seriesTags: ['银幕金曲','按场次报名','自由加入','现场弹唱'],
      desc: '<p>第 1 期主题:<b>宫崎骏动画配乐专场</b>。久石让经典曲目现场演绎 + 幕后故事分享。</p><ul><li>适合零基础,来听就好</li><li>19:30 开场,建议提前 10 分钟到场</li></ul>',
      tags: ['宫崎骏','动画配乐','按场次报名'], series: '银幕金曲 LIVE', seriesIdx: 1, seriesTotal: 4, seriesSignupMode: 'independent', ai: false,
      deadlineIso: '2026-06-06T18:00:00+08:00' },
    { id: 'a23', gid: 'g4', title: '银幕金曲 LIVE · 第 2 期', type: 'series', cat: 'movie',
      date: '06月14日 周六', time: '19:30 - 21:00', loc: '总部 · 多功能厅', host: '许墨',
      cap: 40, signed: 31, liked: true, likes: 0, joinedByMe: false, status: 'upcoming',
      desc: '<p>第 2 期主题:<b>港片黄金时代</b>。张国荣、梅艳芳、Beyond 等经典银幕金曲现场重温。</p><ul><li>独立报名,未参加第 1 期也可直接来</li><li>本期含 1 段观众合唱环节</li></ul>',
      tags: ['港片经典','按场次报名'], series: '银幕金曲 LIVE', seriesIdx: 2, seriesTotal: 4, seriesSignupMode: 'independent', ai: false },
    { id: 'a24', gid: 'g4', title: '银幕金曲 LIVE · 第 3 期', type: 'series', cat: 'movie',
      date: '06月21日 周六', time: '19:30 - 21:00', loc: '总部 · 多功能厅', host: '许墨',
      cap: 40, signed: 14, liked: false, likes: 0, joinedByMe: false, status: 'upcoming',
      desc: '<p>第 3 期主题:<b>科幻史诗配乐</b>。从《星际穿越》到《沙丘》,用大编制感现场还原银幕氛围。</p><ul><li>含 15 分钟配乐赏析小讲座</li><li>欢迎带朋友一起来听</li></ul>',
      tags: ['科幻配乐','按场次报名'], series: '银幕金曲 LIVE', seriesIdx: 3, seriesTotal: 4, seriesSignupMode: 'independent', ai: true },
    { id: 'a25', gid: 'g4', title: '银幕金曲 LIVE · 第 4 期', type: 'series', cat: 'movie',
      date: '06月28日 周六', time: '19:30 - 21:00', loc: '总部 · 多功能厅', host: '许墨',
      cap: 40, signed: 8, liked: false, likes: 0, joinedByMe: false, status: 'upcoming',
      desc: '<p>第 4 期·收官场:<b>员工原创 + 自由点歌</b>。前三期人气曲目返场,开放现场点歌与原创分享。</p><ul><li>按场次报名,收官场名额有限</li><li>系列参与者可获纪念歌单 PDF</li></ul>',
      tags: ['收官场','自由点歌','按场次报名'], series: '银幕金曲 LIVE', seriesIdx: 4, seriesTotal: 4, seriesSignupMode: 'independent', ai: false },

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
    // 单次 · 跨多天（连续日程）
    { id: 'a18', gid: 'g2', title: '年度团队户外拓展训练营', type: 'once', cat: 'team',
      date: '06月18日 周三', endDate: '06月20日 周五', time: '09:00 - 16:00', loc: '近郊 · 怀谷拓展基地', host: '苏曼',
      cap: 40, signed: 23, liked: false, likes: 18, joinedByMe: false, status: 'upcoming',
      desc: '<p>连续三天两夜的团队拓展训练营,<b>06月18日 09:00 集合出发,06月20日 16:00 返程解散</b>。</p><ul><li>含住宿与三餐,统一大巴往返</li><li>破冰、高空项目、协作沙盘、复盘分享</li><li>跨天活动,请按行程安排好工作交接</li></ul>',
      tags: ['跨多天','含食宿','团队拓展'], ai: false,
      deadlineIso: '2026-06-15T18:00:00+08:00' },

    // ── Mock 样例：已终止 ──
    { id: 'a17', gid: 'g7', title: '六一亲子义卖 · 志愿者专场', type: 'once', cat: 'volunteer',
      date: '06月01日 周日', time: '09:00 - 16:00', loc: '滨江社区广场', host: '顾乔',
      cap: 30, signed: 17, liked: false, likes: 45, joinedByMe: true, status: 'cancelled',
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
    // ── Mock 样例：9张图（移动端 3×3 宫格 + PC 管理端多图验收）──
    { id: 'm10', aid: 'a8', gid: 'g2', author: '叶蓁',
      text: '整理了 9 张大合照与沿途风景,从凌晨出发到云海翻涌,每一张都舍不得删。这期活动值得一整本相册 📷',
      imgs: ['sunrise-1','sunrise-2','sunrise-3','sunrise-4','sunrise-cloud','sunrise-group','sunrise-creek','sunrise-trail','sunrise-dawn'],
      likes: 54, time: '5月25日 20:10' },
    { id: 'm5', aid: 'a9', gid: 'g5', author: '沈星', text: '七连胜截图来了,这波指挥我可以吹一年。',
      imgs: ['game-win'], likes: 28, time: '5月28日 23:18' },
  ];

  const comments = [
    { id: 'c1',  aid: 'a1', author: '周棠', text: '6′00″ 组报到！上周差点跟丢，这次跟稳了。', likes: 8,  time: '昨天 18:20' },
    { id: 'c2',  aid: 'a1', author: '许墨', text: '跑后撸串记得叫我，我负责订位 🍢', likes: 12, time: '昨天 19:02' },
    { id: 'c3',  aid: 'a1', author: '小趣 · AI', isAI: true, text: '已为本场报名的 27 位同学生成了配速分组建议表，出发前会推送到群里～ 雨天预案也准备好了 ☔️', likes: 5, time: '今天 09:10' },
    { id: 'c11', aid: 'a1', author: '沈星', text: '5′30″ 组求组队，上次单飞有点无聊哈哈', likes: 6, time: '今天 09:22' },
    { id: 'c12', aid: 'a1', author: '叶蓁', text: '新人第一次跑，6′30″ 组够不够？', likes: 3, time: '今天 09:35' },
    { id: 'c13', aid: 'a1', author: '顾乔', text: '够的！6′30 组很友好，领队全程带节奏 💪', likes: 7, time: '今天 09:41' },
    { id: 'c14', aid: 'a1', author: '江野', text: '记得带头灯！滨江最后一段没路灯', likes: 9, time: '今天 10:05' },
    { id: 'c15', aid: 'a1', author: '安然', text: '撸串 +1，这次一定不缺席！上次临时加班悔死了 😭', likes: 4, time: '今天 10:18' },
    { id: 'c16', aid: 'a1', author: '秦风', text: '今天天气正好，28° 微风，跑起来！', likes: 11, time: '今天 11:00' },
    { id: 'c17', aid: 'a1', author: '苏曼', text: '上周配速表很准，这次继续用起来', likes: 5, time: '今天 11:30' },
    { id: 'c18', aid: 'a1', author: '黎川', text: '组长跑的时候能帮忙拍一下吗，上次的照片太糊了', likes: 2, time: '今天 12:00' },
    { id: 'c19', aid: 'a1', author: '温野', text: '我带自拍杆！大家统一在终点拍合影', likes: 8, time: '今天 12:10' },
    { id: 'c4',  aid: 'a2', author: '江野', text: '装备清单看群公告，头灯一定要带！整场报名不可临时加入哦。', likes: 6, time: '前天 21:30' },
    { id: 'c5',  aid: 'a3', author: '何夕', text: '午休局太香了，吃饭十分钟解决冲了。', likes: 4, time: '今天 10:05' },
    { id: 'c6',  aid: 'a14', author: '黎川', text: '第 2 期 channel 案例很实用，没报第 1 期也能跟上。', likes: 3, time: '昨天 14:20' },
    { id: 'c7',  aid: 'a13', author: '小趣 · AI', isAI: true, text: 'Go 系列第 1 期还剩 2 个名额，建议有 Java/Python 基础的同学优先报名～', likes: 2, time: '今天 08:30' },
    { id: 'c8',  aid: 'a8', author: '苏曼', text: '系列①圆满收官！感谢 24 位战友凌晨四点准时集合，云海没有辜负我们。精彩瞬间已同步小组圈～', likes: 18, time: '5月25日 15:00' },
    { id: 'c9',  aid: 'a8', author: '顾乔', text: '领队太稳了，下撤段全程押队。登山鞋和头灯真的不能省，系列②见！', likes: 9, time: '5月25日 16:22' },
    { id: 'c10', aid: 'a8', author: '江野', text: '从夜跑团跨界来徒步，体力还扛得住。这张云海合影必须当壁纸 🌄', likes: 14, time: '5月25日 18:05' },
    { id: 'c20', aid: 'a1', author: ME, text: '5′30″ 组已就位，今晚目标跑进 5′20″，有一起冲的搭子吗？', likes: 6, time: '昨天 17:45' },
    { id: 'c21', aid: 'a1', author: ME, text: '上次江风配速很稳，这次继续跟 6′00″ 组热身～', likes: 4, time: '今天 08:52' },
    { id: 'c22', aid: 'a2', author: ME, text: '系列②装备已齐，头灯和登山鞋都检查过了，周日见！', likes: 3, time: '前天 20:10' },
    { id: 'c23', aid: 'a8', author: ME, text: '首期云海太震撼了，照片已设成壁纸，系列②继续冲 🌄', likes: 11, time: '5月25日 17:30' },
    { id: 'c24', aid: 'a3', author: ME, text: '午休桌游局带我一个，上次阿瓦隆没玩够哈哈', likes: 2, time: '今天 09:18' },
    { id: 'c25', aid: 'a13', author: ME, text: '有 Go 基础，第 1 期已报，期待并发那块 Demo', likes: 1, time: '昨天 11:20' },
    { id: 'c26', aid: 'a22', author: '许墨', text: '第 1 期宫崎骏专场曲目单已更新群公告,欢迎只报这一场的同学～', likes: 5, time: '今天 09:00' },
    { id: 'c27', aid: 'a23', author: '周棠', text: '港片那期我想合唱《当年情》,有一起的吗?', likes: 3, time: '昨天 15:40' },
  ];

  // PC 管理端：待审核的加入小组申请（仅 join === 'approve' 的小组）
  const formatJoinAppliedAt = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    const pad = (n) => String(n).padStart(2, '0');
    return `${dt.getMonth() + 1}/${dt.getDate()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
  };
  const joinRequests = [
    { id: 'jr1', gid: 'g6', name: '邵阳', dept: '产品部', appliedAt: '6/3 10:52:00', status: 'pending' },
    { id: 'jr2', gid: 'g2', name: '黎川', dept: '研发部', appliedAt: '6/3 09:48:00', status: 'pending', note: '有多次徒步经验' },
    { id: 'jr3', gid: 'g6', name: '温野', dept: '设计部', appliedAt: '6/3 09:30:00', status: 'pending' },
    { id: 'jr4', gid: 'g2', name: '傅瑶', dept: '市场部', appliedAt: '6/3 14:20:00', status: 'pending', note: '周末均可出行' },
    { id: 'jr5', gid: 'g6', name: '简一', dept: '研发部', appliedAt: '6/2 16:20:00', status: 'pending' },
    { id: 'jr6', gid: 'g2', name: '池夏', dept: '设计部', appliedAt: '6/2 11:05:00', status: 'pending' },
    { id: 'jr7', gid: 'g6', name: '卫然', dept: '运营部', appliedAt: '6/2 08:40:00', status: 'pending', note: '想参加汇报表达专题' },
    { id: 'jr8', gid: 'g2', name: '于归', dept: '产品部', appliedAt: '6/2 17:30:00', status: 'pending' },
    { id: 'jr9', gid: 'g6', name: '骆铭', dept: '财务部', appliedAt: '6/2 10:15:00', status: 'pending' },
    { id: 'jr10', gid: 'g2', name: '邓蔻', dept: '人力部', appliedAt: '6/1 20:00:00', status: 'pending', note: '有户外急救证' },
    { id: 'jr11', gid: 'g6', name: '穆青', dept: '法务部', appliedAt: '6/1 15:45:00', status: 'pending' },
    { id: 'jr12', gid: 'g2', name: '秦风', dept: '研发部', appliedAt: '6/1 09:00:00', status: 'pending' },
    { id: 'jr13', gid: 'g6', name: '安然', dept: '设计部', appliedAt: '5/31 18:20:00', status: 'pending', note: '同事推荐加入' },
    { id: 'jr14', gid: 'g2', name: '罗茜', dept: '产品部', appliedAt: '5/30 16:00:00', status: 'pending' },
    { id: 'jr15', gid: 'g6', name: '叶蓁', dept: '市场部', appliedAt: '5/30 11:30:00', status: 'pending' },
    { id: 'jr16', gid: 'g2', name: '陈航', dept: '运营部', appliedAt: '5/29 14:00:00', status: 'pending', note: '可担任副领队' },
    { id: 'jr17', gid: 'g6', name: '苏曼', dept: '研发部', appliedAt: '5/28 19:10:00', status: 'pending' },
    { id: 'jr18', gid: 'g2', name: '顾乔', dept: '产品部', appliedAt: '5/27 10:45:00', status: 'pending' },
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

  // IM 会话列表（对齐沟通引擎 IM 样例 + 保留小趣）
  const convos = [
    { id: 'cv0', kind: 'ai', name: '你的兴趣助手', seed: 'ai', time: '刚刚', unread: 2, pinned: true,
      preview: '为你找到 3 个周末的羽毛球活动,要现在报名吗?' },
    { id: 'cv1', kind: 'notify', name: '沟通引擎', seed: 'engine', time: '10:32', unread: 7, pinned: true, official: true,
      prefix: '[提醒]', preview: '「城市夜跑团」发布了新活动「滨江 8K 夜跑」,快来看看' },
    { id: 'cv2', kind: 'dm', name: '江野', seed: '江野', time: '10:30', unread: 2, online: true, pinned: true,
      preview: '好的,明天夜跑见!' },
    { id: 'cv3', kind: 'dm', name: '许墨', seed: '许墨', time: '09:15', unread: 0, online: true,
      prefix: '[草稿]', preview: '我看一下系列活动报名' },
    { id: 'cv5', kind: 'dm', name: '沈星', seed: '沈星', time: '昨天', unread: 0, muted: true,
      preview: '收到,谢谢!' },
    { id: 'cv7', kind: 'dm', name: '周棠', seed: '周棠', time: '周一', unread: 1, online: true,
      preview: '读书会材料已更新' },
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
  const isSlotPast = (session, actStatus) => {
    if (!session) return false;
    if (session.status === 'ended' || session.status === 'cancelled') return true;
    if (actStatus === 'ended' || actStatus === 'cancelled') return true;
    const k = parseActDateKey(session.date);
    return k != null && k < PROTO_TODAY_KEY;
  };
  const canPostMoment = (act) => {
    if (!act) return false;
    if (act.status === 'ended' && act.joinedByMe) return true;
    if (act.type === 'recurring' && act.sessions) {
      return act.sessions.some(s => s.joinedByMe && isSlotPast(s, act.status));
    }
    return false;
  };
  const momentEligibleActs = (acts, gid) => {
    let list = acts.filter(canPostMoment);
    if (gid) list = list.filter(a => a.gid === gid);
    return list.sort((a, b) => (a.date > b.date ? -1 : 1));
  };
  const actsOf = gid => acts.filter(a => a.gid === gid);
  const momentsOf = aid => moments.filter(m => m.aid === aid);
  const momentsOfGroup = gid => moments.filter(m => m.gid === gid);
  const commentsOf = aid => comments.filter(c => c.aid === aid && !c.isAI);
  const groupOf = aid => groups.find(g => g.id === (byId(acts, aid) || {}).gid);

  // 跨端共享：原型中移动端与 PC 互斥渲染,各自切 Tab 时从 DB 重新初始化。
  // 这两个 helper 直接写回共享的 DB 数组,实现「C 端发起入组申请 → PC 审核 → C 端生效」联动。
  const patchGroup = (gid, patch) => { const g = byId(groups, gid); if (g) Object.assign(g, patch); };
  const pushSelfJoinRequest = (gid) => {
    if (joinRequests.some(r => r.self && r.gid === gid && r.status === 'pending')) return;
    joinRequests.unshift({ id: 'jr-self-' + gid, gid, name: ME, dept: '产品部', appliedAt: formatJoinAppliedAt(new Date()),
      status: 'pending', self: true, note: '想报名该小组活动' });
  };
  const removeJoinRequest = (id) => { const i = joinRequests.findIndex(r => r.id === id); if (i >= 0) joinRequests.splice(i, 1); };

  // App · 我的互动（点赞/收藏/评论 · 悦文化等内容 mock）
  const mineInteractFeed = [
    { id: 'mf1', kind: 'likes', category: 'activity', title: '新春团建活动回顾：凝心聚力再出发', commentCount: 6, date: '2026年01月08日', coverSeed: 'reg-team' },
    { id: 'mf2', kind: 'likes', category: 'article', title: '2026 年度企业文化建设白皮书', commentCount: 2, date: '2026年01月05日', coverSeed: 'reg-award' },
    { id: 'mf3', kind: 'favorites', category: 'course', title: '管理者高效沟通与反馈技巧（线上课）', commentCount: 0, date: '2025年12月20日', coverSeed: 'reg-training' },
    { id: 'mf4', kind: 'comments', category: 'activity', title: '年终颁奖典礼暨年会晚宴', commentCount: 12, date: '2025年12月31日', coverSeed: 'reg-award' },
    { id: 'mf5', kind: 'comments', category: 'article', title: '员工健康关怀计划升级说明', commentCount: 1, date: '2025年12月18日', coverSeed: 'reg-outdoor' },
    { id: 'mf6', kind: 'comments', category: 'activity', title: '2026年度团队户外拓展训练营', commentCount: 8, date: '2025年12月22日', coverSeed: 'reg-outdoor' },
    { id: 'mf7', kind: 'comments', category: 'activity', title: '新春团建活动回顾：凝心聚力再出发', commentCount: 6, date: '2026年01月08日', coverSeed: 'reg-team' },
    { id: 'mf8', kind: 'comments', category: 'course', title: '职场技能提升培训营（第三期）', commentCount: 4, date: '2025年12月16日', coverSeed: 'reg-training' },
    { id: 'mf9', kind: 'comments', category: 'course', title: '新员工入职文化融入微课', commentCount: 0, date: '2025年11月28日', coverSeed: 'reg-training' },
    { id: 'mf10', kind: 'comments', category: 'article', title: '工会福利政策 2026 版解读', commentCount: 15, date: '2025年12月08日', coverSeed: 'reg-award' },
    { id: 'mf11', kind: 'comments', category: 'article', title: '冬季办公区节能与用电安全提示', commentCount: 3, date: '2025年11月15日', coverSeed: 'reg-outdoor' },
  ];

  // App · 我的报名（悦生活员工端 mock）
  const myRegistrations = [
    { id: 'mr1', status: 'pending', title: '2026年度团队户外拓展训练营', dateTime: '2026-12-28 09:00',
      location: '北京·怀柔水长城景区', appliedAt: '2026-12-20 10:32', coverSeed: 'reg-outdoor' },
    { id: 'mr2', status: 'success', title: '2026年终颁奖典礼暨年会晚宴', dateTime: '2026-12-31 18:00',
      location: '北京·国际会议中心大宴会厅', appliedAt: '2026-12-19 14:15', coverSeed: 'reg-award', role: '参与者' },
    { id: 'mr3', status: 'rejected', title: '职场技能提升培训营（第三期）', dateTime: '2025-01-10 14:00',
      location: '总部大楼·3楼多功能厅', appliedAt: '2026-12-18 09:00', coverSeed: 'reg-training',
      rejectReason: '报名人数已超出本期培训名额，请关注下期活动。' },
  ];

  const PROTO_TODAY_KEY = 6 * 100 + 3; // 原型基准日 06月03日，与活动列表筛选一致
  const parseActDateKey = (dateStr) => {
    const m = dateStr && dateStr.match(/(\d{1,2})月(\d{1,2})日/);
    return m ? parseInt(m[1], 10) * 100 + parseInt(m[2], 10) : null;
  };
  const isSessionOpen = (session, actStatus) => {
    if (!session) return false;
    if (session.status === 'ended' || session.status === 'cancelled') return false;
    if (actStatus === 'ended' || actStatus === 'cancelled') return false;
    const k = parseActDateKey(session.date);
    return k == null || k >= PROTO_TODAY_KEY;
  };
  const seriesListStatus = (eps) => {
    if (!eps || !eps.length) return 'ended';
    if (eps.some(e => e.status === 'upcoming')) return 'upcoming';
    if (eps.every(e => e.status === 'cancelled')) return 'cancelled';
    return 'ended';
  };
  /** 最近一个未结束场次（周期=sessions[]；系列=最近一期 upcoming） */
  const nextOpenSession = (act, allActs) => {
    if (!act) return null;
    if (act.type === 'recurring' && act.sessions && act.sessions.length) {
      const s = act.sessions.find(x => isSessionOpen(x, act.status)) || act.sessions[act.sessions.length - 1];
      return { date: s.date, endDate: s.endDate, time: s.time, signed: s.signed, cap: s.cap, _aid: act.id };
    }
    if (act.type === 'series' && act.series) {
      const eps = seriesEps(allActs || [], act);
      const open = eps.filter(e => e.status === 'upcoming');
      const ep = open[0] || eps[eps.length - 1];
      if (!ep) return null;
      return { date: ep.date, endDate: ep.endDate, time: ep.time, signed: ep.signed, cap: ep.cap, _aid: ep.id };
    }
    return { date: act.date, endDate: act.endDate, time: act.time, signed: act.signed, cap: act.cap, _aid: act.id };
  };
  const listUnitKey = (act, allActs) => {
    if (act.type === 'series' && act.series) return `series:${act.gid}:${act.series}`;
    if (act.type === 'recurring') return `recurring:${act.id}`;
    return `once:${act.id}`;
  };
  /** 列表卡片展示：合并最近场次时间，系列只显示一条 */
  const forListCard = (act, allActs) => {
    const all = allActs || acts;
    const base = (act.type === 'series' && act.series) ? seriesAnchor(all, act) : act;
    const sess = nextOpenSession(base, all);
    const card = { ...base, _listKey: listUnitKey(act, all), _detailAid: (sess && sess._aid) || base.id };
    if (sess) {
      card.date = sess.date;
      card.endDate = sess.endDate;
      card.time = sess.time;
      if (sess.signed != null) card.signed = sess.signed;
      if (sess.cap != null) card.cap = sess.cap;
    }
    if (base.type === 'series' && base.series) {
      card.title = base.series;
      card.status = seriesListStatus(seriesEps(all, base));
    }
    return card;
  };
  const collapseActsForList = (list, allActs) => {
    const seen = new Set();
    const out = [];
    for (const a of list) {
      const key = listUnitKey(a, allActs);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(forListCard(a, allActs));
    }
    return out;
  };

  // ── 活动时间展示工具（跨天/多天）：PC 与移动端共用 ──
  // 约定：a.date 为开始日期(中文串或「每周X」)，a.endDate 为结束日期；
  //       a.time 为「开始时间 - 结束时间」，开始时间属开始日、结束时间属结束日。
  const awTimes = (time) => { const p = (time || '').split(/\s*-\s*/); return { s: (p[0] || '').trim(), e: (p[1] || p[0] || '').trim() }; };
  const awCnMd = (cn) => { const m = cn && cn.match(/(\d{1,2})月(\d{1,2})日/); return m ? { mo: +m[1], d: +m[2] } : null; };
  const awShort = (cn) => { if (!cn) return ''; const md = awCnMd(cn); return md ? `${md.mo}/${md.d}` : cn; };
  const awIsCross = (a) => !!(a && a.endDate && a.endDate !== a.date);
  const awDays = (a) => {
    if (!awIsCross(a)) return 0;
    const s = awCnMd(a.date), e = awCnMd(a.endDate);
    if (!s || !e) return 0;
    const y = new Date().getFullYear();
    const ds = new Date(y, s.mo - 1, s.d), de = new Date(y, e.mo - 1, e.d);
    const n = Math.round((de - ds) / 86400000) + 1;
    return n > 1 ? n : 0;
  };
  const awDaysBadge = (a) => { const n = awDays(a); return n > 1 ? `共 ${n} 天` : null; };
  // 详情页：起止全量（日期统一 x/y）
  const awFull = (a) => {
    if (!a) return '';
    const { s, e } = awTimes(a.time);
    return awIsCross(a) ? `${awShort(a.date)} ${s} —— ${awShort(a.endDate)} ${e}` : `${awShort(a.date)} · ${a.time}`;
  };
  // 列表/卡片：紧凑（日期统一 x/y，周期规则如「每周四」原样保留）
  const awCompact = (a) => {
    const { s, e } = awTimes(a.time);
    return awIsCross(a) ? `${awShort(a.date)} ${s} → ${awShort(a.endDate)} ${e}` : `${awShort(a.date)} · ${a.time}`;
  };
  // 系列：5/25 - 7/6 · 共4期
  const awSeriesRange = (eps) => {
    if (!eps || !eps.length) return '';
    if (eps.length === 1) return awShort(eps[0].date);
    return `${awShort(eps[0].date)} - ${awShort(eps[eps.length - 1].date)}`;
  };
  const awSeriesWhen = (eps) => `${awSeriesRange(eps)} · 共${eps.length}期`;
  window.ActWhen = { isCross: awIsCross, days: awDays, daysBadge: awDaysBadge, full: awFull, compact: awCompact, short: awShort, seriesRange: awSeriesRange, seriesWhen: awSeriesWhen };

  window.DB = { groups, acts, moments, comments, joinRequests, notifications, convos, NAMES, ME, employees, myRegistrations, mineInteractFeed };
  window.CATS = CATS;
  window.DBH = { byId, seriesEps, seriesAnchor, seriesListStatus, recentSessions, RECENT_SESSIONS_MAX, actsOf, canPostMoment, isSlotPast, momentEligibleActs, momentsOf, momentsOfGroup, commentsOf, groupOf, patchGroup, pushSelfJoinRequest, removeJoinRequest, parseActDateKey, nextOpenSession, listUnitKey, forListCard, collapseActsForList };
})();

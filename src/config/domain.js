/** 鞍钢智慧物流 · 业务域知识（调研梳理原型用） */

export const logisticsChain = [
  {
    stage: '原料进厂',
    items: [
      '进口铁矿：辽港集团营口港三公司 → 鞍钢基地',
      '煤炭：辽港集团营口港二公司 → 鞍钢基地',
      '国内矿：鞍钢国内矿点 → 鞍山基地',
    ],
  },
  {
    stage: '厂内制造',
    items: ['炼钢 → 连铸 → 热轧/冷轧等工艺', '厂内倒运至成品库'],
  },
  {
    stage: '成品库',
    items: ['库位管理 / 堆存积压影响可发量', '账面库存 ≠ 可发运量（积压压住货）'],
  },
  {
    stage: '外发',
    items: [
      '汽运：直送 / 物流园外发 / 自提 / 集港',
      '铁运：铁路发运（最远覆盖长江以北）',
      '水运：自有港/辽港装船（多覆盖长江以南）',
    ],
  },
]

export const outboundModes = {
  truck: {
    name: '汽运',
    ways: ['直送客户', '物流园外发', '客户自提', '集港'],
  },
  rail: {
    name: '铁运',
    ways: ['铁路发运'],
    note: '铁运覆盖最远至长江以北；长江以南多走港口船运',
  },
  water: {
    name: '水运/港口',
    ports: ['鞍钢营口港务公司（自有港）', '辽港集团营口港'],
    note: '船运成品多覆盖长江以南地区',
  },
}

export const mixForbidRules = [
  { a: '热轧卷', b: '冷轧卷', reason: '表面质量等级不同，易交叉擦伤' },
  { a: '中厚板', b: '钢卷', reason: '外形与固定方式不同，现场一般不混装' },
  { a: '线材', b: '冷轧卷', reason: '捆扎与防潮要求冲突' },
  { a: '管材', b: '板材', reason: '堆码与绑扎规范不一致' },
]

export const vehicleLoadHabits = [
  { type: '半挂 35t', habit: '优先装热轧/冷轧卷，常见 8～10 卷，可叠 2 层', gray: '偶有超限高靠现场目测，系统需留「超限评审」口' },
  { type: '栏板 20t', habit: '中板短倒、不可叠放品类，按单层摆放', gray: '超宽板需特批路线' },
  { type: '厢式 15t', habit: '线材/小管拼载，关注厢内高度', gray: '客户指定不可拼时强制独车' },
]

export const loadingPoints = [
  {
    name: '热轧装车坪',
    machines: '行车 2 台',
    bays: 3,
    minutes: { 热轧卷: 45, 中板: 60 },
    queue: '到场排队 + 人工叫号',
    decision: '先到先装，交期紧可插队',
  },
  {
    name: '冷轧装车坪',
    machines: '行车 1 + 装载机 1',
    bays: 2,
    minutes: { 冷轧卷: 50 },
    queue: '预约时段 + 现场叫号',
    decision: '表面件优先，避免长时间露天',
  },
  {
    name: '线材装车点',
    machines: '行车 1 台',
    bays: 2,
    minutes: { 线材: 35 },
    queue: '厂区门口分流后排队',
    decision: '同方向可拼，独客独车',
  },
]

export const plantGates = [
  { name: '和平桥门', queueLen: 14, waitMin: 38, issue: '早高峰进厂拥堵' },
  { name: '成品库东门', queueLen: 9, waitMin: 52, issue: '装车坪回车占道' },
  { name: '铁运交接门', queueLen: 3, waitMin: 18, issue: '车皮到发时段集中' },
]

export const scheduleHorizons = [
  { key: 'day1', label: '当天滚动', desc: '聚焦已准发、已到场车辆与即时插单' },
  { key: 'day3', label: '三天窗口', desc: '衔接交期与运力预留，支撑出厂计划' },
  { key: 'order', label: '按订单维度', desc: '单订单拆车/拼车与最晚装车时间倒推' },
]

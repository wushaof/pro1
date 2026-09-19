export const linkBoards = {
  'track-api': {
    title: '来源系统',
    desc: '全程可视要先接通各业务系统。失败数据按主键重推，未接通的不显示成已同步。',
    kpis: [
      { label: '已登记', value: '7', unit: '个系统' },
      { label: '可读取', value: '4', unit: '个' },
      { label: '今日重推', value: '18', unit: '笔' },
    ],
    systems: [
      { name: '销售物流系统', status: '可读取', note: '计划量、提单、客户' },
      { name: '物流运输系统', status: '可读取', note: '作业单号以其为准' },
      { name: 'PES', status: '可读取', note: '排产与库内作业' },
      { name: '计量系统', status: '可读取', note: '净重以过磅为准' },
      { name: '3PL / 德邻', status: '联调中', note: '实运回传' },
      { name: '智慧码头', status: '联调中', note: '清单已有，船期待数据湖' },
      { name: '列车调度', status: '待接', note: '车皮号以铁路为准' },
      { name: '烽火台', status: '待确认', note: '只登记，不展示数据' },
    ],
  },
  'track-settle': {
    title: '来源系统',
    desc: '合同和订单来自销售管理，运单来自物流运输，港杂来自智慧码头。',
    systems: [
      { name: '销售管理系统', status: '可读取', note: '合同、订单' },
      { name: '物流运输系统', status: '可读取', note: '运单号' },
      { name: '3PL / 德邻', status: '联调中', note: '实运与签收' },
      { name: '列车调度', status: '待接', note: '铁运费' },
      { name: '智慧码头', status: '联调中', note: '装卸、理货、停泊' },
    ],
  },
  'track-cost': {
    title: '成本分析',
    desc: '只统计成本线上管理里已线上结算的费用。待计价、未签收和无运单的费用不计入。',
    kpis: [
      { label: '汽运单吨', value: '86', unit: '元' },
      { label: '集港船运单吨', value: '64', unit: '元' },
      { label: '铁运单吨', value: '71', unit: '元' },
    ],
    bars: [
      { label: '汽运运费', value: 62, text: '62%' },
      { label: '铁运运费', value: 18, text: '18%' },
      { label: '港杂', value: 12, text: '12%' },
      { label: '等候 / 空驶', value: 8, text: '8%' },
    ],
    systems: [
      { name: '东北某制造', status: '已结算', note: '汽运集港 86 吨' },
      { name: '沈阳某贸易', status: '部分期间', note: '车皮未兑现' },
      { name: '华东某船厂', status: '未发生', note: '货未准发' },
    ],
  },
  'cock-api': {
    title: '数据来源',
    desc: '以运单号把库存、装车、在途、到港、签收串成一单到底。',
    kpis: [
      { label: '在链运单', value: '86', unit: '单' },
      { label: '链路完整', value: '71', unit: '单' },
      { label: '有断点', value: '15', unit: '单' },
    ],
    systems: [
      { name: '销售物流', status: '库存', note: '待发成品与库位' },
      { name: '汽车公司调度', status: '在途', note: '车牌与排队' },
      { name: '3PL', status: '签收', note: '实运回传' },
      { name: '列车调度', status: '车皮', note: '请车与兑现' },
      { name: '智慧码头', status: '到港', note: '船号与预计到港' },
    ],
  },
  'fc-data': {
    title: '预测依据',
    desc: '订单交期、可发库存、生产周期和准发规则到齐后才出预测。',
    kpis: [
      { label: '待预测', value: '54', unit: '单' },
      { label: '数据齐套', value: '41', unit: '单' },
      { label: '缺质量或合同', value: '9', unit: '单' },
    ],
    systems: [
      { name: 'PES 排产', status: '已到达', note: '试点冷轧、热轧各一条' },
      { name: '销售订单', status: '已到达', note: '计划量与交期' },
      { name: '可发库存', status: '已到达', note: '账面减去积压' },
      { name: '质量判定', status: '部分缺失', note: '未判定不出承诺时点' },
    ],
  },
  'fc-int': {
    title: '回写销售物流',
    desc: '预计准发时点和运力建议写回销售物流系统，不覆盖计划量。',
    target: '销售物流系统',
    checks: ['预计准发时点', '可发量', '运力建议', '不回写计划量'],
    kpis: [
      { label: '今日回写', value: '41', unit: '单' },
      { label: '失败', value: '2', unit: '单' },
      { label: '计划量被改', value: '0', unit: '笔' },
    ],
  },
  'dp-data': {
    title: '调度依据',
    desc: '准发、运力池和库存压力来自销售物流、PES 和德邻。',
    kpis: [
      { label: '运力池', value: '186', unit: '辆' },
      { label: '空闲', value: '42', unit: '辆' },
      { label: '已准发待派', value: '17', unit: '单' },
    ],
    systems: [
      { name: '销售物流', status: '待发订单', note: '计划量与交期' },
      { name: 'PES', status: '库内作业', note: '可发与装卸点' },
      { name: '德邻运力池', status: '车辆', note: '自有、长期、临时' },
      { name: '门禁', status: '排队', note: '中断时改手工队列' },
    ],
  },
  'dp-int': {
    title: '回写 PES',
    desc: '库压力和推荐车辆写入 PES。未确认的建议不会自动派车。',
    target: 'PES 系统',
    checks: ['库压力等级', '推荐车牌', '运力缺口', '调度确认后才执行'],
    kpis: [
      { label: '已写入', value: '11', unit: '条' },
      { label: '待确认', value: '6', unit: '条' },
      { label: '自动派车', value: '关', unit: '' },
    ],
  },
  'ob-data': {
    title: '计划依据',
    desc: '交期、可发、运力和运输规则齐套后才生成可下发计划。',
    kpis: [
      { label: '今日计划行', value: '28', unit: '行' },
      { label: '数据齐套', value: '24', unit: '行' },
      { label: '缺船期或车皮', value: '4', unit: '行' },
    ],
    systems: [
      { name: '订单交期', status: '已到达', note: '销售物流' },
      { name: '可发资源', status: '已到达', note: '不含积压不可吊' },
      { name: '汽运运力', status: '已到达', note: '德邻运力池' },
      { name: '铁运兑现', status: '部分缺失', note: '沈阳方向兑现一半' },
    ],
  },
  'ob-int': {
    title: '回写 PES',
    desc: '确认后的吨位、方式和顺序写入 PES。写失败不能当成库房已按新计划发货。',
    target: 'PES 系统',
    checks: ['计划吨位', '运输方式', '发车顺序', '仅已确认才写入'],
    kpis: [
      { label: '已写入', value: '16', unit: '行' },
      { label: '回执失败', value: '1', unit: '行' },
      { label: '未确认', value: '8', unit: '行' },
    ],
  },
  'tm-data': {
    title: '港口动态',
    desc: '船舶、泊位、堆场和集港运单来自销售物流与智慧码头。12 月前船期可人工录入，并标明来源。',
    kpis: [
      { label: '在港 / 预到', value: '3', unit: '艘' },
      { label: '装船清单', value: '5', unit: '航次' },
      { label: '人工船期', value: '2', unit: '艘' },
    ],
    systems: [
      { name: '智慧码头', status: '清单可查', note: '航次、分批、已出库' },
      { name: '数据湖 ETA', status: '12 月', note: '未通前人工台账' },
      { name: '销售提单', status: '已关联', note: '计划量来源' },
      { name: '辽港', status: '另案', note: '不并入自有码头' },
    ],
  },
  'tm-int': {
    title: '算法集成',
    desc: '直装标识两边都能看见。配载和作业流水仍在码头系统操作。',
    target: '智慧码头系统',
    checks: ['装船清单', '船期来源', '直装标识', '不覆盖港方出库数'],
    kpis: [
      { label: '清单已读', value: '5', unit: '航次' },
      { label: '直装已回写', value: '1', unit: '批' },
      { label: '二级配载', value: '只读', unit: '' },
    ],
  },
  'ld-data': {
    title: '配载依据',
    desc: '发运计划、车皮、装载规则和历史装车到齐后才出配载建议。',
    kpis: [
      { label: '待配载', value: '14', unit: '行' },
      { label: '兑现车皮', value: '3', unit: '节' },
      { label: '规则未维护', value: '2', unit: '组' },
    ],
    systems: [
      { name: '发运计划', status: '已到达', note: '流向、交期、吨位' },
      { name: '铁运车皮', status: '部分到达', note: '车皮兑现以列车调度为准' },
      { name: '装载规则', status: '已配置', note: '混装、限高限宽、标重' },
      { name: '历史装车', status: '已到达', note: '满载与等待时长' },
    ],
  },
  'ld-int': {
    title: '算法集成',
    desc: '铁运配载需求提交列车调度。对不上车皮号就不能当成已配载，这里不操作连锁信号。',
    target: '列车调度系统',
    checks: ['配载需求', '车皮号', '预指货场', '不改连锁信号'],
    kpis: [
      { label: '已提交', value: '2', unit: '节' },
      { label: '车皮对上', value: '1', unit: '节' },
      { label: '预指失败', value: '1', unit: '节' },
    ],
  },
}

export function linkTag(text) {
  const s = String(text || '')
  if (/可读取|已到达|已配置|已关联|已结算|库存/.test(s)) return 'success'
  if (/联调|待|部分|人工|参考|12 月|另案|只读/.test(s)) return 'warning'
  if (/未发生|失败|待确认/.test(s)) return 'info'
  return 'info'
}

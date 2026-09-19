/** 演示菜单。七项需求的子菜单对齐 V1.5，主功能仍打开原有页面。 */

export const navGroups = [
  {
    id: 'overview',
    title: '业务全景',
    desc: '原料进厂、厂内制造、成品库、汽运/铁运/水运外发。',
    children: [{ title: '业务全景', path: '/overview' }],
  },
  {
    id: 'tracking',
    title: '全程可视化追踪',
    desc: '全程串接、成本结算与分析。',
    children: [
      { title: '全程数据串接', path: '/tracking' },
      { title: '成本线上管理', path: '/cost-settle' },
      { title: '成本分析', path: '/cost-analysis' },
    ],
  },
  {
    id: 'cockpit',
    title: '物流驾驶舱',
    desc: '一单到底、基地库区、发运跟踪。',
    children: [
      { title: '基地库区', path: '/digital-twin' },
      { title: '发运跟踪', path: '/logistics-cockpit' },
    ],
  },
  {
    id: 'forecast',
    title: '产品准发预测',
    desc: '按排产预判运力，并给出批次准发时点，结果回写销售物流。',
    children: [
      { title: '按排产预测运力', path: '/delivery-forecast/capacity' },
      { title: '批次准发时点', path: '/delivery-forecast/time' },
      { title: '回写销售物流', path: '/link/fc-int' },
    ],
  },
  {
    id: 'dispatch',
    title: '车辆智能调度',
    desc: '按库存压力分级，再用运力池匹配车辆，确认后回写 PES。',
    children: [
      { title: '库存压力分级', path: '/vehicle-dispatch/pressure' },
      { title: '运力池匹配', path: '/vehicle-dispatch/pool' },
      { title: '回写 PES', path: '/link/dp-int' },
    ],
  },
  {
    id: 'outbound',
    title: '出厂计划智能编制',
    desc: '编制出厂计划，并按冷轧、热轧约束匹配汽运和铁运，确认后回写 PES。',
    children: [
      { title: '出厂计划', path: '/outbound-plan/plan' },
      { title: '汽铁匹配', path: '/outbound-plan/match' },
      { title: '回写 PES', path: '/link/ob-int' },
    ],
  },
  {
    id: 'terminal',
    title: '码头智能调度',
    desc: '船期、到港和车船直装，结果回到智慧码头。',
    children: [
      { title: '船期与车船直装', path: '/terminal-dispatch' },
    ],
  },
  {
    id: 'loading',
    title: '车辆智能配载',
    desc: '同流向、同交期订单合并配载，铁运拼单提高车皮利用率。',
    children: [
      { title: '多订单合并配载', path: '/vehicle-loading/merge' },
      { title: '铁运拼单配载', path: '/vehicle-loading/rail' },
    ],
  },
]

export function findNavItem(path) {
  for (const group of navGroups) {
    const hit = group.children.find((c) => c.path === path)
    if (hit) return { group, item: hit }
  }
  return null
}

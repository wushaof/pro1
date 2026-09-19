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
    desc: '按排产预判运力和准发时点，结果回到销售物流。',
    children: [
      { title: '准发与运力预测', path: '/delivery-forecast' },
      { title: '算法集成', path: '/link/fc-int' },
    ],
  },
  {
    id: 'dispatch',
    title: '车辆智能调度',
    desc: '库存压力分级和运力池匹配，结果回到 PES。',
    children: [
      { title: '库存压力与运力匹配', path: '/vehicle-dispatch/workbench' },
      { title: '算法集成', path: '/link/dp-int' },
    ],
  },
  {
    id: 'outbound',
    title: '出厂计划智能编制',
    desc: '编制出厂计划，并按冷轧、热轧约束匹配汽运和铁运。',
    children: [
      { title: '出厂计划与汽铁匹配', path: '/outbound-plan/plan' },
      { title: '算法集成', path: '/link/ob-int' },
    ],
  },
  {
    id: 'terminal',
    title: '码头智能调度',
    desc: '船期、到港和车船直装，结果回到智慧码头。',
    children: [
      { title: '船期与车船直装', path: '/terminal-dispatch' },
      { title: '算法集成', path: '/link/tm-int' },
    ],
  },
  {
    id: 'loading',
    title: '车辆智能配载',
    desc: '同流向拼单和铁运配载，结果回到列车调度。',
    children: [
      { title: '拼单与配载优化', path: '/vehicle-loading/plan' },
      { title: '算法集成', path: '/link/ld-int' },
    ],
  },
  {
    id: 'support',
    title: '基础支撑',
    desc: '接口、口径、采集、孪生版本、算法是否允许自动下发、大屏。',
    children: [
      { title: '接口集成', path: '/sheet/support-api' },
      { title: '数据中台', path: '/sheet/support-lake' },
      { title: '物联感知', path: '/sheet/support-iot' },
      { title: '数字孪生', path: '/sheet/support-twin' },
      { title: '算法与模型', path: '/sheet/support-algo' },
      { title: '大屏可视化', path: '/sheet/support-screen' },
    ],
  },
  {
    id: 'infra',
    title: '基础设施',
    desc: '148 个库、产线试点、过磅、铁路分区、纸单和网络条件。',
    children: [
      { title: '制造库规模', path: '/sheet/infra-wh' },
      { title: '钢材产线', path: '/sheet/infra-line' },
      { title: '过磅能力', path: '/sheet/infra-weigh' },
      { title: '铁路调度分区', path: '/sheet/infra-rail' },
      { title: '人工纸质作业', path: '/sheet/infra-paper' },
      { title: '网络与传感器', path: '/sheet/infra-net' },
    ],
  },
  {
    id: 'systems',
    title: '关联系统',
    desc: '读写边界。烽火台未调研，不展示其业务数据。',
    children: [
      { title: '物流运输系统', path: '/sheet/sys-lts' },
      { title: '销售物流系统', path: '/sheet/sys-sales' },
      { title: '3PL系统', path: '/sheet/sys-3pl' },
      { title: '烽火台系统', path: '/sheet/sys-beacon' },
      { title: '列车调度系统', path: '/sheet/sys-train' },
      { title: '智慧码头系统', path: '/sheet/sys-port' },
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

import { writeFileSync } from 'node:fs'
import XLSX from 'xlsx'
import { partA } from './req-part-a.mjs'
import { partB } from './req-part-b.mjs'

const rows = [...partA, ...partB]
rows.forEach((r, i) => {
  r.seq = String(i + 1)
})

const funcHeaders = [
  '序号',
  '架构层级',
  '功能块',
  '本块菜单数',
  '菜单序号',
  '菜单名称',
  '菜单要解决的问题',
  '功能编号',
  '功能名称',
  '使用角色',
  '功能说明',
  '操作流程',
  '业务规则',
  '界面要点',
  '数据来源',
  '异常与边界',
  '依据',
]

const funcAoA = [
  funcHeaders,
  ...rows.map((r) => [
    r.seq,
    r.layer,
    r.block,
    r.menuCount,
    r.menuIndex,
    r.menu,
    r.purpose,
    r.funcNo,
    r.name,
    r.role,
    r.desc,
    r.flow,
    r.rule,
    r.ui,
    r.src,
    r.edge,
    r.ref,
  ]),
]

const menuMap = new Map()
for (const r of rows) {
  const key = `${r.layer}|${r.block}|${r.menu}`
  if (!menuMap.has(key)) {
    menuMap.set(key, {
      layer: r.layer,
      block: r.block,
      menuCount: r.menuCount,
      menuIndex: r.menuIndex,
      menu: r.menu,
      purpose: r.purpose,
      funcs: [],
    })
  }
  menuMap.get(key).funcs.push(`${r.funcNo} ${r.name}`)
}

const menuHeaders = ['架构层级', '功能块', '本块菜单数', '菜单序号', '菜单名称', '菜单要解决的问题', '功能数', '功能清单']
const menuAoA = [
  menuHeaders,
  ...[...menuMap.values()].map((m) => [
    m.layer,
    m.block,
    m.menuCount,
    m.menuIndex,
    m.menu,
    m.purpose,
    String(m.funcs.length),
    m.funcs.join('\n'),
  ]),
]

const blockCount = new Set(rows.map((r) => r.block)).size
const menuCount = menuMap.size

const intro = [
  ['鞍钢智慧物流 · 系统功能规划（PPT v1.3 第3页）需求说明'],
  ['用途', '按第3页每一块拆成建议菜单，再写每个菜单下的实际功能，供需求评审和后续原型对照。图上标注为草稿待定，本文档同样可改。'],
  ['怎么读', '先看“菜单规划”：一块有几个菜单、每个菜单解决什么问题。再看“功能需求”：每个功能的角色、说明、操作、规则、界面、来源和例外。同一菜单的功能编号形如 1.1、1.2。'],
  ['统计', `功能块 ${blockCount} 个，菜单 ${menuCount} 个，功能 ${rows.length} 条。`],
  ['口径', '销售物流系统即销售管理系统，负责计划量；物流运输系统负责作业执行和派车相关单据；德邻负责汽运运力执行。账面库存不等于可发量。汽运含直送、物流园外发、自提、集港；铁运覆盖长江以北；船运成品多走长江以南，港口分鞍钢营口港务和辽港。'],
  ['未编造', '烽火台系统材料未展开，只列待调研。模型清单中的库位推荐、满载率、车型匹配均为待确认，文档中写成规则建议，不写成已上线的优化算法。热卷芯片耐温未验证，不写成已具备。'],
  ['和上一版的差别', '上一版《功能描述》是一块一行的摘要。本文件是需求说明，一块对应多个菜单，一个菜单对应多条可评审的功能。'],
  ['生成日期', '2026-09-19'],
]

const wb = XLSX.utils.book_new()
const ws0 = XLSX.utils.aoa_to_sheet(intro)
ws0['!cols'] = [{ wch: 16 }, { wch: 140 }]
XLSX.utils.book_append_sheet(wb, ws0, '说明')

const ws1 = XLSX.utils.aoa_to_sheet(menuAoA)
ws1['!cols'] = [
  { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 10 }, { wch: 24 },
  { wch: 56 }, { wch: 8 }, { wch: 42 },
]
ws1['!autofilter'] = { ref: `A1:H${menuAoA.length}` }
ws1['!freeze'] = { xSplit: 0, ySplit: 1 }
ws1['!rows'] = menuAoA.map(() => ({ hpt: 48 }))
XLSX.utils.book_append_sheet(wb, ws1, '菜单规划')

const ws2 = XLSX.utils.aoa_to_sheet(funcAoA)
ws2['!cols'] = [
  { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 10 },
  { wch: 22 }, { wch: 40 }, { wch: 10 }, { wch: 28 }, { wch: 28 },
  { wch: 72 }, { wch: 48 }, { wch: 48 }, { wch: 40 }, { wch: 32 },
  { wch: 40 }, { wch: 32 },
]
ws2['!autofilter'] = { ref: `A1:Q${funcAoA.length}` }
ws2['!freeze'] = { xSplit: 6, ySplit: 1 }
ws2['!rows'] = funcAoA.map((_, i) => ({ hpt: i === 0 ? 22 : 72 }))
XLSX.utils.book_append_sheet(wb, ws2, '功能需求')

const paths = [
  'd:/pro/angang/系统功能规划-第3页需求说明.xlsx',
  'd:/新建文件夹/系统功能规划-第3页需求说明.xlsx',
]
for (const p of paths) {
  writeFileSync(p, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
  console.log('wrote', p, 'funcs', rows.length, 'menus', menuCount, 'blocks', blockCount)
}

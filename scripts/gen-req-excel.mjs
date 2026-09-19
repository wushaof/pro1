import ExcelJS from 'exceljs'
import { partB } from './req-part-b.mjs'
import { partV15 } from './req-v15.mjs'

const support = partB.filter((r) => r.layer !== '核心业务')
const all = [...partV15, ...support]

function buildMenus(rows) {
  const map = new Map()
  for (const r of rows) {
    const key = `${r.layer}||${r.block}||${r.menu}`
    if (!map.has(key)) {
      map.set(key, {
        layer: r.layer,
        block: r.block,
        menu: r.menu,
        purpose: r.purpose,
        funcs: [],
      })
    }
    map.get(key).funcs.push(r)
  }
  return [...map.values()]
}

function uniqJoin(items, sep = '；') {
  return [...new Set(items.filter(Boolean))].join(sep)
}

function buildDesc(m) {
  const parts = [m.purpose, '']
  m.funcs.forEach((f, i) => {
    parts.push(`${i + 1}. ${f.name}：${f.desc}`)
  })
  parts.push('')
  parts.push(`主要使用人：${uniqJoin(m.funcs.map((f) => f.role), '、')}。`)
  parts.push(`数据主要来自：${uniqJoin(m.funcs.map((f) => f.src), '、')}。`)
  return parts.join('\n')
}

function buildFlow(m) {
  return m.funcs.map((f) => `【${f.name}】\n${f.flow}`).join('\n\n')
}

function buildRule(m) {
  return uniqJoin(
    m.funcs.map((f) => `【${f.name}】${f.rule}`),
    '\n',
  )
}

function buildUi(m) {
  return uniqJoin(
    m.funcs.map((f) => `【${f.name}】${f.ui}`),
    '\n',
  )
}

function buildEdge(m) {
  return uniqJoin(
    m.funcs.map((f) => `【${f.name}】${f.edge}`),
    '\n',
  )
}

function buildRef(m) {
  return uniqJoin(
    m.funcs.map((f) => f.ref),
    '；',
  )
}

function buildSrc(m) {
  return uniqJoin(
    m.funcs.map((f) => f.src),
    '；',
  )
}

function buildRole(m) {
  return uniqJoin(
    m.funcs.map((f) => f.role),
    '、',
  )
}

const headers = [
  '序号',
  '菜单名称',
  '功能描述',
  '业务规则',
  '操作流程',
  '界面要点',
  '数据来源',
  '异常与边界',
  '依据',
  '使用角色',
]

const colWidths = [6, 18, 176, 64, 64, 52, 52, 52, 44, 40]

const menus = buildMenus(all)

function sheetName(block, used) {
  let name = String(block).replace(/[\\/?*[\]:]/g, '').slice(0, 31)
  if (!name) name = '未命名'
  let out = name
  let n = 2
  while (used.has(out)) {
    const suffix = `_${n}`
    out = `${name.slice(0, 31 - suffix.length)}${suffix}`
    n += 1
  }
  used.add(out)
  return out
}

const blockOrder = []
const byBlock = new Map()
for (const m of menus) {
  if (!byBlock.has(m.block)) {
    byBlock.set(m.block, [])
    blockOrder.push({ layer: m.layer, block: m.block })
  }
  byBlock.get(m.block).push(m)
}

const headerFill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1F2A37' },
}
const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11, name: '微软雅黑' }
const zebraOdd = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFFFFF' },
}
const zebraEven = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF3F6FA' },
}
const thinBorder = {
  top: { style: 'thin', color: { argb: 'FFD0D7DE' } },
  left: { style: 'thin', color: { argb: 'FFD0D7DE' } },
  bottom: { style: 'thin', color: { argb: 'FFD0D7DE' } },
  right: { style: 'thin', color: { argb: 'FFD0D7DE' } },
}
const bodyFont = { name: '微软雅黑', size: 10, color: { argb: 'FF303133' } }

function styleHeaderRow(row) {
  row.height = 22
  row.eachCell((cell) => {
    cell.fill = headerFill
    cell.font = headerFont
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = thinBorder
  })
}

function styleDataRow(row, zebraIndex) {
  const fill = zebraIndex % 2 === 0 ? zebraOdd : zebraEven
  row.height = 176
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = fill
    cell.font = bodyFont
    cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
    cell.border = thinBorder
  })
}

function applyColWidths(ws) {
  colWidths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w
  })
}

const wb = new ExcelJS.Workbook()
wb.creator = 'angang'
wb.created = new Date()

const index = wb.addWorksheet('目录')
index.columns = [
  { header: '序号', width: 6 },
  { header: '架构层级', width: 12 },
  { header: '功能块', width: 22 },
  { header: '菜单数', width: 8 },
  { header: '对应工作表', width: 22 },
]
styleHeaderRow(index.getRow(1))

const usedNames = new Set(['目录'])

blockOrder.forEach((b, i) => {
  const name = sheetName(b.block, usedNames)
  const list = byBlock.get(b.block)

  const idxRow = index.addRow([i + 1, b.layer, b.block, list.length, name])
  idxRow.height = 20
  idxRow.eachCell((cell) => {
    cell.font = bodyFont
    cell.fill = i % 2 === 0 ? zebraOdd : zebraEven
    cell.border = thinBorder
    cell.alignment = { vertical: 'middle' }
  })

  const ws = wb.addWorksheet(name, {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }],
  })
  applyColWidths(ws)
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  }

  const headerRow = ws.addRow(headers)
  styleHeaderRow(headerRow)

  list.forEach((m, j) => {
    const data = [
      j + 1,
      m.menu,
      buildDesc(m),
      buildRule(m),
      buildFlow(m),
      buildUi(m),
      buildSrc(m),
      buildEdge(m),
      buildRef(m),
      buildRole(m),
    ]
    const row = ws.addRow(data)
    styleDataRow(row, j)
  })
})

const paths = [
  'd:/pro/angang/系统功能规划-第3页需求说明.xlsx',
  'd:/新建文件夹/系统功能规划-第3页需求说明.xlsx',
]

async function main() {
  for (const p of paths) {
    try {
      await wb.xlsx.writeFile(p)
      console.log('wrote', p, 'sheets', wb.worksheets.length, 'menus', menus.length)
    } catch (e) {
      console.log('skip', p, e.code || e.message)
      // 原文件被占用时写临时名，再提示
      if (p.includes('angang') && !p.includes('新建')) {
        const alt = 'd:/pro/angang/系统功能规划-第3页需求说明-覆盖中.xlsx'
        await wb.xlsx.writeFile(alt)
        console.log('wrote', alt, '(请关闭原文件后把此文件改名覆盖)')
      }
    }
  }
}

await main()

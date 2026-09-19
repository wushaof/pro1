import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const base = 'C:/Users/17310/AppData/Local/Temp/angang-docs'
const dirs = readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory())
const chunks = []
for (const d of dirs) {
  const xmlPath = join(base, d.name, 'word', 'document.xml')
  if (!existsSync(xmlPath)) continue
  const xml = readFileSync(xmlPath, 'utf8')
  const parts = []
  const re = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g
  let m
  while ((m = re.exec(xml))) parts.push(m[1])
  const text = parts.join('').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
  chunks.push(`\n\n######## ${d.name} ########\n` + text)
}
writeFileSync('d:/pro/angang/docs-text.txt', chunks.join('\n'), 'utf8')
console.log('docs', dirs.length, 'chars', chunks.join('').length)

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function texts(xml) {
  const out = []
  const re = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g
  let m
  while ((m = re.exec(xml))) {
    out.push(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#10;/g, '\n'))
  }
  return out
}

const slide = readFileSync('C:/Users/17310/AppData/Local/Temp/angang-ppt/out/ppt/slides/slide3.xml', 'utf8')
const lines = texts(slide)
writeFileSync('d:/pro/angang/slide3-text.txt', lines.join('\n---\n'), 'utf8')
console.log('slide3 texts', lines.length)

// notes
try {
  const notesDir = 'C:/Users/17310/AppData/Local/Temp/angang-ppt/out/ppt/notesSlides'
  const files = readdirSync(notesDir)
  console.log('notes', files)
} catch {
  console.log('no notes')
}

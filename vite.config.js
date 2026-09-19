import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

function fileOpenHtml() {
  return {
    name: 'file-open-html',
    closeBundle() {
      const file = resolve(process.cwd(), 'dist/index.html')
      let html = readFileSync(file, 'utf8')

      const scriptMatch = html.match(/<script[^>]*>[\s\S]*?<\/script>/)
      if (!scriptMatch) return

      // 保留 module；内联后无外部 import，file:// 可执行
      let script = scriptMatch[0]
      if (!/^<script\s+type="module"/.test(script)) {
        script = script.replace(/^<script(\s[^>]*)?>/, '<script type="module">')
      }

      // 先从原位置移除（用函数替换，避免 $` / $' 被当成 replace 特殊标记）
      html = html.replace(scriptMatch[0], () => '')

      const bodyClose = html.lastIndexOf('</body>')
      if (bodyClose === -1) {
        html += script
      } else {
        html = `${html.slice(0, bodyClose)}${script}\n  ${html.slice(bodyClose)}`
      }

      writeFileSync(file, html)
    },
  }
}

export default defineConfig({
  plugins: [vue(), viteSingleFile(), fileOpenHtml()],
  base: './',
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
})

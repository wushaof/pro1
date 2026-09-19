<template>
  <ModulePage title="基地库区" desc="鞍山基地和试点成品库。库区、库位、产线、装卸点按卷号对应占用，并标出在途车辆、车皮和船舶。">
    <div class="twin">
      <div ref="host" class="view" />
      <aside class="side">
        <div class="head">
          <strong>{{ current.title }}</strong>
          <el-button size="small" @click="resetView">复位</el-button>
        </div>
        <dl>
          <div v-for="item in current.rows" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
        <p class="hint">拖动旋转，滚轮缩放。点击库位、卷、车、车皮或船查看。</p>
        <div class="legend">
          <span><i class="c-coil" />占用</span>
          <span><i class="c-cool" />冷却中</span>
          <span><i class="c-block" />积压不可及</span>
          <span><i class="c-empty" />空位</span>
        </div>
      </aside>
    </div>
  </ModulePage>
</template>

<script>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModulePage from '../../components/ModulePage.vue'

const HOME = { pos: [42, 32, 38], target: [0, 0, -2] }
const TONE = { 占用: '#475569', 冷却: '#2563eb', 积压: '#d97706' }

function label(text, scale = 6.4) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(31,42,55,0.88)'
  ctx.fillRect(8, 28, 496, 72)
  ctx.fillStyle = '#fff'
  ctx.font = '42px Microsoft YaHei'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 64)
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }))
  sprite.scale.set(scale, scale / 4, 1)
  return sprite
}

function solid(w, h, d, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.72 }),
  )
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function info(title, rows) {
  return { title, rows }
}

export default {
  name: 'DigitalTwin',
  components: { ModulePage },
  setup() {
    const host = ref(null)
    const current = ref(info('鞍山基地', [
      { label: '范围', value: '炼钢、热轧、冷轧、成品库、装卸点、门岗' },
      { label: '试点库', value: '冷轧成品库 CR-01，卷号对应库位' },
      { label: '外发', value: '汽运、铁运、营口港船舶' },
    ]))
    let view = null
    const resetView = () => view?.reset()

    onMounted(() => {
      const el = host.value
      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#d5e0ea')
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400)
      camera.position.set(...HOME.pos)
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      el.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.target.set(...HOME.target)
      controls.enableDamping = true
      controls.maxPolarAngle = Math.PI / 2.12

      scene.add(new THREE.AmbientLight('#ffffff', 0.82))
      const sun = new THREE.DirectionalLight('#fff7ed', 1.1)
      sun.position.set(24, 36, 16)
      sun.castShadow = true
      scene.add(sun)

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(108, 78),
        new THREE.MeshStandardMaterial({ color: '#e7eef5', roughness: 1 }),
      )
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = true
      scene.add(ground)
      const grid = new THREE.GridHelper(100, 50, '#c5d0dc', '#eef3f8')
      grid.position.y = 0.01
      scene.add(grid)

      const picks = []
      const mark = (mesh, data) => {
        mesh.userData.card = data
        picks.push(mesh)
        return mesh
      }
      const tag = (text, x, y, z, scale) => {
        const sprite = label(text, scale)
        sprite.position.set(x, y, z)
        scene.add(sprite)
      }
      const shed = (name, card, x, z, w, d, wall) => {
        const floor = solid(w, 0.08, d, '#f8fafc', x, 0.04, z)
        scene.add(floor)
        scene.add(solid(0.28, wall, d, '#e2e8f0', x - w / 2, wall / 2, z))
        scene.add(solid(0.28, wall, d, '#e2e8f0', x + w / 2, wall / 2, z))
        scene.add(solid(w, wall, 0.28, '#e2e8f0', x, wall / 2, z - d / 2))
        scene.add(solid(w, 0.22, 1.6, '#cbd5e1', x, wall, z + d / 2 - 0.2))
        tag(name, x, wall + 1.5, z)
        mark(floor, card)
      }

      const lines = [
        ['炼钢连铸', -30, 12, 12, 1.6, 5, '#64748b', '产线', '板坯送热轧'],
        ['热轧产线', -30, 4, 18, 1.15, 3.2, '#94a3b8', '产线', '试点产线，卷取后进 H12'],
        ['冷轧产线', -30, -4, 18, 1.15, 3.2, '#475569', '产线', '试点产线，成品进 CR-01'],
      ]
      lines.forEach(([name, x, z, w, h, d, color, kind, note]) => {
        const mesh = solid(w, h, d, color, x, h / 2, z)
        scene.add(mesh)
        tag(name, x, h + 1.3, z)
        mark(mesh, info(name, [{ label: '类型', value: kind }, { label: '说明', value: note }]))
      })

      shed('H12热轧库', info('H12热轧库', [
        { label: '库号', value: 'H12' },
        { label: '类型', value: '成品库' },
        { label: '说明', value: '库位按区列层，冷却卷不可发' },
      ]), -2, 12, 16, 8, 2.2)

      shed('冷轧成品库', info('冷轧成品库', [
        { label: '库号', value: 'CR-01' },
        { label: '类型', value: '试点成品库' },
        { label: '说明', value: '卷号落到库位。上层压住下层时，下层记积压不可及' },
      ]), 0, -2, 18, 10, 2.4)

      shed('线材库', info('线材库', [
        { label: '库号', value: 'WR-01' },
        { label: '类型', value: '成品库' },
        { label: '说明', value: '按捆占位，不与冷卷混放' },
      ]), -8, -16, 10, 5, 1.8)

      const putCoil = (x, z, status, card, layer = 1) => {
        if (status === '空位') {
          const pad = solid(0.95, 0.06, 0.95, '#e5e7eb', x, 0.12, z)
          scene.add(pad)
          mark(pad, card)
          return
        }
        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 0.7, 18),
          new THREE.MeshStandardMaterial({ color: TONE[status] || TONE.占用, metalness: 0.55, roughness: 0.35 }),
        )
        mesh.rotation.z = Math.PI / 2
        mesh.position.set(x, 0.42 + (layer - 1) * 0.72, z)
        mesh.castShadow = true
        scene.add(mesh)
        mark(mesh, card)
      }

      const pattern = ['占用', '占用', '空位', '积压', '冷却', '占用', '空位', '占用']
      const fill = (x0, z0, cols, rows, gap, code, named = {}) => {
        for (let r = 0; r < rows; r += 1) {
          for (let c = 0; c < cols; c += 1) {
            const bay = String.fromCharCode(65 + r)
            const bin = `${code}-${bay}-${String(c + 1).padStart(2, '0')}`
            const hit = named[bin]
            const status = hit?.status || pattern[(r * cols + c) % pattern.length]
            const x = x0 + c * gap
            const z = z0 - r * gap
            const card = info(hit?.coilNo || bin, [
              { label: '库位', value: hit?.bin || `${bay}区 / 第1层` },
              { label: '占用', value: status === '空位' ? '空位' : '占用' },
              { label: '状态', value: hit?.note || (status === '积压' ? '上层压住，不可发' : status === '冷却' ? '冷却未完成' : status === '空位' ? '空位' : '在库待发') },
            ])
            putCoil(x, z, status, card, 1)
            if (status === '积压') {
              putCoil(x, z, '占用', info(`${bin} 上层`, [
                { label: '库位', value: `${bay}区 / 第2层` },
                { label: '占用', value: '占用' },
                { label: '状态', value: '压在下层之上，下层不可及' },
              ]), 2)
            }
          }
        }
      }

      fill(-8, 14.2, 6, 3, 1.35, 'H12', {
        'H12-A-03': { coilNo: 'C-HR-260917-052', bin: 'A区-12-03', status: '占用', note: '在库待发 · 东北某制造' },
        'H12-B-02': { coilNo: 'C-HR-260917-031', bin: 'C-01 / 第1层', status: '冷却', note: '约 200℃，冷却未完成' },
      })
      fill(-6.2, 1.2, 7, 4, 1.35, 'CR-01', {
        'CR-01-A-01': { coilNo: 'C-CR-260918-011', bin: 'CR-01-A-01', status: '占用', note: '在库待发' },
        'CR-01-C-01': { coilNo: 'C-CR-260916-033', bin: 'B区-05-08', status: '空位', note: '已出库，库位释放' },
        'CR-01-B-04': { coilNo: 'C-CR-260917-014', bin: 'CR-01-B-04', status: '积压', note: '混垛，账面有货但不可发' },
      })

      for (let i = 0; i < 8; i += 1) {
        const bundle = solid(0.7, 0.45, 0.7, i % 3 === 0 ? '#e5e7eb' : '#78716c', -11 + (i % 4) * 1.3, 0.3, -15.2 - Math.floor(i / 4) * 1.3)
        scene.add(bundle)
        mark(bundle, info(i % 3 === 0 ? '线材空位' : `WR-捆-${i + 1}`, [
          { label: '库位', value: `线材库 ${Math.floor(i / 4) + 1}排` },
          { label: '占用', value: i % 3 === 0 ? '空位' : '占用' },
          { label: '状态', value: i === 1 ? '已出库对照 C-WR-260915-019' : '在库' },
        ]))
      }

      const docks = [
        ['热轧装车坪', 16, 12, '行车 2 台，热轧卷在装'],
        ['冷轧装车坪', 18, -1, '表面件优先，避免露天久放'],
        ['线材装车点', 14, -15, '按捆吊装，不与冷卷混装'],
      ]
      docks.forEach(([name, x, z, note]) => {
        const pad = solid(4.2, 0.18, 3.2, '#f59e0b', x, 0.1, z)
        scene.add(pad)
        scene.add(solid(0.25, 2.4, 0.25, '#b45309', x - 1.4, 1.3, z - 1))
        scene.add(solid(2.6, 0.16, 0.16, '#b45309', x, 2.4, z - 1))
        tag(name, x, 3.1, z, 5.2)
        mark(pad, info(name, [{ label: '类型', value: '装卸点' }, { label: '说明', value: note }]))
      })

      const scale = solid(3.2, 0.12, 6, '#334155', 26, 0.08, 2)
      scene.add(scale)
      tag('地磅', 26, 1.6, 2, 4.6)
      mark(scale, info('出厂地磅', [
        { label: '类型', value: '计量' },
        { label: '说明', value: '净重以过磅为准，无磅单不算出厂' },
      ]))

      scene.add(solid(0.5, 2.6, 0.5, '#1f2a37', 33, 1.3, -1.2))
      scene.add(solid(0.5, 2.6, 0.5, '#1f2a37', 33, 1.3, 5.2))
      const beam = solid(0.4, 0.35, 6.6, '#1f2a37', 33, 2.7, 2)
      scene.add(beam)
      tag('和平桥门', 33, 4, 2, 5.4)
      mark(beam, info('和平桥门', [{ label: '代码', value: 'GATE-HP' }, { label: '类型', value: '门岗' }, { label: '状态', value: '有车排队' }]))

      scene.add(solid(28, 0.05, 2.4, '#cbd5e1', 40, 0.03, 2))
      const trucks = [
        { x: 18, z: -1, plate: '辽B·A2036', rows: [{ label: '类型', value: '装车' }, { label: '位置', value: '冷轧装车坪' }, { label: '状态', value: '装车中' }] },
        { x: 29, z: 2, plate: '辽B·C8812', rows: [{ label: '类型', value: '在途汽运' }, { label: '位置', value: '和平桥门排队' }, { label: '状态', value: '待过磅' }] },
        { x: 40, z: 2, plate: '辽B·D1190', move: true, rows: [{ label: '类型', value: '在途汽运' }, { label: '运单', value: 'WB-26091702' }, { label: '状态', value: '运输中' }] },
      ]
      const movers = []
      trucks.forEach((item) => {
        const group = new THREE.Group()
        const body = solid(2.3, 0.65, 1.05, '#c41e3a', 0, 0.5, 0)
        group.add(body)
        group.add(solid(0.85, 0.65, 1, '#1f2a37', 1.35, 0.62, 0))
        group.position.set(item.x, 0, item.z)
        scene.add(group)
        mark(body, info(item.plate, item.rows))
        if (item.move) movers.push(group)
      })

      scene.add(solid(36, 0.05, 0.28, '#64748b', 4, 0.04, -22))
      scene.add(solid(36, 0.05, 0.28, '#64748b', 4, 0.04, -23.1))
      tag('铁路分区', 4, 1.8, -21, 5.2)
      const wagons = [
        { x: -2, status: '已装，待发', note: '兑现车皮，件号已对照库位' },
        { x: 4, status: '空车待装', note: '车皮号以列车调度为准' },
        { x: 10, status: '请车未兑现', note: '未兑现不显示成已装车' },
      ]
      wagons.forEach((item) => {
        const wagon = solid(3.4, 0.85, 1.25, item.status === '请车未兑现' ? '#94a3b8' : '#1d4ed8', item.x, 0.5, -22.5)
        scene.add(wagon)
        mark(wagon, info('车皮', [
          { label: '类型', value: '铁运' },
          { label: '分区', value: '鞍山北铁路分区' },
          { label: '状态', value: item.status },
          { label: '说明', value: item.note },
        ]))
      })

      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(28, 12),
        new THREE.MeshStandardMaterial({ color: '#93c5fd', roughness: 0.25 }),
      )
      water.rotation.x = -Math.PI / 2
      water.position.set(8, 0.02, 24)
      scene.add(water)
      scene.add(solid(16, 0.2, 1.2, '#0f766e', 6, 0.12, 18.6))
      tag('营口自有港', 8, 3.2, 22, 6)
      const ships = [
        { x: 2, name: '鞍钢海运01', eta: '09-18 06:00', state: '已靠泊', job: '装卸中，可直装' },
        { x: 12, name: '鞍钢海运03', eta: '09-19 10:00', state: '预到港', job: '待集港' },
      ]
      ships.forEach((item) => {
        const hull = solid(5.2, 0.65, 1.5, '#0f766e', item.x, 0.4, 24)
        hull.add(solid(1.3, 0.6, 1.1, '#115e59', 1.3, 0.55, 0))
        scene.add(hull)
        mark(hull, info(item.name, [
          { label: '类型', value: '船舶' },
          { label: '预计到港', value: item.eta },
          { label: '状态', value: item.state },
          { label: '装卸', value: item.job },
        ]))
      })
      const crane = solid(0.3, 2.8, 0.3, '#b45309', 6, 1.5, 19.4)
      scene.add(crane)
      scene.add(solid(3.2, 0.14, 0.14, '#b45309', 6, 2.8, 20.6))
      mark(crane, info('泊位吊机', [{ label: '类型', value: '装卸' }, { label: '状态', value: '海运01 装卸中' }]))

      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2()
      let down = null
      const onDown = (event) => { down = [event.clientX, event.clientY] }
      const onUp = (event) => {
        if (!down) return
        const moved = (event.clientX - down[0]) ** 2 + (event.clientY - down[1]) ** 2
        down = null
        if (moved > 16) return
        const rect = renderer.domElement.getBoundingClientRect()
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(pointer, camera)
        const hit = raycaster.intersectObjects(picks, false)[0]
        if (hit?.object.userData.card) current.value = hit.object.userData.card
      }
      renderer.domElement.addEventListener('pointerdown', onDown)
      renderer.domElement.addEventListener('pointerup', onUp)

      const fit = () => {
        const width = el.clientWidth || 800
        const height = el.clientHeight || 560
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }
      fit()
      const observer = new ResizeObserver(fit)
      observer.observe(el)

      let raf = 0
      const tick = () => {
        movers.forEach((group) => {
          group.position.x += 0.03
          if (group.position.x > 52) group.position.x = 36
        })
        controls.update()
        renderer.render(scene, camera)
        raf = requestAnimationFrame(tick)
      }
      tick()

      view = {
        reset() {
          camera.position.set(...HOME.pos)
          controls.target.set(...HOME.target)
        },
        stop() {
          cancelAnimationFrame(raf)
          observer.disconnect()
          renderer.domElement.removeEventListener('pointerdown', onDown)
          renderer.domElement.removeEventListener('pointerup', onUp)
          controls.dispose()
          renderer.dispose()
        },
      }
    })

    onBeforeUnmount(() => view?.stop())
    return { host, current, resetView }
  },
}
</script>

<style scoped>
.twin {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 12px;
  min-height: 620px;
}
.view {
  min-height: 620px;
  background: #d5e0ea;
  border: 1px solid #e5e7eb;
}
.side {
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 14px 16px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.head strong { color: #1f2a37; }
dl { margin: 14px 0 0; }
dl div { margin-bottom: 10px; }
dt { font-size: 12px; color: #909399; }
dd { margin: 2px 0 0; color: #1f2a37; }
.hint { margin: 8px 0 0; color: #909399; font-size: 12px; }
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 16px;
  font-size: 12px;
  color: #606266;
}
.legend span { display: flex; align-items: center; gap: 6px; }
.legend i { width: 8px; height: 8px; }
.c-coil { background: #475569; }
.c-cool { background: #2563eb; }
.c-block { background: #d97706; }
.c-empty { background: #e5e7eb; border: 1px solid #cbd5e1; }
@media (max-width: 900px) {
  .twin { grid-template-columns: 1fr; }
}
</style>

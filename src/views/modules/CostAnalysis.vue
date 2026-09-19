<template>
  <ModulePage title="成本分析" :desc="store.costMeta.goal">
    <el-row :gutter="12">
      <el-col :span="8" v-for="item in modes" :key="item.mode">
        <div class="kpi">
          <div class="label">{{ item.mode }}单吨</div>
          <div class="value" :style="{ color: item.color }">{{ item.unit }}<small>元 / {{ item.ton }} 吨</small></div>
          <div class="stack">
            <i
              v-for="part in item.parts"
              :key="part.label"
              :style="{ width: part.width, background: part.color }"
              :title="`${part.label} ${part.amount}`"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>成本构成</span>
          <div class="legend">
            <span v-for="item in feeLegend" :key="item.label">
              <i :style="{ background: item.color }" />{{ item.label }}
            </span>
          </div>
        </div>
      </template>
      <div v-for="item in composition" :key="item.label" class="bar">
        <span>{{ item.label }}</span>
        <el-progress :percentage="item.pct" :stroke-width="10" :show-text="false" :color="item.color" />
        <em>{{ item.amount.toLocaleString() }} 元</em>
      </div>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>多维对比</span>
          <span class="source">数据来自费用归集结果、运单、客户地区</span>
        </div>
      </template>
      <el-radio-group v-model="dim" class="dims">
        <el-radio-button v-for="item in dims" :key="item.key" :label="item.label" :value="item.key" />
      </el-radio-group>
      <el-table :data="groups" stripe>
        <el-table-column prop="name" :label="dimLabel" min-width="140" />
        <el-table-column v-if="dim === 'customer'" prop="region" label="地区" width="80" />
        <el-table-column label="汽运" width="90">
          <template #default="{ row }">{{ money(row.truck) }}</template>
        </el-table-column>
        <el-table-column label="集港船运" width="100">
          <template #default="{ row }">{{ money(row.ship) }}</template>
        </el-table-column>
        <el-table-column label="铁运" width="90">
          <template #default="{ row }">{{ money(row.rail) }}</template>
        </el-table-column>
        <el-table-column label="合计" width="100">
          <template #default="{ row }">{{ money(row.total) }}</template>
        </el-table-column>
        <el-table-column label="单吨" width="80">
          <template #default="{ row }">{{ row.unit }}</template>
        </el-table-column>
        <el-table-column label="运费" width="90">
          <template #default="{ row }">{{ money(row.freight) }}</template>
        </el-table-column>
        <el-table-column label="等候" width="80">
          <template #default="{ row }">{{ money(row.wait) }}</template>
        </el-table-column>
        <el-table-column label="空驶" width="80">
          <template #default="{ row }">{{ money(row.empty) }}</template>
        </el-table-column>
        <el-table-column label="港杂" width="90">
          <template #default="{ row }">{{ money(row.port) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </ModulePage>
</template>

<script>
import { computed, ref } from 'vue'
import ModulePage from '../../components/ModulePage.vue'
import { useLogisticsStore } from '../../stores/logistics'

const dims = [
  { key: 'contract', label: '合同' },
  { key: 'orderNo', label: '订单' },
  { key: 'customer', label: '客户' },
  { key: 'route', label: '线路' },
  { key: 'warehouse', label: '库区' },
]

const feeLegend = [
  { key: 'freight', label: '运费', color: '#c41e3a' },
  { key: 'wait', label: '等候', color: '#d97706' },
  { key: 'empty', label: '空驶', color: '#64748b' },
  { key: 'port', label: '港杂', color: '#059669' },
]

const modeColors = { 汽运: '#c41e3a', 集港船运: '#059669', 铁运: '#2563eb' }

function sum(list) {
  const base = { freight: 0, wait: 0, empty: 0, port: 0, ton: 0 }
  list.forEach((row) => {
    base.freight += row.freight
    base.wait += row.wait
    base.empty += row.empty
    base.port += row.port
    base.ton += row.ton
  })
  const total = base.freight + base.wait + base.empty + base.port
  return {
    ...base,
    ton: Math.round(base.ton * 10) / 10,
    total,
    unit: base.ton ? Math.round(total / base.ton) : 0,
  }
}

export default {
  name: 'CostAnalysis',
  components: { ModulePage },
  setup() {
    const store = useLogisticsStore()
    const dim = ref('customer')

    const modes = computed(() =>
      ['汽运', '集港船运', '铁运'].map((mode) => {
        const pack = sum(store.costLines.filter((row) => row.mode === mode))
        const base = pack.total || 1
        return {
          mode,
          unit: pack.unit,
          ton: pack.ton,
          color: modeColors[mode],
          parts: feeLegend
            .map((item) => ({
              label: item.label,
              color: item.color,
              amount: pack[item.key],
              width: `${Math.round((pack[item.key] / base) * 1000) / 10}%`,
            }))
            .filter((item) => item.amount > 0),
        }
      }),
    )

    const composition = computed(() => {
      const pack = sum(store.costLines)
      const base = pack.total || 1
      return feeLegend.map((item) => ({
        label: item.label,
        color: item.color,
        amount: pack[item.key],
        pct: Math.round((pack[item.key] / base) * 100),
      }))
    })

    const dimLabel = computed(() => dims.find((item) => item.key === dim.value)?.label || '')

    const groups = computed(() => {
      const map = new Map()
      store.costLines.forEach((row) => {
        const name = row[dim.value]
        if (!map.has(name)) map.set(name, [])
        map.get(name).push(row)
      })
      return [...map.entries()].map(([name, list]) => {
        const pack = sum(list)
        return {
          name,
          region: dim.value === 'customer' ? list[0].region : '',
          truck: sum(list.filter((row) => row.mode === '汽运')).total,
          ship: sum(list.filter((row) => row.mode === '集港船运')).total,
          rail: sum(list.filter((row) => row.mode === '铁运')).total,
          ...pack,
        }
      })
    })

    const money = (value) => (value ? value.toLocaleString() : '—')

    return { store, dim, dims, feeLegend, modes, composition, dimLabel, groups, money }
  },
}
</script>

<style scoped>
.kpi {
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 14px 16px;
}
.label { font-size: 12px; color: #909399; }
.value { margin-top: 6px; font-size: 22px; font-weight: 700; color: #c41e3a; }
.value small { margin-left: 4px; font-size: 12px; font-weight: 400; color: #909399; }
.stack {
  display: flex;
  height: 8px;
  margin-top: 12px;
  background: #f3f5f8;
  overflow: hidden;
}
.stack i { display: block; height: 100%; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.legend, .legend span { display: flex; align-items: center; gap: 6px; }
.legend { gap: 14px; font-size: 12px; color: #606266; }
.legend i { width: 8px; height: 8px; }
.source { font-size: 12px; color: #909399; font-weight: 400; }
.bar {
  display: grid;
  grid-template-columns: 48px 1fr 110px;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}
.bar em { font-style: normal; color: #606266; text-align: right; }
.dims { margin-bottom: 12px; }
</style>

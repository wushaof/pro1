<template>
  <ModulePage title="车辆智能调度" :desc="store.dispatchMeta.goal">
    <el-row :gutter="12">
      <el-col :span="6" v-for="item in store.capacityPool" :key="item.label">
        <el-card shadow="never" class="stat-card">
          <div class="label">{{ item.label }}</div>
          <div class="value">{{ item.value }}<small>{{ item.unit }}</small></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="mb">
      <el-col :span="6" v-for="k in store.dispatchMeta.kpis" :key="k.label">
        <div class="kpi">
          <div class="label">{{ k.label }}</div>
          <div class="kpi-v">{{ k.value }}</div>
          <small>{{ k.tip }}</small>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="tab">
      <el-tab-pane label="门口排队 / 错峰" name="gate">
        <el-table :data="store.plantQueues" stripe>
          <el-table-column prop="gate" label="厂门" />
          <el-table-column prop="queue" label="排队车辆" width="100" />
          <el-table-column prop="waitMin" label="等待(分)" width="100" />
          <el-table-column prop="peak" label="拥堵时段" />
          <el-table-column prop="stagger" label="错峰建议" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="装卸点等待" name="bay">
        <el-alert
          class="mb"
          type="info"
          :closable="false"
          title="梳理点：机械配置、同时作业车位、品类装车时长、排队方式、决策（顺序/权衡）、调度维度（当天/三天/按订单）。"
        />
        <el-table :data="loadPointsView" stripe>
          <el-table-column prop="name" label="装卸点" min-width="110" />
          <el-table-column prop="machines" label="机械配置" min-width="110" />
          <el-table-column prop="bays" label="同时车位" width="90" />
          <el-table-column prop="minutesText" label="品类装车时长" min-width="140" />
          <el-table-column prop="queue" label="当前排队" width="90" />
          <el-table-column prop="waitMin" label="等待(分)" width="90" />
          <el-table-column prop="queueMode" label="排队方式" min-width="120" />
          <el-table-column prop="decision" label="现场决策思路" min-width="140" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="派车匹配" name="match">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <div class="title-wrap">
                <span>派车清单</span>
                <SourceChips :sources="store.dispatchMeta.sources" />
              </div>
              <el-radio-group v-model="horizon" size="small">
                <el-radio-button v-for="h in scheduleHorizons" :key="h.key" :label="h.label" />
              </el-radio-group>
            </div>
          </template>
          <p class="horizon-desc">{{ horizonDesc }}</p>
          <el-table :data="filteredTasks" stripe>
            <el-table-column prop="demandNo" label="需求号" min-width="110" />
            <el-table-column prop="orderNo" label="订单号" min-width="120" />
            <el-table-column prop="goods" label="货量" width="110" />
            <el-table-column prop="route" label="线路" min-width="140" />
            <el-table-column prop="needType" label="需求车型" width="110" />
            <el-table-column prop="plate" label="匹配车辆" width="110" />
            <el-table-column prop="matchScore" label="匹配度" width="80" />
            <el-table-column prop="locate" label="车辆在哪" min-width="130" />
            <el-table-column prop="horizon" label="维度" width="80" />
            <el-table-column prop="waitMin" label="等待" width="70" />
            <el-table-column prop="status" label="状态" width="100" fixed="right">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </ModulePage>
</template>

<script>
import { computed, ref } from 'vue'
import ModulePage from '../../components/ModulePage.vue'
import SourceChips from '../../components/SourceChips.vue'
import { useLogisticsStore } from '../../stores/logistics'
import { loadingPoints, scheduleHorizons } from '../../config/domain'

export default {
  name: 'VehicleDispatch',
  components: { ModulePage, SourceChips },
  setup() {
    const store = useLogisticsStore()
    const tab = ref('gate')
    const horizon = ref('当天滚动')

    const loadPointsView = computed(() =>
      loadingPoints.map((p) => {
        const wait = store.loadPointWaits.find((w) => w.point === p.name) || {}
        return {
          ...p,
          queue: wait.queue ?? '—',
          waitMin: wait.waitMin ?? '—',
          minutesText: Object.entries(p.minutes)
            .map(([k, v]) => `${k}${v}分`)
            .join(' / '),
          queueMode: p.queue,
          decision: p.decision,
        }
      }),
    )

    const horizonDesc = computed(
      () => scheduleHorizons.find((h) => h.label === horizon.value)?.desc || '',
    )

    const filteredTasks = computed(() => {
      const map = { 当天滚动: '当天', 三天窗口: '三天窗', 按订单维度: '按订单' }
      const key = map[horizon.value]
      if (!key) return store.vehicleTasks
      const matched = store.vehicleTasks.filter((t) => t.horizon === key)
      return matched.length ? matched : store.vehicleTasks
    })

    const statusType = (v) =>
      ({ 建议派车: 'warning', 执行中: 'primary', 运力紧张: 'danger', 已完成: 'success' }[v] || 'info')

    return {
      store,
      tab,
      horizon,
      scheduleHorizons,
      loadPointsView,
      horizonDesc,
      filteredTasks,
      statusType,
    }
  },
}
</script>

<style scoped>
.stat-card, .mb { margin-bottom: 12px; }
.label { font-size: 12px; color: #909399; }
.value { margin-top: 6px; font-size: 22px; font-weight: 700; color: #c41e3a; }
.value small { margin-left: 4px; font-size: 12px; font-weight: 400; color: #909399; }
.kpi { padding: 10px 12px; border: 1px solid #ebeef5; background: #fff; margin-bottom: 12px; }
.kpi-v { font-size: 18px; font-weight: 700; color: #1f2a37; margin: 4px 0; }
.kpi small { color: #909399; font-size: 12px; }
.card-header, .title-wrap {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
}
.horizon-desc { margin: 0 0 12px; font-size: 12px; color: #909399; }
</style>

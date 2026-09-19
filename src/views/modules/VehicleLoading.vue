<template>
  <ModulePage title="车辆智能配载" :desc="store.loadingMeta.goal">
    <el-row :gutter="12" class="mb">
      <el-col :span="6" v-for="k in store.loadingMeta.kpis" :key="k.label">
        <div class="kpi">
          <div class="label">{{ k.label }}</div>
          <div class="kpi-v">{{ k.value }}</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="tab">
      <el-tab-pane label="配载 / 拼车方案" name="plan">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <div class="title-wrap">
                <span>配载清单</span>
                <SourceChips :sources="store.loadingMeta.sources" />
              </div>
            </div>
          </template>
          <el-table :data="store.loadingPlans" stripe>
            <el-table-column prop="loadNo" label="配载单" width="90" />
            <el-table-column prop="mode" label="汽/铁" width="70" />
            <el-table-column prop="carpool" label="拼车方式" min-width="120" />
            <el-table-column prop="direction" label="方向" width="110" />
            <el-table-column prop="orders" label="订单" min-width="140" />
            <el-table-column prop="plate" label="车辆/车皮" min-width="120" />
            <el-table-column prop="vehicleLimit" label="限高限宽/标重" min-width="130" />
            <el-table-column prop="goods" label="装载明细" min-width="100" />
            <el-table-column prop="mixOk" label="混装规则" min-width="120" />
            <el-table-column prop="fillRate" label="满载率" width="80">
              <template #default="{ row }">
                <span :class="{ low: row.fillRate < 75 }">{{ row.fillRate }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="gray" label="超限灰色地带" min-width="120" />
            <el-table-column prop="status" label="状态" width="100" fixed="right">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="不可混装品类" name="mix">
        <el-table :data="mixForbidRules" stripe>
          <el-table-column prop="a" label="品类 A" width="120" />
          <el-table-column prop="b" label="品类 B" width="120" />
          <el-table-column prop="reason" label="不能混装的原因" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="车型装载习惯" name="habit">
        <el-table :data="vehicleLoadHabits" stripe>
          <el-table-column prop="type" label="车型" width="140" />
          <el-table-column prop="habit" label="实际装载习惯" />
          <el-table-column prop="gray" label="超限灰色地带" min-width="180" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </ModulePage>
</template>

<script>
import { ref } from 'vue'
import ModulePage from '../../components/ModulePage.vue'
import SourceChips from '../../components/SourceChips.vue'
import { useLogisticsStore } from '../../stores/logistics'
import { mixForbidRules, vehicleLoadHabits } from '../../config/domain'

export default {
  name: 'VehicleLoading',
  components: { ModulePage, SourceChips },
  setup() {
    const store = useLogisticsStore()
    const tab = ref('plan')
    const statusType = (v) =>
      ({
        待确认: 'warning',
        已配载: 'success',
        装车中: 'primary',
        请车兑现中: 'info',
      }[v] || 'info')
    return { store, tab, mixForbidRules, vehicleLoadHabits, statusType }
  },
}
</script>

<style scoped>
.mb { margin-bottom: 8px; }
.label { font-size: 12px; color: #909399; }
.kpi { padding: 10px 12px; border: 1px solid #ebeef5; background: #fff; margin-bottom: 12px; }
.kpi-v { margin-top: 4px; font-size: 20px; font-weight: 700; color: #c41e3a; }
.card-header, .title-wrap {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
}
.low { color: #c41e3a; font-weight: 700; }
</style>

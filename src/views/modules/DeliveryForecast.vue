<template>
  <ModulePage title="准发与运力预测" :desc="store.forecastMeta.goal">
    <SourcePanel board="fc-data" />
    <el-alert :title="store.forecastMeta.note" type="warning" :closable="false" show-icon class="mb" />

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="title-wrap">
            <span>准发预测清单</span>
            <SourceChips :sources="store.forecastMeta.sources" />
          </div>
          <el-space wrap>
            <el-tag v-for="c in store.forecastMeta.conditions" :key="c" size="small" effect="plain" type="warning">
              {{ c }}
            </el-tag>
          </el-space>
        </div>
      </template>

      <el-row :gutter="12" class="stats">
        <el-col :span="6" v-for="item in summary" :key="item.label">
          <div class="stat">
            <div class="label">{{ item.label }}</div>
            <div class="value">{{ item.value }}</div>
          </div>
        </el-col>
      </el-row>

      <div class="ready-bars">
        <div v-for="row in store.forecastList" :key="row.orderNo" class="ready-bar">
          <span>{{ row.goods }}</span>
          <el-progress
            :percentage="row.planQty ? Math.min(100, Math.round((row.readyQty / row.planQty) * 100)) : 0"
            :stroke-width="8"
            :show-text="false"
            color="#c41e3a"
          />
          <em>可发 {{ row.readyQty }} / 计划 {{ row.planQty }}</em>
        </div>
      </div>

      <el-table :data="store.forecastList" stripe>
        <el-table-column prop="orderNo" label="订单号" min-width="130" />
        <el-table-column prop="goods" label="品名" width="100" />
        <el-table-column prop="customer" label="客户" min-width="110" />
        <el-table-column prop="planQty" label="计划量(吨)" width="100" />
        <el-table-column prop="bookStock" label="账面库存" width="90" />
        <el-table-column prop="blockedQty" label="积压不可及" width="100" />
        <el-table-column prop="readyQty" label="可准发量" width="90" />
        <el-table-column prop="shipMode" label="外发方式" min-width="110" />
        <el-table-column prop="quality" label="质量" width="80" />
        <el-table-column prop="predictTime" label="预测准发时点" width="120" />
        <el-table-column prop="confidence" label="置信度" width="80">
          <template #default="{ row }">
            <el-tag :type="confType(row.confidence)" size="small">{{ row.confidence }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="blockReason" label="原因说明" min-width="140" />
        <el-table-column prop="status" label="状态" width="100" fixed="right">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </ModulePage>
</template>

<script>
import { computed } from 'vue'
import ModulePage from '../../components/ModulePage.vue'
import SourceChips from '../../components/SourceChips.vue'
import SourcePanel from '../../components/SourcePanel.vue'
import { useLogisticsStore } from '../../stores/logistics'

export default {
  name: 'DeliveryForecast',
  components: { ModulePage, SourceChips, SourcePanel },
  setup() {
    const store = useLogisticsStore()
    const summary = computed(() => [
      { label: '计划量合计', value: store.forecastList.reduce((s, i) => s + i.planQty, 0) },
      { label: '可准发合计', value: store.forecastList.reduce((s, i) => s + i.readyQty, 0) },
      { label: '积压不可及', value: store.forecastList.reduce((s, i) => s + i.blockedQty, 0) },
      { label: '可准发订单数', value: store.forecastList.filter((i) => i.status === '可准发').length },
    ])
    const confType = (v) => ({ 高: 'success', 中: 'warning', 低: 'info' }[v] || 'info')
    const statusType = (v) =>
      ({ 可准发: 'success', 条件待满足: 'warning', 预测中: 'primary', 不可准发: 'danger' }[v] || 'info')
    return { store, summary, confType, statusType }
  },
}
</script>

<style scoped>
.mb { margin-bottom: 12px; }
.card-header, .title-wrap {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
}
.stats { margin-bottom: 12px; }
.ready-bars { margin-bottom: 14px; }
.ready-bar {
  display: grid;
  grid-template-columns: 72px 1fr 150px;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #606266;
}
.ready-bar em { font-style: normal; }
.stat { padding: 12px; background: #f8fafc; border: 1px solid #e5eaf0; }
.label { font-size: 12px; color: #909399; }
.value { margin-top: 6px; font-size: 22px; font-weight: 700; color: #c41e3a; }
</style>

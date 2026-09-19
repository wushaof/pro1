<template>
  <ModulePage title="物流驾驶舱" :desc="store.cockpitMeta.goal">
    <el-card shadow="never" class="mb">
      <SourceChips :sources="store.cockpitMeta.sources" />
    </el-card>

    <el-row :gutter="12">
      <el-col :lg="6" :sm="12" :xs="24" v-for="item in store.cockpitStats" :key="item.label">
        <el-card shadow="never" class="stat-card">
          <div class="dim">{{ item.dim }}</div>
          <div class="label">{{ item.label }}</div>
          <div class="value">{{ item.value }}<small>{{ item.unit }}</small></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :lg="14" :xs="24">
        <el-card shadow="never" header="异常预警">
          <div v-for="item in store.alerts" :key="item.content" class="alert-item">
            <el-tag :type="levelType(item.level)" size="small">{{ item.level }}</el-tag>
            <el-tag size="small" effect="plain">{{ item.dim }}</el-tag>
            <div class="alert-content">
              <div>{{ item.content }}</div>
              <small>{{ item.time }}</small>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="10" :xs="24">
        <el-card shadow="never" header="梳理关注点速览">
          <ul class="bullets">
            <li>原料：营口港三公司铁矿 / 二公司煤 → 基地；国内矿 → 鞍山</li>
            <li>成品外发：汽运（直送/物流园/自提/集港）+ 铁运 + 港口船运南下</li>
            <li>准发：计划量 ≠ 可发量（积压压货）</li>
            <li>调度：门口排队、装卸点等待、当天/三天/订单维度</li>
            <li>计划：插单、优先级、交货日倒推最晚发车</li>
            <li>配载：不可混装、车型习惯、超限灰色地带、拼车满载率</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </ModulePage>
</template>

<script>
import ModulePage from '../../components/ModulePage.vue'
import SourceChips from '../../components/SourceChips.vue'
import { useLogisticsStore } from '../../stores/logistics'

export default {
  name: 'LogisticsCockpit',
  components: { ModulePage, SourceChips },
  setup() {
    const store = useLogisticsStore()
    const levelType = (v) => ({ 高: 'danger', 中: 'warning', 低: 'info' }[v] || 'info')
    return { store, levelType }
  },
}
</script>

<style scoped>
.mb { margin-bottom: 8px; }
.stat-card { margin-bottom: 12px; }
.dim { font-size: 12px; color: #909399; }
.label { margin-top: 4px; font-size: 13px; color: #606266; }
.value { margin-top: 8px; font-size: 24px; font-weight: 700; color: #c41e3a; }
.value small { margin-left: 4px; font-size: 12px; font-weight: 400; color: #909399; }
.alert-item {
  display: flex; gap: 8px; padding: 10px 0; border-bottom: 1px solid #f0f2f5; align-items: flex-start;
}
.alert-item:last-child { border-bottom: none; }
.alert-content { flex: 1; font-size: 13px; }
.alert-content small { color: #909399; }
.bullets {
  margin: 0; padding-left: 18px; color: #303133; font-size: 13px; line-height: 1.8;
}
</style>

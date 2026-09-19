<template>
  <ModulePage title="出厂计划智能编制" :desc="store.outboundMeta.goal">
    <el-tabs v-model="tab">
      <el-tab-pane label="出厂计划" name="plan">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <div class="title-wrap">
                <span>计划清单</span>
                <SourceChips :sources="store.outboundMeta.sources" />
              </div>
            </div>
          </template>
          <el-table :data="store.outboundPlans" stripe>
            <el-table-column prop="planNo" label="计划号" min-width="110" />
            <el-table-column prop="customer" label="客户" min-width="110" />
            <el-table-column prop="goods" label="品名" width="90" />
            <el-table-column prop="ton" label="吨位" width="70" />
            <el-table-column prop="deliveryDate" label="交货日" width="90" />
            <el-table-column prop="latestShip" label="最晚发运" width="120" />
            <el-table-column prop="latestDepart" label="最晚发车" width="110" />
            <el-table-column prop="mode" label="外发方式" min-width="110" />
            <el-table-column prop="priority" label="优先级" width="80" />
            <el-table-column prop="insert" label="插单" width="90" />
            <el-table-column prop="trips" label="车次/车皮" width="100" />
            <el-table-column prop="sequence" label="发运时序" min-width="120" />
            <el-table-column prop="status" label="状态" width="90" fixed="right">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="多式联运为何如此排" name="why">
        <el-table :data="store.outboundRules.whyModes" stripe>
          <el-table-column prop="mode" label="方式" width="140" />
          <el-table-column prop="why" label="当前这样排的原因" />
        </el-table>
        <el-alert class="mt" type="info" :closable="false" :title="`铁运占比示意：${store.outboundRules.railShare}`" />
      </el-tab-pane>

      <el-tab-pane label="优先级 / 插单 / 日期倒推" name="rule">
        <el-card shadow="never" class="mb">
          <template #header>发运优先级（从高到低）</template>
          <el-space wrap>
            <el-tag v-for="(p, i) in store.outboundRules.priority" :key="p" type="danger" effect="plain">
              {{ i + 1 }}. {{ p }}
            </el-tag>
          </el-space>
        </el-card>
        <el-card shadow="never" class="mb">
          <template #header>插单处理</template>
          <p class="text">{{ store.outboundRules.insertOrder }}</p>
        </el-card>
        <el-card shadow="never">
          <template #header>交货日期换算规则</template>
          <p class="text">{{ store.outboundRules.dateRule }}</p>
          <el-steps :active="3" align-center class="mt">
            <el-step title="交货日期" />
            <el-step title="倒推在途时效" />
            <el-step title="最晚发运" />
            <el-step title="最晚发车/装车" />
          </el-steps>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </ModulePage>
</template>

<script>
import { ref } from 'vue'
import ModulePage from '../../components/ModulePage.vue'
import SourceChips from '../../components/SourceChips.vue'
import { useLogisticsStore } from '../../stores/logistics'

export default {
  name: 'OutboundPlan',
  components: { ModulePage, SourceChips },
  setup() {
    const store = useLogisticsStore()
    const tab = ref('plan')
    const statusType = (v) =>
      ({ 待确认: 'warning', 已变更: 'danger', 已下发: 'success', 编制中: 'info' }[v] || 'info')
    return { store, tab, statusType }
  },
}
</script>

<style scoped>
.card-header, .title-wrap {
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
}
.mt { margin-top: 12px; }
.mb { margin-bottom: 12px; }
.text { margin: 0; font-size: 14px; color: #303133; line-height: 1.7; }
</style>

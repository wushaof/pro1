<template>
  <ModulePage :title="pageTitle" :desc="pageDesc">
    <SourcePanel board="ob-data" />
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

      <el-tab-pane label="汽铁匹配" name="match">
        <el-alert class="mb" type="warning" :closable="false" show-icon title="汽运和铁运按交期、可发、运力和运输规则动态匹配。车皮未兑现、船期未到的，不排进已确认计划。" />
        <el-table :data="store.outboundPlans" stripe>
          <el-table-column prop="goods" label="品名" width="90" />
          <el-table-column prop="customer" label="客户" min-width="110" />
          <el-table-column prop="ton" label="吨位" width="70" />
          <el-table-column prop="mode" label="匹配方式" min-width="120" />
          <el-table-column label="约束" min-width="220">
            <template #default="{ row }">{{ modeRule(row) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
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
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ModulePage from '../../components/ModulePage.vue'
import SourceChips from '../../components/SourceChips.vue'
import SourcePanel from '../../components/SourcePanel.vue'
import { useLogisticsStore } from '../../stores/logistics'
import { findNavItem } from '../../config/nav'

export default {
  name: 'OutboundPlan',
  components: { ModulePage, SourceChips, SourcePanel },
  setup() {
    const store = useLogisticsStore()
    const route = useRoute()
    const allowed = ['plan', 'match', 'rule']
    const tabAlias = { why: 'match' }
    const tab = ref(tabAlias[route.params.tab] || (allowed.includes(route.params.tab) ? route.params.tab : 'plan'))
    watch(
      () => route.params.tab,
      (value) => {
        tab.value = tabAlias[value] || (allowed.includes(value) ? value : 'plan')
      },
    )
    const pageTitle = computed(() => findNavItem(route.path)?.item.title || '出厂计划')
    const pageDesc = computed(() =>
      tab.value === 'match'
        ? '按交期、可发资源、运力和运输规则，动态匹配汽运和铁运。'
        : '按交期、可发库存和运力编制出厂计划，统筹订单和运输方式。确认后写入 PES。',
    )
    const statusType = (v) =>
      ({ 待确认: 'warning', 已变更: 'danger', 已下发: 'success', 编制中: 'info' }[v] || 'info')
    const modeRule = (row) => {
      if (row.mode.includes('直送')) return '交期、运力与可发量匹配为汽运直送'
      if (row.mode.includes('集港')) return '按船期窗口匹配集港汽运'
      if (row.mode.includes('铁运')) return '按车皮兑现和运输规则匹配铁运'
      if (row.mode.includes('水运')) return '按船期匹配水运'
      return '按交期、可发量和运力匹配'
    }
    return { store, tab, pageTitle, pageDesc, statusType, modeRule }
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

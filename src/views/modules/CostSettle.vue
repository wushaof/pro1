<template>
  <ModulePage title="成本线上管理" :desc="store.settleMeta.goal">
    <SourcePanel board="track-settle" />
    <el-alert :title="store.settleMeta.note" type="warning" :closable="false" show-icon />

    <el-row :gutter="12">
      <el-col :span="6" v-for="item in summary" :key="item.label">
        <div class="kpi">
          <div class="label">{{ item.label }}</div>
          <div class="value">{{ item.value }}<small>{{ item.unit }}</small></div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="title-wrap">
            <span>费用倒查与结算</span>
            <SourceChips :sources="store.settleMeta.sources" />
          </div>
          <el-input v-model="keyword" clearable placeholder="合同 / 订单 / 运单" style="width: 220px" />
        </div>
      </template>

      <el-radio-group v-model="fee" class="fees">
        <el-radio-button label="全部" value="全部" />
        <el-radio-button v-for="name in feeTypes" :key="name" :label="name" :value="name" />
      </el-radio-group>

      <el-table :data="rows" stripe>
        <el-table-column prop="fee" label="费项" width="100" />
        <el-table-column prop="contract" label="合同号" min-width="130" />
        <el-table-column prop="orderNo" label="订单号" min-width="140" />
        <el-table-column prop="waybillNo" label="运单号" min-width="130" />
        <el-table-column prop="customer" label="客户" min-width="110" />
        <el-table-column label="吨位" width="80">
          <template #default="{ row }">{{ row.ton ?? '—' }}</template>
        </el-table-column>
        <el-table-column label="金额(元)" width="100">
          <template #default="{ row }">{{ row.amount == null ? '—' : row.amount }}</template>
        </el-table-column>
        <el-table-column prop="lookup" label="倒查" width="120" />
        <el-table-column prop="status" label="结算" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === '待结算'" type="primary" link @click.stop="onSettle(row)">
              线上结算
            </el-button>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </ModulePage>
</template>

<script>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import ModulePage from '../../components/ModulePage.vue'
import SourceChips from '../../components/SourceChips.vue'
import SourcePanel from '../../components/SourcePanel.vue'
import { useLogisticsStore } from '../../stores/logistics'

const feeTypes = ['运费', '等候', '空驶', '铁运', '码头装卸', '理货', '停泊']

export default {
  name: 'CostSettle',
  components: { ModulePage, SourceChips, SourcePanel },
  setup() {
    const store = useLogisticsStore()
    const fee = ref('全部')
    const keyword = ref('')

    const rows = computed(() => {
      const key = keyword.value.trim()
      return store.settleFees.filter((item) => {
        if (fee.value !== '全部' && item.fee !== fee.value) return false
        if (!key) return true
        return [item.contract, item.orderNo, item.waybillNo, item.customer].some((text) =>
          String(text).includes(key),
        )
      })
    })

    const summary = computed(() => {
      const list = store.settleFees
      const settled = list.filter((item) => item.status === '已线上结算')
      const amount = settled.reduce((sum, item) => sum + (item.amount || 0), 0)
      return [
        { label: '已线上结算', value: amount.toLocaleString(), unit: '元' },
        { label: '待结算', value: list.filter((item) => item.status === '待结算').length, unit: '笔' },
        { label: '不能结算', value: list.filter((item) => item.status === '不可结算' || item.status === '禁止归集' || item.status === '待计价').length, unit: '笔' },
        { label: '费项', value: feeTypes.length, unit: '类' },
      ]
    })

    const statusType = (value) =>
      ({ 已线上结算: 'success', 待结算: 'warning', 待计价: 'info', 不可结算: 'danger', 禁止归集: 'danger' }[value] || 'info')

    const onSettle = (row) => {
      if (!store.settleOnline(row.id)) return
      ElMessage.success('已线上结算，不再进入人工对账')
    }

    return { store, fee, feeTypes, keyword, rows, summary, statusType, onSettle }
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
.card-header, .title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.fees { margin-bottom: 12px; }
.muted { color: #c0c4cc; }
</style>

<template>
  <ModulePage title="发运跟踪" desc="分库区、分产线看库存和库容，汽运和铁运分开看在途，港口看船号、到港和直装，运单从出库跟到签收。">
    <SourcePanel board="cock-api" />
    <el-alert title="占用率低不等于好发。可发量还要看混垛和冷却。" type="warning" :closable="false" show-icon />

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>库区库存</span>
          <SourceChips :sources="store.cockpitMeta.sources.slice(0, 2)" />
        </div>
      </template>
      <div v-for="item in stocks" :key="item.wh" class="stock">
        <div class="stock-name">
          <strong>{{ item.wh }}</strong>
          <span>{{ item.line }} · {{ item.cap }}</span>
        </div>
        <div v-if="item.occ != null" class="stock-bars">
          <div>
            <span>占用 {{ item.occ }}%</span>
            <el-progress :percentage="item.occ" :stroke-width="8" :show-text="false" color="#64748b" />
          </div>
          <div>
            <span>可发 {{ item.ready }}%</span>
            <el-progress :percentage="item.ready" :stroke-width="8" :show-text="false" color="#c41e3a" />
          </div>
        </div>
        <div v-else class="stock-bars">
          <span>在库 {{ item.book }} 吨 · 可发 {{ item.readyTon }} 吨</span>
        </div>
        <em>{{ item.note }}</em>
      </div>
    </el-card>

    <el-row :gutter="12">
      <el-col :lg="12" :xs="24">
        <el-card shadow="never" header="汽运在途">
          <div v-for="item in trucks" :key="item.plate" class="line">
            <div>
              <strong>{{ item.plate }}</strong>
              <p>{{ item.place }} · {{ item.bill }}</p>
            </div>
            <el-tag size="small" :type="tagType(item.status)">{{ item.status }}</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="12" :xs="24">
        <el-card shadow="never" header="铁运车皮">
          <div v-for="item in wagons" :key="item.zone" class="line">
            <div>
              <strong>{{ item.zone }}</strong>
              <p>请车 {{ item.ask }} · 兑现 {{ item.got }} · 已装 {{ item.load }}</p>
            </div>
            <el-tag size="small" :type="item.got ? 'success' : 'warning'">{{ item.got ? '已兑现' : '未兑现' }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" header="港口">
      <el-row :gutter="12">
        <el-col :lg="8" :sm="12" :xs="24" v-for="job in store.terminalJobs" :key="job.vessel + job.berth">
          <div class="ship">
            <div class="line">
              <strong>{{ job.vessel }}</strong>
              <el-tag size="small" :type="tagType(job.status)">{{ job.status }}</el-tag>
            </div>
            <p>{{ job.terminal }} {{ job.berth }} · 预计到港 {{ job.eta }}</p>
            <div class="direct">
              <span>车船直装 {{ job.directLoad }}</span>
              <el-progress :percentage="job.gatherProgress" :stroke-width="8" :show-text="false" color="#059669" />
              <em>{{ job.gatherProgress }}%</em>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" header="运单跟踪">
      <div v-for="item in bills" :key="item.no" class="bill">
        <div class="bill-head">
          <strong>{{ item.no }}</strong>
          <span>{{ item.customer }} · {{ item.goods }}</span>
        </div>
        <div class="steps">
          <span v-for="(step, index) in steps" :key="step" :class="{ on: index <= item.step, now: index === item.step }">
            {{ step }}
          </span>
        </div>
      </div>
    </el-card>
  </ModulePage>
</template>

<script>
import ModulePage from '../../components/ModulePage.vue'
import SourceChips from '../../components/SourceChips.vue'
import SourcePanel from '../../components/SourcePanel.vue'
import { useLogisticsStore } from '../../stores/logistics'

export default {
  name: 'LogisticsCockpit',
  components: { ModulePage, SourceChips, SourcePanel },
  setup() {
    const store = useLogisticsStore()
    const stocks = [
      { wh: 'H12热轧库', line: '热轧产线', cap: '库容约 9 万吨', occ: 36, ready: 22, note: '占用不高，冷却未完成和混垛把可发压低' },
      { wh: '冷轧成品库', line: '冷轧产线', cap: '库容约 2 万吨', occ: 65, ready: 41, note: '混垛，纸质盘点，可发低于账面' },
      { wh: '线材库', line: '线材产线', cap: '未配置额定库容', occ: null, book: 3100, readyTon: 2400, note: '没有额定库容，只看吨数' },
    ]
    const trucks = [
      { plate: '辽B·A2036', place: '冷轧装车坪', bill: '装车未出库', status: '装车中' },
      { plate: '辽B·C8812', place: '和平桥门', bill: '待过磅', status: '排队' },
      { plate: '辽B·D1190', place: '沈大高速', bill: 'WB-26091702', status: '运输中' },
    ]
    const wagons = [
      { zone: '分区3 · 沈阳方向', ask: 4, got: 2, load: 1 },
      { zone: '分区7', ask: 1, got: 1, load: 0 },
      { zone: '分区1', ask: 2, got: 0, load: 0 },
    ]
    const steps = ['成品出库', '在途', '到港/送达', '签收']
    const bills = [
      { no: 'WB-26091608', customer: '沈阳某贸易', goods: '线材 31.5 吨', step: 3 },
      { no: 'WB-26091702', customer: '大连某仓储', goods: '冷轧卷 24.2 吨', step: 1 },
      { no: 'WB-26091701', customer: '东北某制造', goods: '热轧卷 28.6 吨 · 未出库', step: -1 },
    ]
    const tagType = (value) => ({ 运输中: 'primary', 装车中: 'warning', 排队: 'info', 作业中: 'success', 待集港: 'warning', 船等货: 'danger', 堆场作业: 'info' }[value] || 'info')
    return { store, stocks, trucks, wagons, steps, bills, tagType }
  },
}
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.stock { display: grid; grid-template-columns: 220px 1fr 240px; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f2f5; }
.stock:last-child { border-bottom: none; }
.stock-name span, .stock em, .line p, .ship p { color: #909399; font-size: 12px; }
.stock-name strong, .line strong, .ship strong, .bill-head strong { color: #1f2a37; }
.stock em { font-style: normal; }
.stock-bars { display: grid; gap: 6px; font-size: 12px; color: #606266; }
.line, .bill-head, .direct { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.line { padding: 10px 0; border-bottom: 1px solid #f0f2f5; }
.line:last-child { border-bottom: none; }
.line p, .ship p { margin: 4px 0 0; }
.ship { border: 1px solid #ebeef5; padding: 12px; margin-bottom: 12px; }
.direct { margin-top: 10px; display: grid; grid-template-columns: 120px 1fr 36px; font-size: 12px; color: #606266; }
.direct em { font-style: normal; text-align: right; }
.bill { padding: 12px 0; border-bottom: 1px solid #f0f2f5; }
.bill:last-child { border-bottom: none; }
.steps { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
.steps span { font-size: 12px; color: #c0c4cc; padding: 2px 8px; background: #f3f5f8; }
.steps span.on { color: #1f2a37; background: #e5e7eb; }
.steps span.now { color: #fff; background: #c41e3a; }
@media (max-width: 900px) {
  .stock { grid-template-columns: 1fr; }
}
</style>

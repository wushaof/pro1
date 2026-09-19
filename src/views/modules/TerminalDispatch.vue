<template>
  <ModulePage title="码头智能调度" :desc="store.terminalMeta.goal">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="title-wrap">
            <span>码头作业看板</span>
            <el-tag v-if="store.terminalMeta.surveyed" type="success" size="small">今日已调研</el-tag>
            <SourceChips :sources="store.terminalMeta.sources" />
          </div>
        </div>
      </template>

      <el-row :gutter="12">
        <el-col :lg="12" :xs="24" v-for="job in store.terminalJobs" :key="job.berth + job.terminal">
          <div class="job" :class="{ alert: job.status === '船等货' }">
            <div class="job-head">
              <strong>{{ job.terminal }} · {{ job.berth }}</strong>
              <el-tag :type="statusType(job.status)" size="small">{{ job.status }}</el-tag>
            </div>
            <div class="grid">
              <div><span>船舶</span><b>{{ job.vessel }}</b></div>
              <div><span>预到/靠泊</span><b>{{ job.eta }} / {{ job.ata }}</b></div>
              <div><span>货种</span><b>{{ job.cargo }}</b></div>
              <div><span>堆场</span><b>{{ job.yardCap }}</b></div>
              <div><span>车船直装</span><b>{{ job.directLoad }}</b></div>
              <div><span>到场时序</span><b>{{ job.truckWindow }}</b></div>
            </div>
            <div class="progress-row">
              <span>集港进度</span>
              <el-progress :percentage="job.gatherProgress" :status="job.gatherProgress < 30 ? 'exception' : undefined" />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </ModulePage>
</template>

<script>
import ModulePage from '../../components/ModulePage.vue'
import SourceChips from '../../components/SourceChips.vue'
import { useLogisticsStore } from '../../stores/logistics'

export default {
  name: 'TerminalDispatch',
  components: { ModulePage, SourceChips },
  setup() {
    const store = useLogisticsStore()
    const statusType = (v) =>
      ({ 作业中: 'primary', 待集港: 'warning', 堆场作业: 'info', 船等货: 'danger' }[v] || 'info')
    return { store, statusType }
  },
}
</script>

<style scoped>
.card-header, .title-wrap {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.job {
  border: 1px solid #ebeef5; background: #fafbfc; padding: 14px; margin-bottom: 12px;
}
.job.alert { border-color: #fca5a5; background: #fef2f2; }
.job-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}
.grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; font-size: 13px;
}
.grid span { color: #909399; margin-right: 6px; }
.grid b { color: #303133; font-weight: 600; }
.progress-row {
  margin-top: 12px; display: flex; align-items: center; gap: 10px;
}
.progress-row span { width: 64px; font-size: 12px; color: #909399; }
.progress-row .el-progress { flex: 1; }
</style>

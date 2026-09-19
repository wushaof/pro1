<template>
  <ModulePage
    title="全程可视化追踪"
    desc="按物料级主链贯通订货→排产→炼钢→轧制→入库→发运，点击下方阶段切换对应单据列表。"
  >
    <div class="stage-bar">
      <div
        v-for="(stage, index) in store.trackingStages"
        :key="stage.key"
        class="stage-item"
        :class="{ active: selectedStage === stage.key }"
        @click="selectStage(stage.key)"
      >
        <div class="stage-text">
          <strong>{{ stage.name }}</strong>
          <span>{{ stage.sub }}</span>
        </div>
        <div v-if="index < store.trackingStages.length - 1" class="stage-arrow">›</div>
      </div>
    </div>

    <!-- 对应 PPT 红框泳道：当前阶段的业务活动 / 关键节点 / 单据 -->
    <el-card shadow="never" class="process-card">
      <div class="process-head">
        <div class="process-title">
          <strong>{{ currentStage.name }}</strong>
          <span>对应全流程业务泳道</span>
        </div>
        <div class="node-list">
          <span class="node-label">关键节点</span>
          <el-tag
            v-for="node in currentStage.keyNodes"
            :key="node"
            size="small"
            type="warning"
            effect="dark"
          >
            {{ node }}
          </el-tag>
        </div>
      </div>
      <div class="swimlane">
        <div
          v-for="dept in currentStage.process.depts"
          :key="dept.name"
          class="lane"
          :class="deptClass(dept.name)"
        >
          <div class="lane-name">
            <strong>{{ dept.name }}</strong>
            <small>{{ dept.org }}</small>
          </div>
          <div class="lane-actions">
            <span v-for="action in dept.actions" :key="action" class="action-chip">{{ action }}</span>
          </div>
        </div>
      </div>
      <div class="doc-row">
        <span class="node-label">关联单据</span>
        <span v-for="doc in currentStage.process.docs" :key="doc" class="doc-chip">{{ doc }}</span>
      </div>
    </el-card>

    <el-card shadow="never" class="chain-card">
      <div class="chain-head">
        <div>
          <div class="chain-title">{{ currentStage.name }} · 阶段单据</div>
          <div class="chain-sub">订单号 → 材料号 → 炉次号 → 板坯号 → 卷号 → 库位号 → 运单号</div>
        </div>
        <el-space wrap>
          <el-input v-model="keyword" clearable placeholder="在当前列表中搜索" style="width: 240px" />
          <el-button type="primary" @click="keyword = keyword.trim()">查询</el-button>
        </el-space>
      </div>
    </el-card>

    <el-row :gutter="16">
      <el-col :lg="20" :xs="24">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <div class="title-wrap">
                <span>物料追踪清单</span>
                <span class="source-label">数据源于</span>
                <div class="source-list">
                  <el-tooltip
                    v-for="item in currentStage.sources"
                    :key="item.name"
                    :content="`来源：${item.owner}`"
                    placement="top"
                  >
                    <span class="source-chip" :class="ownerClass(item.owner)">{{ item.name }}</span>
                  </el-tooltip>
                </div>
              </div>
              <span class="hint">当前：{{ currentStage.name }}</span>
            </div>
          </template>
          <el-table
            :data="filteredList"
            stripe
            highlight-current-row
            @current-change="onSelectRow"
          >
            <el-table-column
              v-for="col in currentStage.columns"
              :key="col.prop"
              :prop="col.prop"
              :label="col.label"
              :min-width="col.minWidth"
              :width="col.width"
              :fixed="col.prop === 'status' ? 'right' : false"
            >
              <template v-if="col.prop === 'status'" #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :lg="4" :xs="24">
        <el-card shadow="never" class="detail-card">
          <template #header>
            <span>流程进度</span>
          </template>
          <template v-if="current">
            <div class="detail-title">{{ current.goods || currentStage.name }}</div>
            <div class="detail-meta">
              {{ current.customer || current.orderNo || '—' }}
              <template v-if="current.spec"> · {{ current.spec }}</template>
              <template v-if="current.ton"> · {{ current.ton }} 吨</template>
            </div>
            <el-steps direction="vertical" :active="selectedStage" finish-status="success" class="detail-steps">
              <el-step
                v-for="stage in store.trackingStages"
                :key="stage.key"
                :title="stage.name"
                :description="stage.sub"
              />
            </el-steps>
          </template>
          <el-empty v-else description="点击列表查看流程位置" :image-size="72" />
        </el-card>
      </el-col>
    </el-row>
  </ModulePage>
</template>

<script>
import { computed, ref, watch } from 'vue'
import ModulePage from '../../components/ModulePage.vue'
import { useLogisticsStore } from '../../stores/logistics'

export default {
  name: 'Tracking',
  components: { ModulePage },
  setup() {
    const store = useLogisticsStore()
    const keyword = ref('')
    const selectedStage = ref(1)
    const current = ref(null)

    const currentStage = computed(
      () => store.trackingStages.find((item) => item.key === selectedStage.value) || store.trackingStages[0],
    )

    const filteredList = computed(() => {
      const list = currentStage.value.list || []
      const key = keyword.value.trim()
      if (!key) return list
      return list.filter((row) =>
        Object.values(row).some((value) => String(value).toLowerCase().includes(key.toLowerCase())),
      )
    })

    const selectStage = (key) => {
      selectedStage.value = key
      keyword.value = ''
    }

    watch(
      currentStage,
      (stage) => {
        current.value = stage.list?.[0] || null
      },
      { immediate: true },
    )

    const statusType = (status) => {
      if (['已通过', '已下发', '已产出', '已卷取', '已精整', '已完成', '合格'].includes(status)) return 'success'
      if (['评审中', '计划中', '待发运', '待装车'].includes(status)) return 'info'
      if (['执行中', '浇铸中', '运输中', '在库待发'].includes(status)) return 'warning'
      return 'primary'
    }

    const onSelectRow = (row) => {
      if (row) current.value = row
    }

    const ownerClass = (owner) => {
      if (owner === '鞍钢自有系统') return 'owner-angang'
      if (owner === '鞍信公司') return 'owner-anxin'
      if (owner === '德邻陆港') return 'owner-delin'
      return ''
    }

    const deptClass = (name) => {
      if (name.includes('生产')) return 'lane-prod'
      if (name.includes('制造')) return 'lane-mfg'
      if (name.includes('销售')) return 'lane-sales'
      return ''
    }

    return {
      store,
      keyword,
      selectedStage,
      currentStage,
      current,
      filteredList,
      selectStage,
      statusType,
      onSelectRow,
      ownerClass,
      deptClass,
    }
  },
}
</script>

<style scoped>
.stage-bar {
  display: flex;
  overflow-x: auto;
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 8px;
}

.stage-item {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 120px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 4px;
}

.stage-item:hover,
.stage-item.active {
  background: #f5f7fa;
}

.stage-item.active .stage-text strong {
  color: #c41e3a;
}

.stage-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.25;
}

.stage-text strong {
  font-size: 14px;
  color: #1f2a37;
}

.stage-text span {
  font-size: 12px;
  color: #909399;
}

.stage-arrow {
  margin-left: auto;
  color: #c0c4cc;
  font-size: 18px;
  padding-left: 8px;
}

.process-card {
  margin-top: 0;
}

.process-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.process-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.process-title strong {
  font-size: 15px;
  color: #1f2a37;
}

.process-title span,
.node-label {
  font-size: 12px;
  color: #909399;
}

.node-list,
.doc-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.swimlane {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lane {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-left-width: 4px;
  background: #fafbfc;
}

.lane-prod {
  border-left-color: #3b82f6;
}

.lane-mfg {
  border-left-color: #22c55e;
}

.lane-sales {
  border-left-color: #f59e0b;
}

.lane-name {
  min-width: 130px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lane-name strong {
  font-size: 13px;
  color: #1f2a37;
}

.lane-name small {
  font-size: 12px;
  color: #909399;
}

.lane-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.action-chip,
.doc-chip {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  background: #fff;
  border: 1px solid #e5eaf0;
  color: #303133;
}

.doc-row {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}

.doc-chip {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}

.chain-card {
  margin-top: 0;
}

.chain-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.chain-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2a37;
}

.chain-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.source-label {
  font-size: 13px;
  color: #909399;
  font-weight: 400;
}

.source-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.source-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 12px;
  line-height: 1.5;
  cursor: default;
  transition: box-shadow 0.15s ease, background 0.15s ease;
}

.source-chip:hover {
  box-shadow: 0 0 0 1px currentColor;
}

.source-chip.owner-angang {
  color: #1d4ed8;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.source-chip.owner-anxin {
  color: #0369a1;
  background: #f0f9ff;
  border-color: #bae6fd;
}

.source-chip.owner-delin {
  color: #15803d;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.hint {
  font-size: 12px;
  color: #909399;
  font-weight: 400;
}

.detail-card {
  margin-bottom: 16px;
}

.detail-card :deep(.el-card__body) {
  padding: 12px;
}

.detail-card :deep(.el-step__title) {
  font-size: 13px;
  line-height: 1.3;
}

.detail-card :deep(.el-step__description) {
  font-size: 12px;
  padding-right: 0;
}

.detail-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2a37;
}

.detail-meta {
  margin: 6px 0 12px;
  font-size: 12px;
  color: #909399;
  word-break: break-all;
}

.detail-steps {
  margin-top: 4px;
}
</style>

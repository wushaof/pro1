<template>
  <ModulePage v-if="board" :title="board.title" :desc="board.desc">
    <el-row :gutter="12">
      <el-col :span="8" v-for="item in board.kpis" :key="item.label">
        <div class="kpi">
          <div class="label">{{ item.label }}</div>
          <div class="value">{{ item.value }}<small>{{ item.unit }}</small></div>
        </div>
      </el-col>
    </el-row>

    <el-card v-if="board.bars" shadow="never" header="成本构成">
      <div v-for="bar in board.bars" :key="bar.label" class="bar">
        <span>{{ bar.label }}</span>
        <el-progress :percentage="bar.value" :stroke-width="10" :show-text="false" color="#c41e3a" />
        <em>{{ bar.text }}</em>
      </div>
    </el-card>

    <el-card v-if="board.target" shadow="never">
      <div class="target">
        <div>
          <div class="label">集成到</div>
          <strong>{{ board.target }}</strong>
        </div>
        <div class="checks">
          <el-tag v-for="item in board.checks" :key="item" effect="plain">{{ item }}</el-tag>
        </div>
      </div>
    </el-card>

    <div v-if="board.systems" class="grid">
      <div v-for="sys in board.systems" :key="sys.name" class="sys">
        <div>
          <strong>{{ sys.name }}</strong>
          <p>{{ sys.note }}</p>
        </div>
        <el-tag size="small" :type="linkTag(sys.status)">{{ sys.status }}</el-tag>
      </div>
    </div>
  </ModulePage>
  <el-empty v-else description="没有找到这个功能" />
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ModulePage from '../../components/ModulePage.vue'
import { linkBoards, linkTag } from '../../config/linkBoards'

export default {
  name: 'LinkBoard',
  components: { ModulePage },
  setup() {
    const route = useRoute()
    const board = computed(() => linkBoards[route.params.id] || null)
    return { board, linkTag }
  },
}
</script>

<style scoped>
.kpi {
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.label { font-size: 12px; color: #909399; }
.value { margin-top: 6px; font-size: 22px; font-weight: 700; color: #c41e3a; }
.value small { margin-left: 4px; font-size: 12px; font-weight: 400; color: #909399; }
.bar {
  display: grid;
  grid-template-columns: 120px 1fr 64px;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}
.bar em { font-style: normal; color: #606266; }
.target { display: flex; justify-content: space-between; gap: 16px; align-items: center; flex-wrap: wrap; }
.target strong { font-size: 18px; color: #1f2a37; }
.checks { display: flex; flex-wrap: wrap; gap: 8px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.sys {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 12px 14px;
}
.sys p { margin: 4px 0 0; color: #909399; font-size: 12px; }
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
}
</style>

<template>
  <ModulePage
    title="业务全景"
    desc="从原料进厂到成品外发的业务骨架，供需求梳理对照。点顶部菜单进入各专题原型。"
  >
    <el-row :gutter="16">
      <el-col :lg="14" :xs="24">
        <el-card shadow="never" header="端到端物流链路">
          <el-timeline>
            <el-timeline-item
              v-for="item in logisticsChain"
              :key="item.stage"
              :timestamp="item.stage"
              placement="top"
            >
              <div v-for="line in item.items" :key="line" class="line">{{ line }}</div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :lg="10" :xs="24">
        <el-card shadow="never" header="外发方式">
          <div class="mode truck">
            <strong>汽运</strong>
            <p>直送 / 物流园外发 / 自提 / 集港</p>
          </div>
          <div class="mode rail">
            <strong>铁运</strong>
            <p>铁路发运 · 最远覆盖长江以北</p>
          </div>
          <div class="mode water">
            <strong>水运 / 港口</strong>
            <p>自有港（鞍钢营口港务）· 辽港营口港 · 船运多覆盖长江以南</p>
          </div>
          <el-divider />
          <div class="hint">
            销售管理系统下发运计划（计划量）→ 物流运输系统派车执行。成品库积压会导致账面库存大于可发运量。
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="mt" header="七项专题（点击进入）">
      <el-row :gutter="12">
        <el-col :lg="8" :sm="12" :xs="24" v-for="m in modules" :key="m.path">
          <div class="mod" @click="$router.push(m.path)">
            <strong>{{ m.title }}</strong>
            <p>{{ m.desc }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </ModulePage>
</template>

<script>
import ModulePage from '../../components/ModulePage.vue'
import { logisticsChain } from '../../config/domain'
import { moduleMenus } from '../../config/modules'

export default {
  name: 'Overview',
  components: { ModulePage },
  setup() {
    return {
      logisticsChain,
      modules: moduleMenus.filter((m) => m.path !== '/overview'),
    }
  },
}
</script>

<style scoped>
.line {
  font-size: 13px;
  color: #303133;
  margin: 2px 0;
}
.mode {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-left: 4px solid #c41e3a;
  background: #fff7ed;
}
.mode.rail {
  border-left-color: #2563eb;
  background: #eff6ff;
}
.mode.water {
  border-left-color: #059669;
  background: #ecfdf5;
}
.mode strong {
  color: #1f2a37;
}
.mode p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #606266;
}
.hint {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}
.mt {
  margin-top: 0;
}
.mod {
  border: 1px solid #ebeef5;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  background: #fff;
  min-height: 88px;
}
.mod:hover {
  border-color: #c41e3a;
}
.mod strong {
  font-size: 14px;
  color: #1f2a37;
}
.mod p {
  margin: 6px 0 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>

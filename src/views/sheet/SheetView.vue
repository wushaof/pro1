<template>
  <ModulePage v-if="page" :title="page.title" :desc="page.purpose">
    <el-alert v-if="page.rule" :title="page.rule" type="warning" :closable="false" show-icon />
    <el-card shadow="never">
      <template #header>
        <div class="head">
          <span>{{ page.tableTitle }}</span>
          <el-tag size="small" effect="plain">{{ page.block }}</el-tag>
        </div>
      </template>
      <el-table :data="page.rows" stripe>
        <el-table-column
          v-for="col in page.columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          min-width="110"
          show-overflow-tooltip
        />
      </el-table>
    </el-card>
  </ModulePage>
  <el-empty v-else description="这个菜单还没有页面" />
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ModulePage from '../../components/ModulePage.vue'
import { sheets } from '../../config/sheets'

export default {
  name: 'SheetView',
  components: { ModulePage },
  setup() {
    const route = useRoute()
    const page = computed(() => sheets[route.params.id] || null)
    return { page }
  },
}
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
</style>

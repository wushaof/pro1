<template>
  <div v-if="systems.length" class="strip">
    <span class="label">来源系统</span>
    <div class="list">
      <span v-for="item in systems" :key="item.name" class="item">
        <b>{{ item.name }}</b>
        <el-tag size="small" :type="linkTag(item.status)" effect="plain">{{ item.status }}</el-tag>
        <em>{{ item.note }}</em>
      </span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { linkBoards, linkTag } from '../config/linkBoards'

export default {
  name: 'SourcePanel',
  props: {
    board: { type: String, required: true },
  },
  setup(props) {
    const systems = computed(() => linkBoards[props.board]?.systems || [])
    return { systems, linkTag }
  },
}
</script>

<style scoped>
.strip {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 10px 14px;
}
.label {
  flex-shrink: 0;
  font-size: 12px;
  color: #909399;
  line-height: 24px;
}
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}
.item b {
  font-weight: 600;
  color: #1f2a37;
}
.item em {
  font-style: normal;
  color: #909399;
}
</style>

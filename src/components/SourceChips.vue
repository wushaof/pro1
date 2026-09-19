<template>
  <div class="source-bar">
    <span class="source-label">数据源于</span>
    <div class="source-list">
      <el-tooltip
        v-for="item in sources"
        :key="item.name"
        :content="`来源：${item.owner}`"
        placement="top"
      >
        <span class="source-chip" :class="ownerClass(item.owner)">{{ item.name }}</span>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SourceChips',
  props: {
    sources: { type: Array, default: () => [] },
  },
  setup() {
    const ownerClass = (owner) => {
      if (owner === '鞍钢自有系统') return 'owner-angang'
      if (owner === '鞍信公司') return 'owner-anxin'
      if (owner === '德邻陆港') return 'owner-delin'
      if (owner === '码头管理单位') return 'owner-port'
      return ''
    }
    return { ownerClass }
  },
}
</script>

<style scoped>
.source-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.source-label {
  font-size: 13px;
  color: #909399;
}

.source-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.source-chip {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 12px;
  line-height: 1.5;
  cursor: default;
}

.source-chip:hover {
  box-shadow: 0 0 0 1px currentColor;
}

.owner-angang {
  color: #1d4ed8;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.owner-anxin {
  color: #0369a1;
  background: #f0f9ff;
  border-color: #bae6fd;
}

.owner-delin {
  color: #15803d;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.owner-port {
  color: #b45309;
  background: #fffbeb;
  border-color: #fde68a;
}
</style>

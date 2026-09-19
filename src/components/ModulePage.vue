<template>
  <div class="module-page">
    <div class="page-head">
      <h2>{{ title }}</h2>
      <p>{{ desc }}</p>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ModulePage',
  props: {
    title: { type: String, required: true },
    desc: { type: String, default: '' },
  },
}
</script>

<style scoped>
.module-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #ebeef5;
}

.page-head h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #1f2a37;
}

.page-head p {
  margin: 0;
  color: #606266;
  font-size: 13px;
}
</style>

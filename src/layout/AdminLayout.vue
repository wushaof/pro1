<template>
  <el-container class="layout">
    <el-header class="header" height="64px">
      <div class="brand">
        <el-icon :size="22"><OfficeBuilding /></el-icon>
        <div class="brand-text">
          <strong>鞍钢物流智能平台</strong>
        </div>
      </div>

      <el-menu
        mode="horizontal"
        :ellipsis="false"
        :default-active="activeMenu"
        class="top-menu"
        router
      >
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          {{ item.label }}
        </el-menu-item>
      </el-menu>

      <div class="header-right">
        <span class="user-name">{{ userStore.profile.name }}</span>
        <el-dropdown @command="onCommand">
          <el-avatar :size="32" class="avatar">{{ userStore.profile.name.slice(0, 1) }}</el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'

const menus = [
  { path: '/overview', label: '业务全景' },
  { path: '/tracking', label: '全程可视化追踪' },
  { path: '/delivery-forecast', label: '产品准发预测' },
  { path: '/vehicle-dispatch', label: '车辆智能调度' },
  { path: '/outbound-plan', label: '出厂计划智能编制' },
  { path: '/terminal-dispatch', label: '码头智能调度' },
  { path: '/vehicle-loading', label: '车辆智能配载' },
  { path: '/logistics-cockpit', label: '物流驾驶舱' },
]

export default {
  name: 'AdminLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const activeMenu = computed(() => route.path)

    const onCommand = async (command) => {
      if (command === 'logout') {
        await ElMessageBox.confirm('确定退出当前账号？', '提示', { type: 'warning' })
        userStore.logout()
        router.push('/login')
      }
    }

    return { menus, userStore, activeMenu, onCommand }
  },
}
</script>

<style scoped>
.layout {
  height: 100%;
  background: #f3f5f8;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  background: #1f2a37;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  min-width: 180px;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-text strong {
  font-size: 15px;
}

.brand-text span {
  font-size: 12px;
  color: #94a3b8;
}

.top-menu {
  flex: 1;
  min-width: 0;
  background: transparent;
  border-bottom: none;
  height: 64px;
}

.top-menu :deep(.el-menu-item) {
  color: #cbd5e1;
  border-bottom: 2px solid transparent !important;
  height: 64px;
  line-height: 64px;
  padding: 0 10px;
  font-size: 12px;
}

.top-menu :deep(.el-menu-item:hover),
.top-menu :deep(.el-menu-item.is-active) {
  background: transparent !important;
  color: #fff !important;
  border-bottom-color: #c41e3a !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.user-name {
  color: #e2e8f0;
  font-size: 13px;
}

.avatar {
  background: #c41e3a;
  cursor: pointer;
}

.main {
  padding: 16px;
}
</style>

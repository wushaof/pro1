<template>
  <el-container class="layout" direction="vertical">
    <el-header class="header" height="56px">
      <div class="brand" @click="router.push('/overview')">
        <el-icon :size="20"><OfficeBuilding /></el-icon>
        <strong>鞍钢物流智能平台</strong>
      </div>
      <el-menu
        mode="horizontal"
        :ellipsis="true"
        :key="currentGroup.id"
        :default-active="currentGroup.id"
        class="top-menu"
        @select="onTopSelect"
      >
        <el-menu-item v-for="group in navGroups" :key="group.id" :index="group.id">
          {{ group.title }}
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

    <el-container class="body">
      <el-aside v-if="showAside" width="200px" class="aside">
        <el-menu :default-active="route.path" class="side-menu" router>
          <el-menu-item v-for="item in sideItems" :key="item.path" :index="item.path">
            {{ item.title }}
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'
import { findNavItem, navGroups } from '../config/nav'

export default {
  name: 'AdminLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const currentGroup = computed(() => findNavItem(route.path)?.group || navGroups[0])
    const sideItems = computed(() => currentGroup.value.children)
    const showAside = computed(() => sideItems.value.length > 1)

    const onTopSelect = (id) => {
      const group = navGroups.find((g) => g.id === id)
      if (group) router.push(group.children[0].path)
    }

    const onCommand = async (command) => {
      if (command === 'logout') {
        await ElMessageBox.confirm('确定退出当前账号？', '提示', { type: 'warning' })
        userStore.logout()
        router.push('/login')
      }
    }

    return {
      navGroups,
      currentGroup,
      sideItems,
      showAside,
      userStore,
      route,
      router,
      onTopSelect,
      onCommand,
    }
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
  gap: 8px;
  padding: 0 12px;
  background: #1f2a37;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
}

.brand strong {
  font-size: 14px;
  white-space: nowrap;
}

.top-menu {
  flex: 1;
  min-width: 0;
  background: transparent;
  border-bottom: none;
  height: 56px;
}

.top-menu :deep(.el-menu-item) {
  color: #cbd5e1;
  border-bottom: 2px solid transparent !important;
  height: 56px;
  line-height: 56px;
  padding: 0 10px;
  font-size: 13px;
}

.top-menu :deep(.el-menu-item:hover),
.top-menu :deep(.el-menu-item.is-active) {
  background: transparent !important;
  color: #fff !important;
  border-bottom-color: #c41e3a !important;
}

.top-menu :deep(.el-sub-menu__title) {
  color: #cbd5e1;
  height: 56px;
  line-height: 56px;
  border-bottom: none;
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

.body {
  min-height: 0;
}

.aside {
  background: #fff;
  border-right: 1px solid #e5e7eb;
}

.side-menu {
  border-right: none;
}

.side-menu :deep(.el-menu-item) {
  height: 42px;
  line-height: 42px;
  font-size: 13px;
}

.side-menu :deep(.el-menu-item.is-active) {
  color: #c41e3a;
  background: #fff1f2;
}

.main {
  padding: 16px;
  overflow: auto;
}
</style>

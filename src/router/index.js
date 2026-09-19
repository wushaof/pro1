import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import AdminLayout from '../layout/AdminLayout.vue'
import Login from '../views/login/Login.vue'
import Overview from '../views/modules/Overview.vue'
import Tracking from '../views/modules/Tracking.vue'
import DeliveryForecast from '../views/modules/DeliveryForecast.vue'
import VehicleDispatch from '../views/modules/VehicleDispatch.vue'
import OutboundPlan from '../views/modules/OutboundPlan.vue'
import TerminalDispatch from '../views/modules/TerminalDispatch.vue'
import VehicleLoading from '../views/modules/VehicleLoading.vue'
import LogisticsCockpit from '../views/modules/LogisticsCockpit.vue'
import DigitalTwin from '../views/modules/DigitalTwin.vue'
import CostSettle from '../views/modules/CostSettle.vue'
import CostAnalysis from '../views/modules/CostAnalysis.vue'
import SheetView from '../views/sheet/SheetView.vue'
import LinkBoard from '../views/link/LinkBoard.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/overview',
    children: [
      { path: 'overview', name: 'Overview', component: Overview, meta: { title: '业务全景' } },
      { path: 'tracking', name: 'Tracking', component: Tracking, meta: { title: '全程可视化追踪' } },
      { path: 'cost-settle', name: 'CostSettle', component: CostSettle, meta: { title: '成本线上管理' } },
      { path: 'cost-analysis', name: 'CostAnalysis', component: CostAnalysis, meta: { title: '成本分析' } },
      { path: 'delivery-forecast/:tab?', name: 'DeliveryForecast', component: DeliveryForecast, meta: { title: '产品准发预测' } },
      { path: 'vehicle-dispatch/:tab?', name: 'VehicleDispatch', component: VehicleDispatch, meta: { title: '车辆智能调度' } },
      { path: 'outbound-plan/:tab?', name: 'OutboundPlan', component: OutboundPlan, meta: { title: '出厂计划智能编制' } },
      { path: 'terminal-dispatch', name: 'TerminalDispatch', component: TerminalDispatch, meta: { title: '码头智能调度' } },
      { path: 'vehicle-loading/:tab?', name: 'VehicleLoading', component: VehicleLoading, meta: { title: '车辆智能配载' } },
      { path: 'logistics-cockpit', name: 'LogisticsCockpit', component: LogisticsCockpit, meta: { title: '发运跟踪' } },
      { path: 'digital-twin', name: 'DigitalTwin', component: DigitalTwin, meta: { title: '基地库区' } },
      { path: 'sheet/:id', name: 'Sheet', component: SheetView, meta: { title: '功能页' } },
      { path: 'link/:id', name: 'Link', component: LinkBoard, meta: { title: '对接' } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/overview' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!to.meta.public && !userStore.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'Login' && userStore.isLoggedIn) {
    return { name: 'Overview' }
  }
  return true
})

export default router

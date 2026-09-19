<template>
  <ModulePage :title="pageTitle" :desc="pageDesc">
    <SourcePanel board="ld-data" />

    <template v-if="tab === 'rail'">
      <el-row :gutter="12">
        <el-col :lg="10" :xs="24">
          <el-card shadow="never" header="待拼订单">
            <el-table :data="railOpen" stripe @selection-change="onRailSelect">
              <el-table-column type="selection" width="42" />
              <el-table-column prop="id" label="订单" width="110" />
              <el-table-column prop="goods" label="货" width="80" />
              <el-table-column prop="ton" label="吨" width="60" />
              <el-table-column prop="station" label="到站" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :lg="14" :xs="24">
          <el-card shadow="never" header="列车调度车皮">
            <div v-for="wagon in wagons" :key="wagon.no" class="wagon" :class="{ off: wagon.status !== '已兑现' }">
              <div class="line">
                <div>
                  <strong>{{ wagon.no }}</strong>
                  <p>{{ wagon.zone }} · {{ wagon.station }} · 标重 {{ wagon.mark }} 吨</p>
                </div>
                <el-tag size="small" :type="wagon.status === '已兑现' ? 'success' : 'danger'">{{ wagon.status }}</el-tag>
              </div>
              <el-progress :percentage="Math.min(100, Math.round((wagon.used / wagon.mark) * 100))" :stroke-width="8" color="#c41e3a" />
              <p class="sub">已装 {{ wagon.used }} 吨 · {{ wagon.orders.join('、') || '空车' }}</p>
              <div class="ops">
                <el-button size="small" type="primary" :disabled="wagon.status !== '已兑现'" @click="loadWagon(wagon)">
                  拼入选中订单
                </el-button>
                <el-button size="small" :disabled="!wagon.orders.length || wagon.sent" @click="sendWagon(wagon)">
                  {{ wagon.sent ? '已交作业' : '提交铁运作业' }}
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <template v-else>
      <el-row :gutter="12">
        <el-col :lg="10" :xs="24">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>待配订单</span>
                <el-button type="primary" size="small" @click="mergeOrders">合并配载</el-button>
              </div>
            </template>
            <el-table :data="openOrders" stripe @selection-change="onTruckSelect">
              <el-table-column type="selection" width="42" :selectable="(row) => !row.locked" />
              <el-table-column prop="id" label="订单" width="110" />
              <el-table-column prop="goods" label="货" width="80" />
              <el-table-column prop="ton" label="吨" width="60" />
              <el-table-column prop="direction" label="流向" min-width="100" />
              <el-table-column prop="date" label="交期" width="70" />
              <el-table-column label="拼单" width="70">
                <template #default="{ row }">{{ row.mix ? '可拼' : '不可拼' }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :lg="14" :xs="24">
          <el-card shadow="never" header="装车顺序">
            <el-empty v-if="!batches.length" description="勾选同流向、同交期的订单后合并" />
            <div v-for="batch in batches" :key="batch.id" class="batch">
              <div class="line">
                <strong>{{ batch.direction }} · {{ batch.date }}</strong>
                <span>{{ batch.orders.join('、') }} · {{ batch.kind }}</span>
              </div>
              <div v-for="(truck, index) in batch.trucks" :key="truck.plate" class="truck">
                <div>
                  <b>第 {{ index + 1 }} 车 {{ truck.plate }}</b>
                  <p>{{ truck.ton }} 吨 · {{ truck.goods }}</p>
                </div>
                <el-tag size="small" :type="truckTag(truck.status)">{{ truck.status }}</el-tag>
                <div class="ops">
                  <el-button v-if="truck.status === '待装'" size="small" type="primary" :disabled="index !== activeIndex(batch)" @click="startTruck(batch, index)">
                    开始装车
                  </el-button>
                  <el-button v-if="truck.status === '装车中'" size="small" type="primary" @click="finishTruck(batch, index)">
                    本车装完
                  </el-button>
                  <span v-if="truck.status === '坪内等待'" class="wait">等前车吊完</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </ModulePage>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ModulePage from '../../components/ModulePage.vue'
import SourcePanel from '../../components/SourcePanel.vue'
import { findNavItem } from '../../config/nav'

const plates = ['辽B·A2036', '辽B·E2208', '辽B·C8812', '辽B·F0911', '辽B·D1190']

export default {
  name: 'VehicleLoading',
  components: { ModulePage, SourcePanel },
  setup() {
    const route = useRoute()
    const tab = ref(route.params.tab === 'rail' ? 'rail' : 'merge')
    watch(
      () => route.params.tab,
      (value) => {
        tab.value = value === 'rail' ? 'rail' : 'merge'
      },
    )

    const orders = ref([
      { id: 'SO-15018', goods: '热轧卷', kind: '钢卷', ton: 28.6, direction: '鲅鱼圈集港', date: '09-19', mix: true, cap: 35 },
      { id: 'SO-15022', goods: '热轧卷', kind: '钢卷', ton: 22.4, direction: '鲅鱼圈集港', date: '09-19', mix: true, cap: 35 },
      { id: 'SO-16022', goods: '盒板', kind: '盒板', ton: 35.4, direction: '营口港', date: '09-19', mix: true, cap: 20 },
      { id: 'SO-14007', goods: '冷轧卷', kind: '钢卷', ton: 24.2, direction: '大连直送', date: '09-19', mix: false, cap: 35 },
      { id: 'SO-14011', goods: '冷轧卷', kind: '钢卷', ton: 16, direction: '大连直送', date: '09-20', mix: true, cap: 35 },
    ])
    const picked = ref([])
    const batches = ref([])
    let plateAt = 0
    let batchNo = 1

    const openOrders = computed(() => orders.value.filter((item) => !item.used))

    const onTruckSelect = (rows) => {
      picked.value = rows
    }

    const mergeOrders = () => {
      const rows = picked.value.filter((item) => !item.used)
      if (!rows.length) {
        ElMessage.warning('先勾选订单')
        return
      }
      if (rows.some((item) => !item.mix) && rows.length > 1) {
        ElMessage.error('有订单客户指定不可拼，不能和其他单合并')
        return
      }
      const direction = rows[0].direction
      const date = rows[0].date
      const kind = rows[0].kind
      if (rows.some((item) => item.direction !== direction || item.date !== date)) {
        ElMessage.error('流向或交期不一致，不能合并')
        return
      }
      if (rows.some((item) => item.kind !== kind)) {
        ElMessage.error('钢卷和盒板不能混装')
        return
      }
      const cap = rows[0].cap
      const chunks = []
      rows.forEach((item) => {
        let left = item.ton
        while (left > 0.05) {
          const ton = Math.round(Math.min(cap, left) * 10) / 10
          chunks.push({ goods: item.goods, ton, order: item.id })
          left = Math.round((left - ton) * 10) / 10
        }
        item.used = true
      })
      const trucks = []
      let current = null
      chunks.forEach((chunk) => {
        if (!current || current.ton + chunk.ton > cap + 0.05) {
          current = {
            plate: plates[plateAt % plates.length],
            ton: 0,
            goods: [],
            status: trucks.length ? '坪内等待' : '待装',
          }
          plateAt += 1
          trucks.push(current)
        }
        current.ton = Math.round((current.ton + chunk.ton) * 10) / 10
        current.goods.push(`${chunk.order} ${chunk.ton}吨`)
      })
      trucks.forEach((truck) => {
        truck.goods = truck.goods.join('，')
      })
      batches.value.unshift({
        id: `LD-${batchNo}`,
        direction,
        date,
        kind,
        orders: rows.map((item) => item.id),
        trucks,
      })
      batchNo += 1
      picked.value = []
      ElMessage.success(trucks.length > 1 ? `拆成 ${trucks.length} 车，先装第 1 车` : '已配成 1 车')
    }

    const activeIndex = (batch) => batch.trucks.findIndex((truck) => truck.status !== '已驶离')

    const startTruck = (batch, index) => {
      if (index !== activeIndex(batch)) return
      batch.trucks[index].status = '装车中'
    }

    const finishTruck = (batch, index) => {
      batch.trucks[index].status = '已驶离'
      const next = batch.trucks[index + 1]
      if (next) next.status = '待装'
      else ElMessage.success('本批车辆已全部装完')
    }

    const railOrders = ref([
      { id: 'SO-13005', goods: '线材', ton: 32, station: '沈阳' },
      { id: 'SO-13008', goods: '线材', ton: 26.2, station: '沈阳' },
      { id: 'SO-15030', goods: '热轧卷', ton: 40, station: '营口' },
      { id: 'SO-17031', goods: '热轧卷', ton: 28, station: '沈阳' },
    ])
    const railPicked = ref([])
    const wagons = ref([
      { no: 'C70-8821', zone: '分区3', station: '沈阳', mark: 70, used: 0, orders: [], status: '已兑现', sent: false },
      { no: 'C70-8830', zone: '分区7', station: '营口', mark: 70, used: 0, orders: [], status: '已兑现', sent: false },
      { no: '请车未兑现', zone: '分区1', station: '沈阳', mark: 70, used: 0, orders: [], status: '未兑现', sent: false },
    ])
    const railOpen = computed(() => railOrders.value.filter((item) => !item.used))
    const onRailSelect = (rows) => {
      railPicked.value = rows
    }
    const loadWagon = (wagon) => {
      if (wagon.status !== '已兑现') {
        ElMessage.error('车皮未兑现，不能配载')
        return
      }
      const rows = railPicked.value.filter((item) => !item.used)
      if (!rows.length) {
        ElMessage.warning('先勾选订单')
        return
      }
      if (rows.some((item) => item.station !== wagon.station)) {
        ElMessage.error('到站和车皮不一致，不能拼进这节车')
        return
      }
      const add = rows.reduce((sum, item) => sum + item.ton, 0)
      if (wagon.used + add > wagon.mark) {
        ElMessage.error(`超出标重 ${wagon.mark} 吨，拆开再拼`)
        return
      }
      rows.forEach((item) => {
        item.used = true
        wagon.orders.push(`${item.id} ${item.ton}吨`)
      })
      wagon.used = Math.round((wagon.used + add) * 10) / 10
      railPicked.value = []
      ElMessage.success(`已拼入 ${wagon.no}，利用率 ${Math.round((wagon.used / wagon.mark) * 100)}%`)
    }
    const sendWagon = (wagon) => {
      wagon.sent = true
      ElMessage.success(`${wagon.no} 已提交铁运作业`)
    }

    const pageTitle = computed(() => findNavItem(route.path)?.item.title || '多订单合并配载')
    const pageDesc = computed(() =>
      tab.value === 'rail'
        ? '同到站订单拼进已兑现车皮。对不上车皮号不能配载，拼完提交铁运作业。'
        : '勾选同流向、同交期订单后合并。一车装不下就拆成多车，第 1 车装完才叫下一车。',
    )
    const truckTag = (value) => ({ 装车中: 'primary', 坪内等待: 'warning', 待装: 'info', 已驶离: 'success' }[value] || 'info')

    return {
      tab,
      pageTitle,
      pageDesc,
      openOrders,
      batches,
      wagons,
      railOpen,
      onTruckSelect,
      mergeOrders,
      activeIndex,
      startTruck,
      finishTruck,
      onRailSelect,
      loadWagon,
      sendWagon,
      truckTag,
    }
  },
}
</script>

<style scoped>
.card-header, .line, .ops { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.line strong, .truck b { color: #1f2a37; }
.line p, .truck p, .sub { margin: 4px 0 0; color: #909399; font-size: 12px; }
.batch { padding: 12px 0; border-bottom: 1px solid #f0f2f5; }
.batch:last-child { border-bottom: none; }
.truck, .wagon { display: grid; gap: 8px; padding: 10px 0; border-top: 1px solid #f3f5f8; }
.wagon.off { opacity: 0.72; }
.wait { color: #d97706; font-size: 12px; }
</style>

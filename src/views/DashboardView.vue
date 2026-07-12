<script setup lang="ts">
import { useCaseStore } from '@/stores/caseStore'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'

const caseStore = useCaseStore()
const router = useRouter()

function goToOverview(id: string) {
  caseStore.setCurrentCase(id)
  router.push(`/case/${id}/overview`)
}
</script>

<template>
  <!-- 统计卡片 -->
  <div class="stat-cards">
    <StatCard
      :label="`${caseStore.activeCaseType === 'criminal' ? '刑事' : '行政'}在办案件`"
      :value="caseStore.currentList.length"
      change="↑12% 较上月"
      change-type="up"
      icon="📋"
      icon-class="blue"
    />
    <StatCard
      label="待审查卷宗"
      :value="caseStore.reviewingCount"
      change="↓5% 较上月"
      change-type="down"
      icon="⏳"
      icon-class="orange"
    />
    <StatCard
      label="审查完成"
      :value="caseStore.doneCount"
      change="↑8% 较上月"
      change-type="up"
      icon="✓"
      icon-class="green"
    />
    <StatCard
      label="发现风险"
      :value="caseStore.riskCount"
      change="新增12项"
      change-type="down"
      icon="⚠"
      icon-class="red"
      :value-suffix="'↑'"
      value-suffix-color="#FF4757"
    />
  </div>

  <!-- Tab 切换 -->
  <div class="card tab-bar">
    <div
      class="tab"
      :class="{ active: caseStore.activeCaseType === 'criminal' }"
      @click="caseStore.setCaseType('criminal')"
    >
      刑事案件
    </div>
    <div
      class="tab"
      :class="{ active: caseStore.activeCaseType === 'administrative' }"
      @click="caseStore.setCaseType('administrative')"
    >
      行政案件
    </div>
  </div>

  <!-- 案件列表 -->
  <div class="card">
    <el-table :data="caseStore.currentList" style="width: 100%" row-class-name="table-row">
      <el-table-column prop="id" label="案件编号" width="140">
        <template #default="{ row }">
          <span class="link">{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="案件名称" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          <el-tag type="primary" size="small">{{ row.type === 'criminal' ? '刑事' : '行政' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="pages" label="页数" width="60" />
      <el-table-column label="OCR状态" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.ocrStatus === 'done'" type="success" size="small">✓ 完成</el-tag>
          <template v-else-if="row.ocrStatus === 'parsing'">
            <el-tag type="warning" size="small">解析中</el-tag>
            <el-progress :percentage="row.ocrProgress || 0" :stroke-width="4" style="width:50px;display:inline-block;margin-left:4px;" />
          </template>
          <el-tag v-else-if="row.ocrStatus === 'failed'" type="danger" size="small">✗ 失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审查状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.reviewStatus === 'done'" type="success" size="small">已完成</el-tag>
          <el-tag v-else-if="row.reviewStatus === 'reviewing'" size="small">审查中</el-tag>
          <el-tag v-else type="info" size="small">-</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="风险" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.riskCount > 0" type="danger" size="small">⚠{{ row.riskCount }}</el-tag>
          <el-tag v-else type="success" size="small">✓</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="goToOverview(row.id)">审查</el-button>
          <el-button size="small" @click="goToOverview(row.id)">预览</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination layout="prev, pager, next" :total="caseStore.currentList.length" :page-size="10" small />
    </div>
  </div>

  <!-- 趋势图区域（占位） -->
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><span class="card-title">近30天审查量趋势</span></div>
      <div class="chart-placeholder">
        <div v-for="(v, i) in chartData" :key="i" class="chart-bar" :style="{ height: (v / 52 * 100) + '%' }" />
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">风险类型分布</span></div>
      <div class="risk-dist">
        <div class="risk-row"><span class="risk-dot danger" />程序问题 45% <span class="risk-num">15项</span></div>
        <el-progress :percentage="45" color="#FF4757" :stroke-width="6" />
        <div class="risk-row"><span class="risk-dot warning" />证据问题 30% <span class="risk-num">10项</span></div>
        <el-progress :percentage="30" color="#FF6B35" :stroke-width="6" />
        <div class="risk-row"><span class="risk-dot orange" />文书问题 25% <span class="risk-num">8项</span></div>
        <el-progress :percentage="25" color="#FFA502" :stroke-width="6" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const chartData = [3,5,8,12,10,15,18,14,20,22,19,25,28,24,30,27,32,35,30,33,38,36,40,42,39,45,48,43,50,52]
</script>

<style scoped lang="scss">
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.card {
  background: #162540;
  border: 1px solid #1E3A5F;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.tab-bar {
  display: flex;
  gap: 0;
  padding: 0;
  margin-bottom: 16px;
  border-bottom: 2px solid #1E3A5F;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  color: #5A7290;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 14px;
  transition: 0.2s;

  &:hover { color: #E8EDF5; }
  &.active { color: #00D4FF; border-bottom-color: #00D4FF; }
}

.link { color: #00D4FF; cursor: pointer; }

:deep(.table-row) {
  cursor: pointer;
  &:hover { background: #1C3050 !important; }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #1E3A5F;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
}

.chart-placeholder {
  height: 160px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding-top: 8px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #00D4FF, rgba(0,212,255,.1));
  border-radius: 2px 2px 0 0;
  min-width: 4px;
}

.risk-dist {
  padding: 8px 0;
}

.risk-row {
  display: flex;
  align-items: center;
  margin: 12px 0 4px;
  font-size: 13px;
  color: #E8EDF5;
}

.risk-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  &.danger { background: #FF4757; }
  &.warning { background: #FF6B35; }
  &.orange { background: #FFA502; }
}

.risk-num {
  margin-left: auto;
  color: #8FA4BE;
}
</style>

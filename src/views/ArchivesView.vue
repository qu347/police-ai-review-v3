<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCaseStore } from '@/stores/caseStore'
import { useRouter } from 'vue-router'

const store = useCaseStore()
const router = useRouter()
const searchText = ref('')
const filterType = ref<'all' | 'criminal' | 'administrative'>('all')

// ── 搜索过滤 ──
const filteredCases = computed(() => {
  let list = store.allCases
  if (filterType.value !== 'all') {
    list = list.filter((c) => c.type === filterType.value)
  }
  const kw = searchText.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (c) =>
        c.id.toLowerCase().includes(kw) ||
        c.name.toLowerCase().includes(kw),
    )
  }
  return list
})

// ── 预览抽屉 ──
const previewVisible = ref(false)
const previewCaseId = ref('')
const previewPage = ref(1)
const previewTotal = ref(45)

function openPreview(id: string) {
  previewCaseId.value = id
  previewPage.value = 1
  previewVisible.value = true
}
function prevPage() {
  if (previewPage.value > 1) previewPage.value--
}
function nextPage() {
  if (previewPage.value < previewTotal.value) previewPage.value++
}

// ── 审查跳转 ──
function goToReview(id: string) {
  store.setCurrentCase(id)
  router.push(`/case/${id}/overview`)
}
</script>

<template>
  <!-- ====== 搜索栏 ====== -->
  <div class="card" style="margin-bottom:16px;">
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <el-input v-model="searchText" placeholder="搜索案号/案件名称..." style="width:240px;" size="default" />
      <el-select v-model="filterType" placeholder="全部类型" style="width:120px;" size="default">
        <el-option label="全部类型" value="all" />
        <el-option label="刑事" value="criminal" />
        <el-option label="行政" value="administrative" />
      </el-select>
      <el-button type="primary">🔍 搜索</el-button>
      <el-button @click="router.push('/upload')">📤 上传新卷宗</el-button>
    </div>
  </div>

  <!-- ====== 案件表格 ====== -->
  <div class="card">
    <el-table :data="filteredCases" style="width:100%">
      <el-table-column prop="id" label="案号" width="140">
        <template #default="{ row }"><span class="link">{{ row.id }}</span></template>
      </el-table-column>
      <el-table-column prop="name" label="案件名称" />
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag size="small">{{ row.type === 'criminal' ? '刑事' : '行政' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="pages" label="页数" width="60" />
      <el-table-column label="OCR状态" width="130">
        <template #default="{ row }">
          <el-tag v-if="row.ocrStatus === 'done'" type="success" size="small">✓ 完成</el-tag>
          <template v-else-if="row.ocrStatus === 'parsing'">
            <el-tag type="warning" size="small">解析中</el-tag>
            <el-progress :percentage="row.ocrProgress || 0" :stroke-width="4" style="width:50px;display:inline-block;margin-left:4px;" />
          </template>
          <el-tag v-else type="danger" size="small">✗ 失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审查状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.reviewStatus === 'done'" type="success" size="small">已完成</el-tag>
          <el-tag v-else-if="row.reviewStatus === 'reviewing'" size="small">审查中</el-tag>
          <el-tag v-else type="info" size="small">待审查</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="风险" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.riskCount > 0" type="danger" size="small">⚠{{ row.riskCount }}</el-tag>
          <el-tag v-else type="success" size="small">✓</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="日期" width="110" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text type="primary" @click="openPreview(row.id)">📄 预览</el-button>
          <el-button size="small" type="primary" @click="goToReview(row.id)">审查</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination layout="prev, pager, next" :total="filteredCases.length" :page-size="10" small />
    </div>
  </div>

  <!-- ====== 预览抽屉 ====== -->
  <el-drawer
    v-model="previewVisible"
    title=""
    direction="rtl"
    size="520px"
    :with-header="false"
  >
    <div class="drawer-content">
      <div class="drawer-header">
        <span class="drawer-title">卷宗预览 — {{ previewCaseId }}</span>
        <el-button text @click="previewVisible = false">✕</el-button>
      </div>

      <!-- 图片预览区域 -->
      <div class="preview-canvas">
        <div class="preview-page-label">扫描件预览</div>
        <div class="preview-image-area">
          <div class="preview-mock">
            <div class="mock-header">XX市公安局</div>
            <div class="mock-title">立 案 决 定 书</div>
            <div class="mock-lines">
              <div class="mock-line w80" />
              <div class="mock-line w90" />
              <div class="mock-line w60" />
              <div class="mock-line w85" />
              <div class="mock-line w70" />
              <div class="mock-line w50" />
            </div>
            <div class="mock-seal">（公章）</div>
          </div>
        </div>

        <!-- 翻页 -->
        <div class="preview-nav">
          <el-button size="small" :disabled="previewPage <= 1" @click="prevPage">← 上一页</el-button>
          <span class="page-info">{{ previewPage }} / {{ previewTotal }}</span>
          <el-button size="small" :disabled="previewPage >= previewTotal" @click="nextPage">下一页 →</el-button>
        </div>
      </div>

      <!-- 目录 -->
      <div class="catalog">
        <div class="catalog-title">卷宗目录</div>
        <div class="catalog-list">
          <div class="catalog-item">1. 立案决定书 (P1-2)</div>
          <div class="catalog-item">2. 拘留证 (P3-4)</div>
          <div class="catalog-item missing">3. 逮捕证 — <span class="tag">缺失</span></div>
          <div class="catalog-item">4. 起诉意见书 (P5-8)</div>
          <div class="catalog-sub">　4.1 第一次讯问 (P9-17)</div>
          <div class="catalog-sub">　4.2 第二次讯问 (P18-27)</div>
          <div class="catalog-item">5. 证人证言 (P46-52)</div>
          <div class="catalog-item">6. 物证清单 (P53-55)</div>
          <div class="catalog-item">7. 鉴定意见 (P56-58)</div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; }
.link { color: #00D4FF; cursor: pointer; }
.pagination { display: flex; justify-content: center; margin-top: 16px; }

// ── 预览抽屉 ──
.drawer-content {
  color: #E8EDF5;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.drawer-title {
  font-size: 15px;
  font-weight: 600;
}

.preview-canvas {
  background: #0F1D30;
  border: 1px solid #1E3A5F;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.preview-page-label {
  font-size: 12px;
  color: #5A7290;
  margin-bottom: 12px;
}
.preview-image-area {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-mock {
  background: #f5f0e8;
  color: #1a1a1a;
  padding: 32px 28px;
  border-radius: 4px;
  width: 100%;
  max-width: 360px;
  font-size: 13px;
  line-height: 2;
}
.mock-header { text-align: center; font-size: 12px; color: #555; margin-bottom: 16px; }
.mock-title { text-align: center; font-size: 18px; font-weight: 700; letter-spacing: 4px; margin-bottom: 24px; }
.mock-lines { margin-bottom: 24px; }
.mock-line { height: 8px; background: #ccc; border-radius: 4px; margin-bottom: 10px; }
.w80 { width: 80%; } .w90 { width: 90%; } .w60 { width: 60%; } .w85 { width: 85%; } .w70 { width: 70%; } .w50 { width: 50%; }
.mock-seal { text-align: right; font-size: 14px; color: #c00; margin-top: 12px; }

.preview-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}
.page-info {
  font-size: 13px;
  color: #8FA4BE;
  min-width: 60px;
  text-align: center;
}

.catalog {
  background: #162540;
  border: 1px solid #1E3A5F;
  border-radius: 8px;
  padding: 14px;
}
.catalog-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #1E3A5F;
}
.catalog-list {
  font-size: 12px;
  line-height: 2.2;
  color: #8FA4BE;
}
.catalog-item { cursor: pointer; &:hover { color: #00D4FF; } }
.catalog-item.missing { color: #FF4757; }
.catalog-item.missing .tag { font-size: 10px; background: rgba(255,71,87,.2); padding: 1px 6px; border-radius: 8px; }
.catalog-sub { color: #5A7290; font-size: 11px; padding-left: 12px; }

// ── Element Plus Drawer 覆盖 ──
:deep(.el-drawer) {
  background: #101D33 !important;
}
:deep(.el-drawer__body) {
  padding: 20px;
}
</style>

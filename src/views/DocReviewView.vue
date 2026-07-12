<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCaseStore } from '@/stores/caseStore'

const route = useRoute()
const caseStore = useCaseStore()
const caseId = computed(() => (route.params.id as string) || 'A-2026-001')
const caseName = computed(() => caseStore.allCases.find((c) => c.id === caseId.value)?.name || '未知案件')

interface DocItem {
  name: string
  rule: string
  result: 'pass' | 'fail' | 'partial'
  detail: string
}

const tabs = ['回执书', '登记表', '通知书', '决定书', '笔录', '其他']
const activeTab = ref('回执书')

// 每个 Tab 对应的文书数据
const tabData: Record<string, DocItem[]> = {
  '回执书': [
    { name: '受案回执', rule: '应有办案人签名、单位公章', result: 'pass', detail: '信息完整，签名清晰' },
    { name: '立案回执', rule: '应在立案后3日内送达被害人', result: 'fail', detail: '送达日期为立案后第5日，超期2天' },
    { name: '送达回执', rule: '应有收件人签名、日期', result: 'partial', detail: '收件人签名区域模糊，无法辨认' },
  ],
  '登记表': [
    { name: '受案登记表', rule: '应完整填写案由、时间、地点、当事人信息', result: 'pass', detail: '信息填写完整' },
    { name: '立案登记表', rule: '应有审批人签名及日期', result: 'pass', detail: '审批信息完整' },
  ],
  '通知书': [
    { name: '拘留通知书', rule: '应在拘留后24h内送达家属并留存回执', result: 'fail', detail: '未查见拘留通知书回执' },
    { name: '鉴定意见通知书', rule: '应在收到鉴定意见后3日内告知当事人', result: 'pass', detail: '送达及时，签收完整' },
  ],
  '决定书': [
    { name: '立案决定书', rule: '应有案由、法律依据、承办人签名', result: 'pass', detail: '格式规范，内容完整' },
    { name: '拘留决定书', rule: '应载明拘留原因、法律依据、执行期限', result: 'pass', detail: '内容完整' },
    { name: '搜查决定书', rule: '应经县级以上公安机关负责人批准', result: 'partial', detail: '缺少批准人职务信息' },
  ],
  '笔录': [
    { name: '讯问笔录（一）', rule: '应记录告知权利、讯问起止时间、签名', result: 'pass', detail: '格式规范' },
    { name: '讯问笔录（二）', rule: '同上', result: 'partial', detail: '缺少讯问人签名' },
    { name: '讯问笔录（三）', rule: '同上', result: 'pass', detail: '格式规范' },
  ],
  '其他': [
    { name: '扣押决定书', rule: '应附扣押清单并注明物品特征', result: 'pass', detail: '清单完整' },
    { name: '发还清单', rule: '应有领受人签名及日期', result: 'pass', detail: '签收完整' },
  ],
}

const currentData = computed(() => tabData[activeTab.value] || [])

// ── 查看 / 溯源 ──
const previewVisible = ref(false)
const previewItem = ref<DocItem | null>(null)

function openPreview(item: DocItem) {
  previewItem.value = item
  previewVisible.value = true
}
</script>

<template>
  <h2 style="font-size:16px;margin-bottom:16px;">文书规则审查 — {{ caseId }} {{ caseName }}</h2>

  <div class="tab-bar">
    <span
      v-for="t in tabs" :key="t"
      class="tab" :class="{ active: activeTab === t }"
      @click="activeTab = t"
    >{{ t }}</span>
  </div>

  <div class="card">
    <el-table :data="currentData" style="width:100%">
      <el-table-column prop="name" label="文书名称" width="160" />
      <el-table-column prop="rule" label="规范要求" />
      <el-table-column label="审查结果" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.result === 'pass'" type="success" size="small">✓ 合规</el-tag>
          <el-tag v-else-if="row.result === 'fail'" type="danger" size="small">✗ 违规</el-tag>
          <el-tag v-else type="warning" size="small">⚠ 需注意</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="detail" label="详情" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button v-if="row.result !== 'pass'" size="small" type="primary" @click="openPreview(row)">溯源</el-button>
          <el-button v-else size="small" @click="openPreview(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 查看详情抽屉 -->
  <el-drawer v-model="previewVisible" title="" direction="rtl" size="500px" :with-header="false">
    <div class="drawer-content" v-if="previewItem">
      <div class="drawer-header">
        <span class="drawer-title">{{ previewItem.name }}</span>
        <el-button text @click="previewVisible = false">✕</el-button>
      </div>
      <div class="drawer-rule">📋 规范要求：{{ previewItem.rule }}</div>
      <div class="drawer-result" :class="previewItem.result">
        {{ previewItem.result === 'pass' ? '✓ 合规' : previewItem.result === 'fail' ? '✗ 违规' : '⚠ 需注意' }}
      </div>
      <div class="drawer-detail">{{ previewItem.detail }}</div>

      <!-- 原文预览 -->
      <div class="drawer-section">
        <div class="drawer-section-title">📄 文书原文</div>
        <div class="mock-doc">
          <div class="mock-doc-header">XX市公安局</div>
          <div class="mock-doc-title">{{ previewItem.name }}</div>
          <div class="mock-doc-lines">
            <div class="mock-line w90" />
            <div class="mock-line w70" />
            <div class="mock-line w85" />
            <div class="mock-line w60" />
            <div class="mock-line w80" />
          </div>
          <div class="mock-doc-seal">（公章）</div>
        </div>
      </div>

      <!-- 违规项显示整改建议 -->
      <div v-if="previewItem.result !== 'pass'" class="fix-suggest">
        <div class="fix-suggest-title">⚠ 整改建议</div>
        <div class="fix-suggest-text">
          {{ previewItem.result === 'fail' ? '建议办案单位补充或更正该文书，重新上传后系统将自动复核。' : '文书格式存在瑕疵，建议按要求完善后重新上传。' }}
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.tab-bar { display: flex; gap: 0; border-bottom: 2px solid #1E3A5F; margin-bottom: 16px; }
.tab { padding: 8px 16px; cursor: pointer; color: #5A7290; border-bottom: 2px solid transparent; margin-bottom: -2px; font-size: 13px; transition: .2s; &:hover { color: #E8EDF5; } &.active { color: #00D4FF; border-bottom-color: #00D4FF; } }
.card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; }

// 抽屉
.drawer-content { color: #E8EDF5; }
.drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.drawer-title { font-size: 15px; font-weight: 600; }
.drawer-rule { font-size: 13px; color: #8FA4BE; margin-bottom: 8px; }
.drawer-result { font-size: 12px; padding: 4px 10px; border-radius: 4px; display: inline-block; margin-bottom: 12px; font-weight: 600; }
.drawer-result.pass { background: rgba(46,213,115,.15); color: #2ED573; }
.drawer-result.fail { background: rgba(255,71,87,.15); color: #FF4757; }
.drawer-result.partial { background: rgba(255,107,53,.15); color: #FF6B35; }
.drawer-detail { font-size: 13px; color: #8FA4BE; margin-bottom: 16px; }

.drawer-section { margin: 16px 0; }
.drawer-section-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }

.mock-doc { background: #f5f0e8; color: #1a1a1a; padding: 24px 20px; border-radius: 4px; font-size: 13px; line-height: 2; }
.mock-doc-header { text-align: center; font-size: 12px; color: #555; margin-bottom: 12px; }
.mock-doc-title { text-align: center; font-size: 17px; font-weight: 700; letter-spacing: 3px; margin-bottom: 20px; }
.mock-doc-lines { margin-bottom: 16px; }
.mock-line { height: 8px; background: #ccc; border-radius: 4px; margin-bottom: 10px; }
.w90 { width: 90%; } .w70 { width: 70%; } .w85 { width: 85%; } .w60 { width: 60%; } .w80 { width: 80%; }
.mock-doc-seal { text-align: right; font-size: 14px; color: #c00; }

.fix-suggest { background: rgba(255,107,53,.08); border: 1px solid rgba(255,107,53,.2); border-radius: 8px; padding: 14px; margin-top: 12px; }
.fix-suggest-title { font-size: 13px; font-weight: 600; color: #FF6B35; margin-bottom: 6px; }
.fix-suggest-text { font-size: 12px; color: #8FA4BE; }

:deep(.el-drawer) { background: #101D33 !important; }
:deep(.el-drawer__body) { padding: 20px; }
</style>

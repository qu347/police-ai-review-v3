<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCaseStore } from '@/stores/caseStore'
import { elementCards as mockCards } from '@/services/mockData'
import { ElMessage } from 'element-plus'
import { useReviewStore } from '@/stores/reviewStore'
import { aiGateway } from '@/services/aiGateway'
import type { ElementCard, ExtractedElement } from '@/types'

const route = useRoute()
const caseStore = useCaseStore()
const reviewStore = useReviewStore()
const caseId = computed(() => (route.params.id as string) || 'A-2026-001')
const caseName = computed(() => caseStore.allCases.find((c) => c.id === caseId.value)?.name || '未知案件')

const expandedTitles = ref<Set<string>>(new Set())
const isExtracting = ref(false)
const cards = reactive<ElementCard[]>(JSON.parse(JSON.stringify(mockCards)))

function toggleExpand(title: string) {
  const s = new Set(expandedTitles.value)
  s.has(title) ? s.delete(title) : s.add(title)
  expandedTitles.value = s
}

// ── AI 重新提取（接入 Gateway） ──
async function reExtract() {
  isExtracting.value = true
  ElMessage.info('AI 正在提取案件要素（主模型 DeepSeek → 备用 GLM-4）...')

  try {
    const result = (await aiGateway.execute(
      { taskId: caseId.value, caseContent: '', reviewType: 'elements_only' },
      (e) => {
        if (e.type === 'primary_retry') ElMessage.warning(`主模型重试中 (${e.retryCount}/2)...`)
        if (e.type === 'switching_fallback') ElMessage.warning('主模型不可用，切换备用模型...')
      },
    )) as { isFallback?: boolean; elements?: { category: string; items: { label: string; value: string; confidence: number }[] }[] }

    // 更新要素数据
    if (result.elements) {
      result.elements.forEach((el) => {
        const card = cards.find((c) => c.title === el.category)
        if (card) {
          card.items.forEach((item, i) => {
            const aiItem = el.items[i]
            if (aiItem) {
              item.confidence = aiItem.confidence
              if (aiItem.value && aiItem.value !== item.value) {
                item.value = aiItem.value
              }
            }
          })
        }
      })
    }

    isExtracting.value = false
    const tag = result.isFallback ? '（备用模型）' : ''
    ElMessage.success(`AI 提取完成${tag}，置信度已更新`)
  } catch {
    isExtracting.value = false
    ElMessage.error('AI 提取失败：所有模型均不可用')
  }
}

// ── 导出要素清单 ──
function exportElements() {
  const data = cards.map((card) => ({
    category: card.title,
    items: card.items.map((item) => ({
      label: item.label,
      value: item.value,
      confidence: `${(item.confidence * 100).toFixed(0)}%`,
    })),
    extraDetails: extraDetails[card.title] || [],
  }))

  const text = JSON.stringify(
    { caseId: caseId.value, caseName: caseName.value, exportTime: new Date().toISOString(), elements: data },
    null,
    2,
  )
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `要素提取_${caseId.value}_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('要素清单已下载')
}

// 每类要素的额外详情
const extraDetails: Record<string, { label: string; value: string }[]> = {
  '涉案人员': [
    { label: '嫌疑人职业', value: '无业' },
    { label: '嫌疑人文化程度', value: '初中' },
    { label: '被害人职业', value: '个体经营者' },
    { label: '提取来源', value: '讯问笔录 P9 / 被害人陈述 P28' },
  ],
  '案件基本信息': [
    { label: '案发具体时间', value: '2026-06-10 14:00' },
    { label: '作案手段', value: '趁人不备，秘密窃取' },
    { label: '是否既遂', value: '是' },
    { label: '提取来源', value: '立案决定书 P1 / 被害人陈述 P28' },
  ],
  '文书信息': [
    { label: '立案决定书文号', value: 'X公(刑)立字[2026]001号' },
    { label: '拘留证文号', value: 'X公(刑)拘字[2026]001号' },
    { label: '讯问笔录份数', value: '3 份（共 37 页）' },
    { label: '提取来源', value: 'OCR 全文识别' },
  ],
  '捺印检测': [
    { label: '检测算法', value: 'YOLOv8 + 特征点匹配' },
    { label: 'P12 位置', value: '签名处右侧（尺寸: 2.3cm × 1.5cm）' },
    { label: 'P28 位置', value: '签名处偏左（尺寸: 2.1cm × 1.4cm）' },
    { label: '注意事项', value: 'P45 捺印边缘模糊，建议人工复核' },
  ],
  '公章检测': [
    { label: '检测算法', value: '椭圆检测 + 文字识别' },
    { label: '立案决定书公章', value: 'XX市公安局（圆形，直径 4.5cm）' },
    { label: '拘留证公章', value: 'XX市公安局（圆形，直径 4.5cm）' },
    { label: '注意事项', value: '1 处公章按压偏轻，文字可辨但需人工确认' },
  ],
}
</script>

<template>
  <div class="header-row">
    <h2>案件要素提取 — {{ caseId }} {{ caseName }}</h2>
    <div class="actions">
      <el-button type="primary" :loading="isExtracting" @click="reExtract">
        {{ isExtracting ? 'AI提取中...' : '🤖 AI 重新提取' }}
      </el-button>
      <el-button @click="exportElements">📥 导出要素清单</el-button>
    </div>
  </div>

  <div class="element-grid">
    <div
      v-for="card in cards"
      :key="card.title"
      class="element-card"
      :class="{ expanded: expandedTitles.has(card.title) }"
    >
      <div class="el-icon">{{ card.icon }}</div>
      <div class="el-title">{{ card.title }}</div>

      <!-- 简要列表（始终显示） -->
      <div v-for="item in card.items" :key="item.label" class="el-item">
        <span>{{ item.label }}</span>
        <span>{{ item.value }} <span class="conf">{{ (item.confidence * 100).toFixed(0) }}%</span></span>
      </div>

      <!-- 展开后显示额外详情 -->
      <div v-if="expandedTitles.has(card.title)" class="extra-section">
        <div class="extra-title">更多提取信息</div>
        <div
          v-for="item in extraDetails[card.title] || []"
          :key="item.label"
          class="el-item extra-item"
        >
          <span>{{ item.label }}</span>
          <span>{{ item.value }}</span>
        </div>
        <div class="source-tag">🤖 AI 自动提取 · 仅供参考</div>
      </div>

      <div class="el-expand" @click="toggleExpand(card.title)">
        {{ expandedTitles.has(card.title) ? '收起详情 ↑' : '展开详情 →' }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-row h2 { font-size: 16px; font-weight: 600; }
.actions { display: flex; gap: 8px; }

.element-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px; }

.element-card {
  background: #162540;
  border: 1px solid #1E3A5F;
  border-radius: 8px;
  padding: 14px;
  cursor: default;
  transition: .2s;

  &:hover { border-color: #2A4A6F; }
  &.expanded { border-color: #00D4FF; box-shadow: 0 0 12px rgba(0,212,255,.1); }
}

.el-icon { font-size: 20px; margin-bottom: 8px; }
.el-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #E8EDF5; }

.el-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12px;
  color: #8FA4BE;
}
.conf { font-size: 11px; color: #5A7290; }

.extra-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #1E3A5F;
}

.extra-title {
  font-size: 11px;
  color: #5A7290;
  margin-bottom: 6px;
  font-weight: 600;
}

.extra-item {
  color: #5A7290;
  font-size: 11px;
}

.source-tag {
  margin-top: 8px;
  font-size: 10px;
  color: #FFA502;
  text-align: right;
}

.el-expand {
  color: #00D4FF;
  font-size: 12px;
  margin-top: 10px;
  cursor: pointer;
  user-select: none;

  &:hover { color: #00B8E6; }
}
</style>

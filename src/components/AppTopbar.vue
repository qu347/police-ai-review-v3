<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReviewStore } from '@/stores/reviewStore'
import { useSettingsStore } from '@/stores/settingsStore'

const route = useRoute()
const reviewStore = useReviewStore()
const settingsStore = useSettingsStore()

const breadcrumb = computed(() => {
  const meta = route.meta as { title?: string }
  return meta?.title || '首页'
})

// 启动时检测连通性
onMounted(() => {
  reviewStore.checkConnections()
})

const aiLabel = computed(() => {
  if (reviewStore.isAIRunning) return '处理中...'
  if (reviewStore.aiStatus === 'failed') return '故障'
  const ds = reviewStore.connStatus.deepseek
  if (ds === 'checking') return '检测中'
  if (ds === 'online') return '就绪'
  if (ds === 'invalid_key') return '密钥错误'
  if (ds === 'offline') return '无法连接'
  return '检测中'
})

const aiModel = computed(() => {
  if (reviewStore.aiProvider === 'local-model') return settingsStore.settings.local.model
  if (reviewStore.aiProvider === 'glm-4-flash') return settingsStore.settings.glm4.model
  return settingsStore.settings.deepseek.model
})

const aiStatusClass = computed(() => {
  if (reviewStore.isAIRunning) return 'warning'
  if (reviewStore.aiStatus === 'failed') return 'danger'
  const ds = reviewStore.connStatus.deepseek
  if (ds === 'online') return 'normal'
  if (ds === 'invalid_key') return 'warning'
  if (ds === 'offline') return 'danger'
  return 'normal'
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-breadcrumb">
      案件管控 <span>› {{ breadcrumb }}</span>
    </div>
    <div class="topbar-actions">
      <div class="ai-status" :class="aiStatusClass">
        <span class="dot" :class="aiStatusClass" />
        {{ reviewStore.connStatus.deepseek === 'checking' ? 'AI 检测中...' : `AI ${aiLabel}` }}
      </div>
      <span class="date">2026-07-12</span>
      <div class="user-avatar">张</div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.topbar {
  height: 52px;
  min-height: 52px;
  background: #101D33;
  border-bottom: 1px solid #1E3A5F;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
}

.topbar-breadcrumb {
  font-size: 13px;
  color: #5A7290;

  span {
    color: #E8EDF5;
  }
}

.topbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-status {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;

  &.normal  { color: #2ED573; }
  &.warning { color: #FF6B35; }
  &.danger  { color: #FF4757; }
  &.local   { color: #7C5CFC; }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: pulse 2s infinite;

    &.normal  { background: #2ED573; }
    &.warning { background: #FF6B35; }
    &.danger  { background: #FF4757; animation: none; }
    &.local   { background: #7C5CFC; }
  }
}

.date {
  color: #5A7290;
  font-size: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #00D4FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}
</style>

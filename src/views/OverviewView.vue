<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReviewStore } from '@/stores/reviewStore'
import { useCaseStore } from '@/stores/caseStore'
import { ElMessage } from 'element-plus'
import type { Severity } from '@/types'

const route = useRoute()
const router = useRouter()
const reviewStore = useReviewStore()
const caseStore = useCaseStore()

// 从路由读取当前案件 ID
const caseId = computed(() => (route.params.id as string) || 'A-2026-001')
const caseName = computed(() => caseStore.allCases.find((c) => c.id === caseId.value)?.name || '未知案件')

// 本地桥梁 — 确保 el-select v-model 双向绑定可靠
const localFilter = computed({
  get: () => reviewStore.severityFilter,
  set: (val: Severity | 'all') => reviewStore.setSeverityFilter(val),
})

function goToReport() {
  router.push(`/case/${caseId.value}/report`)
}

// ── AI 重新审查 ──
async function reReview() {
  ElMessage.info('AI 正在重新审查全部卷宗（主模型 DeepSeek → 备用 GLM-4）...')
  try {
    await reviewStore.runAIReview(caseId.value)
    const tag = reviewStore.aiIsFallback ? '（备用模型完成）' : ''
    ElMessage.success(`审查完成${tag}，健康度：${reviewStore.healthScore}%`)
  } catch {
    ElMessage.error('审查失败：所有 AI 模型均不可用')
  }
}
</script>

<template>
  <div class="header-row">
    <h2>卷宗总览 — {{ caseId }} {{ caseName }} <el-tag type="warning" size="small">体检报告</el-tag></h2>
    <div class="header-actions">
      <el-button type="primary" :loading="reviewStore.isAIRunning" @click="reReview">
        {{ reviewStore.isAIRunning ? 'AI审查中...' : '🤖 重新审查' }}
      </el-button>
      <el-button @click="goToReport">📄 生成阅卷报告</el-button>
    </div>
  </div>

  <!-- 风险仪表盘 -->
  <div class="stat-cards">
    <div class="stat-card" style="border-left: 3px solid #FF4757;">
      <div class="stat-label">🔴 高风险</div>
      <div class="stat-value danger">{{ reviewStore.highCount }}</div>
      <div class="stat-sub">程序违规</div>
    </div>
    <div class="stat-card" style="border-left: 3px solid #FF6B35;">
      <div class="stat-label">🟡 中风险</div>
      <div class="stat-value warning">{{ reviewStore.mediumCount }}</div>
      <div class="stat-sub">证据瑕疵 / 文书问题</div>
    </div>
    <div class="stat-card" style="border-left: 3px solid #FFA502;">
      <div class="stat-label">🟢 低风险</div>
      <div class="stat-value orange">{{ reviewStore.lowCount }}</div>
      <div class="stat-sub">卷宗质量</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">审查健康度</div>
      <div class="stat-value">{{ reviewStore.healthScore }}%</div>
      <el-progress :percentage="reviewStore.healthScore" :stroke-width="8" :color="reviewStore.healthScore < 60 ? '#FF4757' : reviewStore.healthScore < 80 ? '#FF6B35' : '#2ED573'" />
      <div class="stat-sub">{{ reviewStore.healthScore < 60 ? '需要重点关注' : reviewStore.healthScore < 80 ? '基本合规，存在部分问题' : '审查健康度良好' }}</div>
    </div>
  </div>

  <!-- 筛选 -->
  <div class="card filter-bar">
    <span class="card-title">审查问题汇总（{{ reviewStore.filteredIssues.length }} / {{ reviewStore.issues.length }} 项）</span>
    <el-select v-model="localFilter" size="small" style="width:140px;">
      <el-option label="全部" value="all" />
      <el-option label="🔴 高风险" value="high" />
      <el-option label="🟡 中风险" value="medium" />
      <el-option label="🟢 低风险" value="low" />
    </el-select>
  </div>

  <!-- 问题列表 -->
  <div v-for="issue in reviewStore.filteredIssues" :key="issue.id" class="accordion" :class="{ open: reviewStore.expandedIssueId === issue.id }">
    <div
      class="accordion-header"
      :style="{ borderLeftColor: issue.severity === 'high' ? '#FF4757' : issue.severity === 'medium' ? '#FF6B35' : '#FFA502' }"
      @click="reviewStore.toggleIssue(issue.id)"
    >
      <div>
        <span class="sev-tag" :class="issue.severity">
          {{ issue.severity === 'high' ? '🔴 高风险' : issue.severity === 'medium' ? '🟡 中风险' : '🟢 低风险' }}
        </span>
        <strong>#{{ issue.id }} {{ issue.title }}</strong>
        <el-tag size="small" style="margin-left:8px;">{{ issue.category }}</el-tag>
      </div>
      <span class="arrow">▼</span>
    </div>
    <div v-show="reviewStore.expandedIssueId === issue.id" class="accordion-body">
      <p class="issue-detail">{{ issue.detail }}</p>
      <div v-if="issue.locations.length" class="locations">
        <div class="loc-label">📍 相关位置：</div>
        <div v-for="loc in issue.locations" :key="loc" class="loc-item">→ {{ loc }}</div>
      </div>
      <div class="issue-actions">
        <el-button size="small" type="primary" @click="router.push(`/case/${caseId}/procedure`)">🔍 溯源查看</el-button>
        <el-button size="small" @click="reviewStore.markIssueResolved(issue.id)">✅ 标记已处理</el-button>
        <el-button size="small" @click="ElMessage.info('批注功能：请选中问题详情后输入批注内容')">💬 添加批注</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-row h2 { font-size: 16px; font-weight: 600; }
.header-actions { display: flex; gap: 8px; }

.stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat-card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; }
.stat-label { font-size: 12px; color: #5A7290; margin-bottom: 4px; }
.stat-value { font-size: 28px; font-weight: 700; &.danger { color: #FF4757; } &.warning { color: #FF6B35; } &.orange { color: #FFA502; } }
.stat-sub { font-size: 11px; color: #5A7290; margin-top: 4px; }

.filter-bar { display: flex; justify-content: space-between; align-items: center; }

.card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; margin-bottom: 8px; }
.card-title { font-size: 14px; font-weight: 600; }

.accordion { border: 1px solid #1E3A5F; border-radius: 8px; overflow: hidden; margin-bottom: 8px; }
.accordion-header {
  padding: 12px 16px; background: #162540; cursor: pointer; display: flex;
  justify-content: space-between; align-items: center; border-left: 3px solid #1E3A5F;
  &:hover { background: #1C3050; }
}
.accordion-body { padding: 16px; background: #101D33; border-top: 1px solid #1E3A5F; }

.sev-tag { font-size: 11px; margin-right: 8px; }
.arrow { font-size: 12px; color: #5A7290; transition: transform .2s; }
.accordion.open .arrow { transform: rotate(180deg); }

.issue-detail { color: #8FA4BE; line-height: 1.8; margin-bottom: 12px; }
.locations { margin-bottom: 12px; }
.loc-label { font-size: 12px; color: #5A7290; margin-bottom: 4px; }
.loc-item { font-size: 12px; color: #00D4FF; padding: 2px 0; }
.issue-actions { display: flex; gap: 8px; }
</style>

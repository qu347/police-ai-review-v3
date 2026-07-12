<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useCaseStore } from '@/stores/caseStore'
import { docRules } from '@/services/mockData'
import { ElMessage } from 'element-plus'
import type { DocRule } from '@/types'

const route = useRoute()
const caseStore = useCaseStore()
const caseId = computed(() => (route.params.id as string) || 'A-2026-001')
const caseName = computed(() => caseStore.allCases.find((c) => c.id === caseId.value)?.name || '未知案件')

// 响应式规则列表（支持补正后实时更新）
const rules = reactive<DocRule[]>(JSON.parse(JSON.stringify(docRules)))
const matchCount = computed(() => rules.filter((r) => r.status === 'match').length)
const rate = computed(() => Math.round((matchCount.value / rules.length) * 100))

// ── 查看原文 ──
const previewVisible = ref(false)
const previewRule = ref<DocRule | null>(null)
const fixFileInput = ref<HTMLInputElement>()

function openPreview(rule: DocRule) {
  previewRule.value = rule
  previewVisible.value = true
}

// ── 上传补正材料 ──
function triggerFixUpload() {
  fixFileInput.value?.click()
}

function onFixFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length || !previewRule.value) return

  const fileName = input.files[0].name
  const idx = rules.findIndex((r) => r.name === previewRule.value!.name)
  if (idx !== -1) {
    rules[idx] = { ...rules[idx], status: 'match', note: `补正 → ${fileName}` }
  }
  input.value = ''
  previewVisible.value = false
  ElMessage.success(`"${previewRule.value.name}" 补正材料已上传，规则已通过`)
}
</script>

<template>
  <h2 style="font-size:16px;margin-bottom:16px;">制卷规则审查 — 对照《公安机关刑事案件示范案卷指南》</h2>

  <div class="grid-2">
    <div class="card">
      <div class="card-header">
        <span class="card-title">📋 标准目录要求（示范案卷指南）</span>
        <el-tag type="success">匹配率 {{ rate }}%</el-tag>
      </div>
      <div class="rule-list">
        <div v-for="rule in rules" :key="rule.name" class="rule-item" :class="rule.status">
          <span class="rule-icon">{{ rule.status === 'match' ? '✓' : rule.status === 'partial' ? '⚠' : '✗' }}</span>
          {{ rule.name }}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">📂 当前卷宗对照</span></div>
      <div class="rule-list">
        <div v-for="rule in rules" :key="rule.name" class="rule-item-compare" :class="rule.status">
          <span class="rule-icon">{{ rule.status === 'match' ? '✓' : rule.status === 'partial' ? '⚠' : '✗' }}</span>
          <span>{{ rule.note }}</span>
          <el-button v-if="rule.status !== 'missing'" size="small" text type="primary" @click="openPreview(rule)">查看原文</el-button>
          <el-tag v-else type="danger" size="small" style="cursor:pointer;" @click="openPreview(rule)">需补正</el-tag>
        </div>
      </div>
    </div>
  </div>

  <!-- 查看原文抽屉 -->
  <el-drawer v-model="previewVisible" title="" direction="rtl" size="500px" :with-header="false">
    <div class="drawer-content" v-if="previewRule">
      <div class="drawer-header">
        <span class="drawer-title">原文查看 — {{ previewRule.name }}</span>
        <el-button text @click="previewVisible = false">✕</el-button>
      </div>
      <div class="drawer-note">{{ previewRule.note }}</div>
      <div class="drawer-status" :class="previewRule.status">
        {{ previewRule.status === 'match' ? '✓ 已匹配' : previewRule.status === 'partial' ? '⚠ 部分匹配' : '✗ 缺失' }}
      </div>

      <!-- 缺失文档的补正指引 -->
      <div v-if="previewRule.status === 'missing'" class="fix-guide">
        <div class="fix-title">📋 补正指引</div>
        <div class="fix-text">
          该文书为公安机关刑事案件示范案卷的必要组成材料，当前卷宗中缺失。
        </div>
        <div class="fix-steps">
          <div class="fix-step"><strong>1.</strong> 向办案单位调取《{{ previewRule.name.replace(/^\d+\.\s*/, '') }}》原件</div>
          <div class="fix-step"><strong>2.</strong> 扫描并上传至本系统（PDF / 图片格式）</div>
          <div class="fix-step"><strong>3.</strong> 系统将自动归入卷宗对应目录位置</div>
        </div>
        <input ref="fixFileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none;" @change="onFixFileChange" />
        <el-button type="primary" size="small" style="margin-top:12px;" @click="triggerFixUpload">📤 上传补正材料</el-button>
        <div class="fix-note">⚠ 补正后系统将重新审查该目录项</div>
      </div>

      <!-- 已匹配/部分匹配的原文预览 -->
      <div v-else class="drawer-preview">
        <div class="mock-doc">
          <div class="mock-doc-header">XX市公安局</div>
          <div class="mock-doc-title">{{ previewRule.name.replace(/^\d+\.\s*/, '') }}</div>
          <div class="mock-doc-lines">
            <div class="mock-line w90" />
            <div class="mock-line w70" />
            <div class="mock-line w85" />
            <div class="mock-line w60" />
            <div class="mock-line w80" />
            <div class="mock-line w50" />
            <div class="mock-line w75" />
          </div>
          <div class="mock-doc-seal">（公章）</div>
        </div>
        <div v-if="previewRule.status === 'partial'" class="fix-note" style="margin-top:12px;">⚠ 该文书格式与示范案卷指南不完全一致，建议更新模板</div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #1E3A5F; }
.card-title { font-size: 14px; font-weight: 600; }
.rule-list { font-size: 13px; line-height: 2.4; }
.rule-item { display: flex; align-items: center; gap: 8px; }
.rule-item.match { color: #2ED573; }
.rule-item.partial { color: #FF6B35; }
.rule-item.missing { color: #FF4757; }
.rule-item-compare { display: flex; align-items: center; gap: 8px; justify-content: space-between; }
.rule-item-compare.match { color: #2ED573; }
.rule-item-compare.partial { color: #FF6B35; }
.rule-item-compare.missing { color: #FF4757; }
.rule-icon { width: 16px; text-align: center; }

// 抽屉
.drawer-content { color: #E8EDF5; }
.drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.drawer-title { font-size: 15px; font-weight: 600; }
.drawer-note { font-size: 13px; color: #8FA4BE; margin-bottom: 8px; }
.drawer-status { font-size: 12px; font-weight: 600; margin-bottom: 16px; padding: 6px 12px; border-radius: 4px; display: inline-block; }
.drawer-status.match { background: rgba(46,213,115,.15); color: #2ED573; }
.drawer-status.partial { background: rgba(255,107,53,.15); color: #FF6B35; }
.drawer-status.missing { background: rgba(255,71,87,.15); color: #FF4757; }

.drawer-preview { margin-top: 8px; }
.mock-doc { background: #f5f0e8; color: #1a1a1a; padding: 28px 24px; border-radius: 4px; font-size: 13px; line-height: 2; }
.mock-doc-header { text-align: center; font-size: 12px; color: #555; margin-bottom: 16px; }
.mock-doc-title { text-align: center; font-size: 18px; font-weight: 700; letter-spacing: 3px; margin-bottom: 24px; }
.mock-doc-lines { margin-bottom: 20px; }
.mock-line { height: 8px; background: #ccc; border-radius: 4px; margin-bottom: 10px; }
.w90 { width: 90%; } .w70 { width: 70%; } .w85 { width: 85%; } .w60 { width: 60%; } .w80 { width: 80%; } .w50 { width: 50%; } .w75 { width: 75%; }
.mock-doc-seal { text-align: right; font-size: 14px; color: #c00; margin-top: 8px; }

.fix-guide { background: rgba(255,71,87,.08); border: 1px solid rgba(255,71,87,.2); border-radius: 8px; padding: 16px; margin-top: 12px; }
.fix-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #FF6B35; }
.fix-text { font-size: 13px; color: #8FA4BE; margin-bottom: 12px; }
.fix-steps { font-size: 12px; color: #8FA4BE; line-height: 2; }
.fix-step { padding: 2px 0; }
.fix-note { font-size: 11px; color: #FF6B35; margin-top: 8px; }

:deep(.el-drawer) { background: #101D33 !important; }
:deep(.el-drawer__body) { padding: 20px; }
</style>

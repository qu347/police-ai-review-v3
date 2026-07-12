<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useCaseStore } from '@/stores/caseStore'
import { procedures as staticProcedures } from '@/services/mockData'
import { ElMessage } from 'element-plus'
import { aiGateway } from '@/services/aiGateway'
import type { ProcedureItem } from '@/types'

const route = useRoute()
const caseStore = useCaseStore()
const caseId = computed(() => (route.params.id as string) || 'A-2026-001')
const caseName = computed(() => caseStore.allCases.find((c) => c.id === caseId.value)?.name || '未知案件')

const aiRunning = ref(false)
async function runAIProcedure() {
  aiRunning.value = true
  try {
    const result = (await aiGateway.execute({ taskId: caseId.value, caseContent: '', reviewType: 'procedure' })) as { issues?: { name: string; detail?: string }[] }
    if (result.issues) {
      result.issues.forEach((item, i) => {
        if (procedures[i]) {
          procedures[i].detail = item.detail || procedures[i].detail
        }
      })
    }
    ElMessage.success('AI 程序审查完成')
  } catch { ElMessage.error('AI 审查失败') }
  aiRunning.value = false
}

// 响应式程序审查列表
const procedures = reactive<ProcedureItem[]>(JSON.parse(JSON.stringify(staticProcedures)))
const passCount = computed(() => procedures.filter((p) => p.result === 'pass').length)
const failCount = computed(() => procedures.filter((p) => p.result === 'fail').length)
const rate = computed(() => Math.round((passCount.value / procedures.length) * 100))

// ── 溯源复核 ──
const traceVisible = ref(false)
const traceItem = ref<ProcedureItem | null>(null)
const traceIndex = ref(-1)

function openTrace(item: ProcedureItem, index: number) {
  traceItem.value = { ...item }
  traceIndex.value = index
  traceVisible.value = true
}

function confirmPass() {
  if (traceIndex.value >= 0) {
    procedures[traceIndex.value].result = 'pass'
    procedures[traceIndex.value].detail = '经人工复核确认合规'
  }
  traceVisible.value = false
  ElMessage.success('已标记为合规')
}

function markFail() {
  if (traceIndex.value >= 0) {
    procedures[traceIndex.value].result = 'fail'
    procedures[traceIndex.value].detail = '经人工复核确认违规'
  }
  traceVisible.value = false
  ElMessage.warning('已标记为违规')
}
</script>

<template>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h2 style="font-size:16px;">程序审查 — {{ caseId }} {{ caseName }}</h2>
    <el-button type="primary" :loading="aiRunning" @click="runAIProcedure">
      {{ aiRunning ? 'AI审查中...' : '🤖 AI 程序审查' }}
    </el-button>
  </div>

  <div class="grid-2" style="margin-bottom:16px;">
    <div class="card">
      <div class="card-title" style="margin-bottom:12px;">审查结论</div>
      <div class="conclusion">
        <div class="rate">{{ rate }}%</div>
        <div>
          <div style="font-size:13px;margin-bottom:4px;">⚠ 基本合规</div>
          <div style="font-size:12px;color:#8FA4BE;">程序项: {{ passCount }}/{{ procedures.length }} 合规</div>
          <div style="font-size:12px;color:#FF4757;">违规项: {{ failCount }} 项需整改</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:12px;">案件办理时间线</div>
      <div class="timeline">
        <div class="tl-item"><span class="tl-time">06-10 14:00</span>📍 案发 — XX路手机店被盗</div>
        <div class="tl-item"><span class="tl-time">06-10 14:30</span>📞 报案 — 李某报警</div>
        <div class="tl-item"><span class="tl-time">06-10 15:00</span>🚔 出警 — XX派出所</div>
        <div class="tl-item"><span class="tl-time">06-11 10:00</span>📝 立案 — 经审批立案</div>
        <div class="tl-item"><span class="tl-time">06-14 10:00</span>🔒 拘留 — 依法拘留张某</div>
        <div class="tl-item warn"><span class="tl-time">06-15 14:30</span>⚠ 讯问 — 超时（28h）</div>
        <div class="tl-item"><span class="tl-time">06-18</span>📨 提请逮捕</div>
        <div class="tl-item"><span class="tl-time">06-20</span>📤 移送审查起诉</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title" style="margin-bottom:12px;">程序审查明细（依据《公安机关办理刑事案件程序规定》）</div>
    <el-table :data="procedures" style="width:100%" :row-class-name="({ row }: any) => row.result === 'fail' ? 'fail-row' : ''">
      <el-table-column prop="name" label="检查项" />
      <el-table-column label="结果" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.result === 'pass'" type="success" size="small">✓ 合规</el-tag>
          <el-tag v-else-if="row.result === 'fail'" type="danger" size="small">✗ 违规</el-tag>
          <el-tag v-else-if="row.result === 'partial'" type="warning" size="small">⚠ 部分</el-tag>
          <el-tag v-else type="info" size="small">N/A</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="说明" width="220">
        <template #default="{ row }">
          <span style="font-size:12px;color:#5A7290;">{{ row.detail || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row, $index }"><el-button size="small" @click="openTrace(row, $index)">🔍 溯源</el-button></template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 溯源抽屉 -->
  <el-drawer v-model="traceVisible" title="" direction="rtl" size="540px" :with-header="false">
    <div class="trace-content" v-if="traceItem">
      <div class="trace-header">
        <span class="trace-title">溯源复核</span>
        <el-button text @click="traceVisible = false">✕</el-button>
      </div>
      <div class="trace-item-name">{{ traceItem.name }}</div>
      <div class="trace-result" :class="traceItem.result">
        {{ traceItem.result === 'fail' ? '✗ 违规' : traceItem.result === 'partial' ? '⚠ 部分合规' : traceItem.result === 'pass' ? '✓ 合规' : 'N/A' }}
      </div>
      <div v-if="traceItem.detail" class="trace-detail">{{ traceItem.detail }}</div>

      <div class="trace-section">
        <div class="trace-section-title">📄 相关卷宗原文</div>
        <div class="compare-view">
          <div class="compare-panel" :class="{ highlight: traceItem.result === 'fail' }">
            <div class="panel-label">讯问笔录（摘录）P12</div>
            <div class="panel-text">
              讯问时间：2026年6月15日14时30分<br>
              讯问地点：XX市公安局XX派出所<br>
              被讯问人：张某<br>
              <mark v-if="traceItem.result === 'fail'">（注：距拘留时间已超过24小时）</mark>
            </div>
          </div>
          <div class="compare-panel">
            <div class="panel-label">拘留证 P5</div>
            <div class="panel-text">
              XX市公安局<br>
              兹决定对张某执行拘留<br>
              拘留时间：2026年6月14日10时00分<br>
              <mark>时间差：28小时30分钟</mark>
            </div>
          </div>
        </div>
      </div>

      <div class="trace-actions">
        <el-button size="small" type="primary" @click="confirmPass">✅ 确认合规</el-button>
        <el-button size="small" type="danger" @click="markFail">⚠ 标记违规</el-button>
        <el-button size="small">💬 添加办案说明</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; }
.card-title { font-size: 14px; font-weight: 600; }
.conclusion { display: flex; gap: 16px; align-items: center; }
.rate { font-size: 36px; font-weight: 700; color: #FF6B35; }

.timeline { position: relative; padding-left: 20px; border-left: 2px solid #1E3A5F; max-height: 220px; overflow-y: auto; }
.tl-item { position: relative; padding: 4px 0 4px 16px; font-size: 12px; cursor: pointer; &:hover { background: #1C3050; border-radius: 4px; } }
.tl-item::before { content: ''; position: absolute; left: -27px; top: 10px; width: 8px; height: 8px; border-radius: 50%; background: #00D4FF; }
.tl-item.warn::before { background: #FF6B35; }
.tl-time { color: #5A7290; font-size: 10px; display: block; }

:deep(.fail-row) { background: rgba(255,71,87,.08) !important; }

// 溯源抽屉
.trace-content { color: #E8EDF5; }
.trace-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.trace-title { font-size: 16px; font-weight: 600; }
.trace-item-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.trace-result { font-size: 12px; padding: 4px 10px; border-radius: 4px; display: inline-block; margin-bottom: 12px; font-weight: 600; }
.trace-result.fail { background: rgba(255,71,87,.15); color: #FF4757; }
.trace-result.partial { background: rgba(255,107,53,.15); color: #FF6B35; }
.trace-result.pass { background: rgba(46,213,115,.15); color: #2ED573; }
.trace-detail { font-size: 13px; color: #8FA4BE; margin-bottom: 16px; line-height: 1.8; }

.trace-section { margin-bottom: 16px; }
.trace-section-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }

.compare-view { display: flex; flex-direction: column; gap: 10px; }
.compare-panel { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 12px; }
.compare-panel.highlight { border-color: #FF4757; box-shadow: 0 0 8px rgba(255,71,87,.12); }
.panel-label { font-size: 11px; color: #5A7290; margin-bottom: 8px; }
.panel-text { font-size: 12px; color: #8FA4BE; line-height: 2; font-family: monospace; }
.panel-text mark { background: rgba(255,71,87,.2); color: #FF4757; padding: 1px 4px; border-radius: 2px; }

.trace-actions { display: flex; gap: 8px; margin-top: 16px; }

:deep(.el-drawer) { background: #101D33 !important; }
:deep(.el-drawer__body) { padding: 20px; }
</style>

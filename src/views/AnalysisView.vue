<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCaseStore } from '@/stores/caseStore'
import { timeline } from '@/services/mockData'
import { ElMessage } from 'element-plus'
import { aiGateway } from '@/services/aiGateway'
import type { TimelineEvent } from '@/types'

const route = useRoute()
const caseStore = useCaseStore()
const caseId = computed(() => (route.params.id as string) || 'A-2026-001')
const caseName = computed(() => caseStore.allCases.find((c) => c.id === caseId.value)?.name || '未知案件')

// ── 编辑犯罪事实 ──
const editing = ref(false)
const factText = ref(
  '2026年6月10日14时许，犯罪嫌疑人张某窜至XX市XX路XX号李某经营的手机店，趁李某不备，盗走柜台内价值人民币5000元的手机一部。张某在实施盗窃后被店内监控拍下，被害人李某于当日14时30分向公安机关报案。\n\n' +
  'XX市公安局XX派出所于当日15时到场处置，经调取监控录像和走访调查，于6月13日锁定犯罪嫌疑人张某。6月14日，公安机关依法对张某执行拘留。经讯问，张某对盗窃事实供认不讳。',
)

function toggleEdit() {
  if (editing.value) {
    editing.value = false
    ElMessage.success('犯罪事实已保存')
  } else {
    editing.value = true
  }
}

// ── 时间线节点点击 ──
const tlVisible = ref(false)
const tlItem = ref<TimelineEvent | null>(null)

function openTimeline(ev: TimelineEvent) {
  tlItem.value = ev
  tlVisible.value = true
}

// ── 证据溯源 ──
const evVisible = ref(false)
const evLabel = ref('')
const evPage = ref('')

function traceEvidence(label: string) {
  const match = label.match(/\((.+?)\)$/)
  evLabel.value = label
  evPage.value = match ? match[1] : ''
  evVisible.value = true
}
</script>

<template>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h2 style="font-size:16px;">案件分析 — {{ caseId }} {{ caseName }}</h2>
    <el-button type="primary" @click="async () => { try { await aiGateway.execute({ taskId: caseId, caseContent: '', reviewType: 'full' }); ElMessage.success('AI 案件分析完成') } catch { ElMessage.error('AI 分析失败') } }">
      🤖 AI 案件分析
    </el-button>
  </div>

  <div class="grid-2" style="margin-bottom:16px;">
    <div class="card">
      <div class="card-title" style="margin-bottom:12px;">嫌疑人基本情况</div>
      <div class="info-list">
        <div><span class="label">姓名：</span>张某</div>
        <div><span class="label">性别：</span>男</div>
        <div><span class="label">出生日期：</span>1990-03-15</div>
        <div><span class="label">身份证：</span>11010219900315XXXX</div>
        <div><span class="label">户籍地：</span>XX省XX市XX区XX路XX号</div>
        <div><span class="label">现住址：</span>XX省XX市XX区XX路XX号</div>
        <div><span class="label">职业：</span>无业</div>
        <div><span class="label">前科：</span><el-tag type="success" size="small">无犯罪前科</el-tag></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:12px;">🕐 案发与侦破经过</div>
      <div class="tl">
        <div
          v-for="(ev, i) in timeline"
          :key="i"
          class="tl-item"
          :class="{ warn: ev.warn }"
          @click="openTimeline(ev)"
        >
          <span class="tl-time">{{ ev.time }}</span>
          <strong>{{ ev.label }}</strong> — {{ ev.detail }}
          <span v-if="ev.warn" class="tl-badge">⚠</span>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="card-title">认定犯罪事实（AI 自动生成）</span>
      <el-button size="small" @click="toggleEdit">{{ editing ? '💾 保存' : '✏️ 编辑' }}</el-button>
    </div>
    <div class="fact-text">
      <template v-if="editing">
        <el-input
          v-model="factText"
          type="textarea"
          :rows="6"
          placeholder="请输入犯罪事实认定..."
        />
      </template>
      <template v-else>
        <p v-for="(para, i) in factText.split('\n\n')" :key="i">{{ para }}</p>
      </template>
      <div class="evidence-refs">
        <div class="ref-title">依据证据：</div>
        <div class="ref-item" @click="traceEvidence('被害人李某陈述 (P28)')">→ 被害人李某陈述 (P28)</div>
        <div class="ref-item" @click="traceEvidence('证人王某证言 (P52)')">→ 证人王某证言 (P52)</div>
        <div class="ref-item" @click="traceEvidence('监控录像（视听资料 #1）')">→ 监控录像（视听资料 #1）</div>
        <div class="ref-item" @click="traceEvidence('价格鉴定意见 (P75)')">→ 价格鉴定意见 (P75)</div>
        <div class="ref-item" @click="traceEvidence('嫌疑人张某供述 (P9-45)')">→ 嫌疑人张某供述 (P9-45)</div>
      </div>
    </div>
  </div>

  <!-- 时间线节点详情抽屉 -->
  <el-drawer v-model="tlVisible" title="" direction="rtl" size="460px" :with-header="false">
    <div class="tl-drawer" v-if="tlItem">
      <div class="tl-drawer-header">
        <span class="tl-drawer-title">事件详情</span>
        <el-button text @click="tlVisible = false">✕</el-button>
      </div>
      <div class="tl-drawer-time">{{ tlItem.time }}</div>
      <div class="tl-drawer-label">{{ tlItem.label }}</div>
      <div class="tl-drawer-detail">{{ tlItem.detail }}</div>
      <div v-if="tlItem.warn" class="tl-warn-box">
        <div class="tl-warn-title">⚠ 时空冲突提示</div>
        <div class="tl-warn-text">该时间节点与前后办案程序存在逻辑矛盾，建议民警复核相关卷宗材料，确认时间记录是否准确。</div>
      </div>
      <div class="tl-drawer-section">
        <div class="tl-drawer-section-title">关联证据</div>
        <div class="tl-ev-item">📄 讯问笔录 (P12)</div>
        <div class="tl-ev-item">📄 拘留证 (P5)</div>
      </div>
      <div class="tl-drawer-actions">
        <el-button size="small" type="primary" @click="tlVisible = false; $router.push(`/case/${caseId}/doc-review`)">🔍 查看原文</el-button>
        <el-button size="small" @click="tlVisible = false; ElMessage.info('时间修正功能已打开，请在文书编辑中修改')">✏️ 修正时间</el-button>
      </div>
    </div>
  </el-drawer>

  <!-- 证据溯源抽屉 -->
  <el-drawer v-model="evVisible" title="" direction="rtl" size="480px" :with-header="false">
    <div class="ev-drawer" v-if="evLabel">
      <div class="evd-header">
        <span class="evd-title">证据溯源</span>
        <el-button text @click="evVisible = false">✕</el-button>
      </div>
      <div class="evd-label">{{ evLabel }}</div>
      <div class="evd-page">📍 卷宗位置：{{ evPage }}</div>

      <div class="evd-section">
        <div class="evd-section-title">📄 原文摘录</div>
        <div class="evd-mock-doc">
          <div class="mock-doc-header">XX市公安局卷宗材料</div>
          <div class="mock-doc-content">
            <div class="mock-line w90" />
            <div class="mock-line w70" />
            <div class="mock-line w85" />
            <div class="mock-line w60" />
            <div class="mock-line w80" />
            <div class="mock-line w50" />
          </div>
          <div class="mock-doc-footer">— {{ evPage }} —</div>
        </div>
      </div>

      <div class="evd-actions">
        <el-button size="small" type="primary" @click="evVisible = false; $router.push(`/case/${caseId}/evidence`)">📄 查看完整原文</el-button>
        <el-button size="small" @click="evVisible = false; $router.push(`/case/${caseId}/evidence`)">🕸️ 查看图谱关联</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; }
.card-title { font-size: 14px; font-weight: 600; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #1E3A5F; }
.info-list { font-size: 13px; line-height: 2.2; color: #8FA4BE; }
.label { color: #5A7290; }

// 时间线
.tl { position: relative; padding-left: 20px; border-left: 2px solid #1E3A5F; max-height: 280px; overflow-y: auto; }
.tl-item { position: relative; padding: 6px 0 6px 16px; font-size: 12px; cursor: pointer; display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap; &:hover { background: #1C3050; border-radius: 4px; } }
.tl-item::before { content: ''; position: absolute; left: -27px; top: 12px; width: 8px; height: 8px; border-radius: 50%; background: #00D4FF; }
.tl-item.warn::before { background: #FF6B35; }
.tl-time { color: #5A7290; font-size: 10px; white-space: nowrap; }
.tl-badge { font-size: 10px; color: #FF6B35; margin-left: 2px; }

// 犯罪事实
.fact-text { font-size: 13px; line-height: 2; color: #8FA4BE; padding: 8px 0; }
.fact-text p { text-indent: 2em; margin-bottom: 8px; }
.evidence-refs { margin-top: 12px; }
.ref-title { font-size: 12px; color: #5A7290; margin-bottom: 4px; }
.ref-item { font-size: 12px; color: #00D4FF; cursor: pointer; padding: 1px 0; &:hover { text-decoration: underline; } }

// 时间线抽屉
.tl-drawer { color: #E8EDF5; }
.tl-drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.tl-drawer-title { font-size: 16px; font-weight: 600; }
.tl-drawer-time { font-size: 22px; font-weight: 700; color: #00D4FF; margin-bottom: 4px; }
.tl-drawer-label { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.tl-drawer-detail { font-size: 13px; color: #8FA4BE; margin-bottom: 16px; }
.tl-warn-box { background: rgba(255,107,53,.08); border: 1px solid rgba(255,107,53,.2); border-radius: 8px; padding: 14px; margin-bottom: 16px; }
.tl-warn-title { font-size: 13px; font-weight: 600; color: #FF6B35; margin-bottom: 4px; }
.tl-warn-text { font-size: 12px; color: #8FA4BE; }
.tl-drawer-section { margin-bottom: 16px; }
.tl-drawer-section-title { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.tl-ev-item { font-size: 12px; color: #00D4FF; padding: 3px 0; cursor: pointer; }
.tl-drawer-actions { display: flex; gap: 8px; }

// 证据抽屉
.ev-drawer { color: #E8EDF5; }
.evd-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.evd-title { font-size: 16px; font-weight: 600; }
.evd-label { font-size: 14px; font-weight: 600; color: #00D4FF; margin-bottom: 4px; }
.evd-page { font-size: 12px; color: #5A7290; margin-bottom: 16px; }
.evd-section { margin-bottom: 16px; }
.evd-section-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.evd-mock-doc { background: #f5f0e8; color: #1a1a1a; padding: 20px 18px; border-radius: 4px; font-size: 13px; }
.mock-doc-header { text-align: center; font-size: 11px; color: #777; margin-bottom: 16px; }
.mock-doc-content { margin-bottom: 12px; }
.mock-line { height: 7px; background: #ccc; border-radius: 3px; margin-bottom: 8px; }
.w90 { width: 90%; } .w70 { width: 70%; } .w85 { width: 85%; } .w60 { width: 60%; } .w80 { width: 80%; } .w50 { width: 50%; }
.mock-doc-footer { text-align: center; font-size: 10px; color: #999; }
.evd-actions { display: flex; gap: 8px; }

:deep(.el-drawer) { background: #101D33 !important; }
:deep(.el-drawer__body) { padding: 20px; }
</style>

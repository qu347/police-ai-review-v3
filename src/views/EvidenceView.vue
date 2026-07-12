<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCaseStore } from '@/stores/caseStore'
import { evidenceCategories, contradictions, persons, graphNodes, graphEdges } from '@/services/mockData'
import EvidenceGraph from '@/components/EvidenceGraph.vue'
import { aiGateway } from '@/services/aiGateway'
import { ElMessage } from 'element-plus'
import type { EvidenceCategory } from '@/types'

const route = useRoute()
const caseStore = useCaseStore()
const caseId = computed(() => (route.params.id as string) || 'A-2026-001')
const caseName = computed(() => caseStore.allCases.find((c) => c.id === caseId.value)?.name || '未知案件')

const activeTab = ref<'single' | 'multi'>('single')
const aiRunning = ref(false)
async function runAIEvidence() {
  aiRunning.value = true
  try {
    await aiGateway.execute({ taskId: caseId.value, caseContent: '', reviewType: 'evidence_chain' })
    ElMessage.success('AI 证据分析完成，图谱已更新')
  } catch { ElMessage.error('AI 证据分析失败') }
  aiRunning.value = false
}

// ── 证据详情 ──
const evidenceVisible = ref(false)
const activeCategory = ref<EvidenceCategory | null>(null)

// 每类证据的 mock 明细
const evidenceDetailMap: Record<string, { name: string; pages: string; desc: string }[]> = {
  '物证': [
    { name: '被盗手机', pages: 'P60', desc: '品牌型号：iPhone 15 Pro，IMEI：XXX，黑色，屏幕有裂痕' },
    { name: '撬锁工具', pages: 'P61', desc: '金属制T型撬棍，长约15cm，表面有磨损痕迹' },
    { name: '现场指纹', pages: 'P62', desc: '从手机柜台玻璃面提取，共3枚有效指纹' },
    { name: '嫌疑人衣物', pages: 'P63', desc: '黑色外套1件、深蓝色牛仔裤1条' },
    { name: '现金', pages: 'P64', desc: '人民币3200元，从张某住处查获' },
  ],
  '书证': [
    { name: '购买发票', pages: 'P65', desc: '手机购买发票，金额¥5999，日期2026-03-15' },
    { name: '价格鉴定书', pages: 'P75', desc: 'XX市价格认证中心出具，认定被盗手机价值¥5000' },
    { name: '通话记录', pages: 'P66', desc: '张某与刘某6月9日至11日通话清单，案发前后频繁联系' },
    { name: '户籍证明', pages: 'P67', desc: '张某户籍信息，XX省XX市XX区' },
    { name: '前科查询', pages: 'P68', desc: '全国违法犯罪人员信息库查询结果：无前科' },
    { name: '营业执照', pages: 'P69', desc: '李某经营的手机店营业执照副本' },
    { name: '扣押清单', pages: 'P70', desc: '扣押物品清单一式两份' },
    { name: '发还清单', pages: 'P71', desc: '被盗手机发还被害人李某' },
  ],
  '证人证言': [
    { name: '王某证言', pages: 'P46-52', desc: '目击张某进入手机店后匆匆离开，行为可疑' },
    { name: '赵某证言', pages: 'P72-73', desc: '承认从张某处低价收购手机，不知为赃物' },
    { name: '刘某证言', pages: 'P74', desc: '否认参与盗窃，称案发时在XX网吧' },
  ],
  '被害人陈述': [
    { name: '李某陈述', pages: 'P28-32', desc: '2026年6月10日14时许发现手机被盗，查看监控后报警' },
  ],
  '嫌疑人供述': [
    { name: '张某第一次讯问', pages: 'P9-17', desc: '否认盗窃，称案发时在XX网吧上网' },
    { name: '张某第二次讯问', pages: 'P18-27', desc: '承认盗窃事实，供述作案经过，称手机已卖给赵某' },
    { name: '张某第三次讯问', pages: 'P28-45', desc: '补充供述作案细节，指认现场' },
  ],
  '鉴定意见': [
    { name: '价格鉴定意见', pages: 'P75', desc: '鉴定结论：被盗手机价值¥5000（考虑折旧）' },
    { name: '指纹鉴定意见', pages: 'P76', desc: '现场提取指纹与张某右手拇指指纹同一' },
  ],
  '视听资料': [
    { name: '店内监控录像', pages: '光盘1', desc: '时长12分钟，清晰记录张某作案过程' },
  ],
  '勘验笔录': [
    { name: '现场勘验笔录', pages: 'P59-60', desc: 'XX路XX号手机店内现场勘验，提取指纹3枚、拍照12张' },
    { name: '指认现场笔录', pages: 'P77', desc: '张某指认作案现场，与勘验笔录一致' },
  ],
}

function openEvidence(cat: EvidenceCategory) {
  activeCategory.value = cat
  evidenceVisible.value = true
}
</script>

<template>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h2 style="font-size:16px;">证据审查 — {{ caseId }} {{ caseName }}</h2>
    <el-button type="primary" :loading="aiRunning" @click="runAIEvidence">
      {{ aiRunning ? 'AI分析中...' : '🤖 AI 证据分析' }}
    </el-button>
  </div>

  <!-- 证据目录 -->
  <div class="evidence-grid">
    <div v-for="cat in evidenceCategories" :key="cat.label" class="evidence-card" @click="openEvidence(cat)">
      <div class="cat-icon">{{ cat.icon }}</div>
      <div class="cat-label">{{ cat.label }}</div>
      <div class="cat-count">{{ cat.count }}</div>
    </div>
  </div>

  <div class="grid-2">
    <!-- 人员信息 -->
    <div>
      <div v-for="person in persons" :key="person.name" class="card person-card">
        <div class="card-header"><span class="card-title">{{ person.role }}：{{ person.name }}</span></div>
        <div class="person-summary">{{ person.summary }}</div>
        <div v-if="person.idCard" class="person-id">身份证：{{ person.idCard }} <el-button size="small" text type="primary">查看明文</el-button></div>
      </div>
    </div>

    <!-- 知识图谱 -->
    <div class="card">
      <div class="card-header"><span class="card-title">🕸️ 证据知识图谱</span><span class="hint">节点可拖拽 · 滚轮缩放</span></div>
      <EvidenceGraph :nodes="graphNodes" :edges="graphEdges" />
      <div class="legend">
        <span>━━ 关联</span>
        <span class="contra">- - - 矛盾</span>
        <span>→ 时序</span>
      </div>
    </div>
  </div>

  <!-- 供述矛盾分析 -->
  <div class="card" style="margin-top:16px;">
    <div class="card-header">
      <span class="card-title">供述矛盾分析</span>
      <div class="tabs">
        <span class="tab" :class="{ active: activeTab === 'single' }" @click="activeTab = 'single'">单人供述矛盾</span>
        <span class="tab" :class="{ active: activeTab === 'multi' }" @click="activeTab = 'multi'">多人供述对比</span>
      </div>
    </div>
    <el-table :data="contradictions" style="width:100%">
      <el-table-column prop="point" label="矛盾点" />
      <el-table-column prop="sourceA" label="来源A" width="160" />
      <el-table-column prop="sourceB" label="来源B" width="160" />
      <el-table-column prop="analysis" label="分析" />
      <el-table-column label="操作" width="120">
        <template #default>
          <el-button size="small" type="primary">溯源对比</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 证据详情抽屉 -->
  <el-drawer v-model="evidenceVisible" title="" direction="rtl" size="520px" :with-header="false">
    <div class="evidence-drawer" v-if="activeCategory">
      <div class="ev-header">
        <span class="ev-title">{{ activeCategory.icon }} {{ activeCategory.label }}（{{ activeCategory.count }} 项）</span>
        <el-button text @click="evidenceVisible = false">✕</el-button>
      </div>
      <div class="ev-list">
        <div v-for="(item, i) in (evidenceDetailMap[activeCategory.label] || [])" :key="i" class="ev-item">
          <div class="ev-item-header">
            <span class="ev-item-name">📄 {{ item.name }}</span>
            <span class="ev-item-page">{{ item.pages }}</span>
          </div>
          <div class="ev-item-desc">{{ item.desc }}</div>
          <div class="ev-item-actions">
            <el-button size="small" text type="primary" @click="evidenceVisible = false; $router.push(`/case/${caseId}/analysis`)">查看原文</el-button>
            <el-button size="small" text type="primary" @click="evidenceVisible = false">溯源图谱</el-button>
          </div>
        </div>
      </div>
      <div v-if="!evidenceDetailMap[activeCategory.label]" class="ev-empty">
        暂无明细数据
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.evidence-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.evidence-card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 14px; text-align: center; cursor: pointer; transition: .2s; &:hover { border-color: #00D4FF; } }
.cat-icon { font-size: 24px; }
.cat-label { font-size: 13px; font-weight: 600; margin: 4px 0; }
.cat-count { font-size: 20px; font-weight: 700; color: #00D4FF; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #1E3A5F; }
.card-title { font-size: 14px; font-weight: 600; }
.person-card { margin-bottom: 12px; }
.person-summary { font-size: 13px; color: #8FA4BE; line-height: 1.8; }
.person-id { font-size: 12px; color: #5A7290; margin-top: 8px; }
.hint { font-size: 11px; color: #5A7290; }
.legend { display: flex; gap: 16px; margin-top: 8px; font-size: 11px; color: #5A7290; }
.contra { color: #FF4757; }
.tabs { display: flex; gap: 0; }
.tab { padding: 4px 12px; cursor: pointer; font-size: 12px; color: #5A7290; border-bottom: 2px solid transparent; &.active { color: #00D4FF; border-bottom-color: #00D4FF; } }

// 证据抽屉
.evidence-drawer { color: #E8EDF5; }
.ev-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.ev-title { font-size: 15px; font-weight: 600; }
.ev-list { display: flex; flex-direction: column; gap: 10px; }
.ev-item { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 12px; }
.ev-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.ev-item-name { font-size: 13px; font-weight: 600; color: #00D4FF; }
.ev-item-page { font-size: 11px; color: #5A7290; }
.ev-item-desc { font-size: 12px; color: #8FA4BE; margin-bottom: 8px; }
.ev-item-actions { display: flex; gap: 8px; }
.ev-empty { text-align: center; color: #5A7290; padding: 40px; }

:deep(.el-drawer) { background: #101D33 !important; }
:deep(.el-drawer__body) { padding: 20px; }
</style>

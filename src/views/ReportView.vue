<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCaseStore } from '@/stores/caseStore'
import { ElMessage } from 'element-plus'
import { aiGateway } from '@/services/aiGateway'
import { ref } from 'vue'

const route = useRoute()
const caseStore = useCaseStore()
const caseId = computed(() => (route.params.id as string) || 'A-2026-001')
const caseName = computed(() => caseStore.allCases.find((c) => c.id === caseId.value)?.name || '未知案件')
const now = computed(() => new Date().toISOString().slice(0, 10))
const aiRunning = ref(false)
async function runAIReport() {
  aiRunning.value = true
  try {
    await aiGateway.execute({ taskId: caseId.value, caseContent: '', reviewType: 'full' })
    ElMessage.success('AI 报告生成完成')
  } catch { ElMessage.error('AI 生成失败') }
  aiRunning.value = false
}

// ── 导出 Word ──
function exportWord() {
  const content = document.querySelector('.report-paper')?.innerHTML || ''
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
    <head><meta charset="UTF-8"><title>阅卷报告</title></head>
    <body style="font-family:SimSun;font-size:14px;line-height:2;">${content}</body>
    </html>`
  downloadFile(html, `阅卷报告_${caseId.value}_${now.value}.doc`, 'application/msword')
  ElMessage.success('Word 文档导出成功')
}

// ── 导出 PDF（通过浏览器打印） ──
function exportPDF() {
  window.print()
}

// ── 通用下载 ──
function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=UTF-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="header-row">
    <h2>阅卷报告 — {{ caseId }} {{ caseName }}</h2>
    <div class="actions">
      <el-button type="primary" :loading="aiRunning" @click="runAIReport">
        {{ aiRunning ? 'AI生成中...' : '🤖 AI 生成报告' }}
      </el-button>
      <el-button type="primary" @click="exportWord">📥 导出 Word</el-button>
      <el-button @click="exportPDF">📥 导出 PDF</el-button>
      <el-button @click="window.print()">🖨️ 打印</el-button>
    </div>
  </div>

  <div class="report-paper">
    <div class="report-title">XX市公安局卷宗审查报告</div>
    <div class="report-meta">报告编号：AI-{{ caseId }}-{{ now }} | 生成日期：{{ now }}</div>

    <div class="section"><div class="section-title">一、犯罪嫌疑人基本情况</div>
      <p>姓名：张某，性别：男，出生日期：1990年3月15日，身份证号：11010219900315XXXX，户籍地：XX省XX市XX区XX路XX号，现住址：XX省XX市XX区XX路XX号。职业：无业，文化程度：初中。前科情况：经查询，无犯罪前科记录。</p>
    </div>

    <div class="section"><div class="section-title">二、案件侦破经过</div>
      <p>2026年6月10日14时许，犯罪嫌疑人张某窜至XX市XX路XX号李某经营的手机店实施盗窃。被害人李某于当日14时30分向公安机关报案。XX派出所于当日15时到场处置。经调取监控录像和走访调查，于6月13日锁定犯罪嫌疑人张某。6月14日，公安机关依法对张某执行拘留。6月18日提请批准逮捕，6月20日移送审查起诉。</p>
    </div>

    <div class="section"><div class="section-title">三、认定犯罪事实</div>
      <p>2026年6月10日14时许，犯罪嫌疑人张某窜至XX市XX路XX号李某经营的手机店，趁李某不备，盗走柜台内价值人民币5000元的手机一部。上述事实有被害人陈述、证人证言、监控录像、价格鉴定意见及嫌疑人供述等证据证实。</p>
    </div>

    <div class="section"><div class="section-title">四、证人证言</div>
      <p>证人王某（男，个体经营者）证实：案发当日14时许，其在手机店对面经营店铺，目击张某进入手机店后匆匆离开，行为可疑。</p>
    </div>

    <div class="section"><div class="section-title">五、被害人陈述</div>
      <p>被害人李某（男，手机店经营者）陈述：2026年6月10日14时许，其发现自己经营的手机店内一部价值5000元的手机被盗。通过查看店内监控录像，发现系张某所为，遂报警。</p>
    </div>

    <div class="section"><div class="section-title">六、量刑分析</div>
      <p>根据《中华人民共和国刑法》第二百六十四条，盗窃公私财物数额较大的，处三年以下有期徒刑、拘役或者管制，并处或者单处罚金。本案涉案金额5000元，达到"数额较大"标准。嫌疑人无前科，到案后供认不讳。</p>
    </div>

    <div class="section"><div class="section-title">七、审查发现问题汇总</div>
      <p class="danger">🔴 高风险 3 项：缺少逮捕证、讯问时间冲突、未通知家属</p>
      <p class="warning">🟡 中风险 5 项：证言记录不规范、物证缺少比例尺等</p>
      <p class="orange">🟢 低风险 2 项：页码模糊、格式不统一</p>
    </div>

    <div class="sign-row">
      <span>审查人：_______________</span>
      <span>日期：_______________</span>
    </div>
  </div>

  <div class="card" style="margin-top:16px;max-width:800px;margin-left:auto;margin-right:auto;">
    <div class="card-title" style="margin-bottom:12px;">导出记录</div>
    <el-table :data="[{ v:'v2', time:'2026-07-12 16:00', format:'Word', user:'张警官' }, { v:'v1', time:'2026-07-12 14:30', format:'PDF', user:'张警官' }]" style="width:100%">
      <el-table-column prop="v" label="版本" width="80" />
      <el-table-column prop="time" label="导出时间" />
      <el-table-column prop="format" label="格式" width="80" />
      <el-table-column prop="user" label="操作人" width="100" />
      <el-table-column label="操作" width="100"><template #default><el-button size="small">📥 下载</el-button></template></el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-row h2 { font-size: 16px; font-weight: 600; }
.actions { display: flex; gap: 8px; }

.report-paper {
  background: #101D33; border: 1px solid #1E3A5F; border-radius: 8px;
  padding: 40px; max-width: 800px; margin: 0 auto;
}
.report-title { text-align: center; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
.report-meta { text-align: center; font-size: 12px; color: #5A7290; margin-bottom: 24px; }
.section { margin-bottom: 24px; }
.section-title { font-weight: 700; font-size: 15px; border-bottom: 1px solid #1E3A5F; padding-bottom: 4px; margin-bottom: 12px; }
.section p { text-indent: 2em; font-size: 14px; line-height: 2.2; color: #E8EDF5; }
.danger { color: #FF4757; }
.warning { color: #FF6B35; }
.orange { color: #FFA502; }
.sign-row { display: flex; justify-content: space-between; margin-top: 32px; color: #5A7290; }
.card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; }
.card-title { font-size: 14px; font-weight: 600; }
</style>

// ================================================================
// reviewStore — 审查状态管理 + AI Gateway 集成
// ================================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReviewIssue, Severity, GraphNode, GraphEdge } from '@/types'
import type { TaskStatus, GatewayEvent, ProviderSnapshot } from '@/types/ai'
import { reviewIssues, graphNodes, graphEdges } from '@/services/mockData'
import { aiGateway } from '@/services/aiGateway'
import { useSettingsStore } from '@/stores/settingsStore'

export const useReviewStore = defineStore('review', () => {
  // ---- State ----
  const issues = ref<ReviewIssue[]>([...reviewIssues])
  const severityFilter = ref<Severity | 'all'>('all')
  const expandedIssueId = ref<number | null>(null)

  // AI 任务状态
  const aiStatus = ref<TaskStatus>('idle')
  const aiProvider = ref('')
  const aiRetryCount = ref(0)
  const aiIsFallback = ref(false)
  const aiEvents = ref<GatewayEvent[]>([])
  const aiSnapshots = ref<ProviderSnapshot[]>([])

  // ---- Getters ----
  const filteredIssues = computed<ReviewIssue[]>(() => {
    if (severityFilter.value === 'all') return issues.value
    return issues.value.filter((i) => i.severity === severityFilter.value)
  })

  const highCount = computed(() => issues.value.filter((i) => i.severity === 'high').length)
  const mediumCount = computed(() => issues.value.filter((i) => i.severity === 'medium').length)
  const lowCount = computed(() => issues.value.filter((i) => i.severity === 'low').length)

  const healthScore = computed(() => {
    const total = issues.value.length
    if (total === 0) return 100
    return Math.max(0, Math.min(100, 100 - highCount.value * 15 - mediumCount.value * 5 - lowCount.value * 2))
  })

  const graphData = computed<{ nodes: GraphNode[]; edges: GraphEdge[] }>(() => ({
    nodes: graphNodes,
    edges: graphEdges,
  }))

  const isAIRunning = computed(() => aiStatus.value === 'fetching' || aiStatus.value === 'retrying')

  // ── 连通性检测 ──
  type ConnStatus = 'checking' | 'online' | 'offline' | 'invalid_key' | 'unknown'
  const connStatus = ref<{ deepseek: ConnStatus; glm4: ConnStatus; local: ConnStatus }>({
    deepseek: 'unknown', glm4: 'unknown', local: 'unknown',
  })

  async function checkConnections() {
    const settingsStore = useSettingsStore()
    const settings = settingsStore.settings

    connStatus.value = { deepseek: 'checking', glm4: 'checking', local: 'checking' }

    const check = async (key: 'deepseek' | 'glm4' | 'local', config: { baseUrl: string; apiKey: string; model: string }) => {
      if (!config.baseUrl) { connStatus.value[key] = 'unknown'; return }
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      try {
        const res = await fetch(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
          body: JSON.stringify({
            model: config.model,
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 1,
          }),
          signal: ctrl.signal,
        })
        clearTimeout(timer)
        if (res.ok) {
          connStatus.value[key] = 'online'
        } else if (res.status === 401 || res.status === 403) {
          connStatus.value[key] = 'invalid_key'
        } else {
          connStatus.value[key] = 'offline'
        }
      } catch {
        clearTimeout(timer)
        connStatus.value[key] = 'offline'
      }
    }

    await Promise.all([
      check('deepseek', settings.deepseek),
      check('glm4', settings.glm4),
      check('local', settings.local),
    ])
  }

  // ---- Actions ----
  function setSeverityFilter(severity: Severity | 'all') { severityFilter.value = severity }
  function toggleIssue(id: number) { expandedIssueId.value = expandedIssueId.value === id ? null : id }
  function markIssueResolved(id: number) {
    issues.value = issues.value.map((i) => (i.id === id ? { ...i, severity: 'low' as Severity } : i))
  }

  // ── AI 审查 ──
  async function runAIReview(caseId: string) {
    aiStatus.value = 'fetching'
    aiEvents.value = []
    aiRetryCount.value = 0
    aiIsFallback.value = false

    const onEvent = (e: GatewayEvent) => {
      aiEvents.value.push(e)
      aiRetryCount.value = e.totalRetries
      if (e.type === 'switching_fallback') aiProvider.value = e.providerName
      if (e.type === 'completed') aiProvider.value = e.providerName
      aiSnapshots.value = aiGateway.getProviderSnapshots() as ProviderSnapshot[]
    }

    try {
      const result = (await aiGateway.execute(
        { taskId: caseId, caseContent: '', reviewType: 'full' },
        onEvent,
      )) as { isFallback?: boolean; issues?: ReviewIssue[]; score?: number; metadata?: { isFallback: boolean; retryCount: number } }

      aiIsFallback.value = result.metadata?.isFallback || result.isFallback || false
      aiStatus.value = aiIsFallback.value ? 'partial_success' : 'success'

      if (result.issues) {
        issues.value = result.issues.map((item, i) => ({
          ...item,
          id: item.id || i + 1,
        }))
      }
    } catch {
      aiStatus.value = 'failed'
      throw new Error('AI 审查失败')
    }
  }

  return {
    issues, severityFilter, expandedIssueId,
    filteredIssues, highCount, mediumCount, lowCount, healthScore, graphData,
    aiStatus, aiProvider, aiRetryCount, aiIsFallback, aiEvents, aiSnapshots, isAIRunning,
    connStatus, checkConnections,
    setSeverityFilter, toggleIssue, markIssueResolved, runAIReview,
  }
})

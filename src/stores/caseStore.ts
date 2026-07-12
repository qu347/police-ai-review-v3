// ================================================================
// caseStore — 案件数据与列表状态管理
// ================================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CaseItem, CaseType } from '@/types'
import { criminalCases, adminCases } from '@/services/mockData'

export const useCaseStore = defineStore('case', () => {
  // ---- State ----
  const activeCaseType = ref<CaseType>('criminal')
  const currentCaseId = ref<string | null>(null)

  // ---- Getters ----
  const criminalList = computed<CaseItem[]>(() => criminalCases)
  const adminList = computed<CaseItem[]>(() => adminCases)
  const allCases = computed<CaseItem[]>(() => [...criminalCases, ...adminCases])

  const currentList = computed<CaseItem[]>(() =>
    activeCaseType.value === 'criminal' ? criminalCases : adminCases,
  )

  const currentCase = computed<CaseItem | undefined>(() =>
    allCases.value.find((c) => c.id === currentCaseId.value),
  )

  const reviewingCount = computed<number>(
    () => allCases.value.filter((c) => c.reviewStatus === 'reviewing').length,
  )

  const doneCount = computed<number>(
    () => allCases.value.filter((c) => c.reviewStatus === 'done').length,
  )

  const riskCount = computed<number>(
    () => allCases.value.filter((c) => c.riskCount > 0).length,
  )

  // ---- Actions ----
  function setCaseType(type: CaseType) {
    activeCaseType.value = type
  }

  function setCurrentCase(id: string | null) {
    currentCaseId.value = id
  }

  return {
    activeCaseType,
    currentCaseId,
    criminalList,
    adminList,
    allCases,
    currentList,
    currentCase,
    reviewingCount,
    doneCount,
    riskCount,
    setCaseType,
    setCurrentCase,
  }
})

// ================================================================
// 公安AI卷宗审查系统 — 全局类型定义
// ================================================================

/** 案件类型 */
export type CaseType = 'criminal' | 'administrative'

/** OCR 解析状态 */
export type OCRStatus = 'pending' | 'parsing' | 'done' | 'failed'

/** 审查状态 */
export type ReviewStatus = 'idle' | 'reviewing' | 'done'

/** 风险等级 */
export type Severity = 'high' | 'medium' | 'low'

/** 文书审查结果 */
export type DocRuleResult = 'match' | 'partial' | 'missing'

/** 程序审查结果 */
export type ProcedureResult = 'pass' | 'fail' | 'partial' | 'na'

// ---- 案件数据 ----

export interface CaseItem {
  id: string
  name: string
  type: CaseType
  pages: number
  ocrStatus: OCRStatus
  ocrProgress?: number
  reviewStatus: ReviewStatus
  riskCount: number
  date: string
}

// ---- 审查问题 ----

export interface ReviewIssue {
  id: number
  severity: Severity
  title: string
  category: string
  detail: string
  locations: string[]
}

// ---- 案件要素 ----

export interface ExtractedElement {
  label: string
  value: string
  confidence: number
}

export interface ElementCard {
  icon: string
  title: string
  items: ExtractedElement[]
}

// ---- 制卷规则 ----

export interface DocRule {
  name: string
  status: DocRuleResult
  note: string
}

// ---- 程序审查 ----

export interface ProcedureItem {
  name: string
  result: ProcedureResult
  detail?: string
}

// ---- 证据审查 ----

export interface EvidenceCategory {
  label: string
  icon: string
  count: number
}

export interface Contradiction {
  point: string
  sourceA: string
  sourceB: string
  analysis: string
}

export interface PersonInfo {
  role: string
  name: string
  idCard?: string
  summary: string
}

// ---- 时间线 ----

export interface TimelineEvent {
  time: string
  label: string
  detail: string
  warn?: boolean
}

// ---- 图谱 ----

export interface GraphNode {
  id: string
  label: string
  type: 'suspect' | 'victim' | 'witness' | 'evidence' | 'document'
  x: number
  y: number
}

export interface GraphEdge {
  from: string
  to: string
  type: 'relation' | 'contradiction' | 'timeline'
}

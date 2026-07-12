// ================================================================
// AI Gateway 核心类型
// ================================================================

/** 任务状态 */
export type TaskStatus = 'idle' | 'fetching' | 'retrying' | 'partial_success' | 'failed' | 'success'

/** AI 错误类型 */
export type AIErrorType = 'timeout' | 'auth_failed' | 'rate_limit' | 'network_error' | 'server_error' | 'unknown'

/** 标准化 AI 错误 */
export interface AIError {
  httpStatus: number
  providerName: string
  type: AIErrorType
  message: string
  timestamp: string
}

/** Provider 运行时快照 */
export interface ProviderSnapshot {
  name: string
  isPrimary: boolean
  status: 'idle' | 'calling' | 'retrying' | 'failed'
  retryCount: number
  lastError: AIError | null
}

/** Gateway 调度事件 */
export type GatewayEventType =
  | 'started' | 'calling_primary' | 'primary_retry'
  | 'switching_fallback' | 'calling_fallback' | 'fallback_retry'
  | 'completed' | 'failed'

export interface GatewayEvent {
  type: GatewayEventType
  providerName: string
  retryCount: number
  totalRetries: number
  error: AIError | null
  timestamp: string
}

export type GatewayCallback = (event: GatewayEvent) => void

/** 审查任务请求 */
export interface ReviewTaskRequest {
  taskId: string
  caseContent: string
  reviewType: 'full' | 'evidence_chain' | 'procedure' | 'elements_only'
  maxRetries?: number
}

/** AI Provider 接口 */
export interface IAIProvider {
  readonly name: string
  readonly isPrimary: boolean
  chatCompletion(request: ReviewTaskRequest, onEvent?: GatewayCallback): Promise<unknown>
}

// ================================================================
// AI Adapter 基类 — 错误规范化 + 超时控制
// ================================================================

import type { AIError, AIErrorType, GatewayCallback } from '@/types/ai'

/** 将 HTTP 状态码映射为 AIErrorType */
export function classifyError(status: number): AIErrorType {
  if (status === 401 || status === 403) return 'auth_failed'
  if (status === 429) return 'rate_limit'
  if (status >= 500) return 'server_error'
  return 'unknown'
}

/** 构建标准 AIError */
export function toAIError(
  providerName: string,
  status: number,
  body: string,
): AIError {
  let msg = body
  try {
    const j = JSON.parse(body)
    msg = j.error?.message || j.error?.code || j.message || body
  } catch { /* keep raw body */ }

  return {
    httpStatus: status,
    providerName,
    type: classifyError(status),
    message: `[${providerName}] HTTP ${status}: ${msg.slice(0, 300)}`,
    timestamp: new Date().toISOString(),
  }
}

/** 带超时的 fetch */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  providerName: string,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } catch (e: unknown) {
    if ((e as Error).name === 'AbortError') {
      throw {
        httpStatus: -1,
        providerName,
        type: 'timeout' as AIErrorType,
        message: `[${providerName}] 请求超时 (${timeoutMs}ms)`,
        timestamp: new Date().toISOString(),
      } as AIError
    }
    throw {
      httpStatus: -1,
      providerName,
      type: 'network_error' as AIErrorType,
      message: `[${providerName}] 网络错误: ${(e as Error).message}`,
      timestamp: new Date().toISOString(),
    } as AIError
  } finally {
    clearTimeout(timer)
  }
}

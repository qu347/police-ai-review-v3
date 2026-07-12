import type { IAIProvider, GatewayCallback } from '@/types/ai'
import { fetchWithTimeout, toAIError } from './base'
import { buildElementsPrompt, buildFullReviewPrompt } from '../prompts'
import type { ReviewTaskRequest } from '@/types/ai'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * 本地模型适配器（Ollama / vLLM / LM Studio 等 OpenAI 兼容 API）
 * 默认地址 http://localhost:11434/v1（Ollama）
 */
export class LocalAdapter implements IAIProvider {
  readonly name = 'local-model'
  readonly isPrimary = false

  private getConfig() {
    try {
      const store = useSettingsStore()
      return store.settings.local
    } catch {
      return { apiKey: '', baseUrl: 'http://localhost:11434/v1', model: 'qwen2.5:7b' }
    }
  }

  async chatCompletion(request: ReviewTaskRequest, _onEvent?: GatewayCallback): Promise<unknown> {
    const config = this.getConfig()

    const isElements = request.reviewType === 'elements_only'
    const systemPrompt = isElements
      ? buildElementsPrompt(request.caseContent)
      : buildFullReviewPrompt(request.caseContent)

    const res = await fetchWithTimeout(
      `${config.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: '你只返回 JSON，不包含任何其他文字。' },
            { role: 'user', content: systemPrompt },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      },
      120000, // 本地模型可能较慢，2 分钟超时
      this.name,
    )

    if (!res.ok) {
      const body = await res.text()
      throw toAIError(this.name, res.status, body)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    try {
      const m = content.match(/\{[\s\S]*\}/)
      return JSON.parse(m ? m[0] : content)
    } catch {
      throw {
        httpStatus: -1, providerName: this.name,
        type: 'unknown' as const,
        message: `[local] 响应解析失败: ${content.slice(0, 200)}`,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

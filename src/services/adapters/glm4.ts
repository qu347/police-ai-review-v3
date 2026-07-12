import type { IAIProvider, GatewayCallback } from '@/types/ai'
import { fetchWithTimeout, toAIError } from './base'
import { buildElementsPrompt, buildFullReviewPrompt } from '../prompts'
import type { ReviewTaskRequest } from '@/types/ai'
import { useSettingsStore } from '@/stores/settingsStore'

export class GLM4Adapter implements IAIProvider {
  readonly name = 'glm-4-flash'
  readonly isPrimary = false

  private getConfig() {
    try {
      const store = useSettingsStore()
      return store.settings.glm4
    } catch {
      return {
        apiKey: import.meta.env.VITE_GLM_API_KEY || '',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'glm-4-flash',
      }
    }
  }

  async chatCompletion(request: ReviewTaskRequest, _onEvent?: GatewayCallback): Promise<unknown> {
    const config = this.getConfig()
    if (!config.apiKey) {
      throw {
        httpStatus: 401, providerName: this.name,
        type: 'auth_failed' as const,
        message: '[glm-4-flash] API Key 未配置，请在系统设置中填写',
        timestamp: new Date().toISOString(),
      }
    }

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
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: '你只返回 JSON，不包含任何其他文字。' },
            { role: 'user', content: systemPrompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        }),
      },
      45000,
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
        message: `[glm-4-flash] 响应解析失败: ${content.slice(0, 200)}`,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

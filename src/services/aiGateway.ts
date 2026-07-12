import type { GatewayEvent, GatewayCallback, AIError, ProviderSnapshot, ReviewTaskRequest, IAIProvider } from '@/types/ai'
import { DeepSeekAdapter } from './adapters/deepseek'
import { GLM4Adapter } from './adapters/glm4'
import { LocalAdapter } from './adapters/local'

export class AIGatewayService {
  private adapters: IAIProvider[]
  private maxRetries: number
  private totalRetries = 0
  private providers: ProviderSnapshot[] = []

  constructor(maxRetries = 2) {
    this.adapters = [
      new DeepSeekAdapter(),
      new GLM4Adapter(),
      new LocalAdapter(),
    ]
    this.maxRetries = maxRetries
    this.resetSnapshots()
  }

  private resetSnapshots() {
    this.providers = this.adapters.map((a) => ({
      name: a.name, isPrimary: a.isPrimary, status: 'idle' as const,
      retryCount: 0, lastError: null,
    }))
    this.totalRetries = 0
  }

  getProviderSnapshots(): readonly ProviderSnapshot[] { return this.providers }

  async execute(request: ReviewTaskRequest, onEvent?: GatewayCallback): Promise<unknown> {
    this.resetSnapshots()

    onEvent?.({
      type: 'started', providerName: this.adapters[0].name, retryCount: 0,
      totalRetries: 0, error: null, timestamp: new Date().toISOString(),
    })

    // 遍历每个 Provider 梯队
    for (let pi = 0; pi < this.adapters.length; pi++) {
      const adapter = this.adapters[pi]
      const snap = this.providers[pi]

      // 每个 Provider 最多重试 maxRetries 次
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        snap.status = attempt > 0 ? 'retrying' : 'calling'
        snap.retryCount = attempt

        const evtType = pi > 0
          ? (attempt > 0 ? 'fallback_retry' : 'calling_fallback')
          : (attempt > 0 ? 'primary_retry' : 'calling_primary')

        onEvent?.({
          type: evtType as GatewayEvent['type'],
          providerName: adapter.name, retryCount: attempt,
          totalRetries: this.totalRetries, error: snap.lastError,
          timestamp: new Date().toISOString(),
        })

        try {
          const result = await adapter.chatCompletion(request, onEvent)
          onEvent?.({
            type: 'completed', providerName: adapter.name, retryCount: attempt,
            totalRetries: this.totalRetries, error: null,
            timestamp: new Date().toISOString(),
          })
          return {
            ...(result as object),
            metadata: { retryCount: this.totalRetries, isFallback: pi > 0, provider: adapter.name },
          }
        } catch (e) {
          this.totalRetries++
          const ae = e as AIError
          snap.lastError = ae
          if (ae.type === 'auth_failed' || ae.type === 'rate_limit') break
          if (attempt >= this.maxRetries) break
          if (attempt < this.maxRetries) await delay(800)
        }
      }

      snap.status = 'failed'

      // 还有下一级？
      if (pi < this.adapters.length - 1) {
        onEvent?.({
          type: 'switching_fallback',
          providerName: this.adapters[pi + 1].name, retryCount: 0,
          totalRetries: this.totalRetries, error: snap.lastError,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // 全灭
    onEvent?.({
      type: 'failed', providerName: 'none', retryCount: 0,
      totalRetries: this.totalRetries,
      error: this.providers[this.providers.length - 1].lastError,
      timestamp: new Date().toISOString(),
    })
    throw this.providers[this.providers.length - 1].lastError
  }
}

function delay(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)) }

export const aiGateway = new AIGatewayService()

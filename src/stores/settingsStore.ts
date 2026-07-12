// ================================================================
// settingsStore — AI 模型配置（持久化到 localStorage）
// ================================================================

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface ProviderConfig {
  apiKey: string
  baseUrl: string
  model: string
}

export interface SettingsState {
  deepseek: ProviderConfig
  glm4: ProviderConfig
  local: ProviderConfig
}

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem('police-ai-settings')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    deepseek: {
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
    },
    glm4: {
      apiKey: import.meta.env.VITE_GLM_API_KEY || '',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4-flash',
    },
    local: {
      apiKey: '',
      baseUrl: 'http://localhost:11434/v1',
      model: 'qwen2.5:7b',
    },
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<SettingsState>(loadSettings())

  // 自动持久化
  watch(settings, (val) => {
    localStorage.setItem('police-ai-settings', JSON.stringify(val))
  }, { deep: true })

  function saveAll(s: SettingsState) {
    settings.value = { ...s }
  }

  function resetToDefaults() {
    settings.value = {
      deepseek: { apiKey: '', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
      glm4: { apiKey: '', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
      local: { apiKey: '', baseUrl: 'http://localhost:11434/v1', model: 'qwen2.5:7b' },
    }
    localStorage.removeItem('police-ai-settings')
  }

  return { settings, saveAll, resetToDefaults }
})

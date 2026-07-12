<script setup lang="ts">
import { reactive } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { ElMessage } from 'element-plus'

const store = useSettingsStore()
const form = reactive({
  deepseek: { ...store.settings.deepseek },
  glm4: { ...store.settings.glm4 },
  local: { ...store.settings.local },
})

function save() {
  store.saveAll({
    deepseek: { ...form.deepseek },
    glm4: { ...form.glm4 },
    local: { ...form.local },
  })
  ElMessage.success('配置已保存，下次 AI 调用生效')
}

function reset() {
  store.resetToDefaults()
  form.deepseek = { ...store.settings.deepseek }
  form.glm4 = { ...store.settings.glm4 }
  form.local = { ...store.settings.local }
  ElMessage.success('已恢复默认配置')
}
</script>

<template>
  <h2 style="font-size:16px;margin-bottom:20px;">系统设置 — AI 模型配置</h2>

  <div class="grid-2">
    <!-- DeepSeek 主模型 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">🔵 主模型 — DeepSeek</span>
        <el-tag type="primary" size="small">优先级最高</el-tag>
      </div>
      <div class="form-group">
        <label>API Key</label>
        <el-input v-model="form.deepseek.apiKey" placeholder="sk-xxxxxxxx" show-password />
        <span class="hint">从 <a href="https://platform.deepseek.com" target="_blank">platform.deepseek.com</a> 获取</span>
      </div>
      <div class="form-group">
        <label>API 地址</label>
        <el-input v-model="form.deepseek.baseUrl" placeholder="https://api.deepseek.com/v1" />
      </div>
      <div class="form-group">
        <label>模型名称</label>
        <el-input v-model="form.deepseek.model" placeholder="deepseek-chat" />
      </div>
    </div>

    <!-- GLM-4 备用模型 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">🟠 备用模型 — 智谱 GLM-4</span>
        <el-tag type="warning" size="small">主模型不可用时接管</el-tag>
      </div>
      <div class="form-group">
        <label>API Key</label>
        <el-input v-model="form.glm4.apiKey" placeholder="xxxxxxxx" show-password />
        <span class="hint">从 <a href="https://open.bigmodel.cn" target="_blank">open.bigmodel.cn</a> 获取</span>
      </div>
      <div class="form-group">
        <label>API 地址</label>
        <el-input v-model="form.glm4.baseUrl" placeholder="https://open.bigmodel.cn/api/paas/v4" />
      </div>
      <div class="form-group">
        <label>模型名称</label>
        <el-input v-model="form.glm4.model" placeholder="glm-4-flash" />
      </div>
    </div>

    <!-- 本地模型 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">🟢 本地模型 — Ollama / vLLM</span>
        <el-tag type="success" size="small">内网部署 · 无需外网</el-tag>
      </div>
      <div class="form-group">
        <label>API Key（可选，Ollama 留空）</label>
        <el-input v-model="form.local.apiKey" placeholder="本地部署通常不需要 Key" />
      </div>
      <div class="form-group">
        <label>API 地址</label>
        <el-input v-model="form.local.baseUrl" placeholder="http://localhost:11434/v1" />
        <span class="hint">Ollama 默认 11434 端口，vLLM 默认 8000 端口</span>
      </div>
      <div class="form-group">
        <label>模型名称</label>
        <el-input v-model="form.local.model" placeholder="qwen2.5:7b / llama3:8b" />
        <span class="hint">运行 <code>ollama list</code> 查看已安装模型</span>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:16px;">
    <div class="card-header"><span class="card-title">🔧 操作</span></div>
    <div style="display:flex;gap:12px;">
      <el-button type="primary" @click="save">💾 保存配置</el-button>
      <el-button @click="reset">🔄 恢复默认</el-button>
    </div>
    <div class="note">
      ⚠️ 配置保存在浏览器本地存储中。生产环境建议通过后端代理调用 AI API，避免前端暴露 API Key。
    </div>
  </div>
</template>

<style scoped lang="scss">
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card { background: #162540; border: 1px solid #1E3A5F; border-radius: 8px; padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #1E3A5F; }
.card-title { font-size: 14px; font-weight: 600; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 12px; color: #8FA4BE; margin-bottom: 4px; }
.hint { display: block; font-size: 11px; color: #5A7290; margin-top: 4px; }
.hint a { color: #00D4FF; }
.note { margin-top: 16px; font-size: 11px; color: #FF6B35; padding: 10px; background: rgba(255,107,53,.06); border-radius: 6px; }

:deep(.el-input__inner) { background: #0F1D30; color: #E8EDF5; border-color: #1E3A5F; }
:deep(.el-input__inner::placeholder) { color: #5A7290; }
</style>

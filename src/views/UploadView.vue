<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useCaseStore } from '@/stores/caseStore'

const router = useRouter()
const caseStore = useCaseStore()

interface FileItem {
  id: number
  name: string
  status: 'pending' | 'parsing' | 'done' | 'failed'
  progress: number
  caseId?: string
}

const dragOver = ref(false)
const fileInput = ref<HTMLInputElement>()
const fileList = ref<FileItem[]>([])
let fileIdCounter = 0

// 点击上传区域 → 打开文件选择器
function openFilePicker() {
  fileInput.value?.click()
}

// 文件选择器变更
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    addFiles(Array.from(input.files))
    input.value = '' // 清空以便重复选同一个文件
  }
}

// 拖拽上传
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  if (e.dataTransfer?.files.length) {
    addFiles(Array.from(e.dataTransfer.files))
  }
}

function addFiles(files: File[]) {
  files.forEach((f) => {
    const item: FileItem = {
      id: ++fileIdCounter,
      name: f.name,
      status: 'parsing',
      progress: 0,
    }
    fileList.value.unshift(item)
    simulateOCR(item)
  })
  ElMessage.success(`已接收 ${files.length} 个文件，开始 OCR 解析...`)
}

// 模拟 OCR 解析进度
function simulateOCR(item: FileItem) {
  const interval = setInterval(() => {
    const idx = fileList.value.findIndex((f) => f.id === item.id)
    if (idx === -1) { clearInterval(interval); return }

    const current = fileList.value[idx]
    const newProgress = Math.min(100, current.progress + Math.floor(Math.random() * 15) + 5)

    if (newProgress >= 100) {
      const isSuccess = Math.random() > 0.15
      const status = isSuccess ? 'done' : 'failed'
      fileList.value[idx] = { ...current, progress: 100, status }

      // OCR 完成后自动创建案件
      if (isSuccess) {
        const caseId = `A-2026-${String(fileIdCounter + 100).padStart(3, '0')}`
        fileList.value[idx] = { ...fileList.value[idx], caseId }
        ElMessage.success(`"${item.name}" 解析完成，已加入卷宗管理列表`)
      }

      clearInterval(interval)
    } else {
      fileList.value[idx] = { ...current, progress: newProgress }
    }
  }, 400)
}

// 重试失败的 OCR
function retryOCR(item: FileItem) {
  const idx = fileList.value.findIndex((f) => f.id === item.id)
  if (idx === -1) return
  fileList.value[idx] = { ...item, status: 'parsing', progress: 0 }
  simulateOCR(fileList.value[idx])
}

// 移除队列项
function removeItem(item: FileItem) {
  fileList.value = fileList.value.filter((f) => f.id !== item.id)
}

// 全部重新解析
function reparseAll() {
  fileList.value = fileList.value.map((f) =>
    f.status === 'failed' ? { ...f, status: 'parsing' as const, progress: 0 } : f,
  )
  fileList.value
    .filter((f) => f.status === 'parsing')
    .forEach((f) => simulateOCR(f))
  ElMessage.success('已发起全部重新解析')
}

function pullFromSystem() {
  ElMessage.info('对接卷宗管理系统中，请输入案号...')
}
</script>

<template>
  <div class="grid-2">
    <div>
      <!-- 隐藏文件输入 -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.zip"
        style="display:none"
        @change="onFileChange"
      />

      <!-- 上传区域 -->
      <div
        class="upload-zone"
        :class="{ 'drag-over': dragOver }"
        @click="openFilePicker"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop="onDrop"
      >
        <div class="upload-icon">📁</div>
        <div class="upload-text">拖拽卷宗文件到此区域，或点击选择</div>
        <div class="upload-hint">支持 PDF / JPG / PNG / ZIP 批量上传</div>
      </div>

      <div style="margin-top:12px;display:flex;gap:8px;">
        <el-button type="primary" @click="openFilePicker">📤 选择文件上传</el-button>
        <el-button @click="pullFromSystem">🔗 对接卷宗系统</el-button>
      </div>
    </div>

    <!-- OCR 解析队列 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">OCR 解析队列（{{ fileList.length }}）</span>
        <div style="display:flex;gap:8px;">
          <el-button size="small" @click="reparseAll" :disabled="fileList.length === 0">全部重新解析</el-button>
          <el-button size="small" @click="fileList = []" :disabled="fileList.length === 0">清空队列</el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="fileList.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无文件，请上传卷宗</div>
      </div>

      <!-- 文件列表 -->
      <div v-for="item in fileList" :key="item.id" class="queue-item">
        <div class="queue-left">
          <span class="file-name">📄 {{ item.name }}</span>
          <el-progress
            v-if="item.status === 'parsing'"
            :percentage="item.progress"
            :stroke-width="4"
            style="width:140px;margin-top:4px;"
          />
        </div>
        <div class="queue-right">
          <el-tag v-if="item.status === 'done'" type="success" size="small">✓ 完成</el-tag>
          <el-tag v-else-if="item.status === 'parsing'" type="warning" size="small">解析中 {{ item.progress }}%</el-tag>
          <el-tag v-else-if="item.status === 'failed'" type="danger" size="small">✗ 失败</el-tag>
          <el-tag v-else type="info" size="small">等待中</el-tag>

          <el-button
            v-if="item.status === 'done'"
            size="small"
            type="primary"
            @click="router.push(`/case/${item.caseId || 'A-2026-001'}/overview`)"
          >
            开始审查
          </el-button>
          <el-button
            v-if="item.status === 'failed'"
            size="small"
            type="primary"
            text
            @click="retryOCR(item)"
          >
            重试
          </el-button>
          <el-button size="small" text style="color:#5A7290;" @click="removeItem(item)">
            ✕
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.card {
  background: #162540;
  border: 1px solid #1E3A5F;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #1E3A5F;
}

.card-title { font-size: 14px; font-weight: 600; }

.upload-zone {
  border: 2px dashed #1E3A5F;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
  background: #0F1D30;

  &:hover, &.drag-over {
    border-color: #00D4FF;
    background: rgba(0, 212, 255, .05);
  }
}

.upload-icon { font-size: 48px; margin-bottom: 12px; }
.upload-text { font-size: 14px; color: #8FA4BE; }
.upload-hint { font-size: 12px; color: #5A7290; margin-top: 8px; }

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #5A7290;
  padding: 40px 0;
}

.empty-icon { font-size: 36px; margin-bottom: 8px; }
.empty-text { font-size: 13px; }

.queue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #1E3A5F;
  font-size: 13px;

  &:last-child { border-bottom: none; }
}

.queue-left {
  flex: 1;
  min-width: 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.queue-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: 8px;
}
</style>

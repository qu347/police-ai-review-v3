<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useReviewStore } from '@/stores/reviewStore'

const router = useRouter()
const route = useRoute()
const reviewStore = useReviewStore()

interface NavItem {
  path: string
  label: string
  icon: string
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

const currentCaseId = computed(() => {
  const id = route.params.id as string
  return id || 'A-2026-001'
})

const navSections = computed<NavSection[]>(() => {
  const cid = currentCaseId.value
  return [
    {
      title: '主菜单',
      items: [
        { path: '/dashboard', label: '案件管控中枢', icon: '📊' },
        { path: '/upload', label: '卷宗上传', icon: '📤' },
        { path: '/archives', label: '卷宗管理', icon: '📋' },
      ],
    },
    {
      title: '审查功能',
      items: [
        { path: `/case/${cid}/elements`, label: '要素提取', icon: '🔍' },
        { path: `/case/${cid}/overview`, label: '卷宗总览', icon: '📈', badge: reviewStore.highCount },
        { path: `/case/${cid}/doc-rules`, label: '制卷规则', icon: '📑' },
        { path: `/case/${cid}/procedure`, label: '程序审查', icon: '⚖️' },
        { path: `/case/${cid}/evidence`, label: '证据审查', icon: '🕸️' },
        { path: `/case/${cid}/doc-review`, label: '文书审查', icon: '📝' },
        { path: `/case/${cid}/analysis`, label: '案件分析', icon: '🕐' },
      ],
    },
    {
      title: '输出',
      items: [
        { path: `/case/${cid}/report`, label: '阅卷报告', icon: '📄' },
      ],
    },
    {
      title: '系统',
      items: [
        { path: '/settings', label: '系统设置', icon: '⚙️' },
      ],
    },
  ]
})

const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/')
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">盾</div>
      <div>
        <div class="logo-text">AI卷宗审查</div>
        <div class="logo-sub">公安智能办案辅助</div>
      </div>
    </div>

    <nav v-for="section in navSections" :key="section.title" class="nav-section">
      <div class="nav-section-title">{{ section.title }}</div>
      <a
        v-for="item in section.items"
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click.prevent="navigate(item.path)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
        <span v-if="item.badge && item.badge > 0" class="badge">{{ item.badge }}</span>
      </a>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #101D33;
  border-right: 1px solid #1E3A5F;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-logo {
  padding: 20px 16px;
  border-bottom: 1px solid #1E3A5F;
  display: flex;
  align-items: center;
  gap: 10px;

  .logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #00D4FF, #0088CC);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #fff;
    font-weight: bold;
  }

  .logo-text {
    font-size: 15px;
    font-weight: 700;
    color: #E8EDF5;
  }

  .logo-sub {
    font-size: 11px;
    color: #5A7290;
  }
}

.nav-section {
  padding: 8px 0;
}

.nav-section-title {
  padding: 8px 16px 4px;
  font-size: 11px;
  color: #5A7290;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  color: #8FA4BE;
  cursor: pointer;
  border-left: 3px solid transparent;
  font-size: 13px;
  text-decoration: none;
  transition: 0.2s ease;

  &:hover {
    background: #162540;
    color: #E8EDF5;
  }

  &.active {
    background: rgba(0, 212, 255, 0.15);
    color: #00D4FF;
    border-left-color: #00D4FF;
    font-weight: 600;
  }

  .nav-icon {
    width: 18px;
    text-align: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  .badge {
    margin-left: auto;
    background: #FF4757;
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
  }
}
</style>

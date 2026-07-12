import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: '中枢大屏', icon: 'DataBoard' },
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/UploadView.vue'),
    meta: { title: '卷宗上传', icon: 'Upload' },
  },
  {
    path: '/archives',
    name: 'Archives',
    component: () => import('@/views/ArchivesView.vue'),
    meta: { title: '卷宗管理', icon: 'Document' },
  },
  {
    path: '/case/:id/elements',
    name: 'Elements',
    component: () => import('@/views/ElementsView.vue'),
    meta: { title: '要素提取', icon: 'Search' },
  },
  {
    path: '/case/:id/overview',
    name: 'Overview',
    component: () => import('@/views/OverviewView.vue'),
    meta: { title: '卷宗总览', icon: 'DataAnalysis' },
  },
  {
    path: '/case/:id/doc-rules',
    name: 'DocRules',
    component: () => import('@/views/DocRulesView.vue'),
    meta: { title: '制卷规则审查', icon: 'Memo' },
  },
  {
    path: '/case/:id/procedure',
    name: 'Procedure',
    component: () => import('@/views/ProcedureView.vue'),
    meta: { title: '程序审查', icon: 'Checked' },
  },
  {
    path: '/case/:id/evidence',
    name: 'Evidence',
    component: () => import('@/views/EvidenceView.vue'),
    meta: { title: '证据审查', icon: 'Connection' },
  },
  {
    path: '/case/:id/doc-review',
    name: 'DocReview',
    component: () => import('@/views/DocReviewView.vue'),
    meta: { title: '文书审查', icon: 'Tickets' },
  },
  {
    path: '/case/:id/analysis',
    name: 'Analysis',
    component: () => import('@/views/AnalysisView.vue'),
    meta: { title: '案件分析', icon: 'TrendCharts' },
  },
  {
    path: '/case/:id/report',
    name: 'Report',
    component: () => import('@/views/ReportView.vue'),
    meta: { title: '阅卷报告', icon: 'Files' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '系统设置', icon: 'Setting' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

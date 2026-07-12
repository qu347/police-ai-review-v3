# 公安 AI 卷宗审查系统 v3

基于 Vue 3 + TypeScript 的公安智能卷宗审查平台，集成多模型 AI 调度网关，支持案件管控、要素提取、合规审查、证据图谱及阅卷报告导出。

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 语言 | TypeScript |
| 构建 | Vite 5 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| UI 组件 | Element Plus |
| 知识图谱 | AntV G6 (力导向布局) |
| 样式 | Sass |
| AI 模型 | DeepSeek / GLM-4 / 本地 (Ollama / vLLM) |

## 功能模块

- **案件管控中枢** — 刑事/行政案件分类大屏，统计卡片 + 趋势图
- **卷宗上传** — 拖拽/选择上传 + OCR 解析模拟
- **卷宗管理** — 搜索筛选列表 + 扫描件预览抽屉
- **要素提取** — AI 自动提取涉案人员、案件信息、文书、捺印、公章
- **卷宗总览（体检报告）** — 风险仪表盘 + 问题分级列表 + 溯源对比
- **制卷规则审查** — 对标公安机关示范案卷指南，左右对照
- **程序审查** — 15 项程序合规检查 + 案件办理时间线
- **证据审查** — 证据目录 + 知识图谱 + 供述矛盾分析
- **文书规则审查** — 回执书/登记表/通知书/决定书/笔录分类审查
- **案件分析** — 嫌疑人画像 + 侦破时间线 + AI 犯罪事实认定
- **阅卷报告** — Word/PDF 导出 + 打印
- **系统设置** — 网页端配置 AI 模型 Key/地址/模型名

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 7892）
npm run dev

# 构建生产版本
npm run build
```

浏览器打开 `http://localhost:7892`。

## AI 模型配置

进入 **系统设置** 页面，配置以下模型：

| 模型 | 默认地址 | 说明 |
|---|---|---|
| DeepSeek (主) | `https://api.deepseek.com/v1` | 优先调用，支持 chat / reasoner |
| GLM-4 (备用) | `https://open.bigmodel.cn/api/paas/v4` | 主模型不可用时自动接管 |
| 本地模型 (兜底) | `http://localhost:11434/v1` | 内网部署，Ollama / vLLM 均可 |

**调度策略：** DeepSeek → (重试 2 次) → GLM-4 → 本地模型

API Key 存储在浏览器 localStorage，开发环境可在 `.env` 中配置：

```
VITE_DEEPSEEK_API_KEY=sk-xxx
VITE_GLM_API_KEY=xxx
```

> ⚠️ 生产环境建议通过后端代理调用 AI API，避免前端暴露 Key。

## 项目结构

```
src/
├── main.ts                    # 入口
├── App.vue                    # 根组件
├── types/                     # TypeScript 类型定义
├── router/                    # 路由配置
├── stores/                    # Pinia 状态管理
│   ├── caseStore.ts           #   案件数据
│   ├── reviewStore.ts         #   审查状态 + AI 任务
│   └── settingsStore.ts       #   AI 模型配置
├── services/
│   ├── mockData.ts            #   静态演示数据
│   ├── prompts.ts             #   AI Prompt 模板
│   ├── aiGateway.ts           #   AI 调度核心
│   └── adapters/              #   各模型适配器
├── components/                # 全局组件
│   ├── AppLayout.vue          #   布局壳
│   ├── AppSidebar.vue         #   侧边导航
│   ├── AppTopbar.vue          #   顶栏 + AI 状态
│   ├── GlobalWatermark.vue    #   防泄密水印
│   ├── StatCard.vue           #   统计卡片
│   └── EvidenceGraph.vue      #   知识图谱
├── views/                     # 页面视图 (12 个)
└── styles/                    # 全局样式
```

## AI 调用流程

```
用户点击 AI 按钮
    │
    ▼
AIGatewayService.execute()
    │
    ├─ ① DeepSeek ── 成功 → 返回 JSON → 更新 Store → 页面刷新
    │      └─ 失败 → 重试 2 次
    │           └─ 仍失败 → 降级
    │
    ├─ ② GLM-4 ──── 成功 → 返回 JSON → 更新 Store → 页面刷新
    │      └─ 失败 → 降级
    │
    └─ ③ 本地模型 ─ 成功/失败
```

启动时自动检测各模型连通性，右上角实时显示 AI 状态（就绪/密钥错误/无法连接）。

## 设计规范

- 政务深蓝大屏风格 (`#0A1628` 底色)
- 强调色 `#00D4FF` / 警告 `#FF6B35` / 危险 `#FF4757` / 成功 `#2ED573`
- 全屏防泄密水印覆盖
- 身份证号脱敏展示
- 所有 AI 结果标注"AI 生成，仅供参考"

## License

内部项目，未开放 License。

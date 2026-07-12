// ================================================================
// Mock 数据服务 — 生产环境替换为真实 API 调用
// ================================================================

import type {
  CaseItem,
  ReviewIssue,
  ElementCard,
  DocRule,
  ProcedureItem,
  EvidenceCategory,
  Contradiction,
  PersonInfo,
  TimelineEvent,
  GraphNode,
  GraphEdge,
} from '@/types'

// ---- 案件列表 ----

export const criminalCases: CaseItem[] = [
  { id: 'A-2026-001', name: '张某盗窃案', type: 'criminal', pages: 45, ocrStatus: 'done', reviewStatus: 'reviewing', riskCount: 3, date: '2026-06-15' },
  { id: 'A-2026-002', name: '李某诈骗案', type: 'criminal', pages: 32, ocrStatus: 'parsing', ocrProgress: 60, reviewStatus: 'idle', riskCount: 0, date: '2026-06-20' },
  { id: 'A-2026-003', name: '王某故意伤害案', type: 'criminal', pages: 58, ocrStatus: 'done', reviewStatus: 'done', riskCount: 0, date: '2026-06-10' },
  { id: 'A-2026-004', name: '赵某抢劫案', type: 'criminal', pages: 41, ocrStatus: 'done', reviewStatus: 'reviewing', riskCount: 4, date: '2026-06-18' },
  { id: 'A-2026-005', name: '刘某贩毒案', type: 'criminal', pages: 120, ocrStatus: 'done', reviewStatus: 'reviewing', riskCount: 7, date: '2026-05-28' },
  { id: 'A-2026-006', name: '陈某强奸案', type: 'criminal', pages: 67, ocrStatus: 'done', reviewStatus: 'done', riskCount: 0, date: '2026-06-01' },
  { id: 'A-2026-007', name: '黄某寻衅滋事案', type: 'criminal', pages: 35, ocrStatus: 'failed', reviewStatus: 'idle', riskCount: 0, date: '2026-07-01' },
  { id: 'A-2026-008', name: '周某职务侵占案', type: 'criminal', pages: 89, ocrStatus: 'done', reviewStatus: 'reviewing', riskCount: 3, date: '2026-06-25' },
]

export const adminCases: CaseItem[] = [
  { id: 'B-2026-001', name: '王某扰乱公共秩序案', type: 'administrative', pages: 18, ocrStatus: 'done', reviewStatus: 'done', riskCount: 0, date: '2026-07-05' },
  { id: 'B-2026-002', name: '李某赌博案', type: 'administrative', pages: 22, ocrStatus: 'done', reviewStatus: 'reviewing', riskCount: 1, date: '2026-07-03' },
  { id: 'B-2026-003', name: '赵某殴打他人案', type: 'administrative', pages: 25, ocrStatus: 'parsing', ocrProgress: 35, reviewStatus: 'idle', riskCount: 0, date: '2026-07-08' },
  { id: 'B-2026-004', name: '陈某吸毒案', type: 'administrative', pages: 15, ocrStatus: 'done', reviewStatus: 'done', riskCount: 0, date: '2026-07-01' },
  { id: 'B-2026-005', name: '刘某盗窃案(行政)', type: 'administrative', pages: 19, ocrStatus: 'done', reviewStatus: 'reviewing', riskCount: 2, date: '2026-07-06' },
]

// ---- 审查问题 ----

export const reviewIssues: ReviewIssue[] = [
  { id: 1, severity: 'high', title: '缺少逮捕证', category: '程序审查', detail: '根据《刑事诉讼法》相关规定，对犯罪嫌疑人采取逮捕措施后应在24小时内通知家属，案卷中缺少《逮捕证》及《逮捕通知书》。', locations: ['卷宗目录 第3项应为"逮捕证"，当前缺失'] },
  { id: 2, severity: 'high', title: '讯问笔录时间与拘留证时间冲突', category: '程序审查', detail: '讯问笔录记载时间为2026-06-15 14:30，但拘留证记载拘留时间为2026-06-14 10:00。根据规定拘留后24小时内应当讯问，此处存在时间逻辑矛盾。', locations: ['讯问笔录 P12', '拘留证 P5'] },
  { id: 3, severity: 'high', title: '拘留后未通知家属', category: '程序审查', detail: '拘留证签发日期为2026-06-14，但案卷中未查见《拘留通知书》回执或相关文书。', locations: [] },
  { id: 4, severity: 'medium', title: '证人证言记录不规范', category: '证据审查', detail: '证人王某的证言记录缺少询问人签名及询问时间，不符合证据规范要求。', locations: ['证人证言 P52'] },
  { id: 5, severity: 'medium', title: '物证照片缺少比例尺', category: '证据审查', detail: '物证照片（手机）未放置比例尺，影响证据的客观展示效果。', locations: ['物证照片 P60'] },
  { id: 6, severity: 'medium', title: '鉴定意见缺少鉴定人资质证明', category: '证据审查', detail: '价格鉴定意见书未附鉴定人的资质证明文件。', locations: ['鉴定意见 P75'] },
  { id: 7, severity: 'medium', title: '立案回执送达超期', category: '文书审查', detail: '立案回执应在立案后3日内送达被害人，但送达回执显示为立案后第5日。', locations: ['送达回执 P8'] },
  { id: 8, severity: 'medium', title: '卷宗目录缺少"证据材料"子目录', category: '制卷规则', detail: '按照公安机关刑事案件示范案卷指南，证据材料需建立独立子目录并编号。', locations: [] },
  { id: 9, severity: 'low', title: '部分页码模糊', category: '卷宗质量', detail: '第23、24页扫描件存在模糊区域，可能影响OCR识别精度。', locations: ['P23-24'] },
  { id: 10, severity: 'low', title: '讯问笔录格式不统一', category: '文书审查', detail: '第一次与第二次讯问笔录使用的模板格式不一致。', locations: ['P9, P18'] },
]

// ---- 案件要素 ----

export const elementCards: ElementCard[] = [
  {
    icon: '👤', title: '涉案人员',
    items: [
      { label: '嫌疑人', value: '张某', confidence: 0.92 },
      { label: '身份证', value: '11010219900315XXXX', confidence: 0.95 },
      { label: '被害人', value: '李某', confidence: 0.88 },
      { label: '证人', value: '王某', confidence: 0.85 },
    ],
  },
  {
    icon: '📋', title: '案件基本信息',
    items: [
      { label: '案由', value: '盗窃', confidence: 0.97 },
      { label: '立案日期', value: '2026-06-15', confidence: 0.91 },
      { label: '案发地点', value: 'XX市XX路手机店', confidence: 0.89 },
      { label: '涉案金额', value: '¥5,000', confidence: 0.86 },
    ],
  },
  {
    icon: '📄', title: '文书信息',
    items: [
      { label: '立案决定书', value: '✓ 已识别', confidence: 0.96 },
      { label: '拘留证', value: '✓ 已识别', confidence: 0.94 },
      { label: '逮捕证', value: '⚠ 缺失', confidence: 1 },
      { label: '讯问笔录', value: '✓ 3份', confidence: 0.90 },
    ],
  },
  {
    icon: '🔴', title: '捺印检测',
    items: [
      { label: 'P12 签名处', value: '已检测', confidence: 0.92 },
      { label: 'P28 签名处', value: '已检测', confidence: 0.88 },
      { label: 'P45 签名处', value: '已检测', confidence: 0.85 },
    ],
  },
  {
    icon: '🔴', title: '公章检测',
    items: [
      { label: '立案决定书', value: '已检测', confidence: 0.95 },
      { label: '拘留证', value: '已检测', confidence: 0.90 },
      { label: '鉴定意见', value: '已检测', confidence: 0.87 },
    ],
  },
]

// ---- 制卷规则 ----

export const docRules: DocRule[] = [
  { name: '1. 立案决定书', status: 'match', note: '匹配 → P1-2' },
  { name: '2. 拘留证', status: 'match', note: '匹配 → P3-4' },
  { name: '3. 逮捕证', status: 'missing', note: '缺失' },
  { name: '4. 起诉意见书', status: 'match', note: '匹配 → P5-8' },
  { name: '5. 讯问笔录', status: 'partial', note: '部分匹配 → P9-45' },
  { name: '6. 证人证言', status: 'match', note: '匹配 → P46-52' },
  { name: '7. 被害人陈述', status: 'match', note: '匹配 → P28-32' },
  { name: '8. 物证清单', status: 'match', note: '匹配 → P53-55' },
  { name: '9. 书证材料', status: 'match', note: '匹配 → P56-58' },
  { name: '10. 鉴定意见', status: 'partial', note: '格式不符' },
  { name: '11. 勘验/检查笔录', status: 'match', note: '匹配 → P59-65' },
  { name: '12. 视听资料清单', status: 'missing', note: '缺失' },
]

// ---- 程序审查 ----

export const procedures: ProcedureItem[] = [
  { name: '受案登记是否在规定时限内', result: 'pass' },
  { name: '立案审查是否经审批', result: 'pass' },
  { name: '拘留后24小时内是否讯问', result: 'fail', detail: '讯问发生在拘留后约28小时' },
  { name: '拘留后是否通知家属', result: 'fail', detail: '未查见拘留通知书回执' },
  { name: '是否在规定期限内提请逮捕', result: 'pass' },
  { name: '逮捕后是否在24h内讯问', result: 'pass' },
  { name: '讯问未成年人是否有合适成年人到场', result: 'na', detail: '嫌疑人为成年人' },
  { name: '是否告知犯罪嫌疑人诉讼权利', result: 'pass' },
  { name: '辨认程序是否符合规定', result: 'pass' },
  { name: '鉴定意见是否告知犯罪嫌疑人', result: 'pass' },
  { name: '侦查羁押期限是否超期', result: 'pass' },
  { name: '移送审查起诉是否在规定期限内', result: 'pass' },
  { name: '涉案财物处置是否合规', result: 'partial', detail: '扣押清单中一项物品未注明特征' },
  { name: '同步录音录像是否完整', result: 'pass' },
  { name: '法律文书送达是否合规', result: 'fail', detail: '立案回执送达超期' },
]

// ---- 证据审查 ----

export const evidenceCategories: EvidenceCategory[] = [
  { label: '物证', icon: '🔧', count: 5 },
  { label: '书证', icon: '📄', count: 8 },
  { label: '证人证言', icon: '👤', count: 3 },
  { label: '被害人陈述', icon: '🎤', count: 1 },
  { label: '嫌疑人供述', icon: '🗣️', count: 3 },
  { label: '鉴定意见', icon: '🔬', count: 2 },
  { label: '视听资料', icon: '📹', count: 1 },
  { label: '勘验笔录', icon: '📐', count: 2 },
]

export const contradictions: Contradiction[] = [
  { point: '案发时间描述不一致', sourceA: '张某供述 P12', sourceB: '李某陈述 P28', analysis: '张某称"下午3点"，李某称"下午2点"' },
  { point: '张某行踪矛盾', sourceA: '张某供述 P15', sourceB: '王某证言 P52', analysis: '张某称在网吧，王某称目击其在现场' },
  { point: '金额前后不一致', sourceA: '张某第一次供述 P9', sourceB: '张某第二次供述 P18', analysis: '第一次称不知价格，第二次称"最多值2000"' },
]

export const persons: PersonInfo[] = [
  { role: '犯罪嫌疑人', name: '张某', idCard: '11010219900315XXXX', summary: '张某辩称案发时在XX网吧上网，否认实施盗窃行为。但其无法提供网吧具体位置及在场证人，供述存在矛盾。' },
  { role: '被害人', name: '李某', summary: '李某称2026年6月10日14时许，其经营的手机店内一部价值5000元的手机被盗。通过监控发现系张某所为。' },
  { role: '证人', name: '王某', summary: '王某证实案发时在手机店对面目睹张某进入店内后匆匆离开，行为可疑。' },
]

// ---- 案件分析 ----

export const timeline: TimelineEvent[] = [
  { time: '06-10 14:00', label: '📍 案发', detail: 'XX路手机店被盗', warn: false },
  { time: '06-10 14:30', label: '📞 报案', detail: '被害人李某报警', warn: false },
  { time: '06-10 15:00', label: '🚔 出警', detail: 'XX派出所到场处置', warn: false },
  { time: '06-11 10:00', label: '📝 立案', detail: '经审批立案侦查', warn: false },
  { time: '06-13 09:00', label: '🎯 锁定', detail: '通过监控锁定嫌疑人张某', warn: false },
  { time: '06-14 10:00', label: '🔒 拘留', detail: '依法对张某执行拘留', warn: false },
  { time: '06-15 14:30', label: '⚠ 讯问', detail: '讯问（距拘留约28h）', warn: true },
  { time: '06-18', label: '📨 提请逮捕', detail: '向检察院提请批准逮捕', warn: false },
  { time: '06-20', label: '📤 移送起诉', detail: '移送审查起诉', warn: false },
]

// ---- 知识图谱（模拟 AI 从卷宗中自动提取的实体与关系）----

export const graphNodes: GraphNode[] = [
  // ── 人员 ──
  { id: 'n1', label: '张某（嫌疑人）', type: 'suspect', x: 0, y: 0 },
  { id: 'n2', label: '刘某（同案嫌疑人）', type: 'suspect', x: 0, y: 0 },
  { id: 'n3', label: '李某（被害人）', type: 'victim', x: 0, y: 0 },
  { id: 'n4', label: '王某（目击证人）', type: 'witness', x: 0, y: 0 },
  { id: 'n5', label: '赵某（收赃人）', type: 'witness', x: 0, y: 0 },
  // ── 物证 ──
  { id: 'e1', label: '被盗手机', type: 'evidence', x: 0, y: 0 },
  { id: 'e2', label: '撬锁工具', type: 'evidence', x: 0, y: 0 },
  { id: 'e3', label: '现场指纹', type: 'evidence', x: 0, y: 0 },
  // ── 书证 ──
  { id: 'd1', label: '购买发票', type: 'document', x: 0, y: 0 },
  { id: 'd2', label: '价格鉴定书', type: 'document', x: 0, y: 0 },
  { id: 'd3', label: '通话记录', type: 'document', x: 0, y: 0 },
  // ── 视听资料 ──
  { id: 'v1', label: '店内监控', type: 'evidence', x: 0, y: 0 },
  { id: 'v2', label: '路口监控', type: 'evidence', x: 0, y: 0 },
]

export const graphEdges: GraphEdge[] = [
  // 张某 ↔ 被害人（矛盾关系：张某否认，被害人指认）
  { from: 'n1', to: 'n3', type: 'contradiction' },
  // 张某 ↔ 同案刘某（关联：共同作案）
  { from: 'n1', to: 'n2', type: 'relation' },
  // 刘某 ↔ 被害人（矛盾关系）
  { from: 'n2', to: 'n3', type: 'contradiction' },
  // 王某（证人）→ 目击张某
  { from: 'n4', to: 'n1', type: 'relation' },
  // 王某（证人）→ 目击刘某
  { from: 'n4', to: 'n2', type: 'relation' },
  // 王某（证人）→ 证言与张某供述矛盾
  { from: 'n4', to: 'n1', type: 'contradiction' },
  // 赵某（收赃人）↔ 张某（关联：销赃）
  { from: 'n5', to: 'n1', type: 'relation' },
  // 被害人 ↔ 被盗手机
  { from: 'n3', to: 'e1', type: 'relation' },
  // 被害人 ↔ 购买发票
  { from: 'n3', to: 'd1', type: 'relation' },
  // 被盗手机 ↔ 价格鉴定书
  { from: 'e1', to: 'd2', type: 'relation' },
  // 张某 ↔ 现场指纹
  { from: 'n1', to: 'e3', type: 'relation' },
  // 刘某 ↔ 撬锁工具
  { from: 'n2', to: 'e2', type: 'relation' },
  // 店内监控 → 拍到张某
  { from: 'v1', to: 'n1', type: 'relation' },
  // 店内监控 → 拍到刘某
  { from: 'v1', to: 'n2', type: 'relation' },
  // 路口监控 → 拍到两人逃跑
  { from: 'v2', to: 'n1', type: 'relation' },
  { from: 'v2', to: 'n2', type: 'relation' },
  // 通话记录 ↔ 张某 ↔ 刘某（案发前后频繁通话）
  { from: 'd3', to: 'n1', type: 'relation' },
  { from: 'd3', to: 'n2', type: 'relation' },
]

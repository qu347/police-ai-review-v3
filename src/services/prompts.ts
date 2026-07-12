// ================================================================
// 公安卷宗审查 — AI Prompt 模板
// ================================================================

/** 要素提取 Prompt */
export function buildElementsPrompt(caseContent: string): string {
  return `你是一名专业的公安案件审查 AI。请从以下卷宗内容中提取案件关键要素。

${caseContent ? `卷宗内容：\n${caseContent}` : '（卷宗内容由系统提供）'}

请以 JSON 格式返回，严格遵循以下结构，不要包含任何额外文字：
{
  "elements": [
    {
      "category": "涉案人员",
      "items": [
        { "label": "嫌疑人", "value": "姓名", "confidence": 0.95 },
        { "label": "身份证", "value": "身份证号", "confidence": 0.90 },
        { "label": "被害人", "value": "姓名", "confidence": 0.88 },
        { "label": "证人", "value": "姓名", "confidence": 0.85 }
      ]
    },
    {
      "category": "案件基本信息",
      "items": [
        { "label": "案由", "value": "案由名称", "confidence": 0.97 },
        { "label": "立案日期", "value": "日期", "confidence": 0.91 },
        { "label": "案发地点", "value": "地点", "confidence": 0.89 },
        { "label": "涉案金额", "value": "金额", "confidence": 0.86 }
      ]
    },
    {
      "category": "文书信息",
      "items": [
        { "label": "立案决定书", "value": "✓ 已识别 / ⚠ 缺失", "confidence": 0.96 },
        { "label": "拘留证", "value": "✓ 已识别 / ⚠ 缺失", "confidence": 0.94 },
        { "label": "逮捕证", "value": "✓ 已识别 / ⚠ 缺失", "confidence": 0.92 },
        { "label": "讯问笔录", "value": "✓ N份 / ⚠ 缺失", "confidence": 0.90 }
      ]
    }
  ]
}`
}

/** 全案审查 Prompt */
export function buildFullReviewPrompt(caseContent: string): string {
  return `你是一名专业的公安法制审查 AI。请对以下卷宗进行全案审查，依据《刑事诉讼法》《公安机关办理刑事案件程序规定》及公安机关刑事案件示范案卷指南。

${caseContent ? `卷宗内容：\n${caseContent}` : '（卷宗内容由系统提供）'}

审查要点：
1. 程序合规性：受案、立案、拘留、逮捕、讯问、移送起诉等程序是否在规定时限内、是否经审批
2. 证据完整性：物证、书证、证人证言、被害人陈述、嫌疑人供述、鉴定意见、视听资料是否齐全
3. 文书规范性：回执书、登记表、通知书、决定书等文书格式和送达是否合规
4. 制卷规范性：卷宗目录是否符合公安机关刑事案件示范案卷指南

请以 JSON 格式返回，严格遵循以下结构：
{
  "issues": [
    { "severity": "high", "title": "问题标题", "category": "程序审查/证据审查/文书审查/制卷规则", "detail": "详细说明", "locations": ["卷宗位置"] }
  ],
  "score": 72
}`
}

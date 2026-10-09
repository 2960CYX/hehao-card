/**
 * 卡片规格表（Single Source of Truth）
 * ------------------------------------------------------------------
 * DOM 卡面（MakeUpCard.vue）和 Canvas 导出图（useCardRenderer.ts）都从这里读取
 * 尺寸 / 坐标 / 文案，因此屏幕上看到的卡面和最终保存的图片始终是同一套版式。
 */

/** 设计尺寸：卡面按 340 × 540 设计，再整体等比缩放到容器宽度 */
export const CARD_W = 340
export const CARD_H = 540

/** 持卡人昵称（卡片「持卡人」、页头、身份验证正确答案都用这个） */
export const HOLDER_NAME = '诗诗宝宝'

/** 持卡人全名（只出现在页脚） */
export const HOLDER_FULL_NAME = '李诗雪'
export const CARD_TITLE = '终极和好卡'
export const CARD_SUBTITLE = 'ULTIMATE MAKE-UP PASS'
export const CARD_FOOTNOTE = '本卡最终解释权归宝宝所有 ♥'

export interface Term {
  no: string
  title: string
  text: string
}

/** 卡片条约：改这里就等于改卡片内容 */
export const TERMS: Term[] = [
  { no: '01', title: '随时生效', text: '出示此卡，强制无条件终止冷战。' },
  { no: '02', title: '附加条款', text: '使用者需附赠 10 秒钟 Embrace。' },
  { no: '03', title: '预支约束', text: '需用主动请吃大餐 / 家务还账。' }
]

export const PALETTE = {
  ink: '#2a2118',
  inkSoft: '#6a5946',
  gold: '#d4af37',
  goldDark: '#a97c15',
  goldLight: '#f7e3a1',
  seal: '#c8102e',
  paperTop: '#fffdf9',
  paperMid: '#fdf7ec',
  paperBottom: '#f7e7d0'
}

/**
 * 版式坐标，单位 = 设计像素，原点在卡面左上角。
 * 所有 *_Top 都是"文字块顶部"（DOM 用 top，Canvas 用 textBaseline='top'）。
 */
export const LAYOUT = {
  pad: 26,

  titleTop: 22,
  titleSize: 30,

  subtitleTop: 60,
  subtitleSize: 7,

  ruleY: 78,

  serialTop: 86,
  serialSize: 9,

  holderTop: 106,
  holderLabelSize: 9.5,
  holderSize: 15,
  holderRuleY: 130,

  termsTop: 146,
  termStep: 58,
  termBadgeR: 10,
  termBadgeCY: 15,
  termNoSize: 9,
  termTitleTop: 8,
  termTitleSize: 13,
  termBodyTop: 28,
  termBodySize: 11.5,
  termBodyLineH: 16,

  sigBox: { x: 26, y: 332, w: 288, h: 118 },
  sigLabelSize: 8.5,
  /** 手写笔迹落在签名框内的实际区域（宽高比 = 签名板的宽高比） */
  ink: { x: 34, y: 356, w: 272, h: 86 },

  metaTop: 462,
  metaSize: 9.5,

  footTop: 500,
  footSize: 8.5,

  /** 红色印章：圆心 / 半径 / 旋转角度 */
  stamp: { cx: 264, cy: 392, r: 38, rotate: -12 }
} as const

/** 签名板宽高比，必须与 LAYOUT.ink 一致，否则笔迹会被拉伸 */
export const INK_RATIO = LAYOUT.ink.w / LAYOUT.ink.h

const pad2 = (n: number) => String(n).padStart(2, '0')

/** 生成卡片编号，例如 20260214-0731 */
export function makeSerial(d: Date = new Date()): string {
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${rand}`
}

/** 生成中文日期，例如 2026 年 02 月 14 日 */
export function formatDateCN(d: Date = new Date()): string {
  return `${d.getFullYear()} 年 ${pad2(d.getMonth() + 1)} 月 ${pad2(d.getDate())} 日`
}

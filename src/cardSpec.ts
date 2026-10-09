/**
 * 卡片规格表（Single Source of Truth）
 * ------------------------------------------------------------------
 * DOM 卡面（MakeUpCard.vue）和 Canvas 导出图（useCardRenderer.ts）都从这里读取
 * 尺寸 / 坐标 / 文案，因此屏幕上看到的卡面和最终保存的图片始终是同一套版式。
 */

/** 设计尺寸：卡面按 340 × 590 设计，再整体等比缩放到容器宽度 */
export const CARD_W = 340
export const CARD_H = 590

/** 持卡人：收下这张卡的人（卡片「持卡人」一栏） */
export const HOLDER_NAME = '陈宇翔'

/**
 * 第一关可以接受的答案。
 * 她把名字打进来才能解锁 —— 大小名、小名都放进来，写得宽松一点，
 * 只要输入里含有其中任意一个（或它是其中任意一个的一部分）就算通过。
 */
export const HOLDER_ANSWERS = ['陈宇翔', '宇翔']

/** 签发人：签这张卡送出去的人（卡片、页头都用这个） */
export const ISSUER_NAME = '李诗雪'

export const CARD_TITLE = '和好卡'
export const CARD_SUBTITLE = 'MAKE-UP PASS'

/** 卡片正中间那句话 —— 没有条款，只有这一句 */
export const CARD_MESSAGE = '我们和好吧'

/** 卡片底部小字 */
export const CARD_FOOTNOTE = '永远有效 ♥'

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

  titleTop: 28,
  titleSize: 36,

  subtitleTop: 74,
  subtitleSize: 7,

  ruleY: 90,

  serialTop: 99,
  serialSize: 8.5,

  holderTop: 118,
  holderLabelSize: 9.5,
  holderSize: 15,
  holderRuleY: 140,

  /** 「我们和好吧」 */
  messageTop: 152,
  messageSize: 24,

  /** 签名栏一：签发人（她现场手写）—— 留得比原来高，手机上更好写 */
  sigIssuer: { x: 26, y: 188, w: 288, h: 148 },
  inkIssuer: { x: 34, y: 210, w: 272, h: 118 },

  /** 签名栏二：持卡人（预先印上去的签名） */
  sigHolder: { x: 26, y: 348, w: 288, h: 148 },
  inkHolder: { x: 34, y: 370, w: 272, h: 118 },

  sigLabelSize: 8.5,

  metaTop: 512,
  metaSize: 9.5,

  footTop: 552,
  footSize: 8.5,

  /** 红色印章：圆心 / 半径 / 旋转角度（正好盖在两个签名栏的交界处） */
  stamp: { cx: 278, cy: 342, r: 34, rotate: -12 }
} as const

/** 签名板宽高比，必须与 LAYOUT.inkIssuer 一致，否则笔迹会被拉伸 */
export const INK_RATIO = LAYOUT.inkIssuer.w / LAYOUT.inkIssuer.h

/** 预先印在卡片上的持卡人签名文件（放在 public/ 目录） */
export const HOLDER_SIGNATURE_FILE = 'holder-sign.png'

/** 预印签名的缩放比例：避免顶到边框，也和她现场手写的笔迹更协调 */
export const HOLDER_SIGN_SCALE = 0.82

/** 她现场手写签名的缩放比例（笔迹导出时已裁到外框，这里只做轻微内缩） */
export const ISSUER_SIGN_SCALE = 0.9

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

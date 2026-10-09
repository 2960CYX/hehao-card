import {
  CARD_FOOTNOTE,
  CARD_H,
  CARD_SUBTITLE,
  CARD_TITLE,
  CARD_W,
  HOLDER_NAME,
  LAYOUT,
  PALETTE,
  TERMS
} from '../cardSpec'

export interface RenderCardOptions {
  serial: string
  dateText: string
  holder?: string
  /** 签名板导出的透明笔迹图层（见 SignaturePad.exportInk） */
  ink?: HTMLCanvasElement | null
  /** 导出倍率，默认 3 倍（1020 × 1620 px） */
  scale?: number
}

const SERIF = '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif'
const SANS =
  '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Heiti SC","Noto Sans SC",system-ui,sans-serif'

const SEAL_RED = '#c8102e'

/* ------------------------------------------------------------------ 基础图形 */

function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.arcTo(x + w, y, x + w, y + rr, rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr)
  ctx.lineTo(x + rr, y + h)
  ctx.arcTo(x, y + h, x, y + h - rr, rr)
  ctx.lineTo(x, y + rr)
  ctx.arcTo(x, y, x + rr, y, rr)
  ctx.closePath()
}

/** 逐字绘制、可控制字距的居中文本（Canvas 没有 letter-spacing） */
function drawSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  top: number,
  spacing: number
) {
  const chars = [...text]
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  const prevAlign = ctx.textAlign
  ctx.textAlign = 'left'
  let x = centerX - total / 2
  chars.forEach((c, i) => {
    ctx.fillText(c, x, top)
    x += widths[i] + spacing
  })
  ctx.textAlign = prevAlign
}

/** 中文按字断行 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    const next = line + ch
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line)
      line = ch
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function dashedRule(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number) {
  ctx.save()
  ctx.setLineDash([3, 3])
  ctx.strokeStyle = 'rgba(169,124,21,0.45)'
  ctx.lineWidth = 0.9
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
  ctx.restore()
}

function dottedRule(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number) {
  ctx.save()
  ctx.setLineDash([1, 2.6])
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(140,116,80,0.5)'
  ctx.lineWidth = 0.9
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
  ctx.restore()
}

function diamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(Math.PI / 4)
  // 先用纸色盖掉虚线
  ctx.fillStyle = PALETTE.paperMid
  ctx.fillRect(-size * 0.95, -size * 0.95, size * 1.9, size * 1.9)
  ctx.fillStyle = '#e8c96a'
  ctx.fillRect(-size / 2, -size / 2, size, size)
  ctx.strokeStyle = 'rgba(169,124,21,0.6)'
  ctx.lineWidth = 0.6
  ctx.strokeRect(-size / 2, -size / 2, size, size)
  ctx.restore()
}

function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 2
  ctx.beginPath()
  ctx.moveTo(cx, cy + s * 0.78)
  ctx.bezierCurveTo(cx - s * 1.55, cy - s * 0.32, cx - s * 0.56, cy - s * 1.28, cx, cy - s * 0.42)
  ctx.bezierCurveTo(cx + s * 0.56, cy - s * 1.28, cx + s * 1.55, cy - s * 0.32, cx, cy + s * 0.78)
  ctx.closePath()
}

/* ------------------------------------------------------------------ 纸面 */

function drawPaper(ctx: CanvasRenderingContext2D) {
  ctx.save()
  roundedPath(ctx, 0, 0, CARD_W, CARD_H, 22)
  const g = ctx.createLinearGradient(0, 0, CARD_W * 0.42, CARD_H)
  g.addColorStop(0, PALETTE.paperTop)
  g.addColorStop(0.44, PALETTE.paperMid)
  g.addColorStop(1, PALETTE.paperBottom)
  ctx.fillStyle = g
  ctx.fill()
  ctx.clip()

  // 右上暖光
  const warm = ctx.createRadialGradient(CARD_W * 0.84, CARD_H * 0.08, 6, CARD_W * 0.84, CARD_H * 0.08, 230)
  warm.addColorStop(0, 'rgba(255,206,120,0.28)')
  warm.addColorStop(1, 'rgba(255,206,120,0)')
  ctx.fillStyle = warm
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // 纸张纤维
  ctx.fillStyle = 'rgba(120,95,60,0.05)'
  for (let i = 0; i < 280; i++) {
    ctx.fillRect(Math.random() * CARD_W, Math.random() * CARD_H, 0.7, 0.7)
  }
  ctx.restore()

  // 烫金外框
  const gold = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  gold.addColorStop(0, '#f7e29a')
  gold.addColorStop(0.32, '#c9a227')
  gold.addColorStop(0.52, '#fff3c4')
  gold.addColorStop(1, '#a97c15')
  ctx.strokeStyle = gold
  ctx.lineWidth = 2.4
  roundedPath(ctx, 1.4, 1.4, CARD_W - 2.8, CARD_H - 2.8, 21)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(169,124,21,0.42)'
  ctx.lineWidth = 0.8
  roundedPath(ctx, 7.5, 7.5, CARD_W - 15, CARD_H - 15, 15)
  ctx.stroke()
}

function drawOrnaments(ctx: CanvasRenderingContext2D) {
  const m = 15
  const len = 16
  ctx.save()
  ctx.strokeStyle = 'rgba(169,124,21,0.45)'
  ctx.lineWidth = 1
  const corners: Array<[number, number, number, number]> = [
    [m, m, 1, 1],
    [CARD_W - m, m, -1, 1],
    [m, CARD_H - m, 1, -1],
    [CARD_W - m, CARD_H - m, -1, -1]
  ]
  for (const [x, y, sx, sy] of corners) {
    ctx.beginPath()
    ctx.moveTo(x + sx * len, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + sy * len)
    ctx.stroke()
  }
  ctx.restore()
}

function drawWatermark(ctx: CanvasRenderingContext2D) {
  ctx.save()
  heartPath(ctx, CARD_W / 2 + 6, 244, 208)
  ctx.fillStyle = 'rgba(200,16,46,0.03)'
  ctx.fill()
  ctx.restore()
}

/* ------------------------------------------------------------------ 各区块 */

function drawHeader(ctx: CanvasRenderingContext2D, serial: string) {
  ctx.save()

  const goldText = ctx.createLinearGradient(0, LAYOUT.titleTop, 0, LAYOUT.titleTop + LAYOUT.titleSize)
  goldText.addColorStop(0, '#fff6cf')
  goldText.addColorStop(0.3, '#e6c86a')
  goldText.addColorStop(0.52, '#b98f16')
  goldText.addColorStop(0.72, '#f7e7ae')
  goldText.addColorStop(1, '#a97c15')

  ctx.font = `700 ${LAYOUT.titleSize}px ${SERIF}`
  ctx.textAlign = 'center'
  // 立体暗影
  ctx.fillStyle = 'rgba(120,86,20,0.34)'
  drawSpaced(ctx, CARD_TITLE, CARD_W / 2, LAYOUT.titleTop + 1, 1.6)
  ctx.fillStyle = goldText
  drawSpaced(ctx, CARD_TITLE, CARD_W / 2, LAYOUT.titleTop, 1.6)

  ctx.font = `600 ${LAYOUT.subtitleSize}px ${SANS}`
  ctx.fillStyle = 'rgba(107,92,70,0.72)'
  drawSpaced(ctx, CARD_SUBTITLE, CARD_W / 2, LAYOUT.subtitleTop, 2.4)

  dashedRule(ctx, LAYOUT.pad, LAYOUT.ruleY, CARD_W - LAYOUT.pad)
  diamond(ctx, CARD_W / 2, LAYOUT.ruleY, 5.4)

  ctx.font = `600 ${LAYOUT.serialSize}px ${SANS}`
  ctx.fillStyle = 'rgba(107,92,70,0.78)'
  drawSpaced(ctx, `NO. ${serial}`, CARD_W / 2, LAYOUT.serialTop, 1.4)

  ctx.restore()
}

function drawHolder(ctx: CanvasRenderingContext2D, holder: string) {
  ctx.save()
  ctx.font = `500 ${LAYOUT.holderLabelSize}px ${SANS}`
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(107,92,70,0.82)'
  ctx.fillText('持卡人', LAYOUT.pad, LAYOUT.holderTop + 3)

  ctx.font = `700 ${LAYOUT.holderSize}px ${SANS}`
  ctx.textAlign = 'right'
  ctx.fillStyle = PALETTE.ink
  ctx.fillText(holder, CARD_W - LAYOUT.pad, LAYOUT.holderTop - 1)
  ctx.restore()

  dottedRule(ctx, LAYOUT.pad, LAYOUT.holderRuleY, CARD_W - LAYOUT.pad)
}

function drawTerms(ctx: CanvasRenderingContext2D) {
  const tx = LAYOUT.pad + LAYOUT.termBadgeR * 2 + 11

  TERMS.forEach((term, i) => {
    const top = LAYOUT.termsTop + i * LAYOUT.termStep

    // 序号圆章
    ctx.save()
    ctx.beginPath()
    ctx.arc(LAYOUT.pad + LAYOUT.termBadgeR, top + LAYOUT.termBadgeCY, LAYOUT.termBadgeR, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(212,175,55,0.16)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(169,124,21,0.75)'
    ctx.lineWidth = 0.9
    ctx.stroke()

    ctx.font = `700 ${LAYOUT.termNoSize}px ${SANS}`
    ctx.textAlign = 'center'
    ctx.fillStyle = PALETTE.goldDark
    ctx.fillText(term.no, LAYOUT.pad + LAYOUT.termBadgeR, top + LAYOUT.termBadgeCY - LAYOUT.termNoSize / 2)
    ctx.restore()

    // 标题
    ctx.save()
    ctx.textAlign = 'left'
    ctx.font = `700 ${LAYOUT.termTitleSize}px ${SANS}`
    ctx.fillStyle = PALETTE.ink
    ctx.fillText(term.title, tx, top + LAYOUT.termTitleTop)

    // 正文
    ctx.font = `400 ${LAYOUT.termBodySize}px ${SANS}`
    ctx.fillStyle = PALETTE.inkSoft
    const maxWidth = CARD_W - LAYOUT.pad - tx
    wrapText(ctx, term.text, maxWidth).forEach((line, li) => {
      ctx.fillText(line, tx, top + LAYOUT.termBodyTop + li * LAYOUT.termBodyLineH)
    })
    ctx.restore()
  })
}

function drawSignatureBox(ctx: CanvasRenderingContext2D, ink?: HTMLCanvasElement | null) {
  const { x, y, w, h } = LAYOUT.sigBox

  ctx.save()
  ctx.setLineDash([4, 3.2])
  ctx.strokeStyle = 'rgba(140,116,80,0.55)'
  ctx.lineWidth = 1
  roundedPath(ctx, x, y, w, h, 10)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.font = `500 ${LAYOUT.sigLabelSize}px ${SANS}`
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(140,116,80,0.78)'
  ctx.fillText('持卡人签名 / SIGNATURE', x + 9, y + 7)
  ctx.restore()

  if (ink) {
    ctx.save()
    // multiply 让笔迹像真的墨水渗进纸里
    ctx.globalCompositeOperation = 'multiply'
    ctx.globalAlpha = 0.94
    ctx.drawImage(ink, LAYOUT.ink.x, LAYOUT.ink.y, LAYOUT.ink.w, LAYOUT.ink.h)
    ctx.restore()
  }
}

function drawMeta(ctx: CanvasRenderingContext2D, dateText: string) {
  ctx.save()
  ctx.font = `500 ${LAYOUT.metaSize}px ${SANS}`
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(107,92,70,0.8)'
  ctx.fillText(`签发日期 ${dateText}`, LAYOUT.pad, LAYOUT.metaTop)

  ctx.textAlign = 'right'
  ctx.font = `700 ${LAYOUT.metaSize}px ${SANS}`
  ctx.fillStyle = PALETTE.goldDark
  ctx.fillText('永久有效', CARD_W - LAYOUT.pad, LAYOUT.metaTop)
  ctx.restore()
}

function drawFoot(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.font = `500 ${LAYOUT.footSize}px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(107,92,70,0.62)'
  ctx.fillText(CARD_FOOTNOTE, CARD_W / 2, LAYOUT.footTop)
  ctx.restore()
}

/* ------------------------------------------------------------------ 红色印章 */

/** 沿圆弧排布文字 */
function arcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  radius: number,
  from: number,
  to: number
) {
  const chars = [...text]
  const step = (to - from) / Math.max(chars.length - 1, 1)
  chars.forEach((ch, i) => {
    ctx.save()
    ctx.rotate(from + step * i)
    ctx.translate(0, -radius)
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  })
}

function makeStampCanvas(r: number, scale: number): HTMLCanvasElement {
  const size = r * 2 + 8
  const cv = document.createElement('canvas')
  cv.width = Math.round(size * scale)
  cv.height = Math.round(size * scale)
  const ctx = cv.getContext('2d')
  if (!ctx) return cv

  ctx.scale(scale, scale)
  ctx.translate(size / 2, size / 2)
  ctx.strokeStyle = SEAL_RED
  ctx.fillStyle = SEAL_RED
  ctx.lineCap = 'round'

  // 外圈
  ctx.globalAlpha = 0.96
  ctx.lineWidth = 3.4
  ctx.beginPath()
  ctx.arc(0, 0, r - 1.7, 0, Math.PI * 2)
  ctx.stroke()

  // 内圈
  ctx.globalAlpha = 0.86
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(0, 0, r - 11, 0, Math.PI * 2)
  ctx.stroke()

  // 环形文字：夹在外圈 (r-1.7) 与内圈 (r-11) 之间的窄带里
  ctx.globalAlpha = 0.96
  ctx.font = `700 5px ${SANS}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  arcText(ctx, '终极和好卡 · 预支成功', r - 6.6, -1.02, 1.02)

  // 中央文字
  ctx.textBaseline = 'top'
  ctx.font = `700 15px ${SANS}`
  ctx.fillText('已生效', 0, -11)

  // 分隔线
  ctx.globalAlpha = 0.9
  ctx.lineWidth = 0.9
  ctx.beginPath()
  ctx.moveTo(-r * 0.5, 8)
  ctx.lineTo(r * 0.5, 8)
  ctx.stroke()

  ctx.font = `700 6.2px ${SANS}`
  ctx.globalAlpha = 0.96
  ctx.fillText('永久有效', 0, 13.5)

  // 做旧：随机擦出墨点缺口，像真的盖章（别擦太狠，否则环形文字糊掉）
  ctx.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2
    const rr = Math.random() * r
    ctx.globalAlpha = 0.22 + Math.random() * 0.4
    ctx.beginPath()
    ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 0.35 + Math.random() * 1.3, 0, Math.PI * 2)
    ctx.fill()
  }

  return cv
}

function drawStamp(ctx: CanvasRenderingContext2D) {
  const { cx, cy, r, rotate } = LAYOUT.stamp
  const stamp = makeStampCanvas(r, 4)
  const size = r * 2 + 8

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rotate * Math.PI) / 180)
  // multiply：印章压在签名和纸面上，像盖上去的
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = 0.95
  ctx.drawImage(stamp, -size / 2, -size / 2, size, size)
  ctx.restore()
}

/* ------------------------------------------------------------------ 对外接口 */

/** 把卡面 + 笔迹 + 印章合成到一张 canvas 上 */
export function renderCard(options: RenderCardOptions): HTMLCanvasElement {
  const scale = options.scale ?? 3
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(CARD_W * scale)
  canvas.height = Math.round(CARD_H * scale)

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.scale(scale, scale)
  ctx.textBaseline = 'top'

  drawPaper(ctx)
  drawWatermark(ctx)
  drawOrnaments(ctx)
  drawHeader(ctx, options.serial)
  drawHolder(ctx, options.holder ?? HOLDER_NAME)
  drawTerms(ctx)
  drawSignatureBox(ctx, options.ink)
  drawStamp(ctx)
  drawMeta(ctx, options.dateText)
  drawFoot(ctx)

  return canvas
}

/** 合成并直接返回 PNG dataURL */
export function renderCardDataUrl(options: RenderCardOptions): string {
  return renderCard(options).toDataURL('image/png')
}

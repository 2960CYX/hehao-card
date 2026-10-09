/**
 * 笔迹方向校正
 * ------------------------------------------------------------------
 * 手机锁了「自动旋转」（或页面跑在微信内置浏览器里）时，用户听提示把手机横过来写，
 * 但页面本身还是竖的 —— 于是他眼里的「横着写」，在页面坐标里是一条竖长的笔迹，
 * 合成到卡片上就成了一根竖着的签名。
 *
 * 这里做两件事：
 * 1. suggestInkRotation：根据笔迹形状 + 运笔方向，猜一个能把它摆正的角度；
 * 2. rotateInkCanvas：按角度旋转导出的笔迹图层（预览和成品卡共用同一个角度）。
 *
 * 猜不准也没关系：卡片面板上有「转一下」按钮，用户可以自己转到满意为止。
 */
import type { InkStroke } from './signature'

/** 顺时针旋转角度（度） */
export type InkRotation = 0 | 90 | 180 | 270

/** 明显竖着写（高 > 宽）时才算「手机横过来写的」，留一点容差避免误判 */
const TALL_RATIO = 1.05

interface Box {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

function boxOf(strokes: InkStroke[]): Box | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let count = 0
  for (const stroke of strokes) {
    for (const p of stroke) {
      count += 1
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
    }
  }
  if (!count) return null
  return { minX, minY, maxX, maxY }
}

/** 按运笔顺序摊平所有点（起笔在前，收笔在后） */
function orderedPoints(strokes: InkStroke[]) {
  const points: Array<{ x: number; y: number }> = []
  for (const stroke of strokes) {
    for (const p of stroke) points.push({ x: p.x, y: p.y })
  }
  return points
}

/**
 * 猜一个能把签名摆正的角度。
 *
 * - 笔迹是横的（宽 ≥ 高）：本来就是正常写的，不动 → 0°
 * - 笔迹是竖的：说明写字时手机是横过来的，要转 90° 或 270°
 *   往哪边转，看「起笔 → 收笔」的走向：写字总是从前往后走，
 *   走向是 y 变小（页面往上）说明手机是顺时针转的 → 90°；
 *   走向是 y 变大 → 270°。
 */
export function suggestInkRotation(strokes: InkStroke[]): InkRotation {
  const box = boxOf(strokes)
  if (!box) return 0

  const spanX = box.maxX - box.minX
  const spanY = box.maxY - box.minY
  if (spanX >= spanY * TALL_RATIO) return 0

  const points = orderedPoints(strokes)
  const edge = Math.max(Math.floor(points.length * 0.3), 1)
  const head = points.slice(0, edge)
  const tail = points.slice(-edge)
  const meanY = (list: Array<{ y: number }>) => list.reduce((sum, p) => sum + p.y, 0) / list.length
  const progress = meanY(tail) - meanY(head)

  // 走向不明显（比如只画了一个圈），默认按顺时针摆正
  if (Math.abs(progress) < (spanY || 1) * 0.1) return 90
  return progress > 0 ? 270 : 90
}

/** 把导出的笔迹图层整体转一下，用于预览（角度和成品卡里的一致） */
export function rotateInkCanvas(src: HTMLCanvasElement, deg: InkRotation): HTMLCanvasElement {
  const turn = ((deg % 360) + 360) % 360
  if (!turn) return src

  const swap = turn % 180 !== 0
  const out = document.createElement('canvas')
  out.width = swap ? src.height : src.width
  out.height = swap ? src.width : src.height

  const g = out.getContext('2d')
  if (!g) return src
  g.translate(out.width / 2, out.height / 2)
  g.rotate((turn * Math.PI) / 180)
  g.drawImage(src, -src.width / 2, -src.height / 2)
  return out
}

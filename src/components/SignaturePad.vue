<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { INK_RATIO, LAYOUT } from '../cardSpec'

interface Pt {
  /** 归一化坐标 0~1，保证缩放 / 旋转屏幕后笔迹不变形 */
  x: number
  y: number
  /** 笔画粗细，同样归一化（相对签名板宽度） */
  w: number
}

const props = withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ (e: 'update:empty', empty: boolean): void }>()

const INK_COLOR = '#141821'
const BASE_PX = 2.4
const MIN_PX = 1.1
const MAX_PX = 3.8

const canvasEl = ref<HTMLCanvasElement | null>(null)
const hasInk = ref(false)
const empty = computed(() => !hasInk.value)

let ctx: CanvasRenderingContext2D | null = null
let strokes: Pt[][] = []
let drawing = false
let current: Pt[] | null = null
let lastPoint: Pt | null = null
let lastTime = 0
let lastWidthPx = BASE_PX
let cssW = 1
let cssH = 1
let observer: ResizeObserver | null = null

/* ------------------------------------------------------------ 坐标与绘制 */

const toNormWidth = (px: number) => px / Math.max(cssW, 1)

function toNorm(e: PointerEvent | MouseEvent): Pt {
  const el = canvasEl.value
  const rect = el?.getBoundingClientRect()
  const width = rect?.width || cssW
  const height = rect?.height || cssH
  return {
    x: (e.clientX - (rect?.left ?? 0)) / Math.max(width, 1),
    y: (e.clientY - (rect?.top ?? 0)) / Math.max(height, 1),
    w: toNormWidth(BASE_PX)
  }
}

function drawSegment(
  a: Pt,
  b: Pt,
  targetW: number,
  targetH: number,
  g: CanvasRenderingContext2D | null
) {
  if (!g) return
  g.strokeStyle = INK_COLOR
  g.lineWidth = Math.max(((a.w + b.w) / 2) * targetW, 0.4)
  g.beginPath()
  g.moveTo(a.x * targetW, a.y * targetH)
  g.lineTo(b.x * targetW, b.y * targetH)
  g.stroke()
}

function paintStroke(g: CanvasRenderingContext2D, pts: Pt[], targetW: number, targetH: number) {
  if (!pts.length) return
  g.strokeStyle = INK_COLOR
  g.fillStyle = INK_COLOR
  g.lineCap = 'round'
  g.lineJoin = 'round'

  if (pts.length === 1) {
    g.beginPath()
    g.arc(pts[0].x * targetW, pts[0].y * targetH, Math.max((pts[0].w * targetW) / 2, 0.4), 0, Math.PI * 2)
    g.fill()
    return
  }
  for (let i = 1; i < pts.length; i++) {
    drawSegment(pts[i - 1], pts[i], targetW, targetH, g)
  }
}

/** 按画布当前 CSS 尺寸重建像素缓冲并重放全部笔迹 */
function syncSize() {
  const el = canvasEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  cssW = Math.max(rect.width, 1)
  cssH = Math.max(rect.height, 1)

  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  const bw = Math.round(cssW * dpr)
  const bh = Math.round(cssH * dpr)
  if (el.width !== bw || el.height !== bh) {
    el.width = bw
    el.height = bh
  }

  ctx = el.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.clearRect(0, 0, cssW, cssH)
  for (const s of strokes) paintStroke(ctx, s, cssW, cssH)
}

function setInk(value: boolean) {
  if (hasInk.value === value) return
  hasInk.value = value
  emit('update:empty', !value)
}

/* ------------------------------------------------------------ 指针事件 */

function pushPoint(p: Pt, time: number) {
  if (!current) return
  const prev = lastPoint
  if (!prev) {
    current.push(p)
    lastPoint = p
    lastTime = time
    return
  }
  const dx = (p.x - prev.x) * cssW
  const dy = (p.y - prev.y) * cssH
  const dist = Math.hypot(dx, dy)
  if (dist < 0.6) return

  // 运笔越快线条越细，接近真实笔迹
  const dt = Math.max(time - lastTime, 1)
  const speed = dist / dt
  const target = Math.min(MAX_PX, Math.max(MIN_PX, BASE_PX * (1.7 - speed * 2.8)))
  lastWidthPx += (target - lastWidthPx) * 0.45
  p.w = toNormWidth(lastWidthPx)

  current.push(p)
  drawSegment(prev, p, cssW, cssH, ctx)
  lastPoint = p
  lastTime = time
}

function onDown(e: PointerEvent) {
  if (props.disabled) return
  if (e.pointerType === 'mouse' && e.button !== 0) return
  e.preventDefault()

  const el = canvasEl.value
  if (!el) return
  try {
    el.setPointerCapture(e.pointerId)
  } catch {
    /* 部分浏览器不支持，忽略 */
  }

  drawing = true
  lastWidthPx = BASE_PX
  lastPoint = null
  lastTime = e.timeStamp
  current = [toNorm(e)]
  strokes.push(current)
  setInk(true)
}

function onMove(e: PointerEvent) {
  if (!drawing || !current) return
  e.preventDefault()

  let list: PointerEvent[] = [e]
  if (typeof e.getCoalescedEvents === 'function') {
    try {
      const coalesced = e.getCoalescedEvents()
      if (coalesced.length) list = coalesced
    } catch {
      /* 非受信任事件会抛错，退回单个事件 */
    }
  }
  for (const ev of list) pushPoint(toNorm(ev), ev.timeStamp || e.timeStamp)
}

function onUp(e: PointerEvent) {
  if (!drawing) return
  drawing = false
  current = null
  lastPoint = null
  try {
    canvasEl.value?.releasePointerCapture(e.pointerId)
  } catch {
    /* 忽略 */
  }
}

/* ------------------------------------------------------------ 对外方法 */

function clear() {
  strokes = []
  current = null
  lastPoint = null
  drawing = false
  setInk(false)
  syncSize()
}

/** 导出透明笔迹图层，尺寸严格等于卡片签名区的实际绘制区 */
function exportInk(
  width: number = LAYOUT.ink.w,
  height: number = LAYOUT.ink.h,
  scale = 4
): HTMLCanvasElement {
  const cv = document.createElement('canvas')
  cv.width = Math.round(width * scale)
  cv.height = Math.round(height * scale)
  const g = cv.getContext('2d')
  if (!g) return cv
  g.scale(scale, scale)
  g.lineCap = 'round'
  g.lineJoin = 'round'
  for (const s of strokes) paintStroke(g, s, width, height)
  return cv
}

/** 预览模式（?demo=1）用：自动写一段示例签名 */
function drawDemo() {
  const push = (points: Array<[number, number]>) => {
    const pts: Pt[] = points.map(([x, y], i) => ({
      x,
      y,
      w: toNormWidth(BASE_PX * (0.72 + 0.5 * Math.abs(Math.sin(i * 0.5))))
    }))
    strokes.push(pts)
  }

  const wave: Array<[number, number]> = []
  for (let i = 0; i <= 60; i++) {
    const t = i / 60
    wave.push([0.07 + t * 0.36, 0.58 - Math.sin(t * Math.PI * 1.5) * 0.26 - t * 0.06])
  }
  push(wave)

  const loop: Array<[number, number]> = []
  for (let i = 0; i <= 52; i++) {
    const t = (i / 52) * Math.PI * 2
    loop.push([0.5 + Math.sin(t) * 0.055 + (i / 52) * 0.09, 0.44 + Math.cos(t) * 0.24])
  }
  push(loop)

  const tail: Array<[number, number]> = []
  for (let i = 0; i <= 48; i++) {
    const t = i / 48
    tail.push([0.6 + t * 0.32, 0.62 - Math.sin(t * Math.PI) * 0.2])
  }
  push(tail)

  const under: Array<[number, number]> = []
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    under.push([0.14 + t * 0.62, 0.84 - Math.sin(t * Math.PI) * 0.06])
  }
  push(under)

  setInk(true)
  syncSize()
}

defineExpose({ clear, exportInk, drawDemo, empty })

/* ------------------------------------------------------------ 生命周期 */

onMounted(() => {
  syncSize()
  if (typeof ResizeObserver !== 'undefined' && canvasEl.value) {
    observer = new ResizeObserver(() => syncSize())
    observer.observe(canvasEl.value)
  } else {
    window.addEventListener('resize', syncSize)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', syncSize)
})
</script>

<template>
  <div class="pad-surface" :style="{ aspectRatio: String(INK_RATIO) }">
    <canvas
      ref="canvasEl"
      :class="{ 'is-disabled': disabled }"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @lostpointercapture="onUp"
      @contextmenu.prevent
    />
    <div class="pad-baseline" />
    <div class="pad-ghost" :style="{ opacity: empty ? 1 : 0 }">在此签名</div>
  </div>
</template>

<style scoped>
.pad-surface {
  position: relative;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.014) 0px,
      rgba(0, 0, 0, 0.014) 1px,
      transparent 1px,
      transparent 4px
    ),
    linear-gradient(180deg, #fffdf8 0%, #fbf4e8 100%);
  box-shadow: inset 0 2px 8px rgba(120, 86, 20, 0.14);
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: crosshair;
  user-select: none;
  -webkit-user-select: none;
}

canvas.is-disabled {
  pointer-events: none;
  opacity: 0.6;
}

.pad-baseline {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 24%;
  border-bottom: 1px dashed rgba(140, 116, 80, 0.32);
  pointer-events: none;
}

.pad-ghost {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 13px;
  letter-spacing: 0.24em;
  color: rgba(140, 116, 80, 0.34);
  pointer-events: none;
  transition: opacity 0.25s ease;
}
</style>

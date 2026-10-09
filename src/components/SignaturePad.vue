<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { INK_RATIO } from '../cardSpec'
import type { InkPoint, InkStroke } from '../signature'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    /** true = 撑满父容器（放大手写用）；false = 按卡片签名栏的宽高比显示 */
    fill?: boolean
    height?: number
  }>(),
  { disabled: false, fill: false, height: 0 }
)

const emit = defineEmits<{ (e: 'update:empty', empty: boolean): void }>()

const INK_COLOR = '#141821'
const BASE_PX = 2.4
const MIN_PX = 1.1
const MAX_PX = 3.8

/** 导出时的分辨率：1 个归一化单位 = 多少像素 */
const EXPORT_UNIT = 1100
const EXPORT_MAX = 2600

const canvasEl = ref<HTMLCanvasElement | null>(null)
const hasInk = ref(false)
const empty = computed(() => !hasInk.value)

const strokes = shallowRef<InkStroke[]>([])

let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let current: InkStroke | null = null
let lastPoint: InkPoint | null = null
let lastTime = 0
let lastWidthPx = BASE_PX
let cssW = 1
let cssH = 1
let observer: ResizeObserver | null = null

/* ------------------------------------------------------------ 坐标与绘制 */

/** 一律除以宽度，保证坐标系与宽高比无关 */
function toNorm(e: PointerEvent | MouseEvent): InkPoint {
  const el = canvasEl.value
  const rect = el?.getBoundingClientRect()
  const width = Math.max(rect?.width || cssW, 1)
  return {
    x: (e.clientX - (rect?.left ?? 0)) / width,
    y: (e.clientY - (rect?.top ?? 0)) / width,
    w: BASE_PX / width
  }
}

function drawSegment(a: InkPoint, b: InkPoint, unit: number, g: CanvasRenderingContext2D | null) {
  if (!g) return
  g.strokeStyle = INK_COLOR
  g.lineWidth = Math.max(((a.w + b.w) / 2) * unit, 0.4)
  g.beginPath()
  g.moveTo(a.x * unit, a.y * unit)
  g.lineTo(b.x * unit, b.y * unit)
  g.stroke()
}

function paintStroke(g: CanvasRenderingContext2D, pts: InkStroke, unit: number) {
  if (!pts.length) return
  g.strokeStyle = INK_COLOR
  g.fillStyle = INK_COLOR
  g.lineCap = 'round'
  g.lineJoin = 'round'

  if (pts.length === 1) {
    g.beginPath()
    g.arc(pts[0].x * unit, pts[0].y * unit, Math.max((pts[0].w * unit) / 2, 0.4), 0, Math.PI * 2)
    g.fill()
    return
  }
  for (let i = 1; i < pts.length; i++) drawSegment(pts[i - 1], pts[i], unit, g)
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
  for (const s of strokes.value) paintStroke(ctx, s, cssW)
}

function setInk(value: boolean) {
  if (hasInk.value === value) return
  hasInk.value = value
  emit('update:empty', !value)
}

/* ------------------------------------------------------------ 指针事件 */

function pushPoint(p: InkPoint, time: number) {
  if (!current) return
  const prev = lastPoint
  if (!prev) {
    current.push(p)
    lastPoint = p
    lastTime = time
    return
  }
  const unit = cssW
  const dx = (p.x - prev.x) * unit
  const dy = (p.y - prev.y) * unit
  const dist = Math.hypot(dx, dy)
  if (dist < 0.6) return

  // 运笔越快线条越细，接近真实笔迹
  const dt = Math.max(time - lastTime, 1)
  const target = Math.min(MAX_PX, Math.max(MIN_PX, BASE_PX * (1.7 - (dist / dt) * 2.8)))
  lastWidthPx += (target - lastWidthPx) * 0.45
  p.w = lastWidthPx / unit

  current.push(p)
  drawSegment(prev, p, unit, ctx)
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
  strokes.value = [...strokes.value, current]
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
  strokes.value = []
  current = null
  lastPoint = null
  drawing = false
  setInk(false)
  syncSize()
}

function undo() {
  if (!strokes.value.length) return
  strokes.value = strokes.value.slice(0, -1)
  setInk(strokes.value.length > 0)
  syncSize()
}

function getStrokes(): InkStroke[] {
  return strokes.value.map((s) => s.map((p) => ({ ...p })))
}

function setStrokes(next: InkStroke[]) {
  strokes.value = next.map((s) => s.map((p) => ({ ...p })))
  setInk(strokes.value.length > 0)
  syncSize()
}

/**
 * 导出笔迹图层：先裁到笔迹外框，再按固定分辨率栅格化。
 * 因为坐标系与宽高比无关，这个结果可以被等比缩放进卡片上任意形状的签名栏。
 */
function exportInk(): HTMLCanvasElement {
  const all = strokes.value
  const fallback = document.createElement('canvas')
  fallback.width = 1
  fallback.height = 1
  if (!all.length) return fallback

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const s of all) {
    for (const p of s) {
      const half = p.w / 2
      minX = Math.min(minX, p.x - half)
      maxX = Math.max(maxX, p.x + half)
      minY = Math.min(minY, p.y - half)
      maxY = Math.max(maxY, p.y + half)
    }
  }

  // 留一点点边距就够，留多了会让签名放进卡片时被缩小
  const padX = Math.max((maxX - minX) * 0.02, 0.006)
  const padY = Math.max((maxY - minY) * 0.06, 0.006)
  const spanX = Math.max(maxX - minX + padX * 2, 0.02)
  const spanY = Math.max(maxY - minY + padY * 2, 0.02)
  const left = minX - padX
  const top = minY - padY

  const unit = Math.min(EXPORT_UNIT, EXPORT_MAX / Math.max(spanX, 0.05))
  const cv = document.createElement('canvas')
  cv.width = Math.max(Math.round(spanX * unit), 1)
  cv.height = Math.max(Math.round(spanY * unit), 1)

  const g = cv.getContext('2d')
  if (!g) return cv
  g.translate(-left * unit, -top * unit)
  g.lineCap = 'round'
  g.lineJoin = 'round'
  for (const s of all) paintStroke(g, s, unit)
  return cv
}

/** 预览模式（?demo=1）用：自动写一段示例签名 */
function drawDemo() {
  const unit = cssW
  const push = (points: Array<[number, number]>) => {
    const pts: InkStroke = points.map(([x, y], i) => ({
      x,
      y,
      w: (BASE_PX * (0.72 + 0.5 * Math.abs(Math.sin(i * 0.5)))) / unit
    }))
    strokes.value = [...strokes.value, pts]
  }

  // 写在画布偏下的位置，整体横向铺开，接近真实签名的比例
  const wave: Array<[number, number]> = []
  for (let i = 0; i <= 60; i++) {
    const t = i / 60
    wave.push([0.08 + t * 0.36, 0.72 - Math.sin(t * Math.PI * 1.4) * 0.14 - t * 0.02])
  }
  push(wave)

  const loop: Array<[number, number]> = []
  for (let i = 0; i <= 52; i++) {
    const t = (i / 52) * Math.PI * 2
    loop.push([0.5 + Math.sin(t) * 0.036 + (i / 52) * 0.07, 0.66 + Math.cos(t) * 0.12])
  }
  push(loop)

  const tail: Array<[number, number]> = []
  for (let i = 0; i <= 48; i++) {
    const t = i / 48
    tail.push([0.63 + t * 0.28, 0.74 - Math.sin(t * Math.PI) * 0.1])
  }
  push(tail)

  const under: Array<[number, number]> = []
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    under.push([0.12 + t * 0.72, 0.9 - Math.sin(t * Math.PI) * 0.03])
  }
  push(under)

  setInk(true)
  syncSize()
}

defineExpose({ clear, undo, getStrokes, setStrokes, exportInk, drawDemo, empty })

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
  <div
    class="pad-surface"
    :class="{ 'is-fill': fill }"
    :style="fill ? undefined : { aspectRatio: String(INK_RATIO) }"
  >
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
    <div v-if="!fill" class="pad-baseline" />
    <div v-if="!fill" class="pad-ghost" :style="{ opacity: empty ? 1 : 0 }">在此签名</div>
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

.pad-surface.is-fill {
  height: 100%;
  border-radius: 18px;
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

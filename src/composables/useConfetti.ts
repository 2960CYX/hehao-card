import confetti from 'canvas-confetti'

/** canvas-confetti 的 shapeFromText 在部分类型定义里缺失，这里做一次安全读取 */
type ShapeFactory = (opts: { text: string; scalar?: number }) => confetti.Shape

const PALETTE = ['#d57c93', '#ec9fb1', '#efd0a0', '#ffe6cc', '#a53f61', '#fff8f5', '#f6c7d0']

export interface ConfettiController {
  /** 小型庆祝：解锁成功时用 */
  burst: (count?: number) => void
  /** 满屏爱心 + 烟花：和好时用 */
  celebrate: () => void
  /** 清理定时器并停止动画 */
  reset: () => void
}

/**
 * canvas-confetti 控制器。
 * 使用自建的固定定位画布（useWorker: false），避免 GitHub Pages / Safari 下的 Worker 兼容问题。
 */
export function useConfetti(getCanvas: () => HTMLCanvasElement | null): ConfettiController {
  let fire: confetti.CreateTypes | null = null
  let heart: confetti.Shape | null = null
  let timers: number[] = []
  let celebrating = false

  function init(): confetti.CreateTypes | null {
    if (fire) return fire
    const el = getCanvas()
    if (!el) return null
    fire = confetti.create(el, { resize: true, useWorker: false })

    const factory = (confetti as unknown as { shapeFromText?: ShapeFactory }).shapeFromText
    if (typeof factory === 'function') {
      try {
        heart = factory({ text: '❤️', scalar: 2.4 })
      } catch {
        heart = null
      }
    }
    return fire
  }

  function clearTimers() {
    timers.forEach((t) => window.clearTimeout(t))
    timers = []
  }

  function burst(count = 90) {
    const f = init()
    if (!f) return
    f({
      particleCount: count,
      spread: 105,
      startVelocity: 44,
      ticks: 170,
      scalar: 1,
      origin: { x: 0.5, y: 0.68 },
      colors: PALETTE,
      disableForReducedMotion: true
    })
  }

  function celebrate() {
    const f = init()
    if (!f || celebrating) return
    celebrating = true

    // 两侧礼炮
    f({
      particleCount: 80,
      angle: 58,
      spread: 68,
      startVelocity: 62,
      origin: { x: 0, y: 0.86 },
      colors: PALETTE,
      ticks: 220,
      disableForReducedMotion: true
    })
    f({
      particleCount: 80,
      angle: 122,
      spread: 68,
      startVelocity: 62,
      origin: { x: 1, y: 0.86 },
      colors: PALETTE,
      ticks: 220,
      disableForReducedMotion: true
    })

    const startedAt = Date.now()
    const DURATION = 3400

    const step = () => {
      if (Date.now() - startedAt > DURATION) {
        celebrating = false
        return
      }
      const f2 = init()
      if (!f2) {
        celebrating = false
        return
      }
      // 随机位置烟花
      f2({
        particleCount: 58,
        spread: 360,
        startVelocity: 28,
        gravity: 0.92,
        ticks: 120,
        scalar: 0.9,
        origin: { x: 0.18 + Math.random() * 0.64, y: 0.18 + Math.random() * 0.36 },
        colors: PALETTE,
        disableForReducedMotion: true
      })
      // 爱心雨
      if (heart) {
        f2({
          particleCount: 6,
          spread: 120,
          startVelocity: 8,
          gravity: 0.48,
          ticks: 260,
          scalar: 2.4,
          shapes: [heart],
          origin: { x: Math.random(), y: -0.1 },
          disableForReducedMotion: true
        })
      }
      timers.push(window.setTimeout(step, 270))
    }

    timers.push(window.setTimeout(step, 240))
  }

  function reset() {
    clearTimers()
    celebrating = false
    fire?.reset()
  }

  return { burst, celebrate, reset }
}

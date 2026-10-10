<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SignaturePad from './SignaturePad.vue'
import type { InkStroke } from '../signature'

const props = withDefaults(
  defineProps<{
    open: boolean
    strokes?: InkStroke[]
    /** 预览模式（?demo=1）用：打开后自动写一段示例并确定 */
    autoDemo?: boolean
  }>(),
  { strokes: () => [], autoDemo: false }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm', payload: { ink: HTMLCanvasElement; strokes: InkStroke[] }): void
}>()

const padRef = ref<InstanceType<typeof SignaturePad> | null>(null)
const empty = ref(true)
const isPortrait = ref(true)
let demoTimers: number[] = []

function updateOrientation() {
  isPortrait.value = window.innerHeight >= window.innerWidth
}

function clearDemoTimers() {
  demoTimers.forEach((t) => window.clearTimeout(t))
  demoTimers = []
}

watch(
  () => props.open,
  async (open) => {
    clearDemoTimers()
    if (!open) return

    await nextTick()
    updateOrientation()
    // 把已有的笔迹带进来，方便继续修改
    padRef.value?.setStrokes(props.strokes)
    empty.value = props.strokes.length === 0

    if (props.autoDemo) {
      demoTimers.push(window.setTimeout(() => padRef.value?.drawDemo(), 600))
      demoTimers.push(window.setTimeout(() => confirm(), 1400))
    }
  }
)

onMounted(() => {
  updateOrientation()
  window.addEventListener('resize', updateOrientation)
  window.addEventListener('orientationchange', updateOrientation)
})

onBeforeUnmount(() => {
  clearDemoTimers()
  window.removeEventListener('resize', updateOrientation)
  window.removeEventListener('orientationchange', updateOrientation)
})

function clearAll() {
  padRef.value?.clear()
}

function undo() {
  padRef.value?.undo()
}

function confirm() {
  const pad = padRef.value
  if (!pad) return
  emit('confirm', { ink: pad.exportInk(), strokes: pad.getStrokes() })
}

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="sign-mask">
        <div class="sign-sheet">
          <header class="sign-head">
            <div>
              <h2 class="sign-title">手写签名</h2>
              <p class="sign-tip">用手指在下面写，写大一点更好看</p>
            </div>
            <button type="button" class="sign-close" aria-label="关闭" @click="close">✕</button>
          </header>

          <div class="sign-board">
            <SignaturePad ref="padRef" fill @update:empty="empty = $event" />

            <!-- 竖屏时提示横过来：签名的瓶颈是宽度，横屏能拿到 2 倍以上的书写宽度 -->
            <!-- 屏幕旋转被锁住时手机转不动，只能横着拿手机写，所以补一句「签完自动摆正」 -->
            <Transition name="fade">
              <p v-if="isPortrait && empty" class="sign-rotate">
                <span class="sign-rotate-icon" aria-hidden="true">↻</span>
                横过来写更宽 · 转不动也不怕，签完自动摆正
              </p>
            </Transition>
          </div>

          <div class="sign-actions">
            <button type="button" class="btn btn-ghost" :disabled="empty" @click="undo">撤销</button>
            <button type="button" class="btn btn-ghost" :disabled="empty" @click="clearAll">清空</button>
            <button type="button" class="btn btn-primary" :disabled="empty" @click="confirm">确定</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sign-mask {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  flex-direction: column;
  padding: calc(env(safe-area-inset-top, 0px) + 14px) 14px calc(env(safe-area-inset-bottom, 0px) + 14px);
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(126, 45, 83, 0.8) 0%, rgba(126, 45, 83, 0) 62%),
    rgba(13, 5, 13, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.sign-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  height: 100%;
  margin: 0 auto;
  min-height: 0;
}

.sign-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 4px 12px;
}

.sign-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #fae7c5;
}

.sign-tip {
  margin: 5px 0 0;
  font-size: 12px;
  color: rgba(255, 230, 224, 0.54);
}

.sign-close {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255, 224, 220, 0.2);
  background: rgba(255, 235, 230, 0.08);
  color: rgba(255, 243, 238, 0.82);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.sign-close:active {
  transform: scale(0.94);
  background: rgba(255, 255, 255, 0.16);
}

/* 白板占满剩余空间 —— 竖屏拿到最大高度，横屏拿到最大宽度 */
.sign-board {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 24px 60px -24px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(239, 177, 192, 0.25);
}

.sign-rotate {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  padding: 8px 15px;
  border-radius: 999px;
  white-space: nowrap;
  font-size: 12px;
  color: #6a4f5b;
  background: rgba(255, 253, 248, 0.92);
  box-shadow: 0 8px 22px -10px rgba(90, 66, 20, 0.7);
  pointer-events: none;
}

.sign-rotate-icon {
  font-size: 16px;
  line-height: 1;
  color: #a53f61;
  animation: rotateHint 2.4s ease-in-out infinite;
}

@keyframes rotateHint {
  0%,
  45%,
  100% {
    transform: rotate(0deg);
  }
  60%,
  85% {
    transform: rotate(90deg);
  }
}

.sign-actions {
  display: flex;
  gap: 10px;
  padding-top: 14px;
}

.sign-actions .btn {
  flex: 1 1 0;
}

.sign-actions .btn-primary {
  flex: 1.4 1 0;
}

/* ---------------- 横屏：把高度尽量留给书写区 ---------------- */
@media (orientation: landscape) {
  .sign-mask {
    padding: 8px 12px calc(env(safe-area-inset-bottom, 0px) + 8px);
  }

  .sign-head {
    align-items: center;
    padding: 0 4px 8px;
  }

  .sign-title {
    font-size: 14px;
  }

  /* 横屏空间宝贵，提示语省掉 */
  .sign-tip {
    display: none;
  }

  .sign-close {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .sign-board {
    border-radius: 16px;
  }

  .sign-actions {
    padding-top: 8px;
  }

  .sign-actions .btn {
    min-height: 38px;
    font-size: 13px;
  }
}
</style>

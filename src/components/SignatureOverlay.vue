<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
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
let demoTimers: number[] = []

watch(
  () => props.open,
  async (open) => {
    demoTimers.forEach((t) => window.clearTimeout(t))
    demoTimers = []
    if (!open) return

    await nextTick()
    // 把已有的笔迹带进来，方便继续修改
    padRef.value?.setStrokes(props.strokes)
    empty.value = props.strokes.length === 0

    if (props.autoDemo) {
      demoTimers.push(window.setTimeout(() => padRef.value?.drawDemo(), 600))
      demoTimers.push(window.setTimeout(() => confirm(), 1400))
    }
  }
)

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
    radial-gradient(120% 60% at 50% 0%, rgba(108, 23, 48, 0.75) 0%, rgba(108, 23, 48, 0) 60%),
    rgba(10, 2, 5, 0.94);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.sign-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 760px;
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
  color: #ffe9b0;
}

.sign-tip {
  margin: 5px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.sign-close {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.sign-close:active {
  transform: scale(0.94);
  background: rgba(255, 255, 255, 0.16);
}

/* 白板占满剩余空间 —— 手机上能拿到最大的一块书写区 */
.sign-board {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 24px 60px -24px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(232, 201, 106, 0.22);
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
</style>

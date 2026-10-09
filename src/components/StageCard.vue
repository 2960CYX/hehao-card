<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import FlipCard from './FlipCard.vue'
import LockedCard from './LockedCard.vue'
import MakeUpCard from './MakeUpCard.vue'
import SignatureOverlay from './SignatureOverlay.vue'
import { CARD_H, CARD_W, ISSUER_NAME } from '../cardSpec'
import { renderCard } from '../composables/useCardRenderer'
import { loadHolderSignature } from '../composables/useHolderSignature'
import { rotateInkCanvas, suggestInkRotation, type InkRotation } from '../inkOrientation'
import type { InkStroke } from '../signature'

const props = withDefaults(defineProps<{ serial: string; issuedAt: string; demo?: number }>(), {
  demo: 0
})

const emit = defineEmits<{
  (e: 'confirm', dataUrl: string): void
  (e: 'toast', text: string, kind: 'error' | 'info'): void
}>()

const flipped = ref(false)
const showPad = ref(false)
const busy = ref(false)
const overlayOpen = ref(false)

/** 她签好的笔迹（放大手写确认后带回） */
const inkStrokes = ref<InkStroke[]>([])
const inkCanvas = ref<HTMLCanvasElement | null>(null)
const previewUrl = ref('')

/** 笔迹在卡面上的旋转角度：手机横着拿却能没转屏时写的签名要转 90° 才摆得正 */
const inkRotation = ref<InkRotation>(0)
const autoRotated = ref(false)

const hasInk = computed(() => inkCanvas.value !== null)

const timers: number[] = []

/** 预览和成品卡共用同一个角度，所见即所得 */
function refreshPreview() {
  const ink = inkCanvas.value
  if (!ink) {
    previewUrl.value = ''
    return
  }
  previewUrl.value = rotateInkCanvas(ink, inkRotation.value).toDataURL('image/png')
}

onMounted(async () => {
  await nextTick()
  // 先亮出卡片背面，再翻到正面
  timers.push(window.setTimeout(() => (flipped.value = true), 260))
  // 翻转完成后签名面板再滑入
  timers.push(window.setTimeout(() => (showPad.value = true), 860))

  // ?demo=1 自动走一遍：打开放大手写 → 自动写字 → 自动确定
  if (props.demo >= 1) {
    timers.push(window.setTimeout(() => (overlayOpen.value = true), 1300))
  }
  if (props.demo >= 2) {
    timers.push(window.setTimeout(() => confirmSign(), 4200))
  }
})

onBeforeUnmount(() => {
  timers.forEach((t) => window.clearTimeout(t))
  timers.length = 0
})

function openPad() {
  if (busy.value) return
  overlayOpen.value = true
}

function onInkConfirmed(payload: { ink: HTMLCanvasElement; strokes: InkStroke[] }) {
  inkCanvas.value = payload.ink
  inkStrokes.value = payload.strokes
  // 竖长的笔迹 = 写字的时候手机是横过来的（页面没跟着转），先自动摆正
  const guess = suggestInkRotation(payload.strokes)
  inkRotation.value = guess
  autoRotated.value = guess !== 0
  refreshPreview()
  overlayOpen.value = false
}

/** 手动转 90°：猜错方向或者就是想换个角度时用 */
function rotateInk() {
  if (!hasInk.value) return
  inkRotation.value = (((inkRotation.value + 90) % 360) as InkRotation)
  autoRotated.value = false
  refreshPreview()
}

function reset() {
  inkCanvas.value = null
  inkStrokes.value = []
  previewUrl.value = ''
  inkRotation.value = 0
  autoRotated.value = false
  emit('toast', '已清除笔迹，点签名区重新写', 'info')
}

async function confirmSign() {
  if (busy.value) return
  if (!inkCanvas.value) {
    emit('toast', '还没签名呢，点签名区写一个吧', 'error')
    return
  }

  busy.value = true
  try {
    // 关键一步：把她的笔迹画到「签发人」栏，再盖上红色印章
    // 「持卡人」栏是预先印好的签名图
    const holderSign = await loadHolderSignature()
    const canvas = renderCard({
      serial: props.serial,
      dateText: props.issuedAt,
      issuerInk: inkCanvas.value,
      holderSign,
      inkRotation: inkRotation.value
    })
    emit('confirm', canvas.toDataURL('image/png'))
  } catch (error) {
    console.error('[renderCard] failed', error)
    emit('toast', '合成失败了，请再试一次', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="stage">
    <div class="card-slot" :style="{ aspectRatio: `${CARD_W} / ${CARD_H}` }">
      <FlipCard :flipped="flipped">
        <template #back><LockedCard /></template>
        <template #front><MakeUpCard :serial="serial" :issued-at="issuedAt" /></template>
      </FlipCard>
    </div>

    <Transition name="slide-up">
      <div v-if="showPad" class="pad-panel">
        <div class="pad-head">
          <span class="pad-title">✍️ 请 {{ ISSUER_NAME }} 签名</span>
          <span class="pad-tip">{{ hasInk ? '点一下可以重新写' : '点下面放大手写' }}</span>
        </div>

        <button
          type="button"
          class="sign-slot"
          :class="{ 'has-ink': hasInk }"
          :disabled="busy"
          @click="openPad"
        >
          <img v-if="previewUrl" class="sign-slot-ink" :src="previewUrl" alt="" />
          <span v-else class="sign-slot-empty">
            <span class="sign-slot-icon" aria-hidden="true">✍️</span>
            <span class="sign-slot-text">点这里手写签名</span>
            <span class="sign-slot-sub">会放大到全屏，写起来更舒服</span>
          </span>
          <span class="sign-slot-expand" aria-hidden="true">⛶</span>
        </button>

        <p class="pad-note">
          {{
            autoRotated
              ? '签名像是横着拿手机写的，已经自动摆正 · 不对就点「转一下」'
              : '确认后，笔迹和红色印章会一起合成到卡片上'
          }}
        </p>

        <div class="pad-actions">
          <button type="button" class="btn btn-ghost" :disabled="!hasInk || busy" @click="reset">
            重签
          </button>
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="!hasInk || busy"
            title="把签名转 90°"
            @click="rotateInk"
          >
            ↻ 转一下
          </button>
          <button type="button" class="btn btn-primary" :disabled="!hasInk || busy" @click="confirmSign">
            {{ busy ? '合成中…' : '确认签名' }}
          </button>
        </div>
      </div>
    </Transition>

    <SignatureOverlay
      v-model:open="overlayOpen"
      :strokes="inkStrokes"
      :auto-demo="demo >= 1"
      @confirm="onInkConfirmed"
    />
  </section>
</template>

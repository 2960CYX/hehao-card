<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import FlipCard from './FlipCard.vue'
import LockedCard from './LockedCard.vue'
import MakeUpCard from './MakeUpCard.vue'
import SignaturePad from './SignaturePad.vue'
import { renderCard } from '../composables/useCardRenderer'
import { loadHolderSignature } from '../composables/useHolderSignature'

const props = withDefaults(defineProps<{ serial: string; issuedAt: string; demo?: number }>(), {
  demo: 0
})

const emit = defineEmits<{
  (e: 'confirm', dataUrl: string): void
  (e: 'toast', text: string, kind: 'error' | 'info'): void
}>()

const flipped = ref(false)
const showPad = ref(false)
const empty = ref(true)
const busy = ref(false)
const padRef = ref<InstanceType<typeof SignaturePad> | null>(null)

const timers: number[] = []

onMounted(async () => {
  await nextTick()
  // 先亮出卡片背面，再翻到正面
  timers.push(window.setTimeout(() => (flipped.value = true), 260))
  // 翻转完成后签名区再滑入
  timers.push(window.setTimeout(() => (showPad.value = true), 860))

  if (props.demo >= 1) {
    timers.push(window.setTimeout(() => padRef.value?.drawDemo(), 1250))
  }
  if (props.demo >= 2) {
    timers.push(window.setTimeout(() => confirmSign(), 2000))
  }
})

onBeforeUnmount(() => {
  timers.forEach((t) => window.clearTimeout(t))
  timers.length = 0
})

function clear() {
  padRef.value?.clear()
  emit('toast', '已清除笔迹，请重新签名', 'info')
}

async function confirmSign() {
  if (busy.value) return
  if (empty.value || !padRef.value) {
    emit('toast', '还没签名呢，先在签名区写下名字吧', 'error')
    return
  }

  busy.value = true
  try {
    // 关键一步：把她的笔迹画到「签发人」栏，再盖上红色印章
    // 「持卡人」栏是预先印好的签名图
    const ink = padRef.value.exportInk()
    const holderSign = await loadHolderSignature()
    const canvas = renderCard({
      serial: props.serial,
      dateText: props.issuedAt,
      issuerInk: ink,
      holderSign
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
    <div class="card-slot">
      <FlipCard :flipped="flipped">
        <template #back><LockedCard /></template>
        <template #front><MakeUpCard :serial="serial" :issued-at="issuedAt" /></template>
      </FlipCard>
    </div>

    <Transition name="slide-up">
      <div v-if="showPad" class="pad-panel">
        <div class="pad-head">
          <span class="pad-title">✍️ 签发人签名</span>
          <span class="pad-tip">手指 / 鼠标直接书写</span>
        </div>

        <SignaturePad ref="padRef" :disabled="busy" @update:empty="empty = $event" />

        <p class="pad-note">确认后，笔迹和红色印章会一起合成到卡片上</p>

        <div class="pad-actions">
          <button type="button" class="btn btn-ghost" :disabled="empty || busy" @click="clear">
            重签
          </button>
          <button type="button" class="btn btn-primary" :disabled="empty || busy" @click="confirmSign">
            {{ busy ? '合成中…' : '确认签名' }}
          </button>
        </div>
      </div>
    </Transition>
  </section>
</template>

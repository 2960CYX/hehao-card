<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { CARD_H, CARD_W } from '../cardSpec'

defineProps<{ flipped: boolean }>()

const scene = ref<HTMLDivElement | null>(null)
const scale = ref(0)
let observer: ResizeObserver | null = null

function measure() {
  const el = scene.value
  if (!el) return
  const width = el.clientWidth
  if (width > 0) scale.value = width / CARD_W
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && scene.value) {
    observer = new ResizeObserver(measure)
    observer.observe(scene.value)
  } else {
    window.addEventListener('resize', measure)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', measure)
})
</script>

<template>
  <div
    ref="scene"
    class="flip-scene"
    :class="{ 'is-measuring': scale === 0 }"
    :style="{ height: `${CARD_H * scale}px` }"
  >
    <div class="card-scaler" :style="{ transform: `scale(${scale})` }">
      <div
        class="flip-inner"
        :style="{ transform: `rotateY(${flipped ? 180 : 0}deg)` }"
      >
        <div class="flip-face flip-back"><slot name="back" /></div>
        <div class="flip-face flip-front"><slot name="front" /></div>
      </div>
    </div>
  </div>
</template>

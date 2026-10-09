<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ text: string; signal: number; kind?: 'error' | 'info' }>(), {
  kind: 'info'
})

const alive = ref(false)
let timer = 0

watch(
  () => props.signal,
  () => {
    if (!props.text) return
    alive.value = true
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      alive.value = false
    }, 2400)
  }
)

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <Transition name="toast">
    <div v-if="alive && text" class="toast" :class="kind === 'error' ? 'toast-error' : 'toast-info'">
      {{ text }}
    </div>
  </Transition>
</template>

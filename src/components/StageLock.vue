<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { CARD_H, CARD_W } from '../cardSpec'
import LockedCard from './LockedCard.vue'
import VerifyDialog from './VerifyDialog.vue'

const emit = defineEmits<{ (e: 'unlocked'): void }>()

const open = ref(false)
let openTimer = 0
let passTimer = 0

onMounted(() => {
  // 进入页面后自动弹出「签给谁」选择题
  openTimer = window.setTimeout(() => {
    open.value = true
  }, 700)
})

onBeforeUnmount(() => {
  window.clearTimeout(openTimer)
  window.clearTimeout(passTimer)
})

function onPass() {
  open.value = false
  passTimer = window.setTimeout(() => emit('unlocked'), 340)
}
</script>

<template>
  <section class="stage">
    <div class="card-slot" :style="{ aspectRatio: `${CARD_W} / ${CARD_H}` }">
      <LockedCard />
    </div>

    <p class="lock-status">
      <span class="pulse-dot" aria-hidden="true" />
      卡片已锁定 · 等一个名字
    </p>

    <button type="button" class="btn btn-gold" @click="open = true">去解锁卡片</button>

    <VerifyDialog :open="open" @update:open="open = $event" @pass="onPass" />
  </section>
</template>

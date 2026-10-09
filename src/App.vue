<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppToast from './components/AppToast.vue'
import StageCard from './components/StageCard.vue'
import StageLock from './components/StageLock.vue'
import StageSuccess from './components/StageSuccess.vue'
import { useConfetti } from './composables/useConfetti'
import { formatDateCN, HOLDER_NAME, ISSUER_FULL_NAME, ISSUER_NAME, makeSerial } from './cardSpec'

type Stage = 'locked' | 'card' | 'done'

/** ?demo=1 自动解锁并示例签名；?demo=2 直接跳到成品（用于预览 / 截图） */
const demo = (() => {
  const raw = new URLSearchParams(window.location.search).get('demo')
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 2) : 0
})()

const stage = ref<Stage>(demo >= 1 ? 'card' : 'locked')
const serial = ref(makeSerial())
const issuedAt = ref(formatDateCN())
const cardImage = ref('')

const toastText = ref('')
const toastKind = ref<'error' | 'info'>('info')
const toastSignal = ref(0)

const confettiCanvas = ref<HTMLCanvasElement | null>(null)
const confetti = useConfetti(() => confettiCanvas.value)

const steps = ['身份验证', '签署条约', '预支成功']
const activeStep = computed(() => (stage.value === 'locked' ? 0 : stage.value === 'card' ? 1 : 2))

function toast(text: string, kind: 'error' | 'info' = 'info') {
  toastText.value = text
  toastKind.value = kind
  toastSignal.value += 1
}

function onUnlocked() {
  stage.value = 'card'
  confetti.burst(90)
}

function onConfirmed(dataUrl: string) {
  cardImage.value = dataUrl
  stage.value = 'done'
  confetti.celebrate()
}

function onRedo() {
  cardImage.value = ''
  stage.value = 'card'
}

/** 背景星点（固定随机位置，避免重渲染时跳动） */
const sparks = Array.from({ length: 16 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280
  const rnd = seed / 233280
  const rnd2 = ((i * 4523 + 1231) % 9973) / 9973
  return {
    left: `${Math.round(rnd * 96) + 2}%`,
    top: `${Math.round(rnd2 * 92) + 3}%`,
    animationDelay: `${(rnd2 * 4.5).toFixed(2)}s`,
    animationDuration: `${(3.6 + rnd * 3).toFixed(2)}s`
  }
})

onMounted(() => {
  // 提前初始化烟花画布，动画更跟手
  confetti.burst(0)
})

onBeforeUnmount(() => {
  confetti.reset()
})
</script>

<template>
  <div class="app-root">
    <div class="bg-deco" aria-hidden="true">
      <span class="glow glow-1" />
      <span class="glow glow-2" />
      <span class="glow glow-3" />
      <span v-for="(s, i) in sparks" :key="i" class="spark" :style="s" />
    </div>

    <header class="app-header">
      <p class="kicker">FROM {{ ISSUER_NAME }} · TO {{ HOLDER_NAME }}</p>
      <h1 class="app-title">终极和好卡 · 预支</h1>
      <p class="app-sub">出示此卡，强制无条件终止冷战</p>
    </header>

    <main class="app-main">
      <ol class="stepper">
        <li
          v-for="(name, i) in steps"
          :key="name"
          :class="{ 'is-active': i === activeStep, 'is-done': i < activeStep }"
        >
          <span class="step-dot">{{ i < activeStep ? '✓' : i + 1 }}</span>
          <span>{{ name }}</span>
        </li>
      </ol>

      <StageLock v-if="stage === 'locked'" @unlocked="onUnlocked" />

      <StageCard
        v-else-if="stage === 'card'"
        :serial="serial"
        :issued-at="issuedAt"
        :demo="demo"
        @confirm="onConfirmed"
        @toast="toast"
      />

      <StageSuccess
        v-else
        :image="cardImage"
        :serial="serial"
        @redo="onRedo"
        @toast="toast"
      />
    </main>

    <footer class="app-footer">
      <p>签发人 {{ ISSUER_FULL_NAME }} · 持卡人 {{ HOLDER_NAME }} · 有效期：永久</p>
    </footer>

    <canvas ref="confettiCanvas" class="confetti-layer" aria-hidden="true" />
    <AppToast :text="toastText" :signal="toastSignal" :kind="toastKind" />
  </div>
</template>

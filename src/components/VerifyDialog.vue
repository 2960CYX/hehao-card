<script setup lang="ts">
import { ref, watch } from 'vue'
import { HOLDER_NAME } from '../cardSpec'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'pass'): void
}>()

/**
 * 第一关：让她亲手把这张卡指定给收卡人。
 * 「世界上最可爱的宝宝」是逗趣的干扰项 —— 选了会被温柔地纠正。
 */
const OPTIONS = [
  { key: 'A', text: '世界上最可爱的宝宝', correct: false },
  { key: 'B', text: HOLDER_NAME, correct: true }
]

const passed = ref(false)
const shaking = ref(false)
const errorText = ref('')
const errorId = ref(0)
const showError = ref(false)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    passed.value = false
    errorText.value = ''
    showError.value = false
  }
)

function choose(option: (typeof OPTIONS)[number]) {
  if (passed.value) return

  if (option.correct) {
    passed.value = true
    showError.value = false
    errorText.value = ''
    window.setTimeout(() => emit('pass'), 620)
    return
  }

  // 选错：抖动 + 弹窗纠正
  errorText.value = `这张卡是签给${HOLDER_NAME}的哦～`
  errorId.value += 1
  showError.value = true

  shaking.value = true
  window.setTimeout(() => {
    shaking.value = false
  }, 480)
}
</script>

<template>
  <!-- Teleport 到 body：避免被祖先元素的 stacking context 压住 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="dialog-mask" @click.self="emit('update:open', false)">
        <div class="dialog-panel" :class="{ 'is-shake': shaking }">
          <div class="dialog-badge">🔒</div>
          <h2 class="dialog-title">签给谁？</h2>
          <p class="dialog-question">选对了，卡片才会解锁</p>

          <div class="dialog-options">
            <button
              v-for="option in OPTIONS"
              :key="option.key"
              type="button"
              class="option"
              :disabled="passed"
              @click="choose(option)"
            >
              <span class="option-key">{{ option.key }}</span>
              <span class="option-text">{{ option.text }}</span>
            </button>
          </div>

          <p class="dialog-hint dialog-hint-ghost">这张卡，是要送出去的哦</p>

          <Transition name="pop">
            <div v-if="showError" :key="errorId" class="dialog-error">
              <span aria-hidden="true">❌</span>
              <span>{{ errorText }}</span>
            </div>
          </Transition>

          <Transition name="pop">
            <div v-if="passed" class="dialog-ok">
              <span aria-hidden="true">✅</span>
              <span>收到，正在解锁卡片…</span>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

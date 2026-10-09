<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ISSUER_NAME } from '../cardSpec'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'pass'): void
}>()

const OPTIONS = [
  { key: 'A', text: '世界上最可爱的宝宝', correct: false },
  { key: 'B', text: ISSUER_NAME, correct: true }
]

const ERROR_TEXT = '身份验证失败，只有宝宝才能解锁哦'

const wrongCount = ref(0)
const shaking = ref(false)
const passed = ref(false)
const errorText = ref('')
const errorId = ref(0)
const showError = ref(false)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    wrongCount.value = 0
    passed.value = false
    errorText.value = ''
    showError.value = false
  }
)

const hint = computed(() =>
  wrongCount.value >= 3 ? '提示：正确答案里没有「最」字哦～' : '选对答案才能解锁卡片'
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

  // 选错：抖动 + 弹窗提示（提示文案直接展示在弹窗内，不再重复弹 toast）
  wrongCount.value += 1
  errorText.value = ERROR_TEXT
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
          <h2 class="dialog-title">身份验证</h2>
          <p class="dialog-question">你就是要签这张卡的人，对吧？</p>

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

          <p class="dialog-hint" :class="{ 'dialog-hint-ghost': wrongCount < 3 }">{{ hint }}</p>

          <Transition name="pop">
            <div v-if="showError" :key="errorId" class="dialog-error">
              <span aria-hidden="true">❌</span>
              <span>{{ errorText }}</span>
            </div>
          </Transition>

          <Transition name="pop">
            <div v-if="passed" class="dialog-ok">
              <span aria-hidden="true">✅</span>
              <span>身份确认成功，正在解锁卡片…</span>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

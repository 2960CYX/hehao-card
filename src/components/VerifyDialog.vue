<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { HOLDER_ANSWERS, HOLDER_NAME } from '../cardSpec'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'pass'): void
}>()

/** 答错时的递进提示：先温柔提醒，再给方向，最后直接把答案说出来（保证她能过） */
const HINTS = [
  '好像不是这个名字哦，再想想～',
  '提示：是你想把这张卡送给的那个人',
  `这张卡是签给${HOLDER_NAME}的哦～`
]

const inputEl = ref<HTMLInputElement | null>(null)
const input = ref('')
const passed = ref(false)
const shaking = ref(false)
const errorText = ref('')
const errorId = ref(0)
const showError = ref(false)
let wrongCount = 0

const canSubmit = computed(() => input.value.trim().length > 0 && !passed.value)

/** 去掉空格、统一小写后比较，避免因为多打了个空格就进不去 */
function normalize(text: string) {
  return text.replace(/\s+/g, '').toLowerCase()
}

function isCorrect(value: string) {
  const v = normalize(value)
  if (v.length < 2) return false
  return HOLDER_ANSWERS.some((answer) => {
    const a = normalize(answer)
    return v === a || v.includes(a) || a.includes(v)
  })
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    passed.value = false
    errorText.value = ''
    showError.value = false
    wrongCount = 0
    window.setTimeout(() => inputEl.value?.focus(), 320)
  }
)

function submit() {
  if (!canSubmit.value) return

  if (isCorrect(input.value)) {
    passed.value = true
    showError.value = false
    errorText.value = ''
    inputEl.value?.blur()
    window.setTimeout(() => emit('pass'), 680)
    return
  }

  errorText.value = HINTS[Math.min(wrongCount, HINTS.length - 1)]
  wrongCount += 1
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
          <p class="dialog-question">把他的名字打进来，卡片才会解锁</p>

          <form class="dialog-form" @submit.prevent="submit">
            <input
              ref="inputEl"
              v-model="input"
              class="dialog-input"
              :class="{ 'is-ok': passed }"
              type="text"
              inputmode="text"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              maxlength="24"
              placeholder="输入他的名字"
              :disabled="passed"
            />
            <button type="submit" class="btn btn-primary btn-block" :disabled="!canSubmit">
              {{ passed ? '就是这个他' : '就是他了' }}
            </button>
          </form>

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

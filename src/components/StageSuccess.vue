<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { HOLDER_NAME } from '../cardSpec'

const props = defineProps<{ image: string; serial: string }>()
const emit = defineEmits<{
  (e: 'redo'): void
  (e: 'toast', text: string, kind: 'error' | 'info'): void
}>()

const href = ref('')
const fileName = computed(() => `终极和好卡-预支成功-${props.serial}.png`)

/** dataURL → Blob，避免部分浏览器对超长 dataURL 下载支持不佳 */
function dataUrlToBlob(dataUrl: string): Blob | null {
  const comma = dataUrl.indexOf(',')
  if (comma < 0) return null
  const meta = dataUrl.slice(0, comma)
  if (!meta.includes('base64')) return null
  const binary = atob(dataUrl.slice(comma + 1))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  const mime = /:(.*?);/.exec(meta)?.[1] ?? 'image/png'
  return new Blob([bytes], { type: mime })
}

onMounted(() => {
  try {
    const blob = dataUrlToBlob(props.image)
    href.value = blob ? URL.createObjectURL(blob) : props.image
  } catch {
    href.value = props.image
  }
})

onBeforeUnmount(() => {
  if (href.value.startsWith('blob:')) URL.revokeObjectURL(href.value)
})

function onSaveClick() {
  emit('toast', '若没有自动下载，请长按卡片图片保存', 'info')
}
</script>

<template>
  <section class="stage">
    <div class="success-head">
      <h2 class="success-title">🎉 预支成功！</h2>
      <p class="success-sub">终极和好卡已生效 · 冷战立即终止</p>
    </div>

    <div class="result-wrap">
      <span class="result-badge">已生效</span>
      <img :src="image" alt="终极和好卡 · 预支凭证" />
    </div>

    <p class="success-tip">
      <span aria-hidden="true">📸</span>
      <span>可长按保存卡片图片，或截图发给{{ HOLDER_NAME }}</span>
    </p>

    <div class="success-actions">
      <a class="btn btn-gold btn-block" :href="href" :download="fileName" @click="onSaveClick">
        ⬇️ 保存卡片图片
      </a>
      <button type="button" class="btn btn-ghost btn-block" @click="emit('redo')">
        重新签一张
      </button>
    </div>
  </section>
</template>

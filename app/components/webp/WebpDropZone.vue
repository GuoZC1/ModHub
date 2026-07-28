<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Link2, X } from 'lucide-vue-next'

const emit = defineEmits<{
  files: [files: File[]]
  url: [url: string]
}>()

const isOver = ref(false)
const showUrlRow = ref(false)
const urlInput = ref('')
const loading = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileSelect() {
  fileInput.value?.click()
}

function handleFiles(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length) {
    emit('files', Array.from(target.files))
    target.value = ''
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isOver.value = false
  if (e.dataTransfer?.files.length) {
    emit('files', Array.from(e.dataTransfer.files))
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isOver.value = true
}

function handleDragLeave() {
  isOver.value = false
}

async function loadUrl() {
  if (!urlInput.value.trim()) return
  loading.value = true
  try {
    const res = await fetch(urlInput.value.trim(), { mode: 'cors' })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const blob = await res.blob()
    if (!blob.type.startsWith('image/')) throw new Error('不是图片')
    const name = decodeURIComponent(urlInput.value.split('/').pop()?.split('?')[0] || '') || ('image-' + Date.now() + '.img')
    emit('files', [new File([blob], name, { type: blob.type })])
    urlInput.value = ''
    showUrlRow.value = false
  } catch (err: any) {
    alert('加载失败（可能是跨域限制）：' + err.message)
  } finally {
    loading.value = false
  }
}

defineExpose({ fileInput })
</script>

<template>
  <div
    class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 relative"
    :class="isOver ? 'border-primary-500 bg-primary-500/10' : 'border-primary-400/50 bg-slate-800/40 hover:border-primary-500'"
    @click="triggerFileSelect"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="text-5xl mb-4">🖼️</div>
    <div class="text-lg font-semibold text-slate-200 mb-2">拖拽图片到这里，或点击上传</div>
    <div class="text-sm text-slate-400 mb-5">PNG · JPG · JPEG · GIF · BMP · WEBP · 支持粘贴 Ctrl+V</div>

    <div class="flex gap-3 justify-center flex-wrap mb-4">
      <button
        class="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        @click.stop="triggerFileSelect"
      >
        <Upload class="w-4 h-4" /> 选择文件
      </button>
      <button
        class="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors border border-slate-600"
        @click.stop="showUrlRow = !showUrlRow"
      >
        <Link2 class="w-4 h-4" /> 在线链接
      </button>
    </div>

    <div
      v-if="showUrlRow"
      class="flex gap-2 max-w-md mx-auto"
    >
      <input
        v-model="urlInput"
        type="text"
        placeholder="粘贴图片 URL，例如 https://example.com/cat.jpg"
        class="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-primary-500 placeholder:text-slate-500"
        @keyup.enter="loadUrl"
      />
      <button
        class="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        :disabled="loading"
        @click.stop="loadUrl"
      >
        {{ loading ? '加载中…' : '加载' }}
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFiles"
    />
  </div>
</template>

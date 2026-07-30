<script setup lang="ts">
import { ref, watch } from 'vue'
import { ImageIcon } from 'lucide-vue-next'

const emit = defineEmits<{
  change: [settings: WebpSettingsType]
}>()

export interface WebpSettingsType {
  format: string
  quality: number
  maxWidth: number
  maxHeight: number
  stripMeta: boolean
}

const format = ref('image/webp')
const quality = ref(80)
const maxWidth = ref(0)
const maxHeight = ref(0)
const stripMeta = ref(true)

const formats = [
  { value: 'image/webp', label: 'WebP（推荐，体积最小）' },
  { value: 'image/jpeg', label: 'JPG / JPEG' },
  { value: 'image/png', label: 'PNG（无损）' }
]

function emitChange() {
  emit('change', {
    format: format.value,
    quality: quality.value,
    maxWidth: maxWidth.value,
    maxHeight: maxHeight.value,
    stripMeta: stripMeta.value
  })
}

watch([format, quality, maxWidth, maxHeight, stripMeta], emitChange, { immediate: true })
</script>

<template>
  <aside class="w-72 flex-shrink-0 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 overflow-y-auto">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-1 h-4 bg-primary-500 rounded-full"></div>
      <h2 class="text-sm font-bold text-slate-200 uppercase tracking-wide">转换设置</h2>
    </div>

    <div class="space-y-5">
      <div class="field">
        <label class="block text-xs text-slate-400 font-semibold mb-2">输出格式</label>
        <CommonBaseSelect
          v-model="format"
          :options="formats"
          class="w-full"
        />
      </div>

      <div class="field">
        <div class="flex justify-between items-center mb-2">
          <label class="text-xs text-slate-400 font-semibold">压缩质量</label>
          <span class="text-sm font-bold text-primary-400">{{ quality }}</span>
        </div>
        <input
          type="range"
          v-model="quality"
          min="10"
          max="100"
          class="w-full accent-primary-500"
        />
      </div>

      <div class="field">
        <label class="block text-xs text-slate-400 font-semibold mb-2">最大宽度（可选，px）</label>
        <input
          type="number"
          v-model.number="maxWidth"
          placeholder="不限制"
          min="1"
          class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-primary-500 placeholder:text-slate-600"
        />
      </div>

      <div class="field">
        <label class="block text-xs text-slate-400 font-semibold mb-2">最大高度（可选，px）</label>
        <input
          type="number"
          v-model.number="maxHeight"
          placeholder="不限制"
          min="1"
          class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-primary-500 placeholder:text-slate-600"
        />
      </div>

      <label class="flex items-center gap-3 cursor-pointer pt-4 border-t border-dashed border-slate-700">
        <input
          type="checkbox"
          v-model="stripMeta"
          class="w-4 h-4 rounded border-slate-600 bg-slate-900 text-primary-500 focus:ring-primary-500"
        />
        <span class="text-sm text-slate-400">剥离元数据（EXIF 等）</span>
      </label>
    </div>
  </aside>
</template>

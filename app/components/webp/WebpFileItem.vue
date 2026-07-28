<script setup lang="ts">
import { computed } from 'vue'
import { Download } from 'lucide-vue-next'

export interface WebpFileItemType {
  id: string
  name: string
  origSize: number
  newSize: number
  status: 'busy' | 'ok' | 'err'
  err?: string
  thumbUrl: string | null
  url: string | null
  file?: File
  blob: Blob | null
}

function onThumbError(e: Event) {
  (e.target as HTMLImageElement).style.visibility = 'hidden'
}

const props = defineProps<{
  item: WebpFileItemType
  format: string
}>()

const emit = defineEmits<{
  download: [item: WebpFileItemType]
}>()

function humanSize(n: number): string {
  if (n < 1024) return n + ' B'
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1048576).toFixed(2) + ' MB'
}

const infoText = computed(() => {
  if (props.item.status === 'busy') {
    return '原图 ' + humanSize(props.item.origSize)
  }
  if (props.item.status === 'err') {
    return props.item.err || '转换失败'
  }
  const diff = props.item.origSize - props.item.newSize
  const pct = props.item.origSize ? (diff / props.item.origSize * 100) : 0
  return `原图 ${humanSize(props.item.origSize)} → ${humanSize(props.item.newSize)}`
})

const savedInfo = computed(() => {
  if (props.item.status !== 'ok') return null
  const diff = props.item.origSize - props.item.newSize
  const pct = props.item.origSize ? (diff / props.item.origSize * 100) : 0
  return { diff, pct }
})

const badgeClass = computed(() => {
  switch (props.item.status) {
    case 'busy': return 'bg-amber-500/20 text-amber-400'
    case 'err': return 'bg-red-500/20 text-red-400'
    case 'ok': return 'bg-primary-500/20 text-primary-400'
    default: return ''
  }
})

const badgeText = computed(() => {
  switch (props.item.status) {
    case 'busy': return '处理中'
    case 'err': return '失败'
    case 'ok': return '完成'
    default: return ''
  }
})

function download() {
  emit('download', props.item)
}
</script>

<template>
  <li class="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
    <img
      :src="item.thumbUrl ?? undefined"
      :alt="item.name"
      class="w-14 h-14 rounded-lg object-cover bg-slate-700/50 flex-shrink-0"
      @error="onThumbError"
    />

    <div class="flex-1 min-w-0">
      <div class="font-semibold text-sm text-slate-200 truncate">{{ item.name }}</div>
      <div class="text-xs text-slate-400 mt-1">
        {{ infoText }}
        <template v-if="savedInfo">
          ·
          <span
            :class="savedInfo.diff >= 0 ? 'text-primary-400 font-bold' : 'text-red-400 font-bold'"
          >
            {{ savedInfo.diff >= 0 ? '省' : '增大' }} {{ savedInfo.pct.toFixed(1) }}%
          </span>
        </template>
      </div>
    </div>

    <span class="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" :class="badgeClass">
      {{ badgeText }}
    </span>

    <button
      class="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
      :disabled="item.status !== 'ok'"
      @click="download"
    >
      <Download class="w-3.5 h-3.5" /> 下载
    </button>
  </li>
</template>

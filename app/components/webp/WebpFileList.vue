<script setup lang="ts">
import { computed, ref } from 'vue'
import { Trash2, Package } from 'lucide-vue-next'
import type { WebpFileItemType } from './WebpFileItem.vue'

const props = defineProps<{
  items: WebpFileItemType[]
  format: string
}>()

const emit = defineEmits<{
  download: [item: WebpFileItemType]
  clear: []
}>()

function humanSize(n: number): string {
  if (n < 1024) return n + ' B'
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1048576).toFixed(2) + ' MB'
}

const doneItems = computed(() => props.items.filter(s => s.status === 'ok'))
const totalOrig = computed(() => props.items.reduce((a, s) => a + s.origSize, 0))
const totalNew = computed(() => doneItems.value.reduce((a, s) => a + s.newSize, 0))
const savedSize = computed(() => totalOrig.value - totalNew.value)
const savedPct = computed(() => totalOrig.value ? (savedSize.value / totalOrig.value * 100) : 0)

const statsText = computed(() => {
  if (!props.items.length) {
    return '尚未添加图片'
  }
  return `共 ${props.items.length} 张 · 成功 ${doneItems.value.length} 张 · 已节省 <b>${humanSize(savedSize.value)} (${savedPct.value.toFixed(1)}%)</b>`
})

async function downloadOne(item: WebpFileItemType) {
  if (!item.url) return
  const ext = ((props.format ?? 'image/webp').split('/')[1] ?? 'webp').replace('jpeg', 'jpg').replace('webp', 'webp')
  const a = document.createElement('a')
  a.href = item.url
  a.download = item.name.replace(/\.[^.]+$/, '') + '.' + ext
  a.click()
}

function crc32(buf: Uint8Array): number {
  let c: number
  const crc32Fn = crc32 as typeof crc32 & { t?: number[] }
  let table = crc32Fn.t
  if (!table) {
    table = crc32Fn.t = new Array(256)
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
      table[n] = c >>> 0
    }
  }
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF]
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

async function buildZip(items: WebpFileItemType[]) {
  const enc = new TextEncoder()
  const chunks: Uint8Array[] = []
  const central: { header: Uint8Array; name: Uint8Array }[] = []
  let offset = 0

  const validItems = items.filter(it => it.blob !== null)

  for (const it of validItems) {
    const data = new Uint8Array(await it.blob.arrayBuffer())
    const ext = props.format.split('/')[1].replace('jpeg', 'jpg')
    const name = it.name.replace(/\.[^.]+$/, '') + '.' + ext
    const nameBytes = enc.encode(name)
    const crc = crc32(data)

    const lh = new DataView(new ArrayBuffer(30))
    lh.setUint32(0, 0x04034b50, true)
    lh.setUint16(4, 20, true)
    lh.setUint16(6, 0, true)
    lh.setUint16(8, 0, true)
    lh.setUint16(10, 0, true)
    lh.setUint16(12, 0, true)
    lh.setUint32(14, crc, true)
    lh.setUint32(18, data.length, true)
    lh.setUint32(22, data.length, true)
    lh.setUint16(26, nameBytes.length, true)
    lh.setUint16(28, 0, true)

    chunks.push(new Uint8Array(lh.buffer), nameBytes, data)

    const ch = new DataView(new ArrayBuffer(46))
    ch.setUint32(0, 0x02014b50, true)
    ch.setUint16(4, 20, true)
    ch.setUint16(6, 20, true)
    ch.setUint16(8, 0, true)
    ch.setUint16(10, 0, true)
    ch.setUint16(12, 0, true)
    ch.setUint16(14, 0, true)
    ch.setUint32(16, crc, true)
    ch.setUint32(20, data.length, true)
    ch.setUint32(24, data.length, true)
    ch.setUint16(28, nameBytes.length, true)
    ch.setUint16(30, 0, true)
    ch.setUint16(32, 0, true)
    ch.setUint16(34, 0, true)
    ch.setUint16(36, 0, true)
    ch.setUint32(38, 0, true)
    ch.setUint32(42, offset, true)

    central.push({ header: new Uint8Array(ch.buffer), name: nameBytes })
    offset += 30 + nameBytes.length + data.length
  }

  let centralSize = 0
  const cc: Uint8Array[] = []
  for (const c of central) {
    cc.push(c.header, c.name)
    centralSize += c.header.length + c.name.length
  }

  const eocd = new DataView(new ArrayBuffer(22))
  eocd.setUint32(0, 0x06054b50, true)
  eocd.setUint16(4, 0, true)
  eocd.setUint16(6, 0, true)
  eocd.setUint16(8, items.length, true)
  eocd.setUint16(10, items.length, true)
  eocd.setUint32(12, centralSize, true)
  eocd.setUint32(16, offset, true)
  eocd.setUint16(20, 0, true)

  return new Blob([...chunks, ...cc, new Uint8Array(eocd.buffer)], { type: 'application/zip' })
}

const zipLoading = ref(false)

async function downloadZip() {
  const done = doneItems.value
  if (!done.length) return

  zipLoading.value = true
  try {
    const blob = await buildZip(done)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'webp-export.zip'
    a.click()
  } finally {
    zipLoading.value = false
  }
}

function clearAll() {
  emit('clear')
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <div class="flex justify-between items-center flex-shrink-0 flex-wrap gap-3 mb-3">
      <div class="text-sm text-slate-400" v-html="statsText"></div>
      <div class="flex gap-2">
        <button
          class="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          :disabled="!items.length"
          @click="clearAll"
        >
          <Trash2 class="w-3.5 h-3.5" /> 清空
        </button>
        <button
          class="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          :disabled="!doneItems.length || zipLoading"
          @click="downloadZip"
        >
          <Package class="w-3.5 h-3.5" /> {{ zipLoading ? '打包中…' : '打包下载全部' }}
        </button>
      </div>
    </div>

    <ul class="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
      <li v-if="!items.length" class="text-center text-slate-500 py-8 text-sm">
        处理完成后，结果会显示在这里
      </li>
      <WebpFileItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :format="format"
        @download="downloadOne"
      />
    </ul>
  </div>
</template>

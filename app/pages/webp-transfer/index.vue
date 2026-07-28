<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppHeader from '~/components/AppHeader.vue'
import WebpSettings from '~/components/webp/WebpSettings.vue'
import WebpDropZone from '~/components/webp/WebpDropZone.vue'
import WebpFileList from '~/components/webp/WebpFileList.vue'
import type { WebpSettingsType } from '~/components/webp/WebpSettings.vue'
import type { WebpFileItemType } from '~/components/webp/WebpFileItem.vue'

const settings = reactive<WebpSettingsType>({
  format: 'image/webp',
  quality: 80,
  maxWidth: 0,
  maxHeight: 0,
  stripMeta: true
})

const files = ref<WebpFileItemType[]>([])

function handleSettingsChange(newSettings: WebpSettingsType) {
  Object.assign(settings, newSettings)
  reprocessFiles()
}

function handleFiles(newFiles: File[]) {
  const imageFiles = newFiles.filter(f => f.type.startsWith('image/'))
  if (!imageFiles.length) return

  for (const file of imageFiles) {
    const id = 'f' + Date.now() + Math.random().toString(36).slice(2, 7)
    const item: WebpFileItemType = {
      id,
      file,
      name: file.name,
      origSize: file.size,
      blob: null,
      url: null,
      status: 'busy',
      newSize: 0,
      thumbUrl: URL.createObjectURL(file)
    }
    files.value.push(item)
  }
  processFiles()
}

async function processFiles() {
  for (const item of files.value) {
    if (item.status === 'ok' || item.status === 'err') continue
    item.status = 'busy'
    try {
      const bitmap = await createImageBitmap(item.file as File)
      let { width, height } = bitmap

      if (settings.maxWidth && width > settings.maxWidth) {
        height = Math.round(height * settings.maxWidth / width)
        width = settings.maxWidth
      }
      if (settings.maxHeight && height > settings.maxHeight) {
        width = Math.round(width * settings.maxHeight / height)
        height = settings.maxHeight
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!

      if (settings.format === 'image/jpeg') {
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, width, height)
      }
      ctx.drawImage(bitmap, 0, 0, width, height)
      bitmap.close?.()

      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, settings.format, settings.quality / 100))
      if (!blob) throw new Error('该浏览器不支持此格式输出')

      item.blob = blob
      item.newSize = blob.size
      item.status = 'ok'
      item.url = URL.createObjectURL(blob)
      item.thumbUrl = item.url
    } catch (err: any) {
      item.status = 'err'
      item.err = err.message
    }
  }
}

function reprocessFiles() {
  if (!files.value.length) return
  for (const item of files.value) {
    if (item.status !== 'busy') {
      item.status = 'busy'
      item.blob = null
      item.url = null
      item.newSize = 0
    }
  }
  processFiles()
}

function clearAll() {
  for (const item of files.value) {
    if (item.url) URL.revokeObjectURL(item.url)
    if (item.thumbUrl) URL.revokeObjectURL(item.thumbUrl)
  }
  files.value = []
}

if (typeof window !== 'undefined') {
  window.addEventListener('paste', (e: ClipboardEvent) => {
    const items = [...(e.clipboardData?.items || [])]
    const imgs = items.filter(i => i.type.startsWith('image/')).map(i => i.getAsFile()).filter(Boolean) as File[]
    if (imgs.length) handleFiles(imgs)
  })
}
</script>

<template>
  <div class="flex h-screen flex-col bg-slate-900">
    <AppHeader title="ModHub" />
    <div class="flex-1 flex flex-col overflow-hidden pt-14">
      <UContainer class="flex flex-1 flex-col min-h-0">

        <main class="flex-1 flex gap-4 p-4 min-h-0">
          <WebpSettings @change="handleSettingsChange" />

          <div class="flex-1 flex flex-col gap-4 min-h-0">
            <WebpDropZone @files="handleFiles" />
            <WebpFileList :items="files" :format="settings.format" @clear="clearAll" />
          </div>
        </main>
      </UContainer>
    </div>
  </div>
</template>

<style scoped>
ul::-webkit-scrollbar {
  width: 6px;
}
ul::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 6px;
}
</style>

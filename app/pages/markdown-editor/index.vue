<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { renderMarkdown } from '~/utils/markdown'
import MarkdownToolbar from '~/components/common/MarkdownToolbar.vue'
import { Copy, FileDown, Save, Upload, Download, Trash2, FileCode } from 'lucide-vue-next'

const STORAGE_KEY = 'md-content'

const DEFAULT_MD = `# 欢迎使用 Markdown 编辑器

实时输入，**即时预览**。试试上方工具栏，或直接在左侧编写 Markdown。

## 功能
- 实时预览
- 自动保存到浏览器
- 导出 .md / .html
- 双色主题设计

> 提示：内容会自动保存在本地，刷新不丢失。

\`\`\`js
console.log('Hello, Nuxt + Markdown!')
\`\`\`
`

const content = ref(DEFAULT_MD)
const previewHtml = ref('')
const flashMsg = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const lineCount = computed(() =>
  content.value === '' ? 0 : content.value.split('\n').length
)

async function render() {
  if (!import.meta.client) return
  previewHtml.value = await renderMarkdown(content.value)
}

function save() {
  if (import.meta.client) localStorage.setItem(STORAGE_KEY, content.value)
}

function applyAction(act: string) {
  const ta = document.getElementById('editor') as HTMLTextAreaElement | null
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const val = ta.value
  const sel = val.slice(start, end)
  const wrap = (b: string, a: string) => {
    ta.value = val.slice(0, start) + b + sel + a + val.slice(end)
    ta.selectionStart = start + b.length
    ta.selectionEnd = end + b.length
  }
  const linePrefix = (p: string) => {
    const ls = val.lastIndexOf('\n', start - 1) + 1
    ta.value = val.slice(0, ls) + p + val.slice(ls)
    ta.selectionStart = ta.selectionEnd = start + p.length
  }
  const insert = (t: string) => {
    ta.value = val.slice(0, start) + t + val.slice(end)
    ta.selectionStart = ta.selectionEnd = start + t.length
  }
  switch (act) {
    case 'h': linePrefix('## '); break
    case 'b': wrap('**', '**'); break
    case 'i': wrap('*', '*'); break
    case 's': wrap('~~', '~~'); break
    case 'quote': linePrefix('> '); break
    case 'ul': linePrefix('- '); break
    case 'ol': linePrefix('1. '); break
    case 'code': wrap('`', '`'); break
    case 'codeblock': insert('\n```\n代码\n```\n'); break
    case 'link': wrap('[', '](https://)'); break
    case 'img': wrap('![', '](https://)'); break
    case 'table': insert('\n| 列1 | 列2 |\n| --- | --- |\n| a | b |\n'); break
    case 'hr': insert('\n\n---\n\n'); break
  }
  ta.focus()
  content.value = ta.value
}

function flash(msg: string) {
  flashMsg.value = msg
  window.setTimeout(() => (flashMsg.value = ''), 1500)
}

function copyMarkdown() {
  navigator.clipboard.writeText(content.value).then(() => flash('已复制到剪贴板'))
}

function importFile() {
  fileInput.value?.click()
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    content.value = String(reader.result ?? '')
    flash('已导入 ' + file.name)
  }
  reader.onerror = () => flash('导入失败')
  reader.readAsText(file)
  input.value = '' // 允许再次选择同一文件
}

function download(filename: string, type: string, body: string) {
  const blob = new Blob([body], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportHtml(): string {
  return (
    '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>Exported</title>' +
    '<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7}' +
    'code{background:#f3f4f6;padding:.15em .4em;border-radius:4px}' +
    'pre{background:#f3f4f6;padding:14px;border-radius:8px;overflow:auto}' +
    'blockquote{border-left:4px solid #d1d5db;margin:0;padding:.2em 1em;color:#6b7280}' +
    'table{border-collapse:collapse}th,td{border:1px solid #e5e7eb;padding:6px 12px}</style></head><body>' +
    previewHtml.value +
    '</body></html>'
  )
}

function clearAll() {
  if (window.confirm('确定清空全部内容？')) {
    content.value = ''
    flash('已清空')
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const ta = e.target as HTMLTextAreaElement
    const start = ta.selectionStart
    ta.value = ta.value.slice(0, start) + '  ' + ta.value.slice(ta.selectionEnd)
    ta.selectionStart = ta.selectionEnd = start + 2
    content.value = ta.value
  }
}

let syncing = false
function onEditorScroll(e: Event) {
  if (syncing) return
  syncing = true
  const ta = e.target as HTMLTextAreaElement
  const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight || 1)
  const pv = document.getElementById('preview')
  if (pv) pv.scrollTop = ratio * (pv.scrollHeight - pv.clientHeight)
  requestAnimationFrame(() => (syncing = false))
}
function onPreviewScroll(e: Event) {
  if (syncing) return
  syncing = true
  const pv = e.target as HTMLElement
  const ratio = pv.scrollTop / (pv.scrollHeight - pv.clientHeight || 1)
  const ta = document.getElementById('editor') as HTMLTextAreaElement | null
  if (ta) ta.scrollTop = ratio * (ta.scrollHeight - ta.clientHeight)
  requestAnimationFrame(() => (syncing = false))
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved !== null) content.value = saved
  render()
})

watch(content, () => {
  render()
  save()
})
</script>

<template>
  <div class="flex h-screen flex-col bg-slate-900 text-slate-100">
    <AppHeader title="ModHub" />
    <div class="flex-1 pt-14 flex flex-col overflow-hidden">
<UContainer class="flex flex-1 flex-col min-h-0">
      <header class="flex flex-wrap items-center gap-3 border-b border-slate-700/50 bg-slate-800/80 px-4 py-2 backdrop-blur-sm">
        <h1 class="text-sm font-semibold text-slate-200">📝 Markdown 编辑器</h1>
        <MarkdownToolbar class="flex-1" @action="applyAction" />
        <div class="flex items-center gap-2">
          <button class="btn" title="导入 Markdown 文件" @click="importFile">
            <Upload class="h-4 w-4" /> 导入
          </button>
          <button class="btn" title="复制 Markdown" @click="copyMarkdown">
            <Copy class="h-4 w-4" /> 复制
          </button>
          <button class="btn" title="下载 .md" @click="download('document.md', 'text/markdown', content)">
            <FileDown class="h-4 w-4" /> .md
          </button>
          <button class="btn" title="下载 HTML" @click="download('document.html', 'text/html', exportHtml())">
            <FileCode class="h-4 w-4" /> HTML
          </button>
          <button class="btn btn-danger" title="清空" @click="clearAll">
            <Trash2 class="h-4 w-4" /> 清空
          </button>
        </div>
      </header>

      <main class="flex min-h-0 flex-1">
        <section class="flex min-w-0 flex-1 flex-col bg-slate-900">
          <div class="border-b border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs uppercase tracking-wide text-slate-400 flex items-center justify-between">
            <span>编辑</span>
            <span class="text-[10px] opacity-60">{{ lineCount }} 行</span>
          </div>
          <textarea
            id="editor"
            v-model="content"
            spellcheck="false"
            class="flex-1 resize-none bg-slate-900 p-4 font-mono text-sm leading-7 outline-none text-slate-200 placeholder-slate-600"
            placeholder="在这里编写 Markdown..."
            @keydown="onKeydown"
            @scroll="onEditorScroll"
          />
        </section>
        <div class="w-px bg-gradient-to-b from-purple-500/50 via-purple-300/30 to-purple-500/50"></div>
        <section class="flex min-w-0 flex-1 flex-col bg-slate-900">
          <div class="border-b border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs uppercase tracking-wide text-slate-400 flex items-center justify-between">
            <span>预览</span>
            <span class="text-[10px] opacity-60">{{ content.length }} 字符</span>
          </div>
          <div
            id="preview"
            class="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-100"
            @scroll="onPreviewScroll"
            v-html="previewHtml"
          />
        </section>
      </main>

      <footer class="flex gap-4 border-t border-slate-700/50 bg-slate-800/80 px-4 py-1.5 text-xs text-slate-500 backdrop-blur-sm">
        <span>{{ content.length }} 字符 · {{ lineCount }} 行</span>
        <span v-if="flashMsg" class="text-purple-400">{{ flashMsg }}</span>
        <span class="ml-auto">自动保存到本地浏览器</span>
      </footer>

      <input ref="fileInput" type="file" accept=".md,.markdown,.txt" class="hidden" @change="onFileSelected" />
</UContainer>
    </div>
  </div>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--color-slate-600);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  background: transparent;
  color: var(--color-slate-300);
  transition: all 0.2s ease;
}

.btn:hover {
  border-color: var(--color-primary-500);
  color: var(--color-primary-400);
}

.btn-danger {
  border-color: var(--color-slate-700);
  color: var(--color-slate-400);
}

.btn-danger:hover {
  border-color: var(--color-error-500);
  color: var(--color-error-400);
}
</style>

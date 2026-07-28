<script setup lang="ts">
import { resolveComponent } from 'vue'
import { Heading, Bold, Italic, Strikethrough, Quote, List, ListOrdered, Code, Braces, Link, Image, Table, Minus } from 'lucide-vue-next';

const emit = defineEmits<{ action: [act: string] }>()

const items = [
  { act: 'h', icon: Heading, title: '标题' },
  { act: 'b', icon: Bold, title: '加粗' },
  { act: 'i', icon: Italic, title: '斜体' },
  { act: 's', icon: Strikethrough, title: '删除线' },
  { act: 'quote', icon: Quote, title: '引用' },
  { act: 'ul', icon: List, title: '无序列表' },
  { act: 'ol', icon: ListOrdered, title: '有序列表' },
  { act: 'code', icon: Code, title: '行内代码' },
  { act: 'codeblock', icon: Braces, title: '代码块' },
  { act: 'link', icon: Link, title: '链接' },
  { act: 'img', icon: Image, title: '图片' },
  { act: 'table', icon: Table, title: '表格' },
  { act: 'hr', icon: Minus, title: '分割线' }
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <button
      v-for="it in items"
      :key="it.act"
      :title="it.title"
      class="rounded border border-zinc-300 p-1.5 text-zinc-600 transition hover:border-blue-500 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
      @click="emit('action', it.act)"
    >
      <component :is="it.icon" class="h-4 w-4" />
    </button>
  </div>
</template>
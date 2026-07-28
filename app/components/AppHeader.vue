<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{
  title?: string
}>()

const route = useRoute()
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 px-4 py-3 backdrop-blur-xl bg-slate-900/80 dark:bg-slate-900/80 border-b border-white/5">
    <UContainer class="flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="text-purple-400 text-xl drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]">◈</span>
        <span class="font-bold text-lg tracking-wide text-white">{{ title || 'ModHub' }}</span>
        <UBadge color="primary" variant="subtle" size="xs">v4</UBadge>
      </NuxtLink>
      <nav class="hidden sm:flex items-center gap-7 text-sm text-slate-400">
        <NuxtLink to="/" class="text-white" :class="{ 'text-purple-400': route.path === '/' }">首页</NuxtLink>
        <NuxtLink to="#" class="hover:text-white transition-colors">工具</NuxtLink>
        <NuxtLink to="#" class="hover:text-white transition-colors">文档</NuxtLink>
        <NuxtLink to="#" class="hover:text-white transition-colors">关于</NuxtLink>
      </nav>
    </UContainer>
  </header>
</template>

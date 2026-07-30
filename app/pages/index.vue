<script setup lang="ts">
// Nuxt 4 页面 —— 小工具集合网站首页（Nuxt UI + Tailwind CSS）
// 仅「Markdown 编辑器」为可用工具；点击其余工具弹出「敬请期待」提示。
// 依赖：@nuxt/ui（提供 UContainer / UCard / UButton / UInput / UBadge / UTextarea / useToast）

const siteTagline = '为开发者打造的一站式小工具集合'

const toast = useToast()
const search = ref('')

interface Tool {
  name: string
  desc: string
  icon: string
  tag: string
  accent: string
  ready: boolean
}

const tools: Tool[] = [
  { name: '图片压缩', desc: 'WebP转换器', icon: 'image', tag: '设计', accent: '#38bdf8', ready: true },
  { name: 'Markdown 编辑器', desc: '实时预览的在线 Markdown 编辑工具', icon: 'md', tag: '文档', accent: '#22d3ee', ready: true },
  { name: 'JSON 格式化', desc: '高亮、压缩与校验你的 JSON 数据', icon: 'braces', tag: '开发', accent: '#a78bfa', ready: false },
  { name: '时间戳转换', desc: 'Unix 秒/毫秒与日期互转', icon: 'clock', tag: '开发', accent: '#34d399', ready: false },
  { name: '二维码生成', desc: '文本 / 链接一键生成二维码', icon: 'qr', tag: '实用', accent: '#f472b6', ready: false },
  { name: '密码生成器', desc: '可定制强度的随机安全密码', icon: 'key', tag: '安全', accent: '#60a5fa', ready: false },
  { name: 'Base64 编解码', desc: '文本与 Base64 双向转换', icon: 'code', tag: '开发', accent: '#fbbf24', ready: false },
  { name: '正则测试器', desc: '实时匹配高亮与分组提取', icon: 'regex', tag: '开发', accent: '#2dd4bf', ready: false },
  { name: '颜色拾取器', desc: 'HEX / RGB / HSL 互转与预览', icon: 'palette', tag: '设计', accent: '#f87171', ready: false },
  { name: '文本对比', desc: '逐行 diff 差异高亮', icon: 'diff', tag: '实用', accent: '#c084fc', ready: false },
  { name: '单位换算', desc: '长度 / 重量 / 温度等常用换算', icon: 'scale', tag: '实用', accent: '#4ade80', ready: false },
  { name: 'URL 编解码', desc: 'Encode / Decode 中文与特殊字符', icon: 'link', tag: '开发', accent: '#fb7185', ready: false },
]

const filteredTools = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return tools
  return tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.desc.toLowerCase().includes(q) ||
    t.tag.toLowerCase().includes(q)
  )
})

function openTool(tool: Tool) {
  if (tool.ready) {
    if (tool.name === 'Markdown 编辑器') {
      navigateTo('/markdown-editor')
    } else if (tool.name === '图片压缩') {
      navigateTo('/webp-transfer')
    }
  } else {
    toast.add({
      title: '敬请期待',
      description: `「${tool.name}」正在开发中`,
      color: 'info',
    })
  }
}

// 内联 SVG 图标路径（与首页工具一一对应）
function iconPath(name: string): string {
  const map: Record<string, string> = {
    md: 'M4 4h16v16H4zM7 12h2M7 8h2M7 16h2M13 8v8M13 8l3 4 3-4',
    braces: 'M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2',
    clock: 'M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
    qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v3M20 20h-3v-3M17 17h.01',
    key: 'M14 7a4 4 0 1 1-3.5 6L4 19v-3l2-2 2 2 2-2-2-2 3-3.5A4 4 0 0 1 14 7z',
    code: 'M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14',
    regex: 'M4 4v16M4 4h4a3 3 0 0 1 0 6H4M9 20l3-16M15 4v16M15 4h4a3 3 0 0 1 0 6h-4',
    palette: 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-.5-.5-1 0-1.5.5-.5 1.5-.3 1.5-1.5A4.5 4.5 0 0 0 12 3zM7.5 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    diff: 'M12 3v18M8 7l-4 4 4 4M16 7l4 4-4 4',
    scale: 'M12 3v18M5 7h14M7 7l-3 6a3 3 0 0 0 6 0zM17 7l-3 6a3 3 0 0 0 6 0z',
    image: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 16l5-5 4 4 3-3 6 6',
    link: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
  }
  return map[name] ?? 'M12 2v20M2 12h20'
}
</script>

<template>
  <div class="page">
    <!-- 背景层（装饰性，使用自定义 CSS 实现科技辉光） -->
    <div class="bg-grid" />
    <div class="bg-orb orb-a" />
    <div class="bg-orb orb-b" />
    <div class="bg-orb orb-c" />
    <div class="bg-noise" />

    <!-- 顶部导航 -->
    <AppHeader />

    <!-- ============ 首页视图 ============ -->
    <UContainer class="relative z-10 pt-14">
      <!-- Hero -->
      <section class="text-center py-20 sm:py-24">
        <UBadge color="primary" variant="subtle" class="mb-6">
          <span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 inline-block" />
          全新科技工具集 · 本地优先 · 零上传
        </UBadge>
        <h1 class="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
          把繁琐留给工具<br />
          <span class="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent">
            把效率还给你
          </span>
        </h1>
        <p class="mt-4 text-gray-400 text-base max-w-md mx-auto">{{ siteTagline }}</p>

        <!-- 搜索 -->
        <div class="mt-9 max-w-xl mx-auto">
          <UInput
            v-model="search"
            size="lg"
            placeholder="搜索工具，例如 Markdown、JSON、二维码…"
            class="w-full bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
          >
            <template #leading>
              <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
            </template>
          </UInput>
        </div>

        <!-- 统计 -->
        <div class="mt-10 flex justify-center gap-12">
          <div v-for="s in [{ label: '在线工具', value: '12+' }, { label: '累计使用', value: '240K' }, { label: '平均响应', value: '<1ms' }]" :key="s.label">
            <div class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{{ s.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ s.label }}</div>
          </div>
        </div>
      </section>

      <!-- 工具网格 -->
      <section class="pb-24">
        <div class="flex items-baseline justify-between mb-5">
          <h2 class="text-xl font-bold">探索工具</h2>
          <span class="text-sm text-gray-500">{{ filteredTools.length }} 个工具</span>
        </div>

        <div v-if="filteredTools.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="t in filteredTools"
            :key="t.name"
            class="cursor-pointer group transition-all duration-300 hover:-translate-y-1.5 bg-slate-800/60 border border-slate-700/50 text-slate-100 rounded-xl p-4"
            :style="{ '--accent': t.accent }"
            @click="openTool(t)"
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-3">
              <span
                class="inline-grid place-items-center w-11 h-11 rounded-xl"
                :style="{ color: t.accent, background: 'color-mix(in srgb, ' + t.accent + ' 14%, transparent)', border: '1px solid color-mix(in srgb, ' + t.accent + ' 30%, transparent)' }"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="iconPath(t.icon)" />
                </svg>
              </span>
              <div class="flex items-center gap-2">
                <UBadge v-if="!t.ready" color="neutral" variant="subtle" size="xs">敬请期待</UBadge>
                <UBadge color="primary" variant="outline" size="xs">{{ t.tag }}</UBadge>
              </div>
            </div>

            <!-- Content -->
            <div class="mb-3">
              <h3 class="font-semibold text-base font-black">{{ t.name }}</h3>
              <p class="text-sm text-gray-400 mt-1.5 leading-relaxed">{{ t.desc }}</p>
            </div>

            <!-- Footer -->
            <span
              class="text-sm font-semibold opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
              :style="{ color: t.accent }"
            >{{ t.ready ? '进入 →' : '敬请期待' }}</span>
          </div>
        </div>

        <p v-else class="text-center text-gray-500 py-12">没有匹配「{{ search }}」的工具，换个关键词试试 ✦</p>
      </section>

      <!-- 页脚 -->
      <footer class="border-t border-white/10 py-6 flex flex-col sm:flex-row justify-between gap-2 text-sm text-gray-500">
        <span>© 2026 ModHub · 用 Nuxt 4 构建</span>
        <span>一切计算都在你的浏览器本地完成</span>
      </footer>
    </UContainer>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.page {
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  color: #e2e8f0;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
  isolation: isolate;
}

/* 背景 */
.bg-grid {
  position: fixed;
  inset: -2px;
  background-image:
    linear-gradient(rgba(120, 160, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 160, 255, 0.06) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 35%, transparent 78%);
  z-index: -3;
  animation: drift 24s linear infinite;
}
@keyframes drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 46px 46px, 46px 46px; }
}
.bg-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.5;
  z-index: -2;
  animation: float 18s ease-in-out infinite;
}
.orb-a { width: 520px; height: 520px; top: -160px; left: -120px; background: #6366f1; }
.orb-b { width: 460px; height: 460px; top: 10%; right: -140px; background: #8b5cf6; animation-delay: -6s; }
.orb-c { width: 380px; height: 380px; bottom: -160px; left: 35%; background: #a855f7; animation-delay: -12s; }
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(0, 40px); }
}
.bg-noise {
  position: fixed;
  inset: 0;
  z-index: -1;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>
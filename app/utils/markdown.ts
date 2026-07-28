import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: true })

/**
 * 解析 Markdown 并做 XSS 过滤。
 * DOMPurify 依赖浏览器 DOM，因此只在客户端调用（动态 import）。
 */
export async function renderMarkdown(src: string): Promise<string> {
  const { default: DOMPurify } = await import('dompurify')
  return DOMPurify.sanitize(marked.parse(src) as string)
}
import { parse } from 'yaml'

const modules = import.meta.glob('/src/content/chapters/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, content: raw }
  const meta = parse(match[1])
  return { meta, content: match[2].trim() }
}

export const chapters = Object.values(modules)
  .map((raw) => {
    const { meta, content } = parseFrontmatter(raw)
    return { ...meta, content }
  })
  .sort((a, b) => a.order - b.order)

export function getChapterBySlug(slug) {
  return chapters.find((ch) => ch.slug === slug)
}

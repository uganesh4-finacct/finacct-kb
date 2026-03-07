/**
 * Server-safe helpers for TipTap content (headings extraction).
 * Keep this file free of 'use client' so it can be used in Server Components.
 */

export interface TipTapNode {
  type: string
  content?: TipTapNode[]
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  attrs?: Record<string, unknown>
}

function getText(node: TipTapNode): string {
  if (node.text) return node.text
  if (node.content) return node.content.map(getText).join('')
  return ''
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50)
}

export function getHeadingsFromContent(
  content: TipTapNode | null | undefined
): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  function walk(n: TipTapNode) {
    if (n.type === 'heading') {
      const level = (n.attrs?.level as number) ?? 1
      headings.push({ id: slugify(getText(n)), text: getText(n), level })
    }
    n.content?.forEach(walk)
  }
  if (content) walk(content)
  return headings
}

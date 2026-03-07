/**
 * Helpers for TipTap block-level inline editing.
 * Works with existing doc content array (no separate blocks table).
 */

export interface TipTapNode {
  type: string
  content?: TipTapNode[]
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  attrs?: Record<string, unknown>
}

export function getBlockText(node: TipTapNode): string {
  if (node.text) return node.text
  if (node.content) return node.content.map(getBlockText).join('')
  return ''
}

const EDITABLE_BLOCK_TYPES = new Set([
  'paragraph',
  'heading',
  'codeBlock',
  'blockquote',
])

export function isBlockEditable(node: TipTapNode): boolean {
  return EDITABLE_BLOCK_TYPES.has(node.type)
}

/**
 * Build a new node with updated text content (paragraph, heading, codeBlock, blockquote).
 * Preserves type and attrs (e.g. heading level).
 */
export function buildUpdatedBlock(node: TipTapNode, newText: string): TipTapNode {
  const trimmed = newText.trimEnd()
  const textNode: TipTapNode = { type: 'text', text: trimmed || '' }

  switch (node.type) {
    case 'paragraph':
      return { type: 'paragraph', content: trimmed ? [textNode] : [] }
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1
      return { type: 'heading', attrs: { level }, content: trimmed ? [textNode] : [] }
    }
    case 'codeBlock': {
      const lang = node.attrs?.language ?? null
      return {
        type: 'codeBlock',
        attrs: lang ? { language: lang } : undefined,
        content: trimmed ? [{ type: 'text', text: trimmed }] : [],
      }
    }
    case 'blockquote':
      return { type: 'blockquote', content: [{ type: 'paragraph', content: trimmed ? [textNode] : [] }] }
    default:
      return node
  }
}

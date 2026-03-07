'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { EditableBlock } from './EditableBlock'
import { updateArticle } from '@/lib/api/articles'
import type { TipTapNode } from '@/lib/tiptap-blocks'

interface ArticleBlockEditorProps {
  articleId: string
  initialContent: TipTapNode
  isAdmin: boolean
}

export function ArticleBlockEditor({
  articleId,
  initialContent,
  isAdmin,
}: ArticleBlockEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState<TipTapNode>(() => {
    if (initialContent?.type === 'doc' && Array.isArray(initialContent.content)) {
      return initialContent
    }
    return { type: 'doc', content: [] }
  })

  const blocks = content.content ?? []

  const handleBlockSave = useCallback(
    async (blockIndex: number, updatedNode: TipTapNode) => {
      const newContent: TipTapNode = {
        ...content,
        content: blocks.map((node, i) => (i === blockIndex ? updatedNode : node)),
      }
      setContent(newContent)
      const res = await updateArticle(articleId, newContent as object)
      if (!res.ok) throw new Error(res.error)
      router.refresh()
    },
    [articleId, content, blocks, router]
  )

  if (!content || content.type !== 'doc') {
    return <p className="text-slate-500">No content yet.</p>
  }

  return (
    <div className="space-y-0">
      {blocks.map((node, index) => (
        <EditableBlock
          key={`block-${index}`}
          node={node}
          blockIndex={index}
          isAdmin={isAdmin}
          onSave={handleBlockSave}
        />
      ))}
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { trackArticleRead } from '@/lib/actions'

export function TrackRead({ articleId }: { articleId: string }) {
  useEffect(() => {
    trackArticleRead(articleId)
  }, [articleId])
  return null
}

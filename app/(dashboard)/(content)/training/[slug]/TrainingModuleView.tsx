'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { TipTapContent } from '@/components/TipTapContent'
import { ModuleOverview } from '@/components/training/ModuleOverview'
import { ModuleHeader } from '@/components/training/ModuleHeader'
import { JourneyProgress } from '@/components/training/JourneyProgress'
import { SectionProgress } from '@/components/training/SectionProgress'
import { SectionNav } from '@/components/training/SectionNav'
import { Checkpoint } from '@/components/training/Checkpoint'
import { recordModuleProgress, clearQuizLock } from '@/lib/training-actions'
import type { TipTapNode } from '@/components/TipTapContent'
import type { JourneyModule } from '@/components/training/JourneyProgress'
import type { SectionItem } from '@/components/training/SectionProgress'

const SCROLL_OFFSET = 80
const COMPLETED_STORAGE_KEY = 'finacct-module-sections-completed'

/** Get plain text from a TipTap node. */
function getNodeText(node: TipTapNode): string {
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map((c: TipTapNode) => getNodeText(c)).join('').replace(/\s+/g, ' ').trim()
}

/** Extract heading texts (level 2) from doc for "What you'll learn". */
function getLearningPoints(content: TipTapNode | null): string[] {
  const points: string[] = []
  function walk(n: TipTapNode) {
    if (n.type === 'heading' && (n.attrs?.level as number) === 2) {
      const t = getNodeText(n)
      if (t) points.push(t)
    }
    n.content?.forEach(walk)
  }
  if (content?.type === 'doc') walk(content)
  return points
}

/** Strip duplicate h1 and optional leading description paragraph. */
function contentWithoutDuplicateTitle(content: TipTapNode | null, description?: string): TipTapNode | null {
  if (!content || content.type !== 'doc' || !content.content?.length) return content
  let sliceFrom = 0
  const first = content.content[0]
  if (first?.type === 'heading' && (first.attrs?.level as number) === 1) sliceFrom = 1
  if (sliceFrom >= content.content.length) return { ...content, content: content.content.slice(sliceFrom) }
  const second = content.content[sliceFrom]
  const descNorm = description?.replace(/\s+/g, ' ').trim()
  if (descNorm && second?.type === 'paragraph' && getNodeText(second) === descNorm) sliceFrom += 1
  if (sliceFrom === 0) return content
  return { ...content, content: content.content.slice(sliceFrom) }
}

interface TrainingModuleViewProps {
  moduleNumber: number
  totalModules: number
  moduleId: string
  title: string
  description: string
  estimatedMinutes: number
  questionCount: number
  passScore?: number
  content: TipTapNode | null
  moduleSlug: string
  previousModule?: { slug: string; title: string }
  nextModule?: { slug: string; title: string }
  journeyModules: JourneyModule[]
  fullReview?: boolean
}

export function TrainingModuleView(props: TrainingModuleViewProps) {
  const {
    moduleNumber,
    totalModules,
    moduleId,
    title,
    description,
    estimatedMinutes,
    questionCount,
    passScore = 80,
    content,
    moduleSlug,
    previousModule,
    nextModule,
    journeyModules,
  } = props
  const fullReview = props.fullReview ?? false
  const contentRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<number>(Date.now())
  const [sectionIds, setSectionIds] = useState<string[]>([])
  const [sectionItems, setSectionItems] = useState<SectionItem[]>([])
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)
  const [readSectionIds, setReadSectionIds] = useState<Set<string>>(new Set())

  const displayContent = useMemo(() => contentWithoutDuplicateTitle(content, description), [content, description])
  const learningPoints = useMemo(() => getLearningPoints(displayContent), [displayContent])
  const totalSections = sectionIds.length
  const allSectionsRead = totalSections > 0 && readSectionIds.size >= totalSections

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMPLETED_STORAGE_KEY)
      const stored = raw ? (JSON.parse(raw) as Record<string, string[]>) : {}
      const ids = stored[moduleId] ?? []
      setReadSectionIds(new Set(ids))
    } catch {
      setReadSectionIds(new Set())
    }
  }, [moduleId])

  useEffect(() => {
    if (!contentRef.current) return
    const elements = contentRef.current.querySelectorAll('h2, h3')
    const ids: string[] = []
    const items: SectionItem[] = []
    elements.forEach((el, i) => {
      const id = `heading-${i}`
      ;(el as HTMLElement).id = id
      ;(el as HTMLElement).setAttribute('data-section-id', id)
      ids.push(id)
      items.push({
        id,
        title: el.textContent?.trim() || '',
        level: el.tagName === 'H2' ? 2 : 3,
      })
    })
    setSectionIds(ids)
    setSectionItems(items)
  }, [displayContent])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id')
            if (sectionId) {
              setReadSectionIds((prev) => {
                if (prev.has(sectionId)) return prev
                const next = new Set(prev)
                next.add(sectionId)
                try {
                  const raw = localStorage.getItem(COMPLETED_STORAGE_KEY)
                  const stored = raw ? (JSON.parse(raw) as Record<string, string[]>) : {}
                  stored[moduleId] = Array.from(next)
                  localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(stored))
                } catch {}
                return next
              })
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    const els = contentRef.current?.querySelectorAll('[data-section-id]')
    els?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [moduleId, sectionIds])

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[]
      let current: string | null = null
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i]
        const rect = el.getBoundingClientRect()
        if (rect.top <= SCROLL_OFFSET + 80) {
          current = el.id
          break
        }
      }
      setCurrentSectionId(current)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sectionIds])

  useEffect(() => {
    const start = startRef.current
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      if (elapsed > 0 && Math.floor(elapsed / 1000) % 30 === 0 && Math.floor(elapsed / 1000) > 0) {
        recordModuleProgress(moduleId, 30)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [moduleId])

  useEffect(() => {
    return () => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000)
      if (elapsed > 0) recordModuleProgress(moduleId, elapsed)
    }
  }, [moduleId])

  const currentIndex = currentSectionId ? sectionIds.indexOf(currentSectionId) : -1
  const previousSectionId = currentIndex > 0 ? sectionIds[currentIndex - 1] ?? null : null
  const nextSectionId = currentIndex >= 0 && currentIndex < sectionIds.length - 1 ? sectionIds[currentIndex + 1] ?? null : null
  const isLastSection = currentIndex >= 0 && currentIndex === sectionIds.length - 1

  const handleMarkCompleteAndNext = () => {
    if (currentSectionId) {
      setReadSectionIds((prev) => {
        const next = new Set(prev)
        next.add(currentSectionId)
        try {
          const raw = localStorage.getItem(COMPLETED_STORAGE_KEY)
          const stored = raw ? (JSON.parse(raw) as Record<string, string[]>) : {}
          stored[moduleId] = Array.from(next)
          localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(stored))
        } catch {}
        return next
      })
    }
    if (nextSectionId) handleJumpToSection(nextSectionId)
  }

  const handleJumpToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      const currentIndex = currentSectionId ? sectionIds.indexOf(currentSectionId) : -1
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault()
        handleJumpToSection(sectionIds[currentIndex - 1])
      }
      if (e.key === 'ArrowRight' && currentIndex >= 0 && currentIndex < sectionIds.length - 1) {
        e.preventDefault()
        handleJumpToSection(sectionIds[currentIndex + 1])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSectionId, sectionIds])

  const sectionsRead = sectionItems.filter((s) => readSectionIds.has(s.id)).length

  return (
    <div className="min-h-screen page-content bg-slate-950">
      <div className="w-full max-w-[1600px] mx-auto px-6 py-6 lg:px-10 lg:py-8 flex gap-10 lg:gap-12 overflow-x-hidden">
        <main className="flex-1 min-w-0 max-w-none">
          <ModuleHeader
            moduleNumber={moduleNumber}
            totalModules={totalModules}
            title={title}
          />

          <ModuleOverview
            title={title}
            whatYoullLearn={learningPoints}
            whyItMatters={description}
            estimatedMinutes={estimatedMinutes}
            questionCount={questionCount}
            passScore={passScore}
            passRateNote="You can retake the quiz if needed."
          />

          <div className="mt-8" ref={contentRef}>
            <div className="prose prose-invert prose-slate max-w-none break-words training-module-content">
              {displayContent && displayContent.type === 'doc' ? (
                <TipTapContent content={displayContent} />
              ) : (
                <p className="text-slate-500">No content yet.</p>
              )}
            </div>
          </div>

          <Checkpoint
            allSectionsRead={allSectionsRead}
            sectionsRead={sectionsRead}
            totalSections={totalSections}
            checkpointItems={learningPoints}
            moduleId={moduleId}
            moduleSlug={moduleSlug}
            questionCount={questionCount}
            passScore={passScore}
            fullReview={fullReview}
            onFullReviewComplete={() => clearQuizLock(moduleId)}
          />

          <SectionNav
            previousSectionId={previousSectionId}
            nextSectionId={nextSectionId}
            onMarkCompleteAndNext={handleMarkCompleteAndNext}
            onScrollToSection={handleJumpToSection}
            isLastSection={isLastSection || sectionIds.length === 0}
            previousModule={previousModule}
          />
        </main>

        <aside className="sticky top-24 w-72 flex-shrink-0 hidden lg:flex flex-col gap-4 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
          <JourneyProgress
            modules={journeyModules}
            currentModuleId={moduleId}
          />
          <SectionProgress
            sections={sectionItems}
            readSectionIds={readSectionIds}
            onJump={handleJumpToSection}
          />
        </aside>
      </div>
    </div>
  )
}

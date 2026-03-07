import type { Section } from '@/lib/types'

/** Preferred slugs for KB sections (used when deduplicating by title). */
export const SECTION_DISPLAY_ORDER = [
  'chart-of-accounts',
  'standard-operating-procedures',
  'exception-handling',
  'sample-financials',
  'client-education',
  'pos-guides',
] as const

const preferredSlugs = new Set<string>(SECTION_DISPLAY_ORDER)

/**
 * Deduplicate sections by title (keep one per title, preferring the preferred slug).
 * Sort by SECTION_DISPLAY_ORDER so sidebar and home show sections in the same order.
 */
export function getDeduplicatedSections(sections: Section[]): Section[] {
  const filtered = sections
    .filter((s) => s.is_published && !s.is_training_section)
  const byTitle = new Map<string, Section>()
  for (const s of filtered) {
    const existing = byTitle.get(s.title)
    if (!existing) {
      byTitle.set(s.title, s)
    } else if (preferredSlugs.has(s.slug)) {
      byTitle.set(s.title, s)
    }
  }
  const list = Array.from(byTitle.values())
  const orderIndex = (slug: string) => {
    const i = SECTION_DISPLAY_ORDER.indexOf(slug as (typeof SECTION_DISPLAY_ORDER)[number])
    return i >= 0 ? i : 999
  }
  return list.sort((a, b) => orderIndex(a.slug) - orderIndex(b.slug))
}

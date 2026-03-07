'use client'

import React from 'react'
import {
  ScenarioBox,
  InsightBox,
  WarningBox,
  ExampleBox,
  ProTipBox,
  ComparisonTable,
  KPICard,
  AccountTree,
  ProcessFlow,
  StepFlow,
} from '@/components/content/ContentBlocks'
import { Receipt, Timer, TrendingDown } from 'lucide-react'

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

function renderMarks(children: React.ReactNode, marks?: TipTapNode['marks']) {
  if (!marks?.length) return children
  let result: React.ReactNode = children
  for (const mark of marks) {
    if (mark.type === 'bold') result = <strong>{result}</strong>
    else if (mark.type === 'italic') result = <em>{result}</em>
    else if (mark.type === 'underline') result = <u>{result}</u>
    else if (mark.type === 'strike') result = <s>{result}</s>
    else if (mark.type === 'code') result = <code className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-sm font-mono">{result}</code>
    else if (mark.type === 'link' && mark.attrs?.href) result = <a href={String(mark.attrs.href)} className="text-indigo-400 hover:text-indigo-300 underline" target="_blank" rel="noopener noreferrer">{result}</a>
  }
  return result
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50)
}

function renderNode(node: TipTapNode, index: number): React.ReactNode {
  const key = `n-${index}`
  const attrs = node.attrs ?? {}
  const content = node.content ?? []

  switch (node.type) {
    case 'doc':
      return <div key={key} className="tip-tap-content">{content.map((c, i) => renderNode(c, i))}</div>

    case 'paragraph':
      return <p key={key} className="my-3 text-slate-300 text-base leading-relaxed">{content.map((c, i) => renderNode(c, i)) ?? <br />}</p>

    case 'text':
      return <React.Fragment key={key}>{renderMarks(node.text ?? '', node.marks)}</React.Fragment>

    case 'heading': {
      const level = (attrs.level as number) ?? 1
      const text = content.map((c, i) => renderNode(c, i))
      const className = 'font-semibold text-white leading-tight mt-6 mb-2 scroll-mt-20'
      if (level === 1) return <h1 key={key} id={slugify(getText(node))} className={`text-2xl ${className}`}>{text}</h1>
      if (level === 2) return <h2 key={key} id={slugify(getText(node))} className={`text-xl ${className}`}>{text}</h2>
      return <h3 key={key} id={slugify(getText(node))} className={`text-lg ${className}`}>{text}</h3>
    }

    case 'bulletList':
      return <ul key={key} className="list-disc pl-6 my-3 space-y-1 text-slate-300 text-base">{content.map((c, i) => renderNode(c, i))}</ul>

    case 'orderedList':
      return <ol key={key} className="list-decimal pl-6 my-3 space-y-1 text-slate-300 text-base">{content.map((c, i) => renderNode(c, i))}</ol>

    case 'listItem':
      return <li key={key} className="leading-relaxed">{content.map((c, i) => renderNode(c, i))}</li>

    case 'blockquote':
      return <blockquote key={key} className="border-l-4 border-indigo-500 pl-4 my-3 text-slate-400 italic">{content.map((c, i) => renderNode(c, i))}</blockquote>

    case 'codeBlock': {
      const code = getText(node)
      return <pre key={key} className="bg-slate-800 rounded-lg p-4 my-3 overflow-x-auto text-sm"><code>{code}</code></pre>
    }

    case 'hardBreak':
      return <br key={key} />

    case 'horizontalRule':
      return <hr key={key} className="border-slate-800/50 my-6" />

    case 'table':
      return <div key={key} className="overflow-x-auto my-4 rounded-lg border border-slate-800/50"><table className="w-full border-collapse">{content.map((c, i) => renderNode(c, i))}</table></div>

    case 'tableRow':
      return <tr key={key}>{content.map((c, i) => renderNode(c, i))}</tr>

    case 'tableHeader':
      return <th key={key} className="border border-slate-600 bg-slate-800 px-4 py-2 text-left text-white font-semibold text-sm">{content.map((c, i) => renderNode(c, i))}</th>

    case 'tableCell':
      return <td key={key} className="border border-slate-600 px-4 py-2 text-slate-300 text-sm">{content.map((c, i) => renderNode(c, i))}</td>

    case 'image':
      return <img key={key} src={String(attrs.src ?? '')} alt={String(attrs.alt ?? '')} className="rounded-lg max-w-full h-auto my-3" />

    case 'scenario':
      return (
        <ScenarioBox key={key} title={attrs.title as string | undefined}>
          {content.map((c, i) => renderNode(c, i))}
        </ScenarioBox>
      )

    case 'insight':
      return (
        <InsightBox key={key} title={attrs.title as string | undefined}>
          {content.map((c, i) => renderNode(c, i))}
        </InsightBox>
      )

    case 'warning':
      return (
        <WarningBox key={key} title={attrs.title as string | undefined}>
          {content.map((c, i) => renderNode(c, i))}
        </WarningBox>
      )

    case 'checkpoint':
      return (
        <div key={key} className="my-6">
          {content.map((c, i) => renderNode(c, i))}
        </div>
      )

    case 'example':
      return (
        <ExampleBox key={key} title={attrs.title as string | undefined}>
          {content.map((c, i) => renderNode(c, i))}
        </ExampleBox>
      )

    case 'protip':
      return (
        <ProTipBox key={key} title={attrs.title as string | undefined}>
          {content.map((c, i) => renderNode(c, i))}
        </ProTipBox>
      )

    case 'comparison_table': {
      const rows = (attrs.rows as { wrong: string; right: string }[]) ?? []
      return (
        <ComparisonTable
          key={key}
          leftHeader={(attrs.leftHeader as string) ?? 'Wrong'}
          rightHeader={(attrs.rightHeader as string) ?? 'Right'}
          rows={rows}
        />
      )
    }

    case 'kpi_card': {
      const status = (attrs.status as 'good' | 'warning' | 'bad' | 'neutral') ?? 'neutral'
      const iconName = (attrs.icon as string) ?? 'TrendingUp'
      const Icon = iconName === 'Receipt' ? Receipt : iconName === 'Timer' ? Timer : iconName === 'TrendingDown' ? TrendingDown : TrendingUp
      return (
        <KPICard
          key={key}
          label={String(attrs.label ?? '')}
          value={String(attrs.value ?? '')}
          subtext={attrs.subtext as string | undefined}
          targetRange={attrs.targetRange as string | undefined}
          status={status}
          icon={Icon}
        />
      )
    }

    case 'account_tree': {
      const items = (attrs.items as { id: string; label: string; children?: { id: string; label: string }[] }[]) ?? []
      return <AccountTree key={key} items={items} />
    }

    case 'process_flow': {
      const steps = (attrs.steps as string[]) ?? []
      return <ProcessFlow key={key} steps={steps} />
    }

    case 'scenarioBox':
      return (
        <ScenarioBox key={key}>
          {content.map((c, i) => renderNode(c, i))}
        </ScenarioBox>
      )

    case 'insightBox':
      return (
        <InsightBox key={key} title={attrs.title as string | undefined}>
          {content.map((c, i) => renderNode(c, i))}
        </InsightBox>
      )

    case 'warningBox':
      return (
        <WarningBox key={key} title={attrs.title as string | undefined}>
          {content.map((c, i) => renderNode(c, i))}
        </WarningBox>
      )

    case 'checkpointBox': {
      const items = attrs.items as string[] | undefined
      if (items?.length) {
        return (
          <ul key={key} className="list-disc pl-6 my-6 space-y-2 text-slate-300">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )
      }
      return <div key={key} className="my-6">{content.map((c, i) => renderNode(c, i))}</div>
    }

    case 'exampleBox':
      return (
        <ExampleBox key={key} title={attrs.title as string | undefined}>
          {content.map((c, i) => renderNode(c, i))}
        </ExampleBox>
      )

    case 'proTipBox':
      return (
        <ProTipBox key={key} title={attrs.title as string | undefined}>
          {content.map((c, i) => renderNode(c, i))}
        </ProTipBox>
      )

    case 'comparisonTable': {
      const wrongArr = attrs.wrong as string[] | undefined
      const rightArr = attrs.right as string[] | undefined
      const rowsArr = attrs.rows as { wrong: string; right: string }[] | undefined
      return (
        <ComparisonTable
          key={key}
          wrong={wrongArr}
          right={rightArr}
          rows={rowsArr}
        />
      )
    }

    case 'kpiCard': {
      const cards = attrs.cards as { value: string; label: string; sublabel?: string; status?: 'good' | 'warning' | 'bad' | 'neutral' }[] | undefined
      if (cards?.length) {
        const useCompact = cards.length >= 5
        return (
          <div
            key={key}
            className={`my-6 grid gap-2 sm:gap-3 ${
              useCompact
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                : 'grid-cols-1 md:grid-cols-3 gap-4'
            }`}
          >
            {cards.map((card, i) => (
              <KPICard
                key={`${key}-${i}`}
                value={card.value}
                label={card.label}
                sublabel={card.sublabel}
                status={card.status ?? 'neutral'}
                compact={useCompact}
              />
            ))}
          </div>
        )
      }
      return (
        <KPICard
          key={key}
          value={String(attrs.value ?? '')}
          label={String(attrs.label ?? '')}
          sublabel={(attrs.target as string) ?? (attrs.targetRange as string)}
          status={(attrs.status as 'good' | 'warning' | 'bad' | 'neutral') ?? 'neutral'}
        />
      )
    }

    case 'stepFlow': {
      const stepItems = (attrs.steps as { title: string; description?: string }[]) ?? []
      return <StepFlow key={key} steps={stepItems} />
    }

    default:
      return content.length ? <div key={key}>{content.map((c, i) => renderNode(c, i))}</div> : null
  }
}

export interface TipTapRendererProps {
  content: TipTapNode | null | undefined
  className?: string
}

export function TipTapRenderer({ content, className = '' }: TipTapRendererProps) {
  if (!content || content.type !== 'doc') return null
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {content.content?.map((node, i) => renderNode(node, i))}
    </div>
  )
}

export function getHeadingsFromContent(content: TipTapNode | null | undefined): { id: string; text: string; level: number }[] {
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

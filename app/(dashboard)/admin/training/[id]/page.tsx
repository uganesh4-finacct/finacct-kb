'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import {
  getTrainingModuleById,
  getQuizQuestions,
  saveTrainingModule,
  saveQuizQuestion,
  deleteQuizQuestion,
  reorderQuizQuestions,
} from '../actions'
import type { TrainingModule } from '@/lib/types'
import type { QuizQuestion } from '@/lib/types'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

function generateOptionId() {
  return 'opt_' + Math.random().toString(36).slice(2, 11)
}

export default function EditTrainingModulePage() {
  const params = useParams()
  const id = params.id as string
  const [module, setModule] = useState<TrainingModule | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState<object | null>(null)
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [isPublished, setIsPublished] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTrainingModuleById(id).then((r) => {
      if (r.data) {
        const m = r.data
        setModule(m)
        setTitle(m.title)
        setSlug(m.slug)
        setDescription(m.description || '')
        setContent((m.content as object) ?? null)
        setEstimatedMinutes(m.estimated_minutes)
        setIsPublished(m.is_published)
      }
    })
    getQuizQuestions(id).then((r) => r.data && setQuestions(r.data as QuizQuestion[]))
  }, [id])

  async function handleSaveModule() {
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug required.')
      return
    }
    setError(null)
    setSaving(true)
    const res = await saveTrainingModule({
      id,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      content: content ?? {},
      order_index: module?.order_index ?? 0,
      estimated_minutes: estimatedMinutes,
      is_published: isPublished,
    })
    setSaving(false)
    if (res.ok) {
      getTrainingModuleById(id).then((r) => r.data && setModule(r.data))
    } else {
      setError(res.error ?? 'Save failed')
    }
  }

  async function handleSaveQuestion(formData: FormData) {
    const question = formData.get('question') as string
    const explanation = (formData.get('explanation') as string) || null
    const options = OPTION_LETTERS.map((_, i) => ({
      id: formData.get(`opt_id_${i}`) as string || generateOptionId(),
      text: (formData.get(`opt_${i}`) as string) || '',
    })).filter((o) => o.text.trim())
    const correctOptionId = formData.get('correct') as string
    if (!question?.trim() || options.length < 2 || !correctOptionId) {
      setError('Question text and at least 2 options with a correct answer are required.')
      return
    }
    const qId = formData.get('question_id') as string | null
    const res = await saveQuizQuestion({
      id: qId || undefined,
      module_id: id,
      question: question.trim(),
      options,
      correct_option_id: correctOptionId,
      explanation: explanation?.trim() || null,
      order_index: qId ? questions.find((q) => q.id === qId)?.order_index ?? 0 : questions.length,
    })
    if (res.ok) {
      getQuizQuestions(id).then((r) => r.data && setQuestions(r.data as QuizQuestion[]))
      setShowAddQuestion(false)
      setEditingQuestionId(null)
    } else {
      setError(res.error ?? 'Save failed')
    }
  }

  async function handleDeleteQuestion(qId: string) {
    if (!confirm('Delete this question?')) return
    const res = await deleteQuizQuestion(qId)
    if (res.ok) getQuizQuestions(id).then((r) => r.data && setQuestions(r.data as QuizQuestion[]))
  }

  async function handleMoveQuestion(qId: string, direction: 'up' | 'down') {
    const idx = questions.findIndex((q) => q.id === qId)
    if (idx < 0) return
    const newOrder = [...questions.map((q) => q.id)]
    if (direction === 'up' && idx > 0) {
      ;[newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]]
    } else if (direction === 'down' && idx < newOrder.length - 1) {
      ;[newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]]
    } else return
    const res = await reorderQuizQuestions(id, newOrder)
    if (res.ok) getQuizQuestions(id).then((r) => r.data && setQuestions(r.data as QuizQuestion[]))
  }

  if (!module) {
    return <div className="text-slate-400">Loading…</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/training" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Training
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6">Edit Module: {module.title}</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Estimated time (minutes)</label>
          <input
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 30)}
            className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pub"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-slate-600 bg-slate-700"
          />
          <label htmlFor="pub" className="text-sm text-slate-300">Published</label>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
        <RichTextEditor content={content} onChange={setContent} minHeight="280px" />
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        type="button"
        onClick={() => handleSaveModule()}
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 mb-8"
      >
        Save Module
      </button>

      <div className="rounded-xl border-slate-800/50 bg-slate-800/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Quiz Questions</h2>
          <button
            type="button"
            onClick={() => { setShowAddQuestion(true); setEditingQuestionId(null); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add question
          </button>
        </div>

        <ul className="space-y-3">
          {questions.map((q, idx) => (
            <li key={q.id} className="flex items-start gap-2 p-3 rounded-lg bg-slate-700/30 border border-slate-800/50">
              <div className="flex flex-col gap-0.5 pt-1">
                <button type="button" onClick={() => handleMoveQuestion(q.id, 'up')} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30">
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button type="button" onClick={() => handleMoveQuestion(q.id, 'down')} disabled={idx === questions.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30">
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{q.question}</p>
                <ul className="mt-1 text-sm text-slate-400">
                  {q.options.map((o) => (
                    <li key={o.id}>
                      {o.id === q.correct_option_id ? <span className="text-green-400">✓ {o.text}</span> : o.text}
                    </li>
                  ))}
                </ul>
                {q.explanation && <p className="text-slate-500 text-xs mt-1">Explanation: {q.explanation}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditingQuestionId(q.id)} className="text-indigo-400 hover:text-indigo-300 text-sm">Edit</button>
                <button type="button" onClick={() => handleDeleteQuestion(q.id)} className="text-slate-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {(showAddQuestion || editingQuestionId) && (
          <QuestionForm
            question={editingQuestionId ? questions.find((q) => q.id === editingQuestionId) : null}
            onSave={handleSaveQuestion}
            onCancel={() => { setShowAddQuestion(false); setEditingQuestionId(null); setError(null); }}
          />
        )}
      </div>
    </div>
  )
}

function QuestionForm({
  question,
  onSave,
  onCancel,
}: {
  question: QuizQuestion | undefined
  onSave: (formData: FormData) => void
  onCancel: () => void
}) {
  const defaultOptions = question?.options ?? OPTION_LETTERS.map(() => ({ id: generateOptionId(), text: '' }))
  const optionIds = [...defaultOptions.map((o) => o.id)]
  while (optionIds.length < 4) optionIds.push(generateOptionId())

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(new FormData(e.currentTarget))
      }}
      className="mt-6 p-4 rounded-lg border border-slate-600 bg-slate-800 space-y-4"
    >
      <input type="hidden" name="question_id" value={question?.id ?? ''} />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Question</label>
        <input
          name="question"
          defaultValue={question?.question}
          required
          className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
          placeholder="Question text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Options (A–D)</label>
        {OPTION_LETTERS.map((_, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input type="hidden" name={`opt_id_${i}`} value={optionIds[i]} />
            <span className="w-6 text-slate-400">{OPTION_LETTERS[i]}.</span>
            <input
              name={`opt_${i}`}
              defaultValue={defaultOptions[i]?.text}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm"
              placeholder={`Option ${OPTION_LETTERS[i]}`}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Correct answer</label>
        <select
          name="correct"
          defaultValue={question?.correct_option_id ?? optionIds[0]}
          className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
        >
          {OPTION_LETTERS.map((_, i) => (
            <option key={i} value={optionIds[i]}>{OPTION_LETTERS[i]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Explanation (shown after quiz)</label>
        <textarea
          name="explanation"
          defaultValue={question?.explanation ?? ''}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
          Save question
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}

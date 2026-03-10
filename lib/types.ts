// User & Profile Types
export type UserRole = 'admin' | 'editor' | 'accountant' | 'trainee'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  training_completed: boolean
  training_completed_at: string | null
  certificate_issued: boolean
  created_at: string
  updated_at: string
  /** Optional: from profiles table if columns exist */
  is_active?: boolean
  invited_at?: string | null
  last_active_at?: string | null
  avatar_url?: string | null
}

// Section Types
export interface Section {
  id: string
  title: string
  slug: string
  description: string | null
  icon: string
  color: string
  gradient: string
  order_index: number
  is_published: boolean
  is_training_section: boolean
  requires_training: boolean
  created_at: string
  updated_at: string
  article_count?: number
}

// Article Types
export interface Article {
  id: string
  section_id: string
  title: string
  slug: string
  content: any // TipTap JSON
  excerpt: string | null
  is_published: boolean
  is_protected: boolean
  order_index: number
  version: number
  author: string
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  section?: Section
}

// Training Types
export interface TrainingModule {
  id: string
  title: string
  slug: string
  description: string | null
  content: any // TipTap JSON
  order_index: number
  estimated_minutes: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: string
  module_id: string
  question: string
  options: QuizOption[]
  correct_option_id: string
  explanation: string | null
  order_index: number
}

export interface QuizOption {
  id: string
  text: string
}

export interface TrainingProgress {
  id: string
  user_id: string
  module_id: string
  started_at: string
  completed_at: string | null
  time_spent_seconds: number
  is_completed: boolean
}

export interface QuizAttempt {
  id: string
  user_id: string
  module_id: string
  score: number
  passed: boolean
  answers: Record<string, string>
  attempted_at: string
  attempt_number: number
}

export interface Certificate {
  id: string
  user_id: string
  certificate_number: string
  issued_at: string
  average_score: number
  total_time_spent_seconds: number
}

// COA Tree Types
export interface COAAccount {
  id: string
  name: string
  range?: string
  kpi?: string
  children?: COAAccount[]
}

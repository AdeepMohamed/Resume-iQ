export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  openai_api_key: string | null
  analyses_count: number
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  user_id: string
  file_name: string
  file_type: string
  raw_text: string
  created_at: string
}

export interface Suggestion {
  section: string
  original: string
  improved: string
  reason: string
}

export interface Analysis {
  id: string
  user_id: string
  resume_id: string | null
  job_description: string | null
  ats_score: number
  overall_grade: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  missing_skills: string[]
  keywords_found: string[]
  keywords_missing: string[]
  suggestions: Suggestion[]
  raw_response: Json
  created_at: string
}

export interface CoverLetter {
  id: string
  user_id: string
  analysis_id: string | null
  job_description: string | null
  tone: string
  content: string
  created_at: string
}

export interface InterviewQuestion {
  question: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tips: string
}

export interface InterviewSession {
  id: string
  user_id: string
  analysis_id: string | null
  job_description: string | null
  questions: InterviewQuestion[]
  created_at: string
}

export interface AnalysisResult {
  atsScore: number
  overallGrade: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  missingSkills: string[]
  keywordsFound: string[]
  keywordsMissing: string[]
  suggestions: Suggestion[]
}

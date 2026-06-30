'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { MessageSquare, Upload, Briefcase, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { InterviewQuestion } from '@/lib/types'
import { cn } from '@/lib/utils'

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const CATEGORY_COLORS: Record<string, string> = {
  Behavioral: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Technical: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Situational: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Culture Fit': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Role-Specific': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
}

export default function InterviewPrepPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [count, setCount] = useState(10)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(questions.map(q => q.category)))]

  const handleGenerate = async () => {
    if (!resumeText.trim()) { toast.error('Please paste your resume text'); return }
    setLoading(true)
    setQuestions([])
    setExpanded(null)
    try {
      const res = await fetch('/api/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription: jobDesc || undefined, count }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setQuestions(data.questions || [])
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'All' ? questions : questions.filter(q => q.category === filter)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Interview Preparation</h1>
        <p className="text-white/50 mt-1">Generate tailored interview questions with expert tips</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Config panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Upload size={16} className="text-indigo-400" />
              <span className="font-medium text-sm">Your Resume</span>
            </div>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="input-field h-40 resize-none text-sm"
            />
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={16} className="text-indigo-400" />
              <span className="font-medium text-sm">Job Description</span>
              <span className="text-xs text-white/30">(optional)</span>
            </div>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste job description for role-specific questions..."
              className="input-field h-32 resize-none text-sm"
            />
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm">Number of Questions</span>
              <span className="text-indigo-400 font-bold">{count}</span>
            </div>
            <input
              type="range" min={5} max={20} value={count}
              onChange={e => setCount(+e.target.value)}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>5</span><span>20</span>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !resumeText.trim()}
            className="btn-primary w-full justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><MessageSquare size={16} /> Generate Questions</>}
          </button>
        </div>

        {/* Questions panel */}
        <div className="lg:col-span-3">
          {questions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all',
                    filter === cat ? 'text-white bg-indigo-500/30 border border-indigo-500/40' : 'text-white/40 bg-white/5 hover:bg-white/8'
                  )}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card p-16 flex flex-col items-center gap-4 text-center">
                <Loader2 size={36} className="animate-spin text-indigo-400" />
                <p className="text-white/50 text-sm">Generating personalized questions…</p>
              </motion.div>
            ) : filtered.length > 0 ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {filtered.map((q, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <button
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      className="w-full text-left px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn('text-xs px-2 py-0.5 rounded-full border', CATEGORY_COLORS[q.category] || CATEGORY_COLORS['Role-Specific'])}>
                              {q.category}
                            </span>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full border', DIFFICULTY_COLORS[q.difficulty])}>
                              {q.difficulty}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white/90">{q.question}</p>
                        </div>
                        {expanded === i ? <ChevronUp size={16} className="text-white/30 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0 mt-1" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {expanded === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          className="overflow-hidden">
                          <div className="px-4 pb-4">
                            <div className="p-3 rounded-lg text-sm text-white/60 leading-relaxed"
                              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                              <span className="text-indigo-400 font-medium block mb-1">💡 Interview Tip</span>
                              {q.tips}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card p-16 text-center">
                <MessageSquare size={48} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm">Generated questions will appear here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

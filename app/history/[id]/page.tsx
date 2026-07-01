'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft, FileText, TrendingUp, AlertTriangle, Tag, Lightbulb,
  CheckCircle, ChevronDown, ChevronUp, Trash2
} from 'lucide-react'
import { formatDate, getScoreColor, getScoreBg } from '@/lib/utils'
import type { Analysis, Suggestion } from '@/lib/types'
import { AnimatePresence } from 'framer-motion'

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<Analysis & { resumes?: { file_name: string; file_type: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/analyses/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setAnalysis(data)
    } catch {
      toast.error('Analysis not found')
      router.push('/history')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    if (!confirm('Delete this analysis?')) return
    const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); router.push('/history') }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
    </div>
  )

  if (!analysis) return null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/history" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <ArrowLeft size={16} />
          Back to History
        </Link>
        <button onClick={handleDelete} className="btn-secondary text-sm px-3 py-2 text-red-400 border-red-500/20">
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={16} className="text-indigo-400" />
          <span className="font-medium">{analysis.resumes?.file_name || 'Resume'}</span>
        </div>
        <div className="text-sm text-white/40">{formatDate(analysis.created_at)}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5 sm:col-span-2 md:col-span-1">
          <div className="text-xs text-white/40 mb-3">ATS Score</div>
          <div className={`text-5xl font-bold ${getScoreColor(analysis.ats_score)}`}>{analysis.ats_score}</div>
          <div className="mt-3 h-1.5 rounded-full bg-white/10">
            <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.ats_score}%` }}
              transition={{ duration: 1 }} className={`h-1.5 rounded-full ${getScoreBg(analysis.ats_score)}`} />
          </div>
        </div>
        <div className="glass-card p-5"><div className="text-xs text-white/40 mb-3">Grade</div><div className="text-4xl font-bold gradient-text">{analysis.overall_grade}</div></div>
        <div className="glass-card p-5"><div className="text-xs text-white/40 mb-3">Keywords Found</div><div className="text-4xl font-bold text-emerald-400">{analysis.keywords_found?.length ?? 0}</div></div>
        <div className="glass-card p-5"><div className="text-xs text-white/40 mb-3">Missing Skills</div><div className="text-4xl font-bold text-amber-400">{analysis.missing_skills?.length ?? 0}</div></div>
      </div>

      <div className="glass-card p-6 mb-4">
        <h3 className="font-semibold mb-3 text-white/80">Summary</h3>
        <p className="text-white/60 leading-relaxed text-sm">{analysis.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-emerald-400" /><h3 className="font-semibold text-sm">Strengths</h3></div>
          <ul className="space-y-2">
            {analysis.strengths?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                <CheckCircle size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4"><AlertTriangle size={16} className="text-amber-400" /><h3 className="font-semibold text-sm">Weaknesses</h3></div>
          <ul className="space-y-2">
            {analysis.weaknesses?.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-card p-6 mb-4">
        <div className="flex items-center gap-2 mb-4"><Tag size={16} className="text-indigo-400" /><h3 className="font-semibold text-sm">Keywords</h3></div>
        <div className="mb-4">
          <div className="text-xs text-emerald-400 font-medium mb-2">FOUND</div>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords_found?.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>{kw}</span>
            ))}
          </div>
        </div>
        {(analysis.keywords_missing?.length ?? 0) > 0 && (
          <div>
            <div className="text-xs text-red-400 font-medium mb-2">MISSING</div>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords_missing?.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{kw}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {(analysis.suggestions?.length ?? 0) > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4"><Lightbulb size={16} className="text-yellow-400" /><h3 className="font-semibold text-sm">Suggestions</h3></div>
          <div className="space-y-3">
            {analysis.suggestions?.map((s: Suggestion, i: number) => (
              <div key={i} className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <button onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium mr-2"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>{s.section}</span>
                  <span className="text-sm text-white/50 flex-1 truncate">{s.original.slice(0, 60)}…</span>
                  {expanded === i ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                </button>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        <div className="p-3 rounded-lg text-xs text-red-300/70 line-through" style={{ background: 'rgba(239,68,68,0.07)' }}>{s.original}</div>
                        <div className="p-3 rounded-lg text-xs text-emerald-300" style={{ background: 'rgba(16,185,129,0.07)' }}>{s.improved}</div>
                        <p className="text-xs text-white/30">{s.reason}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

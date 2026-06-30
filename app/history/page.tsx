'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import { History, FileText, Trash2, ExternalLink, ChevronRight, Search } from 'lucide-react'
import { formatDate, getScoreColor } from '@/lib/utils'
import type { Analysis } from '@/lib/types'

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analyses?limit=50')
      const data = await res.json()
      if (res.ok) {
        setAnalyses(data.analyses || [])
        setTotal(data.total || 0)
      }
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analysis?')) return
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAnalyses(prev => prev.filter(a => a.id !== id))
        toast.success('Analysis deleted')
      }
    } catch {
      toast.error('Delete failed')
    }
  }

  const filtered = analyses.filter(a =>
    a.summary?.toLowerCase().includes(search.toLowerCase()) ||
    (a as unknown as { resumes?: { file_name: string } }).resumes?.file_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analysis History</h1>
          <p className="text-white/50 mt-1">{total} total analyses</p>
        </div>
        <Link href="/analyze" className="btn-primary text-sm px-4 py-2">
          <FileText size={14} />
          New Analysis
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search analyses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-5 h-20 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <History size={48} className="text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white/40 mb-2">No analyses yet</h3>
          <p className="text-white/30 text-sm mb-6">Upload your first resume to get started</p>
          <Link href="/analyze" className="btn-primary justify-center">Analyze a Resume</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => {
            const resume = (a as unknown as { resumes?: { file_name: string; file_type: string } }).resumes
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <FileText size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{resume?.file_name || 'Resume'}</div>
                  <div className="text-xs text-white/40 mt-0.5">{formatDate(a.created_at)}</div>
                  {a.summary && <div className="text-xs text-white/40 mt-1 truncate">{a.summary.slice(0, 80)}…</div>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(a.ats_score)}`}>{a.ats_score}</div>
                    <div className="text-xs text-white/30">ATS</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/history/${a.id}`} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
                      <ExternalLink size={15} />
                    </Link>
                    <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

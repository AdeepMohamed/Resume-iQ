'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, Mail, MessageSquare, History, ArrowRight, TrendingUp } from 'lucide-react'
import { formatDate, getScoreColor } from '@/lib/utils'
import type { Profile } from '@/lib/types'

interface Props {
  profile: Profile | null
  recentAnalyses: Array<{
    ats_score: number
    overall_grade: string
    created_at: string
    resumes: { file_name: string } | null
  }>
}

const quickActions = [
  { href: '/analyze', label: 'Analyze Resume', desc: 'Get ATS score & improvements', icon: FileText, color: 'from-indigo-500 to-purple-500' },
  { href: '/cover-letter', label: 'Cover Letter', desc: 'Generate in seconds', icon: Mail, color: 'from-emerald-500 to-teal-500' },
  { href: '/interview-prep', label: 'Interview Prep', desc: 'Practice questions with tips', icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
  { href: '/history', label: 'View History', desc: 'All past analyses', icon: History, color: 'from-amber-500 to-orange-500' },
]

export default function DashboardClientPage({ profile, recentAnalyses }: Props) {
  const avgScore = recentAnalyses.length
    ? Math.round(recentAnalyses.reduce((s, a) => s + a.ats_score, 0) / recentAnalyses.length)
    : null

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p className="text-white/50 mt-1">Here&apos;s your resume performance overview</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="text-xs text-white/40 mb-2">Total Analyses</div>
          <div className="text-3xl font-bold gradient-text">{profile?.analyses_count ?? recentAnalyses.length}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-white/40 mb-2">Avg ATS Score</div>
          <div className={`text-3xl font-bold ${avgScore ? getScoreColor(avgScore) : 'text-white/20'}`}>
            {avgScore ?? '—'}
          </div>
        </div>
        <div className="glass-card p-5 col-span-2 md:col-span-1">
          <div className="text-xs text-white/40 mb-2">Latest Grade</div>
          <div className="text-3xl font-bold gradient-text">
            {recentAnalyses[0]?.overall_grade ?? '—'}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div key={action.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}>
              <Link href={action.href} className="glass-card-hover p-5 flex flex-col gap-3 block">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <action.icon size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{action.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{action.desc}</div>
                </div>
                <ArrowRight size={14} className="text-white/20 mt-auto self-end" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Analyses */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Analyses</h2>
          <Link href="/history" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <TrendingUp size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40 text-sm mb-4">No analyses yet. Upload your first resume!</p>
            <Link href="/analyze" className="btn-primary text-sm px-5 py-2.5 justify-center">
              Analyze Now
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentAnalyses.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="glass-card p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <FileText size={16} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {(a.resumes as unknown as { file_name: string } | null)?.file_name || 'Resume'}
                  </div>
                  <div className="text-xs text-white/30">{formatDate(a.created_at)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-xl font-bold ${getScoreColor(a.ats_score)}`}>{a.ats_score}</div>
                  <div className="text-sm text-white/30 font-medium">{a.overall_grade}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

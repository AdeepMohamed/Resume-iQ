'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Mail, Upload, Briefcase, Loader2, Copy, CheckCircle } from 'lucide-react'

const TONES = ['professional', 'enthusiastic', 'formal', 'conversational', 'creative']

export default function CoverLetterPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [tone, setTone] = useState('professional')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!resumeText.trim()) { toast.error('Please paste your resume text'); return }
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription: jobDesc || undefined, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.content)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
        <p className="text-white/50 mt-1">Generate a professional, personalized cover letter in seconds</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Upload size={16} className="text-indigo-400" />
              <span className="font-medium text-sm">Your Resume</span>
              <span className="text-xs text-white/30">(paste text)</span>
            </div>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="input-field h-48 resize-none text-sm"
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
              placeholder="Paste the job description to personalize your cover letter..."
              className="input-field h-32 resize-none text-sm"
            />
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={16} className="text-indigo-400" />
              <span className="font-medium text-sm">Tone</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    tone === t
                      ? 'text-white'
                      : 'text-white/40 bg-white/5 hover:bg-white/8'
                  }`}
                  style={tone === t ? {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(167,139,250,0.3))',
                    border: '1px solid rgba(99,102,241,0.4)',
                  } : {}}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !resumeText.trim()}
            className="btn-primary w-full justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Mail size={16} /> Generate Cover Letter</>}
          </button>
        </div>

        {/* Output */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Generated Cover Letter</h3>
            {result && (
              <button onClick={handleCopy} className="btn-secondary text-xs px-3 py-1.5">
                {copied ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-3 text-white/30">
                <Loader2 size={32} className="animate-spin text-indigo-400" />
                <span className="text-sm">Crafting your cover letter…</span>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex-1">
                <div className="h-full overflow-y-auto rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap text-white/80"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', minHeight: '400px' }}>
                  {result}
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-3 text-center" style={{ minHeight: '400px' }}>
                <Mail size={48} className="text-white/10" />
                <p className="text-white/30 text-sm">Your generated cover letter will appear here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Upload, FileText, X, Briefcase, Loader2, CheckCircle,
  TrendingUp, AlertTriangle, Lightbulb, Tag, ChevronDown, ChevronUp, Save, RotateCcw
} from 'lucide-react'
import type { AnalysisResult, Suggestion } from '@/lib/types'
import { cn, getScoreColor, getScoreBg } from '@/lib/utils'

type Step = 'upload' | 'analyzing' | 'results'

export default function AnalyzePage() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const handleFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext !== 'pdf' && ext !== 'docx') {
      toast.error('Please upload a PDF or DOCX file')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)')
      return
    }
    setFile(f)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setStep('analyzing')

    try {
      // 1. Parse resume
      const formData = new FormData()
      formData.append('file', file)
      const parseRes = await fetch('/api/parse-resume', { method: 'POST', body: formData })
      const parseData = await parseRes.json()
      if (!parseRes.ok) throw new Error(parseData.error || 'Parse failed')

      setResumeText(parseData.text)
      setFileName(parseData.fileName)
      setFileType(parseData.fileType)

      // 2. Analyze
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: parseData.text, jobDescription: jobDesc || undefined }),
      })
      const analyzeData = await analyzeRes.json()
      if (!analyzeRes.ok) throw new Error(analyzeData.error || 'Analysis failed')

      setResult(analyzeData)
      setStep('results')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg)
      setStep('upload')
    }
  }

  const handleSave = async () => {
    if (!result || saved) return
    setSaving(true)
    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, fileName, fileType, jobDescription: jobDesc || null, analysisResult: result }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      toast.success('Analysis saved to history!')
    } catch {
      toast.error('Failed to save analysis')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setStep('upload')
    setFile(null)
    setResumeText('')
    setFileName('')
    setFileType('')
    setJobDesc('')
    setResult(null)
    setSaved(false)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analyze Resume</h1>
        <p className="text-white/50 mt-1">Upload your resume and get instant AI-powered feedback</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            {/* Upload area */}
            <label
              htmlFor="resume-input"
              className={cn(
                'border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer block',
                dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/2'
              )}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
            >
              <input id="resume-input" type="file" accept=".pdf,.docx" className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    <FileText size={22} className="text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-white/40">{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); setFile(null) }} className="ml-4 text-white/30 hover:text-red-400">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={40} className="text-white/20 mx-auto mb-4" />
                  <p className="text-white/70 font-medium mb-1">Drop your resume here</p>
                  <p className="text-white/30 text-sm">PDF or DOCX · Max 5 MB</p>
                </>
              )}
            </label>

            {/* Job description */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={18} className="text-indigo-400" />
                <span className="font-medium">Job Description</span>
                <span className="text-xs text-white/30 ml-1">(Optional — improves accuracy)</span>
              </div>
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the job description here to get keyword-matched analysis..."
                className="input-field h-36 resize-none"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Analyze Resume
            </button>
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText size={28} className="text-indigo-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing your resume…</h2>
            <p className="text-white/50">Our AI is reviewing your resume for ATS compatibility, keywords, and improvements.</p>
            <div className="mt-8 flex flex-col gap-2 text-sm text-white/30">
              {['Parsing document content', 'Running ATS compatibility check', 'Identifying skill gaps', 'Generating personalized suggestions'].map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.8 }}
                  className="flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin text-indigo-400" />
                  {msg}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'results' && result && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle size={18} />
                <span className="font-medium">Analysis Complete</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                <button onClick={reset} className="btn-secondary text-sm px-4 py-2 w-full sm:w-auto justify-center">
                  <RotateCcw size={14} />
                  New Analysis
                </button>
                <button onClick={handleSave} disabled={saving || saved} className="btn-primary text-sm px-4 py-2 w-full sm:w-auto justify-center">
                  {saved ? <><CheckCircle size={14} /> Saved</> : saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save to History</>}
                </button>
              </div>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-5 sm:col-span-2 md:col-span-1">
                <div className="text-xs text-white/40 mb-3">ATS Score</div>
                <div className="flex items-end gap-2">
                  <div className={`text-5xl font-bold ${getScoreColor(result.atsScore)}`}>{result.atsScore}</div>
                  <div className="text-white/30 text-lg mb-1">/100</div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/10">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.atsScore}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-1.5 rounded-full ${getScoreBg(result.atsScore)}`} />
                </div>
              </div>
              <div className="glass-card p-5">
                <div className="text-xs text-white/40 mb-3">Overall Grade</div>
                <div className="text-4xl font-bold gradient-text">{result.overallGrade}</div>
              </div>
              <div className="glass-card p-5">
                <div className="text-xs text-white/40 mb-3">Keywords Found</div>
                <div className="text-4xl font-bold text-emerald-400">{result.keywordsFound.length}</div>
              </div>
              <div className="glass-card p-5">
                <div className="text-xs text-white/40 mb-3">Missing Skills</div>
                <div className="text-4xl font-bold text-amber-400">{result.missingSkills.length}</div>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3 text-white/80">Executive Summary</h3>
              <p className="text-white/60 leading-relaxed">{result.summary}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-emerald-400" />
                  <h3 className="font-semibold">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <h3 className="font-semibold">Weaknesses</h3>
                </div>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Keywords */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-indigo-400" />
                <h3 className="font-semibold">Keyword Analysis</h3>
              </div>
              <div className="mb-4">
                <div className="text-xs text-emerald-400 font-medium mb-2">FOUND IN RESUME</div>
                <div className="flex flex-wrap gap-2">
                  {result.keywordsFound.map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              {result.keywordsMissing.length > 0 && (
                <div>
                  <div className="text-xs text-red-400 font-medium mb-2">MISSING KEYWORDS</div>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordsMissing.map((kw, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={18} className="text-yellow-400" />
                  <h3 className="font-semibold">AI Improvement Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {result.suggestions.map((s: Suggestion, i: number) => (
                    <div key={i} className="rounded-xl overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <button
                        onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left gap-2 min-w-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                            {s.section}
                          </span>
                          <span className="text-sm text-white/60 truncate">{s.original}</span>
                        </div>
                        {expandedSuggestion === i ? <ChevronUp size={16} className="text-white/40 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/40 flex-shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {expandedSuggestion === i && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            className="overflow-hidden">
                            <div className="px-4 pb-4 space-y-3">
                              <div className="p-3 rounded-lg text-sm text-red-300/70 line-through"
                                style={{ background: 'rgba(239,68,68,0.07)' }}>
                                {s.original}
                              </div>
                              <div className="p-3 rounded-lg text-sm text-emerald-300"
                                style={{ background: 'rgba(16,185,129,0.07)' }}>
                                {s.improved}
                              </div>
                              <p className="text-xs text-white/40">{s.reason}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missingSkills.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Skills to Add</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d' }}>
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

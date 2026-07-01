'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Mail, Upload, Briefcase, Loader2, Copy, CheckCircle, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TONES = ['professional', 'enthusiastic', 'formal', 'conversational', 'creative']

export default function CoverLetterPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [tone, setTone] = useState('professional')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Saved Resumes integration
  const [resumes, setResumes] = useState<{ id: string; file_name: string; raw_text: string }[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [loadingResumes, setLoadingResumes] = useState(false)

  useEffect(() => {
    async function loadResumes() {
      setLoadingResumes(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data, error } = await supabase
          .from('resumes')
          .select('id, file_name, raw_text')
          .order('created_at', { ascending: false })
          .limit(10)
        if (error) throw error
        if (data) {
          setResumes(data)
          if (data.length > 0) {
            setResumeText(data[0].raw_text)
            setSelectedResumeId(data[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load saved resumes:', err)
      } finally {
        setLoadingResumes(false)
      }
    }
    loadResumes()
  }, [])

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
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-indigo-400" />
                <span className="font-medium text-sm">Your Resume</span>
              </div>
              
              {/* Native file upload parsing */}
              <label className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer flex items-center gap-1">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const ext = file.name.split('.').pop()?.toLowerCase()
                    const mime = file.type
                    const isPdf = mime === 'application/pdf' || ext === 'pdf'
                    const isDocx = mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx'

                    if (!isPdf && !isDocx) {
                      toast.error('Please upload a PDF or DOCX file')
                      return
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('File too large (max 5MB)')
                      return
                    }

                    const toastId = toast.loading('Parsing resume...')
                    try {
                      const formData = new FormData()
                      formData.append('file', file)
                      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || 'Failed to parse')
                      setResumeText(data.text)
                      setSelectedResumeId('')
                      toast.success('Resume parsed successfully!', { id: toastId })
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to parse resume', { id: toastId })
                    }
                  }}
                />
                <FileText size={12} />
                <span>Upload File</span>
              </label>
            </div>

            {loadingResumes ? (
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Loader2 size={12} className="animate-spin text-indigo-400" />
                <span>Loading saved resumes…</span>
              </div>
            ) : resumes.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50">Load from Saved Resumes</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    const val = e.target.value
                    setSelectedResumeId(val)
                    const found = resumes.find(r => r.id === val)
                    if (found) setResumeText(found.raw_text)
                  }}
                  className="input-field py-2 text-xs font-sans"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="" className="bg-[#0f1422] text-white/50">-- Select a resume --</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#0f1422] text-white">
                      {r.file_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <textarea
              value={resumeText}
              onChange={e => {
                setResumeText(e.target.value)
                setSelectedResumeId('')
              }}
              placeholder="Paste your resume text here, upload a file, or select a saved resume..."
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

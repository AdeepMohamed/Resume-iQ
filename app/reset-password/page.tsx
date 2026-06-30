'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import { FileText, Mail, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animated-gradient-bg">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
            <FileText size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl">ResumeIQ <span className="gradient-text">AI</span></span>
        </Link>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
              <p className="text-white/50 text-sm mb-6">We sent a reset link to {email}</p>
              <Link href="/login" className="btn-primary justify-center">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Reset password</h1>
              <p className="text-white/50 text-sm mb-8">Enter your email and we&apos;ll send you a reset link</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" placeholder="Email address" value={email}
                    onChange={e => setEmail(e.target.value)} className="input-field pl-10" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-sm text-white/40 mt-6">
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

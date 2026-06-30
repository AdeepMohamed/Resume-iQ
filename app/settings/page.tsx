'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Settings, User, Key, Eye, EyeOff, Loader2, CheckCircle, Shield } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingKey, setSavingKey] = useState(false)

  const loadProfile = useCallback(async () => {
    const res = await fetch('/api/profile')
    if (res.ok) {
      const data: Profile = await res.json()
      setProfile(data)
      setFullName(data.full_name || '')
      setApiKey(data.openai_api_key ? '••••••••••••••••••••' : '')
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success('Profile updated!')
      await loadProfile()
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (apiKey.startsWith('••')) { toast.info('No changes to API key'); return }
    setSavingKey(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openai_api_key: apiKey || null }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success(apiKey ? 'API key saved!' : 'API key removed')
      await loadProfile()
    } catch {
      toast.error('Failed to save API key')
    } finally {
      setSavingKey(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-white/50 mt-1">Manage your account and API configuration</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <User size={16} className="text-indigo-400" />
            </div>
            <h2 className="font-semibold">Profile</h2>
          </div>

          {profile && (
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
                {profile.full_name?.charAt(0) || profile.email?.charAt(0) || '?'}
              </div>
              <div>
                <div className="font-medium">{profile.full_name || 'No name set'}</div>
                <div className="text-sm text-white/40">{profile.email}</div>
                <div className="text-xs text-white/30 mt-0.5">{profile.analyses_count} analyses run</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Your full name" className="input-field" />
            </div>
            <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary px-5 py-2.5 text-sm">
              {savingProfile ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><CheckCircle size={14} /> Save Profile</>}
            </button>
          </div>
        </motion.div>

        {/* OpenAI API Key */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <Key size={16} className="text-indigo-400" />
            </div>
            <h2 className="font-semibold">OpenAI API Key</h2>
          </div>

          <div className="p-4 rounded-xl mb-5 flex items-start gap-3"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Shield size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white/70 mb-1">
                Add your own <span className="text-white font-medium">OpenAI API key</span> to use the app with your own account.
                Get a free key at{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                  platform.openai.com
                </a>
              </p>
              <p className="text-xs text-white/40">Your key is stored securely and only used for your requests.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">API Key</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="input-field pl-10 pr-10 font-mono text-sm"
                />
                <button type="button" onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveApiKey} disabled={savingKey} className="btn-primary px-5 py-2.5 text-sm">
                {savingKey ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><CheckCircle size={14} /> Save Key</>}
              </button>
              {profile?.openai_api_key && (
                <button onClick={() => { setApiKey(''); toast.info('Key will be removed when you save') }}
                  className="btn-secondary px-5 py-2.5 text-sm text-red-400 border-red-500/20">
                  Remove Key
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-white/40" />
            <h2 className="font-semibold">About</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-white/40">App</span><div className="font-medium mt-0.5">ResumeIQ AI</div></div>
            <div><span className="text-white/40">Stack</span><div className="font-medium mt-0.5">Next.js 15 · Supabase · OpenAI</div></div>
            <div><span className="text-white/40">AI Model</span><div className="font-medium mt-0.5">GPT-4o Mini (default)</div></div>
            <div><span className="text-white/40">Pricing</span><div className="font-medium mt-0.5 text-emerald-400">100% Free</div></div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

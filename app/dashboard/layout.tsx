'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, History, Mail, MessageSquare,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyze', label: 'Analyze Resume', icon: FileText },
  { href: '/history', label: 'History', icon: History },
  { href: '/cover-letter', label: 'Cover Letter', icon: Mail },
  { href: '/interview-prep', label: 'Interview Prep', icon: MessageSquare },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setProfile(data as Profile)
  }, [supabase])

  useEffect(() => { loadProfile() }, [loadProfile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full overflow-hidden w-full ${mobile ? 'p-4' : ''}`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
          <FileText size={15} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <span className="font-bold text-sm">ResumeIQ <span className="gradient-text">AI</span></span>
        )}
      </div>

      <div className="divider mx-4 mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              } ${collapsed && !mobile ? 'justify-center' : ''}`}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(167,139,250,0.2))',
                border: '1px solid rgba(99,102,241,0.3)',
              } : {}}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="divider mx-4 mb-4" />

      {/* Bottom */}
      <div className="px-2 space-y-1 pb-4">
        <Link href="/settings" onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <Settings size={18} />
          {(!collapsed || mobile) && 'Settings'}
        </Link>
        <button onClick={handleSignOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all w-full ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <LogOut size={18} />
          {(!collapsed || mobile) && 'Sign Out'}
        </button>
      </div>

      {/* Profile */}
      {(!collapsed || mobile) && profile && (
        <div className="mx-4 mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
              {profile.full_name?.charAt(0) || profile.email?.charAt(0) || '?'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium truncate">{profile.full_name || 'User'}</div>
              <div className="text-xs text-white/40 truncate">{profile.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto 1fr', 
        height: '100vh', 
        width: '100vw', 
        overflow: 'hidden', 
        background: '#080B14' 
      }}
    >


      {/* Sidebar Wrapper Column */}
      <div className="relative h-full flex flex-row">
        {/* Desktop sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 72 : 240 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hidden md:flex flex-col flex-shrink-0 relative overflow-hidden h-full"
          style={{
            width: collapsed ? 72 : 240,
            background: '#0c1020',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Sidebar />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors z-10"
            style={{ background: '#1a2040', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </motion.aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 md:hidden"
                style={{ background: 'rgba(0,0,0,0.6)' }}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.3 }}
                className="fixed left-0 top-0 h-full w-64 z-50 md:hidden flex flex-col"
                style={{ background: '#0c1020', borderRight: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Sidebar mobile />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>


      {/* Main */}
      <div className="flex flex-col overflow-hidden min-w-0 w-full">

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60 hover:text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-bold text-sm">ResumeIQ <span className="gradient-text">AI</span></span>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

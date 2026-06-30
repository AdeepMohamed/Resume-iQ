'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText, Zap, Target, MessageSquare, Users, TrendingUp,
  CheckCircle, ArrowRight, Star, Brain, Shield, BarChart2
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Instant ATS Scoring',
    description: 'Get a precise ATS compatibility score in seconds. Understand exactly how recruiters\' systems see your resume.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Target,
    title: 'Job Description Matching',
    description: 'Paste any job description and get a detailed keyword gap analysis with tailored recommendations.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Brain,
    title: 'AI-Powered Suggestions',
    description: 'Receive line-by-line rewrites that make your experience sound more impactful and professional.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: MessageSquare,
    title: 'Cover Letter Generator',
    description: 'Generate compelling, personalized cover letters in seconds with multiple tone options.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    title: 'Interview Preparation',
    description: 'Get role-specific interview questions with expert tips to help you nail your next interview.',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Track your resume improvement over time with full history and score progression.',
    gradient: 'from-indigo-500 to-violet-500',
  },
]

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Software Engineer → Google',
    text: 'ResumeIQ boosted my ATS score from 52 to 91. I got 3x more callbacks within a week.',
    rating: 5,
  },
  {
    name: 'Marcus T.',
    role: 'Product Manager → Stripe',
    text: 'The keyword matching feature showed me exactly what was missing. Game changer for job hunting.',
    rating: 5,
  },
  {
    name: 'Priya S.',
    role: 'Data Scientist → Meta',
    text: 'The AI suggestions rewrote my experience bullets beautifully. Much more impactful.',
    rating: 5,
  },
]

const stats = [
  { value: '94%', label: 'ATS Pass Rate' },
  { value: '3x', label: 'More Callbacks' },
  { value: '50K+', label: 'Resumes Analyzed' },
  { value: '4.9★', label: 'User Rating' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen animated-gradient-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ResumeIQ <span className="gradient-text">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
          >
            <Zap size={14} />
            AI-Powered Resume Intelligence
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Land Your Dream Job<br />
            <span className="gradient-text">10x Faster</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume and get an instant ATS score, AI-powered improvements,
            tailored cover letters, and interview prep — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base px-8 py-4">
              Analyze My Resume Free
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-4">
              Sign In
            </Link>
          </div>

          <p className="mt-4 text-sm text-white/30">No credit card required • 100% Free</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Get Hired</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              A complete AI toolkit that transforms your resume from average to exceptional.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card-hover p-6"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.gradient} bg-opacity-20`}
                  style={{ background: `linear-gradient(135deg, ${feature.gradient.replace('from-', '').replace('to-', '').split(' ').join(', ')})`, opacity: 1 }}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-0`}
                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <feature.icon size={22} className="text-white" />
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.gradient}`}
                  style={{ position: 'absolute', opacity: 0 }} />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-white/50 text-lg">Three simple steps to a better resume.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Drop your PDF or DOCX resume. Our parser extracts all content instantly.', icon: FileText },
              { step: '02', title: 'AI Analysis', desc: 'Our AI scores your ATS compatibility, finds keyword gaps, and generates specific improvements.', icon: Brain },
              { step: '03', title: 'Land Interviews', desc: 'Apply with your optimized resume and use our interview prep to ace the conversation.', icon: BarChart2 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass-card p-8 text-center relative"
              >
                <div className="text-6xl font-bold opacity-10 absolute top-4 right-6 select-none">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(167,139,250,0.3))', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <item.icon size={24} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">Job Seekers</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-indigo-400">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-16"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(167,139,250,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Get <span className="gradient-text">Hired?</span>
          </h2>
          <p className="text-white/50 text-lg mb-8">
            Join thousands of job seekers who upgraded their resume with ResumeIQ AI — completely free.
          </p>
          <Link href="/register" className="btn-primary text-lg px-10 py-4">
            Start Analyzing Free
            <ArrowRight size={20} />
          </Link>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/40">
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-400" /> 100% Free</span>
            <span className="flex items-center gap-1"><Shield size={14} className="text-emerald-400" /> Secure & Private</span>
            <span className="flex items-center gap-1"><Zap size={14} className="text-emerald-400" /> Instant Results</span>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-sm text-white/30">
        <p>© 2024 ResumeIQ AI. Built with Next.js, Supabase &amp; OpenAI.</p>
      </footer>
    </div>
  )
}

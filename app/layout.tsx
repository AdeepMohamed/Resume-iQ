import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ResumeIQ AI – AI-Powered Resume Analyzer & ATS Optimizer',
  description:
    'Get instant ATS scores, AI-powered resume improvements, cover letter generation, and interview preparation. Optimize your resume with ResumeIQ AI.',
  keywords: ['resume analyzer', 'ATS score', 'AI resume', 'cover letter generator', 'interview prep'],
  authors: [{ name: 'ResumeIQ AI' }],
  openGraph: {
    title: 'ResumeIQ AI – AI Resume Analyzer',
    description: 'Get instant ATS scores and AI-powered resume optimization.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-[#080B14] text-white`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1f35',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}

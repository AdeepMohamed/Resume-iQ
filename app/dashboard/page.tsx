import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClientPage from './client-page'

export const dynamic = 'force-dynamic'


export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, analysesResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('analyses')
      .select('ats_score, overall_grade, created_at, resumes(file_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <DashboardClientPage
      profile={profileResult.data}
      recentAnalyses={(analysesResult.data as unknown as Array<{
        ats_score: number
        overall_grade: string
        created_at: string
        resumes: { file_name: string } | null
      }>) || []}
    />
  )
}

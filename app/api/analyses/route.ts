import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Save a full analysis to Supabase
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      resumeText,
      fileName,
      fileType,
      jobDescription,
      analysisResult,
    } = body

    // 1. Upsert resume
    const { data: resume, error: resumeErr } = await supabase
      .from('resumes')
      .insert({ user_id: user.id, file_name: fileName, file_type: fileType, raw_text: resumeText })
      .select()
      .single()

    if (resumeErr) throw resumeErr

    // 2. Save analysis
    const { data: analysis, error: analysisErr } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        resume_id: resume.id,
        job_description: jobDescription || null,
        ats_score: analysisResult.atsScore,
        overall_grade: analysisResult.overallGrade,
        summary: analysisResult.summary,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        missing_skills: analysisResult.missingSkills,
        keywords_found: analysisResult.keywordsFound,
        keywords_missing: analysisResult.keywordsMissing,
        suggestions: analysisResult.suggestions,
        raw_response: analysisResult,
      })
      .select()
      .single()

    if (analysisErr) throw analysisErr

    // Increment user analysis count (non-fatal)
    try {
      const { data: prof } = await supabase.from('profiles').select('analyses_count').eq('id', user.id).single()
      await supabase.from('profiles').update({ analyses_count: (prof?.analyses_count ?? 0) + 1 }).eq('id', user.id)
    } catch {}


    return NextResponse.json({ resumeId: resume.id, analysisId: analysis.id })
  } catch (err: unknown) {
    console.error('Save analysis error:', err)
    const message = err instanceof Error ? err.message : 'Save failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Get all analyses for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data, error, count } = await supabase
      .from('analyses')
      .select('*, resumes(file_name, file_type)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ analyses: data, total: count })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

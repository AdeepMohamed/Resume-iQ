import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient, getModelName } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

const ANALYZE_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and resume analyst with 15+ years of HR and recruiting experience. 
Analyze the provided resume and return a comprehensive, structured JSON analysis.

Your analysis must be honest, actionable, and specific. Return ONLY valid JSON matching this exact schema:

{
  "atsScore": <integer 0-100>,
  "overallGrade": <"A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F">,
  "summary": <2-3 sentence executive summary of the resume>,
  "strengths": [<up to 5 specific strength strings>],
  "weaknesses": [<up to 5 specific weakness strings>],
  "missingSkills": [<list of important skills not found in the resume>],
  "keywordsFound": [<keywords/skills found in the resume>],
  "keywordsMissing": [<important keywords missing, especially if JD provided>],
  "suggestions": [
    {
      "section": <resume section name>,
      "original": <quoted original text or description>,
      "improved": <improved version>,
      "reason": <why this improvement helps ATS and recruiters>
    }
  ]
}

ATS Score guidelines:
- 90-100: Exceptional, perfectly optimized
- 80-89: Strong, minor improvements needed
- 60-79: Average, significant gaps
- 40-59: Weak, major issues
- 0-39: Poor, fundamental problems`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeText, jobDescription } = body

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    // Get user's OpenAI API key
    const { data: profile } = await supabase
      .from('profiles')
      .select('openai_api_key')
      .eq('id', user.id)
      .single()

    const openai = getOpenAIClient(profile?.openai_api_key || undefined)
    const model = getModelName(profile?.openai_api_key || undefined)

    const userMessage = jobDescription
      ? `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`
      : `Resume:\n${resumeText}`

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 3000,
    })

    const rawContent = completion.choices[0].message.content
    if (!rawContent) throw new Error('Empty response from OpenAI')

    const analysisResult = JSON.parse(rawContent)

    return NextResponse.json(analysisResult)
  } catch (err: unknown) {
    console.error('Analyze error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

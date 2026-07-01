import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient, getModelName } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

const ANALYZE_SYSTEM_PROMPT = `You are an elite, highly critical technical recruiter and HR director with 15+ years of hiring experience at top-tier companies. Your job is to act as a strict gatekeeper. You filter through thousands of applications and only accept the top 5% of candidates. 

You must analyze the provided resume with extreme scrutiny, brutal honesty, and zero leniency. Do not give polite encouragement; instead, focus on realistic corporate standards and applicant tracking system (ATS) compatibility.

Your analysis must return ONLY a valid JSON object matching this exact schema:
{
  "atsScore": <integer 0-100>,
  "overallGrade": <"A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F">,
  "summary": <2-3 sentence executive summary containing a blunt assessment of the candidate's quality and marketability>,
  "strengths": [<up to 5 specific strength strings where the candidate genuinely excels>],
  "weaknesses": [<up to 5 critical flaws, lack of metrics, generic wording, or missing core components>],
  "missingSkills": [<list of important technical/domain skills or tools expected for their level/role that are not found>],
  "keywordsFound": [<relevant keywords/skills found in the resume>],
  "keywordsMissing": [<important keywords or industry terms missing, especially compared to the Job Description if provided>],
  "suggestions": [
    {
      "section": <resume section name>,
      "original": <quoted original text, phrase, or description>,
      "improved": <improved, impact-driven version using active verbs and metrics>,
      "reason": <the exact HR/ATS reason why this revision stands out>
    }
  ]
}

CRITICAL RULES FOR SCORING & GRADING:
1. QUANTIFIED IMPACT REQUIREMENT: Bullet points must have measurable results (e.g., %, $, time saved, scales of system). If the resume is just a list of generic responsibilities (e.g., "Responsible for writing code", "Helped team build website", "Managed database"), you MUST grade it C+ or lower, and the ATS score must be below 65.
2. ATS SCORE STANDARDS:
   - 90-100 (A+, A): Flawless formatting, dense with quantified accomplishments, clear progression, zero generic descriptions, and matches 95%+ of core job requirements if a job description is provided.
   - 80-89 (A-, B+): Above average. Rich experience and key technologies, but has slight keyword gaps or minor sections without metrics.
   - 70-79 (B, B-): Good but generic. The candidate does the job but fails to stand out. Lacks strong action verbs or has a few weak bullet points.
   - 50-69 (C+, C, C-): Normal/generic resume. Average applicant. Mostly lists duties and responsibilities instead of achievements. Contains generic phrasing.
   - 30-49 (D): Poor. Severe lack of details, weak format, clear spelling/grammar issues, or is highly irrelevant to the job description if provided.
   - 0-29 (F): Unusable or fundamentally broken resume.
3. COMPARATIVE SENSITIVITY: Ensure there is a massive gap in scoring between a standard/normal resume (e.g., 50-60 score) and a super-optimized resume with rich business impact metrics (e.g., 85+ score). Never award A or B grades to resumes filled with generic statements.
4. JOB DESCRIPTION ALIGNMENT: If a Job Description is provided, evaluate the resume specifically against it. If the candidate's experience is not highly aligned, immediately penalize the grade by at least 1 full letter grade (e.g., A- to B-) and dock the ATS score accordingly.`

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

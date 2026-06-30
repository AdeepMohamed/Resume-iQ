import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient, getModelName } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeText, jobDescription, count = 10 } = body

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('openai_api_key')
      .eq('id', user.id)
      .single()

    const openai = getOpenAIClient(profile?.openai_api_key || undefined)
    const model = getModelName(profile?.openai_api_key || undefined)

    const systemPrompt = `You are an expert technical interviewer and career coach. Generate ${count} insightful interview questions based on the provided resume and job description.

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": <the interview question>,
      "category": <"Behavioral" | "Technical" | "Situational" | "Culture Fit" | "Role-Specific">,
      "difficulty": <"Easy" | "Medium" | "Hard">,
      "tips": <2-3 sentence tip on how to answer this question well>
    }
  ]
}

Mix categories and difficulties. Make questions specific to the candidate's background and the role.`

    const userMessage = jobDescription
      ? `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`
      : `Resume:\n${resumeText}\n\nGenerate general interview questions based on this candidate's background.`

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 3000,
    })

    const rawContent = completion.choices[0].message.content
    if (!rawContent) throw new Error('Empty response from OpenAI')

    const result = JSON.parse(rawContent)
    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('Interview questions error:', err)
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

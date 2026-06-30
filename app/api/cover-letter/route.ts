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
    const { resumeText, jobDescription, tone = 'professional' } = body

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

    const systemPrompt = `You are an expert cover letter writer with deep knowledge of what hiring managers look for. 
Write a compelling, ${tone} cover letter based on the provided resume and job description.
The letter should:
- Be 3-4 paragraphs (300-400 words)
- Open with a strong hook
- Highlight 2-3 most relevant achievements from the resume
- Show enthusiasm for the specific role and company
- Close with a confident call to action
- Use [Company Name] as placeholder if company name not provided
- Use [Your Name] as the signature placeholder
Format as plain text with proper paragraph breaks.`

    const userMessage = jobDescription
      ? `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`
      : `Resume:\n${resumeText}\n\nWrite a general cover letter showcasing the candidate's strongest points.`

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error('Empty response from OpenAI')

    return NextResponse.json({ content })
  } catch (err: unknown) {
    console.error('Cover letter error:', err)
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

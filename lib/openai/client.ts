import OpenAI from 'openai'

export function getOpenAIClient(apiKey?: string) {
  const key = apiKey || process.env.OPENAI_API_KEY
  if (!key) {
    throw new Error('No OpenAI API key found. Please add your key in Settings.')
  }
  
  const isGroq = key.startsWith('gsk_')
  return new OpenAI({
    apiKey: key,
    baseURL: isGroq ? 'https://api.groq.com/openai/v1' : undefined
  })
}

export function getModelName(apiKey?: string) {
  const key = apiKey || process.env.OPENAI_API_KEY
  if (key?.startsWith('gsk_')) {
    return 'llama-3.3-70b-versatile'
  }
  return process.env.OPENAI_MODEL || 'gpt-4o-mini'
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

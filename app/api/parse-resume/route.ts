import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = file.name
    const fileType = fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx'

    let text = ''

    if (fileType === 'pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PDFParse } = require('pdf-parse')
      const parser = new PDFParse(new Uint8Array(buffer))
      await parser.load()
      const data = await parser.getText()
      text = data.text
    } else if (fileType === 'docx') {

      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload PDF or DOCX.' },
        { status: 400 }
      )
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from the file. Please try a different file.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text: text.trim(), fileName, fileType })
  } catch (err) {
    console.error('Parse resume error:', err)
    return NextResponse.json({ error: 'Failed to parse resume.' }, { status: 500 })
  }
}

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

    // Check file signature magic numbers (highly reliable on mobile/tablets)
    const isPdfMagic = buffer.toString('ascii', 0, 4) === '%PDF'
    const isDocxMagic = buffer.length >= 4 && buffer.readUInt32BE(0) === 0x504B0304 // ZIP/DOCX container 'PK\x03\x04'

    const fileName = file.name || ''
    const mimeType = file.type || ''

    let fileType: 'pdf' | 'docx' | null = null

    if (isPdfMagic) {
      fileType = 'pdf'
    } else if (isDocxMagic) {
      fileType = 'docx'
    } else if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      fileType = 'pdf'
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.toLowerCase().endsWith('.docx')
    ) {
      fileType = 'docx'
    }

    if (!fileType) {
      return NextResponse.json(
        { error: `Unsupported file type (${mimeType || 'unknown'}). Please upload a PDF or DOCX file.` },
        { status: 400 }
      )
    }

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
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from the file. Please try a different file.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text: text.trim(), fileName, fileType })
  } catch (err: any) {
    console.error('Parse resume error:', err)
    return NextResponse.json({ error: `Failed to parse resume: ${err?.message || err}` }, { status: 500 })
  }
}

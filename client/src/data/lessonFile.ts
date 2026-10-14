import JSZip from 'jszip'
import mammoth from 'mammoth'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorker

const maxTitleLength = 200
const maxContentLength = 100000
const maxFileBytes = 20 * 1024 * 1024

export type LessonFileDraft = {
  title: string
  content: string
  notice: string
}

export async function readLessonFile(file: File): Promise<LessonFileDraft> {
  const name = file.name.toLowerCase()
  if (file.size > maxFileBytes) {
    throw new Error('File tối đa 20 MB.')
  }
  if (name.endsWith('.ppt') && !name.endsWith('.pptx')) {
    throw new Error('File .ppt cũ không đọc được. Hãy lưu dạng .pptx rồi tải lại.')
  }

  const raw = name.endsWith('.docx')
    ? await readDocx(file)
    : name.endsWith('.pdf')
      ? await readPdf(file)
      : name.endsWith('.pptx')
        ? await readPptx(file)
        : name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.markdown')
          ? await readPlainText(file)
          : null

  if (raw === null) {
    throw new Error('Chỉ nhận file .txt, .md, .docx, .pdf hoặc .pptx.')
  }
  if (raw.trim() === '') {
    throw new Error('File không có chữ để lấy.')
  }

  const draft = splitTitle(raw, filenameTitle(file.name))
  if (draft.content.length <= maxContentLength) {
    return { ...draft, notice: '' }
  }

  return {
    ...draft,
    content: draft.content.slice(0, maxContentLength),
    notice: 'File dài hơn giới hạn, phần cuối đã được cắt.',
  }
}

async function readPlainText(file: File) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buffer)
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(buffer)
  }
  return new TextDecoder('utf-8').decode(buffer)
}

async function readPdf(file: File) {
  const data = new Uint8Array(await file.arrayBuffer())
  try {
    const pdf = await getDocument({ data }).promise
    try {
      const pages: string[] = []
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber)
        const content = await page.getTextContent()
        const text = pageToText(content.items)
        if (text !== '') {
          pages.push(text)
        }
      }
      const text = pages.join('\n\n').trim()
      if (text === '') {
        throw new Error('PDF này không có chữ để lấy. File scan ảnh thì không đọc được.')
      }
      return text
    } finally {
      await pdf.destroy()
    }
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('PDF này') || error.message.startsWith('File không'))) {
      throw error
    }
    if (error instanceof Error && /password/i.test(error.message)) {
      throw new Error('PDF này có mật khẩu, không đọc được.')
    }
    throw new Error('Không đọc được file PDF.')
  }
}

async function readPptx(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const names = Object.keys(zip.files)
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry))
    .sort((left, right) => slideNumber(left) - slideNumber(right))
  const slides: string[] = []

  for (const entry of names) {
    const xml = await zip.files[entry].async('string')
    const lines = xml
      .split(/<\/a:p>/)
      .map((paragraph) =>
        [...paragraph.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)]
          .map((match) => decodeXml(match[1]))
          .join('')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter((line) => line !== '')
    if (lines.length > 0) {
      slides.push(lines.join('\n'))
    }
  }

  const text = slides.join('\n\n').trim()
  if (text === '') {
    throw new Error('File PowerPoint không có chữ để lấy.')
  }
  return text
}

function slideNumber(name: string) {
  const match = name.match(/slide(\d+)\.xml$/)
  return match ? Number(match[1]) : 0
}

function decodeXml(value: string) {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCodePoint(Number(num)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function pageToText(items: readonly unknown[]) {
  const rows: { y: number; parts: { x: number; end: number; text: string }[] }[] = []

  for (const item of items) {
    if (!isPdfText(item) || item.str === '') {
      continue
    }
    const x = Number(item.transform[4] ?? 0)
    const y = Number(item.transform[5] ?? 0)
    const width = typeof item.width === 'number' ? item.width : 0
    let row = rows.find((candidate) => Math.abs(candidate.y - y) < 2)
    if (!row) {
      row = { y, parts: [] }
      rows.push(row)
    }
    row.parts.push({ x, end: x + width, text: item.str })
  }

  rows.sort((left, right) => right.y - left.y)
  return rows
    .map((row) => joinPdfLine(row.parts))
    .filter((line) => line !== '')
    .join('\n')
}

function joinPdfLine(parts: { x: number; end: number; text: string }[]) {
  const ordered = [...parts].sort((left, right) => left.x - right.x)
  let line = ''
  let end = 0

  for (const part of ordered) {
    if (line === '' || line.endsWith(' ') || part.text.startsWith(' ')) {
      line += part.text
    } else if (part.x - end > 1.5) {
      line += ` ${part.text}`
    } else {
      line += part.text
    }
    end = Math.max(end, part.end)
  }

  return line.replace(/[ \t]{2,}/g, ' ').trim()
}

function isPdfText(item: unknown): item is { str: string; transform: number[]; width?: number } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'str' in item &&
    typeof item.str === 'string' &&
    'transform' in item &&
    Array.isArray(item.transform)
  )
}

async function readDocx(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  return htmlToText(result.value.replace(/<img\b[^>]*>/gi, ''))
}

function filenameTitle(name: string) {
  const bare = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
  return bare.slice(0, maxTitleLength)
}

function splitTitle(text: string, fallbackTitle: string) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  const lines = normalized.split('\n')
  const first = plainTitle(lines[0] ?? '')
  const rest = lines.slice(1).join('\n').trim()

  if (first !== '' && first.length <= maxTitleLength && rest !== '') {
    return { title: first, content: rest }
  }

  return { title: fallbackTitle, content: normalized }
}

function plainTitle(value: string) {
  return value.replace(/\*\*/g, '').replace(/\+\+/g, '').replace(/\*/g, '').trim()
}

function htmlToText(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html')
  return renderChildren(document.body).replace(/\n{3,}/g, '\n\n').trim()
}

function renderChildren(element: ParentNode) {
  return [...element.childNodes]
    .map((node) => renderBlock(node))
    .filter((part) => part.trim() !== '')
    .join('\n\n')
}

function renderBlock(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? ''
  }
  if (!(node instanceof HTMLElement)) {
    return ''
  }

  const tag = node.tagName
  if (tag === 'UL' || tag === 'OL') {
    return [...node.children]
      .map((item) => (item instanceof HTMLElement ? renderInline(item) : ''))
      .join('\n')
  }
  if (tag === 'BR') {
    return '\n'
  }
  return renderInline(node)
}

function renderInline(element: HTMLElement): string {
  const tag = element.tagName
  const inner = [...element.childNodes].map((node) => inlineNode(node)).join('')
  if (tag === 'STRONG' || tag === 'B' || /^H[1-6]$/.test(tag)) {
    return wrapMarker(inner, '**')
  }
  if (tag === 'EM' || tag === 'I') {
    return wrapMarker(inner, '*')
  }
  if (tag === 'U') {
    return wrapMarker(inner, '++')
  }
  return inner
}

function inlineNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? ''
  }
  if (node instanceof HTMLElement) {
    if (node.tagName === 'BR') {
      return '\n'
    }
    return renderInline(node)
  }
  return ''
}

function wrapMarker(value: string, marker: string) {
  const text = value.trim()
  if (text === '') {
    return ''
  }
  return `${marker}${text}${marker}`
}

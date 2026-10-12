import mammoth from 'mammoth'

const maxTitleLength = 200
const maxContentLength = 100000
const maxFileBytes = 8 * 1024 * 1024

export type LessonFileDraft = {
  title: string
  content: string
  notice: string
}

export async function readLessonFile(file: File): Promise<LessonFileDraft> {
  const name = file.name.toLowerCase()
  if (file.size > maxFileBytes) {
    throw new Error('File tối đa 8 MB.')
  }

  const raw = name.endsWith('.docx')
    ? await readDocx(file)
    : name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.markdown')
      ? await readPlainText(file)
      : null

  if (raw === null) {
    throw new Error('Chỉ nhận file .txt, .md hoặc .docx.')
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

const contentImageSource =
  '/api/uploads/[0-9a-f-]+\\.(?:jpe?g|png|gif|webp)|https?:\\/\\/[^\\s)\'"]+\\.(?:png|jpe?g|gif|webp|avif|svg)(?:\\?[^\\s)\'"]*)?'

export type LessonContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string }

export function firstContentImageUrl(content: string) {
  const match = content.match(new RegExp(contentImageSource, 'i'))
  return match?.[0] ?? null
}

export function splitLessonContent(content: string) {
  const pattern = new RegExp(contentImageSource, 'gi')
  const parts: LessonContentPart[] = []
  let lastIndex = 0

  for (const match of content.matchAll(pattern)) {
    const index = match.index
    if (index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, index) })
    }
    parts.push({ type: 'image', url: match[0] })
    lastIndex = index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) })
  }

  return parts
}

export type TextFormat = 'bold' | 'italic' | 'underline'

export type InlinePart =
  | { type: 'text'; text: string }
  | { type: TextFormat; children: InlinePart[] }

const formatTokens: { type: TextFormat; token: string }[] = [
  { type: 'bold', token: '**' },
  { type: 'underline', token: '++' },
  { type: 'italic', token: '*' },
]

function parseInlineRange(text: string, start: number, end: number): InlinePart[] {
  const parts: InlinePart[] = []
  let index = start

  while (index < end) {
    let found: { type: TextFormat; token: string; at: number } | null = null

    for (const format of formatTokens) {
      const at = text.indexOf(format.token, index)
      if (at === -1 || at >= end) {
        continue
      }
      if (
        !found ||
        at < found.at ||
        (at === found.at && format.token.length > found.token.length)
      ) {
        found = { type: format.type, token: format.token, at }
      }
    }

    if (!found) {
      parts.push({ type: 'text', text: text.slice(index, end) })
      break
    }

    if (found.at > index) {
      parts.push({ type: 'text', text: text.slice(index, found.at) })
    }

    const innerStart = found.at + found.token.length
    const close = text.indexOf(found.token, innerStart)
    if (close === -1 || close >= end || close === innerStart) {
      parts.push({ type: 'text', text: found.token })
      index = innerStart
      continue
    }

    parts.push({
      type: found.type,
      children: parseInlineRange(text, innerStart, close),
    })
    index = close + found.token.length
  }

  return parts
}

export function parseInline(text: string) {
  return parseInlineRange(text, 0, text.length)
}

export function wrapSelection(content: string, start: number, end: number, format: TextFormat) {
  const token = formatTokens.find((item) => item.type === format)?.token ?? ''
  const selected = content.slice(start, end)
  const value = `${content.slice(0, start)}${token}${selected}${token}${content.slice(end)}`
  const cursorStart = start + token.length
  const cursorEnd = cursorStart + selected.length
  return { value, cursorStart, cursorEnd }
}

export function insertImageUrl(content: string, start: number, end: number, url: string) {
  const before = content.slice(0, start)
  const after = content.slice(end)
  const prefix = before.length > 0 && !before.endsWith('\n') ? '\n' : ''
  const suffix = '\n'
  const value = `${before}${prefix}${url}${suffix}${after}`
  const cursor = before.length + prefix.length + url.length + suffix.length
  return { value, cursor }
}

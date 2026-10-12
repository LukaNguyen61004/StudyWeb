import { parseInline, type InlinePart } from '../../data/lessonContent'

function renderInline(parts: InlinePart[], keyPrefix: string) {
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.type === 'text') {
      return <span key={key}>{part.text}</span>
    }

    const children = renderInline(part.children, key)
    if (part.type === 'bold') {
      return <strong key={key}>{children}</strong>
    }
    if (part.type === 'italic') {
      return <em key={key}>{children}</em>
    }
    return <u key={key}>{children}</u>
  })
}

function LessonInline({ text }: { text: string }) {
  return <>{renderInline(parseInline(text), 'inline')}</>
}

export default LessonInline

import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import FormatToolbar from '../components/lesson/FormatToolbar'
import ImageUploadButton from '../components/lesson/ImageUploadButton'
import LessonFileButton from '../components/lesson/LessonFileButton'
import SnowBackdrop from '../components/SnowBackdrop'
import { createLesson } from '../data/api'
import { insertImageUrl, wrapSelection, type TextFormat } from '../data/lessonContent'
import './NewLessonPage.css'

function NewLessonPage() {
  const navigate = useNavigate()
  const [authorNickname, setAuthorNickname] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [errors, setErrors] = useState<{
    authorNickname?: string
    title?: string
    content?: string
  }>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) {
      return
    }

    const nickname = authorNickname.trim()
    const lessonTitle = title.trim()
    const lessonContent = content.trim()
    const nextErrors: typeof errors = {}

    if (nickname === '') {
      nextErrors.authorNickname = 'Nhập biệt danh.'
    }
    if (lessonTitle === '') {
      nextErrors.title = 'Nhập tiêu đề.'
    }
    if (lessonContent === '') {
      nextErrors.content = 'Nhập nội dung.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setFormError('')
    setSaving(true)
    try {
      await createLesson({
        title: lessonTitle,
        content: lessonContent,
        authorNickname: nickname,
      })
      navigate('/')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không lưu được bài.')
      setSaving(false)
    }
  }

  return (
    <main className="write-page">
      <SnowBackdrop />
      <form className="write-form" onSubmit={handleSubmit}>
        <h1>Viết bài</h1>
        <p className="write-field">
          <label htmlFor="author-nickname">Biệt danh</label>
          <input
            id="author-nickname"
            value={authorNickname}
            onChange={(event) => setAuthorNickname(event.target.value)}
          />
          {errors.authorNickname ? (
            <span className="write-error">{errors.authorNickname}</span>
          ) : null}
        </p>
        <p className="write-field">
          <label htmlFor="lesson-title">Tiêu đề</label>
          <input
            id="lesson-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          {errors.title ? <span className="write-error">{errors.title}</span> : null}
        </p>
        <p className="write-field">
          <label htmlFor="lesson-content">Nội dung</label>
          <textarea
            id="lesson-content"
            ref={contentRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <span className="write-tools">
            <FormatToolbar
              disabled={saving}
              onFormat={(format: TextFormat) => {
                const textarea = contentRef.current
                const current = textarea?.value ?? content
                const start = textarea?.selectionStart ?? current.length
                const end = textarea?.selectionEnd ?? current.length
                const wrapped = wrapSelection(current, start, end, format)
                setContent(wrapped.value)
                requestAnimationFrame(() => {
                  textarea?.focus()
                  textarea?.setSelectionRange(wrapped.cursorStart, wrapped.cursorEnd)
                })
              }}
            />
            <LessonFileButton
              disabled={saving}
              onLoaded={(draft) => {
                setContent(draft.content)
                if (title.trim() === '') {
                  setTitle(draft.title)
                }
                setErrors((current) => ({ ...current, title: undefined, content: undefined }))
                setFormError(draft.notice)
              }}
            />
            <ImageUploadButton
              disabled={saving}
              onUploaded={(url) => {
                const textarea = contentRef.current
                const current = textarea?.value ?? content
                const start = textarea?.selectionStart ?? current.length
                const end = textarea?.selectionEnd ?? current.length
                const inserted = insertImageUrl(current, start, end, url)
                setContent(inserted.value)
                requestAnimationFrame(() => {
                  textarea?.focus()
                  textarea?.setSelectionRange(inserted.cursor, inserted.cursor)
                })
              }}
            />
            <span className="write-hint">
              Tải file .txt, .md, .docx, .pdf hoặc .pptx để điền bài. PDF và PowerPoint chỉ lấy phần chữ. Dòng đầu thành tiêu đề nếu ô tiêu đề đang trống.
            </span>
          </span>
          {errors.content ? <span className="write-error">{errors.content}</span> : null}
        </p>
        {formError ? <span className="write-error">{formError}</span> : null}
        <button className="write-submit" type="submit" disabled={saving}>
          Xác nhận
        </button>
      </form>
    </main>
  )
}

export default NewLessonPage

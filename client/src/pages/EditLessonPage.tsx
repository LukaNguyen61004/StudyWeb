import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import FormatToolbar from '../components/lesson/FormatToolbar'
import ImageUploadButton from '../components/lesson/ImageUploadButton'
import SnowBackdrop from '../components/SnowBackdrop'
import { fetchLesson, updateLesson } from '../data/api'
import { insertImageUrl, wrapSelection, type TextFormat } from '../data/lessonContent'
import type { Lesson } from '../data/lessons'
import './NewLessonPage.css'

function EditLessonPage() {
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState<Lesson | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!lessonId) {
      setLesson(null)
      return
    }

    let active = true
    setLesson(undefined)
    setFailed(false)

    fetchLesson(lessonId)
      .then((found) => {
        if (active) {
          setLesson(found)
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true)
        }
      })

    return () => {
      active = false
    }
  }, [lessonId])

  if (failed) {
    return (
      <main className="write-page">
        <SnowBackdrop />
        <div className="write-form">
          <h1>Không tải được bài</h1>
          <p>
            <Link to="/">Về trang chủ</Link>
          </p>
        </div>
      </main>
    )
  }

  if (lesson === undefined) {
    return (
      <main className="write-page">
        <SnowBackdrop />
        <div className="write-form">
          <h1>Đang tải...</h1>
        </div>
      </main>
    )
  }

  if (!lesson) {
    return (
      <main className="write-page">
        <SnowBackdrop />
        <div className="write-form">
          <h1>Không có bài này</h1>
          <p>
            <Link to="/">Về trang chủ</Link>
          </p>
        </div>
      </main>
    )
  }

  return <EditLessonForm key={lesson.id} lesson={lesson} />
}

function EditLessonForm({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate()
  const [authorNickname, setAuthorNickname] = useState(lesson.authorNickname)
  const [title, setTitle] = useState(lesson.title)
  const [content, setContent] = useState(lesson.content)
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
      await updateLesson(lesson.id, {
        title: lessonTitle,
        content: lessonContent,
        authorNickname: nickname,
      })
      navigate(`/lessons/${lesson.id}`)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không lưu được bài.')
      setSaving(false)
    }
  }

  return (
    <main className="write-page">
      <SnowBackdrop />
      <form className="write-form" onSubmit={handleSubmit}>
        <h1>Sửa bài</h1>
        <p className="write-field">
          <label htmlFor="edit-author-nickname">Biệt danh</label>
          <input
            id="edit-author-nickname"
            value={authorNickname}
            onChange={(event) => setAuthorNickname(event.target.value)}
          />
          {errors.authorNickname ? (
            <span className="write-error">{errors.authorNickname}</span>
          ) : null}
        </p>
        <p className="write-field">
          <label htmlFor="edit-lesson-title">Tiêu đề</label>
          <input
            id="edit-lesson-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          {errors.title ? <span className="write-error">{errors.title}</span> : null}
        </p>
        <p className="write-field">
          <label htmlFor="edit-lesson-content">Nội dung</label>
          <textarea
            id="edit-lesson-content"
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
          </span>
          {errors.content ? <span className="write-error">{errors.content}</span> : null}
        </p>
        {formError ? <span className="write-error">{formError}</span> : null}
        <button className="write-submit" type="submit" disabled={saving}>
          Lưu
        </button>
      </form>
    </main>
  )
}

export default EditLessonPage

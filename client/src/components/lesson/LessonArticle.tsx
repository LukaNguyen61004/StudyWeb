import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import LessonInline from './LessonInline'
import { apiUrl } from '../../data/apiBase'
import { deleteLesson } from '../../data/api'
import { splitLessonContent } from '../../data/lessonContent'
import type { Lesson } from '../../data/lessons'
import './LessonArticle.css'

type LessonArticleProps = {
  lesson: Lesson
}

function LessonArticle({ lesson }: LessonArticleProps) {
  const cover = lesson.imageUrl?.trim()
  const [coverFailed, setCoverFailed] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()
  const parts = splitLessonContent(lesson.content)

  async function handleDelete() {
    if (deleting) {
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteLesson(lesson.id)
      navigate('/')
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Không xóa được bài.')
      setDeleting(false)
    }
  }

  return (
    <article className="lesson-article">
      {cover && !coverFailed ? (
        <img
          className="lesson-article-cover"
          src={apiUrl(cover)}
          alt=""
          onError={() => setCoverFailed(true)}
        />
      ) : null}
      <div className="lesson-article-copy">
        <h1 className="lesson-article-title">{lesson.title}</h1>
        <p className="lesson-article-author">{lesson.authorNickname}</p>
        <div className="lesson-article-content">
          {parts.map((part, index) =>
            part.type === 'image' ? (
              <img key={`${part.url}-${index}`} className="lesson-article-inline" src={apiUrl(part.url)} alt="" />
            ) : (
              <LessonInline key={`text-${index}`} text={part.text} />
            ),
          )}
        </div>
        <div className="lesson-article-actions">
          <Link className="lesson-article-edit" to={`/lessons/${lesson.id}/edit`}>
            Sửa bài
          </Link>
          {confirmingDelete ? (
            <>
              <p className="lesson-article-confirm">Xóa bài này?</p>
              <button
                className="lesson-article-delete"
                type="button"
                disabled={deleting}
                onClick={handleDelete}
              >
                Xóa
              </button>
              <button
                className="lesson-article-cancel"
                type="button"
                disabled={deleting}
                onClick={() => setConfirmingDelete(false)}
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              className="lesson-article-delete"
              type="button"
              onClick={() => setConfirmingDelete(true)}
            >
              Xóa bài
            </button>
          )}
        </div>
        {deleteError ? <p className="lesson-article-error">{deleteError}</p> : null}
      </div>
    </article>
  )
}

export default LessonArticle

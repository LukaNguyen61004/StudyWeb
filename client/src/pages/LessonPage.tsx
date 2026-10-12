import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import LessonArticle from '../components/lesson/LessonArticle'
import SnowBackdrop from '../components/SnowBackdrop'
import { fetchLesson } from '../data/api'
import type { Lesson } from '../data/lessons'
import '../components/lesson/LessonArticle.css'

function LessonPage() {
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
      <main className="lesson-page lesson-missing">
        <SnowBackdrop />
        <div className="lesson-page-content">
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
      <main className="lesson-page">
        <SnowBackdrop />
        <div className="lesson-page-content">
          <p>Đang tải...</p>
        </div>
      </main>
    )
  }

  if (!lesson) {
    return (
      <main className="lesson-page lesson-missing">
        <SnowBackdrop />
        <div className="lesson-page-content">
          <h1>Không có bài này</h1>
          <p>
            <Link to="/">Về trang chủ</Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="lesson-page">
      <SnowBackdrop />
      <div className="lesson-page-content">
        <LessonArticle lesson={lesson} />
      </div>
    </main>
  )
}

export default LessonPage

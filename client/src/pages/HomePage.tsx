import { useEffect, useState } from 'react'
import LessonGrid from '../components/lesson/LessonGrid'
import SnowBackdrop from '../components/SnowBackdrop'
import { fetchLessons } from '../data/api'
import type { Lesson } from '../data/lessons'
import { lessonMatchesQuery } from '../data/lessonSearch'
import './HomePage.css'

function HomePage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true

    fetchLessons()
      .then((rows) => {
        if (!active) {
          return
        }
        setLessons(rows)
        setStatus('ready')
      })
      .catch(() => {
        if (!active) {
          return
        }
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  const visibleLessons = lessons.filter((lesson) => lessonMatchesQuery(lesson, query))

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#111111', color: '#ffffff' }}>
      <SnowBackdrop />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            minHeight: '46vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '64px' }}>Bệnh Alzheimer</h1>
        </div>

        <main className="home-board">
          <form
            className="home-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
            }}
          >
            <label htmlFor="lesson-search">Tìm bài</label>
            <input
              id="lesson-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>

          {status === 'loading' ? (
            <p className="home-empty">Đang tải...</p>
          ) : status === 'error' ? (
            <p className="home-empty">Không tải được bài.</p>
          ) : visibleLessons.length === 0 ? (
            <p className="home-empty">Không có bài phù hợp</p>
          ) : (
            <LessonGrid lessons={visibleLessons} />
          )}
        </main>
      </div>
    </div>
  )
}

export default HomePage
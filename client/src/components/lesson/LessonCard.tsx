import { useState } from 'react'
import { Link } from 'react-router'
import { lessonImageUrl } from '../../data/lessonImage'
import type { Lesson } from '../../data/lessons'
import './LessonCard.css'

type LessonCardProps = {
  lesson: Lesson
}

function LessonCard({ lesson }: LessonCardProps) {
  const imageUrl = lessonImageUrl(lesson)
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(imageUrl) && !imageFailed

  return (
    <Link to={`/lessons/${lesson.id}`} className="lesson-card">
      {showImage ? (
        <img
          className="lesson-card-image"
          src={imageUrl ?? undefined}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <div className="lesson-card-meta">
        <h2 className="lesson-card-title">{lesson.title}</h2>
        <span className="lesson-card-author">{lesson.authorNickname}</span>
      </div>
    </Link>
  )
}

export default LessonCard

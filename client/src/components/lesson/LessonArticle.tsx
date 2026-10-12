import { useState } from 'react'
import { Link } from 'react-router'
import LessonInline from './LessonInline'
import { splitLessonContent } from '../../data/lessonContent'
import type { Lesson } from '../../data/lessons'
import './LessonArticle.css'

type LessonArticleProps = {
  lesson: Lesson
}

function LessonArticle({ lesson }: LessonArticleProps) {
  const cover = lesson.imageUrl?.trim()
  const [coverFailed, setCoverFailed] = useState(false)
  const parts = splitLessonContent(lesson.content)

  return (
    <article className="lesson-article">
      {cover && !coverFailed ? (
        <img
          className="lesson-article-cover"
          src={cover}
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
              <img key={`${part.url}-${index}`} className="lesson-article-inline" src={part.url} alt="" />
            ) : (
              <LessonInline key={`text-${index}`} text={part.text} />
            ),
          )}
        </div>
        <Link className="lesson-article-edit" to={`/lessons/${lesson.id}/edit`}>
          Sửa bài
        </Link>
      </div>
    </article>
  )
}

export default LessonArticle

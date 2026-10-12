import type { Lesson } from '../../data/lessons'
import LessonCard from './LessonCard'
import './LessonGrid.css'

type LessonGridProps = {
  lessons: Lesson[]
}

function LessonGrid({ lessons }: LessonGridProps) {
  return (
    <ul className="lesson-grid">
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <LessonCard lesson={lesson} />
        </li>
      ))}
    </ul>
  )
}

export default LessonGrid

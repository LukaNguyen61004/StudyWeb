import { firstContentImageUrl } from './lessonContent'
import type { Lesson } from './lessons'

export function lessonImageUrl(lesson: Lesson): string | null {
  const cover = lesson.imageUrl?.trim()
  if (cover) {
    return cover
  }

  return firstContentImageUrl(lesson.content)
}

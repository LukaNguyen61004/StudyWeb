import { HttpError } from '../lib/httpError.js'
import * as lessonRepository from '../repositories/lesson.repository.js'
import type { LessonInput } from '../schemas/lesson.schema.js'

export function listLessons() {
  return lessonRepository.findAll()
}

export async function getLesson(id: string) {
  const lesson = await lessonRepository.findById(id)
  if (!lesson) {
    throw new HttpError(404, 'Không có bài này.')
  }
  return lesson
}

export function createLesson(input: LessonInput) {
  return lessonRepository.create(input)
}

export async function updateLesson(id: string, input: LessonInput) {
  const lesson = await lessonRepository.update(id, input)
  if (!lesson) {
    throw new HttpError(404, 'Không có bài này.')
  }
  return lesson
}

export async function deleteLesson(id: string) {
  const removed = await lessonRepository.remove(id)
  if (!removed) {
    throw new HttpError(404, 'Không có bài này.')
  }
}

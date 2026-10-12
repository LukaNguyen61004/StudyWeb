import type { RequestHandler } from 'express'
import { HttpError } from '../lib/httpError.js'
import { lessonInputSchema } from '../schemas/lesson.schema.js'
import * as lessonService from '../services/lesson.service.js'

function routeId(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : ''
}

function readLessonInput(body: unknown) {
  const parsed = lessonInputSchema.safeParse(body)
  if (!parsed.success) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ.')
  }
  return parsed.data
}

export const listLessons: RequestHandler = async (_req, res) => {
  const lessons = await lessonService.listLessons()
  res.json(lessons)
}

export const getLesson: RequestHandler = async (req, res) => {
  const lesson = await lessonService.getLesson(routeId(req.params.id))
  res.json(lesson)
}

export const createLesson: RequestHandler = async (req, res) => {
  const lesson = await lessonService.createLesson(readLessonInput(req.body))
  res.status(201).json(lesson)
}

export const updateLesson: RequestHandler = async (req, res) => {
  const lesson = await lessonService.updateLesson(
    routeId(req.params.id),
    readLessonInput(req.body),
  )
  res.json(lesson)
}
